"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const axis = {
  stroke: "var(--chart-axis)",
  tick: { fill: "var(--chart-axis)", fontSize: 11 },
  tickLine: false,
  axisLine: false,
} as const;

/**
 * Single-series line with a fixed y-domain. The shared LineTrend always starts
 * at 0, which flattens a 4.4 → 4.8★ rating trend into a straight line.
 */
export function DomainLine({
  data,
  xKey,
  yKey,
  label,
  domain,
  height = 180,
  format = (v: number) => String(v),
  color = "var(--chart-1)",
}: {
  data: object[];
  xKey: string;
  yKey: string;
  label: string;
  domain: [number, number];
  height?: number;
  format?: (v: number) => string;
  color?: string;
}) {
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
          <XAxis dataKey={xKey} {...axis} minTickGap={12} />
          <YAxis {...axis} domain={domain} tickFormatter={format} width={44} tickCount={5} />
          <Tooltip
            cursor={{ stroke: "var(--chart-axis)", strokeDasharray: "3 3" }}
            content={({ active, payload, label: l }) =>
              active && payload?.length ? (
                <div className="rounded-lg border border-line bg-surface px-3 py-2 text-xs shadow-pop">
                  <div className="mb-1 font-medium text-fg">{l}</div>
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full" style={{ background: color }} />
                    <span className="text-muted">{label}</span>
                    <span className="ml-auto pl-3 font-medium text-fg tabular">{format(Number(payload[0].value))}</span>
                  </div>
                </div>
              ) : null
            }
          />
          <Line type="monotone" dataKey={yKey} name={label} stroke={color} strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--surface)" }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
