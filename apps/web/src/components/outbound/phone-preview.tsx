import { BadgeCheck, ChevronLeft, CornerUpLeft, ImageIcon, MoreVertical, Phone, PlayCircle, Video } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

function Frame({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("mx-auto w-full max-w-[290px] rounded-[2.2rem] border-[7px] border-fg/85 bg-fg/85 shadow-pop", className)}>
      <div className="overflow-hidden rounded-[1.7rem] bg-surface">
        <div className="flex items-center justify-between bg-fg/85 px-5 pt-1.5 pb-1 text-[10px] font-semibold text-bg">
          <span>10:30</span>
          <span className="h-3.5 w-16 rounded-full bg-fg" aria-hidden />
          <span>5G ▮▮▮</span>
        </div>
        {children}
      </div>
    </div>
  );
}

/** Renders *bold* WhatsApp formatting and highlights unresolved {{n}} variables. */
function waText(text: string) {
  return text.split(/(\*[^*]+\*|\{\{\d+\}\})/g).map((part, i) => {
    if (/^\*[^*]+\*$/.test(part)) return <b key={i}>{part.slice(1, -1)}</b>;
    if (/^\{\{\d+\}\}$/.test(part))
      return (
        <span key={i} className="rounded bg-warning-soft px-0.5 text-warning">
          {part}
        </span>
      );
    return <span key={i}>{part}</span>;
  });
}

export function WhatsAppPreview({ header, body, buttons, media }: { header?: string; body: string; buttons: string[]; media?: "image" | "video" | "none" }) {
  return (
    <Frame>
      {/* WhatsApp brand header colour is intentional (brand mark). */}
      <div className="flex items-center gap-2 bg-[#075e54] px-2 py-2 text-white">
        <ChevronLeft className="size-4" aria-hidden />
        <span className="inline-flex size-7 items-center justify-center rounded-full bg-white/90 text-[10px] font-bold text-[#075e54]">SD</span>
        <div className="min-w-0 flex-1 leading-tight">
          <div className="flex items-center gap-1 text-[13px] font-semibold">
            Smile Dental <BadgeCheck className="size-3.5 fill-[#25d366] text-[#075e54]" aria-label="Verified business" />
          </div>
          <div className="text-[10px] text-white/75">Business account</div>
        </div>
        <Video className="size-4" aria-hidden />
        <Phone className="size-4" aria-hidden />
        <MoreVertical className="size-4" aria-hidden />
      </div>
      <div className="min-h-[360px] bg-[color-mix(in_srgb,var(--accent-soft)_55%,var(--surface-2))] px-2.5 py-3">
        <div className="mx-auto mb-3 w-fit rounded-md bg-surface/80 px-2 py-0.5 text-[10px] text-muted">TODAY</div>
        <div className="animate-fade-in max-w-[92%] rounded-lg rounded-tl-none bg-surface p-1 shadow-card">
          {media && media !== "none" && (
            <div className="mb-1 flex h-28 items-center justify-center rounded-md bg-gradient-to-br from-accent-soft to-primary-soft text-muted">
              {media === "video" ? <PlayCircle className="size-8" /> : <ImageIcon className="size-8" />}
            </div>
          )}
          <div className="px-1.5 pt-0.5 pb-1">
            {header && <div className="mb-1 text-[13px] font-semibold text-fg">{header}</div>}
            <div className="text-[12.5px] leading-snug whitespace-pre-wrap text-fg">{waText(body)}</div>
            <div className="mt-1 flex items-center justify-between text-[10px] text-muted">
              <span>Reply STOP to opt out</span>
              <span>10:30</span>
            </div>
          </div>
          {buttons.length > 0 && (
            <div className="mt-1 divide-y divide-line border-t border-line">
              {buttons.map((b) => (
                <div key={b} className="flex items-center justify-center gap-1.5 py-1.5 text-[12.5px] font-medium text-info">
                  <CornerUpLeft className="size-3.5" aria-hidden /> {b}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Frame>
  );
}

export function SmsPreview({ sender, body }: { sender: string; body: string }) {
  return (
    <Frame>
      <div className="border-b border-line bg-surface-2 px-3 py-2 text-center">
        <div className="mx-auto mb-1 inline-flex size-8 items-center justify-center rounded-full bg-surface-3 text-xs font-semibold text-fg-2">{sender.slice(0, 2)}</div>
        <div className="text-xs font-semibold">{sender}</div>
        <div className="text-[10px] text-muted">Text message · Promotional</div>
      </div>
      <div className="min-h-[360px] bg-surface px-3 py-4">
        <div className="max-w-[88%] rounded-2xl rounded-bl-sm bg-surface-2 px-3 py-2 text-[12.5px] leading-snug whitespace-pre-wrap text-fg">{body}</div>
        <div className="mt-1 pl-1 text-[10px] text-muted">10:30 AM</div>
      </div>
    </Frame>
  );
}

export function EmailPreview({ subject, preheader, body }: { subject: string; preheader: string; body: string }) {
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-card">
      <div className="border-b border-line bg-surface-2 px-4 py-3">
        <div className="text-xs text-muted">From: Smile Dental &lt;hello@smiledental.in&gt;</div>
        <div className="mt-1 text-sm font-semibold">{subject || "(no subject)"}</div>
        <div className="truncate text-xs text-muted">{preheader}</div>
      </div>
      <div className="px-4 py-4 text-sm leading-relaxed whitespace-pre-wrap text-fg-2">{body}</div>
      <div className="border-t border-line px-4 py-3 text-[11px] text-muted">
        Smile Dental, Koregaon Park, Pune 411001 · <span className="text-primary underline">Unsubscribe</span>
      </div>
    </div>
  );
}
