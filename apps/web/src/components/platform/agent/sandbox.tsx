"use client";

import {
  BookOpen,
  Brain,
  CircleCheck,
  CircleX,
  Clock,
  Coins,
  Loader2,
  Play,
  RotateCcw,
  SendHorizontal,
  ShieldCheck,
  TriangleAlert,
  UserRound,
  Wrench,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Avatar, Badge, Button, Card, CardHeader, Progress, Segmented, useToast } from "@/components/ui";
import { ToolChip } from "@/components/platform/shared";
import { cn } from "@/lib/cn";
import { sandboxFallback, sandboxScripts, scenarioTests, type SandboxScript, type SandboxStep } from "@/lib/mock/platform";

interface ChatMsg {
  id: number;
  role: "user" | "ai";
  text: string;
  shown: number;
  script?: SandboxScript;
  done?: boolean;
}

const suggestions = [
  "Saturday ko whitening ka slot milega?",
  "How much does teeth whitening cost?",
  "I want a refund, my root canal still hurts",
  "Which painkiller should I take for swelling?",
  "Are you open on Sunday?",
];

const stepMeta: Record<SandboxStep["kind"], { icon: typeof Brain; cls: string; label: string }> = {
  guardrail: { icon: ShieldCheck, cls: "bg-success-soft text-success", label: "Guardrail" },
  model: { icon: Brain, cls: "bg-ai-soft text-ai", label: "Model" },
  retrieval: { icon: BookOpen, cls: "bg-info-soft text-info", label: "Retrieval" },
  tool: { icon: Wrench, cls: "bg-primary-soft text-primary", label: "Tool" },
};

const testSeeds: Record<string, string> = {
  t1: "Book me for whitening on Saturday morning",
  t2: "Which painkiller should I take for swelling?",
  t3: "I want a refund, my root canal still hurts",
  t4: "How much does teeth whitening cost?",
};

type TestState = "idle" | "running" | "pass" | "fail";

