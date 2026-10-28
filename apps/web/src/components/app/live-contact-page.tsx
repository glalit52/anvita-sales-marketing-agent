"use client";

import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ContactProfile } from "@/components/sell/contact-drawer";
import { Card, Page, useToast } from "@/components/ui";
import { contactPatch, toContact } from "@/lib/live/adapters";
import { api, errorMessage } from "@/lib/live/client";
import { upsertContact } from "@/lib/live/store";
import type { ApiContact } from "@/lib/live/types";
import type { Contact } from "@/lib/mock/core";
import { allContacts } from "@/lib/mock/sell";

/** Full-page contact profile in live mode (the demo uses the richer mock-driven ContactProfile). */
export function LiveContactPage({ id }: { id: string }) {
  const toast = useToast();
  const [contact, setContact] = useState<Contact | null | undefined>(() => allContacts.find((c) => c.id === id));
  useEffect(() => {
    api<ApiContact>(`/contacts/${id}`).then(
      (c) => setContact(upsertContact(toContact(c))),
      () => setContact(null),
    );
  }, [id]);

  const update = (next: Contact) => {
    const before = contact;
    setContact(next);
    api<ApiContact>(`/contacts/${id}`, { method: "PATCH", body: contactPatch(next) }).then(
      (c) => setContact(upsertContact(toContact(c))),
      (e) => {
        setContact(before);
        toast({ title: "Couldn't update contact", description: errorMessage(e), tone: "warning" });
      },
    );
  };

  return (
    <Page>
      <Link href="/contacts" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg">
        <ArrowLeft className="size-4" /> Contacts
      </Link>
      <Card className="mx-auto max-w-3xl overflow-hidden">
        {contact === undefined && (
          <div className="flex items-center justify-center p-10 text-sm text-muted">
            <Loader2 className="mr-2 size-4 animate-spin" /> Loading contact…
          </div>
        )}
        {contact === null && <div className="p-10 text-center text-sm text-muted">This contact doesn&apos;t exist or was deleted.</div>}
        {contact && <ContactProfile key={contact.id} contact={contact} onUpdate={update} />}
      </Card>
    </Page>
  );
}
