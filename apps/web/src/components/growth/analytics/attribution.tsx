"use client";

import { Info } from "lucide-react";
import { useMemo, useState } from "react";
import { FunnelBars } from "@/components/charts";
import { AiCallout, Badge, Card, CardHeader, Segmented } from "@/components/ui";
import { cn } from "@/lib/cn";
import { formatCurrency, formatNumber } from "@/lib/format";
import { attributionFunnel, attributionRows, type AttributionModel } from "@/lib/mock/growth";
import { ChartCard, RankBars } from "../shared";

const modelHelp: Record<AttributionModel, string> = {
  first: "100% credit to the first touch: the ad, post or search that started the conversation.",
  last: "100% credit to the last touch before the booking was made.",
  linear: "Credit split equally across every touch in the patient's journey.",
};

export function AnalyticsAttribution() {
  const [model, setModel] = useState<AttributionModel>("last");
  const [group, setGroup] = useState<"campaign" | "source">("campaign");
  const rows = useMemo(() => attributionRows(model), [model]);

  const grouped = useMemo(() => {
    if (group === "campaign") return rows;
    const map = new Map<string, (typeof rows)[number]>();
    rows.forEach((r) => {
      const g = map.get(r.source);
      if (g) map.set(r.source, { ...g, leads: g.leads + r.leads, bookings: g.bookings + r.bookings, revenue: g.revenue + r.revenue, cost: g.cost + r.cost });
      else map.set(r.source, { ...r, id: r.source, campaign: "All campaigns", utm: "—" });
    });
    return [...map.values()];
  }, [rows, group]);

  const totals = grouped.reduce((a, r) => ({ leads: a.leads + r.leads, bookings: a.bookings + r.bookings, revenue: a.revenue + r.revenue, cost: a.cost + r.cost }), { leads: 0, bookings: 0, revenue: 0, cost: 0 });
  const bySource = useMemo(() => {
    const m = new Map<string, number>();
    rows.forEach((r) => m.set(r.source, (m.get(r.source) ?? 0) + r.revenue));
    return [...m.entries()].sort((a, b) => b[1] - a[1]).map(([label, value]) => ({ key: label, label, value }));
  }, [rows]);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard
          title="Closed-loop funnel"
          description="Ad click → lead → conversation → booking → paid, last 30 days"
          table={{
            columns: [
              { key: "label", label: "Step" },
              { key: "value", label: "Count", align: "right", render: (r) => formatNumber(r.value) },
            ],
            rows: attributionFunnel,
          }}
          footer={
            <AiCallout className="mt-5" title="Biggest leak after the lead: only 46% of qualified chats book">
              42% of drop-offs asked about price then went quiet. A follow-up with the EMI option after 24h recovers ~1 in 6 in similar clinics.
            </AiCallout>
          }
        >
          <FunnelBars steps={attributionFunnel} />
        </ChartCard>
        <ChartCard
          title="Revenue by source"
          description={`Attributed with the ${model === "first" ? "first-touch" : model === "last" ? "last-touch" : "linear"} model`}
          table={{
            columns: [
              { key: "label", label: "Source" },
              { key: "value", label: "Revenue", align: "right", render: (r) => formatCurrency(r.value) },
            ],
            rows: bySource,
          }}
        >
          <RankBars rows={bySource} format={formatCurrency} />
        </ChartCard>
      </div>

      <Card>
        <CardHeader
          title="Attribution"
          description="Every booking and payment traced back to source, campaign and UTM"
          action={
            <Segmented
              size="xs"
              value={group}
              onChange={setGroup}
              items={[
                { value: "campaign", label: "Campaign" },
                { value: "source", label: "Source" },
              ]}
            />
          }
        />
        <div className="flex flex-wrap items-center gap-3 px-5 pb-3">
          <span className="text-xs font-medium text-fg-2">Model</span>
          <Segmented
            size="xs"
            value={model}
            onChange={setModel}
            items={[
              { value: "first", label: "First-touch" },
              { value: "last", label: "Last-touch" },
              { value: "linear", label: "Linear" },
            ]}
          />
          <span className="inline-flex items-center gap-1 text-xs text-muted">
            <Info className="size-3.5 shrink-0" aria-hidden /> {modelHelp[model]}
          </span>
        </div>
        <div className="scroll-thin overflow-x-auto">
          <table className="w-full min-w-[880px] text-sm">
            <thead className="border-y border-line bg-surface-2 text-xs text-muted">
              <tr>
                <th scope="col" className="px-5 py-2 text-left font-medium">Source / campaign</th>
                <th scope="col" className="px-3 py-2 text-left font-medium">UTM (source / medium / campaign)</th>
                <th scope="col" className="px-3 py-2 text-right font-medium">Leads</th>
                <th scope="col" className="px-3 py-2 text-right font-medium">Bookings</th>
                <th scope="col" className="px-3 py-2 text-right font-medium">Revenue</th>
                <th scope="col" className="px-3 py-2 text-right font-medium">Cost</th>
                <th scope="col" className="px-5 py-2 text-right font-medium">ROI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {grouped.map((r) => {
                const roi = r.cost ? (r.revenue - r.cost) / r.cost : null;
                return (
                  <tr key={r.id} className="hover:bg-surface-2/60">
                    <td className="px-5 py-2.5">
                      <div className="font-medium text-fg">{group === "campaign" ? r.campaign : r.source}</div>
                      {group === "campaign" && <div className="text-xs text-muted">{r.source}</div>}
                    </td>
                    <td className="px-3 py-2.5 font-mono text-xs text-fg-2">{r.utm}</td>
                    <td className="px-3 py-2.5 text-right tabular">{formatNumber(r.leads)}</td>
                    <td className="px-3 py-2.5 text-right tabular">{formatNumber(r.bookings)}</td>
                    <td className="px-3 py-2.5 text-right font-medium tabular">{formatCurrency(r.revenue)}</td>
                    <td className="px-3 py-2.5 text-right text-fg-2 tabular">{r.cost ? formatCurrency(r.cost) : "—"}</td>
                    <td className="px-5 py-2.5 text-right tabular">
                      {roi === null ? (
                        <Badge>No ad cost</Badge>
                      ) : (
                        <span className={cn("font-medium", roi < 2 ? "text-warning" : "text-fg")}>
                          {roi.toFixed(1)}×{roi < 2 && <span className="sr-only"> (below target)</span>}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="border-t border-line-strong bg-surface-2 text-sm font-semibold">
              <tr>
                <td className="px-5 py-2.5" colSpan={2}>
                  Total
                </td>
                <td className="px-3 py-2.5 text-right tabular">{formatNumber(totals.leads)}</td>
                <td className="px-3 py-2.5 text-right tabular">{formatNumber(totals.bookings)}</td>
                <td className="px-3 py-2.5 text-right tabular">{formatCurrency(totals.revenue)}</td>
                <td className="px-3 py-2.5 text-right tabular">{formatCurrency(totals.cost)}</td>
                <td className="px-5 py-2.5 text-right tabular">{((totals.revenue - totals.cost) / totals.cost).toFixed(1)}×</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>
    </div>
  );
}
