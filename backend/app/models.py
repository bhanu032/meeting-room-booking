"""
SQLAlchemy ORM models.
Indexes are placed on columns used in WHERE clauses (room_id, date)
to keep filtered queries fast as bookings grow.
"""

from datetime import date, time
from sqlalchemy import String, Date, Time, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class Room(Base):
    __tablename__ = "rooms"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    location: Mapped[str] = mapped_column(String(200), nullable=False)
    capacity: Mapped[int] = mapped_column(nullable=False)

    bookings: Mapped[list["Booking"]] = relationship(
        "Booking", back_populates="room", cascade="all, delete-orphan"
    )


class Booking(Base):
    __tablename__ = "bookings"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    room_id: Mapped[int] = mapped_column(ForeignKey("rooms.id"), nullable=False)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    date: Mapped[date] = mapped_column(Date, nullable=False)
    start_time: Mapped[time] = mapped_column(Time, nullable=False)
    end_time: Mapped[time] = mapped_column(Time, nullable=False)

    room: Mapped["Room"] = relationship("Room", back_populates="bookings")

    # Composite index: most queries filter by room_id + date together
    __table_args__ = (
        Index("ix_bookings_room_date", "room_id", "date"),
    )
