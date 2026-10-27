"use client";

import {
  BellRing,
  CheckCircle2,
  Clock,
  Copy,
  Download,
  FileText,
  IndianRupee,
  Landmark,
  Link2,
  Loader,
  Percent,
  Plus,
  ReceiptText,
  RotateCcw,
  Search,
  Send,
  Sparkles,
  Timer,
  TriangleAlert,
  Wallet,
} from "lucide-react";
import { useMemo, useState } from "react";
import { AreaTrend, ChartLegend } from "@/components/charts";
import { AiCallout, Avatar, Badge, Button, Card, CardBody, CardHeader, ChannelIcon, EmptyState, Input, Page, PageHeader, Segmented, Select, StatCard, Tabs, useToast } from "@/components/ui";
import { channelMeta, type Channel } from "@/components/ui/channel";
import { PayLinkModal } from "@/components/sell/pay-link-modal";
import { AiBadge, MethodLabel, PaymentStatusBadge } from "@/components/sell/shared";
import { cn } from "@/lib/cn";
import { formatCompact, formatCurrency } from "@/lib/format";
import { invoices, payments as seedPayments, payouts, revenueTrend, sellContactById, type Invoice, type Payment, type PaymentStatus, type Payout } from "@/lib/mock/sell";

type Tab = "payments" | "invoices" | "payouts";
type StatusFilter = "all" | PaymentStatus;

const trendSeries = [
  { key: "payLinks", label: "Pay links (UPI, cards)" },
  { key: "inClinic", label: "In-clinic (POS, cash)" },
];

