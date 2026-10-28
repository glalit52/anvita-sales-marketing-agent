"use client";

import { Download, Funnel, Megaphone, Plus, Search, Send, Tag, Upload, Users, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Avatar, Badge, Button, Card, ChannelIcon, Checkbox, EmptyState, Input, Page, PageHeader, Select, Tabs, useToast } from "@/components/ui";
import { channelMeta, type Channel } from "@/components/ui/channel";
import { AddContactModal, BulkSequenceModal, BulkTagModal, ImportCsvModal } from "@/components/sell/contact-modals";
import { ContactDrawer } from "@/components/sell/contact-drawer";
import { OwnerChip, ScoreBar, SortHeader } from "@/components/sell/shared";
import { cn } from "@/lib/cn";
import { formatCurrency } from "@/lib/format";
import { contactPatch, toContact } from "@/lib/live/adapters";
import { api, errorMessage } from "@/lib/live/client";
import { LIVE } from "@/lib/live/config";
import { loadContacts, upsertContact } from "@/lib/live/store";
import type { ApiContact } from "@/lib/live/types";
import { stageMeta, team, type Contact, type Stage } from "@/lib/mock/core";
import { allContacts, CURRENT_USER_ID, minutesAgo } from "@/lib/mock/sell";

type View = "all" | "mine" | "ai" | "hot" | "customers";
type SortKey = "name" | "score" | "value" | "activity" | "created";

const views: { value: View; label: string; test: (c: Contact) => boolean }[] = [
  { value: "all", label: "All contacts", test: () => true },
  { value: "mine", label: "My leads", test: (c) => c.ownerId === CURRENT_USER_ID },
  { value: "ai", label: "AI-owned", test: (c) => c.ownerId === "ai" },
  { value: "hot", label: "Hot leads", test: (c) => c.score > 75 && c.stage !== "customer" && c.stage !== "lost" },
  { value: "customers", label: "Customers", test: (c) => c.stage === "customer" },
];

