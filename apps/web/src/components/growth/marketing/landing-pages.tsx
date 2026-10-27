"use client";

import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  CalendarCheck,
  ChevronDown,
  CircleCheck,
  Copy,
  ExternalLink,
  Globe,
  Link2,
  Monitor,
  Plus,
  Rocket,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Split,
  Star,
  WandSparkles,
} from "lucide-react";
import { useState } from "react";
import { Sparkline } from "@/components/charts";
import {
  AiCallout,
  Badge,
  Button,
  Card,
  CardHeader,
  Field,
  Input,
  Modal,
  Segmented,
  Select,
  StatCard,
  Switch,
  Textarea,
  useToast,
  type Tone,
} from "@/components/ui";
import { cn } from "@/lib/cn";
import { formatNumber } from "@/lib/format";
import { landingPages, whiteningSections, type LandingPage, type LpSection, type SectionId, type SectionVariant } from "@/lib/mock/demand-gen";
import { AiPill, useStream } from "../shared";

const statusMeta: Record<LandingPage["status"], { label: string; tone: Tone }> = {
  live: { label: "Live", tone: "success" },
  testing: { label: "A/B testing", tone: "ai" },
  draft: { label: "Draft", tone: "neutral" },
};

export function LandingPages() {
  const toast = useToast();
  const [pages, setPages] = useState<LandingPage[]>(landingPages);
  const [editing, setEditing] = useState<string | null>(null);
  const [genOpen, setGenOpen] = useState(false);
  const [genPrompt, setGenPrompt] = useState("Root canal treatment page for Baner clinic, Hindi + English, push WhatsApp booking, mention single-sitting RCT and EMI");

  const page = pages.find((p) => p.id === editing);
  if (page) {
    return (
      <Builder
        page={page}
        onBack={() => setEditing(null)}
        onPublished={(url) => setPages((ps) => ps.map((p) => (p.id === page.id ? { ...p, url, status: p.status === "draft" ? "live" : p.status } : p)))}
      />
    );
  }

  const live = pages.filter((p) => p.status !== "draft");
  const views = live.reduce((s, p) => s + p.views, 0);
  const outcomes = live.reduce((s, p) => s + p.outcomes, 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Pages live" value={live.length} hint={`${pages.length - live.length} drafts`} icon={<Globe />} />
        <StatCard label="Views · 30d" value={formatNumber(views)} delta={21.4} icon={<Monitor />} />
        <StatCard label="Avg. conversion" value={`${((outcomes / Math.max(1, views)) * 100).toFixed(1)}%`} delta={2.3} hint="visit → booking/demo" icon={<CalendarCheck />} />
        <StatCard label="Bookings & demos" value={formatNumber(outcomes)} delta={34} hint="attributed via UTM" icon={<CircleCheck />} />
      </div>

      <Card>
        <CardHeader
          title={
            <span className="inline-flex items-center gap-2">
              AI landing pages <AiPill />
            </span>
          }
          description="Generated from your brand memory and each campaign's winning angle. Every form captures UTM and click IDs."
          action={
            <Button size="sm" variant="ai" onClick={() => setGenOpen(true)}>
              <Sparkles /> Generate page
            </Button>
          }
        />
        <div className="scroll-thin relative overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead className="border-y border-line bg-surface-2 text-xs text-muted">
              <tr>
                <th scope="col" className="px-5 py-2 text-left font-medium">Page</th>
                <th scope="col" className="px-3 py-2 text-left font-medium">Status</th>
                <th scope="col" className="px-3 py-2 text-right font-medium">Views</th>
                <th scope="col" className="px-3 py-2 text-right font-medium">Conversion</th>
                <th scope="col" className="px-3 py-2 text-right font-medium">Bookings / demos</th>
                <th scope="col" className="w-28 px-3 py-2 text-left font-medium">Conv. trend</th>
                <th scope="col" className="px-5 py-2 text-right font-medium">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {pages.map((p) => (
                <tr key={p.id} className="hover:bg-surface-2/60">
                  <td className="px-5 py-3">
                    <button onClick={() => setEditing(p.id)} className="text-left">
                      <div className="flex items-center gap-2 font-medium text-fg hover:underline">
                        {p.name} {p.pipeline === "b2b" && <Badge tone="info">B2B</Badge>}
                      </div>
                      <div className="text-xs text-muted">
                        {p.url} · {p.campaign}
                      </div>
                    </button>
                  </td>
                  <td className="px-3 py-3">
                    <Badge tone={statusMeta[p.status].tone}>{statusMeta[p.status].label}</Badge>
                  </td>
                  <td className="px-3 py-3 text-right tabular">{p.views ? formatNumber(p.views) : "–"}</td>
                  <td className="px-3 py-3 text-right tabular">{p.views ? `${p.conversion.toFixed(1)}%` : "–"}</td>
                  <td className="px-3 py-3 text-right font-semibold tabular">{p.outcomes || "–"}</td>
                  <td className="px-3 py-3">{p.trend.length ? <Sparkline data={p.trend} height={24} /> : <span className="text-xs text-muted">No data yet</span>}</td>
                  <td className="px-5 py-3 text-right">
                    <Button size="xs" variant="outline" onClick={() => setEditing(p.id)}>
                      Open builder
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        open={genOpen}
        onClose={() => setGenOpen(false)}
        title="Generate a landing page"
        description="Describe the page; the AI uses your memory for offers, proof, FAQs and booking flow."
        footer={
          <>
            <Button variant="ghost" onClick={() => setGenOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="ai"
              onClick={() => {
                setPages((ps) => [
                  { id: `lp-${Date.now()}`, pipeline: "clinic", name: "Single-sitting Root Canal, Baner", url: "smile.anvita.site/root-canal", status: "draft", campaign: "Always-on", views: 0, conversion: 0, outcomes: 0, updated: "Just now", trend: [] },
                  ...ps,
                ]);
                setGenOpen(false);
                toast({ title: "Draft page generated", description: "5 sections, Hindi + English. Open the builder to review before publishing." });
              }}
            >
              <Sparkles /> Generate draft
            </Button>
          </>
        }
      >
        <Field label="What is this page for?">
          <Textarea rows={4} value={genPrompt} onChange={(e) => setGenPrompt(e.target.value)} />
        </Field>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Field label="Campaign">
            <Select defaultValue="Always-on">
              <option>Always-on</option>
              <option>Wedding-season whitening</option>
              <option>Implant consult month</option>
            </Select>
          </Field>
          <Field label="Conversion">
            <Select defaultValue="wa">
              <option value="wa">WhatsApp booking form</option>
              <option value="cal">Calendar slot picker</option>
              <option value="call">Click-to-call</option>
            </Select>
          </Field>
        </div>
      </Modal>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Builder                                                             */
/* ------------------------------------------------------------------ */

interface SectionState {
  id: SectionId;
  label: string;
  enabled: boolean;
  active: "A" | "B";
  A: SectionVariant;
  B?: SectionVariant;
  rewrites: SectionVariant[];
  rewriteIdx: number;
  stat?: string;
}

const toState = (s: LpSection): SectionState => ({
  id: s.id,
  label: s.label,
  enabled: s.enabled,
  active: s.variants.B ? "B" : "A",
  A: s.variants.A,
  B: s.variants.B,
  rewrites: s.rewrites,
  rewriteIdx: 0,
  stat: s.stat,
});

function Builder({ page, onBack, onPublished }: { page: LandingPage; onBack: () => void; onPublished: (url: string) => void }) {
  const toast = useToast();
  const [sections, setSections] = useState<SectionState[]>(() => whiteningSections.map(toState));
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [openId, setOpenId] = useState<SectionId | null>("hero");
  const [rewriting, setRewriting] = useState<SectionId | null>(null);
  const [streamText, , startStream] = useStream(22);
  const [publishOpen, setPublishOpen] = useState(false);
  const [slug, setSlug] = useState(page.url.split("/")[1] ?? "whitening");
  const [autoWinner, setAutoWinner] = useState(true);

  const isWhitening = page.id === "lp1";
  const testing = sections.some((s) => s.B);

  function update(id: SectionId, fn: (s: SectionState) => SectionState) {
    setSections((ss) => ss.map((s) => (s.id === id ? fn(s) : s)));
  }

  function rewrite(s: SectionState) {
    const next = s.rewrites[s.rewriteIdx % s.rewrites.length];
    setRewriting(s.id);
    setOpenId(s.id);
    startStream(next.body || (next.bullets ?? []).join(" · "), () => {
      update(s.id, (x) => ({ ...x, [x.active]: next, rewriteIdx: x.rewriteIdx + 1 }));
      setRewriting(null);
      toast({ title: `${s.label} rewritten`, description: `Variant ${s.active} updated. Previous version kept in history.` });
    });
  }

  function addVariant(s: SectionState) {
    const next = s.rewrites[s.rewriteIdx % s.rewrites.length];
    update(s.id, (x) => ({ ...x, B: next, active: "B", rewriteIdx: x.rewriteIdx + 1 }));
    toast({ title: `A/B test added to ${s.label}`, description: "Traffic will split 50/50 once published.", tone: "info" });
  }

  function move(i: number, dir: -1 | 1) {
    setSections((ss) => {
      const j = i + dir;
      if (j < 0 || j >= ss.length) return ss;
      const copy = [...ss];
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy;
    });
  }

  const domain = page.url.split("/")[0];
  const fullUrl = `${domain}/${slug}`;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <Button size="icon-sm" variant="ghost" onClick={onBack} aria-label="Back to landing pages">
            <ArrowLeft />
          </Button>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-base font-semibold">{page.name}</h2>
              <Badge tone={statusMeta[page.status].tone}>{statusMeta[page.status].label}</Badge>
            </div>
            <div className="truncate text-xs text-muted">
              {page.url} · edited {page.updated}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={() => toast({ title: "Preview link copied", description: `https://${page.url}?preview=1`, tone: "info" })}>
            <Link2 /> Share preview
          </Button>
          <Button size="sm" onClick={() => setPublishOpen(true)}>
            <Rocket /> Publish
          </Button>
        </div>
      </div>

      {!isWhitening && (
        <AiCallout title="Showing the shared section template">
          This page uses the same 5-section structure as the whitening page. Content below is from the whitening page for demo purposes.
        </AiCallout>
      )}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
        {/* Left: sections */}
        <Card className="min-w-0 self-start">
          <CardHeader title="Sections" description="Rewrite any section with AI, or add a B variant to test it" />
          <ul className="divide-y divide-line border-t border-line">
            {sections.map((s, i) => {
              const v = s[s.active] ?? s.A;
              const expanded = openId === s.id;
              return (
                <li key={s.id} className={cn(!s.enabled && "opacity-60")}>
                  <div className="flex items-center gap-2 px-4 py-2.5">
                    <button
                      onClick={() => setOpenId(expanded ? null : s.id)}
                      className="flex min-w-0 flex-1 items-center gap-2 text-left"
                      aria-expanded={expanded}
                    >
                      <ChevronDown className={cn("size-4 shrink-0 text-muted transition-transform", !expanded && "-rotate-90")} aria-hidden />
                      <span className="text-sm font-medium">{s.label}</span>
                      {s.B && (
                        <Badge tone="ai">
                          <Split aria-hidden /> A/B
                        </Badge>
                      )}
                    </button>
                    <Button size="icon-sm" variant="ghost" aria-label={`Move ${s.label} up`} disabled={i === 0} onClick={() => move(i, -1)}>
                      <ArrowUp />
                    </Button>
                    <Button size="icon-sm" variant="ghost" aria-label={`Move ${s.label} down`} disabled={i === sections.length - 1} onClick={() => move(i, 1)}>
                      <ArrowDown />
                    </Button>
                    <Switch size="sm" checked={s.enabled} onChange={(on) => update(s.id, (x) => ({ ...x, enabled: on }))} label={`Show ${s.label}`} />
                  </div>
                  {expanded && (
                    <div className="space-y-3 bg-surface-2/40 px-4 pt-1 pb-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        {s.B ? (
                          <Segmented
                            size="xs"
                            value={s.active}
                            onChange={(a) => update(s.id, (x) => ({ ...x, active: a }))}
                            items={[
                              { value: "A", label: "Variant A" },
                              { value: "B", label: "Variant B" },
                            ]}
                          />
                        ) : (
                          <Button size="xs" variant="outline" onClick={() => addVariant(s)}>
                            <Plus /> Add B variant
                          </Button>
                        )}
                        <Button size="xs" variant="ai" onClick={() => rewrite(s)} disabled={!!rewriting}>
                          <WandSparkles /> {rewriting === s.id ? "Rewriting…" : "AI rewrite"}
                        </Button>
                      </div>
                      {s.stat && <div className="text-xs text-muted">{s.stat}</div>}
                      <Field label="Heading">
                        <Input value={v.heading} onChange={(e) => update(s.id, (x) => ({ ...x, [x.active]: { ...v, heading: e.target.value } }))} />
                      </Field>
                      {v.body !== "" && (
                        <Field label="Body">
                          <Textarea
                            rows={3}
                            value={rewriting === s.id ? streamText : v.body}
                            readOnly={rewriting === s.id}
                            onChange={(e) => update(s.id, (x) => ({ ...x, [x.active]: { ...v, body: e.target.value } }))}
                          />
                        </Field>
                      )}
                      {v.cta && (
                        <Field label="Button">
                          <Input value={v.cta} onChange={(e) => update(s.id, (x) => ({ ...x, [x.active]: { ...v, cta: e.target.value } }))} />
                        </Field>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
          {testing && (
            <div className="space-y-2 border-t border-line px-4 py-3 text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-fg">A/B test · 50/50 split · goal: bookings</span>
              </div>
              <div className="flex items-center justify-between gap-2 text-fg-2">
                <span>Auto-pick the winner at 95% confidence</span>
                <Switch size="sm" checked={autoWinner} onChange={setAutoWinner} label="Auto-pick winner" />
              </div>
            </div>
          )}
        </Card>

        {/* Right: preview */}
        <Card className="min-w-0 overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-2.5">
            <div className="flex min-w-0 items-center gap-2 rounded-md bg-surface-2 px-2.5 py-1 text-xs text-muted">
              <ShieldCheck className="size-3.5 shrink-0 text-success" aria-label="Secure" />
              <span className="truncate">https://{fullUrl}</span>
            </div>
            <Segmented
              size="xs"
              value={device}
              onChange={setDevice}
              items={[
                { value: "desktop", label: <span className="sr-only sm:not-sr-only">Desktop</span>, icon: <Monitor aria-hidden /> },
                { value: "mobile", label: <span className="sr-only sm:not-sr-only">Mobile</span>, icon: <Smartphone aria-hidden /> },
              ]}
            />
          </div>
          <div className="bg-surface-3/60 p-3 sm:p-5">
            <div
              className={cn(
                "mx-auto overflow-hidden rounded-xl border border-line bg-bg shadow-card transition-all",
                device === "mobile" ? "max-w-[360px]" : "max-w-full",
              )}
            >
              <PagePreview sections={sections} device={device} rewriting={rewriting} streamText={streamText} onSubmit={() => toast({ title: "Test lead created", description: "utm_source=preview · sent to Inbox as a test conversation", tone: "info" })} />
            </div>
          </div>
        </Card>
      </div>

      <Modal
        open={publishOpen}
        onClose={() => setPublishOpen(false)}
        title="Publish landing page"
        description="Hosted by Anvita on your subdomain with SSL. Changes go to the approval queue if your workspace requires it."
        footer={
          <>
            <Button variant="ghost" onClick={() => setPublishOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                onPublished(fullUrl);
                setPublishOpen(false);
                toast({ title: `Published to ${fullUrl}`, description: testing ? "A/B test started: 50/50 split." : "Page is live." });
              }}
            >
              <Rocket /> Publish now
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Address">
            <div className="flex items-stretch overflow-hidden rounded-lg border border-line focus-within:border-primary">
              <span className="flex items-center bg-surface-2 px-3 text-sm text-muted">{domain}/</span>
              <input value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))} aria-label="Page slug" className="h-9 min-w-0 flex-1 bg-surface px-2 text-sm text-fg focus:outline-none" />
            </div>
          </Field>
          <div className="flex items-start justify-between gap-3 rounded-lg border border-line p-3 text-sm">
            <div>
              <div className="font-medium">Use custom domain</div>
              <div className="text-xs text-muted">offers.smiledental.in, needs 1 CNAME record</div>
            </div>
            <Button size="xs" variant="outline" onClick={() => toast({ title: "DNS instructions copied", description: "CNAME offers → pages.anvita.site", tone: "info" })}>
              <Copy /> Copy DNS
            </Button>
          </div>
          <AiCallout title="UTM & click-ID capture is on">
            The form saves <code className="text-xs">utm_source</code>, <code className="text-xs">utm_medium</code>, <code className="text-xs">utm_campaign</code>,{" "}
            <code className="text-xs">gclid</code> and <code className="text-xs">fbclid</code> to the contact, so every booking is attributed to the exact ad and
            variant. Conversions are sent back to Google and Meta.
          </AiCallout>
          <a href="#" onClick={(e) => e.preventDefault()} className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
            <ExternalLink className="size-3" aria-hidden /> Example: https://{fullUrl}?utm_source=meta&utm_campaign=whitening_nov
          </a>
        </div>
      </Modal>
    </div>
  );
}

function PagePreview({
  sections,
  device,
  rewriting,
  streamText,
  onSubmit,
}: {
  sections: SectionState[];
  device: "desktop" | "mobile";
  rewriting: SectionId | null;
  streamText: string;
  onSubmit: () => void;
}) {
  const mobile = device === "mobile";
  return (
    <div className="text-fg">
      <div className="flex items-center justify-between border-b border-line bg-surface px-4 py-2.5">
        <span className="flex items-center gap-1.5 text-sm font-bold">
          <span className="inline-flex size-6 items-center justify-center rounded-md bg-primary text-xs text-primary-fg">S</span> Smile Dental
        </span>
        <span className="rounded-full bg-success-soft px-2.5 py-1 text-[11px] font-semibold text-success">WhatsApp us</span>
      </div>
      {sections
        .filter((s) => s.enabled)
        .map((s) => {
          const v = s[s.active] ?? s.A;
          const body = rewriting === s.id ? streamText : v.body;
          const ring = rewriting === s.id && "ring-2 ring-ai/50 ring-inset";
          const tag = s.B && (
            <span className="mb-2 inline-flex items-center gap-1 rounded-full bg-ai-soft px-2 py-0.5 text-[10px] font-semibold text-ai">
              <Split className="size-3" aria-hidden /> Variant {s.active}
            </span>
          );
          if (s.id === "hero")
            return (
              <section key={s.id} className={cn("bg-gradient-to-br from-primary-soft to-ai-soft px-5 py-8", !mobile && "sm:px-10 sm:py-12", ring)}>
                {tag}
                <h1 className={cn("font-bold tracking-tight", mobile ? "text-2xl" : "text-2xl sm:text-4xl")}>{v.heading}</h1>
                <p className={cn("mt-2 text-fg-2", mobile ? "text-sm" : "text-sm sm:text-base")}>{body}</p>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <span className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-fg">{v.cta}</span>
                  <span className="flex items-center gap-1 text-xs text-fg-2">
                    <Star className="size-3.5 fill-accent text-accent" aria-hidden /> 4.8 · 1,240 Google reviews
                  </span>
                </div>
              </section>
            );
          if (s.id === "offer" || s.id === "proof")
            return (
              <section key={s.id} className={cn("bg-surface px-5 py-6", !mobile && "sm:px-10", ring)}>
                {tag}
                <h2 className="text-lg font-semibold">{v.heading}</h2>
                {body && <p className={cn("mt-1 text-sm text-fg-2", s.id === "proof" && "italic")}>{body}</p>}
                <ul className={cn("mt-3 grid gap-2", !mobile && "sm:grid-cols-2")}>
                  {(v.bullets ?? []).map((b) => (
                    <li key={b} className="flex items-center gap-2 rounded-lg bg-surface-2 px-3 py-2 text-sm">
                      <CircleCheck className="size-4 shrink-0 text-success" aria-hidden /> {b}
                    </li>
                  ))}
                </ul>
              </section>
            );
          if (s.id === "faq")
            return (
              <section key={s.id} className={cn("bg-bg px-5 py-6", !mobile && "sm:px-10", ring)}>
                {tag}
                <h2 className="text-lg font-semibold">{v.heading}</h2>
                <ul className="mt-3 divide-y divide-line rounded-lg border border-line bg-surface">
                  {(v.bullets ?? []).map((b) => {
                    const [q, ...a] = b.split("? ");
                    return (
                      <li key={b} className="px-3 py-2.5 text-sm">
                        <div className="font-medium">{q}?</div>
                        <div className="text-fg-2">{a.join("? ")}</div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          return (
            <section key={s.id} className={cn("bg-surface px-5 py-6", !mobile && "sm:px-10", ring)}>
              {tag}
              <h2 className="text-lg font-semibold">{v.heading}</h2>
              <p className="mt-1 text-sm text-fg-2">{body}</p>
              <form
                className={cn("mt-3 grid gap-2", !mobile && "sm:grid-cols-[1fr_1fr_auto]")}
                onSubmit={(e) => {
                  e.preventDefault();
                  onSubmit();
                }}
              >
                <Input placeholder="Your name" aria-label="Your name" defaultValue="" />
                <Input placeholder="WhatsApp number" aria-label="WhatsApp number" defaultValue="+91 " />
                <Button type="submit">{v.cta}</Button>
              </form>
              <p className="mt-2 text-[11px] text-muted">Hidden fields: utm_source · utm_medium · utm_campaign · gclid · fbclid</p>
            </section>
          );
        })}
      <footer className="border-t border-line bg-surface px-5 py-3 text-[11px] text-muted">Smile Dental · Koregaon Park & Baner, Pune · Powered by Anvita</footer>
    </div>
  );
}
