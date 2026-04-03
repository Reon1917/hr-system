"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

type ToastTone = "success" | "error" | "info";

type ToastItem = {
  id: string;
  title: string;
  tone: ToastTone;
};

type ToastContextValue = {
  pushToast: (title: string, tone?: ToastTone) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timeoutsRef = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  const removeToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
    const timeout = timeoutsRef.current.get(id);
    if (timeout) {
      clearTimeout(timeout);
      timeoutsRef.current.delete(id);
    }
  }, []);

  const pushToast = useCallback(
    (title: string, tone: ToastTone = "info") => {
      const id = crypto.randomUUID();

      setToasts((current) => [...current, { id, title, tone }]);

      const timeout = setTimeout(() => {
        removeToast(id);
      }, 3200);

      timeoutsRef.current.set(id, timeout);
    },
    [removeToast],
  );

  const value = useMemo(() => ({ pushToast }), [pushToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-full max-w-sm flex-col gap-3 sm:right-6 sm:top-6">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={[
              "pointer-events-auto rounded-2xl border px-4 py-3 shadow-[0_18px_45px_-26px_rgba(15,23,42,0.45)] backdrop-blur",
              toast.tone === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                : toast.tone === "error"
                  ? "border-red-200 bg-red-50 text-red-900"
                  : "border-slate-200 bg-white text-slate-900",
            ].join(" ")}
            role="status"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm leading-6">{toast.title}</p>
              <button
                className="text-xs font-medium uppercase tracking-[0.18em] opacity-70 transition hover:opacity-100"
                onClick={() => removeToast(toast.id)}
                type="button"
              >
                Close
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used inside ToastProvider.");
  }

  return context;
}
