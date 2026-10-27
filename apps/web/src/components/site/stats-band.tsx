"use client";

import { useEffect, useRef, useState } from "react";
import { formatNumber } from "@/lib/format";
import { stats } from "@/lib/mock/site";
import { Container } from "./primitives";

function useInView<T extends Element>() {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return { ref, seen };
}

function CountUp({ to, run }: { to: number; run: boolean }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!run) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / 1400);
      setV(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [run, to]);
  return <>{v}</>;
}

export function StatsBand() {
  const { ref, seen } = useInView<HTMLDivElement>();
  const [handled, setHandled] = useState(18_412);

  useEffect(() => {
    const t = setInterval(() => setHandled((h) => h + 1 + Math.floor(Math.random() * 3)), 2200);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="relative overflow-hidden border-y border-line bg-surface py-16 sm:py-20">
      <div aria-hidden className="site-grid-bg pointer-events-none absolute inset-0 opacity-60" />
      <Container className="relative">
        <div className="flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-fg-2 shadow-card">
            <span className="relative flex size-2">
              <span className="site-ping absolute inset-0 rounded-full bg-success" />
              <span className="relative size-2 rounded-full bg-success" />
            </span>
            Live: <span className="tabular font-semibold text-fg">{formatNumber(handled)}</span> conversations handled by Anvita today
          </div>
        </div>
        <div ref={ref} className="mt-10 grid gap-4 sm:grid-cols-3">
          {stats.map((s) => (
            <div key={s.id} className="rounded-2xl border border-line bg-surface p-6 text-center shadow-card">
              <div className="tabular bg-gradient-to-br from-primary to-ai bg-clip-text text-5xl font-semibold tracking-tight text-transparent sm:text-6xl">
                {s.prefix}
                <CountUp to={s.value} run={seen} />
                {s.suffix}
              </div>
              <div className="mt-2 font-medium">{s.label}</div>
              <div className="mt-1 text-sm text-muted">{s.detail}</div>
            </div>
          ))}
        </div>
        <p className="mt-6 text-center text-xs text-muted">Median across pilot workspaces, Jul–Oct 2026. Illustrative; your results depend on volume and setup.</p>
      </Container>
    </section>
  );
}
