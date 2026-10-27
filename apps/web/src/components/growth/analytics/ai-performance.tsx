"use client";

import { Bot, BookPlus, CircleCheck, Clock, Smartphone, Sparkles, ThumbsUp } from "lucide-react";
import { useState } from "react";
import { BarCompare, ChartLegend, LineTrend } from "@/components/charts";
import { Badge, Button, Card, CardHeader, ChannelIcon, Field, Modal, StatCard, Textarea, useToast, Input } from "@/components/ui";
import { aiResolutionTrend, aiVsHumanBookings, escalationReasons, unansweredQuestions } from "@/lib/mock/growth";
import { ChartCard, RankBars } from "../shared";

const suggestedAnswers: Record<string, string> = {
  uq1: "Yes. We are empanelled for cashless dental treatment with Star Health and ICICI Lombard for accident-related dental care. Routine cleaning and cosmetic treatments are usually not covered. Share your policy number on WhatsApp and our front desk will confirm coverage within 2 hours.",
  uq2: "Yes, there is free parking for up to 6 cars in the building basement at Koregaon Park (entry from Lane 6). Two-wheeler parking is at the front.",
  uq3: "Teeth whitening is not recommended during pregnancy or while breastfeeding. A professional cleaning is safe and can brighten your smile. We'll happily book whitening after.",
  uq4: "Yes, we offer zirconia crowns from ₹12,000 with a 10-year warranty against fracture. A digital scan means the crown is ready in 3 working days.",
  uq5: "Dr. Shetty at our Baner clinic speaks Kannada, English and Hindi. She is available Monday, Wednesday and Friday.",
};

export function AnalyticsAi() {
  const toast = useToast();
  const [added, setAdded] = useState<string[]>([]);
  const [editing, setEditing] = useState<(typeof unansweredQuestions)[number] | null>(null);
  const [answer, setAnswer] = useState("");
  const [title, setTitle] = useState("");
  const latest = aiResolutionTrend[aiResolutionTrend.length - 1];
  const aiShare = aiVsHumanBookings.reduce((a, w) => a + w.ai, 0) / aiVsHumanBookings.reduce((a, w) => a + w.ai + w.human, 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="AI resolution rate" value={`${latest.resolution}%`} delta={5.0} hint="no human needed" icon={<Bot />} />
        <StatCard label="Avg response time" value="6s" hint="AI · team median 4m 12s" icon={<Clock />} />
        <StatCard label="CSAT (AI-handled)" value="4.6 / 5" delta={2.2} hint="312 ratings" icon={<ThumbsUp />} />
        <StatCard label="Bookings by AI" value={`${(aiShare * 100).toFixed(0)}%`} delta={6.8} hint="of all bookings" icon={<Sparkles />} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard
          title="Resolution vs escalation rate"
          description="Weekly share of conversations, last 12 weeks"
          legend={
            <ChartLegend
              items={[
                { key: "resolution", label: "Resolved by AI" },
                { key: "escalation", label: "Escalated to team" },
              ]}
            />
          }
          table={{
            columns: [
              { key: "week", label: "Week" },
              { key: "resolution", label: "Resolved by AI", align: "right", render: (r) => `${r.resolution}%` },
              { key: "escalation", label: "Escalated", align: "right", render: (r) => `${r.escalation}%` },
            ],
            rows: aiResolutionTrend,
          }}
        >
          <LineTrend
            data={aiResolutionTrend}
            xKey="week"
            height={230}
            format={(v) => `${v}%`}
            series={[
              { key: "resolution", label: "Resolved by AI" },
              { key: "escalation", label: "Escalated to team" },
            ]}
          />
        </ChartCard>
        <ChartCard
          title="Bookings: AI vs team"
          description="Appointments booked per week"
          legend={
            <ChartLegend
              items={[
                { key: "ai", label: "AI agent" },
                { key: "human", label: "Team" },
              ]}
            />
          }
          table={{
            columns: [
              { key: "week", label: "Week" },
              { key: "ai", label: "AI agent", align: "right" },
              { key: "human", label: "Team", align: "right" },
            ],
            rows: aiVsHumanBookings,
          }}
        >
          <BarCompare
            data={aiVsHumanBookings}
            xKey="week"
            stacked
            height={230}
            series={[
              { key: "ai", label: "AI agent" },
              { key: "human", label: "Team" },
            ]}
          />
        </ChartCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <ChartCard
          className="lg:col-span-2"
          title="Why conversations escalate"
          description="Last 30 days · 207 escalations"
          table={{
            columns: [
              { key: "reason", label: "Reason" },
              { key: "count", label: "Escalations", align: "right" },
            ],
            rows: escalationReasons,
          }}
        >
          <RankBars rows={escalationReasons.map((r) => ({ key: r.reason, label: r.reason, value: r.count, note: `${((r.count / 207) * 100).toFixed(0)}%` }))} />
        </ChartCard>

        <Card className="lg:col-span-3">
          <CardHeader title="Top unanswered questions" description="Questions the AI couldn't answer from your knowledge base. Add an answer once and it never escalates again." />
          <ul className="divide-y divide-line border-t border-line">
            {unansweredQuestions.map((q) => {
              const done = added.includes(q.id);
              return (
                <li key={q.id} className="flex flex-col gap-2 px-5 py-3 sm:flex-row sm:items-center">
                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    <ChannelIcon channel={q.channel} size="xs" className="mt-0.5" />
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-fg">{q.question}</div>
                      <div className="text-xs text-muted">
                        Asked {q.count}× · most recently {q.lastAsked.toLowerCase()}
                      </div>
                    </div>
                  </div>
                  {done ? (
                    <Badge tone="success" className="self-start sm:self-auto">
                      <CircleCheck aria-hidden /> In knowledge base
                    </Badge>
                  ) : (
                    <Button
                      size="xs"
                      variant="outline"
                      className="self-start sm:self-auto"
                      onClick={() => {
                        setEditing(q);
                        setTitle(q.question);
                        setAnswer(suggestedAnswers[q.id] ?? "");
                      }}
                    >
                      <BookPlus /> Add to knowledge base
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>
        </Card>
      </div>

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title="Add to knowledge base"
        description={editing ? `Asked ${editing.count} times in the last 30 days` : undefined}
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button
              disabled={!answer.trim()}
              onClick={() => {
                if (editing) setAdded((a) => [...a, editing.id]);
                setEditing(null);
                toast({ title: "Added to knowledge base", description: "The AI will use this answer from the next conversation." });
              }}
            >
              <BookPlus /> Save answer
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <Field label="Question">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </Field>
          <Field label="Answer" hint="AI-suggested from your website and past team replies. Check before saving.">
            <Textarea rows={5} value={answer} onChange={(e) => setAnswer(e.target.value)} />
          </Field>
          <p className="flex items-center gap-1.5 text-xs text-muted">
            <Smartphone className="size-3.5" aria-hidden /> The AI will also answer this in Hindi and Marathi.
          </p>
        </div>
      </Modal>
    </div>
  );
}
