"use client";

import { ArrowRight, ChevronDown, LogIn, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LogoMark } from "@/components/shell/logo";
import { ThemeToggle } from "@/components/shell/theme";
import { Badge } from "@/components/ui";
import { cn } from "@/lib/cn";
import { industries, productNav } from "@/lib/mock/site";
import { Container, LinkButton } from "./primitives";

type MenuId = "product" | "solutions";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState<MenuId | null>(null);
  const [mobile, setMobile] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    const raf = requestAnimationFrame(onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpen(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(null);
        setMobile(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  // Lock page scroll while the mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = mobile ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobile]);

  const close = () => {
    setOpen(null);
    setMobile(false);
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b transition-colors",
        mobile ? "border-line bg-bg" : scrolled ? "border-line bg-bg/85 backdrop-blur-xl" : "border-transparent bg-transparent",
      )}
    >
      <Container className="flex h-16 items-center gap-4">
        <Link href="/" onClick={close} className="inline-flex items-center gap-2" aria-label="Anvita home">
          <LogoMark />
          <span className="text-[17px] font-semibold tracking-tight">Anvita</span>
        </Link>

        <nav ref={navRef} aria-label="Main" className="relative ml-6 hidden items-center gap-1 lg:flex">
          <MenuTrigger id="product" label="Product" open={open} setOpen={setOpen} />
          <MenuTrigger id="solutions" label="Solutions" open={open} setOpen={setOpen} />
          <Link
            href="/pricing"
            className={cn(
              "rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-surface-2 hover:text-fg",
              pathname === "/pricing" ? "text-fg" : "text-fg-2",
            )}
          >
            Pricing
          </Link>
          <Link href="/#faq" className="rounded-lg px-3 py-2 text-sm font-medium text-fg-2 transition-colors hover:bg-surface-2 hover:text-fg">
            FAQ
          </Link>

          {open === "product" && (
            <div className="site-pop absolute top-14 left-1/2 w-[640px] -translate-x-1/2 rounded-2xl border border-line bg-surface p-3 shadow-pop">
              <div className="grid grid-cols-2 gap-1">
                {productNav.map((p) => (
                  <Link key={p.id} href={p.href} onClick={close} className="flex gap-3 rounded-xl p-3 transition-colors hover:bg-surface-2">
                    <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
                      <p.icon className="size-4" />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold">{p.label}</span>
                      <span className="block text-xs text-muted">{p.description}</span>
                    </span>
                  </Link>
                ))}
                <Link href="/dashboard" onClick={close} className="flex flex-col justify-center rounded-xl bg-gradient-to-br from-primary to-ai p-3 text-white">
                  <span className="text-sm font-semibold">Try the live demo</span>
                  <span className="mt-0.5 inline-flex items-center gap-1 text-xs text-white/80">
                    Smile Dental workspace <ArrowRight className="size-3" />
                  </span>
                </Link>
              </div>
            </div>
          )}
          {open === "solutions" && (
            <div className="site-pop absolute top-14 left-1/2 w-[560px] -translate-x-1/2 rounded-2xl border border-line bg-surface p-3 shadow-pop">
              <div className="grid grid-cols-2 gap-1">
                {industries.map((ind) => (
                  <IndustryLink key={ind.id} ind={ind} onClick={close} />
                ))}
              </div>
            </div>
          )}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle className="hidden md:inline-flex" />
          <LinkButton href="/login" variant="ghost" size="sm" className="hidden sm:inline-flex">
            <LogIn /> Log in
          </LinkButton>
          <LinkButton href="/onboarding" variant="ai" size="sm" className="hidden sm:inline-flex">
            Start free <ArrowRight />
          </LinkButton>
          <button
            type="button"
            className="inline-flex size-9 items-center justify-center rounded-lg text-fg hover:bg-surface-2 lg:hidden"
            aria-label={mobile ? "Close menu" : "Open menu"}
            aria-expanded={mobile}
            onClick={() => setMobile((v) => !v)}
          >
            {mobile ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </Container>

      {mobile && <MobileMenu onClose={close} />}
    </header>
  );
}

function MenuTrigger({
  id,
  label,
  open,
  setOpen,
}: {
  id: MenuId;
  label: string;
  open: MenuId | null;
  setOpen: (v: MenuId | null) => void;
}) {
  const active = open === id;
  return (
    <button
      type="button"
      aria-expanded={active}
      onClick={() => setOpen(active ? null : id)}
      className={cn(
        "inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-surface-2 hover:text-fg",
        active ? "bg-surface-2 text-fg" : "text-fg-2",
      )}
    >
      {label}
      <ChevronDown className={cn("size-3.5 transition-transform", active && "rotate-180")} />
    </button>
  );
}

function IndustryLink({ ind, onClick }: { ind: (typeof industries)[number]; onClick: () => void }) {
  const inner = (
    <>
      <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-fg-2">
        <ind.icon className="size-4" />
      </span>
      <span className="min-w-0">
        <span className="flex items-center gap-1.5 text-sm font-semibold">
          {ind.label}
          {!ind.href && <Badge>Soon</Badge>}
        </span>
        <span className="block truncate text-xs text-muted">{ind.examples}</span>
      </span>
    </>
  );
  return ind.href ? (
    <Link href={ind.href} onClick={onClick} className="flex gap-3 rounded-xl p-3 transition-colors hover:bg-surface-2">
      {inner}
    </Link>
  ) : (
    <div className="flex gap-3 rounded-xl p-3 opacity-70" aria-disabled>
      {inner}
    </div>
  );
}

function MobileMenu({ onClose }: { onClose: () => void }) {
  const [section, setSection] = useState<MenuId | null>("product");
  return (
    <div className="site-pop fixed inset-x-0 top-16 bottom-0 z-40 overflow-y-auto border-t border-line bg-bg lg:hidden">
      <div className="space-y-1 px-4 py-4">
        {(["product", "solutions"] as const).map((id) => (
          <div key={id} className="rounded-xl">
            <button
              type="button"
              aria-expanded={section === id}
              onClick={() => setSection(section === id ? null : id)}
              className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-base font-semibold hover:bg-surface-2"
            >
              {id === "product" ? "Product" : "Solutions"}
              <ChevronDown className={cn("size-4 text-muted transition-transform", section === id && "rotate-180")} />
            </button>
            {section === id && (
              <div className="grid gap-1 pb-2 pl-1">
                {id === "product"
                  ? productNav.map((p) => (
                      <Link key={p.id} href={p.href} onClick={onClose} className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-surface-2">
                        <span className="inline-flex size-8 items-center justify-center rounded-lg bg-primary-soft text-primary">
                          <p.icon className="size-4" />
                        </span>
                        <span>
                          <span className="block text-sm font-medium">{p.label}</span>
                          <span className="block text-xs text-muted">{p.description}</span>
                        </span>
                      </Link>
                    ))
                  : industries.map((ind) => <IndustryLink key={ind.id} ind={ind} onClick={onClose} />)}
              </div>
            )}
          </div>
        ))}
        <Link href="/pricing" onClick={onClose} className="block rounded-xl px-3 py-3 text-base font-semibold hover:bg-surface-2">
          Pricing
        </Link>
        <Link href="/#faq" onClick={onClose} className="block rounded-xl px-3 py-3 text-base font-semibold hover:bg-surface-2">
          FAQ
        </Link>
        <div className="flex items-center justify-between rounded-xl px-3 py-3">
          <span className="text-sm text-muted">Theme</span>
          <ThemeToggle />
        </div>
      </div>
      <div className="sticky bottom-0 grid gap-2 border-t border-line bg-bg px-4 py-4">
        <LinkButton href="/onboarding" onClick={onClose} variant="ai" size="lg" className="w-full">
          Start free trial <ArrowRight />
        </LinkButton>
        <div className="grid grid-cols-2 gap-2">
          <LinkButton href="/login" onClick={onClose} variant="outline" size="lg">
            <LogIn /> Log in
          </LinkButton>
          <LinkButton href="/dashboard" onClick={onClose} variant="outline" size="lg">
            Live demo
          </LinkButton>
        </div>
      </div>
    </div>
  );
}
