"use client";

/**
 * Horizontal availability timeline showing bookings as coloured blocks
 * on a 09:00–18:00 axis. Provides an at-a-glance visual of room occupancy.
 */

import type { Booking } from "@/types";

const WORK_START = 9 * 60;  // 09:00 in minutes
const WORK_END   = 18 * 60; // 18:00 in minutes
const WORK_SPAN  = WORK_END - WORK_START; // 540 min

/** "HH:MM:SS" or "HH:MM" → minutes since midnight */
function toMin(t: string): number {
  const [h, m] = t.slice(0, 5).split(":").map(Number);
  return h * 60 + m;
}

interface AvailabilityBarProps {
  bookings: Booking[];
  loading?: boolean;
}

const BOOKING_COLORS = [
  "bg-blue-400",
  "bg-violet-400",
  "bg-indigo-400",
  "bg-sky-500",
  "bg-teal-400",
  "bg-cyan-500",
];

export function AvailabilityBar({ bookings, loading = false }: AvailabilityBarProps) {
  if (loading) {
    return (
      <div className="h-2 w-full rounded-full bg-slate-100 animate-pulse" />
    );
  }

  return (
    <div
      className="relative h-2 w-full rounded-full bg-slate-100 overflow-hidden"
      role="img"
      aria-label="Room availability timeline"
      title="Availability 09:00 – 18:00"
    >
      {/* Booked segments */}
      {bookings.map((b, i) => {
        const start = Math.max(toMin(b.start_time), WORK_START);
        const end   = Math.min(toMin(b.end_time),   WORK_END);
        if (end <= start) return null;

        const left  = ((start - WORK_START) / WORK_SPAN) * 100;
        const width = ((end - start) / WORK_SPAN) * 100;
        const color = BOOKING_COLORS[b.id % BOOKING_COLORS.length];

        return (
          <div
            key={b.id}
            className={`absolute top-0 h-full ${color} opacity-80`}
            style={{ left: `${left}%`, width: `${width}%` }}
            title={`${b.title} · ${b.start_time.slice(0, 5)}–${b.end_time.slice(0, 5)}`}
          />
        );
      })}
    </div>
  );
}
