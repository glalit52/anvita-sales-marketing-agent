"use client";

import { Check, ChevronDown, CreditCard, Landmark, Lock, QrCode, Smartphone } from "lucide-react";
import { useState } from "react";
import { Button, Checkbox, Input } from "@/components/ui";
import { cn } from "@/lib/cn";
import { formatCurrency } from "@/lib/format";
import { banks, upiApps } from "@/lib/mock/public";

export type MethodId = "upi" | "card" | "netbanking";

/** Decorative QR (deterministic pattern with finder squares). QR codes stay black-on-white in both themes. */
export function MockQr({ seed = "anvita", size = 168 }: { seed?: string; size?: number }) {
  const n = 25;
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const cells: [number, number][] = [];
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const finder = (x < 8 && y < 8) || (x > n - 9 && y < 8) || (x < 8 && y > n - 9);
      if (finder) continue;
      h = (h * 1103515245 + 12345) >>> 0;
      if ((h >>> 16) % 100 < 46) cells.push([x, y]);
    }
  }
  const finders = [
    [0, 0],
    [n - 7, 0],
    [0, n - 7],
  ];
  return (
    <svg viewBox={`-2 -2 ${n + 4} ${n + 4}`} width={size} height={size} role="img" aria-label="UPI QR code" className="rounded-lg bg-white">
      {cells.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill="#111" />
      ))}
      {finders.map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <rect x={x} y={y} width={7} height={7} fill="#111" />
          <rect x={x + 1} y={y + 1} width={5} height={5} fill="#fff" />
          <rect x={x + 2} y={y + 2} width={3} height={3} fill="#111" />
        </g>
      ))}
    </svg>
  );
}

function cardBrand(num: string) {
  if (num.startsWith("4")) return "Visa";
  if (/^5[1-5]/.test(num)) return "Mastercard";
  if (/^(60|65|81|82|508)/.test(num)) return "RuPay";
  if (/^3[47]/.test(num)) return "Amex";
  return "";
}

