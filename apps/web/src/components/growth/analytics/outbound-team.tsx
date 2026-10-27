"use client";

import { CalendarCheck, Mail, MailOpen, Reply } from "lucide-react";
import { FunnelBars } from "@/components/charts";
import { AiCallout, Avatar, Badge, Card, CardHeader, StatCard } from "@/components/ui";
import { cn } from "@/lib/cn";
import { formatNumber } from "@/lib/format";
import { prospectFunnel, sequenceStats, teamStats } from "@/lib/mock/growth";
import { ChartCard, RankBars } from "../shared";

export function AnalyticsOutbound() {
  const sent = sequenceStats.reduce((a, s) => a + s.sent, 0);
  const meetings = sequenceStats.reduce((a, s) => a + s.meetings, 0);
  const weighted = (key: "open" | "reply") => sequenceStats.reduce((a, s) => a + s[key] * s.sent, 0) / sent;
  const sorted = [...sequenceStats].sort((a, b) => b.reply - a.reply);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Emails & messages sent" value={formatNumber(sent)} delta={22.0} hint="last 30 days" icon={<Mail />} />
        <StatCard label="Open rate" value={`${weighted("open").toFixed(1)}%`} delta={3.1} icon={<MailOpen />} />
        <StatCard label="Reply rate" value={`${weighted("reply").toFixed(1)}%`} delta={1.4} hint="benchmark 5%" icon={<Reply />} />
        <StatCard label="Meetings booked" value={meetings} delta={26.7} icon={<CalendarCheck />} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard
          title="Reply rate by sequence"
          description="Share of enrolled prospects who replied"
          table={{
            columns: [
              { key: "name", label: "Sequence" },
              { key: "sent", label: "Sent", align: "right" },
              { key: "open", label: "Open", align: "right", render: (r) => `${r.open}%` },
              { key: "reply", label: "Reply", align: "right", render: (r) => `${r.reply}%` },
              { key: "meetings", label: "Meetings", align: "right" },
            ],
            rows: sorted,
          }}
          footer={
            <AiCallout className="mt-5" title="Re-engaging past pilots replies 2× more">
              Step 2 of ‘Agri dealers, Maharashtra’ (the stock-out case study) drives 58% of its replies. Try it as step 1 in Telangana.
            </AiCallout>
          }
        >
          <RankBars rows={sorted.map((s) => ({ key: s.name, label: s.name, value: s.reply, note: `${s.meetings} mtgs` }))} format={(v) => `${v.toFixed(1)}%`} />
        </ChartCard>
        <ChartCard
          title="Prospect → meeting funnel"
          description="All outbound sequences, last 30 days"
          table={{
            columns: [
              { key: "label", label: "Step" },
              { key: "value", label: "Count", align: "right", render: (r) => formatNumber(r.value) },
            ],
            rows: prospectFunnel,
          }}
        >
          <FunnelBars steps={prospectFunnel} />
        </ChartCard>
      </div>
    </div>
  );
}

export function AnalyticsTeam() {
  const max = Math.max(...teamStats.map((t) => t.conversations));
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader title="Team performance" description="Last 30 days · conversations handled end-to-end by each member" />
        <div className="scroll-thin overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="border-y border-line bg-surface-2 text-xs text-muted">
              <tr>
                <th scope="col" className="px-5 py-2 text-left font-medium">Member</th>
                <th scope="col" className="w-64 px-3 py-2 text-left font-medium">Conversations</th>
                <th scope="col" className="px-3 py-2 text-right font-medium">First response</th>
                <th scope="col" className="px-3 py-2 text-right font-medium">Resolved</th>
                <th scope="col" className="px-3 py-2 text-right font-medium">Bookings</th>
                <th scope="col" className="px-5 py-2 text-right font-medium">CSAT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {teamStats.map((t) => (
                <tr key={t.id} className={cn("hover:bg-surface-2/60", t.id === "ai" && "bg-ai-soft/30")}>
                  <td className="px-5 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={t.name} ai={t.id === "ai"} />
                      <div>
                        <div className="font-medium text-fg">{t.name}</div>
                        <div className="text-xs text-muted">{t.role}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="h-2 flex-1 rounded-full bg-surface-2">
                        <div className="h-full rounded-full bg-chart-1" style={{ width: `${(t.conversations / max) * 100}%` }} />
                      </div>
                      <span className="w-12 text-right tabular">{formatNumber(t.conversations)}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-right tabular">{t.frt}</td>
                  <td className="px-3 py-2.5 text-right tabular">{t.resolution}%</td>
                  <td className="px-3 py-2.5 text-right font-medium tabular">{t.bookings}</td>
                  <td className="px-5 py-2.5 text-right tabular">
                    {t.csat.toFixed(1)}
                    {t.csat >= 4.8 && (
                      <Badge tone="success" className="ml-1.5">
                        Top
                      </Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard
          title="Bookings by member"
          description="Appointments booked, last 30 days"
          table={{
            columns: [
              { key: "name", label: "Member" },
              { key: "bookings", label: "Bookings", align: "right" },
            ],
            rows: teamStats,
          }}
        >
          <RankBars rows={teamStats.map((t) => ({ key: t.id, label: t.name, value: t.bookings }))} />
        </ChartCard>
        <AiCallout title="Vikram's first response is 40% slower on Saturdays">
          He covers both clinics’ WhatsApp alone on Saturday mornings. Letting the AI agent answer FAQs and booking requests first (Autopilot for
          ‘Pricing’ and ‘Availability’ intents) would cut his queue by about 60%.
        </AiCallout>
      </div>
    </div>
  );
}
