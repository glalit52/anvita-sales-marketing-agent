"use client";

import {
  AlarmClock,
  Bot,
  CalendarClock,
  CheckCircle2,
  Circle,
  Flag,
  KanbanSquare,
  List,
  ListTodo,
  Plus,
  Search,
  Sparkles,
  TriangleAlert,
  UserRound,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { AiCallout, Avatar, Badge, Button, Card, EmptyState, Input, Kbd, Page, PageHeader, Segmented, Select, StatCard, useToast } from "@/components/ui";
import { parseTask, parsedStamp } from "@/components/app/task-parse";
import { TaskDrawer, groupMeta, snoozeOptions } from "@/components/app/task-drawer";
import { AiTag, FilterChip, TaskTypeIcon } from "@/components/app/shared";
import { cn } from "@/lib/cn";
import {
  NOW_STAMP,
  TODAY,
  assigneeName,
  dayLabel,
  dueLabel,
  stamp,
  taskGroup,
  taskTypeMeta,
  tasks as seedTasks,
  timeLabel,
  type Task,
  type TaskGroup,
  type TaskType,
} from "@/lib/mock/app";
import { team } from "@/lib/mock/core";
import { sellContactById } from "@/lib/mock/sell";

const groups: TaskGroup[] = ["overdue", "today", "upcoming", "done"];
const types = Object.keys(taskTypeMeta) as TaskType[];
const examples = ["Call Rohit tomorrow 4pm", "WhatsApp Kunal the EMI options Friday morning @Arjun", "Email Sanjay revised pricing next Mon urgent", "Collect ₹800 from Ishita in 2 days"];

export default function TasksPage() {
  const toast = useToast();
  const [items, setItems] = useState<Task[]>(seedTasks);
  const [view, setView] = useState<"list" | "board">("list");
  const [assignee, setAssignee] = useState("all");
  const [aiOnly, setAiOnly] = useState(false);
  const [typeFilter, setTypeFilter] = useState<TaskType[]>([]);
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [showDone, setShowDone] = useState(true);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overGroup, setOverGroup] = useState<TaskGroup | null>(null);
  const [snoozeFor, setSnoozeFor] = useState<string | null>(null);
  const quickRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (el.closest("input, textarea, select, [contenteditable=true]")) return;
      if (e.key === "q" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        quickRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const parsed = draft.trim() ? parseTask(draft) : null;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((t) => {
      const contact = t.contactId ? sellContactById(t.contactId) : undefined;
      if (assignee === "me" && t.assigneeId !== "u1") return false;
      if (assignee !== "all" && assignee !== "me" && t.assigneeId !== assignee) return false;
      if (aiOnly && t.createdBy !== "ai") return false;
      if (typeFilter.length && !typeFilter.includes(t.type)) return false;
      if (q && ![t.title, contact?.name, contact?.company].some((f) => f?.toLowerCase().includes(q))) return false;
      return true;
    });
  }, [items, assignee, aiOnly, typeFilter, query]);

  const byGroup = useMemo(() => {
    const out: Record<TaskGroup, Task[]> = { overdue: [], today: [], upcoming: [], done: [] };
    for (const t of filtered) out[taskGroup(t)].push(t);
    out.overdue.sort((a, b) => a.due - b.due);
    out.today.sort((a, b) => a.due - b.due);
    out.upcoming.sort((a, b) => a.due - b.due);
    out.done.sort((a, b) => (b.doneAt ?? 0) - (a.doneAt ?? 0));
    return out;
  }, [filtered]);

  const open = items.filter((t) => !t.done);
  const overdueCount = open.filter((t) => taskGroup(t) === "overdue").length;
  const todayCount = open.filter((t) => taskGroup(t) === "today").length;
  const aiCreated = open.filter((t) => t.createdBy === "ai").length;
  const doneToday = items.filter((t) => t.done && t.doneAt && Math.floor(t.doneAt / 1440) === TODAY).length;

  const update = (task: Task, message?: string) => {
    setItems((list) => list.map((t) => (t.id === task.id ? task : t)));
    if (message) toast({ title: message, description: task.title });
  };

  const toggleDone = (task: Task) => {
    const next = task.done ? { ...task, done: false, doneAt: undefined } : { ...task, done: true, doneAt: NOW_STAMP };
    setItems((list) => list.map((t) => (t.id === task.id ? next : t)));
    if (!task.done) toast({ title: "Task completed", description: task.title });
  };

  const addTask = () => {
    if (!parsed) return;
    const task: Task = {
      id: `k${Date.now()}`,
      title: parsed.title,
      type: parsed.type,
      contactId: parsed.contact?.id,
      assigneeId: parsed.assigneeId,
      createdBy: "u1",
      createdAt: NOW_STAMP,
      due: parsedStamp(parsed),
      hasTime: parsed.hasTime,
      priority: parsed.priority,
      done: false,
    };
    setItems((list) => [task, ...list]);
    setDraft("");
    toast({ title: "Task added", description: `${dueLabel(task)} · ${assigneeName(task.assigneeId)}` });
  };

  const moveTo = (id: string, g: TaskGroup) => {
    const task = items.find((t) => t.id === id);
    if (!task || taskGroup(task) === g) return;
    const patch: Partial<Task> =
      g === "done"
        ? { done: true, doneAt: NOW_STAMP }
        : g === "today"
          ? { done: false, doneAt: undefined, due: stamp(TODAY, 18 * 60), hasTime: true }
          : g === "upcoming"
            ? { done: false, doneAt: undefined, due: stamp(TODAY + 1, 9 * 60), hasTime: true }
            : { done: false, doneAt: undefined, due: stamp(TODAY - 1, 18 * 60), hasTime: false };
    setItems((list) => list.map((t) => (t.id === id ? { ...t, ...patch } : t)));
    toast({ title: g === "done" ? "Task completed" : `Moved to ${groupMeta[g].label}`, description: g === "today" ? "Due today, 6:00 PM" : g === "upcoming" ? "Due tomorrow, 9:00 AM" : task.title });
  };

  const openTask = items.find((t) => t.id === openId) ?? null;
  const filtersActive = assignee !== "all" || aiOnly || typeFilter.length > 0 || query;

  return (
    <Page>
      <PageHeader
        title="Tasks"
        description="Follow-ups for you and your team. Anvita AI creates them from conversations, like “call me back Tuesday”, and links the chat."
        actions={
          <>
            <Segmented
              value={view}
              onChange={setView}
              items={[
                { value: "list", label: "List", icon: <List /> },
                { value: "board", label: "Board", icon: <KanbanSquare /> },
              ]}
            />
            <Button onClick={() => quickRef.current?.focus()}>
              <Plus /> New task
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Open tasks" value={open.length} hint={`${todayCount} due today`} icon={<ListTodo />} />
        <StatCard label="Overdue" value={overdueCount} delta={-33.3} goodWhen="down" hint="vs last week" icon={<TriangleAlert />} />
        <StatCard label="Created by AI" value={`${Math.round((aiCreated / Math.max(open.length, 1)) * 100)}%`} hint={`${aiCreated} of ${open.length} open`} icon={<Bot />} />
        <StatCard label="Completed today" value={doneToday} delta={12.5} hint="median 2h 10m to close" icon={<CheckCircle2 />} />
      </div>

      {/* Quick add */}
      <Card className="mt-4 p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            addTask();
          }}
          className="flex flex-col gap-2 sm:flex-row"
        >
          <Input
            ref={quickRef}
            icon={<Sparkles />}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Quick add in plain words: “Call Rohit tomorrow 4pm”"
            aria-label="Quick add task"
            className="flex-1"
          />
          <Button type="submit" disabled={!parsed}>
            <Plus /> Add task
          </Button>
        </form>
        {parsed ? (
          <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
            <span className="mr-1 inline-flex items-center gap-1 font-medium text-ai">
              <Sparkles className="size-3.5" /> Understood
            </span>
            <ParsedChip label="Type" active={parsed.typeMatched}>
              <TaskTypeIcon type={parsed.type} size="xs" /> {taskTypeMeta[parsed.type].label}
            </ParsedChip>
            <ParsedChip label="Contact" active={Boolean(parsed.contact)}>
              {parsed.contact ? (
                <>
                  <Avatar name={parsed.contact.name} size="xs" className="-ml-1" /> {parsed.contact.name}
                </>
              ) : (
                "No contact"
              )}
            </ParsedChip>
            <ParsedChip label="Due" active={parsed.dateMatched}>
              <CalendarClock className="size-3.5" /> {dayLabel(parsed.day)}
              {parsed.hasTime ? `, ${timeLabel(parsed.minutes)}` : ""}
            </ParsedChip>
            <ParsedChip label="Assignee" active={parsed.assigneeMatched}>
              <UserRound className="size-3.5" /> {parsed.assigneeId === "u1" ? "Me" : assigneeName(parsed.assigneeId)}
            </ParsedChip>
            {parsed.priority === "high" && (
              <ParsedChip label="Priority" active>
                <Flag className="size-3.5" /> High
              </ParsedChip>
            )}
            <span className="ml-auto hidden text-muted sm:inline">
              Press <Kbd>↵</Kbd> to add
            </span>
          </div>
        ) : (
          <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs text-muted">
            <span>Try:</span>
            {examples.map((ex) => (
              <button key={ex} onClick={() => setDraft(ex)} className="rounded-full border border-line px-2.5 py-1 text-fg-2 hover:border-line-strong hover:text-fg">
                {ex}
              </button>
            ))}
            <span className="ml-auto hidden sm:inline">
              Press <Kbd>Q</Kbd> anywhere to quick-add
            </span>
          </div>
        )}
      </Card>

      {/* Filters */}
      <div className="mt-4 flex flex-col gap-3 xl:flex-row xl:items-center">
        <div className="flex flex-wrap items-center gap-2">
          <Input icon={<Search />} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search tasks or contacts" aria-label="Search tasks" className="w-full sm:w-64" />
          <Select value={assignee} onChange={(e) => setAssignee(e.target.value)} aria-label="Assignee" className="w-auto min-w-40">
            <option value="all">All assignees</option>
            <option value="me">Assigned to me</option>
            <option value="ai">Anvita AI</option>
            {team
              .filter((m) => m.id !== "u1")
              .map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
          </Select>
          <FilterChip active={aiOnly} onClick={() => setAiOnly((v) => !v)}>
            <Bot /> Created by AI
          </FilterChip>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 xl:ml-auto">
          {types.map((t) => (
            <FilterChip key={t} active={typeFilter.includes(t)} onClick={() => setTypeFilter((f) => (f.includes(t) ? f.filter((x) => x !== t) : [...f, t]))} count={items.filter((x) => x.type === t && !x.done).length}>
              {taskTypeMeta[t].label}
            </FilterChip>
          ))}
          {filtersActive && (
            <Button
              size="xs"
              variant="ghost"
              onClick={() => {
                setAssignee("all");
                setAiOnly(false);
                setTypeFilter([]);
                setQuery("");
              }}
            >
              <X /> Clear
            </Button>
          )}
        </div>
      </div>

      {overdueCount > 0 && !aiOnly && view === "list" && (
        <AiCallout
          className="mt-4"
          title={`${overdueCount} follow-ups are overdue`}
          action={
            <>
              <Button
                size="xs"
                variant="ai"
                onClick={() => {
                  const ids = items.filter((t) => !t.done && taskGroup(t) === "overdue" && (t.type === "whatsapp" || t.type === "payment")).map((t) => t.id);
                  setItems((list) => list.map((t) => (ids.includes(t.id) ? { ...t, assigneeId: "ai" } : t)));
                  toast({ title: ids.length ? `${ids.length} handed to Anvita AI` : "Nothing the AI can take", description: ids.length ? "It will send polite reminders on WhatsApp and report back." : "Calls and reviews need a human." });
                }}
              >
                Let AI handle message & payment ones
              </Button>
              <Button size="xs" variant="outline" onClick={() => setAiOnly(true)}>
                Review AI-created tasks
              </Button>
            </>
          }
        >
          Kunal Shah&apos;s EMI call is the most valuable (₹1.2L treatment plan, 6 days in proposal). AI can send reminders for payment and WhatsApp follow-ups; calls need a person.
        </AiCallout>
      )}

      {filtered.length === 0 ? (
        <Card className="mt-4">
          <EmptyState icon={<ListTodo />} title="No tasks match these filters" description="Try another assignee or type, or clear the filters." />
        </Card>
      ) : view === "list" ? (
        <div className="mt-4 space-y-4">
          {groups.map((g) => {
            const list = byGroup[g];
            if (!list.length) return null;
            const collapsed = g === "done" && !showDone;
            return (
              <Card key={g}>
                <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-5">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-semibold">{groupMeta[g].label}</h2>
                    <Badge tone={groupMeta[g].tone}>{list.length}</Badge>
                  </div>
                  {g === "done" && (
                    <button onClick={() => setShowDone((v) => !v)} className="text-xs font-medium text-primary hover:underline">
                      {showDone ? "Hide" : "Show"}
                    </button>
                  )}
                </div>
                {!collapsed && (
                  <ul className="divide-y divide-line border-t border-line">
                    {list.map((t) => (
                      <TaskRow
                        key={t.id}
                        task={t}
                        onToggle={() => toggleDone(t)}
                        onOpen={() => setOpenId(t.id)}
                        snoozeOpen={snoozeFor === t.id}
                        onSnoozeToggle={() => setSnoozeFor((s) => (s === t.id ? null : t.id))}
                        onSnooze={(at, label) => {
                          update({ ...t, due: at, hasTime: true }, `Snoozed until ${label}`);
                          setSnoozeFor(null);
                        }}
                      />
                    ))}
                  </ul>
                )}
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="-mx-4 mt-4 overflow-x-auto px-4 pb-2 scroll-thin sm:mx-0 sm:px-0">
          <div className="grid min-w-[1080px] grid-cols-4 gap-3">
            {groups.map((g) => (
              <div
                key={g}
                onDragOver={(e) => {
                  e.preventDefault();
                  setOverGroup(g);
                }}
                onDragLeave={() => setOverGroup((o) => (o === g ? null : o))}
                onDrop={(e) => {
                  e.preventDefault();
                  if (dragId) moveTo(dragId, g);
                  setDragId(null);
                  setOverGroup(null);
                }}
                className={cn("flex flex-col rounded-xl border bg-surface-2/60 p-2 transition-colors", overGroup === g ? "border-primary bg-primary-soft/40" : "border-line")}
              >
                <div className="flex items-center justify-between px-2 py-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{groupMeta[g].label}</span>
                    <Badge tone={groupMeta[g].tone}>{byGroup[g].length}</Badge>
                  </div>
                </div>
                <div className="mt-1 flex min-h-32 flex-1 flex-col gap-2">
                  {byGroup[g].map((t) => (
                    <TaskCard key={t.id} task={t} dragging={dragId === t.id} onDragStart={() => setDragId(t.id)} onDragEnd={() => setDragId(null)} onOpen={() => setOpenId(t.id)} onToggle={() => toggleDone(t)} />
                  ))}
                  {byGroup[g].length === 0 && <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-line-strong p-4 text-xs text-muted">Drop tasks here</div>}
                </div>
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted">Drag a card to reschedule: Today sets 6:00 PM, Upcoming sets tomorrow 9:00 AM, Done completes it.</p>
        </div>
      )}

      <TaskDrawer
        task={openTask}
        onClose={() => setOpenId(null)}
        onUpdate={update}
        onDelete={(t) => {
          setItems((list) => list.filter((x) => x.id !== t.id));
          setOpenId(null);
          toast({ title: "Task deleted", description: t.title, tone: "warning" });
        }}
      />
    </Page>
  );
}

function ParsedChip({ label, active, children }: { label: string; active: boolean; children: React.ReactNode }) {
  return (
    <span
      title={active ? `${label} detected` : `${label}: default`}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-medium",
        active ? "border-ai/30 bg-ai-soft text-fg" : "border-dashed border-line-strong bg-surface text-muted",
      )}
    >
      <span className="text-[10px] font-semibold tracking-wide text-muted uppercase">{label}</span>
      {children}
    </span>
  );
}

function TaskMeta({ task }: { task: Task }) {
  const contact = task.contactId ? sellContactById(task.contactId) : undefined;
  const group = taskGroup(task);
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
      {contact && (
        <span className="inline-flex min-w-0 items-center gap-1.5">
          <Avatar name={contact.name} size="xs" />
          <span className="truncate">{contact.name}</span>
        </span>
      )}
      <span className={cn("inline-flex items-center gap-1", group === "overdue" && "font-medium text-danger")}>
        {group === "overdue" ? <TriangleAlert className="size-3.5" /> : <CalendarClock className="size-3.5" />}
        {task.done && task.doneAt ? `Done ${dayLabel(Math.floor(task.doneAt / 1440)).toLowerCase()}, ${timeLabel(task.doneAt % 1440)}` : dueLabel(task)}
      </span>
      {task.priority === "high" && !task.done && (
        <span className="inline-flex items-center gap-1 text-danger">
          <Flag className="size-3.5" /> High
        </span>
      )}
    </div>
  );
}

function TaskRow({
  task,
  onToggle,
  onOpen,
  snoozeOpen,
  onSnoozeToggle,
  onSnooze,
}: {
  task: Task;
  onToggle: () => void;
  onOpen: () => void;
  snoozeOpen: boolean;
  onSnoozeToggle: () => void;
  onSnooze: (at: number, label: string) => void;
}) {
  return (
    <li className="group relative flex items-start gap-3 px-4 py-3 hover:bg-surface-2/60 sm:px-5">
      <button onClick={onToggle} aria-label={task.done ? `Reopen: ${task.title}` : `Complete: ${task.title}`} className={cn("mt-1 shrink-0", task.done ? "text-success" : "text-line-strong hover:text-success")}>
        {task.done ? <CheckCircle2 className="size-5" /> : <Circle className="size-5" />}
      </button>
      <TaskTypeIcon type={task.type} size="sm" />
      <button onClick={onOpen} className="min-w-0 flex-1 text-left">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className={cn("text-sm font-medium", task.done && "text-muted line-through")}>{task.title}</span>
          {task.createdBy === "ai" && <AiTag />}
        </div>
        <div className="mt-1">
          <TaskMeta task={task} />
        </div>
      </button>
      <div className="flex shrink-0 items-center gap-1">
        {!task.done && (
          <div className="relative">
            <Button variant="ghost" size="icon-sm" onClick={onSnoozeToggle} aria-label={`Snooze: ${task.title}`} aria-expanded={snoozeOpen}>
              <AlarmClock />
            </Button>
            {snoozeOpen && (
              <div className="animate-fade-in absolute top-full right-0 z-20 mt-1 w-52 rounded-xl border border-line bg-surface p-1 shadow-pop">
                <div className="px-3 py-1.5 text-[11px] font-semibold tracking-wide text-muted uppercase">Snooze until</div>
                {snoozeOptions.map((o) => (
                  <button key={o.label} onClick={() => onSnooze(o.at(), o.label)} className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-surface-2">
                    {o.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        <span title={`Assigned to ${assigneeName(task.assigneeId)}`} className="hidden sm:inline-flex">
          <Avatar name={assigneeName(task.assigneeId)} ai={task.assigneeId === "ai"} size="xs" />
        </span>
      </div>
    </li>
  );
}

function TaskCard({ task, dragging, onDragStart, onDragEnd, onOpen, onToggle }: { task: Task; dragging: boolean; onDragStart: () => void; onDragEnd: () => void; onOpen: () => void; onToggle: () => void }) {
  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "move";
        onDragStart();
      }}
      onDragEnd={onDragEnd}
      className={cn("cursor-grab rounded-lg border border-line bg-surface p-3 shadow-card transition-opacity active:cursor-grabbing", dragging && "opacity-40")}
    >
      <div className="flex items-start gap-2">
        <TaskTypeIcon type={task.type} size="xs" />
        <button onClick={onOpen} className={cn("min-w-0 flex-1 text-left text-sm font-medium", task.done && "text-muted line-through")}>
          {task.title}
        </button>
        <button onClick={onToggle} aria-label={task.done ? `Reopen: ${task.title}` : `Complete: ${task.title}`} className={cn("shrink-0", task.done ? "text-success" : "text-line-strong hover:text-success")}>
          {task.done ? <CheckCircle2 className="size-4" /> : <Circle className="size-4" />}
        </button>
      </div>
      <div className="mt-2">
        <TaskMeta task={task} />
      </div>
      <div className="mt-2 flex items-center justify-between">
        {task.createdBy === "ai" ? <AiTag label="AI follow-up" /> : <span />}
        <Avatar name={assigneeName(task.assigneeId)} ai={task.assigneeId === "ai"} size="xs" />
      </div>
    </div>
  );
}
