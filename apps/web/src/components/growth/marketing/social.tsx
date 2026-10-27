"use client";

import { CalendarClock, CircleAlert, CircleCheck, Clock, Hash, ImagePlus, PenLine, RefreshCw, Send, Sparkles, Trash } from "lucide-react";
import { useState } from "react";
import { Badge, Button, Card, CardBody, CardHeader, ChannelIcon, Field, Input, Select, Textarea, useToast, type Tone } from "@/components/ui";
import { cn } from "@/lib/cn";
import { captionIdeas, socialPosts, type SocialNetwork, type SocialPost } from "@/lib/mock/growth";
import { AiPill, useStream } from "../shared";

const networks: { id: SocialNetwork; label: string; channel: "instagram" | "facebook" | "linkedin" | "google"; limit: number }[] = [
  { id: "instagram", label: "Instagram", channel: "instagram", limit: 2200 },
  { id: "facebook", label: "Facebook", channel: "facebook", limit: 5000 },
  { id: "linkedin", label: "LinkedIn", channel: "linkedin", limit: 3000 },
  { id: "gbp", label: "Google Business", channel: "google", limit: 1500 },
];
const netMeta = Object.fromEntries(networks.map((n) => [n.id, n])) as Record<SocialNetwork, (typeof networks)[number]>;

const days = ["Mon 26", "Tue 27", "Wed 28", "Thu 29", "Fri 30", "Sat 31", "Sun 1"];
const TODAY = 1;

const statusMeta: Record<SocialPost["status"], { tone: Tone; label: string; icon: typeof Clock; text: string }> = {
  scheduled: { tone: "info", label: "Scheduled", icon: Clock, text: "text-info" },
  published: { tone: "success", label: "Published", icon: CircleCheck, text: "text-success" },
  draft: { tone: "neutral", label: "Draft", icon: PenLine, text: "text-muted" },
  failed: { tone: "danger", label: "Failed", icon: CircleAlert, text: "text-danger" },
};

const media = ["Before/after · whitening", "Clinic interior · KP", "Dr. Kulkarni portrait", "Kids corner · Baner"];
const hashtags = ["#PuneDentist", "#SmileDental", "#TeethWhitening", "#KoregaonPark", "#BanerPune", "#DiwaliSmile"];

function NetworkIcons({ list }: { list: SocialNetwork[] }) {
  return (
    <span className="inline-flex -space-x-1">
      {list.map((n) => (
        <span key={n} className="rounded-md ring-2 ring-surface">
          <ChannelIcon channel={netMeta[n].channel} size="xs" />
        </span>
      ))}
    </span>
  );
}

