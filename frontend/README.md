# Meeting Room Booking — Frontend

Next.js 14 (App Router) + Tailwind CSS + Framer Motion frontend.

## Local Development

```bash
# Install dependencies
npm install

# Set environment variables
cp .env.example .env.local
# Edit .env.local:
#   NEXT_PUBLIC_API_URL=http://localhost:8000

# Start dev server
npm run dev
```

Open http://localhost:3000

## Deployment (Vercel)

1. Import the repository in Vercel, set root directory to `frontend/`
2. Add environment variable:
   - `NEXT_PUBLIC_API_URL` → your Render backend URL (e.g. `https://meeting-rooms-api.onrender.com`)
3. Deploy

## Architecture

- `src/app/` — Next.js App Router pages and layout
- `src/components/` — Pure UI components (RoomCard, BookingModal, BookingList, etc.)
- `src/hooks/` — Custom React hooks (useToast, useBookings)
- `src/lib/api.ts` — All HTTP calls centralized here
- `src/types/` — Shared TypeScript interfaces
