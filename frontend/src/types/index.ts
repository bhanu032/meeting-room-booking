export interface Room {
  id: number;
  name: string;
  location: string;
  capacity: number;
}

export interface Booking {
  id: number;
  room_id: number;
  title: string;
  date: string;       // "YYYY-MM-DD"
  start_time: string; // "HH:MM:SS"
  end_time: string;   // "HH:MM:SS"
}

export interface ConflictDetail {
  message: string;
  conflicting_booking: Booking;
}

export interface NextSlotResponse {
  available: boolean;
  start_time?: string;
  duration_minutes?: number;
  date?: string;
  message?: string;
}

export interface BookingFormData {
  title: string;
  date: string;
  start_time: string;
  end_time: string;
}

export type ToastType = "success" | "error" | "conflict" | "info";

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}
