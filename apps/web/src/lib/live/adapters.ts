/**
 * Convert API responses into the shapes the screens were built on (lib/mock types), so the same
 * components render demo data and live data.
 */
import type { Channel } from "@/components/ui/channel";
import { NOW_STAMP, relativeLabel, timeLabel, minOf, dayOf, dateLabel, TODAY, toStamp, type AppNotification, type NotificationIcon, type Task } from "@/lib/mock/app";
import type { Contact, Conversation, Message, TeamMember } from "@/lib/mock/core";
import type { ApiContact, ApiConversation, ApiMember, ApiMessage, ApiNotification, ApiTask } from "./types";

const ROLE_LABEL = { owner: "Owner", admin: "Admin", manager: "Manager", agent: "Agent" } as const;

export function toMember(m: ApiMember): TeamMember {
  return { id: m.id, name: m.name, role: ROLE_LABEL[m.role], email: m.email, online: m.online };
}

/** "2m ago" style label, as the mocks use for `lastActivity`. */
export function agoLabel(iso: string | null | undefined): string {
  if (!iso) return "—";
  const diff = NOW_STAMP - toStamp(iso);
  if (diff < 1) return "Just now";
  if (diff < 60) return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return `${Math.floor(diff / 1440)}d ago`;
}

/** "2m" / "3h" / "2d" for the inbox list. */
export const shortAgo = (iso: string | null | undefined) => agoLabel(iso).replace(" ago", "").replace("Just now", "now");

/** "11:40 PM" today, otherwise "Mon 26 Oct, 11:40 PM". */
export function clockLabel(iso: string): string {
  const s = toStamp(iso);
  const time = timeLabel(minOf(s));
  return dayOf(s) === TODAY ? time : `${dateLabel(dayOf(s))}, ${time}`;
}

export function toContact(c: ApiContact): Contact {
  return {
    id: c.id,
    name: c.name,
    phone: c.phone ?? "",
    email: c.email ?? undefined,
    company: c.company ?? undefined,
    city: c.city ?? "",
    stage: c.stage,
    source: c.source ?? "Unknown",
    channel: (c.channel ?? "webchat") as Channel,
    tags: c.tags,
    ownerId: c.ownerId,
    score: c.score,
    value: Math.round(c.valueMinor / 100),
    lastActivity: agoLabel(c.lastActivityAt ?? c.createdAt),
    createdAt: c.createdAt.slice(0, 10),
    language: c.language ?? "English",
  };
}

/** Contact fields the UI edits, back into the API's shape. */
export function contactPatch(c: Partial<Contact>) {
  const out: Record<string, unknown> = {};
  if (c.name !== undefined) out.name = c.name;
  if (c.phone !== undefined) out.phone = c.phone || null;
  if (c.email !== undefined) out.email = c.email || null;
  if (c.company !== undefined) out.company = c.company || null;
  if (c.city !== undefined) out.city = c.city || null;
  if (c.stage !== undefined) out.stage = c.stage;
  if (c.source !== undefined) out.source = c.source;
  if (c.channel !== undefined) out.channel = c.channel;
  if (c.tags !== undefined) out.tags = c.tags;
  if (c.ownerId !== undefined) out.ownerId = c.ownerId === "ai" ? null : c.ownerId;
  if (c.score !== undefined) out.score = c.score;
  if (c.value !== undefined) out.valueMinor = Math.round(c.value * 100);
  if (c.language !== undefined) out.language = c.language;
  return out;
}

export function toMessage(m: ApiMessage): Message {
  return {
    id: m.id,
    author: m.authorType,
    authorName: m.authorName ?? undefined,
    body: m.body,
    time: clockLabel(m.createdAt),
    // Drafts render like the mocks' AI notes ("AI draft (not sent)") plus an approve action.
    note: m.isNote || m.isDraft,
    draft: m.isDraft || undefined,
    card: m.card ?? undefined,
    sources: m.sources.length ? m.sources : undefined,
  };
}

export function toConversation(c: ApiConversation, messages?: ApiMessage[]): Conversation {
  return {
    id: c.id,
    contactId: c.contactId,
    channel: c.channel as Channel,
    status: c.status,
    assignee: c.assigneeType === "ai" ? "ai" : (c.assigneeId ?? ""),
    escalated: c.escalationReason ? { reason: c.escalationReason } : undefined,
    unread: c.unread,
    preview: c.preview ?? "",
    time: shortAgo(c.lastMessageAt ?? c.createdAt),
    intent: c.intent ?? "New conversation",
    sentiment: c.sentiment ?? "neutral",
    aiSummary: c.aiSummary ?? "The AI will summarise this conversation after the next message.",
    messages: (messages ?? c.messages ?? []).map(toMessage),
  };
}

export function toTask(t: ApiTask): Task {
  return {
    id: t.id,
    title: t.title,
    type: t.type,
    contactId: t.contactId ?? undefined,
    conversationId: t.conversationId ?? undefined,
    assigneeId: t.assigneeId ?? "ai",
    createdBy: t.createdByType === "ai" ? "ai" : (t.createdById ?? "ai"),
    createdAt: toStamp(t.createdAt),
    due: toStamp(t.dueAt),
    hasTime: t.hasTime,
    priority: t.priority,
    done: t.done,
    doneAt: t.doneAt ? toStamp(t.doneAt) : undefined,
    aiContext: t.aiContext ?? undefined,
    aiConfidence: t.aiConfidence ?? undefined,
    notes: t.notes ?? undefined,
  };
}

const ICONS: NotificationIcon[] = ["escalation", "mention", "booking", "payment", "review", "ai", "system", "campaign", "integration", "billing", "task", "prospect"];

export function toNotification(n: ApiNotification): AppNotification {
  return {
    id: n.id,
    tab: n.tab,
    icon: (ICONS as string[]).includes(n.icon) ? (n.icon as NotificationIcon) : "system",
    title: n.title,
    body: n.body,
    contactId: n.contactId ?? undefined,
    at: toStamp(n.createdAt),
    unread: n.unread,
    priority: n.priority,
    actions: n.link ? [{ kind: "open", label: "Open", href: n.link }] : [],
  };
}

export { relativeLabel };
