import { Sparkles } from "lucide-react";
import { cn } from "@/lib/cn";
import { initials } from "@/lib/format";

const palette = [
  "bg-[#e5f0fc] text-[#1c5cab]",
  "bg-[#fdebe3] text-[#b4461c]",
  "bg-[#ddf5ec] text-[#0f7a53]",
  "bg-[#fdf1d6] text-[#8a5c00]",
  "bg-[#fbe6ee] text-[#b13a68]",
  "bg-[#ebe8fc] text-[#4a3aa7]",
];

function hash(value: string) {
  let h = 0;
  for (let i = 0; i < value.length; i++) h = (h * 31 + value.charCodeAt(i)) >>> 0;
  return h;
}

const sizes = {
  xs: "size-6 text-[10px]",
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-14 text-lg",
};

export function Avatar({
  name,
  size = "sm",
  ai,
  online,
  className,
}: {
  name: string;
  size?: keyof typeof sizes;
  ai?: boolean;
  online?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("relative inline-flex shrink-0", className)}>
      <span
        className={cn(
          "inline-flex items-center justify-center rounded-full font-semibold",
          sizes[size],
          ai ? "bg-gradient-to-br from-primary to-ai text-white" : palette[hash(name) % palette.length],
        )}
        aria-label={name}
      >
        {ai ? <Sparkles className="size-[55%]" /> : initials(name)}
      </span>
      {online && (
        <span className="absolute right-0 bottom-0 size-2.5 rounded-full border-2 border-surface bg-success" />
      )}
    </span>
  );
}
