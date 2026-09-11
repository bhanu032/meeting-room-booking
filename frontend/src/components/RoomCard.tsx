"use client";

import { motion } from "framer-motion";
import { Users, MapPin, CalendarDays, Plus } from "lucide-react";
import { NextSlotBadge } from "./NextSlotBadge";
import { AvailabilityBar } from "./AvailabilityBar";
import { BookingList } from "./BookingList";
import type { Room, Booking } from "@/types";

/* Each room gets a deterministic accent — top border + icon bg */
const ROOM_ACCENTS: Array<{ border: string; iconBg: string; iconText: string }> = [
  { border: "border-t-blue-500",   iconBg: "bg-blue-50",   iconText: "text-blue-600"   },
  { border: "border-t-violet-500", iconBg: "bg-violet-50", iconText: "text-violet-600" },
  { border: "border-t-teal-500",   iconBg: "bg-teal-50",   iconText: "text-teal-600"   },
  { border: "border-t-indigo-500", iconBg: "bg-indigo-50", iconText: "text-indigo-600" },
  { border: "border-t-sky-500",    iconBg: "bg-sky-50",    iconText: "text-sky-600"    },
];

function fmtDate(iso: string): string {
  if (!iso) return "";
  return new Date(iso + "T00:00:00").toLocaleDateString("en-GB", {
    weekday: "short", day: "numeric", month: "short",
  });
}

/* First letter(s) of room name for the icon */
function initials(name: string): string {
  return name.slice(0, 2).toUpperCase();
}

interface RoomCardProps {
  room: Room;
  bookings: Booking[];
  loading: boolean;
  selectedDate: string;
  onBook: (room: Room) => void;
  onCancel: (booking: Booking) => void;
  index: number;
}

export function RoomCard({ room, bookings, loading, selectedDate, onBook, onCancel, index }: RoomCardProps) {
  const accent = ROOM_ACCENTS[room.id % ROOM_ACCENTS.length];

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, type: "spring", stiffness: 360, damping: 28 }}
      className={`
        surface surface-hover flex flex-col overflow-hidden
        border-t-[3px] ${accent.border}
      `}
      aria-label={`${room.name} meeting room`}
    >
      {/* ══ CARD HEADER ══ */}
      <div className="px-5 pt-4 pb-3">
        <div className="flex items-start gap-3">
          {/* Room icon / avatar */}
          <div className={`w-10 h-10 rounded-xl ${accent.iconBg} border border-slate-100
                           flex items-center justify-center shrink-0`}>
            <span className={`text-xs font-bold tracking-tight ${accent.iconText}`}>
              {initials(room.name)}
            </span>
          </div>

          {/* Identity */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-slate-900 leading-tight truncate">
              {room.name}
            </h3>
            <p className="flex items-center gap-1 text-xs text-slate-500 mt-0.5 truncate">
              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
              {room.location}
            </p>
            <p className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
              <Users className="w-3 h-3 text-slate-300 shrink-0" />
              Up to {room.capacity} people
            </p>
          </div>

          {/* Book CTA */}
          <button
            onClick={() => onBook(room)}
            className="btn-primary btn-sm shrink-0 self-start"
            aria-label={`Book ${room.name}`}
          >
            <Plus className="w-3.5 h-3.5" />
            Book
          </button>
        </div>

        {/* Availability badge */}
        <div className="mt-3">
          <NextSlotBadge roomId={room.id} date={selectedDate} duration={30} />
        </div>

        {/* Timeline bar */}
        <div className="mt-3">
          <AvailabilityBar bookings={bookings} loading={loading} />
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-slate-400 tabular">9 AM</span>
            <span className="text-[10px] text-slate-400 tabular">6 PM</span>
          </div>
        </div>
      </div>

      {/* ══ BOOKINGS SECTION ══ */}
      <div className="divider mx-5" />

      <div className="px-5 pt-2.5 pb-4 flex-1">
        {/* Section header */}
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
            {selectedDate ? fmtDate(selectedDate) : "Schedule"}
          </div>
          {!loading && bookings.length > 0 && (
            <span className="text-[11px] text-slate-400 tabular">
              {bookings.length} meeting{bookings.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        <BookingList bookings={bookings} loading={loading} onCancel={onCancel} />
      </div>
    </motion.article>
  );
}