export function Social() {
  const toast = useToast();
  const [posts, setPosts] = useState<SocialPost[]>(socialPosts);
  const [selected, setSelected] = useState<SocialNetwork[]>(["instagram", "facebook"]);
  const [caption, setCaption] = useState("");
  const [topic, setTopic] = useState("Diwali whitening offer, 0% EMI, book on WhatsApp");
  const [tone, setTone] = useState("Warm & friendly");
  const [lang, setLang] = useState("English");
  const [variant, setVariant] = useState(0);
  const [mediaPick, setMediaPick] = useState<string | null>(media[0]);
  const [day, setDay] = useState(2);
  const [time, setTime] = useState("19:30");
  const [streamed, streaming, start] = useStream(22);

  const shown = streaming ? streamed : caption;
  const strictest = networks.filter((n) => selected.includes(n.id)).sort((a, b) => a.limit - b.limit)[0];

  function generate() {
    const base = selected[0] ?? "instagram";
    const ideas = captionIdeas[base];
    let text = ideas[variant % ideas.length];
    if (lang === "Hinglish") text = text.replace("Book on WhatsApp", "WhatsApp pe book karein").replace("DM ‘SMILE’", "‘SMILE’ likh ke DM karein");
    setVariant((v) => v + 1);
    start(text, (full) => setCaption(full));
  }

  function schedule(status: "scheduled" | "draft") {
    if (!caption.trim() || selected.length === 0) {
      toast({ title: "Add a caption and pick at least one network", tone: "warning" });
      return;
    }
    const [h, m] = time.split(":").map(Number);
    const label = `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
    setPosts((p) => [...p, { id: `sp${Date.now()}`, networks: selected, caption, dayIndex: day, time: label, status, media: mediaPick ?? "Text only", ai: true }]);
    setCaption("");
    toast({
      title: status === "scheduled" ? `Scheduled for ${days[day]} · ${label}` : "Saved as draft",
      description: selected.map((s) => netMeta[s].label).join(", "),
    });
  }

  const queue = posts.filter((p) => p.status !== "published").sort((a, b) => a.dayIndex - b.dayIndex);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-5">
        {/* Composer */}
        <Card className="xl:col-span-3">
          <CardHeader title="Create post" description="Write once, adapt per network. The AI knows your services, offers and tone." />
          <CardBody className="space-y-4">
            <div>
              <div className="mb-1.5 text-xs font-medium text-fg-2">Post to</div>
              <div className="flex flex-wrap gap-2">
                {networks.map((n) => {
                  const on = selected.includes(n.id);
                  return (
                    <button
                      key={n.id}
                      aria-pressed={on}
                      onClick={() => setSelected((s) => (on ? s.filter((x) => x !== n.id) : [...s, n.id]))}
                      className={cn(
                        "inline-flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-sm transition-colors",
                        on ? "border-primary bg-primary-soft text-fg" : "border-line text-fg-2 hover:bg-surface-2",
                      )}
                    >
                      <ChannelIcon channel={n.channel} size="xs" />
                      {n.label}
                      {on && <CircleCheck className="size-3.5 text-primary" aria-hidden />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-xl border border-ai/20 bg-ai-soft/40 p-3">
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-fg">
                <AiPill /> Caption generator
              </div>
              <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                <Input className="sm:col-span-3" aria-label="What's the post about?" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="What's the post about?" />
                <Select aria-label="Tone" value={tone} onChange={(e) => setTone(e.target.value)} >
                  <option>Warm & friendly</option>
                  <option>Professional</option>
                  <option>Playful</option>
                  <option>Educational</option>
                </Select>
                <Select aria-label="Language" value={lang} onChange={(e) => setLang(e.target.value)} >
                  <option>English</option>
                  <option>Hinglish</option>
                  <option>Marathi</option>
                </Select>
                <Button variant="ai" onClick={generate} disabled={streaming || selected.length === 0}>
                  <Sparkles /> {variant ? "Try another" : "Generate"}
                </Button>
              </div>
            </div>

            <Field label="Caption" hint={strictest ? `${shown.length}/${strictest.limit} (${strictest.label} limit)` : undefined}>
              <Textarea rows={5} value={shown} readOnly={streaming} onChange={(e) => setCaption(e.target.value)} placeholder="Write a caption or generate one with AI…" />
            </Field>
            <div className="flex flex-wrap items-center gap-1.5">
              <Hash className="size-3.5 text-muted" aria-hidden />
              {hashtags.map((h) => (
                <button
                  key={h}
                  onClick={() => setCaption((c) => (c.includes(h) ? c : `${c}${c.endsWith(" ") || !c ? "" : " "}${h}`))}
                  className="rounded-full border border-line px-2 py-0.5 text-xs text-fg-2 hover:border-primary hover:text-primary"
                >
                  {h}
                </button>
              ))}
            </div>

            <div>
              <div className="mb-1.5 text-xs font-medium text-fg-2">Media</div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                {media.map((m) => (
                  <button
                    key={m}
                    onClick={() => setMediaPick(m === mediaPick ? null : m)}
                    aria-pressed={m === mediaPick}
                    className={cn(
                      "flex aspect-[4/3] items-end rounded-lg border bg-gradient-to-br from-primary-soft to-ai-soft p-1.5 text-left text-[11px] leading-tight font-medium text-fg-2",
                      m === mediaPick ? "border-primary ring-2 ring-[var(--ring)]" : "border-line",
                    )}
                  >
                    {m}
                  </button>
                ))}
                <button
                  onClick={() => toast({ title: "Upload from device or Canva", tone: "info" })}
                  className="flex aspect-[4/3] flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-line-strong text-xs text-muted hover:bg-surface-2"
                >
                  <ImagePlus className="size-4" /> Upload
                </button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Day">
                  <Select value={day} onChange={(e) => setDay(Number(e.target.value))}>
                    {days.map((d, i) => (
                      <option key={d} value={i} disabled={i < TODAY}>
                        {d}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Time">
                  <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
                </Field>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => schedule("draft")}>
                  Save draft
                </Button>
                <Button onClick={() => schedule("scheduled")}>
                  <CalendarClock /> Schedule
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted">
              <Sparkles className="mr-1 inline size-3.5 align-[-2px] text-ai" aria-hidden />
              Best time for your audience: <b className="font-medium text-fg-2">Wed 7:30 PM</b> (Instagram) and <b className="font-medium text-fg-2">Thu 9:00 AM</b> (LinkedIn)
            </p>
          </CardBody>
        </Card>

        {/* Queue */}
        <Card className="xl:col-span-2">
          <CardHeader title="Queue" description={`${queue.filter((p) => p.status === "scheduled").length} scheduled · ${queue.filter((p) => p.status === "draft").length} draft`} />
          <ul className="divide-y divide-line border-t border-line">
            {queue.map((p) => {
              const st = statusMeta[p.status];
              return (
                <li key={p.id} className="px-5 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-2 text-xs text-muted">
                      <NetworkIcons list={p.networks} />
                      {days[p.dayIndex]} · {p.time}
                    </span>
                    <Badge tone={st.tone}>
                      <st.icon aria-hidden /> {st.label}
                    </Badge>
                  </div>
                  <p className="mt-1.5 line-clamp-2 text-sm text-fg-2">{p.caption}</p>
                  <div className="mt-1.5 flex items-center gap-1">
                    <span className="mr-auto text-xs text-muted">
                      {p.media}
                      {p.ai && " · AI caption"}
                    </span>
                    {p.status === "failed" && (
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => {
                          setPosts((ps) => ps.map((x) => (x.id === p.id ? { ...x, status: "scheduled" } : x)));
                          toast({ title: "Reconnected Google Business Profile", description: "Post re-queued for Sun 10:00 AM." });
                        }}
                      >
                        <RefreshCw /> Retry
                      </Button>
                    )}
                    {p.status === "draft" && (
                      <Button size="xs" variant="outline" onClick={() => setPosts((ps) => ps.map((x) => (x.id === p.id ? { ...x, status: "scheduled" } : x)))}>
                        <Send /> Schedule
                      </Button>
                    )}
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      aria-label="Edit post"
                      onClick={() => {
                        setCaption(p.caption);
                        setSelected(p.networks);
                        setDay(Math.max(TODAY, p.dayIndex));
                        setPosts((ps) => ps.filter((x) => x.id !== p.id));
                        toast({ title: "Loaded into composer", tone: "info" });
                      }}
                    >
                      <PenLine />
                    </Button>
                    <Button size="icon-sm" variant="ghost" aria-label="Delete post" onClick={() => setPosts((ps) => ps.filter((x) => x.id !== p.id))}>
                      <Trash />
                    </Button>
                  </div>
                  {p.status === "failed" && <p className="mt-1 text-xs text-danger">Google Business token expired. Retry to reconnect.</p>}
                </li>
              );
            })}
          </ul>
        </Card>
      </div>

      {/* Week calendar */}
      <Card>
        <CardHeader title="This week" description="26 Oct – 1 Nov 2026" />
        <div className="grid border-t border-line lg:grid-cols-7">
          {days.map((d, i) => {
            const list = posts.filter((p) => p.dayIndex === i);
            return (
              <div key={d} className={cn("min-h-32 border-b border-line p-2 lg:border-r lg:border-b-0 lg:last:border-r-0", i === TODAY && "bg-primary-soft/40")}>
                <div className={cn("mb-2 flex items-center justify-between text-xs font-medium", i === TODAY ? "text-primary" : "text-muted")}>
                  {d}
                  {i === TODAY && <span>Today</span>}
                </div>
                <div className="space-y-1.5">
                  {list.length === 0 && <p className="text-xs text-muted lg:hidden">No posts</p>}
                  {list.map((p) => {
                    const st = statusMeta[p.status];
                    return (
                      <div key={p.id} className="rounded-lg border border-line bg-surface p-2 shadow-card">
                        <div className="mb-1 flex items-center justify-between gap-1">
                          <NetworkIcons list={p.networks} />
                          <span className="text-[11px] text-muted tabular">{p.time}</span>
                        </div>
                        <p className="line-clamp-2 text-[11px] leading-snug text-fg-2">{p.caption}</p>
                        <span className={cn("mt-1 inline-flex items-center gap-1 text-[10px] font-medium", st.text)}>
                          <st.icon className="size-3" aria-hidden /> {st.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
