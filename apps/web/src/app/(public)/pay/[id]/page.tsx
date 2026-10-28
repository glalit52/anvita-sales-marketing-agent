import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { LivePay } from "@/components/public/live-pay";
import { PayView, PayViewWithState } from "@/components/public/pay-view";
import { LIVE } from "@/lib/live/config";
import { PublicSkeleton } from "@/components/public/shared";
import { business, payLinkById, payLinks } from "@/lib/mock/public";

export const metadata: Metadata = {
  title: { absolute: LIVE ? "Secure payment" : `Pay ${business.name} securely` },
  description: LIVE ? "Secure payment link." : `Secure payment link from ${business.name}.`,
};

export function generateStaticParams() {
  return payLinks.map((p) => ({ id: p.id }));
}

async function PayLoader({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (LIVE) return <LivePay token={id} />;
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
