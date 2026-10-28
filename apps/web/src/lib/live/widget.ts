import { api, ApiError } from "./client";

export interface WidgetMessage {
  id: string;
  author: "visitor" | "ai" | "human" | "system";
  authorName: string | null;
  body: string;
  createdAt: string;
}

const key = (slug: string) => `anvita.webchat.${slug}`;

/** A visitor's chat with one workspace. The widget token is kept so a reload continues the same chat. */
export function liveWidget(slug: string) {
  const read = () => {
    try {
      return window.localStorage.getItem(key(slug));
    } catch {
      return memory.get(slug) ?? null;
    }
  };
  const write = (token: string) => {
    memory.set(slug, token);
    try {
      window.localStorage.setItem(key(slug), token);
    } catch {
      // storage blocked: keep the session for this page only
    }
  };
  const forget = () => {
    memory.delete(slug);
    try {
      window.localStorage.removeItem(key(slug));
    } catch {
      // nothing stored
    }
  };
  const token = async () => {
    const existing = read() ?? memory.get(slug);
    if (existing) return existing;
    const s = await api<{ token: string }>(`/public/webchat/${slug}/sessions`, {
      method: "POST",
      auth: false,
      body: { pageUrl: window.location.href },
    });
    write(s.token);
    return s.token;
  };
  return {
    hasSession: () => Boolean(read() ?? memory.get(slug)),
    async send(body: string): Promise<WidgetMessage> {
      const payload = { body, clientId: crypto.randomUUID() };
      try {
        return await api<WidgetMessage>("/public/webchat/messages", { method: "POST", token: await token(), body: payload });
      } catch (e) {
        if (!(e instanceof ApiError) || e.status !== 401) throw e;
        // Expired chat token: start a fresh session and retry once.
        forget();
        return api<WidgetMessage>("/public/webchat/messages", { method: "POST", token: await token(), body: payload });
      }
    },
    async poll() {
      const t = read() ?? memory.get(slug);
      if (!t) return [];
      return api<WidgetMessage[]>("/public/webchat/messages", { token: t });
    },
  };
}

const memory = new Map<string, string>();
