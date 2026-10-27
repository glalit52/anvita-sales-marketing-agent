"use client";

import { Check, CreditCard, Download, Plus, Receipt, Sparkles, Zap } from "lucide-react";
import { useState } from "react";
import { AiCallout, Badge, Button, Card, CardBody, CardHeader, Modal, Segmented, useToast } from "@/components/ui";
import { UsageMeter } from "@/components/platform/shared";
import { cn } from "@/lib/cn";
import { formatCurrency } from "@/lib/format";
import { creditPacks, invoices, plans, usageMeters } from "@/lib/mock/platform";

export function BillingSettings() {
  const toast = useToast();
  const [cycle, setCycle] = useState<"monthly" | "yearly">("monthly");
  const [current, setCurrent] = useState("growth");
  const [buyOpen, setBuyOpen] = useState(false);
  const [qty, setQty] = useState<Record<string, number>>({ cp1: 1 });
  const [upgrade, setUpgrade] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);

  const total = creditPacks.reduce((a, p) => a + p.price * (qty[p.id] ?? 0), 0);
  const price = (p: number) => (cycle === "yearly" ? Math.round((p * 10) / 12) : p);
  const currentPlan = plans.find((p) => p.id === current)!;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-1">
          <CardHeader title="Current plan" description="Renews Nov 1, 2026 · billed monthly via Razorpay" />
          <CardBody>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-semibold">{currentPlan.name}</span>
              <Badge tone="primary">Active</Badge>
            </div>
            <div className="mt-1 text-sm text-muted">
              {formatCurrency(currentPlan.price)}/month + 18% GST · {currentPlan.who}
            </div>
            <div className="mt-4 flex items-center gap-3 rounded-lg border border-line p-3">
              <CreditCard className="size-5 text-muted" />
              <div className="min-w-0 flex-1 text-sm">
                <div className="font-medium">UPI AutoPay · priya@okhdfcbank</div>
                <div className="text-xs text-muted">Backup: HDFC Visa •••• 4821</div>
              </div>
              <Button size="xs" variant="ghost" onClick={() => toast({ title: "Payment method", description: "Redirecting to Razorpay to update mandate…", tone: "info" })}>
                Change
              </Button>
            </div>
            <div className="mt-3 flex gap-2">
              <Button size="sm" className="flex-1" onClick={() => setBuyOpen(true)}>
                <Plus /> Buy credits
              </Button>
              <Button size="sm" variant="outline" className="flex-1" onClick={() => setUpgrade("scale")}>
                <Zap /> Upgrade
              </Button>
            </div>
          </CardBody>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader title="Usage this cycle" description="Oct 1 – Oct 31 · resets Nov 1" />
          <CardBody className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {usageMeters.map((m) => (
              <UsageMeter
                key={m.id}
                label={m.label}
                used={m.used}
                limit={m.limit}
                unit={m.unit}
                footer={
                  m.used / m.limit >= 0.9 ? (
                    <span className="text-danger">Almost out. Overage billed at ₹6/min, or buy a pack.</span>
                  ) : m.used / m.limit >= 0.75 ? (
                    <span className="text-warning">On pace to run out ~Oct 29</span>
                  ) : (
                    `Resets ${m.resets}`
                  )
                }
              />
            ))}
            <AiCallout className="sm:col-span-2" title="You'd save ₹2,100/mo on Scale">
              You&apos;re buying voice minutes and AI conversations every month. Scale includes 6,000 AI conversations and 500 voice minutes.
            </AiCallout>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Plans"
          description="Usage credits cover AI conversations above quota, prospecting rows, voice minutes and WhatsApp/SMS pass-through."
          action={
            <Segmented
              size="xs"
              value={cycle}
              onChange={setCycle}
              items={[
                { value: "monthly", label: "Monthly" },
                { value: "yearly", label: "Yearly · 2 months free" },
              ]}
            />
          }
        />
        <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {plans.map((p) => {
            const isCurrent = p.id === current;
            return (
              <div key={p.id} className={cn("relative flex flex-col rounded-xl border p-4", isCurrent ? "border-primary bg-primary-soft/30 ring-1 ring-primary" : "border-line")}>
                {p.id === "scale" && (
                  <span className="absolute -top-2.5 right-4">
                    <Badge tone="ai" className="border-ai/30">
                      <Sparkles /> Recommended
                    </Badge>
                  </span>
                )}
                <div className="text-sm font-semibold">{p.name}</div>
                <div className="text-xs text-muted">{p.who}</div>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-2xl font-semibold tabular">{formatCurrency(price(p.price))}</span>
                  <span className="text-xs text-muted">/mo</span>
                </div>
                <div className="text-[11px] text-muted">{cycle === "yearly" ? `billed ${formatCurrency(p.price * 10)}/yr` : "+ GST, billed monthly"}</div>
                <ul className="mt-4 flex-1 space-y-1.5 text-xs text-fg-2">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-1.5">
                      <Check className="mt-0.5 size-3.5 shrink-0 text-success" /> {f}
                    </li>
                  ))}
                </ul>
                <Button className="mt-4" size="sm" variant={isCurrent ? "secondary" : p.id === "scale" ? "primary" : "outline"} disabled={isCurrent} onClick={() => setUpgrade(p.id)}>
                  {isCurrent ? "Current plan" : plans.findIndex((x) => x.id === p.id) > plans.findIndex((x) => x.id === current) ? `Upgrade to ${p.name}` : `Switch to ${p.name}`}
                </Button>
              </div>
            );
          })}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Invoices" description="GST invoices are emailed to accounts@smiledental.in" action={<Receipt className="size-4 text-muted" />} />
        <div className="overflow-x-auto border-t border-line">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="text-left text-xs text-muted">
                <th className="px-5 py-2 font-medium">Invoice</th>
                <th className="px-3 py-2 font-medium">Date</th>
                <th className="px-3 py-2 font-medium">Description</th>
                <th className="px-3 py-2 text-right font-medium">Amount</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-5 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {invoices.map((i) => (
                <tr key={i.id}>
                  <td className="px-5 py-2.5 font-mono text-xs">{i.id}</td>
                  <td className="px-3 py-2.5 whitespace-nowrap text-muted">{i.date}</td>
                  <td className="px-3 py-2.5 text-fg-2">{i.items}</td>
                  <td className="px-3 py-2.5 text-right font-medium tabular">{formatCurrency(i.amount)}</td>
                  <td className="px-3 py-2.5">
                    <Badge tone={i.status === "paid" ? "success" : "neutral"}>{i.status === "paid" ? "Paid" : "Refunded"}</Badge>
                  </td>
                  <td className="px-5 py-2.5 text-right">
                    <Button size="icon-sm" variant="ghost" aria-label={`Download ${i.id}`} onClick={() => toast({ title: `${i.id}.pdf downloaded` })}>
                      <Download />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        open={buyOpen}
        onClose={() => setBuyOpen(false)}
        title="Buy credits"
        description="Credits never expire while your plan is active."
        footer={
          <>
            <span className="mr-auto self-center text-sm">
              Total <b className="tabular">{formatCurrency(total)}</b> <span className="text-xs text-muted">+ GST</span>
            </span>
            <Button variant="ghost" onClick={() => setBuyOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={total === 0 || paying}
              onClick={() => {
                setPaying(true);
                setTimeout(() => {
                  setPaying(false);
                  setBuyOpen(false);
                  toast({ title: "Payment successful", description: `${formatCurrency(Math.round(total * 1.18))} paid via UPI AutoPay. Credits added.` });
                }, 1200);
              }}
            >
              {paying ? "Processing…" : "Pay with UPI"}
            </Button>
          </>
        }
      >
        <ul className="space-y-2">
          {creditPacks.map((p) => {
            const n = qty[p.id] ?? 0;
            return (
              <li key={p.id} className={cn("flex items-center gap-3 rounded-lg border p-3", n > 0 ? "border-primary bg-primary-soft/30" : "border-line")}>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium">{p.label}</div>
                  <div className="text-xs text-muted">{formatCurrency(p.price)} each</div>
                </div>
                <div className="flex items-center gap-1">
                  <Button size="icon-sm" variant="outline" aria-label={`Fewer ${p.label}`} disabled={n === 0} onClick={() => setQty((q) => ({ ...q, [p.id]: n - 1 }))}>
                    −
                  </Button>
                  <span className="w-6 text-center text-sm font-medium tabular">{n}</span>
                  <Button size="icon-sm" variant="outline" aria-label={`More ${p.label}`} onClick={() => setQty((q) => ({ ...q, [p.id]: n + 1 }))}>
                    +
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      </Modal>

      <Modal
        open={!!upgrade}
        onClose={() => setUpgrade(null)}
        size="sm"
        title={`Switch to ${plans.find((p) => p.id === upgrade)?.name}?`}
        description="Prorated today; your usage carries over."
        footer={
          <>
            <Button variant="ghost" onClick={() => setUpgrade(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setCurrent(upgrade!);
                toast({ title: `You're on ${plans.find((p) => p.id === upgrade)?.name} now`, description: "New limits apply immediately." });
                setUpgrade(null);
              }}
            >
              Confirm
            </Button>
          </>
        }
      >
        {upgrade && (
          <div className="text-sm text-fg-2">
            Prorated charge today: <b className="text-fg">{formatCurrency(Math.max(0, Math.round(((plans.find((p) => p.id === upgrade)!.price - currentPlan.price) * 5) / 31)))}</b> + GST for the remaining 5 days of October.
          </div>
        )}
      </Modal>
    </div>
  );
}
