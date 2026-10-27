import type { Metadata } from "next";
import { SiteDemo } from "@/components/public/site-demo";

export const metadata: Metadata = {
  title: { absolute: "Smile Dental · Gentle, modern dentistry in Pune" },
  description: "Demo website for Smile Dental with the Anvita webchat widget installed.",
};

export default function SiteDemoPage() {
  return <SiteDemo />;
}
