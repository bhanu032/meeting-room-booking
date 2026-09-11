"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";
import type { ToastMessage, ToastType } from "@/types";

const VARIANTS: Record<ToastType, { icon: React.ReactNode; bar: string; label: string }> = {
  success: {
    icon: <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />,
    bar: "bg-emerald-500",
    label: "Success",
  },
  error: {
    icon: <XCircle className="w-4 h-4 text-red-500 shrink-0" />,
    bar: "bg-red-500",
    label: "Error",
  },
  conflict: {
    icon: <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />,
    bar: "bg-amber-400",
    label: "Scheduling Conflict",
  },
  info: {
    icon: <Info className="w-4 h-4 text-blue-500 shrink-0" />,
    bar: "bg-blue-500",
    label: "Info",
  },
};

function ToastItem({ toast, onRemove }: { toast: ToastMessage; onRemove: (id: string) => void }) {
  const v = VARIANTS[toast.type];
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 48, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 48, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 440, damping: 34 }}
      role="alert"
      className="relative flex items-start gap-3 w-[22rem] max-w-[calc(100vw-2rem)]
                 bg-white border border-slate-200 rounded-xl shadow-toast
                 overflow-hidden pl-4 pr-4 py-3.5"
    >
      {/* left accent bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${v.bar} rounded-l-xl`} />

      {/* icon */}
      <span className="mt-0.5">{v.icon}</span>

      {/* text */}
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
          {v.label}
        </p>
        <p className="text-sm text-slate-700 leading-snug">{toast.message}</p>
      </div>

      {/* dismiss */}
      <button
        onClick={() => onRemove(toast.id)}
        aria-label="Dismiss"
        className="mt-0.5 shrink-0 rounded p-0.5 text-slate-400
                   hover:text-slate-600 hover:bg-slate-100 transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}

export function ToastContainer({
  toasts,
  onRemove,
}: {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}) {
  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="fixed bottom-6 right-6 z-50 flex flex-col-reverse gap-2.5 items-end pointer-events-none"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem toast={t} onRemove={onRemove} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
