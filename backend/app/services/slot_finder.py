"""
Next-available-slot algorithm.

Strategy:
  1. Collect all bookings for the room on the given date, sorted by start_time.
  2. Walk the gaps in the schedule: before first booking, between bookings,
     and after the last booking (up to WORK_END).
  3. Return the start of the first gap that fits the requested duration.

All comparisons are done in minutes-since-midnight (integers) to avoid
datetime arithmetic edge cases with time objects.

Gap exactly equal to the required duration is accepted — a 30-minute gap
fits a 30-minute request.
"""

from datetime import date, time
from sqlalchemy.orm import Session
from app.models import Booking

WORK_START_MINUTES = 9 * 60   # 09:00 → 540
WORK_END_MINUTES = 18 * 60    # 18:00 → 1080


def _to_minutes(t: time) -> int:
    """Convert a time object to minutes elapsed since midnight."""
    return t.hour * 60 + t.minute


def _from_minutes(minutes: int) -> time:
    """Convert minutes-since-midnight back to a time object."""
    return time(minutes // 60, minutes % 60)


def find_next_available_slot(
    db: Session,
    room_id: int,
    booking_date: date,
    duration_minutes: int,
) -> time | None:
    """
    Return the earliest start time on booking_date that has at least
    duration_minutes of free space inside working hours.

    Returns None if no such slot exists (room fully booked for the day).
    """
    bookings = (
        db.query(Booking)
        .filter(Booking.room_id == room_id, Booking.date == booking_date)
        .order_by(Booking.start_time)
        .all()
    )

    # Build a flat sorted list of (start_min, end_min) intervals
    intervals = [
        (_to_minutes(b.start_time), _to_minutes(b.end_time))
        for b in bookings
    ]

    # The search cursor starts at the beginning of the working day
    cursor = WORK_START_MINUTES

    for start_min, end_min in intervals:
        # Gap between cursor and the next booking's start
        gap = start_min - cursor

        # A gap of exactly duration_minutes is valid (back-to-back logic)
        if gap >= duration_minutes:
            return _from_minutes(cursor)

        # Advance cursor past this booking so we check the next gap
        # Use max() in case bookings somehow overlap in existing data
        cursor = max(cursor, end_min)

    # Check the trailing gap between the last booking (or work start) and WORK_END
    trailing_gap = WORK_END_MINUTES - cursor
    if trailing_gap >= duration_minutes:
        return _from_minutes(cursor)

    # No slot found — room is effectively fully booked for the requested duration
    return None
