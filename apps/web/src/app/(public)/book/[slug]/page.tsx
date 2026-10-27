import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BookingFlow } from "@/components/public/booking-flow";
import { PublicSkeleton } from "@/components/public/shared";
import { business, businessBySlug } from "@/lib/mock/public";

export const metadata: Metadata = {
  title: { absolute: `Book an appointment · ${business.name}` },
  description: `Book a visit at ${business.name}, Koregaon Park or Baner, Pune.`,
};

export function generateStaticParams() {
  return [{ slug: business.slug }];
}

async function BookingLoader({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!businessBySlug(slug)) notFound();
  return <BookingFlow />;
}

export default function BookPage({ params }: PageProps<"/book/[slug]">) {
  return (
    <Suspense fallback={<PublicSkeleton />}>
      <BookingLoader params={params} />
    </Suspense>
  );
}
