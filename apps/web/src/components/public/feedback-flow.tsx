"use client";

import { Check, CircleCheck, Clock, Copy, ExternalLink, HeartHandshake, LoaderCircle, Lock, MessageCircle, PhoneCall, RefreshCw, Sparkles, Star } from "lucide-react";
import { useState } from "react";
import { Avatar, Badge, Button, Segmented, Switch, Textarea, useToast } from "@/components/ui";
import { cn } from "@/lib/cn";
import { business, feedbackById, feedbackIssues, type FeedbackRequest } from "@/lib/mock/public";
import { locationLabel } from "@/lib/mock/sell";
import { BusinessHeader, PoweredBy, StatusMedallion } from "./shared";

type Stage = "rate" | "positive" | "posted" | "negative" | "sent";
type Tone = "short" | "detailed" | "hinglish";

const LABELS = ["", "Very poor", "Poor", "Okay", "Good", "Excellent"];

function compose(req: FeedbackRequest, tone: Tone, highlights: string[]) {
  const base = req.suggestions[tone];
  if (!highlights.length) return base;
  const list = highlights.map((h) => h.toLowerCase());
  const joined = list.length > 1 ? `${list.slice(0, -1).join(", ")} and ${list[list.length - 1]}` : list[0];
  if (tone === "hinglish") return `${base} Sabse accha laga: ${joined}.`;
  return `${base} What stood out most: ${joined}.`;
}

