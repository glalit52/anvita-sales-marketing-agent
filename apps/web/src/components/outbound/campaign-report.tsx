"use client";

import { ArrowLeft, CalendarCheck, CalendarClock, CheckCheck, Copy, Download, IndianRupee, MessageSquareReply, Pause, Send, Users, XCircle } from "lucide-react";
import { AreaTrend, ChartLegend, FunnelBars } from "@/components/charts";
import { AiCallout, Badge, Button, Card, CardBody, CardHeader, ChannelIcon, MetaRow, PageHeader, Progress, StatCard, useToast, type Tone } from "@/components/ui";
import { formatCurrency, formatNumber } from "@/lib/format";
import { campaignTrend, waTemplates, type Campaign, type CampaignStatus } from "@/lib/mock/outbound";
import { WhatsAppPreview } from "./phone-preview";
import { pct } from "./shared";

export const campaignStatus: Record<CampaignStatus, { label: string; tone: Tone }> = {
  scheduled: { label: "Scheduled", tone: "info" },
  sending: { label: "Sending", tone: "ai" },
  sent: { label: "Sent", tone: "success" },
  draft: { label: "Draft", tone: "neutral" },
};

const trendSeries = [
  { key: "read", label: "Read" },
  { key: "replied", label: "Replied" },
  { key: "booked", label: "Booked" },
];

