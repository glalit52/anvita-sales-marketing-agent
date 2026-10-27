"use client";

import {
  AtSign,
  Bell,
  BellOff,
  Bot,
  CalendarCheck,
  Check,
  CheckCheck,
  CreditCard,
  IndianRupee,
  ListTodo,
  Megaphone,
  Plug,
  Radar,
  Settings2,
  Sparkles,
  Star,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { AiCallout, Avatar, Badge, Button, Card, CardBody, CardHeader, EmptyState, Page, PageHeader, Switch, Tabs, useToast } from "@/components/ui";
import { cn } from "@/lib/cn";
import {
  NOW_STAMP,
  dayLabel,
  dayOf,
  notifications as seed,
  relativeLabel,
  timeLabel,
  minOf,
  type AppNotification,
  type NotificationIcon,
  type NotificationTab,
} from "@/lib/mock/app";
import { sellContactById } from "@/lib/mock/sell";

type Tab = "all" | NotificationTab;

const iconMeta: Record<NotificationIcon, { icon: LucideIcon; className: string; label: string }> = {
  escalation: { icon: TriangleAlert, className: "bg-danger-soft text-danger", label: "Escalation" },
  mention: { icon: AtSign, className: "bg-primary-soft text-primary", label: "Mention" },
  booking: { icon: CalendarCheck, className: "bg-success-soft text-success", label: "Booking" },
  payment: { icon: IndianRupee, className: "bg-info-soft text-info", label: "Payment" },
  review: { icon: Star, className: "bg-accent-soft text-warning", label: "Review" },
  ai: { icon: Sparkles, className: "bg-ai-soft text-ai", label: "AI" },
  system: { icon: Bell, className: "bg-surface-3 text-fg-2", label: "System" },
  campaign: { icon: Megaphone, className: "bg-surface-3 text-fg-2", label: "Campaign" },
  integration: { icon: Plug, className: "bg-warning-soft text-warning", label: "Integration" },
  billing: { icon: CreditCard, className: "bg-surface-3 text-fg-2", label: "Billing" },
  task: { icon: ListTodo, className: "bg-primary-soft text-primary", label: "Tasks" },
  prospect: { icon: Radar, className: "bg-ai-soft text-ai", label: "Prospecting" },
};

const tabLabels: Record<Tab, string> = { all: "All", mentions: "Mentions", escalations: "Escalations", ai: "AI activity", system: "System" };

export default function NotificationsPage() {
  const toast = useToast();
  const [items, setItems] = useState<AppNotification[]>(seed);
  const [tab, setTab] = useState<Tab>("all");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [approved, setApproved] = useState<string[]>([]);
  const [muted, setMuted] = useState(false);

  const inTab = (n: AppNotification, t: Tab) => t === "all" || n.tab === t;
  const visible = items.filter((n) => inTab(n, tab) && (!unreadOnly || n.unread)).sort((a, b) => b.at - a.at);
  const groups = useMemo(() => {
    const out: { key: string; label: string; items: AppNotification[] }[] = [];
    for (const n of visible) {
      const d = dayOf(n.at);
      const label = d >= dayOf(NOW_STAMP) - 1 ? dayLabel(d) : "Earlier this week";
      const last = out[out.length - 1];
      if (last && last.label === label) last.items.push(n);
      else out.push({ key: label, label, items: [n] });
    }
    return out;
  }, [visible]);

  const unreadCount = (t: Tab) => items.filter((n) => inTab(n, t) && n.unread).length;
  const setRead = (id: string, unread = false) => setItems((list) => list.map((n) => (n.id === id ? { ...n, unread } : n)));
  const markAll = () => {
    const n = unreadCount(tab);
    setItems((list) => list.map((x) => (inTab(x, tab) ? { ...x, unread: false } : x)));
    toast({ title: n ? `${n} notification${n === 1 ? "" : "s"} marked as read` : "You're all caught up", tone: "info" });
  };

  const escalationsOpen = items.filter((n) => n.tab === "escalations" && n.unread).length;
  const approvalsWaiting = items.filter((n) => n.actions.some((a) => a.kind === "approve") && !approved.includes(n.id)).length;

  return (
    <Page>
      <PageHeader
        title="Notifications"
        description="Mentions, escalations and everything your AI agent did. Approve straight from here."
        actions={
          <>
            <Button variant="outline" onClick={markAll}>
              <CheckCheck /> Mark all read
            </Button>
            <Link href="/settings?tab=notifications" className="inline-flex h-9 items-center gap-2 rounded-lg border border-line bg-surface px-4 text-sm font-medium hover:bg-surface-2">
              <Settings2 className="size-4" /> Preferences
            </Link>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="min-w-0 self-start">
          <div className="flex flex-col gap-2 border-b border-line sm:flex-row sm:items-end sm:justify-between">
            <Tabs
              className="border-b-0 px-3 pt-1"
              value={tab}
              onChange={setTab}
              items={(Object.keys(tabLabels) as Tab[]).map((t) => ({ value: t, label: tabLabels[t], count: unreadCount(t) || undefined }))}
            />
            <label className="flex items-center gap-2 px-4 pb-2.5 text-xs text-muted sm:pb-3">
              <Switch checked={unreadOnly} onChange={setUnreadOnly} size="sm" label="Unread only" />
              Unread only
            </label>
          </div>

          {groups.length === 0 ? (
            <EmptyState
              icon={<CheckCheck />}
              title="You're all caught up"
              description={unreadOnly ? "No unread notifications here. Turn off “Unread only” to see everything." : "Nothing in this tab yet."}
            />
          ) : (
            groups.map((g) => (
              <section key={g.key}>
                <h3 className="sticky top-0 z-[1] border-b border-line bg-surface-2/80 px-5 py-1.5 text-xs font-semibold text-muted backdrop-blur">{g.label}</h3>
                <ul className="divide-y divide-line">
                  {g.items.map((n) => {
                    const meta = iconMeta[n.icon];
                    const contact = n.contactId ? sellContactById(n.contactId) : undefined;
                    const isApproved = approved.includes(n.id);
                    return (
                      <li key={n.id} className={cn("group relative flex gap-3 px-4 py-4 sm:px-5", n.unread && "bg-primary-soft/25")}>
                        {n.unread && <span className="absolute top-0 bottom-0 left-0 w-0.5 bg-primary" aria-hidden />}
                        <div className="relative h-fit shrink-0">
                          {n.actor ? (
                            <Avatar name={n.actor} size="md" />
                          ) : (
                            <span className={cn("flex size-10 items-center justify-center rounded-full", meta.className)}>
                              <meta.icon className="size-[18px]" />
                            </span>
                          )}
                          {n.actor && (
                            <span className={cn("absolute -right-1 -bottom-1 flex size-5 items-center justify-center rounded-full ring-2 ring-surface", meta.className)}>
                              <meta.icon className="size-3" />
                            </span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            <span className={cn("text-sm", n.unread ? "font-semibold text-fg" : "font-medium text-fg-2")}>{n.title}</span>
                            {n.priority && <Badge tone="danger">Urgent</Badge>}
                            {n.tab === "ai" && (
                              <Badge tone="ai">
                                <Bot /> AI
                              </Badge>
                            )}
                            {n.unread && <span className="sr-only">Unread</span>}
                          </div>
                          <p className="mt-0.5 text-sm text-fg-2">{n.body}</p>
                          <div className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-muted">
                            <span>{dayOf(n.at) === dayOf(NOW_STAMP) ? relativeLabel(n.at) : timeLabel(minOf(n.at))}</span>
                            <span>· {meta.label}</span>
                            {contact && (
                              <Link href={`/contacts/${contact.id}`} className="hover:text-fg hover:underline">
                                · {contact.name}
                              </Link>
                            )}
                          </div>
                          <div className="mt-2.5 flex flex-wrap items-center gap-2">
                            {n.actions.map((a) => {
                              if (a.kind === "approve")
                                return isApproved ? (
                                  <Badge key={a.label} tone="success" className="h-7 px-2.5">
                                    <Check /> {a.done}
                                  </Badge>
                                ) : (
                                  <Button
                                    key={a.label}
                                    size="xs"
                                    onClick={() => {
                                      setApproved((x) => [...x, n.id]);
                                      setRead(n.id);
                                      toast({ title: a.done, description: n.title });
                                    }}
                                  >
                                    <Check /> {a.label}
                                  </Button>
                                );
                              return (
                                <Link
                                  key={a.label}
                                  href={a.href}
                                  onClick={() => setRead(n.id)}
                                  className="inline-flex h-7 items-center gap-1 rounded-md border border-line bg-surface px-2 text-xs font-medium text-fg hover:bg-surface-2"
                                >
                                  {a.kind === "payment" && <IndianRupee className="size-3.5" />}
                                  {a.label}
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                        <button
                          onClick={() => setRead(n.id, !n.unread)}
                          aria-label={n.unread ? `Mark “${n.title}” as read` : `Mark “${n.title}” as unread`}
                          title={n.unread ? "Mark as read" : "Mark as unread"}
                          className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted hover:bg-surface-2 hover:text-fg"
                        >
                          {n.unread ? <span className="size-2.5 rounded-full bg-primary" /> : <span className="size-2.5 rounded-full border border-line-strong" />}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))
          )}
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader title="Needs you" description="Summary across all tabs" />
            <CardBody className="space-y-2.5">
              {[
                { label: "Unread", value: unreadCount("all"), icon: Bell, tab: "all" as Tab },
                { label: "Open escalations", value: escalationsOpen, icon: TriangleAlert, tab: "escalations" as Tab },
                { label: "Approvals waiting", value: approvalsWaiting, icon: Check, tab: "all" as Tab },
                { label: "Unread mentions", value: unreadCount("mentions"), icon: AtSign, tab: "mentions" as Tab },
              ].map((r) => (
                <button key={r.label} onClick={() => setTab(r.tab)} className="flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-surface-2">
                  <r.icon className="size-4 text-muted" />
                  <span className="flex-1 text-fg-2">{r.label}</span>
                  <span className="font-semibold tabular">{r.value}</span>
                </button>
              ))}
            </CardBody>
          </Card>

          <AiCallout
            title="Too noisy?"
            action={
              <Button size="xs" variant="outline" onClick={() => toast({ title: "Digest enabled", description: "Routine AI activity now arrives as one summary at 6:00 PM.", tone: "info" })}>
                Send AI activity as a daily digest
              </Button>
            }
          >
            You opened only 3 of 27 “AI booked” alerts this week. Bundle routine AI activity into a 6 PM digest and keep escalations instant.
          </AiCallout>

          <Card>
            <CardHeader title="Delivery" description="Where you get alerted" />
            <CardBody className="space-y-3">
              {[
                { label: "Push (mobile app)", detail: "Escalations, mentions" },
                { label: "WhatsApp to +91 98xxx 41200", detail: "Escalations only" },
                { label: "Email digest", detail: "Daily, 6:00 PM" },
              ].map((d) => (
                <div key={d.label} className="flex items-start gap-3 text-sm">
                  <Check className="mt-0.5 size-4 shrink-0 text-success" />
                  <div className="min-w-0">
                    <div className="text-fg">{d.label}</div>
                    <div className="text-xs text-muted">{d.detail}</div>
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between gap-3 rounded-lg border border-line px-3 py-2.5">
                <div className="flex items-center gap-2 text-sm">
                  <BellOff className="size-4 text-muted" />
                  <span>
                    Pause for 1 hour
                    <span className="block text-xs text-muted">{muted ? "Paused until 12:20 PM" : "Escalations still come through"}</span>
                  </span>
                </div>
                <Switch
                  checked={muted}
                  onChange={(v) => {
                    setMuted(v);
                    toast({ title: v ? "Notifications paused until 12:20 PM" : "Notifications resumed", tone: "info" });
                  }}
                  label="Pause notifications"
                  size="sm"
                />
              </div>
              <Link href="/settings?tab=notifications" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
                <Settings2 className="size-4" /> Notification preferences
              </Link>
            </CardBody>
          </Card>
        </div>
      </div>
    </Page>
  );
}
