"use client";

import { CalendarDays, ChevronDown, Search, SlidersHorizontal } from "lucide-react";
import type { Room } from "@/types";

interface FilterBarProps {
  rooms: Room[];
  selectedRoomId: number | null;
  selectedDate: string;
  searchQuery: string;
  onRoomChange: (id: number | null) => void;
  onDateChange: (date: string) => void;
  onSearchChange: (q: string) => void;
}

export function FilterBar({
  rooms,
  selectedRoomId,
  selectedDate,
  searchQuery,
  onRoomChange,
  onDateChange,
  onSearchChange,
}: FilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">

      {/* ── Search ── */}
      <div className="flex-1 min-w-0">
        <label className="field-label" htmlFor="tb-search">Search rooms</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          <input
            id="tb-search"
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Room name or floor…"
            className="field-input pl-8.5"
            style={{ paddingLeft: "2.125rem" }}
          />
        </div>
      </div>

      {/* ── Room filter ── */}
      <div className="sm:w-52">
        <label className="field-label" htmlFor="tb-room">Room</label>
        <div className="relative">
          <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          <select
            id="tb-room"
            value={selectedRoomId ?? ""}
            onChange={(e) => onRoomChange(e.target.value === "" ? null : Number(e.target.value))}
            className="field-input appearance-none cursor-pointer pl-8.5 pr-8"
            style={{ paddingLeft: "2.125rem" }}
          >
            <option value="">All rooms</option>
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* ── Date ── */}
      <div className="sm:w-44">
        <label className="field-label" htmlFor="tb-date">Date</label>
        <div className="relative">
          <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          <input
            id="tb-date"
            type="date"
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="field-input pl-8.5"
            style={{ paddingLeft: "2.125rem" }}
          />
        </div>
      </div>
    </div>
  );
}
