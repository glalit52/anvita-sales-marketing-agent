"use client";

import { Bell, Building, CreditCard, Loader2, MessagesSquare, ShieldCheck, Users } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { BillingSettings } from "@/components/platform/settings/billing";
import { ChannelsSettings } from "@/components/platform/settings/channels";
import { ComplianceSettings } from "@/components/platform/settings/compliance";
import { GeneralSettings } from "@/components/platform/settings/general";
import { NotificationSettings } from "@/components/platform/settings/notifications";
import { TeamSettings } from "@/components/platform/settings/team";
import { Page, PageHeader, Tabs } from "@/components/ui";
import { team } from "@/lib/mock/core";

const tabs = ["general", "team", "channels", "billing", "compliance", "notifications"] as const;
type Tab = (typeof tabs)[number];

function SettingsInner() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const fromUrl = params.get("tab") as Tab | null;
  const [tab, setTabState] = useState<Tab>(fromUrl && tabs.includes(fromUrl) ? fromUrl : "general");

  const setTab = (t: Tab) => {
    setTabState(t);
    router.replace(t === "general" ? pathname : `${pathname}?tab=${t}`, { scroll: false });
  };

  return (
    <Page>
      <PageHeader title="Settings" description="Smile Dental workspace · Growth plan · 2 locations" />
      <Tabs
        className="mb-5"
        value={tab}
        onChange={setTab}
        items={[
          { value: "general", label: "General", icon: <Building /> },
          { value: "team", label: "Team", icon: <Users />, count: team.length },
          { value: "channels", label: "Channels", icon: <MessagesSquare /> },
          { value: "billing", label: "Billing", icon: <CreditCard /> },
          { value: "compliance", label: "Compliance & data", icon: <ShieldCheck /> },
          { value: "notifications", label: "Notifications", icon: <Bell /> },
        ]}
      />
      <div key={tab}>
        {tab === "general" && <GeneralSettings />}
        {tab === "team" && <TeamSettings />}
        {tab === "channels" && <ChannelsSettings />}
        {tab === "billing" && <BillingSettings />}
        {tab === "compliance" && <ComplianceSettings />}
        {tab === "notifications" && <NotificationSettings />}
      </div>
    </Page>
  );
}

export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <Page>
          <div className="flex items-center gap-2 text-sm text-muted">
            <Loader2 className="size-4 animate-spin" /> Loading settings…
          </div>
        </Page>
      }
    >
      <SettingsInner />
    </Suspense>
  );
}
