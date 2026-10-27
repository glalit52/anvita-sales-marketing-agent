"use client";

import { Bot, Funnel, LayoutDashboard, Send, Users } from "lucide-react";
import { useState } from "react";
import { AnalyticsAi } from "@/components/growth/analytics/ai-performance";
import { AnalyticsAttribution } from "@/components/growth/analytics/attribution";
import { AnalyticsOutbound, AnalyticsTeam } from "@/components/growth/analytics/outbound-team";
import { AnalyticsOverview } from "@/components/growth/analytics/overview";
import { GrowthReportButton } from "@/components/growth/growth-report";
import { Page, PageHeader, Tabs } from "@/components/ui";

type Tab = "overview" | "funnel" | "ai" | "outbound" | "team";

export default function AnalyticsPage() {
  const [tab, setTab] = useState<Tab>("overview");
  return (
    <Page>
      <PageHeader
        title="Analytics"
        description="Closed-loop reporting from first click to paid invoice, plus how your AI agent and team are performing."
        actions={<GrowthReportButton />}
      />
      <Tabs
        className="mb-5"
        value={tab}
        onChange={setTab}
        items={[
          { value: "overview", label: "Overview", icon: <LayoutDashboard /> },
          { value: "funnel", label: "Funnel & attribution", icon: <Funnel /> },
          { value: "ai", label: "AI performance", icon: <Bot /> },
          { value: "outbound", label: "Outbound", icon: <Send /> },
          { value: "team", label: "Team", icon: <Users /> },
        ]}
      />
      {tab === "overview" && <AnalyticsOverview />}
      {tab === "funnel" && <AnalyticsAttribution />}
      {tab === "ai" && <AnalyticsAi />}
      {tab === "outbound" && <AnalyticsOutbound />}
      {tab === "team" && <AnalyticsTeam />}
    </Page>
  );
}
