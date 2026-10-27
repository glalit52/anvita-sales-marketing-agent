import { Link2Off } from "lucide-react";
import { PoweredBy } from "@/components/public/shared";

/** Customer-facing 404 for expired or mistyped booking / pay / review links. */
export default function PublicNotFound() {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-4">
      <div className="rounded-2xl border border-line bg-surface p-6 text-center shadow-card">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-surface-2 text-muted">
          <Link2Off className="size-6" aria-hidden />
        </div>
        <h1 className="mt-4 text-lg font-semibold text-fg">This link has expired or is invalid</h1>
        <p className="mt-1 text-sm text-muted">
          Booking, payment and review links are personal and can expire. Please ask the business to send you a fresh link on WhatsApp.
        </p>
      </div>
      <PoweredBy />
    </div>
  );
}
