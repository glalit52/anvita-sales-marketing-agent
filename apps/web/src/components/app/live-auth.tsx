"use client";

import { ArrowRight, Building2, KeyRound, Mail, UserRound } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button, Input } from "@/components/ui";
import { api, errorMessage, setTokens } from "@/lib/live/client";
import { session } from "@/lib/live/store";
import type { SessionResponse } from "@/lib/live/types";

type Mode = "signin" | "signup" | "invite";

/** Email + password sign-in, workspace sign-up and invite acceptance against the Anvita API. */
export function LiveAuthForm({ initialMode = "signin" }: { initialMode?: Mode }) {
  const router = useRouter();
  const params = useSearchParams();
  const invite = params.get("invite");
  const [mode, setMode] = useState<Mode>(invite ? "invite" : initialMode);
  const [form, setForm] = useState({ name: "", email: "", password: "", businessName: "" });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res =
        mode === "signin"
          ? await api<SessionResponse>("/auth/login", { method: "POST", auth: false, body: { email: form.email, password: form.password } })
          : mode === "signup"
            ? await api<SessionResponse>("/auth/signup", { method: "POST", auth: false, body: form })
            : await api<SessionResponse>("/auth/accept-invite", {
                method: "POST",
                auth: false,
                body: { token: invite, name: form.name || undefined, password: form.password },
              });
      setTokens({ accessToken: res.accessToken, refreshToken: res.refreshToken });
      session.me = null; // force a fresh bootstrap for the new session
      const next = params.get("next");
      router.replace(next?.startsWith("/") ? next : "/dashboard");
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      {mode === "invite" && <p className="text-sm text-muted">You&apos;ve been invited to a workspace. Set your name and password to join.</p>}
      {(mode === "signup" || mode === "invite") && (
        <Input icon={<UserRound />} required={mode === "signup"} value={form.name} onChange={set("name")} placeholder="Your name" autoComplete="name" />
      )}
      {mode === "signup" && (
        <Input icon={<Building2 />} required value={form.businessName} onChange={set("businessName")} placeholder="Business name" autoComplete="organization" />
      )}
      {mode !== "invite" && (
        <Input icon={<Mail />} type="email" required value={form.email} onChange={set("email")} placeholder="you@business.com" autoComplete="email" />
      )}
      <Input
        icon={<KeyRound />}
        type="password"
        required
        minLength={mode === "signin" ? undefined : 10}
        value={form.password}
        onChange={set("password")}
        placeholder={mode === "signin" ? "Password" : "Password (10+ characters)"}
        autoComplete={mode === "signin" ? "current-password" : "new-password"}
      />
      {error && <p className="text-sm text-danger" role="alert">{error}</p>}
      <Button type="submit" size="lg" className="w-full" disabled={busy}>
        {busy ? "Please wait…" : mode === "signin" ? "Sign in" : mode === "signup" ? "Create workspace" : "Join workspace"} <ArrowRight />
      </Button>
      {mode !== "invite" && (
        <p className="pt-2 text-center text-sm text-muted">
          {mode === "signin" ? "New to Anvita? " : "Already have an account? "}
          <button type="button" className="font-medium text-primary hover:underline" onClick={() => setMode(mode === "signin" ? "signup" : "signin")}>
            {mode === "signin" ? "Create a workspace" : "Sign in"}
          </button>
        </p>
      )}
    </form>
  );
}
