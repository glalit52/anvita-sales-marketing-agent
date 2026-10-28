"use client";

import { Loader2, PlugZap } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { Button, Card } from "@/components/ui";
import { api, errorMessage, getTokens, SESSION_EXPIRED, setTokens } from "./client";
import { LIVE } from "./config";
import { bootstrap, session } from "./store";
import type { Me } from "./types";

const SessionContext = createContext<Me | null>(null);

/** The signed-in user and workspace (live mode only; null in the demo). */
export const useLiveSession = () => useContext(SessionContext);

export async function signOut() {
  const tokens = getTokens();
  setTokens(null);
  session.me = null;
  if (tokens) await api("/auth/logout", { method: "POST", body: { refreshToken: tokens.refreshToken }, auth: false }).catch(() => {});
}

/** Screens backed by the API. Other modules show a "not connected yet" card in live mode. */
const CONNECTED = ["/dashboard", "/inbox", "/tasks", "/contacts", "/notifications", "/help"];

function NotConnected() {
  return (
    <div className="mx-auto max-w-lg p-6 pt-16">
      <Card className="p-6 text-center">
        <PlugZap className="mx-auto size-8 text-muted" />
        <h1 className="mt-3 text-lg font-semibold">Not connected to your workspace yet</h1>
        <p className="mt-1 text-sm text-muted">
          This module still runs on demo data. It will switch to live data as its backend ships. Inbox, contacts, tasks and
          the dashboard already work with your real workspace.
        </p>
        <div className="mt-4 flex justify-center gap-2">
          <Link href="/inbox">
            <Button>Open inbox</Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline">Dashboard</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}

/**
 * In live mode: requires a session, loads the workspace into the store, then renders the app.
 * In demo mode it renders its children untouched.
 */
export function LiveGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(session.me);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!LIVE) return;
    const toLogin = () => router.replace(`/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
    window.addEventListener(SESSION_EXPIRED, toLogin);
    if (!getTokens()) toLogin();
    else if (!session.me)
      bootstrap()
        .then(setMe)
        .catch((e) => setError(errorMessage(e)));
    return () => window.removeEventListener(SESSION_EXPIRED, toLogin);
  }, [router]);

  if (!LIVE) return <>{children}</>;
  if (error)
    return (
      <div className="flex h-dvh flex-col items-center justify-center gap-3 p-6 text-center text-sm">
        <p className="text-danger">Couldn&apos;t load your workspace: {error}</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Try again
        </Button>
      </div>
    );
  if (!me)
    return (
      <div className="flex h-dvh items-center justify-center text-sm text-muted">
        <Loader2 className="mr-2 size-4 animate-spin" /> Loading your workspace…
      </div>
    );
  return <SessionContext.Provider value={me}>{children}</SessionContext.Provider>;
}

/** Wraps page content: in live mode, modules without a backend yet show a placeholder. */
export function LiveRoute({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (!LIVE || CONNECTED.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return <>{children}</>;
  return <NotConnected />;
}
