"use client";

import { CheckCheck, IndianRupee, Link2, Lock, Search, ShieldCheck, Sparkles, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Avatar, Button, ChannelIcon, Field, Input, Label, Modal, Segmented, Select, Switch, Textarea, useToast } from "@/components/ui";
import { cn } from "@/lib/cn";
import { formatCurrency } from "@/lib/format";
import { allContacts, sellContactById, type Payment } from "@/lib/mock/sell";

type SendVia = "whatsapp" | "sms" | "email";
type Lang = "en" | "hinglish" | "mr";

const purposes = ["Consultation deposit", "Whitening consult deposit", "Cleaning & polishing", "Treatment instalment", "Ortho assessment deposit", "Invoice balance", "Annual plan (B2B)"];

function template(lang: Lang, first: string, purpose: string, amount: string, expiry: string) {
  if (lang === "hinglish")
    return `Namaste ${first} 🙏\nSmile Dental se aapka secure payment link: *${purpose}* ke liye ${amount}.\nUPI, card ya netbanking se pay kar sakte hain. Link ${expiry} tak valid hai.`;
  if (lang === "mr")
    return `नमस्कार ${first} 🙏\nSmile Dental कडून *${purpose}* साठी ${amount} चा सुरक्षित पेमेंट लिंक.\nUPI, कार्ड किंवा नेटबँकिंगने भरा. लिंक ${expiry} पर्यंत वैध आहे.`;
  return `Hi ${first} 👋\nHere's your secure payment link from Smile Dental for *${purpose}*: ${amount}.\nPay by UPI, card or netbanking. The link is valid until ${expiry}.`;
}

export interface PayLinkModalProps {
  open: boolean;
  onClose: () => void;
  defaultContactId?: string;
  defaultAmount?: number;
  defaultPurpose?: string;
  onCreate?: (payment: Payment) => void;
}

export function PayLinkModal(props: PayLinkModalProps) {
  if (!props.open) return null;
  return <PayLinkForm {...props} />;
}

