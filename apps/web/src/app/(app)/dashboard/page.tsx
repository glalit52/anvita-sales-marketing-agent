"use client";

import {
  ArrowRight,
  Bot,
  CalendarCheck,
  CheckCircle2,
  Clock,
  IndianRupee,
  MessageSquare,
  Sparkles,
  Star,
  TriangleAlert,
  UserPlus,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { AreaTrend, ChartLegend, FunnelBars, series } from "@/components/charts";
import { AiCallout, Avatar, Badge, Button, Card, CardBody, CardHeader, ChannelIcon, Page, PageHeader, Segmented, StatCard, useToast } from "@/components/ui";
import { cn } from "@/lib/cn";
import { formatCompact, formatCurrency } from "@/lib/format";
import { contactById, conversations, dailyTrend } from "@/lib/mock/core";

const activity = [
  { icon: CalendarCheck, tone: "text-success", text: <><b>AI booked</b> Ananya Rao: Whitening consult, Sat 10:00</>, time: "2m" },
  { icon: TriangleAlert, tone: "text-danger", text: <><b>Escalated</b> Rohit Mehta to Arjun: complaint</>, time: "6m" },
  { icon: IndianRupee, tone: "text-info", text: <><b>₹500 deposit</b> collected via UPI from Ananya Rao</>, time: "8m" },
  { icon: MessageSquare, tone: "text-ai", text: <><b>AI answered</b> 14 FAQs on webchat in the last hour</>, time: "12m" },
  { icon: Star, tone: "text-warning", text: <><b>5★ review</b> from Meera Nair on Google</>, time: "1h" },
  { icon: UserPlus, tone: "text-primary", text: <><b>42 new prospects</b> added from “Agri dealers, Maharashtra”</>, time: "3h" },
];

const tasks = [
  { id: 1, title: "Call Rohit Mehta: priority slot 4:30 PM", due: "Now", tone: "danger" as const },
  { id: 2, title: "Approve AI reply draft to Rahul Verma (AgriGrow)", due: "Today", tone: "warning" as const },
  { id: 3, title: "Review 2 low-confidence AI answers", due: "Today", tone: "warning" as const },
  { id: 4, title: "Approve Diwali WhatsApp campaign", due: "Tomorrow", tone: "neutral" as const },
];

export default function DashboardPage() {
  const [range, setRange] = useState<"7d" | "30d" | "90d">("30d");
  const [done, setDone] = useState<number[]>([]);
  const toast = useToast();
  const data = range === "7d" ? dailyTrend.slice(-7) : dailyTrend;
  const totals = data.reduce(
    (acc, d) => ({ leads: acc.leads + d.leads, booked: acc.booked + d.booked, revenue: acc.revenue + d.revenue }),
    { leads: 0, booked: 0, revenue: 0 },
  );
  const needsYou = conversations.filter((c) => c.escalated || (c.assignee !== "ai" && c.status === "open"));

  return (
    <Page>
      <PageHeader
        title="Good morning, Priya 👋"
        description="Your AI agent handled 87% of conversations overnight. 3 things need your attention."
        actions={
          <>
            <Segmented
              value={range}
              onChange={setRange}
              items={[
                { value: "7d", label: "7 days" },
                { value: "30d", label: "30 days" },
                { value: "90d", label: "90 days" },
              ]}
            />
            <Button variant="ai" onClick={() => toast({ title: "Growth report is being generated", description: "We'll notify you when it's ready (≈30s).", tone: "info" })}>
              <Sparkles /> AI growth report
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="New leads" value={formatCompact(totals.leads)} delta={18.2} hint="vs prev. period" icon={<UserPlus />} />
        <StatCard label="Appointments booked" value={totals.booked} delta={24.6} hint="62% by AI" icon={<CalendarCheck />} />
        <StatCard label="Revenue collected" value={formatCurrency(totals.revenue)} delta={12.4} hint="via pay links" icon={<IndianRupee />} />
        <StatCard label="Median first response" value="38s" delta={-71.3} goodWhen="down" hint="was 2h 12m" icon={<Clock />} />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader
            title="Leads & bookings"
            description="Daily inbound leads, how many the AI handled end-to-end, and bookings"
            action={
              <ChartLegend
                items={[
                  { key: "leads", label: "Leads" },
                  { key: "aiHandled", label: "AI-handled" },
                  { key: "booked", label: "Booked" },
                ]}
              />
            }
          />
          <CardBody>
            <AreaTrend
              data={data}
              xKey="date"
              series={[
                { key: "leads", label: "Leads" },
                { key: "aiHandled", label: "AI-handled" },
                { key: "booked", label: "Booked" },
              ]}
              height={260}
            />
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Funnel this period" description="Lead → paying customer" />
          <CardBody>
            <FunnelBars
              steps={[
                { label: "Conversations", value: 1840 },
                { label: "Qualified leads", value: 1124 },
                { label: "Appointments booked", value: 512 },
                { label: "Showed up", value: 448 },
                { label: "Paid", value: 391 },
              ]}
            />
            <AiCallout className="mt-5" title="No-shows dropped 41%">
              since AI reminders went live. Turning on the T-2h WhatsApp reminder for Baner could save ~6 more visits/week.
            </AiCallout>
          </CardBody>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <Card>
          <CardHeader
            title="Needs you"
            description="Escalations & drafts waiting for a human"
            action={
              <Link href="/inbox" className="text-xs font-medium text-primary hover:underline">
                Open inbox
              </Link>
            }
          />
          <ul className="divide-y divide-line">
            {needsYou.map((c) => {
              const contact = contactById(c.contactId)!;
              return (
                <li key={c.id}>
                  <Link href={`/inbox?c=${c.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-surface-2">
                    <Avatar name={contact.name} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium">{contact.name}</span>
                        <ChannelIcon channel={c.channel} size="xs" />
                      </div>
                      <div className="truncate text-xs text-muted">{c.preview}</div>
                    </div>
                    {c.escalated ? <Badge tone="danger">Escalated</Badge> : <Badge tone="warning">Draft</Badge>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </Card>

        <Card>
          <CardHeader title="Today's tasks" description={`${tasks.length - done.length} open`} />
          <ul className="space-y-1 px-3 pb-4">
            {tasks.map((t) => {
              const isDone = done.includes(t.id);
              return (
                <li key={t.id}>
                  <button
                    onClick={() => setDone((d) => (isDone ? d.filter((x) => x !== t.id) : [...d, t.id]))}
                    className="flex w-full items-start gap-3 rounded-lg px-2 py-2 text-left hover:bg-surface-2"
                  >
                    <CheckCircle2 className={cn("mt-0.5 size-4 shrink-0", isDone ? "text-success" : "text-line-strong")} />
                    <span className={cn("flex-1 text-sm", isDone && "text-muted line-through")}>{t.title}</span>
                    <Badge tone={t.tone}>{t.due}</Badge>
                  </button>
                </li>
              );
            })}
          </ul>
        </Card>

        <Card className="lg:col-span-2 xl:col-span-1">
          <CardHeader title="AI activity" description="What your AI agent did recently" action={<Bot className="size-4 text-ai" />} />
          <ul className="space-y-3 px-5 pb-5">
            {activity.map((a, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <a.icon className={cn("mt-0.5 size-4 shrink-0", a.tone)} />
                <span className="flex-1 text-fg-2 [&_b]:font-semibold [&_b]:text-fg">{a.text}</span>
                <span className="text-xs text-muted">{a.time}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Leads by channel" description="Where conversations started this period" />
          <CardBody>
            <div className="space-y-3">
              {[
                { channel: "whatsapp" as const, label: "WhatsApp", value: 712 },
                { channel: "webchat" as const, label: "Website chat", value: 438 },
                { channel: "instagram" as const, label: "Instagram", value: 254 },
                { channel: "voice" as const, label: "Calls (missed → text)", value: 198 },
                { channel: "google" as const, label: "Google Business", value: 142 },
                { channel: "email" as const, label: "Email", value: 96 },
              ].map((row) => (
                <div key={row.label} className="flex items-center gap-3">
                  <ChannelIcon channel={row.channel} />
                  <span className="w-40 shrink-0 truncate text-sm text-fg-2">{row.label}</span>
                  <div className="h-2 flex-1 rounded-full bg-surface-2">
                    <div className="h-full rounded-full" style={{ width: `${(row.value / 712) * 100}%`, background: series[0] }} />
                  </div>
                  <span className="w-12 text-right text-sm font-medium tabular">{row.value}</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
        <Card className="flex flex-col">
          <CardHeader title="Setup progress" description="4 of 6 steps complete" />
          <CardBody className="flex-1 space-y-2">
            {[
              { label: "Business profile imported", done: true },
              { label: "WhatsApp connected", done: true },
              { label: "Website chat installed", done: true },
              { label: "Calendar connected", done: true },
              { label: "Connect Google Business Profile", done: false, href: "/integrations" },
              { label: "Start your first prospect search", done: false, href: "/prospecting" },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-2.5 text-sm">
                <CheckCircle2 className={cn("size-4", s.done ? "text-success" : "text-line-strong")} />
                <span className={cn("flex-1", s.done && "text-muted")}>{s.label}</span>
                {s.href && (
                  <Link href={s.href} className="text-primary">
                    <ArrowRight className="size-4" />
                  </Link>
                )}
              </div>
            ))}
          </CardBody>
        </Card>
      </div>
    </Page>
  );
}
