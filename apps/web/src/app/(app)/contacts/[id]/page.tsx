import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ContactProfile } from "@/components/app/contact-profile";
import { ProfileSkeleton } from "@/components/app/skeletons";
import { contactIds, profileContactById } from "@/lib/mock/app";

export function generateStaticParams() {
  return contactIds.map((id) => ({ id }));
}

export async function generateMetadata({ params }: PageProps<"/contacts/[id]">): Promise<Metadata> {
  const { id } = await params;
  return { title: profileContactById(id)?.name ?? "Contact" };
}

async function ContactLoader({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
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
