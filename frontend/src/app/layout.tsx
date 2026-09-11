import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RoomBook — Meeting Room Scheduling",
  description: "Book meeting rooms, manage schedules, and find available slots instantly.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full font-sans bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
