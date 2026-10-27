"use client";

import { Check, Copy, MessageCircle, Plus, Send, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { Avatar, Badge, Button, Card, CardBody, CardHeader, ChannelIcon, Field, Input, Segmented, Switch, Textarea, useToast, type Channel } from "@/components/ui";
import { HealthBadge, type Health } from "@/components/platform/shared";
import { cn } from "@/lib/cn";

const channels: { channel: Channel; name: string; detail: string; status: Health; meta: { label: string; value: string; tone?: "success" | "warning" | "neutral" }[] }[] = [
  {
    channel: "whatsapp",
    name: "WhatsApp Business · +91 20 6712 3400",
    detail: "Cloud API · display name “Smile Dental” (verified)",
    status: "healthy",
    meta: [
      { label: "Quality rating", value: "High", tone: "success" },
      { label: "Messaging tier", value: "10K / 24h" },
      { label: "Templates", value: "18 approved · 1 paused", tone: "warning" },
    ],
  },
  {
    channel: "sms",
    name: "SMS · Sender ID SMLDNT",
    detail: "Exotel · DLT registered (Jio TrueConnect)",
    status: "healthy",
    meta: [
      { label: "DLT entity", value: "1201163xxxx2213", tone: "success" },
      { label: "Templates", value: "9 approved" },
      { label: "Delivery (7d)", value: "97.2%" },
    ],
  },
  {
    channel: "email",
    name: "hello@smiledental.in",
    detail: "Gmail · shared inbox",
    status: "healthy",
    meta: [
      { label: "SPF / DKIM", value: "Pass", tone: "success" },
      { label: "DMARC", value: "p=none", tone: "warning" },
    ],
  },
  {
    channel: "email",
    name: "appointments@smiledental.in",
    detail: "Gmail · forwarding only",
    status: "warning",
    meta: [{ label: "Last message", value: "6 days ago", tone: "warning" }],
  },
  {
    channel: "webchat",
    name: "Website chat widget",
    detail: "smiledental.in · installed via WordPress plugin",
    status: "healthy",
    meta: [
      { label: "Seen on", value: "23 pages" },
      { label: "Chats (30d)", value: "438" },
    ],
  },
  {
    channel: "instagram",
    name: "Instagram · @smiledental.pune",
    detail: "Meta token expired 2 days ago",
    status: "error",
    meta: [{ label: "DMs waiting", value: "7", tone: "warning" }],
  },
];

const swatches = ["#5b3df5", "#0f9d58", "#1c5cab", "#e8590c", "#c2255c", "#12121a"];

export function ChannelsSettings() {
  const toast = useToast();
  const [color, setColor] = useState(swatches[0]);
  const [greeting, setGreeting] = useState("Hi 👋 Need a dental appointment? I can book you in under a minute.");
  const [position, setPosition] = useState<"right" | "left">("right");
  const [avatar, setAvatar] = useState<"ai" | "logo" | "photo">("ai");
  const [title, setTitle] = useState("Smile Dental");
  const [open, setOpen] = useState(true);
  const [whatsappBtn, setWhatsappBtn] = useState(true);
  const [copied, setCopied] = useState(false);

  const snippet = `<script src="https://cdn.anvita.ai/widget.js"
  data-workspace="smile-dental"
  data-color="${color}"
  data-position="${position}"
  async></script>`;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader
          title="Connected channels"
          description="Health and limits for every channel Anvi answers on"
          action={
            <Button size="sm" variant="outline" onClick={() => toast({ title: "Channel wizard", description: "Choose WhatsApp, SMS, email, webchat, Google Business, Instagram or Messenger.", tone: "info" })}>
              <Plus /> Add channel
            </Button>
          }
        />
        <ul className="divide-y divide-line border-t border-line">
          {channels.map((c) => (
            <li key={c.name} className="flex flex-col gap-3 px-5 py-3.5 lg:flex-row lg:items-center">
              <div className="flex min-w-0 flex-1 items-start gap-3">
                <ChannelIcon channel={c.channel} size="md" />
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{c.name}</div>
                  <div className="truncate text-xs text-muted">{c.detail}</div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-1 pl-11 lg:pl-0">
                {c.meta.map((m) => (
                  <div key={m.label} className="text-xs">
                    <div className="text-muted">{m.label}</div>
                    <div className={cn("font-medium", m.tone === "success" ? "text-success" : m.tone === "warning" ? "text-warning" : "text-fg")}>{m.value}</div>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 pl-11 lg:w-48 lg:justify-end lg:pl-0">
                <HealthBadge status={c.status} label={c.status === "healthy" ? "Healthy" : c.status === "warning" ? "Check" : "Disconnected"} />
                <Button
                  size="xs"
                  variant={c.status === "error" ? "danger" : "ghost"}
                  onClick={() => toast({ title: c.status === "error" ? "Reconnecting Instagram…" : `${c.name} settings`, tone: "info" })}
                >
                  {c.status === "error" ? "Reconnect" : "Manage"}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </Card>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
        <Card className="xl:col-span-2">
          <CardHeader title="Webchat widget" description="Customise how the chat bubble looks on your website" />
          <CardBody className="space-y-4">
            <Field label="Brand color">
              <div className="flex flex-wrap items-center gap-2">
                {swatches.map((s) => (
                  <button
                    key={s}
                    aria-label={`Color ${s}`}
                    aria-pressed={color === s}
                    onClick={() => setColor(s)}
                    className={cn("inline-flex size-8 items-center justify-center rounded-full border border-line-strong ring-offset-2 ring-offset-surface", color === s && "ring-2 ring-fg")}
                    style={{ background: s }}
                  >
                    {color === s && <Check className="size-4 text-white" />}
                  </button>
                ))}
                <label className="relative inline-flex size-8 cursor-pointer items-center justify-center rounded-full border border-dashed border-line-strong text-muted" title="Custom color">
                  <Plus className="size-3.5" />
                  <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="absolute inset-0 cursor-pointer opacity-0" aria-label="Custom color" />
                </label>
                <span className="font-mono text-xs text-muted">{color}</span>
              </div>
            </Field>
            <Field label="Header title">
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </Field>
            <Field label="Greeting">
              <Textarea rows={3} value={greeting} onChange={(e) => setGreeting(e.target.value)} />
            </Field>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Position">
                <Segmented
                  value={position}
                  onChange={setPosition}
                  items={[
                    { value: "left", label: "Bottom left" },
                    { value: "right", label: "Bottom right" },
                  ]}
                />
              </Field>
              <Field label="Avatar">
                <Segmented
                  value={avatar}
                  onChange={setAvatar}
                  items={[
                    { value: "ai", label: "AI" },
                    { value: "logo", label: "Logo" },
                    { value: "photo", label: "Team" },
                  ]}
                />
              </Field>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-line px-3 py-2 text-sm">
              <span>Show “Continue on WhatsApp” button</span>
              <Switch checked={whatsappBtn} onChange={setWhatsappBtn} label="WhatsApp button" />
            </div>
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-xs font-medium text-fg-2">Embed snippet</span>
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard?.writeText(snippet).catch(() => {});
                    setCopied(true);
                    toast({ title: "Snippet copied", description: "Paste it before </body> on every page." });
                    setTimeout(() => setCopied(false), 1500);
                  }}
                >
                  {copied ? <Check /> : <Copy />} {copied ? "Copied" : "Copy"}
                </Button>
              </div>
              <pre className="scroll-thin overflow-x-auto rounded-lg bg-surface-2 p-3 font-mono text-[11px] leading-relaxed text-fg-2">{snippet}</pre>
            </div>
          </CardBody>
        </Card>

        <Card className="overflow-hidden xl:col-span-3">
          <CardHeader
            title="Live preview"
            description="Exactly what visitors to smiledental.in will see"
            action={
              <Button size="xs" variant="ghost" onClick={() => setOpen((o) => !o)}>
                {open ? "Collapse chat" : "Open chat"}
              </Button>
            }
          />
          <CardBody>
            <div className="overflow-hidden rounded-xl border border-line bg-bg">
              <div className="flex items-center gap-2 border-b border-line bg-surface-2 px-3 py-2">
                <span className="flex gap-1">
                  <span className="size-2.5 rounded-full bg-line-strong" />
                  <span className="size-2.5 rounded-full bg-line-strong" />
                  <span className="size-2.5 rounded-full bg-line-strong" />
                </span>
                <span className="mx-auto w-full max-w-xs truncate rounded-md bg-surface px-3 py-0.5 text-center text-[11px] text-muted">smiledental.in</span>
              </div>
              <div className="relative h-[460px] overflow-hidden bg-surface">
                {/* mock site */}
                <div className="flex items-center justify-between px-6 py-4">
                  <span className="font-semibold">🦷 {title}</span>
                  <span className="hidden gap-4 text-xs text-muted sm:flex">
                    <span>Treatments</span>
                    <span>Doctors</span>
                    <span>Pricing</span>
                    <span>Contact</span>
                  </span>
                </div>
                <div className="px-6 pt-6">
                  <div className="max-w-xs text-xl leading-tight font-semibold sm:text-2xl">Gentle dental care in Pune</div>
                  <div className="mt-2 h-2 w-56 rounded bg-surface-3" />
                  <div className="mt-1.5 h-2 w-44 rounded bg-surface-3" />
                  <span className="mt-4 inline-block rounded-lg px-4 py-2 text-xs font-medium text-white" style={{ background: color }}>
                    Book a visit
                  </span>
                  <div className="mt-8 grid max-w-sm grid-cols-3 gap-3">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="h-16 rounded-lg bg-surface-2" />
                    ))}
                  </div>
                </div>

                {/* widget */}
                <div className={cn("absolute bottom-4 flex flex-col gap-3", position === "right" ? "right-4 items-end" : "left-4 items-start")}>
                  {open && (
                    <div className="animate-fade-in w-[min(300px,calc(100vw-5rem))] overflow-hidden rounded-2xl border border-line bg-surface shadow-pop">
                      <div className="flex items-center gap-2.5 px-3.5 py-3 text-white" style={{ background: color }}>
                        {avatar === "ai" ? (
                          <span className="inline-flex size-8 items-center justify-center rounded-full bg-white/20">
                            <Sparkles className="size-4" />
                          </span>
                        ) : avatar === "logo" ? (
                          <span className="inline-flex size-8 items-center justify-center rounded-full bg-white text-sm font-bold" style={{ color }}>
                            S
                          </span>
                        ) : (
                          <span className="flex -space-x-2">
                            <Avatar name="Priya Sharma" size="xs" className="rounded-full ring-2 ring-white/40" />
                            <Avatar name="Arjun Patil" size="xs" className="rounded-full ring-2 ring-white/40" />
                          </span>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-semibold">{title}</div>
                          <div className="text-[11px] opacity-80">Typically replies in under a minute</div>
                        </div>
                        <button aria-label="Close preview chat" onClick={() => setOpen(false)} className="opacity-80 hover:opacity-100">
                          <X className="size-4" />
                        </button>
                      </div>
                      <div className="space-y-2 bg-surface-2/60 px-3 py-3">
                        <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-surface px-3 py-2 text-xs shadow-card">{greeting}</div>
                        <div className="flex flex-wrap gap-1.5">
                          {["Book appointment", "Prices", "Timings"].map((q) => (
                            <span key={q} className="rounded-full border bg-surface px-2.5 py-1 text-[11px] font-medium" style={{ borderColor: color, color }}>
                              {q}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 border-t border-line px-3 py-2">
                        <span className="flex-1 text-xs text-muted">Type your message…</span>
                        <Send className="size-4" style={{ color }} />
                      </div>
                      {whatsappBtn && (
                        <div className="border-t border-line px-3 py-2 text-center text-[11px] font-medium text-fg-2">
                          <MessageCircle className="mr-1 inline size-3.5 text-success" /> Continue on WhatsApp
                        </div>
                      )}
                      <div className="pb-1.5 text-center text-[9px] text-muted">Powered by Anvita</div>
                    </div>
                  )}
                  <button
                    onClick={() => setOpen((o) => !o)}
                    aria-label={open ? "Close chat" : "Open chat"}
                    className="inline-flex size-12 items-center justify-center rounded-full text-white shadow-pop transition-transform hover:scale-105"
                    style={{ background: color }}
                  >
                    {open ? <X className="size-5" /> : <MessageCircle className="size-5" />}
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted">
              <Badge tone="success">
                <Check /> Installed
              </Badge>
              Detected on 23 pages · last ping 2 min ago
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
