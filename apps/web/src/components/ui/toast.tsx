"use client";

import { CheckCircle2, Info, TriangleAlert, X } from "lucide-react";
import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

type ToastTone = "success" | "info" | "warning";
interface ToastItem {
  id: number;
  title: string;
  description?: string;
  tone: ToastTone;
}

const ToastContext = createContext<(t: Omit<ToastItem, "id" | "tone"> & { tone?: ToastTone }) => void>(() => {});

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const push = useCallback((t: Omit<ToastItem, "id" | "tone"> & { tone?: ToastTone }) => {
    const id = Date.now() + Math.random();
    setItems((prev) => [...prev, { id, tone: "success", ...t }]);
    setTimeout(() => setItems((prev) => prev.filter((i) => i.id !== id)), 4000);
  }, []);

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed right-4 bottom-4 z-[60] flex w-[min(360px,calc(100vw-2rem))] flex-col gap-2" aria-live="polite">
        {items.map((t) => {
          const Icon = { success: CheckCircle2, info: Info, warning: TriangleAlert }[t.tone];
          return (
            <div key={t.id} className="animate-fade-in pointer-events-auto flex items-start gap-3 rounded-xl border border-line bg-surface p-3.5 shadow-pop">
              <Icon className={cn("mt-0.5 size-4 shrink-0", { success: "text-success", info: "text-info", warning: "text-warning" }[t.tone])} />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium">{t.title}</div>
                {t.description && <div className="mt-0.5 text-xs text-muted">{t.description}</div>}
              </div>
              <button className="text-muted hover:text-fg" onClick={() => setItems((prev) => prev.filter((i) => i.id !== t.id))} aria-label="Dismiss">
                <X className="size-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
