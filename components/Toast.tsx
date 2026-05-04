"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, X } from "lucide-react";

export interface ToastItem {
  id: string;
  type: "success" | "error";
  message: string;
}

interface ToastProps {
  toasts: ToastItem[];
  removeToast: (id: string) => void;
}

export function useToasts() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = ({
    type,
    message,
  }: {
    type: "success" | "error";
    message: string;
  }) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      4000,
    );
  };

  const removeToast = (id: string) =>
    setToasts((prev) => prev.filter((t) => t.id !== id));

  return { toasts, addToast, removeToast };
}

export function ToastContainer({ toasts, removeToast }: ToastProps) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onRemove={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}

function ToastItem({
  toast,
  onRemove,
}: {
  toast: ToastItem;
  onRemove: () => void;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 20);
    return () => clearTimeout(t);
  }, []);

  const isSuccess = toast.type === "success";

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl shadow-2xl border min-w-70 max-w-sm transition-all duration-300 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      } ${
        isSuccess
          ? "bg-slate-900 border-emerald-500/30 shadow-emerald-900/20"
          : "bg-slate-900 border-rose-500/30 shadow-rose-900/20"
      }`}
    >
      {isSuccess ? (
        <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
      ) : (
        <XCircle size={18} className="text-rose-400 shrink-0" />
      )}
      <span className="text-sm text-slate-200 font-medium flex-1 wrap-break-word">
        {toast.message}
      </span>
      <button
        onClick={onRemove}
        className="text-slate-600 hover:text-slate-400 transition-colors ml-1"
      >
        <X size={14} />
      </button>
    </div>
  );
}
