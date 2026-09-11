"use client";

import { useState, useRef, useEffect } from "react";
import { Clock, ChevronDown, Check } from "lucide-react";

function generateSlots(): string[] {
  const slots: string[] = [];
  for (let t = 9 * 60; t <= 18 * 60; t += 30) {
    slots.push(`${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`);
  }
  return slots;
}
const ALL_SLOTS = generateSlots();

function toDisplay(t: string): string {
  const [h, m] = t.split(":").map(Number);
  const p = h < 12 ? "AM" : "PM";
  return `${h % 12 === 0 ? 12 : h % 12}:${String(m).padStart(2, "0")} ${p}`;
}

interface TimeSelectProps {
  id: string;
  value: string;
  onChange: (v: string) => void;
  min?: string;
  max?: string;
  error?: boolean;
  disabled?: boolean;
}

export function TimeSelect({ id, value, onChange, min = "08:30", max = "18:00", error = false, disabled = false }: TimeSelectProps) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  useEffect(() => {
    if (!open || !listRef.current) return;
    const el = listRef.current.querySelector('[aria-selected="true"]') as HTMLElement | null;
    el?.scrollIntoView({ block: "nearest" });
  }, [open]);

  const slots = ALL_SLOTS.filter((s) => s <= max);

  return (
    <div ref={wrapRef} className="relative" onKeyDown={(e) => e.key === "Escape" && setOpen(false)}>
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((p) => !p)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={[
          "field-input w-full flex items-center justify-between gap-2 text-left cursor-pointer",
          error ? "field-input-error" : "",
        ].join(" ")}
      >
        <span className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className={value ? "text-slate-800" : "text-slate-400"}>
            {value ? toDisplay(value) : "Select time"}
          </span>
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-150 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute z-[60] mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-modal overflow-hidden">
          <ul ref={listRef} role="listbox" className="overflow-y-auto" style={{ maxHeight: 216 }}>
            {slots.map((slot) => {
              const isDisabled = slot <= min;
              const isSelected = slot === value;
              return (
                <li
                  key={slot}
                  role="option"
                  aria-selected={isSelected}
                  aria-disabled={isDisabled}
                  onClick={() => { if (!isDisabled) { onChange(slot); setOpen(false); } }}
                  className={[
                    "flex items-center justify-between px-3.5 py-2.5 text-sm select-none transition-colors",
                    isSelected  ? "bg-blue-600 text-white font-medium cursor-default" :
                    isDisabled  ? "text-slate-300 cursor-not-allowed" :
                                  "text-slate-700 hover:bg-slate-50 cursor-pointer",
                  ].join(" ")}
                >
                  <span>{toDisplay(slot)}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