export function PaymentMethods({
  amount,
  onPay,
  seed,
  payeeVpa = "smiledental@hdfcbank",
}: {
  amount: number;
  onPay: (method: string) => void;
  seed?: string;
  payeeVpa?: string;
}) {
  const [method, setMethod] = useState<MethodId>("upi");
  const [vpa, setVpa] = useState("");
  const [vpaVerified, setVpaVerified] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [card, setCard] = useState({ number: "", name: "", expiry: "", cvv: "" });
  const [saveCard, setSaveCard] = useState(false);
  const [bank, setBank] = useState<string | null>(null);

  const digits = card.number.replace(/\D/g, "");
  const cardValid = digits.length >= 15 && /^\d{2}\/\d{2}$/.test(card.expiry) && card.cvv.length >= 3 && card.name.trim().length > 1;
  const vpaValid = /^[\w.-]{2,}@[a-z]{2,}$/i.test(vpa.trim());

  const verify = () => {
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      setVpaVerified(vpa.trim());
    }, 900);
  };

  const tabs: { id: MethodId; label: string; icon: typeof CreditCard; hint: string }[] = [
    { id: "upi", label: "UPI", icon: Smartphone, hint: "Instant" },
    { id: "card", label: "Card", icon: CreditCard, hint: "Debit / credit" },
    { id: "netbanking", label: "Netbanking", icon: Landmark, hint: "All banks" },
  ];

  return (
    <div>
      <div role="tablist" aria-label="Payment method" className="grid grid-cols-3 gap-2">
        {tabs.map(({ id, label, icon: Icon, hint }) => (
          <button
            key={id}
            role="tab"
            aria-selected={method === id}
            onClick={() => setMethod(id)}
            className={cn(
              "flex flex-col items-center gap-1 rounded-xl border px-2 py-2.5 text-center transition-colors",
              method === id ? "border-primary bg-primary-soft text-primary" : "border-line bg-surface text-fg-2 hover:border-line-strong",
            )}
          >
            <Icon className="size-5" aria-hidden />
            <span className="text-sm font-semibold">{label}</span>
            <span className={cn("text-[10px]", method === id ? "text-primary" : "text-muted")}>{hint}</span>
          </button>
        ))}
      </div>

      <div className="mt-4">
        {method === "upi" && (
          <div className="space-y-4">
            <div>
              <div className="mb-2 text-xs font-medium text-fg-2">Pay with a UPI app</div>
              <div className="grid grid-cols-4 gap-2">
                {upiApps.map((app) => (
                  <button
                    key={app.id}
                    onClick={() => onPay(app.name)}
                    className="flex flex-col items-center gap-1.5 rounded-xl border border-line bg-surface px-1 py-2.5 text-[11px] font-medium text-fg-2 transition-colors hover:border-line-strong hover:bg-surface-2"
                  >
                    <span className={cn("flex size-9 items-center justify-center rounded-full text-sm font-bold", app.className)} aria-hidden>
                      {app.mark}
                    </span>
                    {app.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-line bg-surface-2/60 p-3">
              <button
                className="flex w-full items-center justify-between gap-2 text-left text-sm font-medium text-fg sm:pointer-events-none"
                onClick={() => setShowQr((v) => !v)}
                aria-expanded={showQr}
              >
                <span className="inline-flex items-center gap-2">
                  <QrCode className="size-4 text-muted" aria-hidden />
                  Scan QR from another phone
                </span>
                <ChevronDown className={cn("size-4 text-muted transition-transform sm:hidden", showQr && "rotate-180")} aria-hidden />
              </button>
              <div className={cn("mt-3 flex-col items-center gap-2 sm:flex", showQr ? "flex" : "hidden")}>
                <div className="rounded-xl border border-line bg-white p-2">
                  <MockQr seed={seed} />
                </div>
                <div className="text-center text-xs text-muted">
                  Pay {formatCurrency(amount)} to <span className="font-medium text-fg-2">{payeeVpa}</span>
                  <br />
                  Works with any UPI app · QR valid for 10 minutes
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="vpa" className="mb-1.5 block text-xs font-medium text-fg-2">
                Or enter your UPI ID
              </label>
              <div className="flex gap-2">
                <Input
                  id="vpa"
                  value={vpa}
                  onChange={(e) => {
                    setVpa(e.target.value);
                    setVpaVerified(null);
                  }}
                  placeholder="yourname@okhdfcbank"
                  autoComplete="off"
                  inputMode="email"
                  className="h-11 text-base sm:text-sm"
                />
                <Button variant="outline" className="h-11" disabled={!vpaValid || verifying || vpaVerified !== null} onClick={verify}>
                  {verifying ? "Checking…" : vpaVerified ? <Check className="text-success" aria-label="Verified" /> : "Verify"}
                </Button>
              </div>
              {vpaVerified && (
                <div className="mt-1.5 inline-flex items-center gap-1 text-xs text-success">
                  <Check className="size-3.5" aria-hidden /> Verified · we&apos;ll send a collect request to {vpaVerified}
                </div>
              )}
            </div>
            <Button size="lg" className="w-full" disabled={!vpaVerified} onClick={() => onPay(`UPI · ${vpaVerified}`)}>
              <Lock /> Pay {formatCurrency(amount)}
            </Button>
          </div>
        )}

        {method === "card" && (
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (cardValid) onPay(`${cardBrand(digits) || "Card"} •••• ${digits.slice(-4)}`);
            }}
          >
            <div>
              <label htmlFor="cc-number" className="mb-1.5 block text-xs font-medium text-fg-2">
                Card number
              </label>
              <div className="relative">
                <Input
                  id="cc-number"
                  inputMode="numeric"
                  autoComplete="cc-number"
                  placeholder="1234 5678 9012 3456"
                  value={card.number}
                  onChange={(e) => {
                    const d = e.target.value.replace(/\D/g, "").slice(0, 16);
                    setCard((c) => ({ ...c, number: d.replace(/(\d{4})(?=\d)/g, "$1 ") }));
                  }}
                  className="h-11 pr-24 text-base tabular sm:text-sm"
                />
                {cardBrand(digits) && (
                  <span className="absolute top-1/2 right-3 -translate-y-1/2 rounded bg-surface-2 px-1.5 py-0.5 text-[11px] font-semibold text-fg-2">
                    {cardBrand(digits)}
                  </span>
                )}
              </div>
            </div>
            <div>
              <label htmlFor="cc-name" className="mb-1.5 block text-xs font-medium text-fg-2">
                Name on card
              </label>
              <Input id="cc-name" autoComplete="cc-name" placeholder="As printed on the card" value={card.name} onChange={(e) => setCard((c) => ({ ...c, name: e.target.value }))} className="h-11 text-base sm:text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="cc-exp" className="mb-1.5 block text-xs font-medium text-fg-2">
                  Expiry
                </label>
                <Input
                  id="cc-exp"
                  inputMode="numeric"
                  autoComplete="cc-exp"
                  placeholder="MM/YY"
                  value={card.expiry}
                  onChange={(e) => {
                    const d = e.target.value.replace(/\D/g, "").slice(0, 4);
                    setCard((c) => ({ ...c, expiry: d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d }));
                  }}
                  className="h-11 text-base tabular sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="cc-cvv" className="mb-1.5 block text-xs font-medium text-fg-2">
                  CVV
                </label>
                <Input
                  id="cc-cvv"
                  type="password"
                  inputMode="numeric"
                  autoComplete="cc-csc"
                  placeholder="•••"
                  value={card.cvv}
                  onChange={(e) => setCard((c) => ({ ...c, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) }))}
                  className="h-11 text-base tabular sm:text-sm"
                />
              </div>
            </div>
            <label className="flex items-start gap-2 text-xs text-fg-2">
              <span className="mt-0.5">
                <Checkbox checked={saveCard} onChange={setSaveCard} label="Save card" />
              </span>
              Save this card securely for next time (RBI-compliant tokenisation, CVV is never stored)
            </label>
            <Button type="submit" size="lg" className="w-full" disabled={!cardValid}>
              <Lock /> Pay {formatCurrency(amount)}
            </Button>
            <p className="text-center text-[11px] text-muted">Visa, Mastercard, RuPay and Amex accepted. You may be asked for an OTP by your bank.</p>
          </form>
        )}

        {method === "netbanking" && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {banks.map((b) => (
                <button
                  key={b}
                  onClick={() => setBank(b)}
                  aria-pressed={bank === b}
                  className={cn(
                    "flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm transition-colors",
                    bank === b ? "border-primary bg-primary-soft text-primary" : "border-line bg-surface text-fg-2 hover:border-line-strong",
                  )}
                >
                  <Landmark className="size-4 shrink-0" aria-hidden />
                  <span className="min-w-0 truncate">{b}</span>
                </button>
              ))}
            </div>
            <Button size="lg" className="w-full" disabled={!bank} onClick={() => bank && onPay(`Netbanking · ${bank}`)}>
              <Lock /> {bank ? `Pay ${formatCurrency(amount)} via ${bank.split(" ")[0]}` : "Select your bank"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
