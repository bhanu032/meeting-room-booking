"""
Pydantic schemas for request validation and response serialization.
Validation logic (working hours, end > start) lives here so it
runs before any DB interaction.
"""

from datetime import date, time
from pydantic import BaseModel, field_validator, model_validator

WORK_START = time(9, 0)
WORK_END = time(18, 0)


# ─── Room ────────────────────────────────────────────────────────────────────

class RoomBase(BaseModel):
    name: str
    location: str
    capacity: int


class RoomOut(RoomBase):
    id: int

    model_config = {"from_attributes": True}


# ─── Booking ──────────────────────────────────────────────────────────────────

class BookingCreate(BaseModel):
    title: str
    date: date
    start_time: time
    end_time: time

    @model_validator(mode="after")
    def validate_time_window(self) -> "BookingCreate":
        # End must be strictly after start — identical times or reversed are rejected
        if self.end_time <= self.start_time:
            raise ValueError("end_time must be after start_time")

        # Both start and end must fall within working hours
        if self.start_time < WORK_START or self.end_time > WORK_END:
            raise ValueError(
                f"Bookings must be within working hours ({WORK_START.strftime('%H:%M')}–{WORK_END.strftime('%H:%M')})"
            )

        return self


class BookingOut(BaseModel):
    id: int
    room_id: int
    title: str
    date: date
    start_time: time
    end_time: time

    model_config = {"from_attributes": True}


class ConflictDetail(BaseModel):
    """Returned alongside a 409 so the client knows exactly which booking blocks the slot."""
    conflicting_booking: BookingOut
    message: str
