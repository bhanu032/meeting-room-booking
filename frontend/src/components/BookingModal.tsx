"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Loader2, AlertCircle, Building2,
  Users, MapPin, CalendarDays, Clock, Info,
} from "lucide-react";
import { TimeSelect } from "./TimeSelect";
import type { Room, BookingFormData } from "@/types";

interface FieldErrors {
  title?: string;
  date?: string;
  start_time?: string;
  end_time?: string;
}

interface BookingModalProps {
  room: Room;
  initialDate: string;
  onClose: () => void;
  onSubmit: (data: BookingFormData) => Promise<void>;
}

function fmtDateLong(iso: string): string {
  if (!iso) return "";
  return new Date(iso + "T00:00:00").toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
}

function durLabel(start: string, end: string): string | null {
  if (!start || !end || end <= start) return null;
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const mins = (eh * 60 + em) - (sh * 60 + sm);
  if (mins <= 0) return null;
  const h = Math.floor(mins / 60), m = mins % 60;
  return h === 0 ? `${m} min` : m === 0 ? `${h} hr` : `${h} hr ${m} min`;
}

function toDisplay(t: string): string {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  const p = h < 12 ? "AM" : "PM";
  return `${h % 12 === 0 ? 12 : h % 12}:${String(m).padStart(2, "0")} ${p}`;
}

/* ── Room accent ── */
const ROOM_ACCENTS = [
  { bg: "bg-blue-50",   text: "text-blue-600",   border: "border-blue-200"   },
  { bg: "bg-violet-50", text: "text-violet-600",  border: "border-violet-200" },
  { bg: "bg-teal-50",   text: "text-teal-600",    border: "border-teal-200"   },
  { bg: "bg-indigo-50", text: "text-indigo-600",  border: "border-indigo-200" },
  { bg: "bg-sky-50",    text: "text-sky-600",     border: "border-sky-200"    },
];

