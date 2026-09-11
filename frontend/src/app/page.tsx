"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2, CalendarDays, CheckCircle2, Clock,
  LayoutGrid, RefreshCw, Bell, CircleUser,
} from "lucide-react";
import { RoomCard } from "@/components/RoomCard";
import { BookingModal } from "@/components/BookingModal";
import { FilterBar } from "@/components/FilterBar";
import { ToastContainer } from "@/components/Toast";
import { useToast } from "@/hooks/useToast";
import { fetchRooms, fetchBookings, createBooking, cancelBooking } from "@/lib/api";
import type { Room, Booking, BookingFormData } from "@/types";

/* ─── helpers ─────────────────────────────────────── */
function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function fmtDateFull(iso: string): string {
  if (!iso) return "";
  return new Date(iso + "T00:00:00").toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

/** Current time as "HH:MM" */
function nowHHMM(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/** Is a booking "happening now"? */
function isOngoing(b: Booking): boolean {
  if (b.date !== todayISO()) return false;
  const now = nowHHMM();
  return b.start_time.slice(0, 5) <= now && now < b.end_time.slice(0, 5);
}

/* ─── skeleton ────────────────────────────────────── */
function CardSkeleton({ i }: { i: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: i * 0.04 }}
      className="surface rounded-xl overflow-hidden border-t-[3px] border-t-slate-200"
    >
      <div className="px-5 pt-4 pb-3 space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 animate-pulse shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-28 bg-slate-200 rounded animate-pulse" />
            <div className="h-2.5 w-20 bg-slate-100 rounded animate-pulse" />
          </div>
          <div className="w-16 h-8 rounded-lg bg-slate-100 animate-pulse" />
        </div>
        <div className="h-2 w-full rounded-full bg-slate-100 animate-pulse" />
        <div className="h-2 w-20 rounded bg-slate-100 animate-pulse" />
      </div>
      <div className="border-t border-slate-100 mx-5" />
      <div className="px-5 py-4 space-y-2">
        <div className="h-10 rounded-lg bg-slate-100 animate-pulse" />
        <div className="h-10 rounded-lg bg-slate-50 animate-pulse" />
      </div>
    </motion.div>
  );
}

