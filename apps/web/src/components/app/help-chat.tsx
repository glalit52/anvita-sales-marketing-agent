"use client";

import { ArrowRight, Send, Sparkles, ThumbsDown, ThumbsUp } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Avatar, Button, Card, Input, useToast } from "@/components/ui";
import { useStream } from "@/components/growth/shared";
import { cn } from "@/lib/cn";
import { defaultAiAnswer, faqAnswers } from "@/lib/mock/app";

interface ChatMsg {
  id: number;
  role: "user" | "ai";
  text: string;
  links?: { label: string; href: string }[];
  rated?: "up" | "down";
}

const suggestions = ["How do I connect WhatsApp?", "When does the AI hand off to a human?", "How do pay links work?"];

/** "Ask Anvita AI": scripted answers streamed word by word. */
export function HelpChat({ seed }: { seed?: { text: string; n: number } }) {
  const toast = useToast();
  const [msgs, setMsgs] = useState<ChatMsg[]>([
    { id: 0, role: "ai", text: "Hi Priya 👋 I'm Anvita AI. Ask me anything about setting up channels, the AI agent, payments or campaigns. I answer from the help center and your workspace settings." },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [streamText, streaming, start] = useStream(30);
  const [pending, setPending] = useState<{ links: ChatMsg["links"] } | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const lastSeed = useRef(0);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [msgs, streamText, thinking]);

  const ask = (q: string) => {
    const question = q.trim();
    if (!question || thinking || streaming) return;
    setMsgs((m) => [...m, { id: m.length, role: "user", text: question }]);
    setInput("");
    setThinking(true);
    const hit = faqAnswers.find((f) => f.match.test(question)) ?? defaultAiAnswer;
    setTimeout(() => {
      setThinking(false);
      setPending({ links: hit.links });
      start(hit.answer, (full) => {
        setMsgs((m) => [...m, { id: m.length, role: "ai", text: full, links: hit.links }]);
        setPending(null);
      });
    }, 700);
  };

  useEffect(() => {
    if (seed && seed.n !== lastSeed.current) {
      lastSeed.current = seed.n;
      const t = setTimeout(() => ask(seed.text), 0);
      return () => clearTimeout(t);
    }
  });

  return (
    <Card className="flex h-[520px] flex-col overflow-hidden">
      <div className="flex items-center gap-3 border-b border-line px-5 py-3.5">
        <Avatar name="Anvita AI" ai size="sm" />
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold">Ask Anvita AI</div>
          <div className="text-xs text-muted">Answers from 140+ help articles · usually instant</div>
        </div>
        <span className="inline-flex items-center gap-1.5 text-xs text-success">
          <span className="size-2 rounded-full bg-success" /> Online
        </span>
      </div>
      <div ref={listRef} className="scroll-thin flex-1 space-y-3 overflow-y-auto px-4 py-4" aria-live="polite">
        {msgs.map((m) => (
          <div key={m.id} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
            <div className={cn("max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm", m.role === "user" ? "rounded-br-md bg-primary text-primary-fg" : "rounded-bl-md bg-surface-2 text-fg")}>
              <p className="whitespace-pre-line">{m.text}</p>
              {m.links && (
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {m.links.map((l) => (
                    <Link key={l.href} href={l.href} className="inline-flex items-center gap-1 rounded-md border border-line bg-surface px-2 py-1 text-xs font-medium text-primary hover:bg-surface-3">
                      {l.label} <ArrowRight className="size-3" />
                    </Link>
                  ))}
                </div>
              )}
              {m.role === "ai" && m.id > 0 && (
                <div className="mt-2 flex items-center gap-1 text-xs text-muted">
                  Helpful?
                  {(["up", "down"] as const).map((r) => {
                    const Icon = r === "up" ? ThumbsUp : ThumbsDown;
                    return (
                      <button
                        key={r}
                        aria-label={r === "up" ? "Helpful" : "Not helpful"}
                        aria-pressed={m.rated === r}
                        onClick={() => {
                          setMsgs((list) => list.map((x) => (x.id === m.id ? { ...x, rated: r } : x)));
                          toast({ title: r === "up" ? "Thanks for the feedback" : "Sorry about that", description: r === "up" ? "Glad it helped." : "A support specialist will follow up on WhatsApp.", tone: "info" });
                        }}
                        className={cn("rounded p-1 hover:bg-surface-3 hover:text-fg", m.rated === r && "text-primary")}
                      >
                        <Icon className="size-3.5" />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ))}
        {thinking && (
          <div className="flex justify-start">
            <div className="flex items-center gap-1 rounded-2xl rounded-bl-md bg-surface-2 px-4 py-3" aria-label="Anvita AI is typing">
              <span className="typing-dot size-1.5 rounded-full bg-muted" />
              <span className="typing-dot size-1.5 rounded-full bg-muted" />
              <span className="typing-dot size-1.5 rounded-full bg-muted" />
            </div>
          </div>
        )}
        {streaming && pending && (
          <div className="flex justify-start">
            <div className="max-w-[88%] rounded-2xl rounded-bl-md bg-surface-2 px-3.5 py-2.5 text-sm">
              <p className="whitespace-pre-line">
                {streamText}
                <span className="ml-0.5 inline-block h-3.5 w-1.5 animate-pulse rounded-sm bg-ai align-middle" />
              </p>
            </div>
          </div>
        )}
      </div>
      <div className="border-t border-line p-3">
        {msgs.length === 1 && (
          <div className="mb-2 flex flex-wrap gap-1.5">
            {suggestions.map((s) => (
              <button key={s} onClick={() => ask(s)} className="inline-flex items-center gap-1 rounded-full border border-line px-2.5 py-1 text-xs text-fg-2 hover:border-line-strong hover:text-fg">
                <Sparkles className="size-3 text-ai" /> {s}
              </button>
            ))}
          </div>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            ask(input);
          }}
          className="flex gap-2"
        >
          <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask a question in English or Hindi…" aria-label="Ask Anvita AI" className="flex-1" />
          <Button type="submit" size="icon" aria-label="Send question" disabled={!input.trim() || thinking || streaming}>
            <Send />
          </Button>
        </form>
      </div>
    </Card>
  );
}
