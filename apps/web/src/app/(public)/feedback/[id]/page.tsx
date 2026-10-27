import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { FeedbackFlow } from "@/components/public/feedback-flow";
import { PublicSkeleton } from "@/components/public/shared";
import { business, feedbackById, feedbackRequests } from "@/lib/mock/public";

export const metadata: Metadata = {
  title: { absolute: `How was your visit? · ${business.name}` },
  description: `Share feedback about your visit to ${business.name}.`,
};

export function generateStaticParams() {
  return feedbackRequests.map((f) => ({ id: f.id }));
}

async function FeedbackLoader({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!feedbackById(id)) notFound();
  return <FeedbackFlow id={id} />;
}

export default function FeedbackPage({ params }: PageProps<"/feedback/[id]">) {
  return (
    <Suspense fallback={<PublicSkeleton />}>
      <FeedbackLoader params={params} />
    </Suspense>
  );
}
