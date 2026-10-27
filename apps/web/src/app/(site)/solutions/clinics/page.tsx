import type { Metadata } from "next";
import { ClinicsPage } from "@/components/site/clinics";

export const metadata: Metadata = {
  title: "AI front desk for clinics",
  description: "How Smile Dental, Pune answers every patient in 38 seconds, books consults with UPI deposits and cut no-shows by 41% with Anvita.",
};

export default function Clinics() {
  return <ClinicsPage />;
}
