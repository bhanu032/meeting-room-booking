"use client";

import { useEffect, useState } from "react";
import { Clock3, Loader2, Ban } from "lucide-react";
import { fetchNextSlot } from "@/lib/api";
import type { NextSlotResponse } from "@/types";

interface Props { roomId: number; date: string; duration?: number; }

export function NextSlotBadge({ roomId, date, duration = 30 }: Props) {
  const [result, setResult] = useState<NextSlotResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!date) return;
    setLoading(true);
    setResult(null);
    fetchNextSlot(roomId, date, duration)
      .then(setResult)
      .catch(() => setResult(null))
      .finally(() => setLoading(false));
  }, [roomId, date, duration]);

  if (loading) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
        <Loader2 className="w-3 h-3 animate-spin" /> Checking…
      </span>
    );
  }

  if (!result) return null;

  if (!result.available) {
    return (
      <span className="badge-occupied">
        <Ban className="w-3 h-3" /> Fully booked
      </span>
    );
  }

  return (
    <span className="badge-available">
      <Clock3 className="w-3 h-3" />
      Available from {result.start_time}
    </span>
  );
}
