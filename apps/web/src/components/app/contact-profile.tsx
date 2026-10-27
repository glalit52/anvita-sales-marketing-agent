"use client";

import {
  ArrowLeft,
  ArrowUpRight,
  Briefcase,
  CalendarClock,
  CalendarPlus,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  CircleSlash,
  Clock,
  IndianRupee,
  MessageCircle,
  MessagesSquare,
  Phone,
  Plus,
  Send,
  Sparkles,
  Tag,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  AiCallout,
  Avatar,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  ChannelIcon,
  EmptyState,
  Input,
  MetaRow,
  Page,
  Segmented,
  Select,
  Switch,
  Tabs,
  Textarea,
  useToast,
} from "@/components/ui";
import { channelMeta } from "@/components/ui/channel";
import { BulkSequenceModal } from "@/components/sell/contact-modals";
import { dealStageTone } from "@/components/sell/deal-drawer";
import { PayLinkModal } from "@/components/sell/pay-link-modal";
import { MethodLabel, OwnerChip, PaymentStatusBadge, ScoreBar, ownerName } from "@/components/sell/shared";
import { cn } from "@/lib/cn";
import { formatCurrency } from "@/lib/format";
import {
  NOW_STAMP,
  TODAY,
  activityFor,
  apptStamp,
  appointmentsFor,
  conversationsFor,
  contactIds,
  dayLabel,
  dayOf,
  dueLabel,
  minOf,
  profileContactById,
  relativeLabel,
  stampLabel,
  tasks as allTasks,
  timeLabel,
  type ActivityEvent,
  type ActivityKind,
} from "@/lib/mock/app";
import { stageMeta, team, type Contact, type Stage } from "@/lib/mock/core";
import {
  aiSummaryFor,
  consentFor,
  contactNotes,
  deals as allDeals,
  formatHour,
  formatIsoDate,
  locationLabel,
  payments as allPayments,
  pipelines,
  providers,
  services,
  stageProbability,
  type ConsentRecord,
  type ContactNote,
} from "@/lib/mock/sell";
import { BookModal, type BookedSlot } from "./book-modal";
import { ActivityDot, AiTag, FilterChip, SectionTitle, TaskTypeIcon, activityMeta } from "./shared";

type Tab = "timeline" | "conversations" | "deals" | "payments" | "notes";

const consentMeta: Record<ConsentRecord["status"], { label: string; tone: "success" | "danger" | "neutral"; icon: typeof CheckCircle2 }> = {
  opted_in: { label: "Opted in", tone: "success", icon: CheckCircle2 },
  opted_out: { label: "Opted out", tone: "danger", icon: CircleSlash },
  unknown: { label: "No consent", tone: "neutral", icon: CircleHelp },
};

const filterKinds: ActivityKind[] = ["message", "ai", "booking", "payment", "review", "sequence", "note", "task"];

export function ContactProfile({ id }: { id: string }) {
  const initial = profileContactById(id)!;
  return <Profile key={id} initial={initial} />;
}

