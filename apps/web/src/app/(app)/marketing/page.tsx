"use client";

import { Bot, CircleCheck, FileText, LayoutTemplate, Megaphone, Rocket, Share2, Sparkles } from "lucide-react";
import { AdsCopilot } from "@/components/growth/marketing/ads-copilot";
import { Aeo } from "@/components/growth/marketing/aeo";
import { Approvals } from "@/components/growth/marketing/approvals";
import { Campaigns } from "@/components/growth/marketing/campaigns";
import { DemandGenProvider, useDemandGen } from "@/components/growth/marketing/demand-gen-shared";
import { LandingPages } from "@/components/growth/marketing/landing-pages";
import { SeoContent } from "@/components/growth/marketing/seo-content";
import { Social } from "@/components/growth/marketing/social";
import { GrowthReportButton } from "@/components/growth/growth-report";
import { Badge, Page, PageHeader, Tabs } from "@/components/ui";

export default function MarketingPage() {
  return (
    <DemandGenProvider>
      <Marketing />
    </DemandGenProvider>
  );
}

function Marketing() {
  const { tab, setTab, pendingCount } = useDemandGen();
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
        description="Your AI marketing team plans campaigns from one shared brand memory, writes every ad, email and page, and learns across channels. You approve everything before it goes live."
        actions={<GrowthReportButton />}
      />
      <Tabs
        className="mb-5"
        value={tab}
        onChange={setTab}
        items={[
          { value: "campaigns", label: "Campaigns", icon: <Rocket /> },
          { value: "approvals", label: "Approvals", icon: <CircleCheck />, count: pendingCount },
          { value: "landing", label: "Landing pages", icon: <LayoutTemplate /> },
          { value: "aeo", label: "AI search (AEO)", icon: <Bot /> },
          { value: "ads", label: "Ads co-pilot", icon: <Megaphone />, count: 5 },
          { value: "seo", label: "SEO & content", icon: <FileText /> },
          { value: "social", label: "Social", icon: <Share2 /> },
        ]}
      />
      {tab === "campaigns" && <Campaigns />}
      {tab === "approvals" && <Approvals />}
      {tab === "landing" && <LandingPages />}
      {tab === "aeo" && <Aeo />}
      {tab === "ads" && <AdsCopilot />}
      {tab === "seo" && <SeoContent />}
      {tab === "social" && <Social />}
    </Page>
  );
}
