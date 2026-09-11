# Meeting Room Booking System

A full-stack meeting room booking application with conflict detection and next-available-slot logic.

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), Tailwind CSS, Framer Motion, Lucide Icons |
| Backend | Python FastAPI |
| Database | PostgreSQL |
| Frontend deploy | Vercel |
| Backend deploy | Render |
| Database (cloud) | Neon / Render PostgreSQL |

## Project Structure

```
meeting-room-booking/
├── backend/   # FastAPI app — see backend/README.md
└── frontend/  # Next.js app — see frontend/README.md
```

## Features

- View 5 pre-seeded meeting rooms with their bookings for any date
- Create a booking (room, title, date, start/end time)
- Cancel a booking
- Filter by room and date
- Conflict detection with exact conflict info in the 409 response
- Next available slot endpoint: `GET /api/rooms/{id}/next-available?date=&duration=`
- Working hours 09:00–18:00 enforced on both client and server
- Real-time toast notifications showing actual backend messages
- Framer Motion list, modal, and toast animations
- Responsive layout (1 → 2 → 3 column grid)

## Local Setup

```bash
# Backend
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # set DATABASE_URL
uvicorn app.main:app --reload

# Frontend (new terminal)
cd frontend
npm install
cp .env.example .env.local  # set NEXT_PUBLIC_API_URL=http://localhost:8000
npm run dev
```
