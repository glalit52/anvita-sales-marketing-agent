"use client";

import { Download, FileDown, Plus, Search, ShieldCheck, Trash2, User, X } from "lucide-react";
import { useState } from "react";
import { Avatar, Badge, Button, Card, CardBody, CardHeader, Field, Input, Modal, Segmented, Select, Switch, useToast } from "@/components/ui";
import { SettingRow } from "@/components/platform/shared";
import { auditLog, dataRequests as dsrSeed } from "@/lib/mock/platform";

export function ComplianceSettings() {
  const toast = useToast();
  const [keywords, setKeywords] = useState(["STOP", "UNSUBSCRIBE", "BAND KARO", "रोकें"]);
  const [startKw, setStartKw] = useState(["START", "SUBSCRIBE"]);
  const [kwInput, setKwInput] = useState("");
  const [consent, setConsent] = useState({ doubleOptIn: true, recordProof: true, marketingDefault: false, dnd: true, quietHours: true });
  const [retention, setRetention] = useState("24");
  const [recordings, setRecordings] = useState("90");
  const [dsr, setDsr] = useState(dsrSeed);
  const [dsrOpen, setDsrOpen] = useState(false);
  const [dsrType, setDsrType] = useState<"Export" | "Delete">("Export");
  const [dsrSubject, setDsrSubject] = useState("");
  const [actor, setActor] = useState<"all" | "ai" | "human">("all");
  const [q, setQ] = useState("");

  const log = auditLog.filter(
    (a) => (actor === "all" || (actor === "ai" ? a.ai : !a.ai)) && (a.actor + a.action + a.target).toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card>
          <CardHeader title="Consent" description="DPDP Act 2023, TRAI and WhatsApp policy" action={<ShieldCheck className="size-4 text-success" />} />
          <CardBody className="divide-y divide-line py-0 pb-2">
            {(
              [
                ["doubleOptIn", "WhatsApp opt-in required for marketing", "Templates only go to contacts with recorded opt-in"],
                ["recordProof", "Store consent proof", "Timestamp, channel and exact wording kept per contact"],
                ["marketingDefault", "Imported contacts are opted in", "Off = imported contacts need fresh consent"],
                ["dnd", "Check TRAI DND registry for SMS", "Promotional SMS skipped for DND numbers"],
                ["quietHours", "Quiet hours 9 PM – 9 AM", "No marketing messages; AI replies still allowed"],
              ] as const
            ).map(([k, title, desc]) => (
              <SettingRow key={k} title={title} description={desc}>
                <Switch checked={consent[k]} onChange={(v) => setConsent((c) => ({ ...c, [k]: v }))} label={title} />
              </SettingRow>
            ))}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Opt-out keywords" description="Any message matching these instantly unsubscribes the contact on that channel" />
          <CardBody className="space-y-4">
            <div>
              <div className="mb-1.5 text-xs font-medium text-fg-2">Stop keywords</div>
              <div className="flex flex-wrap gap-1.5">
                {keywords.map((k) => (
                  <span key={k} className="inline-flex items-center gap-1 rounded-full bg-danger-soft py-0.5 pr-1 pl-2.5 font-mono text-xs font-medium text-danger">
                    {k}
                    <button aria-label={`Remove ${k}`} className="rounded-full p-0.5 hover:bg-danger/10" onClick={() => setKeywords((all) => all.filter((x) => x !== k))}>
                      <X className="size-3" />
                    </button>
                  </span>
                ))}
              </div>
              <form
                className="mt-2 flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!kwInput.trim()) return;
                  setKeywords((all) => [...all, kwInput.trim().toUpperCase()]);
                  setKwInput("");
                }}
              >
                <Input placeholder="Add keyword…" value={kwInput} onChange={(e) => setKwInput(e.target.value)} className="flex-1" />
                <Button type="submit" size="icon" variant="outline" aria-label="Add keyword">
                  <Plus />
                </Button>
              </form>
            </div>
            <div>
              <div className="mb-1.5 text-xs font-medium text-fg-2">Re-subscribe keywords</div>
              <div className="flex flex-wrap gap-1.5">
                {startKw.map((k) => (
                  <span key={k} className="inline-flex items-center gap-1 rounded-full bg-success-soft py-0.5 pr-1 pl-2.5 font-mono text-xs font-medium text-success">
                    {k}
                    <button aria-label={`Remove ${k}`} className="rounded-full p-0.5 hover:bg-success/10" onClick={() => setStartKw((all) => all.filter((x) => x !== k))}>
                      <X className="size-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
            <div className="rounded-lg bg-surface-2 p-3 text-xs text-muted">
              Auto-reply on opt-out: “You&apos;ve been unsubscribed from Smile Dental messages. Reply START to rejoin.” · 14 opt-outs this month (0.6%)
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Data retention" description="Data is stored in India (AWS Mumbai, ap-south-1)" />
          <CardBody className="space-y-4">
            <Field label="Conversation history">
              <Select value={retention} onChange={(e) => setRetention(e.target.value)}>
                <option value="12">12 months</option>
                <option value="24">24 months</option>
                <option value="60">5 years</option>
                <option value="0">Keep forever</option>
              </Select>
            </Field>
            <Field label="Call recordings & voicemails">
              <Select value={recordings} onChange={(e) => setRecordings(e.target.value)}>
                <option value="30">30 days</option>
                <option value="90">90 days</option>
                <option value="365">1 year</option>
              </Select>
            </Field>
            <Field label="AI logs (prompts, tool calls)" hint="(PII redacted)">
              <Select defaultValue="90">
                <option value="30">30 days</option>
                <option value="90">90 days</option>
              </Select>
            </Field>
            <Button size="sm" className="w-full" onClick={() => toast({ title: "Retention policy saved", description: "Older data will be purged in tonight's job." })}>
              Save retention policy
            </Button>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Data subject requests"
          description="DPDP / GDPR export & deletion. Must be completed within 30 days; everything is logged."
          action={
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => toast({ title: "Workspace export started", description: "A ZIP of contacts, conversations and invoices will be emailed to Priya.", tone: "info" })}>
                <FileDown /> Export all data
              </Button>
              <Button size="sm" onClick={() => setDsrOpen(true)}>
                <Plus /> New request
              </Button>
            </div>
          }
        />
        <div className="overflow-x-auto border-t border-line">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="text-left text-xs text-muted">
                <th className="px-5 py-2 font-medium">Request</th>
                <th className="px-3 py-2 font-medium">Type</th>
                <th className="px-3 py-2 font-medium">Data principal</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-5 py-2 font-medium">Due</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {dsr.map((d) => (
                <tr key={d.id}>
                  <td className="px-5 py-2.5 font-mono text-xs">{d.id}</td>
                  <td className="px-3 py-2.5">
                    <Badge tone={d.type === "Delete" ? "danger" : "info"}>
                      {d.type === "Delete" ? <Trash2 /> : <Download />} {d.type}
                    </Badge>
                  </td>
                  <td className="px-3 py-2.5">{d.subject}</td>
                  <td className="px-3 py-2.5">
                    <Badge tone={d.status === "Completed" ? "success" : d.status === "In progress" ? "info" : "warning"}>{d.status}</Badge>
                  </td>
                  <td className="px-5 py-2.5 text-muted">{d.due}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Audit log"
          description="Every action by AI and humans, immutable and exportable"
          action={
            <Button size="sm" variant="ghost" onClick={() => toast({ title: "audit-log-oct-2026.csv downloaded" })}>
              <Download /> CSV
            </Button>
          }
        />
        <div className="flex flex-col gap-2 px-5 pb-3 sm:flex-row sm:items-center">
          <Input icon={<Search />} placeholder="Search actions, people, records…" value={q} onChange={(e) => setQ(e.target.value)} className="sm:w-72" />
          <Segmented
            size="xs"
            value={actor}
            onChange={setActor}
            items={[
              { value: "all", label: "All" },
              { value: "ai", label: "AI agent" },
              { value: "human", label: "Humans & system" },
            ]}
          />
        </div>
        <div className="overflow-x-auto border-t border-line">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="text-left text-xs text-muted">
                <th className="px-5 py-2 font-medium">Actor</th>
                <th className="px-3 py-2 font-medium">Action</th>
                <th className="px-3 py-2 font-medium">Target</th>
                <th className="px-3 py-2 font-medium">IP</th>
                <th className="px-5 py-2 font-medium">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {log.map((a) => (
                <tr key={a.id}>
                  <td className="px-5 py-2.5">
                    <div className="flex items-center gap-2">
                      {a.actor === "System" ? (
                        <span className="inline-flex size-6 items-center justify-center rounded-full bg-surface-3 text-muted">
                          <User className="size-3" />
                        </span>
                      ) : (
                        <Avatar name={a.actor} ai={a.ai} size="xs" />
                      )}
                      <span className="whitespace-nowrap">{a.actor}</span>
                      {a.ai && <Badge tone="ai">AI</Badge>}
                    </div>
                  </td>
                  <td className="px-3 py-2.5 font-medium">{a.action}</td>
                  <td className="px-3 py-2.5 text-fg-2">{a.target}</td>
                  <td className="px-3 py-2.5 font-mono text-xs text-muted">{a.ip}</td>
                  <td className="px-5 py-2.5 whitespace-nowrap text-muted">{a.time}</td>
                </tr>
              ))}
              {log.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-muted">
                    No entries match.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        open={dsrOpen}
        onClose={() => setDsrOpen(false)}
        title="New data subject request"
        description="We verify the requester via OTP to their phone before processing."
        footer={
          <>
            <Button variant="ghost" onClick={() => setDsrOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={dsrType === "Delete" ? "danger" : "primary"}
              disabled={!dsrSubject}
              onClick={() => {
                setDsr((all) => [{ id: `DSR-00${15 + all.length - 3}`, type: dsrType, subject: dsrSubject, status: "Awaiting verification", due: "Nov 26" }, ...all]);
                setDsrOpen(false);
                setDsrSubject("");
                toast({ title: `${dsrType} request created`, description: "Verification OTP sent to the contact." });
              }}
            >
              Create request
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Request type">
            <Segmented
              value={dsrType}
              onChange={setDsrType}
              items={[
                { value: "Export", label: "Export my data" },
                { value: "Delete", label: "Delete my data" },
              ]}
            />
          </Field>
          <Field label="Contact (name, phone or email)">
            <Input placeholder="+91 98220 11223" value={dsrSubject} onChange={(e) => setDsrSubject(e.target.value)} />
          </Field>
          {dsrType === "Delete" && (
            <p className="rounded-lg bg-danger-soft p-3 text-xs text-danger">
              Deletes the contact, conversations, recordings and AI memory. Invoices are retained for 8 years as required by GST law (anonymised).
            </p>
          )}
        </div>
      </Modal>
    </div>
  );
}