export function CampaignReport({ c, onBack, onUpdate }: { c: Campaign; onBack: () => void; onUpdate: (patch: Partial<Campaign>) => void }) {
  const toast = useToast();
  const tpl = waTemplates.find((t) => t.name === c.template);
  const notSent = c.status === "scheduled" || c.status === "draft";
  const failed = c.status === "sending" ? 0 : c.audience - c.delivered;
  const hasRead = c.channel !== "sms";
  const f = c.delivered / 598;
  const trend = campaignTrend.map((d) => ({ day: d.day, read: hasRead ? Math.round(d.read * f) : 0, replied: Math.round(d.replied * f), booked: Math.round(d.booked * f) }));

  return (
    <>
      <button onClick={onBack} className="mb-3 inline-flex items-center gap-1 text-sm text-muted hover:text-fg">
        <ArrowLeft className="size-4" /> All campaigns
      </button>
      <PageHeader
        title={
          <span className="flex flex-wrap items-center gap-2">
            <ChannelIcon channel={c.channel} size="md" /> {c.name}
            <Badge tone={campaignStatus[c.status].tone} dot>
              {campaignStatus[c.status].label}
            </Badge>
          </span>
        }
        description={`${c.segment} · ${formatNumber(c.audience)} recipients · ${c.when}`}
        actions={
          <>
            <Button variant="outline" onClick={() => toast({ title: "Campaign duplicated", description: `“${c.name} (copy)” saved as draft.` })}>
              <Copy /> Duplicate
            </Button>
            {notSent ? (
              <Button onClick={() => { onUpdate({ status: "sending", when: "Today · sending now", delivered: Math.round(c.audience * 0.2) }); toast({ title: "Sending now", description: "Throttled at 60/min with quiet hours respected." }); }}>
                <Send /> Send now
              </Button>
            ) : c.status === "sending" ? (
              <Button variant="outline" onClick={() => { onUpdate({ status: "scheduled", when: "Paused · resume anytime" }); toast({ title: "Sending paused", tone: "warning" }); }}>
                <Pause /> Pause
              </Button>
            ) : (
              <Button variant="outline" onClick={() => toast({ title: "Report exported", description: `${c.name}.pdf · white-label ready` })}>
                <Download /> Export report
              </Button>
            )}
          </>
        }
      />

      {notSent ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <Card className="self-start">
            <CardHeader title={c.status === "draft" ? "Draft: not scheduled yet" : "Scheduled"} description="Results appear here as soon as the first messages are delivered" />
            <CardBody>
              <div className="rounded-xl bg-surface-2 p-4">
                <MetaRow label="Send time">{c.when}</MetaRow>
                <MetaRow label="Audience">{formatNumber(c.audience)} contacts (re-checked at send time)</MetaRow>
                <MetaRow label="Template">
                  <span className="font-mono text-xs">{c.template}</span>
                </MetaRow>
                <MetaRow label="Est. cost">{formatCurrency(Math.round(c.audience * 0.88))}</MetaRow>
                <MetaRow label="Forecast">
                  ~{Math.round(c.audience * 0.11)} bookings · {formatCurrency(Math.round(c.audience * 0.11 * 2400))}
                </MetaRow>
              </div>
              {tpl?.status === "pending" && (
                <AiCallout className="mt-4" title="Template still in Meta review">
                  implant_emi_0pct was submitted 2h ago. We&apos;ll schedule automatically once approved, or you can switch to an approved template.
                </AiCallout>
              )}
              {c.status === "scheduled" && (
                <AiCallout className="mt-4" title="Forecast: 31% read within the first hour">
                  Diwali offers do best on Thursday mornings for your patients. Keep the 10:30 AM slot.
                </AiCallout>
              )}
            </CardBody>
          </Card>
          {tpl && <WhatsAppPreview header={tpl.header} body={tpl.body.replace("{{1}}", "Ananya").replace("{{2}}", "Koregaon Park").replace("{{3}}", "6")} buttons={tpl.buttons} media={tpl.media} />}
        </div>
      ) : (
        <>
          {c.status === "sending" && (
            <Card className="mb-4 p-4">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium">Sending… {formatNumber(c.delivered)} of {formatNumber(c.audience)} delivered</span>
                <span className="text-muted">~{Math.ceil((c.audience - c.delivered) / 60)} min left at 60/min</span>
              </div>
              <Progress value={pct(c.delivered, c.audience)} tone="ai" />
            </Card>
          )}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
            <StatCard label="Delivered" value={formatNumber(c.delivered)} hint={`${pct(c.delivered, c.audience).toFixed(1)}% of ${formatNumber(c.audience)}`} icon={<CheckCheck />} />
            <StatCard label={hasRead ? "Read / opened" : "Clicks"} value={hasRead ? `${pct(c.read, c.delivered).toFixed(0)}%` : "–"} hint={hasRead ? `${formatNumber(c.read)} people` : "SMS has no read receipts"} icon={<Users />} />
            <StatCard label="Replied" value={formatNumber(c.replied)} hint={`${pct(c.replied, c.delivered).toFixed(1)}% reply rate`} icon={<MessageSquareReply />} />
            <StatCard label="Booked" value={c.booked} delta={22.4} hint="vs last recall" icon={<CalendarCheck />} />
            <StatCard className="col-span-2 lg:col-span-1" label="Revenue attributed" value={formatCurrency(c.revenue)} hint={`ROI ${Math.round(c.revenue / Math.max(1, c.audience * 0.88))}×`} icon={<IndianRupee />} />
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
            <Card>
              <CardHeader title="Delivery funnel" description="Recipient → paying patient" />
              <CardBody>
                <FunnelBars
                  steps={[
                    { label: "Targeted", value: c.audience },
                    { label: "Delivered", value: c.delivered },
                    ...(hasRead ? [{ label: c.channel === "email" ? "Opened" : "Read", value: c.read }] : []),
                    { label: "Replied", value: c.replied },
                    { label: "Booked", value: c.booked },
                  ]}
                />
                {failed > 0 && (
                  <div className="mt-5 rounded-lg border border-line p-3">
                    <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-fg-2">
                      <XCircle className="size-3.5 text-danger" /> {failed} not delivered
                    </div>
                    {[
                      ["Not on WhatsApp", Math.ceil(failed * 0.6)],
                      ["Invalid number", Math.floor(failed * 0.25)],
                      ["Blocked / opted out", failed - Math.ceil(failed * 0.6) - Math.floor(failed * 0.25)],
                    ].map(([l, v]) => (
                      <div key={l} className="flex justify-between py-0.5 text-xs">
                        <span className="text-muted">{l}</span>
                        <span className="tabular">{v}</span>
                      </div>
                    ))}
                    <Button size="xs" variant="ghost" className="mt-1 -ml-2" onClick={() => toast({ title: `SMS fallback queued for ${Math.ceil(failed * 0.6)} contacts`, description: "Using DLT template 1107169845123456789." })}>
                      Send SMS fallback
                    </Button>
                  </div>
                )}
              </CardBody>
            </Card>

            <Card className="xl:col-span-2">
              <CardHeader title="Responses over time" description="Days since send" action={<ChartLegend items={trendSeries} />} />
              <CardBody>
                <AreaTrend data={trend} xKey="day" series={trendSeries} height={250} />
              </CardBody>
            </Card>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card>
              <CardHeader title="Revenue attributed" description="Bookings within 7 days of a reply or click" />
              <CardBody className="space-y-2.5">
                {[
                  { label: "Cleaning & polish", n: Math.round(c.booked * 0.68), v: Math.round(c.revenue * 0.42) },
                  { label: "Whitening upgrade", n: Math.round(c.booked * 0.14), v: Math.round(c.revenue * 0.31) },
                  { label: "Fillings found at check-up", n: Math.round(c.booked * 0.18), v: Math.round(c.revenue * 0.27) },
                ].map((r) => (
                  <div key={r.label}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="text-fg-2">
                        {r.label} <span className="text-xs text-muted">· {r.n}</span>
                      </span>
                      <span className="font-medium tabular">{formatCurrency(r.v)}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-surface-2">
                      <div className="h-full rounded-full bg-chart-1" style={{ width: `${pct(r.v, c.revenue)}%` }} />
                    </div>
                  </div>
                ))}
                <p className="pt-1 text-xs text-muted">{Math.round(c.booked * 0.71)} of {c.booked} bookings were completed by the AI agent in Inbox, with UPI deposits.</p>
              </CardBody>
            </Card>
            <Card>
              <CardHeader title="Button taps" description="Quick-reply responses" />
              <CardBody className="space-y-2">
                {(tpl?.buttons ?? ["Book now", "Know more", "Stop"]).map((b, i) => {
                  const v = Math.round(c.replied * [0.74, 0.16, 0.06][i] || 0);
                  return (
                    <div key={b} className="flex items-center gap-3 text-sm">
                      <span className="w-32 shrink-0 truncate text-fg-2">{b}</span>
                      <div className="h-2 flex-1 rounded-full bg-surface-2">
                        <div className="h-full rounded-full bg-chart-1" style={{ width: `${pct(v, c.replied)}%` }} />
                      </div>
                      <span className="w-8 text-right tabular">{v}</span>
                    </div>
                  );
                })}
              </CardBody>
            </Card>
            <Card>
              <CardHeader title="Next best action" description="Suggested by Anvita AI" />
              <CardBody className="space-y-3">
                <AiCallout
                  title={`Follow up with ${Math.round(c.read - c.replied)} who read but didn't reply`}
                  action={
                    <Button size="xs" variant="ai" onClick={() => toast({ title: "Follow-up drafted", description: "Scheduled for Mon 10:30 AM using smart send.", tone: "info" })}>
                      <CalendarClock /> Draft follow-up
                    </Button>
                  }
                >
                  A soft reminder 5 days later typically adds ~30% more bookings for recalls.
                </AiCallout>
              </CardBody>
            </Card>
          </div>
        </>
      )}
    </>
  );
}
