"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface TabItem<T extends string> {
  value: T;
  label: ReactNode;
  count?: number;
  icon?: ReactNode;
}

/** Underlined tabs for page sections. */
export function Tabs<T extends string>({
  items,
  value,
  onChange,
  className,
}: {
  items: TabItem<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}) {
  return (
    <div role="tablist" className={cn("flex gap-1 overflow-x-auto border-b border-line scroll-thin", className)}>
      {items.map((item) => {
        const active = item.value === value;
        return (
          <button
            key={item.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.value)}
            className={cn(
              "-mb-px inline-flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors [&_svg]:size-4",
              active ? "border-primary text-fg" : "border-transparent text-muted hover:text-fg",
            )}
          >
            {item.icon}
            {item.label}
            {item.count !== undefined && (
              <span
                className={cn(
                  "rounded-full px-1.5 text-[11px]",
                  active ? "bg-primary-soft text-primary" : "bg-surface-2 text-muted",
                )}
              >
                {item.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/** Pill segmented control for filters and view switches. */
export function Segmented<T extends string>({
  items,
  value,
  onChange,
  className,
  size = "sm",
}: {
  items: TabItem<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  size?: "xs" | "sm";
}) {
  return (
    <div className={cn("inline-flex rounded-lg bg-surface-2 p-0.5", className)}>
      {items.map((item) => {
        const active = item.value === value;
        return (
          <button
            key={item.value}
            onClick={() => onChange(item.value)}
            aria-pressed={active}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md font-medium whitespace-nowrap transition-colors [&_svg]:size-3.5",
              size === "sm" ? "px-3 py-1 text-sm" : "px-2 py-0.5 text-xs",
              active ? "bg-surface text-fg shadow-card" : "text-muted hover:text-fg",
            )}
          >
            {item.icon}
            {item.label}
            {item.count !== undefined && <span className="text-muted">{item.count}</span>}
          </button>
        );
      })}
    </div>
  );
}