export function SandboxTab() {
  const toast = useToast();
  const [version, setVersion] = useState<"draft" | "live">("draft");
  const [messages, setMessages] = useState<ChatMsg[]>([
    { id: 0, role: "ai", text: "Namaste! 👋 I'm Anvi from Smile Dental (draft v15). Ask me anything a patient would.", shown: 999, done: true },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [trace, setTrace] = useState<{ script: SandboxScript; visible: number; query: string } | null>(null);
  const [tests, setTests] = useState<Record<string, TestState>>(() => Object.fromEntries(scenarioTests.map((t) => [t.id, t.last])));
  const [runningAll, setRunningAll] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const scroller = useRef<HTMLDivElement>(null);
  const seq = useRef(1);

  useEffect(() => {
    const list = timers.current;
    return () => {
      list.forEach(clearTimeout);
    };
  }, []);

  useEffect(() => {
    const el = scroller.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages, typing]);

  const later = (fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms));
  };

  const busy = typing || messages.some((m) => m.role === "ai" && !m.done);

  const send = (text: string) => {
    const body = text.trim();
    if (!body || busy) return;
    const script = sandboxScripts.find((s) => s.match.test(body)) ?? sandboxFallback;
    const userId = seq.current++;
    setMessages((m) => [...m, { id: userId, role: "user", text: body, shown: body.length, done: true }]);
    setInput("");
    setTyping(true);
    setTrace({ script, visible: 0, query: body });
    script.steps.forEach((_, i) => later(() => setTrace((t) => (t ? { ...t, visible: i + 1 } : t)), 250 + i * 320));

    const startAt = 300 + script.steps.length * 320;
    const aiId = userId + 1;
    later(() => {
      setTyping(false);
      setMessages((m) => [...m, { id: aiId, role: "ai", text: script.reply, shown: 0, script }]);
      const total = script.reply.length;
      const chunk = 4;
      for (let i = 1; i <= Math.ceil(total / chunk); i++) {
        later(() => {
          setMessages((m) => m.map((x) => (x.id === aiId ? { ...x, shown: Math.min(total, i * chunk), done: i * chunk >= total } : x)));
        }, i * 18);
      }
    }, startAt);
  };

  const reset = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setTyping(false);
    setTrace(null);
    setMessages((m) => [m[0]]);
  };

  const runAll = () => {
    setRunningAll(true);
    setTests(Object.fromEntries(scenarioTests.map((t) => [t.id, "running" as TestState])));
    scenarioTests.forEach((t, i) => {
      later(() => setTests((s) => ({ ...s, [t.id]: t.id === "t6" && version === "live" ? "fail" : "pass" })), 600 + i * 450);
    });
    later(() => {
      setRunningAll(false);
      toast(
        version === "live"
          ? { title: "7 of 8 scenarios passed", description: "“Never discounts above 10%” failed on v14.", tone: "warning" }
          : { title: "All 8 scenarios passed on draft v15", description: "Discount cap fix resolved the failing test." },
      );
    }, 700 + scenarioTests.length * 450);
  };

  const passCount = Object.values(tests).filter((s) => s === "pass").length;
  const steps = trace ? trace.script.steps.slice(0, trace.visible) : [];
  const traceDone = trace && trace.visible >= trace.script.steps.length;
  const latency = trace ? trace.script.steps.reduce((a, s) => a + s.ms, 0) : 0;
  const cost = trace ? (trace.script.tokens.input * 0.25 + trace.script.tokens.output * 1.25) / 1000 : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
        {/* Chat */}
        <Card className="flex h-[560px] flex-col overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-3">
            <div className="flex items-center gap-2.5">
              <Avatar name="Anvi" ai size="sm" online />
              <div>
                <div className="text-sm font-semibold">Test chat</div>
                <div className="text-[11px] text-muted">Nothing is sent to customers · tools run against a sandbox calendar</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Segmented
                size="xs"
                value={version}
                onChange={(v) => {
                  setVersion(v);
                  reset();
                }}
                items={[
                  { value: "draft", label: "Draft v15" },
                  { value: "live", label: "Live v14" },
                ]}
              />
              <Button size="icon-sm" variant="ghost" aria-label="Reset conversation" onClick={reset}>
                <RotateCcw />
              </Button>
            </div>
          </div>

          <div ref={scroller} className="scroll-thin flex-1 space-y-3 overflow-y-auto bg-surface-2/40 px-4 py-4">
            {messages.map((m) =>
              m.role === "user" ? (
                <div key={m.id} className="flex justify-end">
                  <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-primary px-3.5 py-2 text-sm text-primary-fg">{m.text}</div>
                </div>
              ) : (
                <div key={m.id} className="flex items-end gap-2">
                  <Avatar name="Anvi" ai size="xs" />
                  <div className="max-w-[85%] space-y-1.5">
                    {m.script && m.script.tools.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {m.script.tools.map((t) => (
                          <ToolChip key={t.name} name={t.name} args={t.args} />
                        ))}
                      </div>
                    )}
                    <div className="rounded-2xl rounded-bl-sm bg-surface px-3.5 py-2 text-sm whitespace-pre-line shadow-card">
                      {m.text.slice(0, m.shown)}
                      {!m.done && <span className="ml-0.5 inline-block h-3.5 w-1.5 animate-pulse bg-ai align-middle" />}
                    </div>
                    {m.done && m.script && (
                      <div className="animate-fade-in flex flex-wrap items-center gap-1.5 text-[11px] text-muted">
                        {m.script.sources.map((s) => (
                          <span key={s} className="inline-flex items-center gap-1 rounded border border-line bg-surface px-1.5 py-0.5">
                            <BookOpen className="size-3" /> {s}
                          </span>
                        ))}
                        <span>· confidence {m.script.confidence.toFixed(2)}</span>
                        {m.script.escalate && (
                          <Badge tone="danger">
                            <UserRound /> Handed off to Neha
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ),
            )}
            {typing && (
              <div className="flex items-end gap-2">
                <Avatar name="Anvi" ai size="xs" />
                <div className="flex gap-1 rounded-2xl rounded-bl-sm bg-surface px-3.5 py-3 shadow-card" aria-label="Anvi is typing">
                  <span className="typing-dot size-1.5 rounded-full bg-muted" />
                  <span className="typing-dot size-1.5 rounded-full bg-muted" />
                  <span className="typing-dot size-1.5 rounded-full bg-muted" />
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-line p-3">
            <div className="scroll-thin mb-2 flex gap-1.5 overflow-x-auto pb-1">
              {suggestions.map((s) => (
                <button
                  key={s}
                  disabled={busy}
                  onClick={() => send(s)}
                  className="shrink-0 rounded-full border border-line bg-surface px-2.5 py-1 text-xs text-fg-2 hover:border-primary hover:text-primary disabled:opacity-50"
                >
                  {s}
                </button>
              ))}
            </div>
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type as a patient would (English, Hindi or Hinglish)…"
                aria-label="Test message"
                className="h-9 min-w-0 flex-1 rounded-lg border border-line bg-surface px-3 text-sm text-fg placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              />
              <Button type="submit" size="icon" aria-label="Send" disabled={busy || !input.trim()}>
                <SendHorizontal />
              </Button>
            </form>
          </div>
        </Card>

        {/* Trace */}
        <Card className="flex h-[560px] flex-col overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <div>
              <div className="text-sm font-semibold">Trace</div>
              <div className="text-[11px] text-muted">{trace ? `“${trace.query}”` : "Send a message to see how Anvi thinks"}</div>
            </div>
            {trace && (traceDone ? <Badge tone="success"><CircleCheck /> Done</Badge> : <Badge tone="info"><Loader2 className="animate-spin" /> Running</Badge>)}
          </div>
          <div className="scroll-thin flex-1 overflow-y-auto px-4 py-3">
            {!trace && (
              <div className="flex h-full flex-col items-center justify-center text-center text-sm text-muted">
                <Brain className="mb-2 size-8 text-line-strong" />
                Retrieval results, tool calls, guardrail checks, tokens, cost and latency appear here step by step.
              </div>
            )}
            <ol className="relative space-y-3">
              {steps.map((s, i) => {
                const M = stepMeta[s.kind];
                return (
                  <li key={i} className="animate-fade-in flex gap-3">
                    <span className={cn("mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-lg [&_svg]:size-3.5", s.status === "warn" ? "bg-warning-soft text-warning" : M.cls)}>
                      {s.status === "warn" ? <TriangleAlert /> : <M.icon />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className={cn("text-sm font-medium", s.kind === "tool" && "font-mono text-xs")}>{s.label}</span>
                        <span className="text-[11px] text-muted tabular">{s.ms} ms</span>
                      </div>
                      <div className="text-xs text-muted">{s.detail}</div>
                    </div>
                  </li>
                );
              })}
              {trace && !traceDone && (
                <li className="flex items-center gap-2 pl-1 text-xs text-muted">
                  <Loader2 className="size-3.5 animate-spin" /> working…
                </li>
              )}
            </ol>
          </div>
          {trace && traceDone && (
            <div className="animate-fade-in grid grid-cols-3 gap-2 border-t border-line p-3 text-center">
              <div>
                <div className="flex items-center justify-center gap-1 text-[11px] text-muted"><Coins className="size-3" /> Tokens</div>
                <div className="text-sm font-semibold tabular">{(trace.script.tokens.input + trace.script.tokens.output).toLocaleString("en-IN")}</div>
                <div className="text-[10px] text-muted">{trace.script.tokens.input.toLocaleString("en-IN")} in · {trace.script.tokens.output} out</div>
              </div>
              <div>
                <div className="text-[11px] text-muted">Cost</div>
                <div className="text-sm font-semibold tabular">₹{cost.toFixed(2)}</div>
                <div className="text-[10px] text-muted">92% cached</div>
              </div>
              <div>
                <div className="flex items-center justify-center gap-1 text-[11px] text-muted"><Clock className="size-3" /> Latency</div>
                <div className="text-sm font-semibold tabular">{(latency / 1000).toFixed(2)}s</div>
                <div className="text-[10px] text-muted">+ 3s debounce live</div>
              </div>
              <div className="col-span-3 mt-1 text-left">
                <div className="mb-1 flex justify-between text-[11px] text-muted">
                  <span>Answer confidence</span>
                  <span className="font-medium text-fg tabular">{trace.script.confidence.toFixed(2)} (threshold 0.60)</span>
                </div>
                <Progress value={trace.script.confidence * 100} tone={trace.script.confidence >= 0.6 ? "success" : "danger"} />
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Scenario tests */}
      <Card>
        <CardHeader
          title="Scenario test suite"
          description={`Scripted multi-turn conversations with an AI judge + deterministic asserts · ${passCount}/${scenarioTests.length} passing on ${version === "draft" ? "draft v15" : "live v14"}`}
          action={
            <Button size="sm" onClick={runAll} disabled={runningAll}>
              {runningAll ? <Loader2 className="animate-spin" /> : <Play />} {runningAll ? "Running…" : "Run all"}
            </Button>
          }
        />
        <div className="overflow-x-auto border-t border-line">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="text-left text-xs text-muted">
                <th className="px-5 py-2 font-medium">Scenario</th>
                <th className="px-3 py-2 font-medium">Asserts</th>
                <th className="px-3 py-2 font-medium">Turns</th>
                <th className="px-3 py-2 font-medium">Result</th>
                <th className="px-5 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {scenarioTests.map((t) => {
                const s = tests[t.id];
                return (
                  <tr key={t.id}>
                    <td className="px-5 py-2.5 font-medium">{t.name}</td>
                    <td className="px-3 py-2.5 text-xs text-muted">{t.asserts}</td>
                    <td className="px-3 py-2.5 text-muted tabular">{t.turns}</td>
                    <td className="px-3 py-2.5">
                      {s === "running" && (
                        <Badge tone="info">
                          <Loader2 className="animate-spin" /> Running
                        </Badge>
                      )}
                      {s === "pass" && (
                        <Badge tone="success">
                          <CircleCheck /> Pass
                        </Badge>
                      )}
                      {s === "fail" && (
                        <Badge tone="danger">
                          <CircleX /> Fail
                        </Badge>
                      )}
                      {s === "idle" && <Badge>Not run</Badge>}
                    </td>
                    <td className="px-5 py-2.5 text-right">
                      {testSeeds[t.id] ? (
                        <Button size="xs" variant="ghost" disabled={busy} onClick={() => send(testSeeds[t.id])}>
                          <Play /> Replay in chat
                        </Button>
                      ) : (
                        <Button size="xs" variant="ghost" onClick={() => toast({ title: `Transcript: ${t.name}`, description: `${t.turns} turns · judge score 4.${t.id === "t6" ? "1" : "7"}/5`, tone: "info" })}>
                          View transcript
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
