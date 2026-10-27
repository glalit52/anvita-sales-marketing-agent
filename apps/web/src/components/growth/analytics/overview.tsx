"use client";

import { Bot, CalendarCheck, Clock, Download, IndianRupee, Megaphone, UserPlus } from "lucide-react";
import { useState } from "react";
import { AreaTrend, BarCompare, ChartLegend } from "@/components/charts";
import { Button, Segmented, StatCard, useToast } from "@/components/ui";
import { formatCurrency, formatNumber } from "@/lib/format";
import { overviewKpis, rangeFactor, revenueBySource, weeklyRevenue, type Range } from "@/lib/mock/growth";
import { GrowthReportCard } from "../growth-report";
import { ChartCard } from "../shared";

const inrShort = (v: number) => (v >= 50000 ? `₹${(v / 100000).toFixed(1)}L` : v >= 1000 ? `₹${Math.round(v / 1000)}k` : `₹${v}`);

export function RangeControl({ value, onChange }: { value: Range; onChange: (r: Range) => void }) {
  return (
    <Segmented
      value={value}
      onChange={onChange}
      items={[
        { value: "7d", label: "7 days" },
        { value: "30d", label: "30 days" },
        { value: "90d", label: "90 days" },
      ]}
    />
  );
}

export function AnalyticsOverview() {
  const toast = useToast();
  const [range, setRange] = useState<Range>("30d");
  const k = overviewKpis[range];
  const f = rangeFactor[range];
  const sources = revenueBySource.map((s) => ({ ...s, revenue: Math.round(s.revenue * f), cost: Math.round(s.cost * f) }));
  const weeks = range === "7d" ? weeklyRevenue.slice(-2) : range === "30d" ? weeklyRevenue.slice(-5) : weeklyRevenue;
  const label = { "7d": "last 7 days", "30d": "last 30 days", "90d": "last 90 days" }[range];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <RangeControl value={range} onChange={setRange} />
        <Button size="sm" variant="outline" onClick={() => toast({ title: "CSV export started", description: `anvita-overview-${range}.csv`, tone: "info" })}>
          <Download /> Export CSV
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Leads" value={formatNumber(k.leads)} delta={k.deltas[0]} icon={<UserPlus />} />
        <StatCard label="Bookings" value={formatNumber(k.bookings)} delta={k.deltas[1]} icon={<CalendarCheck />} />
        <StatCard label="Revenue collected" value={formatCurrency(k.revenue)} delta={k.deltas[2]} icon={<IndianRupee />} />
        <StatCard label="Ad spend" value={formatCurrency(k.adSpend)} delta={k.deltas[3]} goodWhen="down" icon={<Megaphone />} />
        <StatCard label="AI resolution" value={`${k.aiResolution}%`} delta={k.deltas[4]} icon={<Bot />} />
        <StatCard label="Median first response" value={k.frt} delta={k.deltas[5]} goodWhen="down" icon={<Clock />} />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <ChartCard
          className="xl:col-span-2"
          title="Revenue by source"
          description={`Booked revenue vs ad cost, ${label} · last-touch`}
          legend={
            <ChartLegend
              items={[
                { key: "revenue", label: "Revenue" },
                { key: "cost", label: "Ad cost" },
              ]}
            />
          }
          table={{
            columns: [
              { key: "source", label: "Source" },
              { key: "revenue", label: "Revenue", align: "right", render: (r) => formatCurrency(r.revenue) },
              { key: "cost", label: "Ad cost", align: "right", render: (r) => (r.cost ? formatCurrency(r.cost) : "—") },
            ],
            rows: sources,
          }}
        >
          <BarCompare
            data={sources}
            xKey="source"
            horizontal
            height={300}
            format={inrShort}
            series={[
              { key: "revenue", label: "Revenue" },
              { key: "cost", label: "Ad cost" },
            ]}
          />
        </ChartCard>
        <GrowthReportCard />
      </div>

      <ChartCard
        title="Weekly revenue"
        description={`Collected via pay links and at the clinic · ${inrShort(weeks.reduce((a, w) => a + w.revenue, 0))} in view`}
        table={{
          columns: [
            { key: "week", label: "Week" },
            { key: "revenue", label: "Revenue", align: "right", render: (r) => formatCurrency(r.revenue) },
            { key: "bookings", label: "Bookings", align: "right" },
          ],
          rows: weeks,
        }}
      >
        <AreaTrend data={weeks} xKey="week" series={[{ key: "revenue", label: "Revenue" }]} height={220} format={inrShort} />
      </ChartCard>
    </div>
  );
}
