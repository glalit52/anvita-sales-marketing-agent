"use client";

import { ArrowRight, CalendarCheck, Download, IndianRupee, Link2, Sparkles, Star, Target, UserPlus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Badge, Button, Card, CardBody, Modal, Switch, useToast } from "@/components/ui";
import { growthReport } from "@/lib/mock/growth";

export function GrowthReportModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const toast = useToast();
  const [weekly, setWeekly] = useState(true);
  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={
        <span className="inline-flex items-center gap-2">
          <Sparkles className="size-4 text-ai" /> AI growth report
        </span>
      }
      description={growthReport.week}
      footer={
        <>
          <Button
            variant="ghost"
            onClick={() => {
              navigator.clipboard?.writeText("https://app.anvita.ai/r/smile-dental/w43").catch(() => {});
              toast({ title: "Share link copied", description: "White-label link, no login needed. Expires in 30 days.", tone: "info" });
            }}
          >
            <Link2 /> Copy link
          </Button>
          <Button variant="outline" onClick={() => toast({ title: "Preparing PDF", description: "Smile Dental · Week 43 report.pdf", tone: "info" })}>
            <Download /> PDF
          </Button>
        </>
      }
    >
      <p className="text-base font-semibold text-fg">{growthReport.headline}</p>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          { icon: UserPlus, label: "Leads", value: "412", delta: "+9%" },
          { icon: CalendarCheck, label: "Bookings", value: "128", delta: "+12%" },
          { icon: IndianRupee, label: "Collected", value: "₹3.42L", delta: "+8%" },
          { icon: Star, label: "Avg rating", value: "4.74★", delta: "+0.03" },
        ].map((k) => (
          <div key={k.label} className="rounded-lg border border-line p-2.5">
            <div className="flex items-center gap-1.5 text-xs text-muted">
              <k.icon className="size-3.5" aria-hidden /> {k.label}
            </div>
            <div className="mt-1 font-semibold tabular">
              {k.value} <span className="text-xs font-medium text-success">↑ {k.delta}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 space-y-2.5 text-sm leading-relaxed text-fg-2">
        {growthReport.narrative.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
      <h3 className="mt-5 mb-2 text-sm font-semibold">Top 3 recommendations</h3>
      <ol className="space-y-2">
        {growthReport.recommendations.map((r, i) => (
          <li key={r.title} className="flex items-start gap-3 rounded-lg border border-line p-3">
            <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-ai-soft text-xs font-semibold text-ai">{i + 1}</span>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-fg">{r.title}</div>
              <Badge tone="success" className="mt-1">
                <Target aria-hidden /> {r.impact}
              </Badge>
            </div>
            <Link href={r.href} onClick={onClose} className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-primary hover:underline">
              Review <ArrowRight className="size-3.5" />
            </Link>
          </li>
        ))}
      </ol>
      <label className="mt-4 flex items-center justify-between gap-3 rounded-lg bg-surface-2 p-3 text-sm">
        <span>
          <span className="block font-medium">Email every Monday, 8 AM</span>
          <span className="block text-xs text-muted">To priya@smiledental.in and neha@smiledental.in</span>
        </span>
        <Switch checked={weekly} onChange={setWeekly} label="Email weekly report" />
      </label>
    </Modal>
  );
}

export function GrowthReportButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="ai" onClick={() => setOpen(true)}>
        <Sparkles /> AI growth report
      </Button>
      <GrowthReportModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}

/** Inline teaser card for the analytics overview. */
export function GrowthReportCard() {
  const [open, setOpen] = useState(false);
  return (
    <Card className="border-ai/25 bg-gradient-to-br from-ai-soft/60 to-surface">
      <CardBody className="pt-4">
        <div className="flex items-center gap-2 text-xs font-medium text-ai">
          <Sparkles className="size-3.5" aria-hidden /> AI growth report · {growthReport.week}
        </div>
        <p className="mt-2 text-sm font-semibold text-fg">{growthReport.headline}</p>
        <ul className="mt-3 space-y-1.5 text-sm text-fg-2">
          {growthReport.recommendations.map((r, i) => (
            <li key={r.title} className="flex gap-2">
              <span className="font-semibold text-ai tabular">{i + 1}.</span>
              <span>{r.title}</span>
            </li>
          ))}
        </ul>
        <Button size="sm" variant="outline" className="mt-4" onClick={() => setOpen(true)}>
          Read full report <ArrowRight />
        </Button>
      </CardBody>
      <GrowthReportModal open={open} onClose={() => setOpen(false)} />
    </Card>
  );
}