function PayLinkForm({ onClose, defaultContactId, defaultAmount, defaultPurpose, onCreate }: PayLinkModalProps) {
  const toast = useToast();
  const [contactId, setContactId] = useState<string | undefined>(defaultContactId);
  const [query, setQuery] = useState("");
  const [amount, setAmount] = useState(defaultAmount ? String(defaultAmount) : "");
  const [purpose, setPurpose] = useState(defaultPurpose ?? purposes[0]);
  const [via, setVia] = useState<SendVia>("whatsapp");
  const [lang, setLang] = useState<Lang>("en");
  const [expiry, setExpiry] = useState("48h");
  const [upiOnly, setUpiOnly] = useState(false);
  const [partial, setPartial] = useState(false);
  const [autoRemind, setAutoRemind] = useState(true);
  const [custom, setCustom] = useState<string | null>(null);
  const [streaming, setStreaming] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearInterval(timer.current);
  }, []);

  const contact = contactId ? sellContactById(contactId) : undefined;
  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allContacts.filter((c) => !q || c.name.toLowerCase().includes(q) || c.phone.replace(/\s/g, "").includes(q.replace(/\s/g, "")) || c.company?.toLowerCase().includes(q)).slice(0, 5);
  }, [query]);

  const amountNum = Number(amount) || 0;
  const amountLabel = amountNum ? formatCurrency(amountNum) : "₹—";
  const expiryLabel = { "24h": "tomorrow, 11:20 AM", "48h": "Thu 29 Oct, 11:20 AM", "7d": "Tue 3 Nov", none: "you cancel it" }[expiry] ?? expiry;
  const first = contact?.name.split(" ")[0] ?? "there";
  const message = custom ?? template(lang, first, purpose, amountLabel, expiryLabel);
  const link = "rzp.io/i/sd7Kx2";
  const valid = Boolean(contact) && amountNum > 0;

  const aiRewrite = () => {
    if (timer.current) clearInterval(timer.current);
    const target =
      lang === "en"
        ? `Hi ${first}! 😊 Thanks for choosing Smile Dental. To lock in your slot, here's a quick ${amountLabel} payment for ${purpose.toLowerCase()}. It takes 10 seconds on GPay/PhonePe, and it's fully adjustable against your final bill.`
        : lang === "hinglish"
          ? `Hi ${first}! 😊 Smile Dental choose karne ke liye thank you. Aapka slot confirm karne ke liye ${amountLabel} ka chhota sa payment (${purpose.toLowerCase()}). GPay/PhonePe se 10 second lagenge, aur yeh final bill mein adjust ho jayega.`
          : `नमस्कार ${first}! 😊 Smile Dental निवडल्याबद्दल धन्यवाद. तुमचा स्लॉट निश्चित करण्यासाठी ${amountLabel} (${purpose}). GPay/PhonePe ने १० सेकंदात भरा; ही रक्कम अंतिम बिलात समायोजित होईल.`;
    setStreaming(true);
    setCustom("");
    let i = 0;
    timer.current = setInterval(() => {
      i += 4;
      setCustom(target.slice(0, i));
      if (i >= target.length) {
        if (timer.current) clearInterval(timer.current);
        setStreaming(false);
      }
    }, 18);
  };

  const submit = () => {
    if (!contact) return;
    const payment: Payment = {
      id: `PL-${2292 + Math.floor(amountNum % 97)}`,
      contactId: contact.id,
      amount: amountNum,
      purpose,
      status: "pending",
      channel: via,
      gateway: "Razorpay",
      created: "Just now",
      days: 0,
    };
    onCreate?.(payment);
    toast({
      title: `Pay link sent to ${contact.name}`,
      description: `${formatCurrency(amountNum)} · via ${via === "whatsapp" ? "WhatsApp" : via === "sms" ? "SMS" : "email"}${autoRemind ? " · AI will remind in 24h if unpaid" : ""}`,
    });
    onClose();
  };

  return (
    <Modal
      open
      onClose={onClose}
      size="xl"
      title="Create pay link"
      description="Text-to-pay via Razorpay. Customers pay by UPI, card or netbanking; status syncs to the contact and deal."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="outline"
            disabled={!valid}
            onClick={() => toast({ title: "Link copied", description: `https://${link}`, tone: "info" })}
          >
            <Link2 /> Copy link only
          </Button>
          <Button disabled={!valid} onClick={submit}>
            Send pay link
          </Button>
        </>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <div>
            <Label>Contact</Label>
            {contact ? (
              <div className="flex items-center gap-3 rounded-lg border border-line bg-surface-2 px-3 py-2">
                <Avatar name={contact.name} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{contact.name}</div>
                  <div className="truncate text-xs text-muted">
                    {contact.phone}
                    {contact.company && ` · ${contact.company}`}
                  </div>
                </div>
                <Button variant="ghost" size="icon-sm" aria-label="Change contact" onClick={() => setContactId(undefined)}>
                  <X />
                </Button>
              </div>
            ) : (
              <div>
                <Input icon={<Search />} placeholder="Search name, phone or company" value={query} onChange={(e) => setQuery(e.target.value)} autoFocus />
                <ul className="mt-1.5 divide-y divide-line overflow-hidden rounded-lg border border-line">
                  {matches.map((c) => (
                    <li key={c.id}>
                      <button className="flex w-full items-center gap-2.5 px-3 py-2 text-left hover:bg-surface-2" onClick={() => setContactId(c.id)}>
                        <Avatar name={c.name} size="xs" />
                        <span className="min-w-0 flex-1 truncate text-sm">{c.name}</span>
                        <span className="hidden text-xs text-muted sm:inline">{c.phone}</span>
                      </button>
                    </li>
                  ))}
                  {matches.length === 0 && <li className="px-3 py-3 text-sm text-muted">No contacts match “{query}”.</li>}
                </ul>
              </div>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Amount">
              <Input icon={<IndianRupee />} inputMode="numeric" placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ""))} />
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {[300, 500, 2000, 10000].map((v) => (
                  <button
                    key={v}
                    onClick={() => setAmount(String(v))}
                    className={cn("rounded-full border px-2 py-0.5 text-xs", amountNum === v ? "border-primary bg-primary-soft text-primary" : "border-line text-fg-2 hover:bg-surface-2")}
                  >
                    {formatCurrency(v)}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Purpose">
              <Select value={purpose} onChange={(e) => setPurpose(e.target.value)}>
                {purposes.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </Select>
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Send via</Label>
              <Segmented
                value={via}
                onChange={setVia}
                items={[
                  { value: "whatsapp", label: "WhatsApp" },
                  { value: "sms", label: "SMS" },
                  { value: "email", label: "Email" },
                ]}
              />
            </div>
            <Field label="Link expires">
              <Select value={expiry} onChange={(e) => setExpiry(e.target.value)}>
                <option value="24h">In 24 hours</option>
                <option value="48h">In 48 hours</option>
                <option value="7d">In 7 days</option>
                <option value="none">Never</option>
              </Select>
            </Field>
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <Label className="mb-0">Message</Label>
              <div className="flex items-center gap-2">
                <Select value={lang} onChange={(e) => { setLang(e.target.value as Lang); setCustom(null); }} className="h-7! w-auto! py-0! text-xs" aria-label="Message language">
                  <option value="en">English</option>
                  <option value="hinglish">Hinglish</option>
                  <option value="mr">मराठी</option>
                </Select>
                <Button size="xs" variant="ai" onClick={aiRewrite} disabled={streaming}>
                  <Sparkles /> {streaming ? "Writing…" : "AI rewrite"}
                </Button>
              </div>
            </div>
            <Textarea rows={4} value={message} onChange={(e) => setCustom(e.target.value)} />
            <p className="mt-1 text-xs text-muted">The pay link is appended automatically.{via === "sms" && " SMS uses the DLT-approved template “SMLDNT-PAY-02”."}</p>
          </div>

          <div className="space-y-2.5 rounded-lg border border-line p-3">
            {[
              { label: "UPI only (lowest fees, 0% MDR)", value: upiOnly, set: setUpiOnly },
              { label: "Allow partial payment", value: partial, set: setPartial },
              { label: "AI reminds if unpaid after 24h and 72h", value: autoRemind, set: setAutoRemind },
            ].map((o) => (
              <div key={o.label} className="flex items-center justify-between gap-3 text-sm">
                <span className="text-fg-2">{o.label}</span>
                <Switch checked={o.value} onChange={o.set} label={o.label} size="sm" />
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label>Live preview</Label>
          <MessagePreview via={via} message={message} amount={amountLabel} purpose={purpose} link={link} upiOnly={upiOnly} contactName={contact?.name} />
        </div>
      </div>
    </Modal>
  );
}

function renderBold(text: string) {
  return text.split(/(\*[^*]+\*)/g).map((part, i) =>
    part.startsWith("*") && part.endsWith("*") ? (
      <strong key={i} className="font-semibold">
        {part.slice(1, -1)}
      </strong>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

export function MessagePreview({
  via,
  message,
  amount,
  purpose,
  link,
  upiOnly,
  contactName,
}: {
  via: SendVia;
  message: string;
  amount: string;
  purpose: string;
  link: string;
  upiOnly?: boolean;
  contactName?: string;
}) {
  if (via === "email") {
    return (
      <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-card">
        <div className="space-y-0.5 border-b border-line bg-surface-2 px-4 py-2.5 text-xs">
          <div><span className="text-muted">From:</span> Smile Dental &lt;billing@smiledental.in&gt;</div>
          <div><span className="text-muted">To:</span> {contactName ?? "—"}</div>
          <div className="font-medium text-fg">Payment request: {purpose} ({amount})</div>
        </div>
        <div className="space-y-3 px-4 py-4 text-sm">
          <p className="whitespace-pre-line text-fg-2">{message.replace(/\*/g, "")}</p>
          <div className="rounded-lg border border-line p-3 text-center">
            <div className="text-xs text-muted">Amount due</div>
            <div className="text-xl font-semibold">{amount}</div>
            <div className="mt-2 rounded-md bg-primary py-1.5 text-sm font-medium text-primary-fg">Pay securely</div>
            <div className="mt-2 inline-flex items-center gap-1 text-[11px] text-muted"><Lock className="size-3" /> Secured by Razorpay</div>
          </div>
        </div>
      </div>
    );
  }
  if (via === "sms") {
    return (
      <div className="rounded-[28px] border border-line bg-surface-2 p-3 shadow-card">
        <div className="mb-3 text-center text-[11px] text-muted">
          <div className="font-medium text-fg-2">VM-SMLDNT</div>
          Text message · Today 11:20 AM
        </div>
        <div className="max-w-[90%] rounded-2xl rounded-bl-md bg-surface-3 px-3 py-2 text-[13px] leading-snug text-fg">
          <span className="whitespace-pre-line">{message.replace(/\*/g, "")}</span> <span className="text-info underline">https://{link}</span>
          <div className="mt-1 text-[11px] text-muted">-Smile Dental. Reply STOP to opt out</div>
        </div>
      </div>
    );
  }
  return (
    <div className="overflow-hidden rounded-[28px] border border-line shadow-card">
      <div className="flex items-center gap-2 bg-[#075e54] px-3 py-2.5 text-white">
        <span className="flex size-7 items-center justify-center rounded-full bg-white/20 text-[11px] font-semibold">SD</span>
        <div className="min-w-0 flex-1 leading-tight">
          <div className="flex items-center gap-1 text-sm font-medium">
            Smile Dental <ShieldCheck className="size-3.5" aria-label="Verified business" />
          </div>
          <div className="text-[11px] opacity-80">Business account</div>
        </div>
        <ChannelIcon channel="whatsapp" size="xs" className="bg-white/20 text-white" />
      </div>
      <div className="space-y-2 bg-surface-2 px-3 py-4">
        <div className="mx-auto w-fit rounded-md bg-surface px-2 py-0.5 text-[10px] text-muted shadow-card">TODAY</div>
        <div className="max-w-[92%] rounded-xl rounded-tl-sm bg-surface px-3 py-2 text-[13px] leading-snug text-fg shadow-card">
          <div className="whitespace-pre-line">{renderBold(message)}</div>
          <div className="mt-2 overflow-hidden rounded-lg border border-line">
            <div className="bg-surface-2 px-2.5 py-2">
              <div className="text-[11px] text-muted">Razorpay · {upiOnly ? "UPI" : "UPI, cards, netbanking"}</div>
              <div className="text-sm font-semibold">{amount}</div>
              <div className="truncate text-[11px] text-muted">{purpose}</div>
            </div>
          </div>
          <div className="mt-1 flex items-center justify-end gap-1 text-[10px] text-muted">
            11:20 AM <CheckCheck className="size-3 text-info" aria-label="Read" />
          </div>
          <div className="-mx-3 mt-2 border-t border-line pt-1.5 text-center text-sm font-medium text-info">Pay {amount}</div>
        </div>
      </div>
    </div>
  );
}