export default function ContactsPage() {
  const toast = useToast();
  const [rows, setRows] = useState<Contact[]>(allContacts);
  const [view, setView] = useState<View>("all");
  const [query, setQuery] = useState("");
  const [stage, setStage] = useState("");
  const [source, setSource] = useState("");
  const [owner, setOwner] = useState("");
  const [channel, setChannel] = useState("");
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({ key: "activity", dir: "asc" });
  const [selected, setSelected] = useState<string[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [bulk, setBulk] = useState<"sequence" | "tag" | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const sourceOptions = useMemo(() => Array.from(new Set(rows.map((r) => r.source))).sort(), [rows]);
  const channelOptions = useMemo(() => Array.from(new Set(rows.map((r) => r.channel))), [rows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const viewTest = views.find((v) => v.value === view)!.test;
    const list = rows.filter(
      (c) =>
        viewTest(c) &&
        (!q || [c.name, c.phone, c.email, c.company, c.city, ...c.tags].some((f) => f?.toLowerCase().includes(q))) &&
        (!stage || c.stage === stage) &&
        (!source || c.source === source) &&
        (!owner || c.ownerId === owner) &&
        (!channel || c.channel === channel),
    );
    const dir = sort.dir === "asc" ? 1 : -1;
    return [...list].sort((a, b) => {
      switch (sort.key) {
        case "name":
          return a.name.localeCompare(b.name) * dir;
        case "score":
          return (a.score - b.score) * dir;
        case "value":
          return (a.value - b.value) * dir;
        case "created":
          return a.createdAt.localeCompare(b.createdAt) * dir;
        default:
          return (minutesAgo(a.lastActivity) - minutesAgo(b.lastActivity)) * dir;
      }
    });
  }, [rows, view, query, stage, source, owner, channel, sort]);

  const onSort = (key: SortKey) =>
    setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: key === "name" || key === "activity" ? "asc" : "desc" }));

  const activeFilters = [stage, source, owner, channel].filter(Boolean).length;
  const allSelected = filtered.length > 0 && filtered.every((c) => selected.includes(c.id));
  const someSelected = filtered.some((c) => selected.includes(c.id));
  const toggleAll = () => setSelected(allSelected ? [] : filtered.map((c) => c.id));
  const toggle = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const clearFilters = () => {
    setStage("");
    setSource("");
    setOwner("");
    setChannel("");
    setQuery("");
  };

  const openContact = rows.find((r) => r.id === openId) ?? null;
  useEffect(() => {
    if (LIVE) loadContacts().then((list) => setRows([...list]), () => {});
  }, []);

  const saved = (c: Contact) => {
    upsertContact(c);
    setRows((rs) => rs.map((r) => (r.id === c.id ? c : r)));
  };
  const updateContact = (c: Contact) => {
    const before = rows.find((r) => r.id === c.id);
    setRows((rs) => rs.map((r) => (r.id === c.id ? c : r)));
    if (!LIVE || !before) return;
    const changed = Object.fromEntries(
      Object.entries(c).filter(([k, v]) => JSON.stringify(v) !== JSON.stringify(before[k as keyof Contact])),
    ) as Partial<Contact>;
    api<ApiContact>(`/contacts/${c.id}`, { method: "PATCH", body: contactPatch(changed) }).then(
      (r) => saved(toContact(r)),
      (e) => {
        setRows((rs) => rs.map((r) => (r.id === c.id ? before : r)));
        toast({ title: "Couldn't update contact", description: errorMessage(e), tone: "warning" });
      },
    );
  };
  const createContact = (c: Contact) => {
    setRows((rs) => [c, ...rs]);
    if (!LIVE) return;
    api<ApiContact>("/contacts", { method: "POST", body: { ...contactPatch(c), stage: c.stage } }).then(
      (r) => {
        const created = upsertContact(toContact(r));
        setRows((rs) => rs.map((x) => (x.id === c.id ? created : x)));
      },
      (e) => {
        setRows((rs) => rs.filter((x) => x.id !== c.id));
        toast({ title: "Couldn't add contact", description: errorMessage(e), tone: "warning" });
      },
    );
  };

  return (
    <Page>
      <PageHeader
        title="Contacts"
        description="Every lead, patient and dealer in one place. AI keeps scores, summaries and consent up to date."
        actions={
          <>
            <Button variant="outline" onClick={() => setImportOpen(true)}>
              <Upload /> Import CSV
            </Button>
            <Button onClick={() => setAddOpen(true)}>
              <Plus /> Add contact
            </Button>
          </>
        }
      />

      <Tabs
        value={view}
        onChange={(v) => {
          setView(v);
          setSelected([]);
        }}
        items={views.map((v) => ({ value: v.value, label: v.label, count: rows.filter(v.test).length }))}
        className="mb-4"
      />

      <Card>
        <div className="flex flex-col gap-3 border-b border-line p-3 sm:p-4">
          <div className="flex flex-wrap items-center gap-2">
            <Input icon={<Search />} placeholder="Search name, phone, company or tag" value={query} onChange={(e) => setQuery(e.target.value)} className="min-w-0 flex-1 sm:max-w-sm" />
            <Button variant="outline" size="md" className="lg:hidden" onClick={() => setShowFilters((s) => !s)} aria-expanded={showFilters}>
              <Funnel /> Filters
              {activeFilters > 0 && <Badge tone="primary">{activeFilters}</Badge>}
            </Button>
            <div className={cn("w-full grid-cols-2 gap-2 sm:grid-cols-4 lg:flex lg:w-auto lg:flex-1 lg:items-center", showFilters ? "grid" : "hidden lg:flex")}>
              <Select value={stage} onChange={(e) => setStage(e.target.value)} aria-label="Filter by stage" className="lg:w-36">
                <option value="">All stages</option>
                {(Object.keys(stageMeta) as Stage[]).map((s) => (
                  <option key={s} value={s}>
                    {stageMeta[s].label}
                  </option>
                ))}
              </Select>
              <Select value={source} onChange={(e) => setSource(e.target.value)} aria-label="Filter by source" className="lg:w-40">
                <option value="">All sources</option>
                {sourceOptions.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </Select>
              <Select value={owner} onChange={(e) => setOwner(e.target.value)} aria-label="Filter by owner" className="lg:w-36">
                <option value="">All owners</option>
                <option value="ai">AI agent</option>
                {team.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </Select>
              <Select value={channel} onChange={(e) => setChannel(e.target.value)} aria-label="Filter by channel" className="lg:w-36">
                <option value="">All channels</option>
                {channelOptions.map((c) => (
                  <option key={c} value={c}>
                    {channelMeta[c as Channel].label}
                  </option>
                ))}
              </Select>
              {(activeFilters > 0 || query) && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="col-span-2 sm:col-span-4 lg:col-span-1">
                  <X /> Clear
                </Button>
              )}
            </div>
          </div>

          {someSelected && (
            <div className="animate-fade-in flex flex-wrap items-center gap-2 rounded-lg bg-primary-soft px-3 py-2">
              <span className="mr-1 text-sm font-medium text-primary">{selected.length} selected</span>
              <Button size="xs" variant="outline" onClick={() => setBulk("sequence")}>
                <Send /> Add to sequence
              </Button>
              <Button size="xs" variant="outline" onClick={() => setBulk("tag")}>
                <Tag /> Add tag
              </Button>
              <Button
                size="xs"
                variant="outline"
                onClick={() => toast({ title: "Campaign draft created", description: `${selected.length} contacts added as the audience. Opening Campaigns…`, tone: "info" })}
              >
                <Megaphone /> Start campaign
              </Button>
              <Button size="xs" variant="outline" onClick={() => toast({ title: `Exporting ${selected.length} contacts`, description: "contacts-export-27-oct.csv will download shortly.", tone: "info" })}>
                <Download /> Export
              </Button>
              <Button size="xs" variant="ghost" className="ml-auto" onClick={() => setSelected([])}>
                Clear selection
              </Button>
            </div>
          )}
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<Users />}
            title="No contacts match"
            description="Try a different search or clear the filters for this view."
            action={
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear filters
              </Button>
            }
          />
        ) : (
          <div className="scroll-thin overflow-x-auto">
            <table className="w-full min-w-[1040px] text-sm">
              <thead className="text-xs text-muted">
                <tr className="border-b border-line">
                  <th className="w-10 py-2.5 pl-4">
                    <Checkbox checked={allSelected} indeterminate={someSelected && !allSelected} onChange={toggleAll} label="Select all" />
                  </th>
                  <th className="px-3 py-2.5 text-left">
                    <SortHeader label="Name" sortKey="name" sort={sort} onSort={onSort} />
                  </th>
                  <th className="px-3 py-2.5 text-left font-medium">Stage</th>
                  <th className="px-3 py-2.5 text-left">
                    <SortHeader label="AI score" sortKey="score" sort={sort} onSort={onSort} />
                  </th>
                  <th className="px-3 py-2.5 text-left font-medium">Owner</th>
                  <th className="px-3 py-2.5 text-left font-medium">Source</th>
                  <th className="px-3 py-2.5 text-left font-medium">Tags</th>
                  <th className="px-3 py-2.5 text-right">
                    <SortHeader label="Value" sortKey="value" sort={sort} onSort={onSort} />
                  </th>
                  <th className="px-3 py-2.5 pr-4 text-right">
                    <SortHeader label="Last activity" sortKey="activity" sort={sort} onSort={onSort} />
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filtered.map((c) => {
                  const isSel = selected.includes(c.id);
                  return (
                    <tr
                      key={c.id}
                      onClick={() => setOpenId(c.id)}
                      className={cn("cursor-pointer transition-colors hover:bg-surface-2", isSel && "bg-primary-soft/40")}
                    >
                      <td className="py-2.5 pl-4" onClick={(e) => e.stopPropagation()}>
                        <Checkbox checked={isSel} onChange={() => toggle(c.id)} label={`Select ${c.name}`} />
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={c.name} />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="truncate font-medium text-fg">{c.name}</span>
                              <ChannelIcon channel={c.channel} size="xs" />
                            </div>
                            <div className="truncate text-xs text-muted">{c.company ?? c.phone}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <Badge tone={stageMeta[c.stage].tone} dot>
                          {stageMeta[c.stage].label}
                        </Badge>
                      </td>
                      <td className="px-3 py-2.5">
                        <ScoreBar score={c.score} />
                      </td>
                      <td className="px-3 py-2.5">
                        <OwnerChip ownerId={c.ownerId} />
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap text-fg-2">{c.source}</td>
                      <td className="px-3 py-2.5">
                        <div className="flex max-w-48 flex-wrap gap-1">
                          {c.tags.slice(0, 2).map((t) => (
                            <Badge key={t}>{t}</Badge>
                          ))}
                          {c.tags.length > 2 && <Badge>+{c.tags.length - 2}</Badge>}
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-right font-medium tabular">{formatCurrency(c.value)}</td>
                      <td className="px-3 py-2.5 pr-4 text-right whitespace-nowrap text-muted">{c.lastActivity}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line px-4 py-3 text-xs text-muted">
          <span>
            Showing {filtered.length} of {rows.length} contacts
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block size-2 rounded-full bg-success" /> Score ≥ 75 is hot
            <span className="ml-2 inline-block size-2 rounded-full bg-primary" /> 50–74 warm
          </span>
        </div>
      </Card>

      <ContactDrawer contact={openContact} onClose={() => setOpenId(null)} onUpdate={updateContact} />
      <AddContactModal open={addOpen} onClose={() => setAddOpen(false)} onCreate={createContact} />
      <ImportCsvModal open={importOpen} onClose={() => setImportOpen(false)} />
      <BulkSequenceModal
        open={bulk === "sequence"}
        count={selected.length}
        onClose={() => setBulk(null)}
        onConfirm={(name) => {
          toast({ title: `${selected.length} contacts enrolled`, description: `“${name}” starts within 5 minutes. AI personalises each step.` });
          setBulk(null);
          setSelected([]);
        }}
      />
      <BulkTagModal
        open={bulk === "tag"}
        count={selected.length}
        onClose={() => setBulk(null)}
        onConfirm={(tag) => {
          setRows((rs) => rs.map((r) => (selected.includes(r.id) && !r.tags.includes(tag) ? { ...r, tags: [...r.tags, tag] } : r)));
          if (LIVE)
            api("/contacts/bulk", { method: "POST", body: { ids: selected, addTags: [tag] } }).catch((e) =>
              toast({ title: "Couldn't tag contacts", description: errorMessage(e), tone: "warning" }),
            );
          toast({ title: `Tagged ${selected.length} contacts`, description: `Added “${tag}”.` });
          setBulk(null);
        }}
      />
    </Page>
  );
}
