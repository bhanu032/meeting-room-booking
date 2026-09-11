"""
Room routes — read-only since rooms are pre-seeded.
Also exposes the next-available-slot endpoint which belongs here
because it's scoped to a specific room.
"""

from datetime import date
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Room
from app.schemas import RoomOut
from app.services.slot_finder import find_next_available_slot

router = APIRouter(prefix="/api/rooms", tags=["rooms"])


@router.get("", response_model=list[RoomOut])
def list_rooms(db: Session = Depends(get_db)):
    """Return all available meeting rooms."""
    return db.query(Room).order_by(Room.id).all()


@router.get("/{room_id}", response_model=RoomOut)
def get_room(room_id: int, db: Session = Depends(get_db)):
    room = db.query(Room).filter(Room.id == room_id).first()
    if room is None:
        raise HTTPException(status_code=404, detail=f"Room {room_id} not found")
    return room


@router.get("/{room_id}/next-available")
def next_available_slot(
    room_id: int,
    date: date = Query(..., description="Date to check (YYYY-MM-DD)"),
    duration: int = Query(..., ge=1, description="Required duration in minutes"),
    db: Session = Depends(get_db),
):
    """
    Find the earliest available slot for a given room, date, and duration.
    Returns the start time of the slot, or a message if none exists.
    """
    room = db.query(Room).filter(Room.id == room_id).first()
    if room is None:
        raise HTTPException(status_code=404, detail=f"Room {room_id} not found")

    slot = find_next_available_slot(db, room_id, date, duration)

    if slot is None:
        return {
            "available": False,
            "message": f"No {duration}-minute slot available on {date}",
        }

    return {
        "available": True,
        "start_time": slot.strftime("%H:%M"),
        "duration_minutes": duration,
        "date": str(date),
    }
