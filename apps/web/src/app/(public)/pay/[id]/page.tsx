import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PayView, PayViewWithState } from "@/components/public/pay-view";
import { PublicSkeleton } from "@/components/public/shared";
import { business, payLinkById, payLinks } from "@/lib/mock/public";

export const metadata: Metadata = {
  title: { absolute: `Pay ${business.name} securely` },
  description: `Secure payment link from ${business.name}.`,
};

export function generateStaticParams() {
  return payLinks.map((p) => ({ id: p.id }));
}

async function PayLoader({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!payLinkById(id)) notFound();
  // ?state=failed|success|processing is read on the client (demo control)
  return (
    <Suspense fallback={<PayView id={id} />}>
      <PayViewWithState id={id} />
    </Suspense>
  );
}

export default function PayPage({ params }: PageProps<"/pay/[id]">) {
  return (
    <Suspense fallback={<PublicSkeleton />}>
      <PayLoader params={params} />
    </Suspense>
  );
}
