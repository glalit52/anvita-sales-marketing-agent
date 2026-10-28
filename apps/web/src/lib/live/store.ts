/**
 * In live mode the API data is loaded into the same in-memory collections the screens import from
 * lib/mock, so every existing lookup (contactById, team, …) keeps working. Loaders refresh a collection
 * in place and return it; screens copy the result into their own state.
 */
import { notifications, tasks, type AppNotification, type Task } from "@/lib/mock/app";
import { contacts, conversations, team, type Contact, type Conversation } from "@/lib/mock/core";
import { allContacts, setCurrentUserId } from "@/lib/mock/sell";
import { toContact, toConversation, toMember, toNotification, toTask } from "./adapters";
import { api, apiAll } from "./client";
import { liveTimeZone } from "./timezone";
import type { ApiContact, ApiConversation, ApiMember, ApiNotification, ApiTask, Me } from "./types";

function replace<T>(target: T[], items: T[]) {
  target.splice(0, target.length, ...items);
  return target;
}

export const session: { me: Me | null } = { me: null };

export async function bootstrap(): Promise<Me> {
  const [me, members, org] = await Promise.all([
    api<Me>("/auth/me"),
    api<ApiMember[]>("/team"),
    api<{ timezone: string }>("/org"),
  ]);
  session.me = me;
  liveTimeZone.value = org.timezone;
  setCurrentUserId(me.user.id);
  replace(team, members.map(toMember));
  // Every screen also expects a stocked store, so load the core collections before first render.
  await Promise.all([loadContacts(), loadConversations(), loadTasks(), loadNotifications()]);
  return me;
}

export function upsertContact(c: Contact) {
  for (const list of [contacts, allContacts]) {
    const i = list.findIndex((x) => x.id === c.id);
    if (i >= 0) list[i] = c;
    else list.unshift(c);
  }
  return c;
}

export async function loadContacts(): Promise<Contact[]> {
  const rows = (await apiAll<ApiContact>("/contacts", { sort: "recent" })).map(toContact);
  replace(contacts, rows);
  return replace(allContacts, [...rows]);
}

export async function loadConversations(): Promise<Conversation[]> {
  const items = await apiAll<ApiConversation>("/conversations", { view: "all" }, 1000);
  const previous = new Map(conversations.map((c) => [c.id, c.messages]));
  items.forEach((c) => upsertContact(toContact(c.contact)));
  // Keep already-loaded threads so polling the list doesn't blank the open conversation.
  return replace(
    conversations,
    items.map((c) => ({ ...toConversation(c), messages: previous.get(c.id) ?? [] })),
  );
}

export async function loadConversation(id: string): Promise<Conversation> {
  const detail = await api<ApiConversation>(`/conversations/${id}`);
  upsertContact(toContact(detail.contact));
  const convo = toConversation(detail, detail.messages);
  const i = conversations.findIndex((c) => c.id === id);
  if (i >= 0) conversations[i] = convo;
  else conversations.unshift(convo);
  return convo;
}

export async function loadTasks(): Promise<Task[]> {
  return replace(tasks, (await apiAll<ApiTask>("/tasks", {}, 1000)).map(toTask));
}

export async function loadNotifications(): Promise<AppNotification[]> {
  return replace(notifications, (await api<ApiNotification[]>("/notifications", { query: { limit: 200 } })).map(toNotification));
}