export function FeedbackFlow({ id }: { id: string }) {
  const req = feedbackById(id)!;
  const toast = useToast();
  const [stage, setStage] = useState<Stage>("rate");
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [tone, setTone] = useState<Tone>("short");
  const [highlights, setHighlights] = useState<string[]>([]);
  const [text, setText] = useState(req.suggestions.short);
  const [regenerating, setRegenerating] = useState(false);
  const [issues, setIssues] = useState<string[]>([]);
  const [details, setDetails] = useState("");
  const [callback, setCallback] = useState(true);
  const [callTime, setCallTime] = useState<"asap" | "evening" | "tomorrow">("asap");
  const [sending, setSending] = useState(false);

  const rate = (n: number) => {
    setRating(n);
    setTimeout(() => setStage(n >= 4 ? "positive" : "negative"), 250);
  };

  const regenerate = (nextTone = tone, nextHighlights = highlights) => {
    setRegenerating(true);
    setTimeout(() => {
      setText(compose(req, nextTone, nextHighlights));
      setRegenerating(false);
    }, 650);
  };

  const postOnGoogle = () => {
    navigator.clipboard?.writeText(text).catch(() => {});
    toast({ title: "Review copied", description: "Google Reviews opened. Paste it and tap Post." });
    setStage("posted");
  };

  const submitPrivate = () => {
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setStage("sent");
    }, 900);
  };

  const shown = hover || rating;
  const loc = locationLabel[req.location];

  return (
    <div className="mx-auto w-full max-w-md px-4 pt-4 sm:pt-10">
      <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
        <div className="border-b border-line p-4">
          <BusinessHeader compact />
        </div>

        {stage === "rate" && (
          <div className="px-5 py-8 text-center">
            <Avatar name={req.provider.replace("Dr. ", "")} size="lg" className="mx-auto" />
            <h2 className="mt-4 text-xl font-semibold tracking-tight text-fg">
              Hi {req.firstName}, how was your visit with {req.providerShort}?
            </h2>
            <p className="mt-1 text-sm text-muted">
              {req.service} · {req.visit} · {loc}
            </p>
            <div className="mt-6 flex justify-center gap-1 sm:gap-2" role="radiogroup" aria-label="Rate your visit" onMouseLeave={() => setHover(0)}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  role="radio"
                  aria-checked={rating === n}
                  aria-label={`${n} star${n > 1 ? "s" : ""}, ${LABELS[n]}`}
                  onMouseEnter={() => setHover(n)}
                  onClick={() => rate(n)}
                  className="rounded-xl p-1.5 transition-transform hover:scale-110 active:scale-95"
                >
                  <Star className={cn("size-11 transition-colors sm:size-12", n <= shown ? "fill-accent text-accent" : "text-line-strong")} strokeWidth={1.5} />
                </button>
              ))}
            </div>
            <div className={cn("mt-2 h-5 text-sm font-medium", shown ? "text-fg" : "text-muted")}>{shown ? LABELS[shown] : "Tap a star to rate"}</div>
            <p className="mt-6 inline-flex items-center gap-1.5 text-xs text-muted">
              <Lock className="size-3.5" aria-hidden /> Takes 30 seconds. Your rating goes to the clinic first.
            </p>
          </div>
        )}

        {(stage === "positive" || stage === "negative") && (
          <div className="flex items-center justify-between gap-3 border-b border-line bg-surface-2/60 px-4 py-2.5">
            <span className="text-xs text-muted">Your rating</span>
            <span className="flex items-center gap-0.5" role="radiogroup" aria-label="Change rating">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} role="radio" aria-checked={rating === n} aria-label={`${n} stars`} onClick={() => rate(n)} className="p-0.5">
                  <Star className={cn("size-5", n <= rating ? "fill-accent text-accent" : "text-line-strong")} />
                </button>
              ))}
              <span className="ml-1.5 text-xs font-medium text-fg-2">{LABELS[rating]}</span>
            </span>
          </div>
        )}

        {stage === "positive" && (
          <div className="p-5">
            <div className="text-center">
              <div className="text-3xl" aria-hidden>
                🎉
              </div>
              <h2 className="mt-2 text-lg font-semibold text-fg">Thank you, {req.firstName}!</h2>
              <p className="mt-1 text-sm text-muted">Would you share this on Google? It takes 30 seconds and helps other families in Pune find a gentle dentist.</p>
            </div>

            <div className="mt-5">
              <div className="mb-2 text-xs font-medium text-fg-2">What stood out? (optional)</div>
              <div className="flex flex-wrap gap-1.5">
                {req.highlights.map((h) => {
                  const on = highlights.includes(h);
                  return (
                    <button
                      key={h}
                      aria-pressed={on}
                      onClick={() => {
                        const next = on ? highlights.filter((x) => x !== h) : [...highlights, h];
                        setHighlights(next);
                        regenerate(tone, next);
                      }}
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                        on ? "border-primary bg-primary-soft text-primary" : "border-line text-fg-2 hover:border-line-strong",
                      )}
                    >
                      {on && <Check className="size-3" aria-hidden />}
                      {h}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-5">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-fg-2">
                  <Sparkles className="size-3.5 text-ai" aria-hidden /> Suggested review
                  <Badge tone="ai">AI draft</Badge>
                </span>
                <Segmented
                  size="xs"
                  value={tone}
                  onChange={(t) => {
                    setTone(t);
                    regenerate(t);
                  }}
                  items={[
                    { value: "short", label: "Short" },
                    { value: "detailed", label: "Detailed" },
                    { value: "hinglish", label: "Hinglish" },
                  ]}
                />
              </div>
              <div className="relative">
                <Textarea
                  aria-label="Your review"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={6}
                  className={cn("min-h-36 text-base leading-relaxed sm:text-sm", regenerating && "opacity-40")}
                />
                {regenerating && (
                  <div className="absolute inset-0 flex items-center justify-center gap-2 text-sm font-medium text-ai">
                    <LoaderCircle className="size-4 animate-spin" aria-hidden /> Rewriting…
                  </div>
                )}
              </div>
              <div className="mt-1.5 flex items-center justify-between gap-2 text-[11px] text-muted">
                <span>It&apos;s your review: edit anything, or write your own.</span>
                <button onClick={() => regenerate()} className="inline-flex shrink-0 items-center gap-1 font-medium text-primary hover:underline">
                  <RefreshCw className="size-3" aria-hidden /> Rewrite
                </button>
              </div>
            </div>

            <Button size="lg" className="mt-5 h-12 w-full text-base" onClick={postOnGoogle} disabled={!text.trim() || regenerating}>
              <span className="flex size-6 items-center justify-center rounded-full bg-white text-sm font-bold text-[#4285f4]" aria-hidden>
                G
              </span>
              Post on Google
            </Button>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  navigator.clipboard?.writeText(text).catch(() => {});
                  toast({ title: "Copied to clipboard" });
                }}
              >
                <Copy /> Copy text
              </Button>
              <Button variant="ghost" onClick={() => toast({ title: "No problem!", description: "Thanks for the rating. See you at your next check-up.", tone: "info" })}>
                Maybe later
              </Button>
            </div>
            <p className="mt-3 text-center text-[11px] text-muted">We copy your text so you can paste it on Google. Smile Dental never posts on your behalf.</p>
          </div>
        )}

        {stage === "posted" && (
          <div className="p-5 text-center">
            <StatusMedallion tone="success" icon={<CircleCheck />} />
            <h2 className="mt-4 text-lg font-semibold text-fg">Almost done! Paste &amp; post</h2>
            <p className="mx-auto mt-1 max-w-xs text-sm text-muted">Your review is copied. In the Google tab, long-press the text box, tap Paste, then Post.</p>
            <div className="mt-5 rounded-xl border border-line p-4 text-left">
              <div className="flex items-center gap-2.5">
                <Avatar name={req.customer} size="sm" />
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-fg">{req.customer}</div>
                  <div className="text-[11px] text-muted">Posting publicly on Google · {business.name}, {loc}</div>
                </div>
              </div>
              <div className="mt-2 flex">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star key={n} className={cn("size-4", n <= rating ? "fill-accent text-accent" : "text-line-strong")} aria-hidden />
                ))}
              </div>
              <p className="mt-1.5 line-clamp-5 text-sm text-fg-2">{text}</p>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={() => toast({ title: "Opening Google Reviews", description: `${business.name}, ${loc}`, tone: "info" })}>
                <ExternalLink /> Open Google
              </Button>
              <Button variant="ghost" onClick={() => setStage("positive")}>
                Edit review
              </Button>
            </div>
            <p className="mt-4 text-xs text-muted">Thank you for supporting a local clinic 💜</p>
          </div>
        )}

        {stage === "negative" && (
          <div className="p-5">
            <h2 className="text-lg font-semibold text-fg">We&apos;re sorry, {req.firstName}. What went wrong?</h2>
            <p className="mt-1 flex items-start gap-1.5 text-sm text-muted">
              <Lock className="mt-0.5 size-3.5 shrink-0" aria-hidden />
              This goes privately to {req.manager}, our clinic manager. It is not posted online.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {feedbackIssues.map((i) => {
                const on = issues.includes(i);
                return (
                  <button
                    key={i}
                    aria-pressed={on}
                    onClick={() => setIssues((prev) => (on ? prev.filter((x) => x !== i) : [...prev, i]))}
                    className={cn(
                      "inline-flex h-10 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium transition-colors",
                      on ? "border-danger bg-danger-soft text-danger" : "border-line text-fg-2 hover:border-line-strong",
                    )}
                  >
                    {on && <Check className="size-3.5" aria-hidden />}
                    {i}
                  </button>
                );
              })}
            </div>
            <label htmlFor="fb-details" className="mt-5 mb-1.5 block text-sm font-medium text-fg">
              Tell us more {!issues.includes("Other") && <span className="font-normal text-muted">(optional)</span>}
            </label>
            <Textarea
              id="fb-details"
              rows={4}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="e.g. I waited 40 minutes past my appointment and nobody told me why."
              className="text-base sm:text-sm"
            />

            <div className="mt-4 rounded-xl border border-line p-3.5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-1.5 text-sm font-medium text-fg">
                    <PhoneCall className="size-4 text-primary" aria-hidden /> Request a call back
                  </div>
                  <div className="mt-0.5 text-xs text-muted">On {req.phone}</div>
                </div>
                <Switch checked={callback} onChange={setCallback} label="Request a call back" />
              </div>
              {callback && (
                <div className="mt-3 grid grid-cols-3 gap-1 rounded-lg bg-surface-2 p-0.5" role="radiogroup" aria-label="Preferred call time">
                  {(
                    [
                      ["asap", "Within 2 hrs"],
                      ["evening", "This evening"],
                      ["tomorrow", "Tomorrow"],
                    ] as const
                  ).map(([v, l]) => (
                    <button
                      key={v}
                      role="radio"
                      aria-checked={callTime === v}
                      onClick={() => setCallTime(v)}
                      className={cn(
                        "rounded-md px-1 py-1.5 text-xs font-medium transition-colors",
                        callTime === v ? "bg-surface text-fg shadow-card" : "text-muted hover:text-fg",
                      )}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Button size="lg" className="mt-5 w-full" disabled={(issues.length === 0 && !details.trim()) || sending} onClick={submitPrivate}>
              {sending ? (
                <>
                  <LoaderCircle className="animate-spin" /> Sending…
                </>
              ) : (
                "Send privately to the clinic"
              )}
            </Button>
          </div>
        )}

        {stage === "sent" && (
          <div className="p-5">
            <div className="text-center">
              <StatusMedallion tone="info" icon={<HeartHandshake />} />
              <h2 className="mt-4 text-lg font-semibold text-fg">Thank you for telling us, {req.firstName}</h2>
              <p className="mx-auto mt-1 max-w-xs text-sm text-muted">
                {callback
                  ? callTime === "asap"
                    ? `${req.manager}, the clinic manager, will call you within 2 hours.`
                    : `${req.manager}, the clinic manager, will call you ${callTime === "evening" ? "this evening between 6 and 8 PM" : "tomorrow morning"}.`
                  : `${req.manager}, the clinic manager, will read this personally and reply on WhatsApp today.`}
              </p>
            </div>
            <ol className="mt-5 space-y-3 rounded-xl border border-line p-4">
              <TimelineRow done title="Feedback received" sub="Today, 11:31 AM · Ref FB-2093" />
              <TimelineRow done title={`${req.manager} alerted`} sub="Sent to her WhatsApp and the clinic inbox" />
              <TimelineRow
                title={callback ? `Call back ${callTime === "asap" ? "by 1:30 PM" : callTime === "evening" ? "6–8 PM today" : "tomorrow, 10 AM–12 PM"}` : "Reply on WhatsApp today"}
                sub={callback ? `From ${business.phone}` : `From ${business.whatsapp}`}
              />
            </ol>
            <div className="mt-4 flex items-start gap-2 rounded-xl bg-surface-2 px-3.5 py-3 text-xs text-fg-2">
              <MessageCircle className="mt-px size-4 shrink-0 text-muted" aria-hidden />
              <span>We&apos;ve also sent you a copy on WhatsApp. If anything gets worse (pain, swelling or bleeding), please call {business.phone} right away.</span>
            </div>
            <p className="mt-4 text-center text-[11px] text-muted">
              You&apos;re always welcome to leave a public review too.{" "}
              <button className="font-medium text-primary hover:underline" onClick={() => toast({ title: "Opening Google Reviews", tone: "info" })}>
                Review on Google
              </button>
            </p>
          </div>
        )}
      </div>
      <PoweredBy />
    </div>
  );
}

function TimelineRow({ done, title, sub }: { done?: boolean; title: string; sub: string }) {
  return (
    <li className="flex items-start gap-3">
      <span
        className={cn("mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full", done ? "bg-success-soft text-success" : "bg-warning-soft text-warning")}
        aria-label={done ? "Done" : "Pending"}
      >
        {done ? <Check className="size-3.5" /> : <Clock className="size-3.5" />}
      </span>
      <div className="min-w-0">
        <div className="text-sm font-medium text-fg">{title}</div>
        <div className="text-xs text-muted">{sub}</div>
      </div>
    </li>
  );
}
