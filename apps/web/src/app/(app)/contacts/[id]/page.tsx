import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ContactProfile } from "@/components/app/contact-profile";
import { LiveContactPage } from "@/components/app/live-contact-page";
import { ProfileSkeleton } from "@/components/app/skeletons";
import { LIVE } from "@/lib/live/config";
import { contactIds, profileContactById } from "@/lib/mock/app";

export function generateStaticParams() {
  return contactIds.map((id) => ({ id }));
}

export async function generateMetadata({ params }: PageProps<"/contacts/[id]">): Promise<Metadata> {
  // Live contacts load in the browser, so there is nothing to look up while prerendering.
  if (LIVE) return { title: "Contact" };
  const { id } = await params;
  return { title: profileContactById(id)?.name ?? "Contact" };
}

async function ContactLoader({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // Live workspaces load the contact in the browser (ids aren't known at build time).
  if (LIVE) return <LiveContactPage id={id} />;
  if (!profileContactById(id)) notFound();
  return <ContactProfile id={id} />;
}

export default function ContactPage({ params }: PageProps<"/contacts/[id]">) {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <ContactLoader params={params} />
    </Suspense>
  );
}
