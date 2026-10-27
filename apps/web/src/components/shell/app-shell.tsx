"use client";

import {
  Bell,
  Bot,
  CalendarCheck,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  CreditCard,
  HelpCircle,
  LogOut,
  Menu,
  Plus,
  Search,
  Sparkles,
  Star,
  TriangleAlert,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { allNavItems, navSections } from "@/lib/nav";
import { Avatar, Badge, Kbd, Progress } from "@/components/ui";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme";

const locations = ["Smile Dental · Koregaon Park", "Smile Dental · Baner", "All locations"];

const notifications = [
  { icon: TriangleAlert, tone: "text-danger", title: "Escalated: unhappy patient", body: "Rohit Mehta · AI handed off after negative sentiment", time: "2m" },
  { icon: CalendarCheck, tone: "text-success", title: "AI booked 3 appointments", body: "Saturday slots are now 80% full", time: "18m" },
  { icon: CreditCard, tone: "text-info", title: "Payment received ₹4,500", body: "Ananya Rao paid invoice INV-1042", time: "1h" },
  { icon: Star, tone: "text-warning", title: "New 5★ Google review", body: "“Painless whitening, super friendly staff…”", time: "3h" },
];

function useOutsideClose(open: boolean, close: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, close]);
  return ref;
}

function SidebarContent({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="scroll-thin flex-1 overflow-y-auto px-3 py-2">
      {navSections.map((section, i) => (
        <div key={i} className={cn(i > 0 && "mt-5")}>
          {section.title && !collapsed && (
            <div className="mb-1 px-2 text-[11px] font-semibold tracking-wider text-muted uppercase">{section.title}</div>
          )}
          {section.title && collapsed && <div className="mx-2 mb-2 border-t border-line" />}
          <ul className="space-y-0.5">
            {section.items.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    title={collapsed ? item.label : undefined}
                    className={cn(
                      "group flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm font-medium transition-colors",
                      active ? "bg-primary-soft text-primary" : "text-fg-2 hover:bg-surface-2 hover:text-fg",
                      collapsed && "justify-center",
                    )}
                  >
                    <Icon className="size-[18px] shrink-0" />
                    {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                    {!collapsed && item.badge && (
                      <span className="rounded-full bg-primary px-1.5 text-[10px] leading-4 font-semibold text-primary-fg">{item.badge}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function AiStatusCard({ collapsed }: { collapsed: boolean }) {
  if (collapsed) {
    return (
      <div className="flex justify-center pb-2" title="AI Agent: Autopilot">
        <span className="relative">
          <Bot className="size-5 text-ai" />
          <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-success" />
        </span>
      </div>
    );
  }
  return (
    <div className="mx-3 mb-2 rounded-xl border border-line bg-surface-2 p-3 [@media(max-height:940px)]:hidden">
      <div className="flex items-center gap-2 text-xs font-semibold">
        <span className="size-2 rounded-full bg-success" />
        AI Agent · Autopilot
      </div>
      <div className="mt-2 flex items-center justify-between text-[11px] text-muted">
        <span>AI conversations</span>
        <span className="tabular">1,284 / 2,000</span>
      </div>
      <Progress value={64} tone="ai" className="mt-1" />
      <div className="mt-2 flex items-center justify-between text-[11px] text-muted">
        <span>Prospecting credits</span>
        <span className="tabular">3,420</span>
      </div>
    </div>
  );
}

function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const actions = useMemo(
    () => [
      ...allNavItems.map((i) => ({ label: `Go to ${i.label}`, hint: i.description, href: i.href, icon: i.icon })),
      { label: "New prospect search", hint: "Describe your ideal customer", href: "/prospecting", icon: Sparkles },
      { label: "Create campaign", hint: "WhatsApp, SMS or email broadcast", href: "/campaigns?new=1", icon: Plus },
      { label: "Test AI agent in sandbox", hint: "Chat with your AI before going live", href: "/agent?tab=sandbox", icon: Bot },
      { label: "Run onboarding again", hint: "Website import and channel setup", href: "/onboarding", icon: Sparkles },
      { label: "Add a task", hint: "Quick-add follow-ups in plain words", href: "/tasks", icon: Plus },
      { label: "Notifications", hint: "Mentions, escalations and AI activity", href: "/notifications", icon: Bell },
      { label: "Help center", hint: "Guides, shortcuts and Ask Anvita AI", href: "/help", icon: HelpCircle },
    ],
    [],
  );

  const results = actions.filter((a) => (a.label + a.hint).toLowerCase().includes(query.toLowerCase())).slice(0, 9);

  if (!open) return null;

  const go = (href: string) => {
    router.push(href);
    onClose();
    setQuery("");
  };

  return (
    <div className="fixed inset-0 z-[55] flex items-start justify-center px-4 pt-[12vh]">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="animate-fade-in relative w-full max-w-xl overflow-hidden rounded-2xl border border-line bg-surface shadow-pop">
        <div className="flex items-center gap-2 border-b border-line px-4">
          <Search className="size-4 text-muted" />
          <input
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") setActive((a) => Math.min(a + 1, results.length - 1));
              if (e.key === "ArrowUp") setActive((a) => Math.max(a - 1, 0));
              if (e.key === "Enter" && results[active]) go(results[active].href);
              if (e.key === "Escape") onClose();
            }}
            placeholder="Search pages, contacts, or ask AI…"
            className="h-12 flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
          />
          <Kbd>Esc</Kbd>
        </div>
        <ul className="max-h-[50vh] overflow-y-auto p-2">
          {results.map((r, i) => {
            const Icon = r.icon;
            return (
              <li key={r.label}>
                <button
                  onMouseEnter={() => setActive(i)}
                  onClick={() => go(r.href)}
                  className={cn("flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left", i === active && "bg-surface-2")}
                >
                  <Icon className="size-4 text-muted" />
                  <span className="flex-1 text-sm">{r.label}</span>
                  <span className="hidden truncate text-xs text-muted sm:block">{r.hint}</span>
                </button>
              </li>
            );
          })}
          {results.length === 0 && (
            <li className="px-3 py-6 text-center text-sm text-muted">
              No matches. Press <Kbd>Enter</Kbd> to ask Anvita AI about “{query}”.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}

function Topbar({ onMenu, onSearch }: { onMenu: () => void; onSearch: () => void }) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifRead, setNotifRead] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [locOpen, setLocOpen] = useState(false);
  const [location, setLocation] = useState(locations[0]);
  const notifRef = useOutsideClose(notifOpen, () => setNotifOpen(false));
  const userRef = useOutsideClose(userOpen, () => setUserOpen(false));
  const locRef = useOutsideClose(locOpen, () => setLocOpen(false));

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b border-line bg-surface/85 px-3 backdrop-blur sm:px-4">
      <button onClick={onMenu} className="rounded-lg p-2 text-fg-2 hover:bg-surface-2 lg:hidden" aria-label="Open menu">
        <Menu className="size-5" />
      </button>

      <div ref={locRef} className="relative hidden md:block">
        <button onClick={() => setLocOpen((o) => !o)} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium hover:bg-surface-2">
          <span className="flex size-5 items-center justify-center rounded bg-accent text-[10px] font-bold text-white">S</span>
          <span className="max-w-[220px] truncate">{location}</span>
          <ChevronDown className="size-3.5 text-muted" />
        </button>
        {locOpen && (
          <div className="animate-fade-in absolute top-full left-0 mt-1 w-64 rounded-xl border border-line bg-surface p-1 shadow-pop">
            {locations.map((l) => (
              <button
                key={l}
                onClick={() => {
                  setLocation(l);
                  setLocOpen(false);
                }}
                className={cn("w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-surface-2", l === location && "font-semibold text-primary")}
              >
                {l}
              </button>
            ))}
            <div className="my-1 border-t border-line" />
            <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-muted hover:bg-surface-2">
              <Plus className="size-3.5" /> Add location
            </button>
          </div>
        )}
      </div>

      <button
        onClick={onSearch}
        className="mx-auto flex h-9 w-full max-w-md items-center gap-2 rounded-lg border border-line bg-surface-2 px-3 text-sm text-muted hover:border-line-strong"
      >
        <Search className="size-4" />
        <span className="flex-1 truncate text-left">Search or ask AI…</span>
        <span className="hidden sm:inline">
          <Kbd>⌘K</Kbd>
        </span>
      </button>

      <div className="flex items-center gap-1">
        <span className="hidden sm:block">
          <ThemeToggle />
        </span>
        <Link href="/help" className="hidden rounded-lg p-2 text-fg-2 hover:bg-surface-2 md:block" aria-label="Help center">
          <HelpCircle className="size-5" />
        </Link>
        <div ref={notifRef} className="relative">
          <button onClick={() => setNotifOpen((o) => !o)} className="relative rounded-lg p-2 text-fg-2 hover:bg-surface-2" aria-label="Notifications">
            <Bell className="size-5" />
            {!notifRead && <span className="absolute top-1.5 right-1.5 size-2 rounded-full border-2 border-surface bg-danger" />}
          </button>
          {notifOpen && (
            <div className="animate-fade-in absolute top-full right-0 mt-1 w-[min(360px,calc(100vw-1.5rem))] rounded-xl border border-line bg-surface shadow-pop">
              <div className="flex items-center justify-between border-b border-line px-4 py-3">
                <span className="text-sm font-semibold">Notifications</span>
                <button className="text-xs text-primary" onClick={() => setNotifRead(true)}>
                  Mark all read
                </button>
              </div>
              <ul className="max-h-96 overflow-y-auto">
                {notifications.map((n) => (
                  <li key={n.title} className="border-b border-line last:border-0">
                    <Link href="/notifications" onClick={() => setNotifOpen(false)} className="flex gap-3 px-4 py-3 hover:bg-surface-2">
                      <n.icon className={cn("mt-0.5 size-4 shrink-0", n.tone)} />
                      <div className="min-w-0 flex-1">
                        <div className={cn("text-sm", notifRead ? "text-fg-2" : "font-medium")}>{n.title}</div>
                        <div className="truncate text-xs text-muted">{n.body}</div>
                      </div>
                      <span className="text-[11px] text-muted">{n.time}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                href="/notifications"
                onClick={() => setNotifOpen(false)}
                className="block rounded-b-xl border-t border-line px-4 py-2.5 text-center text-sm font-medium text-primary hover:bg-surface-2"
              >
                View all notifications
              </Link>
            </div>
          )}
        </div>
        <div ref={userRef} className="relative">
          <button onClick={() => setUserOpen((o) => !o)} className="ml-1 rounded-full" aria-label="Account menu">
            <Avatar name="Priya Sharma" online />
          </button>
          {userOpen && (
            <div className="animate-fade-in absolute top-full right-0 mt-1 w-60 rounded-xl border border-line bg-surface p-1 shadow-pop">
              <div className="px-3 py-2">
                <div className="text-sm font-semibold">Priya Sharma</div>
                <div className="text-xs text-muted">priya@smiledental.in · Owner</div>
              </div>
              <div className="my-1 border-t border-line" />
              <Link href="/settings" className="block rounded-lg px-3 py-2 text-sm hover:bg-surface-2">Account settings</Link>
              <Link href="/settings?tab=billing" className="block rounded-lg px-3 py-2 text-sm hover:bg-surface-2">Plan & billing</Link>
              <div className="px-3 py-2 sm:hidden">
                <ThemeToggle />
              </div>
              <div className="my-1 border-t border-line" />
              <Link href="/login" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-danger hover:bg-surface-2">
                <LogOut className="size-4" /> Sign out
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="flex h-dvh overflow-hidden">
      {/* Desktop sidebar */}
      <aside className={cn("hidden shrink-0 flex-col border-r border-line bg-surface transition-[width] lg:flex", collapsed ? "w-[68px]" : "w-60")}>
        <div className={cn("flex h-14 items-center border-b border-line px-4", collapsed && "justify-center px-0")}>
          <Link href="/dashboard">
            <Logo collapsed={collapsed} />
          </Link>
          {!collapsed && (
            <Badge tone="ai" className="ml-2">
              Beta
            </Badge>
          )}
        </div>
        <SidebarContent collapsed={collapsed} />
        <AiStatusCard collapsed={collapsed} />
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="flex items-center gap-2 border-t border-line px-5 py-3 text-xs text-muted hover:text-fg"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronsRight className="mx-auto size-4" /> : <><ChevronsLeft className="size-4" /> Collapse</>}
        </button>
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="animate-fade-in relative flex h-full w-72 flex-col bg-surface shadow-pop">
            <div className="flex h-14 items-center justify-between border-b border-line px-4">
              <Logo />
              <button onClick={() => setMobileOpen(false)} className="rounded-lg p-1.5 text-muted hover:bg-surface-2" aria-label="Close menu">
                <X className="size-5" />
              </button>
            </div>
            <SidebarContent collapsed={false} onNavigate={() => setMobileOpen(false)} />
            <AiStatusCard collapsed={false} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenu={() => setMobileOpen(true)} onSearch={() => setPaletteOpen(true)} />
        <main className="scroll-thin min-h-0 flex-1 overflow-y-auto">{children}</main>
      </div>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  );
}
