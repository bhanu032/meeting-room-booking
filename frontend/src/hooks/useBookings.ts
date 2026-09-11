import { useState, useEffect, useCallback } from "react";
import { fetchBookings } from "@/lib/api";
import type { Booking } from "@/types";

interface UseBookingsOptions {
  roomId?: number;
  date?: string;
}

export function useBookings({ roomId, date }: UseBookingsOptions) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchBookings({
        room_id: roomId,
        date: date,
      });
      setBookings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  }, [roomId, date]);

  useEffect(() => {
    load();
  }, [load]);

  return { bookings, loading, error, refresh: load };
}