export function BookingModal({ room, initialDate, onClose, onSubmit }: BookingModalProps) {
  const [form, setForm] = useState<BookingFormData>({
    title: "",
    date: initialDate,
    start_time: "09:00",
    end_time: "10:00",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const accent = ROOM_ACCENTS[room.id % ROOM_ACCENTS.length];
  const dur = durLabel(form.start_time, form.end_time);

  function validate(): FieldErrors {
    const e: FieldErrors = {};
    if (!form.title.trim()) e.title = "Meeting title is required";
    if (!form.date)          e.date  = "Date is required";
    if (!form.start_time)    e.start_time = "Start time is required";
    if (!form.end_time)      e.end_time   = "End time is required";
    if (form.start_time && form.end_time && form.end_time <= form.start_time)
      e.end_time = "End must be after start time";
    if (form.start_time && form.start_time < "09:00")
      e.start_time = "Working hours begin at 09:00";
    if (form.end_time && form.end_time > "18:00")
      e.end_time = "Working hours end at 18:00";
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setSubmitting(true);
    try {
      await onSubmit(form);
      onClose();
    } catch {
      /* Parent handles the toast */
    } finally {
      setSubmitting(false);
    }
  }

  function set(field: keyof BookingFormData, value: string) {
    setForm((p) => ({ ...p, [field]: value }));
    setErrors((p) => ({ ...p, [field]: undefined }));
  }

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-[3px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.16 }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="bm-title"
          className="pointer-events-auto bg-white w-full max-w-[440px] rounded-2xl shadow-modal overflow-hidden"
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1,    y: 0  }}
          exit={{    opacity: 0, scale: 0.96, y: 16 }}
          transition={{ type: "spring", stiffness: 440, damping: 34 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* ── MODAL HEADER ── */}
          <div className="px-6 pt-5 pb-4 border-b border-slate-100">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  New Booking
                </p>
                <h2 id="bm-title" className="text-base font-semibold text-slate-900">
                  Reserve {room.name}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="btn-ghost p-1.5 rounded-lg shrink-0"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Room info row */}
            <div className={`mt-3 flex items-center gap-3 px-3 py-2.5 rounded-xl
                             ${accent.bg} border ${accent.border}`}>
              <div className={`w-8 h-8 rounded-lg bg-white border ${accent.border}
                               flex items-center justify-center shrink-0`}>
                <Building2 className={`w-4 h-4 ${accent.text}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${accent.text} truncate`}>{room.name}</p>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="flex items-center gap-1 text-xs text-slate-500">
                    <MapPin className="w-3 h-3 text-slate-400" />{room.location}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-slate-500">
                    <Users className="w-3 h-3 text-slate-400" />{room.capacity} seats
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ── FORM ── */}
          <form onSubmit={handleSubmit} noValidate>
            <div className="px-6 py-5 space-y-5">

              {/* ── Meeting details section ── */}
              <div>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  Meeting Details
                </p>
                <div>
                  <label className="field-label" htmlFor="bm-title-input">
                    Meeting title <span className="text-red-400 normal-case font-normal">*</span>
                  </label>
                  <input
                    id="bm-title-input"
                    type="text"
                    value={form.title}
                    onChange={(e) => set("title", e.target.value)}
                    placeholder="e.g. Q3 Planning, Design Review, Team Sync…"
                    autoComplete="off"
                    autoFocus
                    className={`field-input ${errors.title ? "field-input-error" : ""}`}
                  />
                  {errors.title ? (
                    <p className="field-error"><AlertCircle className="w-3 h-3" />{errors.title}</p>
                  ) : (
                    <p className="field-hint">Short description of the meeting purpose</p>
                  )}
                </div>
              </div>

              {/* ── Date section ── */}
              <div>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  Date
                </p>
                <div>
                  <label className="field-label" htmlFor="bm-date">
                    Date <span className="text-red-400 normal-case font-normal">*</span>
                  </label>
                  <div className="relative">
                    <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                    <input
                      id="bm-date"
                      type="date"
                      value={form.date}
                      onChange={(e) => set("date", e.target.value)}
                      className={`field-input pl-8.5 ${errors.date ? "field-input-error" : ""}`}
                      style={{ paddingLeft: "2.125rem" }}
                    />
                  </div>
                  {errors.date ? (
                    <p className="field-error"><AlertCircle className="w-3 h-3" />{errors.date}</p>
                  ) : form.date ? (
                    <p className="field-hint">{fmtDateLong(form.date)}</p>
                  ) : null}
                </div>
              </div>

              {/* ── Time section ── */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Time
                  </p>
                  {dur && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
                                     bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-700">
                      <Clock className="w-3 h-3" />
                      {dur}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="field-label" htmlFor="bm-start">Start time</label>
                    <TimeSelect
                      id="bm-start"
                      value={form.start_time}
                      onChange={(v) => set("start_time", v)}
                      min="08:30"
                      max="17:30"
                      error={!!errors.start_time}
                    />
                    {errors.start_time && (
                      <p className="field-error"><AlertCircle className="w-3 h-3" />{errors.start_time}</p>
                    )}
                  </div>
                  <div>
                    <label className="field-label" htmlFor="bm-end">End time</label>
                    <TimeSelect
                      id="bm-end"
                      value={form.end_time}
                      onChange={(v) => set("end_time", v)}
                      min={form.start_time}
                      max="18:00"
                      error={!!errors.end_time}
                    />
                    {errors.end_time && (
                      <p className="field-error"><AlertCircle className="w-3 h-3" />{errors.end_time}</p>
                    )}
                  </div>
                </div>

                {/* Booking summary strip */}
                {form.date && form.start_time && form.end_time && !errors.end_time && (
                  <div className="mt-3 flex items-center gap-2 px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <p className="text-xs text-slate-600">
                      <span className="font-medium">{room.name}</span>
                      {" · "}{fmtDateLong(form.date)}
                      {" · "}{toDisplay(form.start_time)} – {toDisplay(form.end_time)}
                      {dur && <> ({dur})</>}
                    </p>
                  </div>
                )}

                <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Working hours: 9:00 AM – 6:00 PM
                </p>
              </div>
            </div>

            {/* ── FOOTER ── */}
            <div className="px-6 pb-5 flex gap-2.5 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary flex-1"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary flex-1"
                disabled={submitting}
              >
                {submitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Confirming…</>
                ) : (
                  "Confirm Booking"
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
