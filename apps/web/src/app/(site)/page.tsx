import type { Metadata } from "next";
import { HomePage } from "@/components/site/home-sections";

export const metadata: Metadata = {
  title: { absolute: "Anvita: your AI sales & marketing team" },
  description:
    "Anvita finds customers, answers every enquiry on WhatsApp in Hindi and English 24/7, books appointments and collects payments. One tool instead of four.",
};

export default function Home() {
  return <HomePage />;
}
