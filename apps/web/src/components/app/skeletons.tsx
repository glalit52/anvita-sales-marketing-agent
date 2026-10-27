import { cn } from "@/lib/cn";

/** Pulsing placeholder block (token colors so it works in dark mode). */
export function Sk({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-surface-3", className)} aria-hidden />;
}

function SkCard({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("rounded-xl border border-line bg-surface p-5 shadow-card", className)}>{children}</div>;
}

/** Generic app page skeleton: header, 4 stat tiles, chart card + side card, 3 list cards. */
export function PageSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8" role="status" aria-label="Loading">
      <span className="sr-only">Loading…</span>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <Sk className="h-7 w-56 sm:w-72" />
          <Sk className="h-4 w-72 max-w-[80vw] sm:w-[28rem]" />
        </div>
        <div className="flex gap-2">
          <Sk className="h-9 w-40 rounded-lg" />
          <Sk className="h-9 w-32 rounded-lg" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <SkCard key={i} className="p-4">
            <div className="flex items-center justify-between">
              <Sk className="h-3 w-24" />
              <Sk className="size-4 rounded" />
            </div>
            <Sk className="mt-3 h-7 w-20" />
            <Sk className="mt-2 h-3 w-28" />
          </SkCard>
        ))}
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <SkCard className="xl:col-span-2">
          <Sk className="h-4 w-40" />
          <Sk className="mt-2 h-3 w-64 max-w-full" />
          <div className="mt-6 flex h-[220px] items-end gap-2">
            {[40, 55, 48, 62, 58, 70, 66, 78, 72, 85, 80, 92].map((h, i) => (
              <div key={i} className="flex h-full flex-1 items-end">
                <div className="w-full" style={{ height: `${h}%` }}>
                  <Sk className="h-full w-full rounded-t-md rounded-b-none" />
                </div>
              </div>
            ))}
          </div>
        </SkCard>
        <SkCard>
          <Sk className="h-4 w-32" />
          <Sk className="mt-2 h-3 w-44" />
          <div className="mt-6 space-y-4">
            {[100, 80, 62, 48, 36].map((w) => (
              <div key={w} className="space-y-1.5">
                <Sk className="h-3 w-28" />
                <div style={{ width: `${w}%` }}>
                  <Sk className="h-2.5" />
                </div>
              </div>
            ))}
          </div>
        </SkCard>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <SkCard key={i} className={cn(i === 2 && "lg:col-span-2 xl:col-span-1")}>
            <Sk className="h-4 w-28" />
            <Sk className="mt-2 h-3 w-48" />
            <div className="mt-5 space-y-4">
              {Array.from({ length: 4 }, (_, j) => (
                <div key={j} className="flex items-center gap-3">
                  <Sk className="size-8 shrink-0 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <Sk className="h-3 w-3/5" />
                    <Sk className="h-3 w-4/5" />
                  </div>
                </div>
              ))}
            </div>
          </SkCard>
        ))}
      </div>
    </div>
  );
}

/** Contact profile skeleton: header card + side column + tabbed timeline. */
export function ProfileSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8" role="status" aria-label="Loading contact">
      <span className="sr-only">Loading contact…</span>
      <Sk className="mb-4 h-5 w-24" />
      <SkCard className="mb-4">
        <div className="flex items-start gap-4">
          <Sk className="size-14 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <Sk className="h-7 w-52" />
            <Sk className="h-4 w-72 max-w-full" />
            <Sk className="h-4 w-96 max-w-full" />
          </div>
        </div>
      </SkCard>
      <div className="grid gap-4 lg:grid-cols-[340px_minmax(0,1fr)]">
        <div className="space-y-4">
          {[5, 3, 2].map((n, i) => (
            <SkCard key={i}>
              <Sk className="h-4 w-24" />
              <div className="mt-4 space-y-3">
                {Array.from({ length: n }, (_, j) => (
                  <div key={j} className="flex justify-between gap-3">
                    <Sk className="h-3 w-20" />
                    <Sk className="h-3 w-28" />
                  </div>
                ))}
              </div>
            </SkCard>
          ))}
        </div>
        <SkCard>
          <div className="flex gap-4 border-b border-line pb-3">
            {["w-16", "w-24", "w-12", "w-20", "w-12"].map((w, i) => (
              <Sk key={i} className={cn("h-4", w)} />
            ))}
          </div>
          <div className="mt-5 space-y-5">
            {Array.from({ length: 6 }, (_, j) => (
              <div key={j} className="flex gap-3">
                <Sk className="size-7 shrink-0 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Sk className="h-3.5 w-2/3" />
                  <Sk className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </SkCard>
      </div>
    </div>
  );
}
