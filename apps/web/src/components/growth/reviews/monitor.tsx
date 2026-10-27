"use client";

import { Funnel, MapPin, Minus, RefreshCw, Reply, Search, Send, ShieldAlert, Sparkles, Star, ThumbsDown, ThumbsUp } from "lucide-react";
import { useMemo, useState } from "react";
import { LineTrend } from "@/components/charts";
import { AiCallout, Avatar, Badge, Button, Card, CardHeader, EmptyState, Input, Segmented, Select, Textarea, useToast, type Tone } from "@/components/ui";
import { cn } from "@/lib/cn";
import { formatNumber } from "@/lib/format";
import {
  ratingDistribution,
  reviewPlatformMeta,
  reviewPlatformStats,
  reviews as reviewsSeed,
  reviewTopicStats,
  reviewTrend,
  type Review,
  type ReviewPlatform,
  type Sentiment,
} from "@/lib/mock/growth";
import { ChartCard, Confidence, ReviewPlatformMark, Stars, useStream } from "../shared";
import { DomainLine } from "./rating-chart";

const sentimentMeta: Record<Sentiment, { tone: Tone; icon: typeof ThumbsUp; label: string }> = {
  positive: { tone: "success", icon: ThumbsUp, label: "Positive" },
  neutral: { tone: "neutral", icon: Minus, label: "Neutral" },
  negative: { tone: "danger", icon: ThumbsDown, label: "Negative" },
};

const totalReviews = ratingDistribution.reduce((a, r) => a + r.count, 0);
const overall = ratingDistribution.reduce((a, r) => a + r.stars * r.count, 0) / totalReviews;

