"use client";

import { BookOpen, FlaskConical, GitBranch, LayoutGrid, Rocket, ShieldAlert, Workflow } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { AgentHeader } from "@/components/platform/agent/header";
import { EscalationTab } from "@/components/platform/agent/escalation";
import { KnowledgeTab } from "@/components/platform/agent/knowledge";
import { OverviewTab } from "@/components/platform/agent/overview";
import { PlaybooksTab } from "@/components/platform/agent/playbooks";
import { SandboxTab } from "@/components/platform/agent/sandbox";
import { VersionsTab } from "@/components/platform/agent/versions";
import { Page, Tabs } from "@/components/ui";
import { escalationRules, knowledgeSources, playbooks } from "@/lib/mock/platform";

const tabs = ["overview", "knowledge", "playbooks", "escalation", "sandbox", "versions"] as const;
type Tab = (typeof tabs)[number];

function AgentStudio() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const fromUrl = params.get("tab") as Tab | null;
  const [tab, setTabState] = useState<Tab>(fromUrl && tabs.includes(fromUrl) ? fromUrl : "overview");
  const [drafts, setDrafts] = useState(3);

  const setTab = (t: Tab) => {
    setTabState(t);
    router.replace(t === "overview" ? pathname : `${pathname}?tab=${t}`, { scroll: false });
  };
  const markDirty = () => setDrafts((d) => d + 1);

  return (
    <Page>
      <AgentHeader drafts={drafts} onPublished={() => setDrafts(0)} onOpenSandbox={() => setTab("sandbox")} />

      <Tabs
        className="mb-5"
        value={tab}
        onChange={setTab}
        items={[
          { value: "overview", label: "Overview", icon: <LayoutGrid /> },
          { value: "knowledge", label: "Knowledge", icon: <BookOpen />, count: knowledgeSources.length },
          { value: "playbooks", label: "Playbooks", icon: <Workflow />, count: playbooks.length },
          { value: "escalation", label: "Escalation rules", icon: <ShieldAlert />, count: escalationRules.length },
          { value: "sandbox", label: "Sandbox", icon: <FlaskConical /> },
          { value: "versions", label: "Versions & QA", icon: <GitBranch /> },
        ]}
      />

      <div key={tab}>
        {tab === "overview" && <OverviewTab onChange={markDirty} />}
        {tab === "knowledge" && <KnowledgeTab onChange={markDirty} />}
        {tab === "playbooks" && <PlaybooksTab onChange={markDirty} />}
        {tab === "escalation" && <EscalationTab onChange={markDirty} />}
        {tab === "sandbox" && <SandboxTab />}
        {tab === "versions" && <VersionsTab />}
      </div>
    </Page>
  );
}

export default function AgentPage() {
  return (
    <Suspense
      fallback={
        <Page>
          <div className="flex items-center gap-2 text-sm text-muted">
            <Rocket className="size-4 animate-pulse" /> Loading Agent Studio…
          </div>
        </Page>
      }
    >
      <AgentStudio />
    </Suspense>
  );
}
