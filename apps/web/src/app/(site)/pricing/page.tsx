import type { Metadata } from "next";
import { PricingPage } from "@/components/site/pricing";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Simple ₹ pricing: a flat platform plan plus usage credits for AI conversations, prospecting, voice and WhatsApp pass-through.",
};

export default function Pricing() {
  return <PricingPage />;
}
