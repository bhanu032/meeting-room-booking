"""
Core booking business logic — conflict detection lives here, not in the route.

Overlap condition (why this works):
  Two intervals [A_start, A_end) and [B_start, B_end) overlap when:
    A_start < B_end  AND  B_start < A_end

  Back-to-back slots like 10:00–11:00 and 11:00–12:00 satisfy:
    A_end == B_start  →  A_start < B_end is True, BUT B_start < A_end is False
  so they do NOT conflict. This is the critical strict-less-than on both sides.
"""

from datetime import date, time
from sqlalchemy.orm import Session
from app.models import Booking
from app.schemas import BookingCreate, BookingOut


def find_conflict(
    db: Session,
    room_id: int,
    booking_date: date,
    start_time: time,
    end_time: time,
    exclude_booking_id: int | None = None,
) -> Booking | None:
    """
    Return the first existing booking that overlaps the requested window,
    or None if the slot is free.

    Exclusion is used when checking updates (not currently exposed but
    keeps the service reusable).
    """
    query = db.query(Booking).filter(
        Booking.room_id == room_id,
        Booking.date == booking_date,
        # Strict overlap check: existing.start < new.end AND new.start < existing.end
        Booking.start_time < end_time,
        start_time < Booking.end_time,
    )

    if exclude_booking_id is not None:
        query = query.filter(Booking.id != exclude_booking_id)

    return query.first()


def create_booking(db: Session, room_id: int, data: BookingCreate) -> Booking:
    """
    Persist a new booking after conflict detection.
    Raises ValueError with a structured message if a conflict is found.
    """
    conflict = find_conflict(
        db, room_id, data.date, data.start_time, data.end_time
    )
    if conflict is not None:
        # Surface the conflicting booking ID so the caller can build a 409 response
        raise ValueError(
            f"Conflicts with booking #{conflict.id} "
            f"('{conflict.title}', "
            f"{conflict.start_time.strftime('%H:%M')}–{conflict.end_time.strftime('%H:%M')})",
            conflict,  # pass the ORM object as the second arg for the router to use
        )

    booking = Booking(
        room_id=room_id,
        title=data.title,
        date=data.date,
        start_time=data.start_time,
        end_time=data.end_time,
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return booking


def get_bookings_for_room_date(
    db: Session, room_id: int, booking_date: date
) -> list[Booking]:
    """Fetch all bookings for a room on a given date, ordered chronologically."""
    return (
        db.query(Booking)
        .filter(Booking.room_id == room_id, Booking.date == booking_date)
        .order_by(Booking.start_time)
        .all()
    )


def cancel_booking(db: Session, booking_id: int) -> Booking | None:
    """Delete a booking by ID. Returns the deleted booking or None if not found."""
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if booking is None:
        return None
    db.delete(booking)
    db.commit()
    return booking