function Profile({ initial }: { initial: Contact }) {
  const toast = useToast();
  const router = useRouter();
  const [contact, setContact] = useState(initial);
  const first = contact.name.split(" ")[0];
  const [tab, setTab] = useState<Tab>("timeline");
  const [filter, setFilter] = useState<ActivityKind | "all">("all");
  const [logged, setLogged] = useState<ActivityEvent[]>([]);
  const [consent, setConsent] = useState(() => consentFor(initial));
  const [notes, setNotes] = useState<ContactNote[]>(() => contactNotes[initial.id] ?? []);
  const [noteDraft, setNoteDraft] = useState("");
  const [logMode, setLogMode] = useState<"note" | "call">("note");
  const [logDraft, setLogDraft] = useState("");
  const [tagDraft, setTagDraft] = useState("");
  const [addingTag, setAddingTag] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [bookOpen, setBookOpen] = useState(false);
  const [seqOpen, setSeqOpen] = useState(false);
  const [booked, setBooked] = useState<BookedSlot[]>([]);
  const [doneTasks, setDoneTasks] = useState<string[]>([]);
  const [summaryRefreshing, setSummaryRefreshing] = useState(false);

  const idx = contactIds.indexOf(contact.id);
  const prevId = contactIds[(idx - 1 + contactIds.length) % contactIds.length];
  const nextId = contactIds[(idx + 1) % contactIds.length];

  const baseActivity = useMemo(() => activityFor(initial), [initial]);
  const activity = useMemo(() => [...logged, ...baseActivity].sort((a, b) => b.at - a.at), [logged, baseActivity]);
  const visible = filter === "all" ? activity : activity.filter((e) => e.kind === filter);
  const grouped = useMemo(() => {
    const out: { day: number; items: ActivityEvent[] }[] = [];
    for (const e of visible) {
      const d = dayOf(e.at);
      const last = out[out.length - 1];
      if (last && last.day === d) last.items.push(e);
      else out.push({ day: d, items: [e] });
    }
    return out;
  }, [visible]);

  const convs = conversationsFor(contact.id);
  const contactDeals = allDeals.filter((d) => d.contactId === contact.id);
  const contactPayments = allPayments.filter((p) => p.contactId === contact.id);
  const openTasks = allTasks.filter((t) => t.contactId === contact.id && !t.done && !doneTasks.includes(t.id));
  const upcoming = [
    ...appointmentsFor(contact.id)
      .filter((a) => apptStamp(a) > NOW_STAMP && a.status !== "cancelled")
      .map((a) => ({ id: a.id, at: apptStamp(a), serviceId: a.serviceId, providerId: a.providerId, location: a.location, status: a.status, deposit: a.deposit })),
    ...booked.map((b) => ({
      id: b.id,
      at: (b.day * 1440) + Math.round(b.start * 60),
      serviceId: b.serviceId,
      providerId: b.providerId,
      location: b.location,
      status: "confirmed" as const,
      deposit: { amount: services.find((s) => s.id === b.serviceId)!.deposit, status: "pending" as const },
    })),
  ].sort((a, b) => a.at - b.at);
  const pastVisits = appointmentsFor(contact.id).filter((a) => apptStamp(a) <= NOW_STAMP && a.status === "completed").length;
  const paidLinks = contactPayments.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount, 0);
  // Customers paid for treatment before pay links existed: fall back to their lifetime value.
  const paid = Math.max(paidLinks, contact.stage === "customer" ? contact.value : 0);
  const outstanding = contactPayments.filter((p) => p.status === "pending" || p.status === "overdue").reduce((s, p) => s + p.amount, 0);
  const openDealValue = contactDeals.filter((d) => d.stage !== "won" && d.stage !== "lost").reduce((s, d) => s + d.value, 0);
  const waConsent = consent.find((c) => c.channel === "whatsapp")?.status;
  const waConv = convs.find((c) => c.channel === "whatsapp") ?? convs[0];

  const log = (e: Omit<ActivityEvent, "id" | "at">) =>
    setLogged((l) => [{ ...e, id: `log-${Date.now()}-${l.length}`, at: NOW_STAMP + l.length + 1 }, ...l]);

  const update = (patch: Partial<Contact>) => setContact((c) => ({ ...c, ...patch }));

  const toggleConsent = (channel: ConsentRecord["channel"], on: boolean) => {
    setConsent((prev) =>
      prev.map((c) =>
        c.channel === channel
          ? { ...c, status: on ? "opted_in" : "opted_out", source: on ? "Recorded manually by Priya Sharma" : "Opt-out recorded manually by Priya Sharma", date: "27 Oct 2026, 11:20 AM" }
          : c,
      ),
    );
    toast({ title: `${channelMeta[channel].label} marketing ${on ? "opt-in" : "opt-out"} recorded`, description: "Saved to the consent log with timestamp (DPDP audit trail).", tone: "info" });
  };

  const addTag = () => {
    const t = tagDraft.trim().toLowerCase();
    if (t && !contact.tags.includes(t)) update({ tags: [...contact.tags, t] });
    setTagDraft("");
    setAddingTag(false);
  };

  const startWhatsApp = () => {
    if (waConsent === "opted_out") {
      toast({ title: `${first} opted out of WhatsApp`, description: "Only service replies inside the 24h window are allowed.", tone: "warning" });
      return;
    }
    if (waConv) router.push(`/inbox?c=${waConv.id}`);
    else {
      toast({ title: `WhatsApp conversation started with ${first}`, description: "Template “follow_up_hi_en” sent. Replies land in the inbox.", tone: "info" });
      log({ kind: "message", title: "WhatsApp template “follow_up_hi_en” sent", channel: "whatsapp", actor: "Priya Sharma", meta: "Outbound · WhatsApp" });
    }
  };

  const call = () => {
    toast({ title: `Calling ${contact.phone}…`, description: "Recorded and summarised by AI when you hang up.", tone: "info" });
    setTimeout(() => {
      log({ kind: "message", title: "Outbound call · 3m 12s", detail: `AI summary: ${first} confirmed interest and asked for a WhatsApp reminder the day before.`, channel: "voice", actor: "Priya Sharma", meta: "Recorded" });
    }, 1400);
  };

  const quickActions = [
    { label: "WhatsApp", icon: MessageCircle, onClick: startWhatsApp },
    { label: "Call", icon: Phone, onClick: call },
    { label: "Book", icon: CalendarPlus, onClick: () => setBookOpen(true) },
    { label: "Pay link", icon: IndianRupee, onClick: () => setPayOpen(true) },
    { label: "Add to sequence", icon: Send, onClick: () => setSeqOpen(true) },
  ];

  const addNote = (body: string) => {
    setNotes((n) => [{ id: `n${Date.now()}`, author: "Priya Sharma", body, time: "Just now" }, ...n]);
    log({ kind: "note", title: "Priya Sharma added a note", detail: body, actor: "Priya Sharma" });
  };

  return (
    <Page>
      {/* Breadcrumb */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <Link href="/contacts" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg">
          <ArrowLeft className="size-4" /> Contacts
        </Link>
        <div className="flex items-center gap-1">
          <span className="mr-1 hidden text-xs text-muted sm:inline tabular">
            {idx + 1} of {contactIds.length}
          </span>
          <Link href={`/contacts/${prevId}`} aria-label="Previous contact" className="rounded-lg border border-line p-1.5 text-fg-2 hover:bg-surface-2">
            <ChevronLeft className="size-4" />
          </Link>
          <Link href={`/contacts/${nextId}`} aria-label="Next contact" className="rounded-lg border border-line p-1.5 text-fg-2 hover:bg-surface-2">
            <ChevronRight className="size-4" />
          </Link>
        </div>
      </div>

      {/* Header */}
      <Card className="mb-4">
        <div className="flex flex-col gap-4 p-4 sm:p-5 xl:flex-row xl:items-center">
          <div className="flex min-w-0 flex-1 items-start gap-4">
            <Avatar name={contact.name} size="lg" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate text-xl font-semibold tracking-tight sm:text-2xl">{contact.name}</h1>
                <Badge tone={stageMeta[contact.stage].tone} dot>
                  {stageMeta[contact.stage].label}
                </Badge>
                {contact.tags.includes("vip") && <Badge tone="accent">VIP</Badge>}
              </div>
              <div className="mt-0.5 text-sm text-muted">
                {contact.company ? `${contact.company} · ` : ""}
                {contact.city} · {contact.phone}
              </div>
              <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-2">
                <span className="inline-flex items-center gap-1.5 text-xs text-muted">
                  Score <ScoreBar score={contact.score} />
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs text-muted">
                  Owner <OwnerChip ownerId={contact.ownerId} />
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs text-muted">
                  <ChannelIcon channel={contact.channel} size="xs" /> via {contact.source}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs text-muted">
                  <Clock className="size-3.5" /> Active {contact.lastActivity}
                </span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-5 gap-1.5 sm:flex sm:flex-wrap sm:gap-2">
            {quickActions.map((a) => (
              <Button key={a.label} variant="outline" size="sm" onClick={a.onClick} className="h-auto flex-col gap-1 px-1 py-2 text-[11px] sm:h-8 sm:flex-row sm:gap-1.5 sm:px-3 sm:py-0 sm:text-sm" aria-label={a.label}>
                <a.icon />
                <span className="truncate">{a.label === "Add to sequence" ? <><span className="sm:hidden">Sequence</span><span className="hidden sm:inline">Add to sequence</span></> : a.label}</span>
              </Button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 border-t border-line sm:grid-cols-4">
          {[
            { label: "Lifetime paid", value: formatCurrency(paid), hint: outstanding ? `${formatCurrency(outstanding)} outstanding` : "Nothing outstanding" },
            { label: "Open deals", value: formatCurrency(openDealValue), hint: `${contactDeals.filter((d) => d.stage !== "won" && d.stage !== "lost").length} active` },
            { label: contact.tags.includes("b2b") ? "Meetings" : "Visits", value: String(pastVisits + (contact.stage === "customer" ? 2 : 0)), hint: upcoming.length ? `Next: ${dayLabel(dayOf(upcoming[0].at))}` : "None scheduled" },
            { label: "Conversations", value: String(convs.length), hint: convs.length ? `${convs.filter((c) => c.status !== "closed").length} open` : "No threads yet" },
          ].map((s, i) => (
            <div key={s.label} className={cn("px-4 py-3 sm:px-5", i % 2 === 1 && "border-l border-line", i >= 2 && "border-t border-line sm:border-t-0", i === 2 && "sm:border-l")}>
              <div className="text-xs text-muted">{s.label}</div>
              <div className="mt-0.5 text-lg font-semibold tabular">{s.value}</div>
              <div className="truncate text-[11px] text-muted">{s.hint}</div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[340px_minmax(0,1fr)]">
        {/* Left column */}
        <div className="space-y-4">
          <AiCallout
            title="AI summary"
            action={
              <>
                <Button size="xs" variant="outline" onClick={() => toast({ title: "Follow-up drafted", description: `Copilot draft for ${first} added to the inbox for review.`, tone: "info" })}>
                  <Sparkles /> Draft follow-up
                </Button>
                <Button
                  size="xs"
                  variant="ghost"
                  disabled={summaryRefreshing}
                  onClick={() => {
                    setSummaryRefreshing(true);
                    setTimeout(() => {
                      setSummaryRefreshing(false);
                      toast({ title: "Summary refreshed", description: `Based on ${activity.length} timeline events.`, tone: "info" });
                    }, 900);
                  }}
                >
                  {summaryRefreshing ? "Refreshing…" : "Refresh"}
                </Button>
              </>
            }
          >
            <span className={cn(summaryRefreshing && "opacity-50")}>{aiSummaryFor(contact)}</span>
          </AiCallout>

          <Card>
            <CardHeader title="Details" />
            <CardBody className="divide-y divide-line pb-3">
              <MetaRow label="Phone">{contact.phone}</MetaRow>
              <MetaRow label="Email">{contact.email ? <span className="break-all">{contact.email}</span> : <span className="text-muted">Not on file</span>}</MetaRow>
              {contact.company && <MetaRow label="Company">{contact.company}</MetaRow>}
              <MetaRow label="Stage">
                <Select
                  aria-label="Change stage"
                  value={contact.stage}
                  onChange={(e) => {
                    const s = e.target.value as Stage;
                    log({ kind: "stage", title: `Stage changed: ${stageMeta[contact.stage].label} → ${stageMeta[s].label}`, actor: "Priya Sharma" });
                    update({ stage: s });
                    toast({ title: `Stage updated to ${stageMeta[s].label}` });
                  }}
                  className="h-7 w-36 py-0 text-xs"
                >
                  {(Object.keys(stageMeta) as Stage[]).map((s) => (
                    <option key={s} value={s}>
                      {stageMeta[s].label}
                    </option>
                  ))}
                </Select>
              </MetaRow>
              <MetaRow label="Owner">
                <Select
                  aria-label="Change owner"
                  value={contact.ownerId}
                  onChange={(e) => {
                    update({ ownerId: e.target.value });
                    toast({ title: `Assigned to ${ownerName(e.target.value)}` });
                  }}
                  className="h-7 w-36 py-0 text-xs"
                >
                  <option value="ai">AI agent</option>
                  {team.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </Select>
              </MetaRow>
              <MetaRow label="City">{contact.city}</MetaRow>
              <MetaRow label="Language">{contact.language}</MetaRow>
              <MetaRow label="Source">{contact.source}</MetaRow>
              <MetaRow label="Created">{formatIsoDate(contact.createdAt)}</MetaRow>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Marketing consent" description="DPDP Act 2023 · TRAI DLT" />
            <ul className="divide-y divide-line border-t border-line">
              {consent.map((c) => {
                const meta = consentMeta[c.status];
                return (
                  <li key={c.channel} className="flex items-start gap-3 px-5 py-3">
                    <ChannelIcon channel={c.channel} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-sm font-medium">{channelMeta[c.channel].label}</span>
                        <Badge tone={meta.tone}>
                          <meta.icon /> {meta.label}
                        </Badge>
                      </div>
                      <div className="mt-0.5 text-xs text-muted">
                        {c.source}
                        {c.date !== "—" && ` · ${c.date}`}
                      </div>
                    </div>
                    <Switch checked={c.status === "opted_in"} onChange={(v) => toggleConsent(c.channel, v)} label={`${channelMeta[c.channel].label} marketing consent`} size="sm" />
                  </li>
                );
              })}
            </ul>
          </Card>

          <Card>
            <CardBody className="pt-4">
              <SectionTitle>Tags</SectionTitle>
              <div className="flex flex-wrap items-center gap-1.5">
                {contact.tags.map((t) => (
                  <Badge key={t} className="pr-1">
                    <Tag /> {t}
                    <button aria-label={`Remove tag ${t}`} className="rounded hover:text-danger" onClick={() => update({ tags: contact.tags.filter((x) => x !== t) })}>
                      <X />
                    </button>
                  </Badge>
                ))}
                {addingTag ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      addTag();
                    }}
                  >
                    <Input autoFocus value={tagDraft} onChange={(e) => setTagDraft(e.target.value)} onBlur={addTag} placeholder="New tag" aria-label="New tag" className="h-7 w-28 text-xs" />
                  </form>
                ) : (
                  <Button size="xs" variant="ghost" onClick={() => setAddingTag(true)}>
                    <Plus /> Add tag
                  </Button>
                )}
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Deals"
              description={contactDeals.length ? `${contactDeals.length} in pipeline` : undefined}
              action={
                <Link href="/pipeline" className="text-xs font-medium text-primary hover:underline">
                  Pipeline
                </Link>
              }
            />
            <CardBody className="space-y-2">
              {contactDeals.length === 0 ? (
                <p className="text-sm text-muted">No deals yet.</p>
              ) : (
                contactDeals.map((d) => (
                  <button key={d.id} onClick={() => setTab("deals")} className="flex w-full items-center gap-3 rounded-lg border border-line px-3 py-2 text-left hover:bg-surface-2">
                    <Briefcase className="size-4 shrink-0 text-muted" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{d.title}</div>
                      <Badge tone={dealStageTone(d.stage)} className="mt-0.5">
                        {pipelines[d.pipeline].stages[d.stage]}
                      </Badge>
                    </div>
                    <span className="text-sm font-semibold tabular">{formatCurrency(d.value)}</span>
                  </button>
                ))
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Upcoming appointments"
              action={
                <Button size="xs" variant="ghost" onClick={() => setBookOpen(true)}>
                  <Plus /> Book
                </Button>
              }
            />
            <CardBody className="space-y-2">
              {upcoming.length === 0 ? (
                <p className="text-sm text-muted">Nothing scheduled. {first} hasn&apos;t booked a visit yet.</p>
              ) : (
                upcoming.map((u) => {
                  const sv = services.find((s) => s.id === u.serviceId)!;
                  const pr = providers.find((p) => p.id === u.providerId)!;
                  return (
                    <div key={u.id} className="flex gap-3 rounded-lg border border-line p-3">
                      <div className="flex w-12 shrink-0 flex-col items-center justify-center rounded-lg bg-primary-soft py-1 text-primary">
                        <span className="text-[10px] font-semibold uppercase">{dayLabel(dayOf(u.at)).slice(0, 3)}</span>
                        <span className="text-sm font-semibold tabular">{timeLabel(minOf(u.at)).replace(/ (AM|PM)/, "")}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium">{sv.name}</div>
                        <div className="text-xs text-muted">
                          {stampLabel(u.at)} · {locationLabel[u.location]}
                        </div>
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          <Badge tone={u.status === "confirmed" ? "success" : "warning"}>
                            {u.status === "confirmed" ? <CheckCircle2 /> : <Clock />}
                            {u.status === "confirmed" ? "Confirmed" : "Unconfirmed"}
                          </Badge>
                          {u.deposit.amount > 0 && (
                            <Badge tone={u.deposit.status === "paid" ? "success" : "warning"}>
                              {formatCurrency(u.deposit.amount)} deposit {u.deposit.status === "paid" ? "paid" : "pending"}
                            </Badge>
                          )}
                          <span className="text-xs text-muted">{pr.name}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </CardBody>
          </Card>
        </div>

        {/* Main column */}
        <Card className="min-w-0 self-start">
          <Tabs
            className="px-3 pt-1"
            value={tab}
            onChange={setTab}
            items={[
              { value: "timeline", label: "Timeline", count: activity.length },
              { value: "conversations", label: "Conversations", count: convs.length },
              { value: "deals", label: "Deals", count: contactDeals.length },
              { value: "payments", label: "Payments", count: contactPayments.length },
              { value: "notes", label: "Notes", count: notes.length },
            ]}
          />

          {tab === "timeline" && (
            <div className="p-4 sm:p-5">
              {/* Log activity */}
              <div className="mb-5 rounded-xl border border-line bg-surface-2/50 p-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <Segmented
                    size="xs"
                    value={logMode}
                    onChange={setLogMode}
                    items={[
                      { value: "note", label: "Note" },
                      { value: "call", label: "Log call" },
                    ]}
                  />
                  <span className="hidden text-[11px] text-muted sm:inline">Visible to your team only</span>
                </div>
                <Textarea
                  value={logDraft}
                  onChange={(e) => setLogDraft(e.target.value)}
                  placeholder={logMode === "note" ? `Add a note about ${first}… use @ to mention a teammate` : `What happened on the call with ${first}?`}
                  className="min-h-16 bg-surface"
                />
                <div className="mt-2 flex justify-end">
                  <Button
                    size="sm"
                    disabled={!logDraft.trim()}
                    onClick={() => {
                      const body = logDraft.trim();
                      if (logMode === "note") addNote(body);
                      else log({ kind: "message", title: "Call logged", detail: body, channel: "voice", actor: "Priya Sharma", meta: "Manual log" });
                      setLogDraft("");
                      toast({ title: logMode === "note" ? "Note added" : "Call logged", description: "Added to the timeline." });
                    }}
                  >
                    {logMode === "note" ? "Add note" : "Log call"}
                  </Button>
                </div>
              </div>

              {/* Coming up */}
              {(openTasks.length > 0 || upcoming.length > 0) && filter === "all" && (
                <div className="mb-5">
                  <SectionTitle>Coming up</SectionTitle>
                  <ul className="space-y-2">
                    {upcoming.slice(0, 2).map((u) => (
                      <li key={u.id} className="flex items-center gap-3 rounded-lg border border-dashed border-line-strong px-3 py-2">
                        <CalendarClock className="size-4 shrink-0 text-success" />
                        <span className="min-w-0 flex-1 truncate text-sm">
                          {services.find((s) => s.id === u.serviceId)!.name} · {locationLabel[u.location]}
                        </span>
                        <span className="shrink-0 text-xs text-muted">{stampLabel(u.at)}</span>
                      </li>
                    ))}
                    {openTasks.map((t) => (
                      <li key={t.id} className="flex items-center gap-3 rounded-lg border border-dashed border-line-strong px-3 py-2">
                        <button
                          aria-label={`Complete task: ${t.title}`}
                          onClick={() => {
                            setDoneTasks((d) => [...d, t.id]);
                            log({ kind: "task", title: `Task completed: ${t.title}`, actor: "Priya Sharma" });
                            toast({ title: "Task completed" });
                          }}
                          className="text-line-strong hover:text-success"
                        >
                          <CheckCircle2 className="size-4" />
                        </button>
                        <TaskTypeIcon type={t.type} size="xs" />
                        <span className="min-w-0 flex-1 truncate text-sm">{t.title}</span>
                        {t.createdBy === "ai" && <AiTag />}
                        <span className={cn("shrink-0 text-xs", t.due < NOW_STAMP ? "font-medium text-danger" : "text-muted")}>
                          {t.due < NOW_STAMP ? "Overdue · " : ""}
                          {dueLabel(t)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Filters */}
              <div className="-mx-1 mb-4 flex gap-1.5 overflow-x-auto px-1 pb-1 scroll-thin">
                <FilterChip active={filter === "all"} onClick={() => setFilter("all")} count={activity.length}>
                  All
                </FilterChip>
                {filterKinds.map((k) => {
                  const n = activity.filter((e) => e.kind === k).length;
                  if (!n) return null;
                  const Icon = activityMeta[k].icon;
                  return (
                    <FilterChip key={k} active={filter === k} onClick={() => setFilter(k)} count={n}>
                      <Icon /> {activityMeta[k].label}
                    </FilterChip>
                  );
                })}
              </div>

              {grouped.length === 0 ? (
                <EmptyState icon={<Sparkles />} title="Nothing here yet" description="Activity of this type will show up as it happens." />
              ) : (
                <div className="space-y-6">
                  {grouped.map((g) => (
                    <section key={g.day}>
                      <h4 className="mb-3 text-xs font-semibold text-muted">{dayLabel(g.day)}</h4>
                      <ol className="relative space-y-4 before:absolute before:top-2 before:bottom-2 before:left-[13px] before:w-px before:bg-line">
                        {g.items.map((e) => (
                          <li key={e.id} className="relative flex gap-3">
                            <ActivityDot kind={e.kind} />
                            <div className="min-w-0 flex-1 pt-0.5">
                              <div className="flex flex-wrap items-center gap-1.5 text-sm">
                                <span className="min-w-0 font-medium break-words text-fg">{e.title}</span>
                                {e.actor === "AI" && <AiTag />}
                                {e.meta && (
                                  <Badge tone={/overdue|needs/i.test(e.meta) ? "danger" : /awaiting|unconfirmed|due/i.test(e.meta) ? "warning" : "neutral"}>{e.meta}</Badge>
                                )}
                              </div>
                              {e.detail && <div className="mt-0.5 text-sm break-words text-fg-2">{e.detail}</div>}
                              <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-muted">
                                {e.channel && <ChannelIcon channel={e.channel} size="xs" />}
                                <span>{e.id.startsWith("log-") ? "Just now" : dayOf(e.at) === TODAY && e.at <= NOW_STAMP ? relativeLabel(e.at) : timeLabel(minOf(e.at))}</span>
                                {e.actor && e.actor !== "AI" && <span>· {e.actor}</span>}
                                {e.href && (
                                  <Link href={e.href} className="ml-1 inline-flex items-center gap-0.5 font-medium text-primary hover:underline">
                                    Open <ArrowUpRight className="size-3" />
                                  </Link>
                                )}
                              </div>
                            </div>
                          </li>
                        ))}
                      </ol>
                    </section>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "conversations" && (
            <div className="p-4 sm:p-5">
              {convs.length === 0 ? (
                <EmptyState
                  icon={<MessagesSquare />}
                  title={`No conversations with ${first} yet`}
                  description="Start one on any channel where they've given consent. Replies land in the unified inbox."
                  action={
                    <Button size="sm" onClick={startWhatsApp}>
                      <MessageCircle /> Start on WhatsApp
                    </Button>
                  }
                />
              ) : (
                <ul className="space-y-3">
                  {convs.map((c) => {
                    const last = c.messages[c.messages.length - 1];
                    return (
                      <li key={c.id}>
                        <Link href={`/inbox?c=${c.id}`} className="block rounded-xl border border-line p-4 transition-colors hover:border-line-strong hover:bg-surface-2">
                          <div className="flex items-start gap-3">
                            <ChannelIcon channel={c.channel} size="md" />
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-sm font-semibold">{channelMeta[c.channel].label}</span>
                                <Badge tone={c.status === "closed" ? "neutral" : c.status === "pending" ? "warning" : "info"}>{c.status === "open" ? "Open" : c.status === "pending" ? "Pending" : "Closed"}</Badge>
                                {c.escalated && <Badge tone="danger">Escalated</Badge>}
                                <span className="text-xs text-muted">· {c.intent}</span>
                              </div>
                              <p className="mt-1 line-clamp-2 text-sm text-fg-2">{last.body}</p>
                              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                                <span className="inline-flex items-center gap-1.5">
                                  <OwnerChip ownerId={c.assignee} showName={false} /> {c.assignee === "ai" ? "AI agent" : ownerName(c.assignee)}
                                </span>
                                <span>{c.messages.length} messages</span>
                                <span>Sentiment: {c.sentiment}</span>
                                <span>{c.time} ago</span>
                              </div>
                            </div>
                            <ArrowUpRight className="size-4 shrink-0 text-muted" />
                          </div>
                          <div className="mt-3 rounded-lg bg-ai-soft/60 px-3 py-2 text-xs text-fg-2">
                            <span className="font-semibold text-ai">AI summary · </span>
                            {c.aiSummary}
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}

          {tab === "deals" && (
            <div className="space-y-3 p-4 sm:p-5">
              {contactDeals.length === 0 ? (
                <EmptyState
                  icon={<Briefcase />}
                  title="No deals yet"
                  description={`Create a deal to track ${first}'s treatment or purchase in the pipeline.`}
                  action={
                    <Button size="sm" onClick={() => toast({ title: "Deal created", description: `New lead · ${first} added to the pipeline.` })}>
                      <Plus /> New deal
                    </Button>
                  }
                />
              ) : (
                contactDeals.map((d) => (
                  <div key={d.id} className="rounded-xl border border-line p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold">{d.title}</div>
                        <div className="text-xs text-muted">
                          {pipelines[d.pipeline].label} · expected close {d.expectedClose}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-base font-semibold tabular">{formatCurrency(d.value)}</div>
                        <div className="text-[11px] text-muted">{stageProbability[d.stage]}% probability</div>
                      </div>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted">
                      <Badge tone={dealStageTone(d.stage)}>{pipelines[d.pipeline].stages[d.stage]}</Badge>
                      <OwnerChip ownerId={d.ownerId} />
                      <span>· {d.daysInStage}d in stage</span>
                      <span>· Next: {d.nextStep}</span>
                      {d.lostReason && <span className="text-danger">· Lost: {d.lostReason}</span>}
                    </div>
                    {d.stage !== "won" && d.stage !== "lost" && (
                      <AiCallout
                        className="mt-3"
                        title={d.nba.title}
                        action={
                          <Button size="xs" variant="ai" onClick={() => toast({ title: d.nba.cta, description: "Done. Logged on the deal timeline.", tone: "info" })}>
                            {d.nba.cta}
                          </Button>
                        }
                      >
                        {d.nba.body}
                      </AiCallout>
                    )}
                  </div>
                ))
              )}
              {contactDeals.length > 0 && (
                <div className="flex justify-end">
                  <Link href="/pipeline" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                    Open pipeline <ArrowUpRight className="size-3.5" />
                  </Link>
                </div>
              )}
            </div>
          )}

          {tab === "payments" && (
            <div className="p-4 sm:p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex gap-6 text-sm">
                  <div>
                    <div className="text-xs text-muted">Paid via links</div>
                    <div className="font-semibold tabular">{formatCurrency(paidLinks)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted">Outstanding</div>
                    <div className={cn("font-semibold tabular", outstanding > 0 && "text-warning")}>{formatCurrency(outstanding)}</div>
                  </div>
                </div>
                <Button size="sm" onClick={() => setPayOpen(true)}>
                  <IndianRupee /> New pay link
                </Button>
              </div>
              {contactPayments.length === 0 ? (
                <EmptyState icon={<IndianRupee />} title="No payments yet" description={`Send ${first} a UPI pay link on WhatsApp. Paid links create a GST invoice automatically.`} />
              ) : (
                <div className="overflow-x-auto rounded-lg border border-line">
                  <table className="w-full min-w-[640px] text-sm">
                    <thead className="bg-surface-2 text-left text-xs text-muted">
                      <tr>
                        <th className="px-3 py-2 font-medium">Link</th>
                        <th className="px-3 py-2 font-medium">Purpose</th>
                        <th className="px-3 py-2 text-right font-medium">Amount</th>
                        <th className="px-3 py-2 font-medium">Status</th>
                        <th className="px-3 py-2 font-medium">Method</th>
                        <th className="px-3 py-2 font-medium">Created</th>
                        <th className="px-3 py-2" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {contactPayments.map((p) => (
                        <tr key={p.id}>
                          <td className="px-3 py-2.5 font-mono text-xs">{p.id}</td>
                          <td className="px-3 py-2.5">
                            <div className="flex items-center gap-1.5">
                              {p.purpose}
                              {p.createdByAi && <AiTag />}
                            </div>
                            {p.invoice && <div className="text-xs text-muted">{p.invoice}</div>}
                          </td>
                          <td className="px-3 py-2.5 text-right font-medium tabular">{formatCurrency(p.amount)}</td>
                          <td className="px-3 py-2.5">
                            <PaymentStatusBadge status={p.status} />
                          </td>
                          <td className="px-3 py-2.5">
                            <MethodLabel method={p.method} />
                          </td>
                          <td className="px-3 py-2.5 text-xs text-muted">{p.created}</td>
                          <td className="px-3 py-2.5 text-right">
                            {p.status === "pending" || p.status === "overdue" ? (
                              <Button size="xs" variant="outline" onClick={() => toast({ title: "Reminder sent", description: `${formatCurrency(p.amount)} link re-sent to ${first} on ${channelMeta[p.channel].label}.` })}>
                                Remind
                              </Button>
                            ) : (
                              <Link href="/payments" className="text-xs font-medium text-primary hover:underline">
                                View
                              </Link>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {tab === "notes" && (
            <div className="space-y-4 p-4 sm:p-5">
              <div>
                <Textarea value={noteDraft} onChange={(e) => setNoteDraft(e.target.value)} placeholder={`Add an internal note about ${first}… use @ to mention a teammate`} />
                <div className="mt-2 flex justify-end">
                  <Button
                    size="sm"
                    disabled={!noteDraft.trim()}
                    onClick={() => {
                      addNote(noteDraft.trim());
                      setNoteDraft("");
                      toast({ title: "Note added", description: "Only your team can see notes." });
                    }}
                  >
                    Add note
                  </Button>
                </div>
              </div>
              {notes.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted">No notes yet. Notes are visible to your team only.</p>
              ) : (
                <ul className="space-y-3">
                  {notes.map((n) => (
                    <li key={n.id} className="rounded-lg border border-warning/20 bg-warning-soft/50 p-3">
                      <div className="mb-1 flex items-center gap-2 text-xs">
                        <Avatar name={n.author} size="xs" />
                        <span className="font-medium text-fg">{n.author}</span>
                        <span className="text-muted">· {n.time}</span>
                      </div>
                      <p className="text-sm text-fg-2">
                        {n.body.split(/(@\w+)/g).map((part, i) =>
                          part.startsWith("@") ? (
                            <span key={i} className="font-medium text-primary">
                              {part}
                            </span>
                          ) : (
                            part
                          ),
                        )}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </Card>
      </div>

      <PayLinkModal open={payOpen} onClose={() => setPayOpen(false)} defaultContactId={contact.id} onCreate={(p) => log({ kind: "payment", title: `Pay link sent: ${formatCurrency(p.amount)} for ${p.purpose}`, channel: p.channel, actor: "Priya Sharma", meta: "Awaiting payment", href: "/payments" })} />
      <BookModal
        open={bookOpen}
        contact={contact}
        onClose={() => setBookOpen(false)}
        onBooked={(b) => {
          setBooked((x) => [...x, b]);
          log({ kind: "booking", title: `${services.find((s) => s.id === b.serviceId)!.name} booked for ${dayLabel(b.day)}, ${formatHour(b.start)}`, detail: locationLabel[b.location], actor: "Priya Sharma", href: "/calendar" });
        }}
      />
      <BulkSequenceModal
        open={seqOpen}
        count={1}
        onClose={() => setSeqOpen(false)}
        onConfirm={(name) => {
          setSeqOpen(false);
          log({ kind: "sequence", title: `Enrolled in sequence “${name}”`, actor: "Priya Sharma", detail: "Step 1 goes out at the next send window (10:00 AM IST)." });
          toast({ title: `${first} enrolled in “${name}”`, description: "Stops automatically when they reply or book." });
        }}
      />
    </Page>
  );
}
