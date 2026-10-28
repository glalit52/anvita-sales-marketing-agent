/** Response shapes of the Anvita API (camelCase). Only the fields the web app reads are listed. */

export type Role = "owner" | "admin" | "manager" | "agent";

export interface OrgSummary {
  id: string;
  name: string;
  slug: string;
  role: Role;
}

export interface ApiUser {
  id: string;
  name: string;
  email: string;
}

export interface SessionResponse {
  accessToken: string;
  refreshToken: string;
  user: ApiUser;
  org: OrgSummary;
  orgs: OrgSummary[];
}

export interface Me {
  user: ApiUser;
  org: OrgSummary;
  orgs: OrgSummary[];
}

export interface ApiMember {
  id: string;
  name: string;
  email: string;
  role: Role;
  online: boolean;
}

export interface ApiContact {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  company: string | null;
  city: string | null;
  stage: "prospect" | "new" | "qualified" | "booked" | "customer" | "lost";
  source: string | null;
  channel: string | null;
  tags: string[];
  ownerId: string; // a user id or "ai"
  score: number;
  valueMinor: number;
  language: string | null;
  lastActivityAt: string | null;
  createdAt: string;
}

export interface ApiMessage {
  id: string;
  conversationId: string;
  authorType: "contact" | "ai" | "human" | "system";
  authorName: string | null;
  body: string;
  isNote: boolean;
  isDraft: boolean;
  card: { type: "booking" | "payment" | "review"; title: string; subtitle: string; status?: string } | null;
  sources: string[];
  status: string;
  createdAt: string;
}

export interface ApiConversation {
  id: string;
  contactId: string;
  channel: string;
  status: "open" | "pending" | "closed";
  assigneeType: "ai" | "human";
  assigneeId: string | null;
  escalationReason: string | null;
  unread: number;
  intent: string | null;
  sentiment: "positive" | "neutral" | "negative" | null;
  aiSummary: string | null;
  preview: string | null;
  lastMessageAt: string | null;
  createdAt: string;
  contact: ApiContact;
  messages?: ApiMessage[];
}

export interface ApiTask {
  id: string;
  title: string;
  type: "call" | "whatsapp" | "email" | "review" | "payment";
  contactId: string | null;
  conversationId: string | null;
  assigneeId: string | null;
  createdByType: string;
  createdById: string | null;
  createdAt: string;
  dueAt: string;
  hasTime: boolean;
  priority: "high" | "normal" | "low";
  done: boolean;
  doneAt: string | null;
  aiContext: string | null;
  aiConfidence: number | null;
  notes: string | null;
}

export interface ApiNotification {
  id: string;
  tab: "mentions" | "escalations" | "ai" | "system";
  icon: string;
  title: string;
  body: string;
  contactId: string | null;
  link: string | null;
  priority: boolean;
  unread: boolean;
  createdAt: string;
}

export interface ApiDashboard {
  rangeDays: number;
  leads: number;
  conversations: number;
  aiHandled: number;
  aiResolutionRate: number;
  bookings: number;
  revenueMinor: number;
  openTasks: number;
  overdueTasks: number;
  escalationsOpen: number;
  medianFirstResponseSeconds: number | null;
  trend: { date: string; leads: number; aiHandled: number; booked: number; revenueMinor: number }[];
}
