"""
Booking routes — create, list (with filter), and cancel.
Conflict errors from the service layer are surfaced as 409 responses
with a structured body so the frontend can display the exact conflict.
"""

from datetime import date as date_type
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Room, Booking
from app.schemas import BookingCreate, BookingOut, ConflictDetail
from app.services import booking_service

router = APIRouter(prefix="/api/bookings", tags=["bookings"])


@router.get("", response_model=list[BookingOut])
def list_bookings(
    room_id: int | None = Query(None, description="Filter by room"),
    date: date_type | None = Query(None, description="Filter by date (YYYY-MM-DD)"),
    db: Session = Depends(get_db),
):
    """
    List bookings with optional room and/or date filters.
    No filter returns all bookings (useful for debugging / admin views).
    """
    query = db.query(Booking)
    if room_id is not None:
        query = query.filter(Booking.room_id == room_id)
    if date is not None:
        query = query.filter(Booking.date == date)
    return query.order_by(Booking.date, Booking.start_time).all()


@router.post("/{room_id}", response_model=BookingOut, status_code=201)
def create_booking(
    room_id: int,
    data: BookingCreate,
    db: Session = Depends(get_db),
):
    """
    Create a booking in a specific room.
    Returns 404 if the room doesn't exist.
    Returns 409 with conflict details if the slot overlaps an existing booking.
    Pydantic handles working-hours and end>start validation (400).
    """
    room = db.query(Room).filter(Room.id == room_id).first()
    if room is None:
        raise HTTPException(status_code=404, detail=f"Room {room_id} not found")

    try:
        booking = booking_service.create_booking(db, room_id, data)
    except ValueError as exc:
        # The service raises ValueError(message, conflicting_booking_orm_object)
        message, conflicting = exc.args
        raise HTTPException(
            status_code=409,
            detail={
                "message": message,
                "conflicting_booking": BookingOut.model_validate(conflicting).model_dump(mode="json"),
            },
        )

    return booking


@router.delete("/{booking_id}", status_code=200)
def cancel_booking(booking_id: int, db: Session = Depends(get_db)):
    """
    Cancel (delete) a booking by ID.
    Returns the cancelled booking so the frontend can confirm which one was removed.
    """
    booking = booking_service.cancel_booking(db, booking_id)
    if booking is None:
        raise HTTPException(status_code=404, detail=f"Booking {booking_id} not found")

    return {"message": f"Booking '{booking.title}' cancelled successfully", "id": booking_id}
