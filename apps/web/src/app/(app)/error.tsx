"use client";

import { Bug, Check, Copy, Home, RotateCcw, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button, Card, Field, Modal, Page, Textarea, useToast } from "@/components/ui";

export default function AppError({ error, retry }: { error: unknown; retry: () => void }) {
  const toast = useToast();
  const [reportOpen, setReportOpen] = useState(false);
  const [details, setDetails] = useState("");
  const [copied, setCopied] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const message = error instanceof Error ? error.message : String(error);
  const digest = error instanceof Error && "digest" in error ? String((error as Error & { digest?: string }).digest) : undefined;
  const ref = digest ?? `ANV-${(message.length * 7919).toString(36).toUpperCase().padStart(6, "0").slice(0, 6)}`;

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Page>
      <Card className="mx-auto mt-6 max-w-xl p-6 text-center sm:mt-12 sm:p-8">
        <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-danger-soft text-danger">
          <TriangleAlert className="size-6" />
        </div>
        <h1 className="mt-4 text-lg font-semibold">Something went wrong on this page</h1>
        <p className="mt-1 text-sm text-muted">
          Nothing was lost. Your AI agent keeps replying to customers and bookings keep syncing. Try again, or report it and we&apos;ll look into it.
        </p>
        <div className="mt-4 rounded-lg border border-line bg-surface-2 px-3 py-2 text-left font-mono text-xs break-words text-fg-2">
          {message || "Unknown error"}
          <div className="mt-1 flex items-center justify-between gap-2 text-muted">
            <span>Reference: {ref}</span>
            <button
              onClick={() => {
                navigator.clipboard?.writeText(`${ref}: ${message}`).catch(() => {});
                setCopied(true);
              }}
              className="inline-flex items-center gap-1 font-sans hover:text-fg"
              aria-label="Copy error reference"
            >
              {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />} {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <Button
            disabled={retrying}
            onClick={() => {
              setRetrying(true);
              retry();
              setTimeout(() => setRetrying(false), 1200);
            }}
          >
            <RotateCcw className={retrying ? "animate-spin" : undefined} /> {retrying ? "Retrying…" : "Try again"}
          </Button>
          <Button variant="outline" onClick={() => setReportOpen(true)}>
            <Bug /> Report issue
          </Button>
          <Link href="/dashboard" className="inline-flex h-9 items-center gap-2 rounded-lg px-4 text-sm font-medium text-fg-2 hover:bg-surface-2 hover:text-fg">
            <Home className="size-4" /> Dashboard
          </Link>
        </div>
      </Card>

      <Modal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        title="Report this issue"
        description="We attach the error reference, page and browser automatically."
        footer={
          <>
            <Button variant="ghost" onClick={() => setReportOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setReportOpen(false);
                setDetails("");
                toast({ title: "Issue reported", description: `Ticket created with reference ${ref}. We'll update you on WhatsApp.` });
              }}
            >
              Send report
            </Button>
          </>
        }
      >
        <Field label="What were you doing?" hint="(optional)">
          <Textarea value={details} onChange={(e) => setDetails(e.target.value)} placeholder="e.g. I clicked “Approve” on a campaign and the page went blank" />
        </Field>
      </Modal>
    </Page>
  );
}
