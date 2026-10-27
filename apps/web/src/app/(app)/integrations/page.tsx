"use client";

import {
  ArrowLeftRight,
  ArrowLeft,
  ArrowRight,
  Check,
  Copy,
  ExternalLink,
  KeyRound,
  Lock,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  Unplug,
  Webhook,
} from "lucide-react";
import { useState } from "react";
import { HealthBadge, Monogram, uid } from "@/components/platform/shared";
import { Badge, Button, Card, CardHeader, Checkbox, Drawer, Field, Input, MetaRow, Modal, Page, PageHeader, Segmented, Select, useToast } from "@/components/ui";
import { cn } from "@/lib/cn";
import { apiKeys as keySeed, crmFieldMapping, integrations as seed, webhookEndpoints as hookSeed, webhookEvents, type Integration, type IntegrationCategory } from "@/lib/mock/platform";

const categories: IntegrationCategory[] = ["Messaging", "CRM", "Calendar", "Payments", "Marketing", "Website & commerce", "Automation", "Data"];

export default function IntegrationsPage() {
  const toast = useToast();
  const [items, setItems] = useState<Integration[]>(seed);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<"all" | IntegrationCategory>("all");
  const [status, setStatus] = useState<"all" | "connected" | "available">("all");
  const [connecting, setConnecting] = useState<Integration | null>(null);
  const [connectStep, setConnectStep] = useState<"explain" | "auth">("explain");
  const [detail, setDetail] = useState<Integration | null>(null);
  const [keys, setKeys] = useState(keySeed);
  const [keyOpen, setKeyOpen] = useState(false);
  const [keyName, setKeyName] = useState("");
  const [newKey, setNewKey] = useState<string | null>(null);
  const [hooks, setHooks] = useState(hookSeed);
  const [hookOpen, setHookOpen] = useState(false);
  const [hookUrl, setHookUrl] = useState("");
  const [hookEvents, setHookEvents] = useState<string[]>(["contact.created", "appointment.booked"]);
  const [syncing, setSyncing] = useState(false);

  const filtered = items.filter(
    (i) =>
      (cat === "all" || i.category === cat) &&
      (status === "all" || (status === "connected" ? i.connected : !i.connected)) &&
      (i.name + i.description).toLowerCase().includes(q.toLowerCase()),
  );
  const connectedCount = items.filter((i) => i.connected).length;
  const issues = items.filter((i) => i.connected && i.health !== "healthy");

  const finishConnect = () => {
    if (!connecting) return;
    setConnectStep("auth");
    setTimeout(() => {
      setItems((all) => all.map((i) => (i.id === connecting.id ? { ...i, connected: true, health: "healthy", account: "smiledental", lastSync: "Just now" } : i)));
      toast({ title: `${connecting.name} connected`, description: "Initial sync started; this can take a few minutes." });
      setConnecting(null);
      setConnectStep("explain");
    }, 1400);
  };

  const disconnect = (i: Integration) => {
    setItems((all) => all.map((x) => (x.id === i.id ? { ...x, connected: false, health: undefined, account: undefined } : x)));
    setDetail(null);
    toast({ title: `${i.name} disconnected`, description: "Existing synced data is kept in Anvita.", tone: "info" });
  };

  const createKey = () => {
    const secret = `anv_live_${Math.random().toString(36).slice(2, 10)}${Math.random().toString(36).slice(2, 14)}`;
    setNewKey(secret);
    setKeys((k) => [...k, { id: `ak${uid()}`, name: keyName || "Untitled key", prefix: secret.slice(0, 13), created: "Just now", lastUsed: "Never", scopes: ["contacts:read"] }]);
  };

  const renderCard = (i: Integration) => (
    <Card key={i.id} className="flex flex-col p-4">
      <div className="flex items-start gap-3">
        <Monogram name={i.name} color={i.color} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-sm font-semibold">{i.name}</span>
            {i.popular && !i.connected && <Badge tone="accent">Popular in India</Badge>}
          </div>
          <p className="mt-0.5 text-xs text-muted">{i.description}</p>
        </div>
      </div>
      <div className="mt-auto flex items-center justify-between gap-2 pt-4">
        {i.connected ? (
          <>
            <div className="min-w-0">
              <HealthBadge status={i.health ?? "healthy"} label={i.health === "healthy" ? "Connected" : i.health === "warning" ? "Needs attention" : "Reconnect"} />
              <div className="mt-0.5 truncate text-[11px] text-muted">{i.account}</div>
            </div>
            <Button size="xs" variant="outline" onClick={() => setDetail(i)}>
              Manage
            </Button>
          </>
        ) : (
          <>
            <span className="text-[11px] text-muted">Not connected</span>
            <Button size="xs" onClick={() => setConnecting(i)}>
              Connect
            </Button>
          </>
        )}
      </div>
    </Card>
  );

  const visibleCats = categories.filter((c) => filtered.some((i) => i.category === c));

  return (
    <Page>
      <PageHeader
        title="Integrations"
        description={`${connectedCount} of ${items.length} connected. Anvita syncs both ways so your AI agent always works with live calendars, prices and CRM data.`}
        actions={
          <Button variant="outline" onClick={() => {
            document.getElementById("developers")?.scrollIntoView({ behavior: "smooth" });
          }}>
            <KeyRound /> API & webhooks
          </Button>
        }
      />

      {issues.length > 0 && (
        <div className="mb-5 space-y-2">
          {issues.map((i) => (
            <div
              key={i.id}
              className={cn(
                "flex flex-wrap items-center gap-3 rounded-xl border px-4 py-2.5 text-sm",
                i.health === "error" ? "border-danger/30 bg-danger-soft" : "border-warning/30 bg-warning-soft",
              )}
            >
              <Monogram name={i.name} color={i.color} size="sm" />
              <span className="min-w-0 flex-1">
                <b className="font-semibold">{i.name}:</b> <span className="text-fg-2">{i.lastSync}</span>
                {i.health === "error" && <span className="text-fg-2">. Lead forms aren&apos;t reaching your inbox.</span>}
              </span>
              <Button size="xs" variant={i.health === "error" ? "danger" : "outline"} onClick={() => (i.health === "error" ? setConnecting(i) : setDetail(i))}>
                {i.health === "error" ? "Reconnect" : "Resolve"}
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center">
        <Input icon={<Search />} placeholder="Search 28 integrations…" value={q} onChange={(e) => setQ(e.target.value)} className="lg:w-72" />
        <Select value={cat} onChange={(e) => setCat(e.target.value as typeof cat)} className="lg:w-56" aria-label="Category">
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </Select>
        <Segmented
          value={status}
          onChange={setStatus}
          items={[
            { value: "all", label: "All" },
            { value: "connected", label: "Connected", count: connectedCount },
            { value: "available", label: "Available" },
          ]}
        />
      </div>

      {visibleCats.length === 0 && (
        <Card className="py-14 text-center text-sm text-muted">
          No integrations match. <button className="font-medium text-primary hover:underline" onClick={() => toast({ title: "Request sent", description: "We'll email you when it's available." })}>Request “{q || "an integration"}”</button>
        </Card>
      )}

      <div className="space-y-7">
        {visibleCats.map((c) => (
          <section key={c}>
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
              {c}
              <span className="text-xs font-normal text-muted">{filtered.filter((i) => i.category === c).length}</span>
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">{filtered.filter((i) => i.category === c).map(renderCard)}</div>
          </section>
        ))}
      </div>

      {/* Developers */}
      <div id="developers" className="mt-10 grid grid-cols-1 scroll-mt-20 gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader
            title="API keys"
            description="Use the REST API to read and write contacts, conversations and appointments."
            action={
              <Button size="sm" onClick={() => setKeyOpen(true)}>
                <Plus /> Create key
              </Button>
            }
          />
          <div className="overflow-x-auto border-t border-line">
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr className="text-left text-xs text-muted">
                  <th className="px-5 py-2 font-medium">Name</th>
                  <th className="px-3 py-2 font-medium">Key</th>
                  <th className="px-3 py-2 font-medium">Last used</th>
                  <th className="px-5 py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {keys.map((k) => (
                  <tr key={k.id}>
                    <td className="px-5 py-2.5">
                      <div className="font-medium">{k.name}</div>
                      <div className="mt-0.5 flex flex-wrap gap-1">
                        {k.scopes.map((s) => (
                          <Badge key={s}>{s}</Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 font-mono text-xs text-fg-2">{k.prefix}••••••••</td>
                    <td className="px-3 py-2.5 text-xs text-muted">{k.lastUsed}</td>
                    <td className="px-5 py-2.5 text-right">
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        aria-label={`Revoke ${k.name}`}
                        onClick={() => {
                          setKeys((all) => all.filter((x) => x.id !== k.id));
                          toast({ title: `Key “${k.name}” revoked`, tone: "warning" });
                        }}
                      >
                        <Trash2 />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-line px-5 py-3 text-xs text-muted">
            <span>Rate limit: 600 req/min · Base URL api.anvita.ai/v1</span>
            <a href="#developers" className="inline-flex items-center gap-1 font-medium text-primary hover:underline">
              API docs <ExternalLink className="size-3" />
            </a>
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Webhook endpoints"
            description="Signed (HMAC-SHA256) event payloads, retried with backoff for 24h."
            action={
              <Button size="sm" variant="outline" onClick={() => setHookOpen(true)}>
                <Webhook /> Add endpoint
              </Button>
            }
          />
          <ul className="divide-y divide-line border-t border-line">
            {hooks.map((h) => (
              <li key={h.id} className="px-5 py-3">
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-mono text-xs text-fg">{h.url}</div>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {h.events.map((e) => (
                        <Badge key={e} tone="info">
                          {e}
                        </Badge>
                      ))}
                    </div>
                    <div className="mt-1.5 text-[11px] text-muted">
                      {h.success}% delivered (7d) · {h.lastDelivery}
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <HealthBadge status={h.status === "healthy" ? "healthy" : "error"} label={h.status === "healthy" ? "Healthy" : "Failing"} />
                    <button className="text-[11px] font-medium text-primary hover:underline" onClick={() => toast({ title: "Test event sent", description: `appointment.booked → ${h.url.slice(8, 34)}…`, tone: "info" })}>
                      Send test
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Connect modal */}
      <Modal
        open={!!connecting}
        onClose={() => {
          setConnecting(null);
          setConnectStep("explain");
        }}
        title={
          connecting && (
            <span className="flex items-center gap-3">
              <Monogram name="Anvita" color="var(--primary)" size="sm" />
              <ArrowLeftRight className="size-4 text-muted" />
              <Monogram name={connecting.name} color={connecting.color} size="sm" />
              <span>Connect {connecting.name}</span>
            </span>
          )
        }
        footer={
          <>
            <Button variant="ghost" onClick={() => setConnecting(null)}>
              Cancel
            </Button>
            <Button onClick={finishConnect} disabled={connectStep === "auth"}>
              {connectStep === "auth" ? "Waiting for authorisation…" : `Continue to ${connecting?.name}`}
              {connectStep === "explain" && <ArrowRight />}
            </Button>
          </>
        }
      >
        {connecting && (
          <div className="space-y-4 text-sm">
            <p className="text-fg-2">
              You&apos;ll be redirected to {connecting.name} to sign in and approve access. Anvita never sees your password; we store an encrypted OAuth token you can revoke at any time.
            </p>
            <div>
              <div className="mb-2 text-xs font-medium text-fg-2">Anvita will be able to:</div>
              <ul className="space-y-1.5">
                {connecting.permissions.map((p) => (
                  <li key={p} className="flex items-center gap-2">
                    <Check className="size-4 text-success" /> {p}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex items-start gap-2 rounded-lg bg-surface-2 p-3 text-xs text-muted">
              <Lock className="mt-0.5 size-3.5 shrink-0" />
              Tokens are encrypted at rest (AES-256) and scoped to the Smile Dental workspace. The AI agent can only use this integration through the tools you allow in Agent Studio.
            </div>
            {connectStep === "auth" && (
              <div className="flex items-center gap-2 rounded-lg border border-info/30 bg-info-soft p-3 text-xs text-info">
                <RefreshCw className="size-3.5 animate-spin" /> Opening {connecting.name} sign-in…
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Detail drawer */}
      <Drawer
        open={!!detail}
        onClose={() => setDetail(null)}
        width="max-w-lg"
        title={
          detail && (
            <span className="flex items-center gap-3">
              <Monogram name={detail.name} color={detail.color} size="sm" />
              {detail.name}
            </span>
          )
        }
        footer={
          detail && (
            <>
              <Button variant="ghost" className="mr-auto text-danger! hover:text-danger!" onClick={() => disconnect(detail)}>
                <Unplug /> Disconnect
              </Button>
              <Button variant="outline" onClick={() => setDetail(null)}>
                Close
              </Button>
            </>
          )
        }
      >
        {detail && (
          <div className="space-y-5 p-5">
            <div className="rounded-xl border border-line p-4">
              <div className="mb-2 flex items-center justify-between">
                <HealthBadge status={detail.health ?? "healthy"} />
                <Button
                  size="xs"
                  variant="outline"
                  disabled={syncing}
                  onClick={() => {
                    setSyncing(true);
                    setTimeout(() => {
                      setSyncing(false);
                      toast({ title: `${detail.name} synced`, description: "214 records checked, 3 updated." });
                    }, 1300);
                  }}
                >
                  <RefreshCw className={cn(syncing && "animate-spin")} /> {syncing ? "Syncing…" : "Sync now"}
                </Button>
              </div>
              <MetaRow label="Account">{detail.account}</MetaRow>
              <MetaRow label="Last sync">{detail.lastSync}</MetaRow>
              <MetaRow label="Connected by">Priya Sharma · Aug 12</MetaRow>
              <MetaRow label="Permissions">{detail.permissions.length} scopes</MetaRow>
            </div>

            {detail.category === "CRM" && (
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Field mapping</h3>
                  <span className="text-[11px] text-muted">Conflict rule: newest wins</span>
                </div>
                {detail.health === "warning" && (
                  <div className="mb-3 rounded-lg bg-warning-soft p-3 text-xs text-warning">
                    3 contacts have conflicting phone numbers between Anvita and {detail.name}.{" "}
                    <button className="font-semibold underline" onClick={() => toast({ title: "Conflicts resolved", description: "Kept the most recently updated value." })}>
                      Review
                    </button>
                  </div>
                )}
                <div className="overflow-x-auto rounded-lg border border-line">
                  <table className="w-full min-w-[400px] text-sm">
                    <thead className="bg-surface-2 text-left text-xs text-muted">
                      <tr>
                        <th className="px-3 py-2 font-medium">Anvita field</th>
                        <th className="px-2 py-2 text-center font-medium">Sync</th>
                        <th className="px-3 py-2 font-medium">{detail.name} property</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {crmFieldMapping.map((m) => (
                        <tr key={m.anvita}>
                          <td className="px-3 py-2">{m.anvita}</td>
                          <td className="px-2 py-2 text-center text-muted" title={m.direction === "both" ? "Two-way" : m.direction === "to" ? `Anvita → ${detail.name}` : `${detail.name} → Anvita`}>
                            {m.direction === "both" ? <ArrowLeftRight className="mx-auto size-3.5" /> : m.direction === "to" ? <ArrowRight className="mx-auto size-3.5" /> : <ArrowLeft className="mx-auto size-3.5" />}
                            <span className="sr-only">{m.direction}</span>
                          </td>
                          <td className="px-3 py-2 font-mono text-xs text-fg-2">{m.crm}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Button size="xs" variant="ghost" className="mt-2" onClick={() => toast({ title: "Custom field mapping", description: "Pick an Anvita field and a CRM property.", tone: "info" })}>
                  <Plus /> Map another field
                </Button>
              </div>
            )}

            <div>
              <h3 className="mb-2 text-sm font-semibold">Recent activity</h3>
              <ul className="space-y-2 text-xs text-fg-2">
                <li className="flex gap-2"><ShieldCheck className="size-3.5 text-success" /> Token refreshed automatically · 2h ago</li>
                <li className="flex gap-2"><RefreshCw className="size-3.5 text-info" /> Sync completed: 12 created, 31 updated · {detail.lastSync}</li>
                <li className="flex gap-2"><Check className="size-3.5 text-success" /> Connected by Priya Sharma · Aug 12</li>
              </ul>
            </div>
          </div>
        )}
      </Drawer>

      {/* Create API key */}
      <Modal
        open={keyOpen}
        onClose={() => {
          setKeyOpen(false);
          setNewKey(null);
          setKeyName("");
        }}
        title={newKey ? "Copy your API key" : "Create API key"}
        description={newKey ? "For security, this is the only time we'll show the full key." : "Keys have full access to the scopes you choose."}
        footer={
          newKey ? (
            <Button
              onClick={() => {
                setKeyOpen(false);
                setNewKey(null);
                setKeyName("");
              }}
            >
              I&apos;ve saved it
            </Button>
          ) : (
            <>
              <Button variant="ghost" onClick={() => setKeyOpen(false)}>
                Cancel
              </Button>
              <Button onClick={createKey}>Create key</Button>
            </>
          )
        }
      >
        {newKey ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 rounded-lg border border-line bg-surface-2 p-3">
              <code className="min-w-0 flex-1 font-mono text-xs break-all text-fg">{newKey}</code>
              <Button
                size="icon-sm"
                variant="outline"
                aria-label="Copy key"
                onClick={() => {
                  navigator.clipboard?.writeText(newKey).catch(() => {});
                  toast({ title: "API key copied" });
                }}
              >
                <Copy />
              </Button>
            </div>
            <p className="text-xs text-warning">Store it in a secret manager. If you lose it, revoke it and create a new one.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <Field label="Key name">
              <Input placeholder="e.g. Practo sync" value={keyName} onChange={(e) => setKeyName(e.target.value)} />
            </Field>
            <Field label="Scopes">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {["contacts:read", "contacts:write", "conversations:read", "conversations:write", "appointments:read", "payments:read"].map((s, i) => (
                  <ScopeBox key={s} scope={s} initial={i === 0} />
                ))}
              </div>
            </Field>
          </div>
        )}
      </Modal>

      {/* Add webhook */}
      <Modal
        open={hookOpen}
        onClose={() => setHookOpen(false)}
        title="Add webhook endpoint"
        footer={
          <>
            <Button variant="ghost" onClick={() => setHookOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={!hookUrl.startsWith("https://") || hookEvents.length === 0}
              onClick={() => {
                setHooks((all) => [...all, { id: `wh${uid()}`, url: hookUrl, events: hookEvents, status: "healthy", success: 100, lastDelivery: "No deliveries yet" }]);
                setHookOpen(false);
                setHookUrl("");
                toast({ title: "Endpoint added", description: "Signing secret: whsec_••••3f9a (copy it from endpoint settings)." });
              }}
            >
              Add endpoint
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Endpoint URL" hint="(HTTPS only)">
            <Input placeholder="https://example.com/webhooks/anvita" value={hookUrl} onChange={(e) => setHookUrl(e.target.value)} />
          </Field>
          <Field label={`Events (${hookEvents.length} selected)`}>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {webhookEvents.map((e) => (
                <label key={e} className="flex items-center gap-2 rounded-lg border border-line px-3 py-2 font-mono text-xs">
                  <Checkbox checked={hookEvents.includes(e)} onChange={(v) => setHookEvents((all) => (v ? [...all, e] : all.filter((x) => x !== e)))} label={e} />
                  {e}
                </label>
              ))}
            </div>
          </Field>
        </div>
      </Modal>
    </Page>
  );
}

function ScopeBox({ scope, initial }: { scope: string; initial: boolean }) {
  const [on, setOn] = useState(initial);
  return (
    <label className="flex items-center gap-2 rounded-lg border border-line px-3 py-2 font-mono text-xs">
      <Checkbox checked={on} onChange={setOn} label={scope} />
      {scope}
    </label>
  );
}
