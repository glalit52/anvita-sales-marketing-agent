"use client";

import { ArrowRight, CalendarCheck, Mail, MessageCircle, Sparkles, Star } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogoMark } from "@/components/shell/logo";
import { Button, Input } from "@/components/ui";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="flex flex-col px-6 py-8 sm:px-12">
        <Link href="/" className="inline-flex items-center gap-2">
          <LogoMark />
          <span className="font-semibold">Anvita</span>
        </Link>
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12">
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="mt-1 text-sm text-muted">Sign in to your AI sales & marketing team.</p>

          <div className="mt-8 space-y-2">
            <Button variant="outline" size="lg" className="w-full" onClick={() => router.push("/dashboard")}>
              <span className="flex size-5 items-center justify-center rounded-full bg-[#4285f4] text-[11px] font-bold text-white">G</span>
              Continue with Google
            </Button>
            <Button variant="outline" size="lg" className="w-full" onClick={() => router.push("/dashboard")}>
              <span className="flex size-5 items-center justify-center rounded-sm bg-[#00a4ef] text-[11px] font-bold text-white">M</span>
              Continue with Microsoft
            </Button>
          </div>

          <div className="my-6 flex items-center gap-3 text-xs text-muted">
            <span className="h-px flex-1 bg-line" /> or <span className="h-px flex-1 bg-line" />
          </div>

          {sent ? (
            <div className="rounded-xl border border-line bg-surface p-4 text-sm">
              <div className="font-medium">Check your inbox</div>
              <p className="mt-1 text-muted">
                We sent a 6-digit code to <b className="text-fg">{email}</b>.
              </p>
              <div className="mt-3 flex gap-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <input key={i} maxLength={1} aria-label={`Digit ${i + 1}`} className="h-11 w-full rounded-lg border border-line bg-surface text-center text-lg outline-none focus:border-primary" />
                ))}
              </div>
              <Button className="mt-4 w-full" onClick={() => router.push("/dashboard")}>
                Verify & sign in
              </Button>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (email) setSent(true);
              }}
              className="space-y-3"
            >
              <Input icon={<Mail />} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@business.com" />
              <Button type="submit" size="lg" className="w-full">
                Email me a code <ArrowRight />
              </Button>
            </form>
          )}

          <p className="mt-8 text-center text-sm text-muted">
            New to Anvita?{" "}
            <Link href="/onboarding" className="font-medium text-primary hover:underline">
              Start free, set up in 10 minutes
            </Link>
          </p>
        </div>
        <p className="text-xs text-muted">© 2026 Anvita · Privacy · Terms · DPDP & GDPR ready</p>
      </div>

      <div className="relative hidden overflow-hidden bg-gradient-to-br from-primary to-ai p-12 text-white lg:flex lg:flex-col lg:justify-center">
        <div className="absolute -top-24 -right-24 size-96 rounded-full bg-white/10 blur-3xl" />
        <div className="relative max-w-md">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
            <Sparkles className="size-3.5" /> Your AI revenue team
          </div>
          <h2 className="mt-5 text-4xl leading-tight font-semibold">Find, engage, convert and retain customers, on autopilot.</h2>
          <div className="mt-10 space-y-3">
            {[
              { icon: MessageCircle, text: "Replied to a WhatsApp enquiry in 38s at 11:40 PM" },
              { icon: CalendarCheck, text: "Booked Saturday 10:00 AM + collected ₹500 deposit" },
              { icon: Star, text: "Requested a review: new 5★ on Google" },
            ].map((r, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl bg-white/12 px-4 py-3 text-sm backdrop-blur" style={{ marginLeft: i * 20 }}>
                <r.icon className="size-4 shrink-0" />
                {r.text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