/* ─── stat card ───────────────────────────────────── */
interface StatCardProps {
  label: string;
  value: number | string;
  sub?: string;
  icon: React.ReactNode;
  iconBg: string;
  loading?: boolean;
}
function StatCard({ label, value, sub, icon, iconBg, loading }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${iconBg}`}>{icon}</div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-500 truncate">{label}</p>
        {loading ? (
          <div className="h-5 w-12 bg-slate-100 rounded animate-pulse mt-1" />
        ) : (
          <p className="text-xl font-semibold text-slate-900 tabular leading-tight">{value}</p>
        )}
        {sub && !loading && (
          <p className="text-xs text-slate-400 mt-0.5 truncate">{sub}</p>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════ */
export default function HomePage() {
  const [rooms, setRooms]         = useState<Room[]>([]);
  const [bookings, setBookings]   = useState<Booking[]>([]);
  const [roomsLoading, setRL]     = useState(true);
  const [bookingsLoading, setBL]  = useState(false);
  const [selectedRoomId, setRoomId]     = useState<number | null>(null);
  const [selectedDate, setDate]         = useState(todayISO());
  const [searchQuery, setSearch]        = useState("");
  const [modalRoom, setModalRoom]       = useState<Room | null>(null);

  const { toasts, addToast, removeToast } = useToast();

  /* ── Load rooms ── */
  useEffect(() => {
    fetchRooms()
      .then(setRooms)
      .catch(() => addToast("Could not load rooms — check your connection.", "error"))
      .finally(() => setRL(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Load bookings ── */
  const loadBookings = useCallback(async () => {
    setBL(true);
    try {
      const data = await fetchBookings({
        room_id: selectedRoomId ?? undefined,
        date: selectedDate || undefined,
      });
      setBookings(data);
    } catch {
      addToast("Could not load bookings. Please try again.", "error");
    } finally {
      setBL(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRoomId, selectedDate]);

  useEffect(() => { loadBookings(); }, [loadBookings]);

  /* ── Create booking ── */
  async function handleBookingSubmit(data: BookingFormData) {
    if (!modalRoom) return;
    try {
      await createBooking(modalRoom.id, data);
      addToast(`"${data.title}" confirmed in ${modalRoom.name}`, "success");
      loadBookings();
    } catch (err) {
      const e = err as Error & { isConflict?: boolean };
      addToast(e.message || "Booking failed", e.isConflict ? "conflict" : "error");
      throw err;
    }
  }

  /* ── Cancel booking ── */
  async function handleCancel(b: Booking) {
    try {
      const res = await cancelBooking(b.id);
      addToast(res.message, "success");
      setBookings((prev) => prev.filter((x) => x.id !== b.id));
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Could not cancel booking", "error");
    }
  }

  /* ── Derived state ── */
  const visibleRooms = useMemo(() => {
    let list = selectedRoomId ? rooms.filter((r) => r.id === selectedRoomId) : rooms;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (r) => r.name.toLowerCase().includes(q) || r.location.toLowerCase().includes(q),
      );
    }
    return list;
  }, [rooms, selectedRoomId, searchQuery]);

  /* Stats — derived from current bookings list */
  const stats = useMemo(() => {
    const todayBookings = bookings.filter((b) => b.date === selectedDate);
    const occupiedRoomIds = new Set(todayBookings.map((b) => b.room_id));
    const availableCount = rooms.filter((r) => !occupiedRoomIds.has(r.id)).length;
    const ongoingCount   = todayBookings.filter(isOngoing).length;

    return {
      total:     rooms.length,
      available: availableCount,
      booked:    todayBookings.length,
      ongoing:   ongoingCount,
    };
  }, [rooms, bookings, selectedDate]);

  const isToday = selectedDate === todayISO();

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-page)]">

      {/* ══════════════════════════════════════════
          HEADER — enterprise nav bar
      ══════════════════════════════════════════ */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-6">

          {/* Brand */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center shadow-xs">
              <Building2 className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-bold text-slate-900 tracking-tight">
              Room<span className="text-blue-600 font-bold">Book</span>
            </span>
            <span className="hidden sm:block h-4 w-px bg-slate-200 mx-0.5" />
            <span className="hidden sm:block text-xs text-slate-400 font-medium">
              Workspace Scheduling
            </span>
          </div>

          {/* Centre nav — desktop only */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Primary">
            {[
              { label: "Rooms",     icon: <LayoutGrid className="w-3.5 h-3.5" />,  active: true  },
              { label: "Calendar",  icon: <CalendarDays className="w-3.5 h-3.5" />, active: false },
              { label: "My Bookings", icon: <Clock className="w-3.5 h-3.5" />,     active: false },
            ].map((item) => (
              <button
                key={item.label}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  item.active
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Refresh */}
            <button
              onClick={loadBookings}
              disabled={bookingsLoading}
              aria-label="Refresh"
              className="btn-ghost p-2 rounded-lg disabled:opacity-40"
              title="Refresh bookings"
            >
              <RefreshCw className={`w-4 h-4 ${bookingsLoading ? "animate-spin" : ""}`} />
            </button>

            {/* Notifications */}
            <button className="btn-ghost p-2 rounded-lg relative" aria-label="Notifications">
              <Bell className="w-4 h-4" />
              {stats.ongoing > 0 && (
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-blue-500" />
              )}
            </button>

            {/* User avatar */}
            <div className="flex items-center gap-2 pl-1.5 border-l border-slate-200 ml-0.5">
              <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center">
                <CircleUser className="w-4 h-4 text-slate-500" />
              </div>
              <span className="hidden md:block text-sm font-medium text-slate-700">You</span>
            </div>
          </div>
        </div>
      </header>

      {/* ══════════════════════════════════════════
          MAIN
      ══════════════════════════════════════════ */}
      <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-7">

        {/* ── Page header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Meeting Rooms</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {isToday ? "Today — " : ""}
              {fmtDateFull(selectedDate) || "Select a date to view availability"}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Quick "today" jump */}
            {!isToday && (
              <button
                onClick={() => setDate(todayISO())}
                className="btn-secondary btn-sm"
              >
                <CalendarDays className="w-3.5 h-3.5" />
                Jump to today
              </button>
            )}
          </div>
        </div>

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <StatCard
            label="Total Rooms"
            value={stats.total}
            sub="All floors"
            icon={<Building2 className="w-5 h-5 text-blue-600" />}
            iconBg="bg-blue-50"
            loading={roomsLoading}
          />
          <StatCard
            label="Available"
            value={stats.available}
            sub={`of ${stats.total} rooms`}
            icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
            iconBg="bg-emerald-50"
            loading={roomsLoading || bookingsLoading}
          />
          <StatCard
            label="Booked Today"
            value={stats.booked}
            sub="reservations"
            icon={<CalendarDays className="w-5 h-5 text-amber-600" />}
            iconBg="bg-amber-50"
            loading={bookingsLoading}
          />
          <StatCard
            label="In Progress"
            value={stats.ongoing}
            sub="meetings now"
            icon={<Clock className="w-5 h-5 text-violet-600" />}
            iconBg="bg-violet-50"
            loading={bookingsLoading}
          />
        </div>

        {/* ── Toolbar ── */}
        <div className="surface px-5 py-4 mb-6">
          <FilterBar
            rooms={rooms}
            selectedRoomId={selectedRoomId}
            selectedDate={selectedDate}
            searchQuery={searchQuery}
            onRoomChange={setRoomId}
            onDateChange={setDate}
            onSearchChange={setSearch}
          />
        </div>

        {/* ── Results meta ── */}
        {!roomsLoading && (
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs text-slate-500">
              {visibleRooms.length === rooms.length
                ? `Showing all ${rooms.length} rooms`
                : `${visibleRooms.length} of ${rooms.length} rooms`}
            </p>
            {bookingsLoading && (
              <span className="flex items-center gap-1.5 text-xs text-slate-400">
                <RefreshCw className="w-3 h-3 animate-spin" /> Updating…
              </span>
            )}
          </div>
        )}

        {/* ── Room grid ── */}
        {roomsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
            {[...Array(5)].map((_, i) => <CardSkeleton key={i} i={i} />)}
          </div>
        ) : visibleRooms.length === 0 ? (
          /* ── Empty state ── */
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="surface flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
              <Building2 className="w-7 h-7 text-slate-300" />
            </div>
            <p className="text-sm font-semibold text-slate-600">No rooms found</p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              Try adjusting your search, room filter, or date.
            </p>
            {(searchQuery || selectedRoomId) && (
              <button
                onClick={() => { setSearch(""); setRoomId(null); }}
                className="btn-secondary btn-sm mt-4"
              >
                Clear filters
              </button>
            )}
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
              {visibleRooms.map((room, i) => (
                <RoomCard
                  key={room.id}
                  room={room}
                  bookings={bookings.filter((b) => b.room_id === room.id)}
                  loading={bookingsLoading}
                  selectedDate={selectedDate}
                  onBook={setModalRoom}
                  onCancel={handleCancel}
                  index={i}
                />
              ))}
            </div>
          </AnimatePresence>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-200 mt-auto py-4">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <p className="text-xs text-slate-400">
            RoomBook · Workspace Scheduling Platform
          </p>
          <p className="text-xs text-slate-400">
            Working hours 09:00 – 18:00
          </p>
        </div>
      </footer>

      {/* ── Modal ── */}
      {modalRoom && (
        <BookingModal
          room={modalRoom}
          initialDate={selectedDate}
          onClose={() => setModalRoom(null)}
          onSubmit={handleBookingSubmit}
        />
      )}

      {/* ── Toasts ── */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
