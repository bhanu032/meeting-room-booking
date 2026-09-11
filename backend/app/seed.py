"""
Pre-seeds 5 meeting rooms on first run.
Called from main.py startup so the table is always populated.
Idempotent — skips seeding if rooms already exist.
"""

from sqlalchemy.orm import Session
from app.models import Room

ROOMS = [
    {"name": "Atlas", "location": "Floor 1 — East Wing", "capacity": 6},
    {"name": "Horizon", "location": "Floor 1 — West Wing", "capacity": 10},
    {"name": "Zenith", "location": "Floor 2 — North", "capacity": 4},
    {"name": "Meridian", "location": "Floor 2 — South", "capacity": 12},
    {"name": "Apex", "location": "Floor 3 — Boardroom", "capacity": 20},
]


def seed_rooms(db: Session) -> None:
    if db.query(Room).count() > 0:
        return  # Already seeded — nothing to do

    for room_data in ROOMS:
        db.add(Room(**room_data))

    db.commit()
