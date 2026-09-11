"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Trash2, CalendarOff } from "lucide-react";
import type { Booking } from "@/types";

const fmt = (t: string) => t.slice(0, 5);

function durLabel(start: string, end: string): string {
  const [sh, sm] = start.slice(0, 5).split(":").map(Number);
  const [eh, em] = end.slice(0, 5).split(":").map(Number);
  const mins = (eh * 60 + em) - (sh * 60 + sm);
  if (mins <= 0) return "";
  const h = Math.floor(mins / 60), m = mins % 60;
  return h === 0 ? `${m}m` : m === 0 ? `${h}h` : `${h}h ${m}m`;
}

// Consistent per-booking accent — cycles through 6 muted hues
const BAR_COLORS = [
  "bg-blue-400",   "bg-violet-400", "bg-teal-400",
  "bg-indigo-400", "bg-sky-500",    "bg-cyan-500",
];
const barFor = (id: number) => BAR_COLORS[id % BAR_COLORS.length];

interface Props {
  bookings: Booking[];
  loading: boolean;
  onCancel: (b: Booking) => void;
}

export function BookingList({ bookings, loading, onCancel }: Props) {
  /* Skeleton */
  if (loading) {
    return (
      <div className="space-y-2 pt-1">
        {[75, 55].map((w, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-1 h-9 rounded-sm bg-slate-200 shrink-0 animate-pulse" />
            <div className="flex-1 space-y-1.5">
              <div className={`h-2.5 rounded bg-slate-200 animate-pulse`} style={{ width: `${w}%` }} />
              <div className="h-2 rounded bg-slate-100 animate-pulse w-24" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  /* Empty state */
  if (bookings.length === 0) {
    return (
      <div className="flex items-center gap-3 py-4 select-none">
        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
          <CalendarOff className="w-4 h-4 text-slate-300" />
        </div>
        <div>
          <p className="text-xs font-medium text-slate-400">No bookings</p>
          <p className="text-xs text-slate-300">Room is fully available today</p>
        </div>
      </div>
    );
  }

  return (
    <ul className="space-y-1" role="list">
      <AnimatePresence initial={false}>
        {bookings.map((b) => (
          <motion.li
            key={b.id}
            layout
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0, overflow: "hidden" }}
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
            className="group flex items-center gap-3 py-2.5 px-3 rounded-lg
                       hover:bg-slate-50 transition-colors duration-150"
          >
            {/* accent bar */}
            <div className={`w-1 h-9 rounded-sm shrink-0 ${barFor(b.id)}`} />

            {/* details */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800 truncate leading-tight">
                {b.title}
              </p>
              <p className="text-xs text-slate-400 tabular mt-0.5">
                {fmt(b.start_time)} – {fmt(b.end_time)}
                <span className="mx-1 text-slate-300">·</span>
                {durLabel(b.start_time, b.end_time)}
              </p>
            </div>

            {/* cancel — visible only on hover */}
            <button
              onClick={() => onCancel(b)}
              aria-label={`Cancel "${b.title}"`}
              title="Cancel booking"
              className="btn-danger-ghost btn-sm opacity-0 group-hover:opacity-100 transition-opacity duration-150 rounded-md"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
}
