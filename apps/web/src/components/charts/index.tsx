"use client";

import type { ReactNode } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "@/lib/cn";

/**
 * Chart conventions (see dataviz skill):
 * - Categorical colors come from --chart-1..6 in fixed order; never cycled.
 * - Thin marks: 2px lines, rounded bar ends, recessive grid/axes.
 * - Every chart ships a hover tooltip; ≥2 series always get a legend.
 * - Text uses text tokens, never the series color.
 */
export const series = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)", "var(--chart-6)"];

const axisProps = {
  stroke: "var(--chart-axis)",
  tick: { fill: "var(--chart-axis)", fontSize: 11 },
  tickLine: false,
  axisLine: false,
} as const;

export interface SeriesDef {
  key: string;
  label: string;
  color?: string;
}

interface TooltipPayloadItem {
  dataKey?: string | number;
  name?: string | number;
  value?: number | string;
  color?: string;
}

function ChartTooltip({
  active,
  payload,
  label,
  format,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string | number;
  format?: (v: number) => string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-line bg-surface px-3 py-2 text-xs shadow-pop">
      <div className="mb-1 font-medium text-fg">{label}</div>
      {payload.map((p) => (
        <div key={String(p.dataKey)} className="flex items-center gap-2 py-0.5">
          <span className="size-2 rounded-full" style={{ background: p.color }} />
          <span className="text-muted">{p.name}</span>
          <span className="ml-auto pl-3 font-medium text-fg tabular">
            {typeof p.value === "number" && format ? format(p.value) : p.value}
          </span>
        </div>
      ))}
    </div>
  );
}

export function ChartLegend({ items, className }: { items: SeriesDef[]; className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-fg-2", className)}>
      {items.map((s, i) => (
        <span key={s.key} className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-sm" style={{ background: s.color ?? series[i] }} />
          {s.label}
        </span>
      ))}
    </div>
  );
}

function Frame({ height, children }: { height: number; children: ReactNode }) {
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        {children as React.ReactElement}
      </ResponsiveContainer>
    </div>
  );
}

export function AreaTrend({
  data,
  xKey,
  series: defs,
  height = 240,
  format,
  stacked,
}: {
  data: object[];
  xKey: string;
  series: SeriesDef[];
  height?: number;
  format?: (v: number) => string;
  stacked?: boolean;
}) {
  return (
    <Frame height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
        <defs>
          {defs.map((s, i) => (
            <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={s.color ?? series[i]} stopOpacity={0.22} />
              <stop offset="100%" stopColor={s.color ?? series[i]} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
        <XAxis dataKey={xKey} {...axisProps} minTickGap={16} />
        <YAxis {...axisProps} tickFormatter={format} width={52} />
        <Tooltip content={<ChartTooltip format={format} />} cursor={{ stroke: "var(--chart-axis)", strokeDasharray: "3 3" }} />
        {defs.map((s, i) => (
          <Area
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.label}
            stackId={stacked ? "a" : undefined}
            stroke={s.color ?? series[i]}
            strokeWidth={2}
            fill={`url(#grad-${s.key})`}
            activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--surface)" }}
          />
        ))}
      </AreaChart>
    </Frame>
  );
}

export function LineTrend({
  data,
  xKey,
  series: defs,
  height = 240,
  format,
}: {
  data: object[];
  xKey: string;
  series: SeriesDef[];
  height?: number;
  format?: (v: number) => string;
}) {
  return (
    <Frame height={height}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
        <XAxis dataKey={xKey} {...axisProps} minTickGap={16} />
        <YAxis {...axisProps} tickFormatter={format} width={52} />
        <Tooltip content={<ChartTooltip format={format} />} cursor={{ stroke: "var(--chart-axis)", strokeDasharray: "3 3" }} />
        {defs.map((s, i) => (
          <Line
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.label}
            stroke={s.color ?? series[i]}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--surface)" }}
          />
        ))}
      </LineChart>
    </Frame>
  );
}

export function BarCompare({
  data,
  xKey,
  series: defs,
  height = 240,
  format,
  stacked,
  horizontal,
}: {
  data: object[];
  xKey: string;
  series: SeriesDef[];
  height?: number;
  format?: (v: number) => string;
  stacked?: boolean;
  horizontal?: boolean;
}) {
  return (
    <Frame height={height}>
      <BarChart
        data={data}
        layout={horizontal ? "vertical" : "horizontal"}
        margin={{ top: 8, right: 8, left: horizontal ? 8 : -12, bottom: 0 }}
        barGap={2}
      >
        <CartesianGrid vertical={horizontal} horizontal={!horizontal} stroke="var(--chart-grid)" />
        {horizontal ? (
          <>
            <XAxis type="number" {...axisProps} tickFormatter={format} />
            <YAxis type="category" dataKey={xKey} {...axisProps} width={110} />
          </>
        ) : (
          <>
            <XAxis dataKey={xKey} {...axisProps} />
            <YAxis {...axisProps} tickFormatter={format} width={52} />
          </>
        )}
        <Tooltip content={<ChartTooltip format={format} />} cursor={{ fill: "var(--surface-2)" }} />
        {defs.map((s, i) => (
          <Bar
            key={s.key}
            dataKey={s.key}
            name={s.label}
            stackId={stacked ? "a" : undefined}
            fill={s.color ?? series[i]}
            radius={stacked ? 0 : horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]}
            maxBarSize={28}
            stroke="var(--surface)"
            strokeWidth={stacked ? 2 : 0}
          />
        ))}
      </BarChart>
    </Frame>
  );
}

/** Tiny inline trend for stat tiles and table rows. */
export function Sparkline({ data, color = "var(--chart-1)", height = 32 }: { data: number[]; color?: string; height?: number }) {
  const points = data.map((v, i) => ({ i, v }));
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={points} margin={{ top: 2, right: 0, left: 0, bottom: 2 }}>
          <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} fill={color} fillOpacity={0.08} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Funnel as horizontal ordinal bars (one hue, label + value always visible). */
export function FunnelBars({ steps, format = (v: number) => v.toLocaleString("en-IN") }: { steps: { label: string; value: number }[]; format?: (v: number) => string }) {
  const max = Math.max(...steps.map((s) => s.value), 1);
  return (
    <div className="space-y-2.5">
      {steps.map((s, i) => {
        const prev = steps[i - 1]?.value;
        const conv = prev ? (s.value / prev) * 100 : undefined;
        return (
          <div key={s.label} title={`${s.label}: ${format(s.value)}`}>
            <div className="mb-1 flex items-baseline justify-between text-xs">
              <span className="font-medium text-fg-2">{s.label}</span>
              <span className="text-fg tabular">
                {format(s.value)}
                {conv !== undefined && <span className="ml-2 text-muted">{conv.toFixed(0)}%</span>}
              </span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-surface-2">
              <div className="h-full rounded-full bg-chart-1" style={{ width: `${(s.value / max) * 100}%`, opacity: 1 - i * 0.12 }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
