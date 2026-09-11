/**
 * Thin API client layer.
 * All fetch calls live here so components never construct URLs directly.
 * Errors are normalized into plain Error objects with the backend's message.
 */

import axios, { AxiosError } from "axios";
import type { Room, Booking, BookingFormData, NextSlotResponse } from "@/types";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const http = axios.create({ baseURL: BASE_URL });

/** Extract a human-readable message from an Axios error response. */
function extractErrorMessage(err: unknown): string {
  if (err instanceof AxiosError && err.response?.data) {
    const data = err.response.data;
    // FastAPI validation errors come as { detail: [ { msg, loc } ] }
    if (Array.isArray(data.detail)) {
      return data.detail.map((d: { msg: string }) => d.msg).join(", ");
    }
    // Our structured conflict detail: { message, conflicting_booking }
    if (typeof data.detail === "object" && data.detail?.message) {
      return data.detail.message;
    }
    if (typeof data.detail === "string") return data.detail;
  }
  if (err instanceof Error) return err.message;
  return "An unexpected error occurred";
}

// ─── Rooms ───────────────────────────────────────────────────────────────────

export async function fetchRooms(): Promise<Room[]> {
  const { data } = await http.get<Room[]>("/api/rooms");
  return data;
}

// ─── Bookings ─────────────────────────────────────────────────────────────────

export async function fetchBookings(params: {
  room_id?: number;
  date?: string;
}): Promise<Booking[]> {
  const { data } = await http.get<Booking[]>("/api/bookings", { params });
  return data;
}

export async function createBooking(
  roomId: number,
  payload: BookingFormData
): Promise<Booking> {
  try {
    const { data } = await http.post<Booking>(`/api/bookings/${roomId}`, payload);
    return data;
  } catch (err) {
    const axiosErr = err as AxiosError<{ detail: unknown }>;
    // Re-throw with structured conflict info attached so the caller can
    // distinguish a 409 from a generic 400/500
    if (axiosErr.response?.status === 409) {
      const conflict = axiosErr.response.data.detail as {
        message: string;
        conflicting_booking: Booking;
      };
      const error = new Error(conflict.message) as Error & {
        isConflict: boolean;
        conflictingBooking: Booking;
      };
      error.isConflict = true;
      error.conflictingBooking = conflict.conflicting_booking;
      throw error;
    }
    throw new Error(extractErrorMessage(err));
  }
}

export async function cancelBooking(
  bookingId: number
): Promise<{ message: string; id: number }> {
  try {
    const { data } = await http.delete(`/api/bookings/${bookingId}`);
    return data;
  } catch (err) {
    throw new Error(extractErrorMessage(err));
  }
}

// ─── Next available slot ──────────────────────────────────────────────────────

export async function fetchNextSlot(
  roomId: number,
  date: string,
  duration: number
): Promise<NextSlotResponse> {
  const { data } = await http.get<NextSlotResponse>(
    `/api/rooms/${roomId}/next-available`,
    { params: { date, duration } }
  );
  return data;
}
