"use client";

import { CalendarCheck, ChevronDown, CircleCheck, CircleX, Download, FileText, LoaderCircle, MessageCircle, RefreshCw, Share2, Smartphone } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Badge, Button, Segmented, useToast } from "@/components/ui";
import { cn } from "@/lib/cn";
import { formatCurrency } from "@/lib/format";
import { business, invoiceTotals, payLinkById, type PayLink } from "@/lib/mock/public";
import { PaymentMethods } from "./payment-methods";
import { BusinessHeader, downloadFile, PoweredBy, SecureBadges, StatusMedallion } from "./shared";

type View = "form" | "processing" | "success" | "failed";

const inr2 = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function PayViewWithState({ id }: { id: string }) {
  const params = useSearchParams();
  const state = params.get("state");
  const initial: View = state === "failed" || state === "success" || state === "processing" ? state : "form";
  return <PayView key={initial} id={id} initial={initial} />;
}

export function PayView({ id, initial = "form" }: { id: string; initial?: View }) {
  const link = payLinkById(id)!;
  const toast = useToast();
  const [view, setView] = useState<View>(initial);
  const [method, setMethod] = useState<string>(initial === "form" ? "" : "Google Pay");
  const [outcome, setOutcome] = useState<"success" | "failed">("success");
  const [attempt, setAttempt] = useState(initial === "failed" ? 1 : 0);

  useEffect(() => {
    if (view !== "processing") return;
    const t = window.setTimeout(() => setView(outcome), 3200);
    return () => window.clearTimeout(t);
  }, [view, outcome]);

  const pay = (m: string) => {
    setMethod(m);
    setAttempt((a) => a + 1);
    setView("processing");
    window.scrollTo({ top: 0 });
  };

  const paymentId = `pay_Nx${link.id.replace("-", "")}q7ZrT${attempt}`;
  const receiptText = [
    `${business.legalName} · GSTIN ${business.gstin}`,
    `PAYMENT RECEIPT`,
    ``,
    `Paid by:     ${link.customer}`,
    `Purpose:     ${link.purpose}`,
    `Amount:      ${inr2.format(link.amount)}`,
    `Method:      ${method}`,
    `Payment ID:  ${paymentId}`,
    `UTR:         430211876650`,
    `Date:        27 Oct 2026, 11:54 AM IST`,
    ``,
    `Processed securely by Razorpay via Anvita.`,
  ].join("\n");

  return (
    <div className="mx-auto w-full max-w-lg px-4 pt-4 sm:pt-10">
      <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
        <div className="border-b border-line p-4 sm:p-5">
          <BusinessHeader compact />
        </div>

        {view === "form" && (
          <>
            <AmountBlock link={link} />
            {link.invoice && <InvoiceBlock link={link} onDownload={() => downloadInvoice(link, toast)} />}
            <div className="border-t border-line p-4 sm:p-5">
              <div className="mb-3 text-sm font-semibold text-fg">Choose how to pay</div>
              <PaymentMethods amount={link.amount} onPay={pay} seed={link.id} />
            </div>
          </>
        )}

        {view === "processing" && <Processing method={method} amount={link.amount} />}

        {view === "success" && (
          <div className="p-5 text-center sm:p-6">
            <StatusMedallion tone="success" icon={<CircleCheck />} />
            <div className="mt-4 text-sm font-medium text-success">Payment successful</div>
            <div className="mt-1 text-3xl font-semibold tracking-tight text-fg tabular">{formatCurrency(link.amount)}</div>
            <div className="mt-1 text-sm text-muted">Paid to {business.name} · {link.purpose}</div>
            {link.appointment && (
              <div className="mx-auto mt-4 flex max-w-sm items-center gap-2 rounded-xl bg-success-soft px-3 py-2.5 text-left text-sm text-fg-2">
                <CalendarCheck className="size-4 shrink-0 text-success" aria-hidden />
                <span>
                  Your slot is confirmed: <span className="font-medium text-fg">{link.appointment}</span>
                </span>
              </div>
            )}
            <dl className="mt-5 divide-y divide-line rounded-xl border border-line text-left text-sm">
              {[
                ["Paid by", link.customer],
                ["Method", method || "Google Pay"],
                ["Payment ID", paymentId],
                ["UTR / Ref no.", "430211876650"],
                ["Date & time", "27 Oct 2026, 11:54 AM"],
              ].map(([k, v]) => (
                <div key={k} className="flex items-start justify-between gap-3 px-3.5 py-2.5">
                  <dt className="shrink-0 text-muted">{k}</dt>
                  <dd className="min-w-0 text-right break-all text-fg tabular">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                className="h-11"
                onClick={() => {
                  downloadFile(`receipt-${link.id}.txt`, receiptText);
                  toast({ title: "Receipt downloaded", description: `receipt-${link.id}.txt` });
                }}
              >
                <Download /> Receipt
              </Button>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`Paid ${formatCurrency(link.amount)} to ${business.name} (${link.purpose}). Payment ID ${paymentId}`)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#1fa855] px-3 text-sm font-medium text-white hover:bg-[#178a45]"
              >
                <Share2 className="size-4" aria-hidden /> <span className="sm:hidden">WhatsApp</span>
                <span className="hidden sm:inline">Share on WhatsApp</span>
              </a>
            </div>
            <p className="mt-3 text-xs text-muted">A copy of this receipt was sent on WhatsApp to <span className="whitespace-nowrap">{link.phone.replace(/\d{3}(\d{2})$/, "•••$1")}</span>.</p>
          </div>
        )}

        {view === "failed" && (
          <div className="p-5 text-center sm:p-6">
            <StatusMedallion tone="danger" icon={<CircleX />} />
            <h2 className="mt-4 text-lg font-semibold text-fg">Payment failed</h2>
            <p className="mx-auto mt-1 max-w-sm text-sm text-muted">
              Your bank didn&apos;t confirm the {formatCurrency(link.amount)} payment {method ? `via ${method}` : ""} in time. <span className="font-medium text-fg-2">No money was deducted.</span>
            </p>
            <div className="mx-auto mt-4 max-w-sm rounded-xl border border-line bg-surface-2 px-3.5 py-2.5 text-left text-xs text-fg-2">
              If money was debited, it will be refunded automatically to your account within 5–7 working days.
              <div className="mt-1 text-muted">Error: BAD_REQUEST_ERROR · bank_timeout · attempt {attempt}</div>
            </div>
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              <Button size="lg" onClick={() => pay(method || "Google Pay")}>
                <RefreshCw /> Retry {method ? method.split(" · ")[0] : "payment"}
              </Button>
              <Button size="lg" variant="outline" onClick={() => setView("form")}>
                Try another method
              </Button>
            </div>
            <button
              onClick={() => toast({ title: "Opening WhatsApp", description: `Chat with ${business.name} on ${business.whatsapp}`, tone: "info" })}
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              <MessageCircle className="size-4" aria-hidden /> Need help? Message {business.name}
            </button>
          </div>
        )}

        <div className="border-t border-line bg-surface-2/60 px-4 py-3">
          <SecureBadges />
          <div className="mt-1.5 text-center text-[11px] text-muted">Payments processed by Razorpay · {business.legalName}</div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-2 rounded-xl border border-dashed border-line-strong px-3 py-2.5 text-xs text-muted">
        <span className="font-medium text-fg-2">Demo</span>
        <span>Next attempt</span>
        <Segmented
          size="xs"
          value={outcome}
          onChange={setOutcome}
          items={[
            { value: "success", label: "Succeeds" },
            { value: "failed", label: "Fails" },
          ]}
        />
        {view !== "form" && (
          <button className="font-medium text-primary hover:underline" onClick={() => setView("form")}>
            Reset
          </button>
        )}
      </div>

      <PoweredBy />
    </div>
  );
}

function AmountBlock({ link }: { link: PayLink }) {
  return (
    <div className="p-4 text-center sm:p-6">
      <div className="text-xs font-medium tracking-wide text-muted uppercase">{link.kind === "invoice" ? "Amount due" : "Deposit"}</div>
      <div className="mt-1 text-4xl font-semibold tracking-tight text-fg tabular">{formatCurrency(link.amount)}</div>
      <div className="mt-1.5 text-sm font-medium text-fg">{link.purpose}</div>
      <div className="mt-0.5 text-xs text-muted">
        For {link.customer} · Link expires {link.expires}
      </div>
      <p className="mx-auto mt-3 max-w-sm rounded-xl bg-surface-2 px-3 py-2 text-left text-xs text-fg-2">{link.note}</p>
    </div>
  );
}

function InvoiceBlock({ link, onDownload }: { link: PayLink; onDownload: () => void }) {
  // null = default: collapsed on phones (pay first), expanded on larger screens
  const [open, setOpen] = useState<boolean | null>(null);
  const inv = link.invoice!;
  const t = invoiceTotals(inv.lines);
  const roundOff = t.total - (t.subtotal + t.cgst + t.sgst);
  return (
    <div className="border-t border-line">
      <button
        onClick={() => setOpen((o) => (o === null ? !(typeof window !== "undefined" && window.matchMedia("(min-width: 640px)").matches) : !o))}
        aria-expanded={open ?? undefined}
        className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left text-sm font-semibold text-fg hover:bg-surface-2/60 sm:px-5"
      >
        <span className="inline-flex items-center gap-2">
          <FileText className="size-4 text-muted" aria-hidden /> Invoice {inv.number}
          <Badge>{inv.lines.length} items</Badge>
        </span>
        <span className="inline-flex items-center gap-1 text-xs font-normal text-muted">
          <span className={cn(open === null ? "sm:hidden" : open && "hidden")}>View</span>
          <ChevronDown className={cn("size-4 transition-transform", open === null ? "sm:rotate-180" : open && "rotate-180")} aria-hidden />
        </span>
      </button>
      {open !== false && (
        <div className={cn("px-4 pb-4 sm:px-5", open === null && "hidden sm:block")}>
          <div className="mb-2 flex flex-wrap justify-between gap-x-4 gap-y-0.5 text-[11px] text-muted">
            <span>Issued {inv.issued} · Due {inv.due}</span>
            <span>GSTIN {business.gstin}</span>
          </div>
          <ul className="divide-y divide-line rounded-xl border border-line">
            {inv.lines.map((l) => (
              <li key={l.description} className="flex items-start justify-between gap-3 px-3 py-2.5">
                <div className="min-w-0">
                  <div className="text-sm text-fg">{l.description}</div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[11px] text-muted">
                    <span className="tabular">
                      {l.qty} × {formatCurrency(l.rate)}
                    </span>
                    <span>· SAC/HSN {l.sac}</span>
                    {l.gst > 0 ? <Badge tone="info">{l.gst}% GST</Badge> : <Badge>GST exempt</Badge>}
                  </div>
                </div>
                <div className="shrink-0 text-sm text-fg tabular">{formatCurrency(l.qty * l.rate)}</div>
              </li>
            ))}
          </ul>
          <dl className="mt-3 space-y-1 text-sm">
            {[
              ["Subtotal", inr2.format(t.subtotal)],
              [`Taxable value (18%)`, inr2.format(t.taxable)],
              ["CGST @ 9%", inr2.format(t.cgst)],
              ["SGST @ 9%", inr2.format(t.sgst)],
              ["Round off", `${roundOff >= 0 ? "+" : "−"}${inr2.format(Math.abs(roundOff))}`],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-3">
                <dt className="text-muted">{k}</dt>
                <dd className="text-fg-2 tabular">{v}</dd>
              </div>
            ))}
            <div className="flex justify-between gap-3 border-t border-line pt-2 text-base font-semibold">
              <dt className="text-fg">Total</dt>
              <dd className="text-fg tabular">{formatCurrency(t.total)}</dd>
            </div>
          </dl>
          <Button variant="ghost" size="sm" className="mt-2 -ml-2" onClick={onDownload}>
            <Download /> Download invoice
          </Button>
        </div>
      )}
    </div>
  );
}

function downloadInvoice(link: PayLink, toast: ReturnType<typeof useToast>) {
  const inv = link.invoice!;
  const t = invoiceTotals(inv.lines);
  const lines = [
    `${business.legalName}`,
    `${business.locations[0].address}`,
    `GSTIN ${business.gstin}`,
    ``,
    `TAX INVOICE ${inv.number}   Issued ${inv.issued}   Due ${inv.due}`,
    `Bill to: ${link.customer} (${link.phone})`,
    ``,
    ...inv.lines.map((l) => `${l.description.padEnd(40)} ${String(l.qty).padStart(2)} x ${String(l.rate).padStart(6)}  GST ${String(l.gst).padStart(2)}%  ${String(l.qty * l.rate).padStart(7)}`),
    ``,
    `Subtotal ${t.subtotal.toFixed(2)}  CGST ${t.cgst.toFixed(2)}  SGST ${t.sgst.toFixed(2)}  TOTAL ${t.total.toFixed(2)}`,
  ];
  downloadFile(`${inv.number}.txt`, lines.join("\n"));
  toast({ title: "Invoice downloaded", description: `${inv.number}.txt` });
}

function Processing({ method, amount }: { method: string; amount: number }) {
  const [left, setLeft] = useState(299);
  useEffect(() => {
    const t = window.setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000);
    return () => window.clearInterval(t);
  }, []);
  const isUpi = !/card|netbanking/i.test(method);
  const app = method.split(" · ")[0];
  return (
    <div className="p-6 text-center" role="status">
      <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary-soft text-primary">
        {isUpi ? <Smartphone className="size-7" aria-hidden /> : <LoaderCircle className="size-7 animate-spin" aria-hidden />}
      </div>
      <h2 className="mt-4 text-lg font-semibold text-fg">{isUpi ? `Approve in ${app.startsWith("UPI") ? "your UPI app" : app}` : "Processing payment…"}</h2>
      <p className="mx-auto mt-1 max-w-xs text-sm text-muted">
        {isUpi
          ? `Open the app, check the ${formatCurrency(amount)} request from ${business.name} and enter your UPI PIN.`
          : method.startsWith("Netbanking")
            ? "You'll be redirected to your bank's secure login."
            : "Your bank may ask for a one-time password (OTP)."}
      </p>
      <div className="mt-5 flex items-center justify-center gap-2 text-sm text-fg-2">
        <LoaderCircle className="size-4 animate-spin text-primary" aria-hidden />
        Waiting for confirmation · <span className="tabular">{Math.floor(left / 60)}:{String(left % 60).padStart(2, "0")}</span>
      </div>
      <p className="mt-4 text-xs text-muted">Please don&apos;t press back or close this page.</p>
    </div>
  );
}
