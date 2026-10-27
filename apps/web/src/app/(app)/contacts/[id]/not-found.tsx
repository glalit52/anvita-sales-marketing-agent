import { ArrowLeft, UserX } from "lucide-react";
import Link from "next/link";
import { Card, EmptyState, Page } from "@/components/ui";

export default function ContactNotFound() {
  return (
    <Page>
      <Link href="/contacts" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg">
        <ArrowLeft className="size-4" /> Contacts
      </Link>
      <Card className="mx-auto max-w-xl">
        <EmptyState
          icon={<UserX />}
          title="This contact doesn't exist"
          description="It may have been merged into another contact or deleted under a DPDP erasure request. Search your contacts by name, phone or email instead."
          action={
            <Link href="/contacts" className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-fg shadow-card hover:bg-primary-hover">
              Browse contacts
            </Link>
          }
        />
      </Card>
    </Page>
  );
}