export default function PaymentsPage() {
  const toast = useToast();
  const [tab, setTab] = useState<Tab>("payments");
  const [rows, setRows] = useState<Payment[]>(seedPayments);
  const [status, setStatus] = useState<StatusFilter>("all");
  const [method, setMethod] = useState("");
  const [channel, setChannel] = useState("");
  const [query, setQuery] = useState("");
  const [range, setRange] = useState<"14d" | "30d">("30d");
  const [payOpen, setPayOpen] = useState(false);
  const [payDefaults, setPayDefaults] = useState<{ contactId?: string; amount?: number; purpose?: string }>({});

  const trend = range === "14d" ? revenueTrend.slice(-14) : revenueTrend;
  const octCollected = revenueTrend.filter((d) => d.date.endsWith("Oct")).reduce((s, d) => s + d.payLinks + d.inClinic, 0);
  const outstanding = rows.filter((p) => p.status === "pending" || p.status === "overdue").reduce((s, p) => s + p.amount, 0);
  const overdue = rows.filter((p) => p.status === "overdue");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((p) => {
      const c = sellContactById(p.contactId);
      return (
        (status === "all" || p.status === status) &&
        (!method || p.method === method) &&
        (!channel || p.channel === channel) &&
        (!q || [p.id, p.purpose, c?.name, c?.company, p.invoice].some((f) => f?.toLowerCase().includes(q)))
      );
    });
  }, [rows, status, method, channel, query]);

  const counts = (s: StatusFilter) => (s === "all" ? rows.length : rows.filter((p) => p.status === s).length);
  const channels = Array.from(new Set(rows.map((r) => r.channel)));

  const openPayLink = (defaults: typeof payDefaults = {}) => {
    setPayDefaults(defaults);
    setPayOpen(true);
  };

  return (
    <Page>
      <PageHeader
        title="Payments"
        description="Text-to-pay links, invoices and settlements. Every payment is linked back to the contact, deal and campaign that drove it."
        actions={
          <>
            <Button variant="outline" onClick={() => toast({ title: "Exporting payments", description: "payments-oct-2026.csv (Tally-compatible) will download shortly.", tone: "info" })}>
              <Download /> Export
            </Button>
            <Button onClick={() => openPayLink()}>
              <Link2 /> Create pay link
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Collected this month" value={formatCurrency(octCollected)} delta={14.2} hint="vs Sep" icon={<IndianRupee />} />
        <StatCard label="Outstanding" value={formatCurrency(outstanding)} delta={-8.5} goodWhen="down" hint={`${overdue.length} overdue`} icon={<Wallet />} />
        <StatCard label="Avg. days to pay" value="1.8 days" delta={-42.0} goodWhen="down" hint="was 3.1 days" icon={<Timer />} />
        <StatCard label="Pay-link conversion" value="78.4%" delta={6.1} hint="links paid within 72h" icon={<Percent />} />
      </div>

      <Tabs
        value={tab}
        onChange={setTab}
        className="mt-6 mb-4"
        items={[
          { value: "payments", label: "Payments", icon: <IndianRupee />, count: rows.length },
          { value: "invoices", label: "Invoices", icon: <ReceiptText />, count: invoices.length },
          { value: "payouts", label: "Payouts", icon: <Landmark /> },
        ]}
      />

      {tab === "payments" && (
        <>
          <div className="grid gap-4 xl:grid-cols-3">
            <Card className="min-w-0 xl:col-span-2">
              <CardHeader
                title="Revenue collected"
                description="Daily, by how the payment was collected"
                action={
                  <Segmented
                    size="xs"
                    value={range}
                    onChange={setRange}
                    items={[
                      { value: "14d", label: "14 days" },
                      { value: "30d", label: "30 days" },
                    ]}
                  />
                }
              />
              <CardBody>
                <ChartLegend items={trendSeries} className="mb-2" />
                <AreaTrend data={trend} xKey="date" series={trendSeries} stacked height={230} format={(v) => `₹${formatCompact(v)}`} />
              </CardBody>
            </Card>
            <div className="flex min-w-0 flex-col gap-4">
              <AiCallout
                title={`${formatCurrency(overdue.reduce((s, p) => s + p.amount, 0))} overdue from ${overdue.length} contacts`}
                action={
                  <Button
                    size="xs"
                    variant="ai"
                    onClick={() =>
                      toast({ title: `Reminders queued for ${overdue.length} contacts`, description: "Polite reminders in each contact's language, sent 10 AM tomorrow on their preferred channel." })
                    }
                  >
                    <Sparkles /> Send AI reminders
                  </Button>
                }
              >
                Patients who get a reminder in their own language pay 2.3× faster. Lakshmi (Tamil) and Rohit (Hindi) are 18+ days late; the AI suggests offering a 2-part split for Rohit.
              </AiCallout>
              <Card className="flex-1 p-4">
                <div className="text-sm font-semibold">Payment methods · October</div>
                <div className="mt-3 space-y-3">
                  {[
                    { label: "UPI (GPay, PhonePe, Paytm)", value: 71, fee: "0% MDR" },
                    { label: "Cards", value: 19, fee: "2% fee" },
                    { label: "Netbanking", value: 10, fee: "₹15 flat" },
                  ].map((m) => (
                    <div key={m.label}>
                      <div className="mb-1 flex items-baseline justify-between text-xs">
                        <span className="text-fg-2">{m.label}</span>
                        <span className="font-medium text-fg tabular">
                          {m.value}% <span className="font-normal text-muted">· {m.fee}</span>
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-surface-2">
                        <div className="h-full rounded-full bg-chart-1" style={{ width: `${m.value}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>

          <Card className="mt-4">
            <div className="flex flex-col gap-3 border-b border-line p-3 sm:p-4 lg:flex-row lg:items-center">
              <Input icon={<Search />} placeholder="Search contact, purpose or link ID" value={query} onChange={(e) => setQuery(e.target.value)} className="w-full lg:w-72" />
              <div className="scroll-thin -mx-1 overflow-x-auto px-1">
                <Segmented
                  value={status}
                  onChange={setStatus}
                  items={(["all", "paid", "pending", "overdue", "refunded"] as StatusFilter[]).map((s) => ({
                    value: s,
                    label: s === "all" ? "All" : s[0].toUpperCase() + s.slice(1),
                    count: counts(s),
                  }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-2 lg:ml-auto lg:flex">
                <div className="lg:w-36">
                  <Select value={method} onChange={(e) => setMethod(e.target.value)} aria-label="Filter by method">
                    <option value="">All methods</option>
                    <option value="upi">UPI</option>
                    <option value="card">Card</option>
                    <option value="netbanking">Netbanking</option>
                  </Select>
                </div>
                <div className="lg:w-36">
                  <Select value={channel} onChange={(e) => setChannel(e.target.value)} aria-label="Filter by channel">
                    <option value="">All channels</option>
                    {channels.map((c) => (
                      <option key={c} value={c}>
                        {channelMeta[c].label}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
            </div>
            {filtered.length === 0 ? (
              <EmptyState icon={<IndianRupee />} title="No payments match" description="Try another status or clear the filters." />
            ) : (
              <div className="scroll-thin overflow-x-auto">
                <table className="w-full min-w-[960px] text-sm">
                  <thead className="text-xs text-muted">
                    <tr className="border-b border-line">
                      <th className="px-3 py-2.5 pl-4 text-left font-medium">Contact</th>
                      <th className="px-3 py-2.5 text-left font-medium">Purpose</th>
                      <th className="px-3 py-2.5 text-right font-medium">Amount</th>
                      <th className="px-3 py-2.5 text-left font-medium">Status</th>
                      <th className="px-3 py-2.5 text-left font-medium">Method</th>
                      <th className="px-3 py-2.5 text-left font-medium">Sent via</th>
                      <th className="px-3 py-2.5 text-left font-medium">Created</th>
                      <th className="relative px-3 py-2.5 pr-4 text-right font-medium">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {filtered.map((p) => (
                      <PaymentRow
                        key={p.id}
                        payment={p}
                        onRemind={() => toast({ title: `Reminder sent to ${sellContactById(p.contactId)?.name}`, description: `${formatCurrency(p.amount)} · via ${channelMeta[p.channel].label}` })}
                        onRefund={() => {
                          setRows((rs) => rs.map((r) => (r.id === p.id ? { ...r, status: "refunded" } : r)));
                          toast({ title: `Refund initiated: ${formatCurrency(p.amount)}`, description: `${p.gateway} will credit the original ${p.method === "upi" ? "UPI account" : "payment method"} in 5–7 days.`, tone: "warning" });
                        }}
                        onCopy={() => toast({ title: "Link copied", description: `rzp.io/i/${p.id.toLowerCase()}`, tone: "info" })}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="border-t border-line px-4 py-3 text-xs text-muted">
              Showing {filtered.length} of {rows.length} · Payments sync from Razorpay and Stripe every 2 minutes
            </div>
          </Card>
        </>
      )}

      {tab === "invoices" && <InvoicesTab />}
      {tab === "payouts" && <PayoutsTab />}

      <PayLinkModal
        open={payOpen}
        onClose={() => setPayOpen(false)}
        defaultContactId={payDefaults.contactId}
        defaultAmount={payDefaults.amount}
        defaultPurpose={payDefaults.purpose}
        onCreate={(p) => {
          setRows((rs) => [{ ...p, id: `PL-${2292 + rs.length - seedPayments.length}` }, ...rs]);
          setStatus("all");
          setTab("payments");
        }}
      />
    </Page>
  );
}

function PaymentRow({ payment: p, onRemind, onRefund, onCopy }: { payment: Payment; onRemind: () => void; onRefund: () => void; onCopy: () => void }) {
  const c = sellContactById(p.contactId);
  return (
    <tr className="hover:bg-surface-2/60">
      <td className="px-3 py-2.5 pl-4">
        <div className="flex items-center gap-2.5">
          <Avatar name={c?.name ?? "?"} />
          <div className="min-w-0">
            <div className="truncate font-medium">{c?.name}</div>
            <div className="truncate text-xs text-muted">
              {p.id}
              {p.invoice && ` · ${p.invoice}`}
            </div>
          </div>
        </div>
      </td>
      <td className="max-w-56 px-3 py-2.5">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-fg-2">{p.purpose}</span>
          {p.createdByAi && <AiBadge />}
        </div>
      </td>
      <td className="px-3 py-2.5 text-right font-semibold tabular">{formatCurrency(p.amount)}</td>
      <td className="px-3 py-2.5">
        <div className="flex flex-col items-start gap-0.5">
          <PaymentStatusBadge status={p.status} />
          {p.status === "overdue" && <span className="text-[11px] text-danger">{p.days} days</span>}
          {p.status === "paid" && p.paidAt && <span className="text-[11px] whitespace-nowrap text-muted">{p.paidAt}</span>}
        </div>
      </td>
      <td className="px-3 py-2.5">
        <MethodLabel method={p.method} />
      </td>
      <td className="px-3 py-2.5">
        <span className="inline-flex items-center gap-1.5 text-fg-2">
          <ChannelIcon channel={p.channel as Channel} size="xs" /> {channelMeta[p.channel].label}
        </span>
      </td>
      <td className="px-3 py-2.5 whitespace-nowrap text-muted">{p.created}</td>
      <td className="px-3 py-2.5 pr-4">
        <div className="flex justify-end gap-1">
          {(p.status === "pending" || p.status === "overdue") && (
            <Button size="xs" variant="outline" onClick={onRemind}>
              <BellRing /> Remind
            </Button>
          )}
          {p.status === "paid" && (
            <Button size="xs" variant="ghost" onClick={onRefund}>
              <RotateCcw /> Refund
            </Button>
          )}
          <Button size="icon-sm" variant="ghost" aria-label={`Copy link ${p.id}`} onClick={onCopy}>
            <Copy />
          </Button>
        </div>
      </td>
    </tr>
  );
}

const invoiceStatus: Record<Invoice["status"], { label: string; tone: "success" | "info" | "danger" | "neutral"; icon: typeof Clock }> = {
  paid: { label: "Paid", tone: "success", icon: CheckCircle2 },
  sent: { label: "Sent", tone: "info", icon: Send },
  overdue: { label: "Overdue", tone: "danger", icon: TriangleAlert },
  draft: { label: "Draft", tone: "neutral", icon: FileText },
};

function InvoicesTab() {
  const toast = useToast();
  const [list, setList] = useState(invoices);
  const total = list.reduce((s, i) => s + i.amount + i.gst, 0);
  return (
    <Card>
      <CardHeader
        title="Invoices"
        description={`${list.length} invoices · ${formatCurrency(total)} billed incl. GST · GSTIN 27AAKCS4821M1Z5`}
        action={
          <Button size="sm" onClick={() => toast({ title: "New invoice draft", description: "AI pre-filled line items from the last visit. Review and send.", tone: "info" })}>
            <Plus /> New invoice
          </Button>
        }
      />
      <div className="scroll-thin overflow-x-auto border-t border-line">
        <table className="w-full min-w-[860px] text-sm">
          <thead className="text-xs text-muted">
            <tr className="border-b border-line">
              <th className="px-3 py-2.5 pl-5 text-left font-medium">Invoice</th>
              <th className="px-3 py-2.5 text-left font-medium">Billed to</th>
              <th className="px-3 py-2.5 text-left font-medium">Items</th>
              <th className="px-3 py-2.5 text-right font-medium">Amount</th>
              <th className="px-3 py-2.5 text-right font-medium">GST</th>
              <th className="px-3 py-2.5 text-left font-medium">Status</th>
              <th className="px-3 py-2.5 text-left font-medium">Due</th>
              <th className="relative px-3 py-2.5 pr-5 text-right font-medium">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {list.map((inv) => {
              const c = sellContactById(inv.contactId);
              const st = invoiceStatus[inv.status];
              return (
                <tr key={inv.id} className="hover:bg-surface-2/60">
                  <td className="px-3 py-2.5 pl-5 font-medium">
                    <span className="inline-flex items-center gap-2">
                      <FileText className="size-4 text-muted" /> {inv.id}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="font-medium">{c?.name}</div>
                    {c?.company && <div className="text-xs text-muted">{c.company}</div>}
                  </td>
                  <td className="max-w-64 truncate px-3 py-2.5 text-fg-2">{inv.items}</td>
                  <td className="px-3 py-2.5 text-right font-semibold tabular">{formatCurrency(inv.amount)}</td>
                  <td className="px-3 py-2.5 text-right text-muted tabular">{inv.gst ? formatCurrency(inv.gst) : "Exempt"}</td>
                  <td className="px-3 py-2.5">
                    <Badge tone={st.tone}>
                      <st.icon /> {st.label}
                    </Badge>
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap text-muted">{inv.due}</td>
                  <td className="px-3 py-2.5 pr-5">
                    <div className="flex justify-end gap-1">
                      {inv.status === "draft" ? (
                        <Button
                          size="xs"
                          onClick={() => {
                            setList((l) => l.map((x) => (x.id === inv.id ? { ...x, status: "sent", issued: "27 Oct" } : x)));
                            toast({ title: `${inv.id} sent`, description: `PDF + pay link sent to ${c?.name} on WhatsApp.` });
                          }}
                        >
                          <Send /> Send
                        </Button>
                      ) : inv.status !== "paid" ? (
                        <Button size="xs" variant="outline" onClick={() => toast({ title: `Reminder sent for ${inv.id}`, description: `${c?.name} · ${formatCurrency(inv.amount)}` })}>
                          <BellRing /> Remind
                        </Button>
                      ) : null}
                      <Button size="icon-sm" variant="ghost" aria-label={`Download ${inv.id}`} onClick={() => toast({ title: `Downloading ${inv.id}.pdf`, tone: "info" })}>
                        <Download />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

const payoutStatus: Record<Payout["status"], { label: string; tone: "success" | "info" | "neutral"; icon: typeof Clock }> = {
  settled: { label: "Settled", tone: "success", icon: CheckCircle2 },
  processing: { label: "Processing", tone: "info", icon: Loader },
  scheduled: { label: "Scheduled", tone: "neutral", icon: Clock },
};

function PayoutsTab() {
  const toast = useToast();
  const settled = payouts.filter((p) => p.status === "settled");
  const net = (p: Payout) => p.gross - p.fees - p.tax;
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { name: "Razorpay", mark: "R", detail: "UPI, cards, netbanking · T+1 settlement", status: "Connected", next: "Next payout ₹40,814 · 28 Oct" },
          { name: "Stripe", mark: "S", detail: "International cards (USD, AED) · T+3", status: "Connected", next: "Next payout ₹0 · nothing pending" },
        ].map((g) => (
          <Card key={g.name} className="p-4">
            <div className="flex items-start gap-3">
              <span className="flex size-9 items-center justify-center rounded-lg bg-surface-3 text-sm font-bold text-fg">{g.mark}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{g.name}</span>
                  <Badge tone="success" dot>
                    {g.status}
                  </Badge>
                </div>
                <div className="mt-0.5 text-xs text-muted">{g.detail}</div>
                <div className="mt-2 text-sm text-fg-2">{g.next}</div>
              </div>
            </div>
          </Card>
        ))}
        <Card className="p-4">
          <div className="flex items-start gap-3">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary-soft text-primary">
              <Landmark className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="font-semibold">HDFC Bank ••4821</div>
              <div className="mt-0.5 text-xs text-muted">Smile Dental Care LLP · current account · verified</div>
              <Button size="xs" variant="outline" className="mt-2" onClick={() => toast({ title: "Bank change requires owner OTP", description: "We sent an OTP to Priya's phone.", tone: "info" })}>
                Change account
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Settlements"
          description={`${formatCurrency(settled.reduce((s, p) => s + net(p), 0))} settled since 21 Oct, after gateway fees`}
          action={
            <Button size="sm" variant="outline" onClick={() => toast({ title: "Reconciliation report ready", description: "settlements-oct-2026.xlsx matched 100% with bank statement.", tone: "info" })}>
              <Download /> Reconciliation
            </Button>
          }
        />
        <div className="scroll-thin overflow-x-auto border-t border-line">
          <table className="w-full min-w-[880px] text-sm">
            <thead className="text-xs text-muted">
              <tr className="border-b border-line">
                <th className="px-3 py-2.5 pl-5 text-left font-medium">Date</th>
                <th className="px-3 py-2.5 text-left font-medium">Gateway</th>
                <th className="px-3 py-2.5 text-left font-medium">UTR / Payout ID</th>
                <th className="px-3 py-2.5 text-right font-medium">Payments</th>
                <th className="px-3 py-2.5 text-right font-medium">Gross</th>
                <th className="px-3 py-2.5 text-right font-medium">Fees + GST</th>
                <th className="px-3 py-2.5 text-right font-medium">Net</th>
                <th className="px-3 py-2.5 pr-5 text-left font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {payouts.map((p) => {
                const st = payoutStatus[p.status];
                return (
                  <tr key={p.id} className="hover:bg-surface-2/60">
                    <td className="px-3 py-2.5 pl-5 whitespace-nowrap">{p.date}</td>
                    <td className="px-3 py-2.5">{p.gateway}</td>
                    <td className="px-3 py-2.5 font-mono text-xs text-fg-2">{p.utr}</td>
                    <td className="px-3 py-2.5 text-right tabular">{p.count}</td>
                    <td className="px-3 py-2.5 text-right tabular">{formatCurrency(p.gross)}</td>
                    <td className="px-3 py-2.5 text-right text-muted tabular">−{formatCurrency(p.fees + p.tax)}</td>
                    <td className="px-3 py-2.5 text-right font-semibold tabular">{formatCurrency(net(p))}</td>
                    <td className="px-3 py-2.5 pr-5">
                      <Badge tone={st.tone}>
                        <st.icon /> {st.label}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className={cn("flex items-center gap-2 border-t border-line px-5 py-3 text-xs text-muted")}>
          <CheckCircle2 className="size-3.5 text-success" /> Auto-reconciled with HDFC statement · last check 11:05 AM
        </div>
      </Card>
    </div>
  );
}
