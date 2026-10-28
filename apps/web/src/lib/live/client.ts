import { API_URL } from "./config";

const STORAGE_KEY = "anvita.session";

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown,
  ) {
    super(message);
  }
}

export function getTokens(): Tokens | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Tokens) : null;
  } catch {
    return null;
  }
}

export function setTokens(tokens: Tokens | null) {
  try {
    if (tokens) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage blocked (private mode): the session lasts for this page only.
  }
}

type Query = Record<string, string | number | boolean | undefined | null | string[]>;

function url(path: string, query?: Query) {
  const u = new URL(`${API_URL}/api/v1${path}`);
  for (const [k, v] of Object.entries(query ?? {})) {
    if (v === undefined || v === null || v === "") continue;
    if (Array.isArray(v)) v.forEach((item) => u.searchParams.append(k, item));
    else u.searchParams.set(k, String(v));
  }
  return u.toString();
}

let refreshing: Promise<boolean> | null = null;

/** Rotates the refresh token once, even when several requests hit an expired access token together. */
async function refresh(): Promise<boolean> {
  const tokens = getTokens();
  if (!tokens) return false;
  refreshing ??= (async () => {
    try {
      const res = await fetch(url("/auth/refresh"), {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ refreshToken: tokens.refreshToken }),
      });
      if (!res.ok) return false;
      const data = await res.json();
      setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
      return true;
    } catch {
      return false;
    } finally {
      refreshing = null;
    }
  })();
  return refreshing;
}

/** Fired when the session can no longer be refreshed; the app shell sends the user to /login. */
export const SESSION_EXPIRED = "anvita:session-expired";

export async function api<T>(
  path: string,
  opts: { method?: string; body?: unknown; query?: Query; auth?: boolean; token?: string } = {},
): Promise<T> {
  const { method = "GET", body, query, auth = true, token } = opts;
  const send = () => {
    const headers: Record<string, string> = {};
    if (body !== undefined) headers["content-type"] = "application/json";
    const bearer = token ?? (auth ? getTokens()?.accessToken : undefined);
    if (bearer) headers.authorization = `Bearer ${bearer}`;
    return fetch(url(path, query), { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  };
  let res = await send();
  if (res.status === 401 && auth && !token) {
    if (await refresh()) res = await send();
    else {
      setTokens(null);
      window.dispatchEvent(new Event(SESSION_EXPIRED));
    }
  }
  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const err = data?.error ?? {};
    throw new ApiError(res.status, err.code ?? "http_error", err.message ?? `Request failed (${res.status})`, err.details);
  }
  return data as T;
}

/** Fetches every page of a paginated list endpoint (bounded, for small-business sized data). */
export async function apiAll<T>(path: string, query: Query = {}, max = 2000): Promise<T[]> {
  const items: T[] = [];
  for (let offset = 0; offset < max; offset += 200) {
    const page = await api<{ items: T[]; total: number }>(path, { query: { ...query, limit: 200, offset } });
    items.push(...page.items);
    if (items.length >= page.total || page.items.length === 0) break;
  }
  return items;
}

export const errorMessage = (e: unknown) => (e instanceof Error ? e.message : "Something went wrong");

/** A paid-API slot (Apollo, Google Ads, …) isn't configured: the API answers 501 with the vendor options. */
export function providerMissing(e: unknown): { kind: string; options: { id: string; name: string }[] } | null {
  if (!(e instanceof ApiError) || e.code !== "provider_not_configured") return null;
  const d = (e.details ?? {}) as { kind?: string; options?: { id: string; name: string }[] };
  return { kind: d.kind ?? "", options: d.options ?? [] };
}

/** Toast-friendly text for API errors, pointing at Integrations when a paid provider is missing. */
export function friendlyError(e: unknown): string {
  const missing = providerMissing(e);
  if (missing) {
    const names = missing.options.map((o) => o.name).join(" or ");
    return `Connect ${names || "a provider"} in Integrations to use this.`;
  }
  return errorMessage(e);
}