export function ReviewsMonitor() {
  const [list, setList] = useState(reviewsSeed);
  const [platform, setPlatform] = useState<"all" | ReviewPlatform>("all");
  const [rating, setRating] = useState<"all" | "positive" | "3" | "negative">("all");
  const [replied, setReplied] = useState<"all" | "unreplied" | "replied">("unreplied");
  const [sentiment, setSentiment] = useState<"all" | Sentiment>("all");
  const [q, setQ] = useState("");

  const filtered = useMemo(
    () =>
      list.filter(
        (r) =>
          (platform === "all" || r.platform === platform) &&
          (rating === "all" || (rating === "positive" ? r.rating >= 4 : rating === "negative" ? r.rating <= 2 : r.rating === 3)) &&
          (replied === "all" || (replied === "replied" ? !!r.reply : !r.reply)) &&
          (sentiment === "all" || r.sentiment === sentiment) &&
          (!q || `${r.author} ${r.text} ${r.topics.join(" ")}`.toLowerCase().includes(q.toLowerCase())),
      ),
    [list, platform, rating, replied, sentiment, q],
  );
  const unreplied = list.filter((r) => !r.reply).length;

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="flex flex-col p-5">
          <div className="flex items-start gap-5">
            <div>
              <div className="text-4xl font-semibold tracking-tight tabular">{overall.toFixed(1)}</div>
              <Stars value={overall} size="sm" className="mt-1" />
              <div className="mt-1 text-xs text-muted">{formatNumber(totalReviews)} reviews · all platforms</div>
            </div>
            <div className="min-w-0 flex-1 space-y-1.5" aria-label="Rating distribution">
              {ratingDistribution.map((r) => (
                <div key={r.stars} className="flex items-center gap-2 text-xs" title={`${r.stars} stars: ${r.count} reviews`}>
                  <span className="inline-flex w-6 items-center gap-0.5 text-fg-2 tabular">
                    {r.stars}
                    <Star className="size-3 fill-accent text-accent" aria-hidden />
                  </span>
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-surface-2">
                    <span className="block h-full rounded-full bg-chart-1" style={{ width: `${(r.count / ratingDistribution[0].count) * 100}%` }} />
                  </span>
                  <span className="w-10 text-right text-muted tabular">{formatNumber(r.count)}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="min-h-4 flex-1" />
          <dl className="grid grid-cols-3 gap-2 border-t border-line pt-3 text-center">
            {[
              { label: "New · 30d", value: "70" },
              { label: "Replied", value: "92%" },
              { label: "Avg reply time", value: "2h 10m" },
            ].map((s) => (
              <div key={s.label}>
                <dt className="text-[11px] text-muted">{s.label}</dt>
                <dd className="text-sm font-semibold tabular">{s.value}</dd>
              </div>
            ))}
          </dl>
        </Card>
        <div className="grid grid-cols-2 gap-3 lg:col-span-2">
          {reviewPlatformStats.map((p) => (
            <Card key={p.platform} className="p-4">
              <div className="flex items-center gap-2">
                <ReviewPlatformMark platform={p.platform} />
                <span className="text-sm font-medium">{reviewPlatformMeta[p.platform].label}</span>
                <span className="ml-auto hidden text-xs text-muted sm:inline">+{p.newThisMonth} this month</span>
              </div>
              <div className="mt-2 flex flex-wrap items-baseline gap-x-2">
                <span className="text-2xl font-semibold tabular">{p.rating.toFixed(1)}</span>
                <Stars value={p.rating} size="xs" />
              </div>
              <div className="mt-1 flex flex-wrap justify-between gap-x-2 text-xs text-muted">
                <span>{formatNumber(p.count)} reviews</span>
                <span className={cn(p.responseRate < 75 && "font-medium text-warning")}>{p.responseRate}% replied</span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Trend: two small charts, not dual-axis */}
      <div className="grid gap-4 md:grid-cols-2">
        <ChartCard
          title="Average rating"
          description="Monthly average, all platforms (axis starts at 4.0)"
          table={{ columns: [{ key: "month", label: "Month" }, { key: "avg", label: "Avg rating", align: "right", render: (r) => r.avg.toFixed(2) }], rows: reviewTrend }}
        >
          <DomainLine data={reviewTrend} xKey="month" yKey="avg" label="Avg rating" domain={[4, 5]} format={(v) => v.toFixed(1)} />
        </ChartCard>
        <ChartCard
          title="New reviews per month"
          description="Up 2.3× since automated requests went live in April"
          table={{ columns: [{ key: "month", label: "Month" }, { key: "count", label: "New reviews", align: "right" }], rows: reviewTrend }}
        >
          <LineTrend data={reviewTrend} xKey="month" series={[{ key: "count", label: "New reviews" }]} height={180} />
        </ChartCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        {/* Feed */}
        <Card className="xl:col-span-2">
          <CardHeader
            title={
              <span className="inline-flex items-center gap-2">
                Review feed {unreplied > 0 && <Badge tone="warning">{unreplied} need a reply</Badge>}
              </span>
            }
            description="AI drafts a reply for every review. Positive ones can auto-post; complaints always wait for you."
          />
          <div className="flex flex-wrap items-center gap-2 border-b border-line px-5 pb-3">
            <Segmented
              size="xs"
              value={replied}
              onChange={setReplied}
              items={[
                { value: "unreplied", label: "Unreplied", count: unreplied },
                { value: "replied", label: "Replied" },
                { value: "all", label: "All" },
              ]}
            />
            <Funnel className="ml-1 hidden size-3.5 text-muted sm:block" aria-hidden />
            <Select aria-label="Platform" className="h-8! w-auto! text-xs!" value={platform} onChange={(e) => setPlatform(e.target.value as typeof platform)}>
              <option value="all">All platforms</option>
              {(Object.keys(reviewPlatformMeta) as ReviewPlatform[]).map((p) => (
                <option key={p} value={p}>
                  {reviewPlatformMeta[p].label}
                </option>
              ))}
            </Select>
            <Select aria-label="Rating" className="h-8! w-auto! text-xs!" value={rating} onChange={(e) => setRating(e.target.value as typeof rating)}>
              <option value="all">Any rating</option>
              <option value="positive">4–5★</option>
              <option value="3">3★</option>
              <option value="negative">1–2★</option>
            </Select>
            <Select aria-label="Sentiment" className="h-8! w-auto! text-xs!" value={sentiment} onChange={(e) => setSentiment(e.target.value as typeof sentiment)}>
              <option value="all">Any sentiment</option>
              <option value="positive">Positive</option>
              <option value="neutral">Neutral</option>
              <option value="negative">Negative</option>
            </Select>
            <Input icon={<Search />} aria-label="Search reviews" placeholder="Search…" className="w-full sm:ml-auto sm:w-44 [&_input]:h-8 [&_input]:text-xs" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          {filtered.length === 0 ? (
            <EmptyState
              icon={<Reply />}
              title="No reviews match these filters"
              description={replied === "unreplied" ? "Inbox zero: every review has a reply. 🎉" : "Try clearing a filter."}
              action={
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setPlatform("all");
                    setRating("all");
                    setReplied("all");
                    setSentiment("all");
                    setQ("");
                  }}
                >
                  Clear filters
                </Button>
              }
            />
          ) : (
            <ul className="divide-y divide-line">
              {filtered.map((r) => (
                <ReviewItem key={r.id} review={r} onReplied={(reply) => setList((l) => l.map((x) => (x.id === r.id ? { ...x, reply } : x)))} />
              ))}
            </ul>
          )}
        </Card>

        {/* Topic insights */}
        <div className="space-y-4">
          <AiCallout title="Wait time is mentioned in 18% of negative reviews">
            Mostly Saturdays at Baner (11 of 14 mentions). Patients who were updated about delays on WhatsApp rated 0.8★ higher on average.
          </AiCallout>
          <ChartCard
            title="Topics"
            description="Share of mentions that are negative, last 90 days"
            table={{
              columns: [
                { key: "topic", label: "Topic" },
                { key: "positive", label: "Positive", align: "right" },
                { key: "negative", label: "Negative", align: "right" },
                { key: "share", label: "% negative", align: "right", render: (r) => `${((r.negative / (r.positive + r.negative)) * 100).toFixed(0)}%` },
              ],
              rows: reviewTopicStats,
            }}
          >
            <ul className="space-y-2.5">
              {[...reviewTopicStats]
                .sort((a, b) => b.negative / (b.positive + b.negative) - a.negative / (a.positive + a.negative))
                .map((t) => {
                  const total = t.positive + t.negative;
                  const neg = (t.negative / total) * 100;
                  return (
                    <li key={t.topic} title={`${t.topic}: ${t.negative} negative of ${total} mentions`}>
                      <div className="mb-1 flex items-baseline justify-between text-xs">
                        <span className="font-medium text-fg-2 capitalize">{t.topic}</span>
                        <span className="text-fg tabular">
                          {neg.toFixed(0)}% <span className="text-muted">of {total}</span>
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-surface-2">
                        <div className="h-full rounded-full bg-chart-1" style={{ width: `${Math.max(neg, 2)}%` }} />
                      </div>
                    </li>
                  );
                })}
            </ul>
          </ChartCard>
        </div>
      </div>
    </div>
  );
}

function ReviewItem({ review: r, onReplied }: { review: Review; onReplied: (reply: string) => void }) {
  const toast = useToast();
  const [draft, setDraft] = useState(r.aiDraft);
  const [streamed, streaming, start] = useStream(26);
  const [variant, setVariant] = useState(0);
  const s = sentimentMeta[r.sentiment];

  function regenerate() {
    const alts = [
      r.aiDraft,
      `Thank you for taking the time to share this, ${r.author.split(" ")[0]}. ${r.rating >= 4 ? "Feedback like yours makes our team's day!" : "We hear you and we're already working on it."} Message us on WhatsApp anytime. – Team Smile Dental`,
      `${r.author.split(" ")[0]} ji, dhanyavaad! 🙏 ${r.rating >= 4 ? "We're so happy you had a great visit." : "We're sorry we fell short and would like to make it right."} – Smile Dental, ${r.location}`,
    ];
    const next = alts[(variant + 1) % alts.length];
    setVariant((v) => v + 1);
    start(next, setDraft);
  }

  return (
    <li className="px-5 py-4">
      <div className="flex items-start gap-3">
        <span className="hidden sm:block">
          <Avatar name={r.author} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-sm font-semibold">{r.author}</span>
            <Stars value={r.rating} size="xs" />
            <span className="inline-flex items-center gap-1 text-xs text-muted">
              <ReviewPlatformMark platform={r.platform} size="xs" /> {reviewPlatformMeta[r.platform].label} · {r.when}
            </span>
          </div>
          <div className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted">
            <MapPin className="size-3" aria-hidden /> {r.location}
          </div>
          <p className="mt-1.5 text-sm text-fg-2">{r.text}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Badge tone={s.tone}>
              <s.icon aria-hidden /> {s.label}
            </Badge>
            {r.topics.map((t) => (
              <Badge key={t} className="capitalize">
                {t}
              </Badge>
            ))}
          </div>

          {r.reply ? (
            <div className="mt-3 rounded-lg border-l-2 border-primary bg-surface-2 px-3 py-2 text-sm">
              <div className="mb-0.5 text-xs font-medium text-muted">Reply from Smile Dental</div>
              <p className="text-fg-2">{r.reply}</p>
            </div>
          ) : (
            <div className="mt-3 rounded-xl border border-ai/20 bg-ai-soft/40 p-3">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-fg">
                  <Sparkles className="size-3.5 text-ai" aria-hidden /> AI-drafted reply
                </span>
                <Confidence value={r.confidence} />
              </div>
              {r.flagged && (
                <p className="mb-2 inline-flex items-center gap-1.5 rounded-md bg-warning-soft px-2 py-1 text-xs text-warning">
                  <ShieldAlert className="size-3.5" aria-hidden /> {r.flagged}
                </p>
              )}
              <Textarea aria-label={`Reply to ${r.author}`} rows={4} value={streaming ? streamed : draft} readOnly={streaming} onChange={(e) => setDraft(e.target.value)} className="bg-surface" />
              <div className="mt-2 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  disabled={streaming || !draft.trim()}
                  onClick={() => {
                    onReplied(draft);
                    toast({ title: `Reply posted to ${reviewPlatformMeta[r.platform].label}`, description: `${r.author} will be notified.` });
                  }}
                >
                  <Send /> Post reply
                </Button>
                <Button size="sm" variant="ghost" onClick={regenerate} disabled={streaming}>
                  <RefreshCw /> Regenerate
                </Button>
                {r.sentiment === "negative" && (
                  <Button size="sm" variant="ghost" onClick={() => toast({ title: "Private WhatsApp follow-up sent", description: `Neha will call ${r.author.split(" ")[0]} today.`, tone: "info" })}>
                    Contact privately
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </li>
  );
}
