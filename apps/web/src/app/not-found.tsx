import { ArrowLeft, CalendarDays, Inbox, LayoutDashboard, LifeBuoy, Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/shell/logo";

export const metadata: Metadata = { title: "Page not found" };

const links = [
  { href: "/dashboard", label: "Dashboard", hint: "KPIs and today's tasks", icon: LayoutDashboard },
  { href: "/inbox", label: "Inbox", hint: "Every conversation", icon: Inbox },
  { href: "/contacts", label: "Contacts", hint: "Leads and customers", icon: Users },
  { href: "/calendar", label: "Calendar", hint: "Appointments", icon: CalendarDays },
];

export default function NotFound() {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-bg text-fg">
      <div className="pointer-events-none absolute -top-40 left-1/2 size-[520px] -translate-x-1/2 rounded-full bg-ai-soft opacity-70 blur-3xl" aria-hidden />
      <header className="relative flex items-center justify-between px-4 py-4 sm:px-8">
        <Link href="/" aria-label="Anvita home">
          <Logo />
        </Link>
        <Link href="/help" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg">
          <LifeBuoy className="size-4" /> Help center
        </Link>
      </header>
      <main className="relative mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-4 py-12 text-center">
        <div className="text-[88px] leading-none font-semibold tracking-tighter sm:text-[120px]">
          <span className="bg-gradient-to-br from-primary to-ai bg-clip-text text-transparent">404</span>
        </div>
        <h1 className="mt-4 text-xl font-semibold tracking-tight sm:text-2xl">This page took a wrong turn</h1>
        <p className="mt-2 max-w-md text-sm text-muted">
          The link may be old, or the contact, booking or pay link it pointed to was removed. Your AI agent is still answering customers in the meantime.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link href="/" className="inline-flex h-9 items-center gap-2 rounded-lg border border-line bg-surface px-4 text-sm font-medium hover:bg-surface-2">
            <ArrowLeft className="size-4" /> Back to home
          </Link>
          <Link href="/dashboard" className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-fg shadow-card hover:bg-primary-hover">
            <LayoutDashboard className="size-4" /> Go to dashboard
          </Link>
        </div>
        <div className="mt-10 grid w-full gap-2 sm:grid-cols-2">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="flex items-center gap-3 rounded-xl border border-line bg-surface p-3 text-left shadow-card transition-colors hover:border-line-strong">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
                <l.icon className="size-4" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium">{l.label}</span>
                <span className="block truncate text-xs text-muted">{l.hint}</span>
              </span>
            </Link>
          ))}
        </div>
      </main>
      <footer className="relative px-4 py-6 text-center text-xs text-muted">Error 404 · If you followed a link inside Anvita, tell us at support@anvita.ai</footer>
    </div>
  );
}
