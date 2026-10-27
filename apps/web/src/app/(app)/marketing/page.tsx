"use client";

import { FileText, Megaphone, Share2, Sparkles } from "lucide-react";
import { useState } from "react";
import { AdsCopilot } from "@/components/growth/marketing/ads-copilot";
import { SeoContent } from "@/components/growth/marketing/seo-content";
import { Social } from "@/components/growth/marketing/social";
import { GrowthReportButton } from "@/components/growth/growth-report";
import { Badge, Page, PageHeader, Tabs } from "@/components/ui";

type Tab = "ads" | "seo" | "social";

export default function MarketingPage() {
  const [tab, setTab] = useState<Tab>("ads");
  return (
    <Page>
      <PageHeader
        title={
          <span className="inline-flex items-center gap-2">
            Marketing
            <Badge tone="ai">
              <Sparkles aria-hidden /> AI agency
            </Badge>
          </span>
        }
        description="Your productised AI marketing team: it runs ads, writes content and posts on social, and you approve every change before it goes live."
        actions={<GrowthReportButton />}
      />
      <Tabs
        className="mb-5"
        value={tab}
        onChange={setTab}
        items={[
          { value: "ads", label: "Ads co-pilot", icon: <Megaphone />, count: 5 },
          { value: "seo", label: "SEO & content", icon: <FileText /> },
          { value: "social", label: "Social", icon: <Share2 /> },
        ]}
      />
      {tab === "ads" && <AdsCopilot />}
      {tab === "seo" && <SeoContent />}
      {tab === "social" && <Social />}
    </Page>
  );
}
