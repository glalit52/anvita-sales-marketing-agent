"use client";

import { ChartColumn, Search, Star, Table2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Card, CardBody, CardHeader, ChannelIcon, Segmented } from "@/components/ui";
import { cn } from "@/lib/cn";
import { reviewPlatformMeta, type ReviewPlatform } from "@/lib/mock/growth";

/* ------------------------------------------------------------------ */
/* Chart card with an accessible "View as table" toggle                */
/* ------------------------------------------------------------------ */

export interface TableColumn<Row> {
  key: string;
  label: string;
  align?: "left" | "right";
  render?: (row: Row) => ReactNode;
}

export function SimpleTable<Row extends object>({
  columns,
  rows,
  caption,
  className,
}: {
  columns: TableColumn<Row>[];
  rows: Row[];
  caption?: string;
  className?: string;
}) {
  return (
    <div className={cn("scroll-thin overflow-x-auto rounded-lg border border-line", className)}>
      <table className="w-full min-w-[420px] text-sm">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead className="bg-surface-2 text-xs text-muted">
          <tr>
            {columns.map((c) => (
              <th key={c.key} scope="col" className={cn("px-3 py-2 font-medium whitespace-nowrap", c.align === "right" ? "text-right" : "text-left")}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((row, i) => (
            <tr key={i} className="hover:bg-surface-2/60">
              {columns.map((c) => (
                <td key={c.key} className={cn("px-3 py-2 whitespace-nowrap text-fg-2", c.align === "right" && "text-right tabular")}>
                  {c.render ? c.render(row) : String((row as Record<string, unknown>)[c.key] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ChartCard<Row extends object>({
  title,
  description,
  legend,
  extra,
  table,
  children,
  className,
  footer,
}: {
  title: ReactNode;
  description?: ReactNode;
  legend?: ReactNode;
  extra?: ReactNode;
  table: { columns: TableColumn<Row>[]; rows: Row[] };
  children: ReactNode;
  className?: string;
  footer?: ReactNode;
}) {
  const [view, setView] = useState<"chart" | "table">("chart");
  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader
        title={title}
        description={description}
        action={
          <>
            {extra}
            <Segmented
              size="xs"
              value={view}
              onChange={setView}
              items={[
                { value: "chart", label: <span className="sr-only sm:not-sr-only">Chart</span>, icon: <ChartColumn aria-hidden /> },
                { value: "table", label: <span className="sr-only sm:not-sr-only">Table</span>, icon: <Table2 aria-hidden /> },
              ]}
            />
          </>
        }
      />
      <CardBody className="flex-1">
        {view === "chart" ? (
          <>
            {legend && <div className="mb-3">{legend}</div>}
            {children}
          </>
        ) : (
          <SimpleTable columns={table.columns} rows={table.rows} caption={typeof title === "string" ? title : undefined} />
        )}
        {footer}
      </CardBody>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Ratings & platform marks                                            */
/* ------------------------------------------------------------------ */

export function Stars({ value, size = "sm", className }: { value: number; size?: "xs" | "sm" | "md"; className?: string }) {
  const px = { xs: "size-3", sm: "size-3.5", md: "size-5" }[size];
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)} role="img" aria-label={`${value.toFixed(1)} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => {
        const fill = Math.max(0, Math.min(1, value - (i - 1)));
        return (
          <span key={i} className={cn("relative inline-block", px)}>
            <Star className={cn("absolute inset-0 text-line-strong", px)} aria-hidden />
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <Star className={cn("fill-accent text-accent", px)} aria-hidden />
            </span>
          </span>
        );
      })}
    </span>
  );
}

export function ReviewPlatformMark({ platform, size = "sm" }: { platform: ReviewPlatform; size?: "xs" | "sm" | "md" }) {
  const meta = reviewPlatformMeta[platform];
  const box = { xs: "size-4 text-[8px] rounded", sm: "size-6 text-[10px] rounded-md", md: "size-8 text-xs rounded-lg" }[size];
  return (
    <span title={meta.label} className={cn("inline-flex shrink-0 items-center justify-center font-bold", box, meta.className)}>
      {meta.mark}
    </span>
  );
}

const adMarks = {
  google: { mark: "G", label: "Google Ads", className: "bg-[#4285f4]/15 text-[#4285f4]" },
  meta: { mark: "M", label: "Meta Ads", className: "bg-[#0866ff]/15 text-[#2f7dff]" },
} as const;

export function AdPlatformMark({ platform, size = "sm" }: { platform: string; size?: "xs" | "sm" | "md" }) {
  if (platform === "linkedin") return <ChannelIcon channel="linkedin" size={size} />;
  const box = { xs: "size-4 text-[8px] rounded [&_svg]:size-2.5", sm: "size-6 text-[10px] rounded-md [&_svg]:size-3.5", md: "size-8 text-xs rounded-lg [&_svg]:size-4" }[size];
  if (platform === "ga4" || platform === "gsc") {
    return (
      <span title={platform === "ga4" ? "Google Analytics 4" : "Search Console"} className={cn("inline-flex shrink-0 items-center justify-center bg-accent-soft text-warning", box)}>
        {platform === "ga4" ? <ChartColumn /> : <Search />}
      </span>
    );
  }
  const meta = adMarks[platform as keyof typeof adMarks];
  return (
    <span title={meta.label} className={cn("inline-flex shrink-0 items-center justify-center font-bold", box, meta.className)}>
      {meta.mark}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Simulated AI streaming                                              */
/* ------------------------------------------------------------------ */

/**
 * Streams `text` word by word into state, to mimic an LLM response.
 * Returns [current text, streaming?, start(text, onDone?)].
 */
export function useStream(speed = 28) {
  const [text, setText] = useState("");
  const [streaming, setStreaming] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearInterval(timer.current);
  }, []);

  const start = useCallback(
    (full: string, onDone?: (full: string) => void) => {
      if (timer.current) clearInterval(timer.current);
      const words = full.split(/(\s+)/);
      let i = 0;
      setText("");
      setStreaming(true);
      timer.current = setInterval(() => {
        i += 2;
        setText(words.slice(0, i).join(""));
        if (i >= words.length) {
          if (timer.current) clearInterval(timer.current);
          setStreaming(false);
          onDone?.(full);
        }
      }, speed);
    },
    [speed],
  );

  return [text, streaming, start, setText] as const;
}

/** A small "AI" pill used next to generated content. */
export function AiPill({ children = "AI" }: { children?: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-ai-soft px-1.5 py-0.5 text-[10px] font-semibold text-ai">{children}</span>
  );
}

/** Confidence meter with text, never color alone. */
export function Confidence({ value }: { value: number }) {
  const label = value >= 85 ? "High" : value >= 70 ? "Medium" : "Low";
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted" title={`AI confidence ${value}%`}>
      <span className="flex gap-0.5" aria-hidden>
        {[0, 1, 2].map((i) => (
          <span key={i} className={cn("h-2.5 w-1 rounded-full", value >= [50, 70, 85][i] ? "bg-ai" : "bg-surface-3")} />
        ))}
      </span>
      {label} · {value}%
    </span>
  );
}

/**
 * Ranked horizontal bars for long category labels (label above bar, value right).
 * One series → one hue (chart-1). Hover shows the exact value via title.
 */
export function RankBars({
  rows,
  format = (v: number) => v.toLocaleString("en-IN"),
  max,
  color = "var(--chart-1)",
}: {
  rows: { label: ReactNode; value: number; key: string; note?: ReactNode }[];
  format?: (v: number) => string;
  max?: number;
  color?: string;
}) {
  const top = max ?? Math.max(...rows.map((r) => r.value), 1);
  return (
    <ul className="space-y-2.5">
      {rows.map((r) => (
        <li key={r.key} title={`${typeof r.label === "string" ? r.label : r.key}: ${format(r.value)}`}>
          <div className="mb-1 flex items-baseline justify-between gap-3 text-xs">
            <span className="min-w-0 truncate font-medium text-fg-2">{r.label}</span>
            <span className="shrink-0 text-fg tabular">
              {format(r.value)}
              {r.note && <span className="ml-2 text-muted">{r.note}</span>}
            </span>
          </div>
          <div className="h-2 rounded-full bg-surface-2">
            <div className="h-full rounded-full" style={{ width: `${Math.max((r.value / top) * 100, 1.5)}%`, background: color }} />
          </div>
        </li>
      ))}
    </ul>
  );
}
