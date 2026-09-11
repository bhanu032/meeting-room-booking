# Meeting Room Booking — Backend

FastAPI + PostgreSQL backend for the Meeting Room Booking System.

## Local Development

```bash
# 1. Create and activate a virtual environment
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Set environment variables
cp .env.example .env
# Edit .env with your DATABASE_URL

# 4. Run the server
uvicorn app.main:app --reload --port 8000
```

API docs are available at http://localhost:8000/docs

## Key Design Decisions

### Conflict Detection
Two time intervals [A_start, A_end) and [B_start, B_end) overlap when:
- `A_start < B_end AND B_start < A_end`

This strict less-than on both sides means back-to-back bookings (e.g., 10:00–11:00 and 11:00–12:00) are **not** conflicts.

### Next Available Slot
A cursor-based scan in `services/slot_finder.py`:
1. Sort bookings by start time
2. Walk gaps between bookings, returning the first that fits the duration
3. A gap exactly equal to the required duration is accepted

All time math is done in minutes-since-midnight (integers) to avoid `datetime.time` arithmetic quirks.

## Deployment (Render)

1. Create a new **Web Service** pointing at this directory
2. Build command: `pip install -r requirements.txt`
3. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Add `DATABASE_URL` environment variable pointing to your Neon/Render PostgreSQL instance
