"use client";

import { CheckCircle2, Loader2, Lock, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { Button, Card } from "@/components/ui";
import { api, errorMessage } from "@/lib/live/client";

interface PublicPayment {
  businessName: string;
  number: string;
  amountMinor: number;
  currency: string;
  purpose: string;
  description: string | null;
  lines: { description: string; quantity: number; unitMinor: number; taxPct: number }[];
  status: "pending" | "paid" | "overdue" | "refunded" | "cancelled" | "expired";
  customerName: string | null;
  dueAt: string | null;
  paidAt: string | null;
  provider: "test" | "razorpay";
  checkoutUrl: string | null;
}

const money = (minor: number, currency: string) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: minor % 100 ? 2 : 0 }).format(minor / 100);

/** The customer-facing pay page for a real payment link (live mode). */
export function LivePay({ token }: { token: string }) {
  const [p, setP] = useState<PublicPayment | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api<PublicPayment>(`/public/pay/${token}`, { auth: false }).then(setP, (e) => setError(errorMessage(e)));
  }, [token]);

  const payTest = async (method: "upi" | "card" | "netbanking") => {
    setBusy(true);
    try {
      setP(await api<PublicPayment>(`/public/pay/${token}/test-confirm`, { method: "POST", auth: false, body: { method } }));
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  if (error) return <div className="mx-auto max-w-md p-6 pt-16 text-center text-sm text-muted">{error}</div>;
  if (!p)
    return (
      <div className="flex min-h-dvh items-center justify-center text-sm text-muted">
        <Loader2 className="mr-2 size-4 animate-spin" /> Loading payment…
      </div>
    );

  const open = p.status === "pending" || p.status === "overdue";
  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-primary to-ai px-5 py-4 text-white">
          <div className="text-sm opacity-90">{p.businessName}</div>
          <div className="mt-1 text-3xl font-semibold tabular">{money(p.amountMinor, p.currency)}</div>
          <div className="mt-1 text-sm opacity-90">{p.purpose}</div>
        </div>
        <div className="space-y-4 p-5">
          {p.customerName && (
            <div className="text-sm text-muted">
              For <b className="text-fg">{p.customerName}</b> · {p.number}
            </div>
          )}
          {p.description && <p className="text-sm">{p.description}</p>}
          {p.lines.length > 0 && (
            <ul className="divide-y divide-line rounded-lg border border-line text-sm">
              {p.lines.map((l, i) => (
                <li key={i} className="flex justify-between gap-3 px-3 py-2">
                  <span>
                    {l.description} {l.quantity > 1 && <span className="text-muted">× {l.quantity}</span>}
                  </span>
                  <span className="tabular">{money(l.unitMinor * l.quantity, p.currency)}</span>
                </li>
              ))}
            </ul>
          )}

          {p.status === "paid" ? (
            <div className="flex items-center gap-2 rounded-lg bg-success-soft px-3 py-3 text-sm text-success">
              <CheckCircle2 className="size-5" /> Paid. Thank you! A receipt has been recorded with {p.businessName}.
            </div>
          ) : !open ? (
            <div className="rounded-lg bg-surface-2 px-3 py-3 text-sm text-muted">This payment link is {p.status} and can no longer be paid.</div>
          ) : p.checkoutUrl ? (
            <a href={p.checkoutUrl} className="block">
              <Button size="lg" className="w-full">
                <Lock /> Pay {money(p.amountMinor, p.currency)} securely
              </Button>
            </a>
          ) : p.provider === "test" ? (
            <div className="space-y-2">
              <div className="text-xs text-muted">Test mode: no real money moves.</div>
              {(["upi", "card", "netbanking"] as const).map((m) => (
                <Button key={m} size="lg" variant={m === "upi" ? "primary" : "outline"} className="w-full" disabled={busy} onClick={() => payTest(m)}>
                  Pay with {m === "upi" ? "UPI" : m === "card" ? "card" : "netbanking"}
                </Button>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted">Checkout is unavailable right now. Please contact {p.businessName}.</div>
          )}
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted">
            <ShieldCheck className="size-3.5 text-success" /> Secured payment · Anvita
          </div>
        </div>
      </Card>
    </div>
  );
}
