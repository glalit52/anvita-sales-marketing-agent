"use client";

import { Send, Star } from "lucide-react";
import { useState } from "react";
import { ReviewsMonitor } from "@/components/growth/reviews/monitor";
import { ReviewRequests } from "@/components/growth/reviews/requests";
import { Button, Page, PageHeader, Tabs, useToast } from "@/components/ui";

type Tab = "monitor" | "requests";

export default function ReviewsPage() {
  const [tab, setTab] = useState<Tab>("monitor");
  const toast = useToast();
  return (
    <Page>
      <PageHeader
        title="Reviews"
        description="Every review across Google, Practo, Facebook and Justdial in one feed, with AI-drafted replies and automatic requests after each visit."
        actions={
          <>
            <Button variant="outline" onClick={() => toast({ title: "Syncing reviews", description: "Google, Practo, Facebook and Justdial", tone: "info" })}>
              Sync now
            </Button>
            <Button onClick={() => setTab("requests")}>
              <Send /> Request reviews
            </Button>
          </>
        }
      />
      <Tabs
        className="mb-5"
        value={tab}
        onChange={setTab}
        items={[
          { value: "monitor", label: "Monitor & reply", icon: <Star /> },
          { value: "requests", label: "Review requests", icon: <Send /> },
        ]}
      />
      {tab === "monitor" ? <ReviewsMonitor /> : <ReviewRequests />}
    </Page>
  );
}
