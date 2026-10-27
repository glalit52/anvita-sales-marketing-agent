"use client";

import { ArrowRight, Mail } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { LogoMark } from "@/components/shell/logo";
import { Button, Input, useToast } from "@/components/ui";
import { Container } from "./primitives";

type FooterLink = { label: string; href?: string };

const columns: { title: string; links: FooterLink[] }[] = [
  {
    title: "Product",
    links: [
      { label: "AI Agent", href: "/#agent" },
      { label: "Prospecting", href: "/#prospecting" },
      { label: "AI marketing", href: "/#marketing" },
      { label: "Reviews & payments", href: "/#reviews" },
      { label: "Analytics", href: "/#analytics" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  {
    title: "Solutions",
    links: [
      { label: "Clinics", href: "/solutions/clinics" },
      { label: "Real estate" },
      { label: "Education" },
      { label: "Auto dealers" },
      { label: "Home services" },
      { label: "B2B & distribution" },
    ],
  },
  {
    title: "Company",
    links: [{ label: "About" }, { label: "Customers", href: "/solutions/clinics" }, { label: "Careers" }, { label: "Partners & agencies", href: "/pricing#agency" }, { label: "Contact sales" }],
  },
  {
    title: "Resources",
    links: [{ label: "Help centre" }, { label: "API docs" }, { label: "WhatsApp API guide" }, { label: "Blog" }, { label: "System status" }],
  },
  {
    title: "Legal",
    links: [{ label: "Privacy policy" }, { label: "Terms of service" }, { label: "DPDP notice" }, { label: "DPA & sub-processors" }, { label: "Security" }],
  },
];

export function SiteFooter() {
  const toast = useToast();
  const [email, setEmail] = useState("");

  return (
    <footer className="border-t border-line bg-surface">
      <Container className="py-14">
        <div className="grid gap-10 lg:grid-cols-[1.3fr_3fr]">
          <div className="max-w-sm">
            <Link href="/" className="inline-flex items-center gap-2" aria-label="Anvita home">
              <LogoMark />
              <span className="text-[17px] font-semibold tracking-tight">Anvita</span>
            </Link>
            <p className="mt-4 text-sm text-fg-2">
              The AI sales & marketing team for growing businesses. Finds customers, answers every enquiry, books and gets paid.
            </p>
            <form
              className="mt-5 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (!email.includes("@")) {
                  toast({ title: "Enter a valid email", tone: "warning" });
                  return;
                }
                toast({ title: "You're subscribed", description: `Monthly growth playbooks for Indian SMBs, sent to ${email}.` });
                setEmail("");
              }}
            >
              <Input
                aria-label="Email for newsletter"
                placeholder="you@business.in"
                icon={<Mail />}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="min-w-0 flex-1"
              />
              <Button type="submit" variant="secondary" aria-label="Subscribe">
                <ArrowRight />
              </Button>
            </form>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:grid-cols-5">
            {columns.map((col) => (
              <div key={col.title}>
                <h3 className="text-xs font-semibold tracking-wider text-muted uppercase">{col.title}</h3>
                <ul className="mt-3 space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      {l.href ? (
                        <Link href={l.href} className="text-sm text-fg-2 transition-colors hover:text-fg">
                          {l.label}
                        </Link>
                      ) : (
                        <button
                          type="button"
                          onClick={() => toast({ title: `${l.label}: coming soon`, description: "This page is being written. Ping us on WhatsApp in the meantime." })}
                          className="text-left text-sm text-fg-2 transition-colors hover:text-fg"
                        >
                          {l.label}
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-line pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Anvita Technologies Pvt. Ltd. · Made in India · Prices in ₹, exclusive of GST</p>
          <p className="flex flex-wrap gap-x-4 gap-y-1">
            <span>DPDP Act 2023</span>
            <span>GDPR-ready</span>
            <span>WhatsApp Business Platform</span>
            <span>TRAI DLT</span>
          </p>
        </div>
      </Container>
    </footer>
  );
}
