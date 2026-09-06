"use client";

import { useEffect } from "react";

export type NotificationType =
  | "success"
  | "error"
  | "warning"
  | "info";

type NotificationProps = {
  type: NotificationType;
  title: string;
  message?: string;
  onClose: () => void;
  autoClose?: number;
};

const styles: Record<
  NotificationType,
  {
    icon: string;
    container: string;
    iconContainer: string;
    title: string;
    message: string;
  }
> = {
  success: {
    icon: "✓",
    container: "border-emerald-200 bg-white",
    iconContainer: "bg-emerald-100 text-emerald-700",
    title: "text-emerald-900",
    message: "text-slate-600",
  },
  error: {
    icon: "!",
    container: "border-red-200 bg-white",
    iconContainer: "bg-red-100 text-red-700",
    title: "text-red-900",
    message: "text-slate-600",
  },
  warning: {
    icon: "!",
    container: "border-amber-200 bg-white",
    iconContainer: "bg-amber-100 text-amber-700",
    title: "text-amber-900",
    message: "text-slate-600",
  },
  info: {
    icon: "i",
    container: "border-blue-200 bg-white",
    iconContainer: "bg-blue-100 text-blue-700",
    title: "text-blue-900",
    message: "text-slate-600",
  },
};

export default function Notification({
  type,
  title,
  message,
  onClose,
  autoClose = 5000,
}: NotificationProps) {
  const style = styles[type];

  useEffect(() => {
    if (autoClose <= 0) {
      return;
    }

    const timer = window.setTimeout(() => {
      onClose();
    }, autoClose);

    return () => {
      window.clearTimeout(timer);
    };
  }, [autoClose, onClose]);

  return (
    <div
      className="fixed inset-x-4 top-4 z-[100] flex justify-center sm:inset-x-auto sm:right-6 sm:left-auto sm:w-full sm:max-w-md"
      role="alert"
      aria-live="polite"
    >
      <div
        className={`flex w-full items-start gap-3 rounded-2xl border p-4 shadow-xl ${style.container}`}
      >
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-extrabold ${style.iconContainer}`}
        >
          {style.icon}
        </div>

        <div className="min-w-0 flex-1">
          <div className={`text-sm font-bold ${style.title}`}>
            {title}
          </div>

          {message && (
            <div className={`mt-1 text-sm leading-5 ${style.message}`}>
              {message}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup notifikasi"
          className="shrink-0 rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        >
          ×
        </button>
      </div>
    </div>
  );
}
