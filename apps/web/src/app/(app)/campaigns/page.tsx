"use client";

import { CalendarCheck, CheckCheck, ChevronRight, IndianRupee, Megaphone, Plus, Search, Sparkles, Users } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { CampaignComposer } from "@/components/outbound/campaign-composer";
import { CampaignReport, campaignStatus } from "@/components/outbound/campaign-report";
import { pct } from "@/components/outbound/shared";
import { AiCallout, Badge, Button, Card, ChannelIcon, EmptyState, Input, Page, PageHeader, Segmented, StatCard, useToast } from "@/components/ui";
import { formatCompact, formatCurrency, formatNumber } from "@/lib/format";
import { campaigns as seed, type Campaign, type CampaignStatus } from "@/lib/mock/outbound";

export default function CampaignsPage() {
  return (
    <Suspense fallback={<Page><div className="h-40 animate-pulse rounded-xl bg-surface-2" /></Page>}>
      <Campaigns />
    </Suspense>
  );
}

function Campaigns() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const toast = useToast();
  const [items, setItems] = useState<Campaign[]>(seed);
  const [composerState, setComposer] = useState(false);
  const composer = composerState || params.get("new") === "1";
  const [openId, setOpenId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | CampaignStatus>("all");
  const [query, setQuery] = useState("");

  const closeComposer = () => {
    setComposer(false);
    if (params.get("new")) router.replace(pathname);
  };

  const open = items.find((c) => c.id === openId);
  const sent = items.filter((c) => c.status === "sent" || c.status === "sending");
  const delivered = sent.reduce((a, c) => a + c.delivered, 0);
  const read = sent.filter((c) => c.channel !== "sms").reduce((a, c) => a + c.read, 0);
  const readBase = sent.filter((c) => c.channel !== "sms").reduce((a, c) => a + c.delivered, 0);
  const booked = sent.reduce((a, c) => a + c.booked, 0);
  const revenue = sent.reduce((a, c) => a + c.revenue, 0);
  const rows = items.filter((c) => (filter === "all" || c.status === filter) && `${c.name} ${c.segment}`.toLowerCase().includes(query.toLowerCase()));

  const composerEl = (
    <CampaignComposer
      open={composer}
      onClose={closeComposer}
      onLaunch={(c) => {
        setItems((list) => [{ ...c, id: `${c.id}-${list.length}`, delivered: c.status === "sending" ? Math.round(c.audience * 0.05) : 0 }, ...list]);
        toast({ title: c.status === "sending" ? "Campaign is sending" : "Campaign scheduled", description: `${c.name} · ${formatNumber(c.audience)} recipients` });
      }}
    />
  );

  if (open)
    return (
      <Page>
        <CampaignReport key={open.id} c={open} onBack={() => setOpenId(null)} onUpdate={(p) => setItems((l) => l.map((x) => (x.id === open.id ? { ...x, ...p } : x)))} />
        {composerEl}
      </Page>
    );

  return (
    <Page>
      <PageHeader
        title="Campaigns"
        description="Broadcast WhatsApp, SMS and email to opted-in segments. Every booking and payment is attributed back to the campaign."
        actions={
          <Button onClick={() => setComposer(true)}>
            <Plus /> New campaign
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Messages delivered" value={formatCompact(delivered)} delta={9.6} hint="last 30 days" icon={<CheckCheck />} />
        <StatCard label="Read rate" value={`${pct(read, readBase).toFixed(0)}%`} delta={3.1} hint="WhatsApp + email" icon={<Users />} />
        <StatCard label="Bookings from campaigns" value={booked} delta={26.8} hint="7-day attribution" icon={<CalendarCheck />} />
        <StatCard label="Revenue attributed" value={formatCurrency(revenue)} delta={41.2} hint="closed-loop via pay links" icon={<IndianRupee />} />
      </div>

      <AiCallout
        className="mt-4"
        title="329 patients are due for cleaning and have high lifetime value"
        action={
          <Button size="xs" variant="ai" onClick={() => setComposer(true)}>
            <Sparkles /> Create recall campaign
          </Button>
        }
      >
        Your last 6-month recall converted 12% to bookings ({formatCurrency(148000)}). Running it monthly instead of quarterly could add ~₹45k/month.
      </AiCallout>

      <Card className="mt-4 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
          <div className="scroll-thin max-w-full overflow-x-auto">
            <Segmented
              value={filter}
              onChange={setFilter}
              items={[
                { value: "all", label: "All", count: items.length },
                { value: "sending", label: "Sending" },
                { value: "scheduled", label: "Scheduled" },
                { value: "sent", label: "Sent" },
                { value: "draft", label: "Drafts" },
              ]}
            />
          </div>
          <Input icon={<Search />} placeholder="Search campaigns…" value={query} onChange={(e) => setQuery(e.target.value)} className="w-full sm:w-64" aria-label="Search campaigns" />
        </div>
        {rows.length === 0 ? (
          <EmptyState icon={<Megaphone />} title="No campaigns here yet" description="Broadcast an offer or a recall to an opted-in segment in under 2 minutes." action={<Button onClick={() => setComposer(true)}><Plus /> New campaign</Button>} />
        ) : (
          <div className="scroll-thin overflow-x-auto">
            <table className="w-full min-w-[980px] text-sm">
              <thead>
                <tr className="border-b border-line bg-surface-2 text-left text-[11px] font-semibold tracking-wide text-muted uppercase">
                  <th className="px-4 py-2.5">Campaign</th>
                  <th className="px-3 py-2.5">Status</th>
                  <th className="px-3 py-2.5 text-right">Audience</th>
                  <th className="px-3 py-2.5 text-right">Delivered</th>
                  <th className="px-3 py-2.5 text-right">Read</th>
                  <th className="px-3 py-2.5 text-right">Replied</th>
                  <th className="px-3 py-2.5 text-right">Booked</th>
                  <th className="px-3 py-2.5 text-right">Revenue</th>
                  <th className="w-8" />
                </tr>
              </thead>
              <tbody>
                {rows.map((c) => {
                  const live = c.status === "sent" || c.status === "sending";
                  return (
                    <tr key={c.id} onClick={() => setOpenId(c.id)} className="cursor-pointer border-b border-line last:border-0 hover:bg-surface-2/60">
                      <td className="min-w-[280px] px-4 py-3">
                        <div className="flex items-start gap-3">
                          <ChannelIcon channel={c.channel} className="mt-0.5" />
                          <div className="min-w-0">
                            <button className="text-left font-medium hover:text-primary" onClick={() => setOpenId(c.id)}>
                              {c.name}
                            </button>
                            <div className="max-w-[340px] truncate text-xs text-muted">
                              {c.segment} · {c.when}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <Badge tone={campaignStatus[c.status].tone} dot>
                          {campaignStatus[c.status].label}
                        </Badge>
                      </td>
                      <td className="px-3 py-3 text-right tabular">{formatNumber(c.audience)}</td>
                      <td className="px-3 py-3 text-right tabular">{live ? `${pct(c.delivered, c.audience).toFixed(0)}%` : "–"}</td>
                      <td className="px-3 py-3 text-right tabular">{live && c.channel !== "sms" && c.read ? `${pct(c.read, c.delivered).toFixed(0)}%` : "–"}</td>
                      <td className="px-3 py-3 text-right tabular">{live ? formatNumber(c.replied) : "–"}</td>
                      <td className="px-3 py-3 text-right font-medium tabular">{live ? c.booked : "–"}</td>
                      <td className="px-3 py-3 text-right font-medium tabular">{live ? formatCurrency(c.revenue) : "–"}</td>
                      <td className="pr-3">
                        <ChevronRight className="size-4 text-muted" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      {composerEl}
    </Page>
  );
}
