import type { Channel } from "@/components/ui/channel";
import { team } from "@/lib/mock/core";
import type { ConsentRecord, ContactNote, TimelineEvent, TimelineType } from "@/lib/mock/sell";
import { agoLabel, clockLabel } from "./adapters";
import { api } from "./client";

interface ApiConsent {
  channel: ConsentRecord["channel"];
  purpose: string;
  status: ConsentRecord["status"];
  source: string;
  capturedAt: string;
}
interface ApiNote {
  id: string;
  body: string;
  authorId: string | null;
  createdAt: string;
}
interface ApiTimeline {
  id: string;
  kind: "message" | "ai" | "booking" | "payment" | "note" | "task" | "stage";
  title: string;
  detail: string | null;
  at: string;
  channel: string | null;
  actor: string | null;
}

const authorName = (id: string | null) => team.find((m) => m.id === id)?.name ?? "Teammate";

export function toConsents(rows: ApiConsent[]): ConsentRecord[] {
  return (["whatsapp", "sms", "email"] as const).map((channel) => {
    const r = rows.find((x) => x.channel === channel && x.purpose === "marketing");
    return r
      ? { channel, status: r.status, source: r.source, date: clockLabel(r.capturedAt) }
      : { channel, status: "unknown", source: "No consent recorded", date: "—" };
  });
}

export const toNote = (n: ApiNote): ContactNote => ({ id: n.id, author: authorName(n.authorId), body: n.body, time: agoLabel(n.createdAt) });

const KIND: Record<ApiTimeline["kind"], TimelineType> = { message: "message", ai: "ai", booking: "booking", payment: "payment", note: "note", task: "stage", stage: "stage" };

export async function fetchProfile(contactId: string) {
  const [consents, notes, timeline, convs] = await Promise.all([
    api<ApiConsent[]>(`/contacts/${contactId}/consents`),
    api<ApiNote[]>(`/contacts/${contactId}/notes`),
    api<ApiTimeline[]>(`/contacts/${contactId}/timeline`),
    api<{ aiSummary: string | null }[]>(`/contacts/${contactId}/conversations`),
  ]);
  return {
    consent: toConsents(consents),
    notes: notes.map(toNote),
    timeline: timeline.map(
      (e): TimelineEvent => ({
        id: e.id,
        type: KIND[e.kind],
        title: e.title,
        detail: e.detail ?? undefined,
        time: clockLabel(e.at),
        channel: (e.channel ?? undefined) as Channel | undefined,
        actor: e.actor ?? undefined,
      }),
    ),
    summary: convs.find((c) => c.aiSummary)?.aiSummary ?? null,
  };
}

export const saveConsent = (contactId: string, channel: ConsentRecord["channel"], optedIn: boolean, source: string) =>
  api(`/contacts/${contactId}/consents`, {
    method: "PUT",
    body: { channel, purpose: "marketing", status: optedIn ? "opted_in" : "opted_out", source },
  });

export const addNote = (contactId: string, body: string) => api<ApiNote>(`/contacts/${contactId}/notes`, { method: "POST", body: { body } });
