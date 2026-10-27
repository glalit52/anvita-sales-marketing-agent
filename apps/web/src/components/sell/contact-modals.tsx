"use client";

import { ArrowRight, CheckCircle2, FileSpreadsheet, Sparkles, TriangleAlert, Upload, Users } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Badge, Button, ChannelIcon, Checkbox, Field, Input, Modal, Progress, Select, Switch, useToast } from "@/components/ui";
import { cn } from "@/lib/cn";
import { formatNumber } from "@/lib/format";
import { stageMeta, team, type Contact, type Stage } from "@/lib/mock/core";
import { savedSequences, sources } from "@/lib/mock/sell";

/* ------------------------------------------------------------------ */
/* Add contact                                                         */
/* ------------------------------------------------------------------ */

export function AddContactModal({ open, onClose, onCreate }: { open: boolean; onClose: () => void; onCreate: (c: Contact) => void }) {
  if (!open) return null;
  return <AddContactForm onClose={onClose} onCreate={onCreate} />;
}

function AddContactForm({ onClose, onCreate }: { onClose: () => void; onCreate: (c: Contact) => void }) {
  const toast = useToast();
  const [form, setForm] = useState({
    name: "",
    phone: "+91 ",
    email: "",
    company: "",
    city: "Pune",
    source: "Walk-in",
    stage: "new" as Stage,
    ownerId: "ai",
    tags: "",
    language: "English",
  });
  const [consent, setConsent] = useState({ whatsapp: true, sms: false, email: false });
  const [touched, setTouched] = useState(false);
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));
  const digits = form.phone.replace(/\D/g, "");
  const phoneOk = digits.length >= 12;
  const valid = form.name.trim().length > 1 && phoneOk;

  const save = () => {
    setTouched(true);
    if (!valid) return;
    const contact: Contact = {
      id: `c${100 + Math.floor(digits.length * 7 + form.name.length)}-${digits.slice(-4)}`,
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email || undefined,
      company: form.company || undefined,
      city: form.city,
      stage: form.stage,
      source: form.source,
      channel: consent.whatsapp ? "whatsapp" : "sms",
      tags: form.tags.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean),
      ownerId: form.ownerId,
      score: 50,
      value: 0,
      lastActivity: "Just now",
      createdAt: "2026-10-27",
      language: form.language,
    };
    onCreate(contact);
    toast({ title: `${contact.name} added`, description: form.ownerId === "ai" ? "AI will send a welcome message and qualify the lead." : "Assigned and visible in Contacts." });
    onClose();
  };

  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      title="Add contact"
      description="Duplicates are matched on phone and email automatically."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save}>Save contact</Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name">
          <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Shalini Kumar" autoFocus aria-invalid={touched && form.name.trim().length < 2} />
          {touched && form.name.trim().length < 2 && <p className="mt-1 text-xs text-danger">Name is required.</p>}
        </Field>
        <Field label="Mobile (WhatsApp)">
          <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+91 98xxx xxxxx" inputMode="tel" aria-invalid={touched && !phoneOk} />
          {touched && !phoneOk && <p className="mt-1 text-xs text-danger">Enter a 10-digit Indian mobile number.</p>}
        </Field>
        <Field label="Email" hint="optional">
          <Input value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="name@example.com" type="email" />
        </Field>
        <Field label="Company" hint="for B2B">
          <Input value={form.company} onChange={(e) => set("company", e.target.value)} placeholder="e.g. AgriGrow Inputs" />
        </Field>
        <Field label="City">
          <Input value={form.city} onChange={(e) => set("city", e.target.value)} />
        </Field>
        <Field label="Preferred language">
          <Select value={form.language} onChange={(e) => set("language", e.target.value)}>
            {["English", "Hindi", "Marathi", "Gujarati", "Tamil", "Telugu", "Bengali", "Malayalam"].map((l) => (
              <option key={l}>{l}</option>
            ))}
          </Select>
        </Field>
        <Field label="Source">
          <Select value={form.source} onChange={(e) => set("source", e.target.value)}>
            {sources.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </Select>
        </Field>
        <Field label="Stage">
          <Select value={form.stage} onChange={(e) => set("stage", e.target.value as Stage)}>
            {(Object.keys(stageMeta) as Stage[]).map((s) => (
              <option key={s} value={s}>
                {stageMeta[s].label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Owner">
          <Select value={form.ownerId} onChange={(e) => set("ownerId", e.target.value)}>
            <option value="ai">AI agent (auto-qualify)</option>
            {team.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Tags" hint="comma-separated">
          <Input value={form.tags} onChange={(e) => set("tags", e.target.value)} placeholder="implants, emi" />
        </Field>
      </div>
      <div className="mt-5 rounded-lg border border-line p-3">
        <div className="mb-2 text-xs font-semibold tracking-wide text-muted uppercase">Marketing consent captured</div>
        <div className="space-y-2">
          {(["whatsapp", "sms", "email"] as const).map((ch) => (
            <label key={ch} className="flex items-center gap-2.5 text-sm">
              <Checkbox checked={consent[ch]} onChange={(v) => setConsent((c) => ({ ...c, [ch]: v }))} label={`${ch} consent`} />
              <ChannelIcon channel={ch} size="xs" />
              <span className="text-fg-2">
                Contact agreed to receive {ch === "whatsapp" ? "WhatsApp" : ch === "sms" ? "SMS" : "email"} offers and updates
              </span>
            </label>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted">Logged with your name and a timestamp as the consent source.</p>
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Import CSV                                                          */
/* ------------------------------------------------------------------ */

const csvColumns = [
  { name: "Patient Name", sample: "Shalini Kumar", field: "name", confidence: 99 },
  { name: "Mobile No", sample: "9822012345", field: "phone", confidence: 98 },
  { name: "E-mail", sample: "shalini.k@gmail.com", field: "email", confidence: 97 },
  { name: "Last Visit", sample: "12/08/2026", field: "lastVisit", confidence: 88 },
  { name: "Treatment", sample: "Scaling", field: "tags", confidence: 74 },
  { name: "Branch", sample: "KP", field: "location", confidence: 91 },
  { name: "Ref By", sample: "Dr. Kulkarni", field: "source", confidence: 66 },
  { name: "Remarks", sample: "Prefers evening", field: "skip", confidence: 0 },
];

const anvitaFields = [
  { value: "name", label: "Full name" },
  { value: "phone", label: "Mobile (WhatsApp)" },
  { value: "email", label: "Email" },
  { value: "company", label: "Company" },
  { value: "city", label: "City" },
  { value: "tags", label: "Tags" },
  { value: "source", label: "Source" },
  { value: "location", label: "Location" },
  { value: "lastVisit", label: "Custom: Last visit date" },
  { value: "note", label: "Note" },
  { value: "skip", label: "Don't import" },
];

export function ImportCsvModal({ open, onClose, onImported }: { open: boolean; onClose: () => void; onImported?: (count: number) => void }) {
  if (!open) return null;
  return <ImportFlow onClose={onClose} onImported={onImported} />;
}

function ImportFlow({ onClose, onImported }: { onClose: () => void; onImported?: (count: number) => void }) {
  const toast = useToast();
  const [step, setStep] = useState(0);
  const [file, setFile] = useState<string | null>(null);
  const [mapping, setMapping] = useState(() => Object.fromEntries(csvColumns.map((c) => [c.name, c.field])));
  const [consentBasis, setConsentBasis] = useState("existing");
  const [tag, setTag] = useState("import-oct-2026");
  const [dedupe, setDedupe] = useState("merge");
  const [enrol, setEnrol] = useState(true);
  const [progress, setProgress] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, []);

  const steps = ["Upload", "Map columns", "Review", "Import"];
  const mappedCount = Object.values(mapping).filter((v) => v !== "skip").length;
  const hasPhone = Object.values(mapping).includes("phone");

  const runImport = () => {
    setStep(3);
    setProgress(0);
    timer.current = setInterval(() => {
      setProgress((p) => {
        const next = Math.min(100, p + 9);
        if (next >= 100 && timer.current) clearInterval(timer.current);
        return next;
      });
    }, 120);
  };

  const done = step === 3 && progress >= 100;

  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      title="Import contacts from CSV"
      description="Bring in patient lists from your practice software, Excel or Google Sheets."
      footer={
        step === 3 ? (
          <Button
            disabled={!done}
            onClick={() => {
              onImported?.(231);
              toast({ title: "231 contacts imported", description: "12 merged with existing records · 5 skipped (invalid phone)." });
              onClose();
            }}
          >
            {done ? "Done" : "Importing…"}
          </Button>
        ) : (
          <>
            <Button variant="ghost" onClick={step === 0 ? onClose : () => setStep(step - 1)}>
              {step === 0 ? "Cancel" : "Back"}
            </Button>
            {step < 2 ? (
              <Button disabled={(step === 0 && !file) || (step === 1 && !hasPhone)} onClick={() => setStep(step + 1)}>
                Continue <ArrowRight />
              </Button>
            ) : (
              <Button onClick={runImport}>Import 243 contacts</Button>
            )}
          </>
        )
      }
    >
      <ol className="mb-5 flex items-center gap-2 text-xs">
        {steps.map((s, i) => (
          <li key={s} className="flex min-w-0 items-center gap-2">
            <span
              className={cn(
                "flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold",
                i < step ? "bg-success text-white" : i === step ? "bg-primary text-primary-fg" : "bg-surface-3 text-muted",
              )}
            >
              {i < step ? <CheckCircle2 className="size-3.5" /> : i + 1}
            </span>
            <span className={cn("hidden truncate sm:inline", i === step ? "font-medium text-fg" : "text-muted")}>{s}</span>
            {i < steps.length - 1 && <span className="h-px w-4 bg-line sm:w-8" />}
          </li>
        ))}
      </ol>

      {step === 0 && (
        <div>
          <button
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const f = e.dataTransfer.files[0];
              if (f) setFile(f.name);
            }}
            className={cn(
              "flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors",
              file ? "border-success/40 bg-success-soft/40" : "border-line-strong hover:border-primary hover:bg-primary-soft/40",
            )}
          >
            {file ? <FileSpreadsheet className="mb-2 size-8 text-success" /> : <Upload className="mb-2 size-8 text-muted" />}
            <div className="text-sm font-medium">{file ?? "Drop a .csv or .xlsx file here, or click to browse"}</div>
            <div className="mt-1 text-xs text-muted">{file ? "248 rows · 8 columns detected" : "Up to 50,000 rows · UTF-8"}</div>
          </button>
          <input
            ref={inputRef}
            type="file"
            accept=".csv,.xlsx"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) setFile(f.name);
            }}
          />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
            <span>Exports from Practo, Dentee, Zoho and Excel work out of the box.</span>
            <Button size="xs" variant="outline" onClick={() => setFile("smile-dental-patients-oct.csv")}>
              Use sample file
            </Button>
          </div>
        </div>
      )}

      {step === 1 && (
        <div>
          <div className="mb-3 flex items-start gap-2 rounded-lg bg-ai-soft/60 px-3 py-2 text-sm text-fg-2">
            <Sparkles className="mt-0.5 size-4 shrink-0 text-ai" />
            <span>
              AI mapped <b className="text-fg">{mappedCount} of {csvColumns.length}</b> columns. Check the low-confidence ones (below 80%).
            </span>
          </div>
          <div className="overflow-x-auto rounded-lg border border-line">
            <table className="w-full min-w-[520px] text-sm">
              <thead className="bg-surface-2 text-xs text-muted">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">CSV column</th>
                  <th className="px-3 py-2 text-left font-medium">Sample</th>
                  <th className="px-3 py-2 text-left font-medium">Anvita field</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {csvColumns.map((c) => (
                  <tr key={c.name}>
                    <td className="px-3 py-2 font-medium">{c.name}</td>
                    <td className="max-w-32 truncate px-3 py-2 text-muted">{c.sample}</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <div className="w-48 shrink-0">
                        <Select value={mapping[c.name]} onChange={(e) => setMapping((m) => ({ ...m, [c.name]: e.target.value }))} className="h-8! text-xs" aria-label={`Map ${c.name}`}>
                          {anvitaFields.map((f) => (
                            <option key={f.value} value={f.value}>
                              {f.label}
                            </option>
                          ))}
                        </Select>
                        </div>
                        {c.confidence > 0 && mapping[c.name] === c.field && (
                          <Badge tone={c.confidence >= 80 ? "ai" : "warning"}>
                            {c.confidence < 80 && <TriangleAlert />} AI {c.confidence}%
                          </Badge>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!hasPhone && <p className="mt-2 text-xs text-danger">Map a column to Mobile (WhatsApp); it is required to message contacts.</p>}
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "New contacts", value: 231, tone: "text-success", icon: CheckCircle2 },
              { label: "Duplicates", value: 12, tone: "text-info", icon: Users },
              { label: "Invalid phone", value: 5, tone: "text-danger", icon: TriangleAlert },
            ].map((s) => (
              <div key={s.label} className="rounded-lg border border-line p-3">
                <s.icon className={cn("mb-1 size-4", s.tone)} />
                <div className="text-lg font-semibold tabular">{formatNumber(s.value)}</div>
                <div className="text-xs text-muted">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Duplicates (matched on phone)">
              <Select value={dedupe} onChange={(e) => setDedupe(e.target.value)}>
                <option value="merge">Merge, keep existing values</option>
                <option value="overwrite">Merge, overwrite with CSV</option>
                <option value="skip">Skip duplicates</option>
              </Select>
            </Field>
            <Field label="Tag all imported contacts">
              <Input value={tag} onChange={(e) => setTag(e.target.value)} />
            </Field>
          </div>
          <Field label="Marketing consent for this list" hint="required for WhatsApp/SMS campaigns">
            <Select value={consentBasis} onChange={(e) => setConsentBasis(e.target.value)}>
              <option value="existing">Patients gave WhatsApp + SMS consent on the clinic intake form</option>
              <option value="whatsapp">WhatsApp only (consent collected at reception)</option>
              <option value="none">No marketing consent: transactional messages only</option>
            </Select>
          </Field>
          <div className="flex items-center justify-between gap-3 rounded-lg border border-line p-3 text-sm">
            <div>
              <div className="font-medium">Let AI re-engage patients not seen in 6+ months</div>
              <div className="text-xs text-muted">86 contacts qualify · enrols them in “6-month recall”</div>
            </div>
            <Switch checked={enrol} onChange={setEnrol} label="Enrol in recall sequence" />
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="py-6 text-center">
          {done ? <CheckCircle2 className="mx-auto mb-3 size-10 text-success" /> : <FileSpreadsheet className="mx-auto mb-3 size-10 text-primary" />}
          <div className="text-sm font-medium">{done ? "Import complete" : `Importing ${file ?? "file"}…`}</div>
          <Progress value={progress} tone={done ? "success" : "primary"} className="mx-auto mt-3 max-w-sm" />
          <div className="mt-2 text-xs text-muted tabular">{Math.round((progress / 100) * 243)} / 243 rows</div>
        </div>
      )}
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Bulk actions                                                        */
/* ------------------------------------------------------------------ */

export function BulkSequenceModal({ open, count, onClose, onConfirm }: { open: boolean; count: number; onClose: () => void; onConfirm: (sequence: string) => void }) {
  const [seq, setSeq] = useState(savedSequences[0].id);
  const chosen = savedSequences.find((s) => s.id === seq)!;
  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      title="Add to sequence"
      description={`${count} contact${count === 1 ? "" : "s"} selected. Contacts without consent for the channel are skipped.`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => onConfirm(chosen.name)}>Enrol {count}</Button>
        </>
      }
    >
      <div className="space-y-2">
        {savedSequences.map((s) => (
          <label key={s.id} className={cn("flex cursor-pointer items-center gap-3 rounded-lg border p-3", seq === s.id ? "border-primary bg-primary-soft/50" : "border-line hover:bg-surface-2")}>
            <input type="radio" name="sequence" checked={seq === s.id} onChange={() => setSeq(s.id)} className="accent-[var(--primary)]" />
            <ChannelIcon channel={s.channel} size="xs" />
            <span className="flex-1 text-sm font-medium">{s.name}</span>
            <span className="text-xs text-muted">{s.steps} steps</span>
          </label>
        ))}
      </div>
    </Modal>
  );
}

export function BulkTagModal({ open, count, onClose, onConfirm }: { open: boolean; count: number; onClose: () => void; onConfirm: (tag: string) => void }) {
  const [tag, setTag] = useState("");
  const suggestions = ["diwali-offer", "vip", "recall-due", "emi-interest", "b2b"];
  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      title="Add tag"
      description={`Apply a tag to ${count} contact${count === 1 ? "" : "s"}.`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={!tag.trim()}
            onClick={() => {
              onConfirm(tag.trim().toLowerCase());
              setTag("");
            }}
          >
            Apply tag
          </Button>
        </>
      }
    >
      <Input value={tag} onChange={(e) => setTag(e.target.value)} placeholder="e.g. diwali-offer" autoFocus />
      <div className="mt-3 flex flex-wrap gap-1.5">
        {suggestions.map((s) => (
          <button key={s} onClick={() => setTag(s)} className="rounded-full border border-line px-2 py-0.5 text-xs text-fg-2 hover:bg-surface-2">
            {s}
          </button>
        ))}
      </div>
    </Modal>
  );
}
