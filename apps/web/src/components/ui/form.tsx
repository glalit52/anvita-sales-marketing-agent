"use client";

import { forwardRef, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const field =
  "w-full rounded-lg border border-line bg-surface px-3 text-sm text-fg placeholder:text-muted transition-colors hover:border-line-strong focus:border-primary focus:outline-none focus:ring-2 focus:ring-[var(--ring)] disabled:opacity-60";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { icon?: ReactNode }>(
  function Input({ className, icon, ...props }, ref) {
    if (!icon) return <input ref={ref} className={cn(field, "h-9", className)} {...props} />;
    return (
      <div className={cn("relative", className)}>
        <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted [&_svg]:size-4">
          {icon}
        </span>
        <input ref={ref} className={cn(field, "h-9 pl-9")} {...props} />
      </div>
    );
  },
);

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className, ...props }, ref) {
    return <textarea ref={ref} className={cn(field, "min-h-20 py-2", className)} {...props} />;
  },
);

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(field, "h-9 cursor-pointer pr-8", className)} {...props}>
      {children}
    </select>
  );
}

export function Label({ children, hint, className }: { children: ReactNode; hint?: ReactNode; className?: string }) {
  return (
    <label className={cn("mb-1.5 block text-xs font-medium text-fg-2", className)}>
      {children}
      {hint && <span className="ml-1 font-normal text-muted">{hint}</span>}
    </label>
  );
}

export function Field({ label, hint, children, className }: { label: ReactNode; hint?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <div className={className}>
      <Label hint={hint}>{label}</Label>
      {children}
    </div>
  );
}

export function Switch({
  checked,
  onChange,
  label,
  size = "md",
  disabled,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label?: string;
  size?: "sm" | "md";
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex shrink-0 items-center rounded-full transition-colors disabled:opacity-50",
        size === "md" ? "h-5 w-9" : "h-4 w-7",
        checked ? "bg-primary" : "bg-surface-3",
      )}
    >
      <span
        className={cn(
          "inline-block rounded-full bg-white shadow transition-transform",
          size === "md" ? "size-4" : "size-3",
          checked ? (size === "md" ? "translate-x-[18px]" : "translate-x-[14px]") : "translate-x-0.5",
        )}
      />
    </button>
  );
}

export function Checkbox({
  checked,
  onChange,
  label,
  indeterminate,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label?: string;
  indeterminate?: boolean;
}) {
  return (
    <input
      type="checkbox"
      aria-label={label}
      checked={checked}
      ref={(el) => {
        if (el) el.indeterminate = Boolean(indeterminate);
      }}
      onChange={(e) => onChange(e.target.checked)}
      className="size-4 cursor-pointer rounded border-line-strong accent-[var(--primary)]"
    />
  );
}
