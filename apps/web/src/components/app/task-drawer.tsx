"use client";

import { AlarmClock, ArrowUpRight, CheckCircle2, Clock, Flag, MessagesSquare, RotateCcw, Trash2, UserRound } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { AiCallout, Avatar, Badge, Button, ChannelIcon, Drawer, Field, Input, Segmented, Select, Textarea, useToast } from "@/components/ui";
import { channelMeta } from "@/components/ui/channel";
import { ScoreBar } from "@/components/sell/shared";
import { cn } from "@/lib/cn";
import {
  NOW_STAMP,
  TODAY,
  assigneeName,
  dueLabel,
  relativeLabel,
  stamp,
  stampLabel,
  taskGroup,
  taskTypeMeta,
  weekdayOf,
  type Task,
  type TaskPriority,
  type TaskType,
} from "@/lib/mock/app";
import { conversations, stageMeta, team } from "@/lib/mock/core";
import { sellContactById } from "@/lib/mock/sell";
import { AiTag, SectionTitle, TaskTypeIcon } from "./shared";

export const groupMeta = {
  overdue: { label: "Overdue", tone: "danger" as const },
  today: { label: "Today", tone: "warning" as const },
  upcoming: { label: "Upcoming", tone: "info" as const },
  done: { label: "Done", tone: "success" as const },
};

export const snoozeOptions = [
  { label: "1 hour", at: () => NOW_STAMP + 60, hasTime: true },
  { label: "This evening, 6 PM", at: () => stamp(TODAY, 18 * 60), hasTime: true },
  { label: "Tomorrow, 9 AM", at: () => stamp(TODAY + 1, 9 * 60), hasTime: true },
  { label: "Next Monday, 9 AM", at: () => stamp(TODAY + ((1 - weekdayOf(TODAY) + 7) % 7 || 7), 9 * 60), hasTime: true },
];

export function TaskDrawer({
  task,
  onClose,
  onUpdate,
  onDelete,
}: {
  task: Task | null;
  onClose: () => void;
  onUpdate: (task: Task, message?: string) => void;
  onDelete: (task: Task) => void;
}) {
  return (
    <Drawer open={Boolean(task)} onClose={onClose} title="Task" width="max-w-lg" footer={task ? <DrawerFooter task={task} onUpdate={onUpdate} onClose={onClose} /> : undefined}>
      {task && <TaskDetail key={task.id} task={task} onUpdate={onUpdate} onDelete={onDelete} />}
    </Drawer>
  );
}

function DrawerFooter({ task, onUpdate, onClose }: { task: Task; onUpdate: (t: Task, m?: string) => void; onClose: () => void }) {
  const [snoozeOpen, setSnoozeOpen] = useState(false);
  return (
    <div className="flex w-full flex-wrap items-center justify-between gap-2">
      <div className="relative">
        {!task.done && (
          <Button variant="outline" size="sm" onClick={() => setSnoozeOpen((o) => !o)} aria-expanded={snoozeOpen}>
            <AlarmClock /> Snooze
          </Button>
        )}
        {snoozeOpen && (
          <div className="animate-fade-in absolute bottom-full left-0 z-10 mb-1 w-52 rounded-xl border border-line bg-surface p-1 shadow-pop">
            {snoozeOptions.map((o) => (
              <button
                key={o.label}
                onClick={() => {
                  onUpdate({ ...task, due: o.at(), hasTime: o.hasTime }, `Snoozed until ${stampLabel(o.at())}`);
                  setSnoozeOpen(false);
                }}
                className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-surface-2"
              >
                {o.label}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <Button variant="ghost" size="sm" onClick={onClose}>
          Close
        </Button>
        {task.done ? (
          <Button size="sm" variant="secondary" onClick={() => onUpdate({ ...task, done: false, doneAt: undefined }, "Task reopened")}>
            <RotateCcw /> Reopen
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={() => {
              onUpdate({ ...task, done: true, doneAt: NOW_STAMP }, "Task completed");
              onClose();
            }}
          >
            <CheckCircle2 /> Mark complete
          </Button>
        )}
      </div>
    </div>
  );
}

function TaskDetail({ task, onUpdate, onDelete }: { task: Task; onUpdate: (t: Task, m?: string) => void; onDelete: (t: Task) => void }) {
  const toast = useToast();
  const [title, setTitle] = useState(task.title);
  const [notes, setNotes] = useState(task.notes ?? "");
  const contact = task.contactId ? sellContactById(task.contactId) : undefined;
  const conv = task.conversationId ? conversations.find((c) => c.id === task.conversationId) : undefined;
  const group = taskGroup(task);
  const first = contact?.name.split(" ")[0];

  const history = [
    { text: task.createdBy === "ai" ? "Created by Anvita AI from a conversation" : `Created by ${assigneeName(task.createdBy)}`, at: task.createdAt },
    ...(task.createdBy === "ai" ? [{ text: `Assigned to ${assigneeName(task.assigneeId)} (round-robin + contact owner)`, at: task.createdAt + 1 }] : []),
    ...(task.doneAt ? [{ text: `Completed by ${assigneeName(task.assigneeId)}`, at: task.doneAt }] : []),
  ].reverse();

  return (
    <div className="space-y-5 px-5 py-4">
      <div>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <TaskTypeIcon type={task.type} size="sm" />
          <Badge tone={groupMeta[group].tone} dot>
            {groupMeta[group].label}
          </Badge>
          {task.priority === "high" && (
            <Badge tone="danger">
              <Flag /> High priority
            </Badge>
          )}
          {task.createdBy === "ai" && <AiTag label="Created by AI" />}
        </div>
        <Input
          aria-label="Task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => title.trim() && title !== task.title && onUpdate({ ...task, title: title.trim() }, "Title updated")}
          className={cn("h-auto border-transparent px-0 py-1 text-base font-semibold hover:border-transparent focus:border-primary focus:px-2", task.done && "text-muted line-through")}
        />
        <div className={cn("mt-1 flex items-center gap-1.5 text-sm", group === "overdue" ? "text-danger" : "text-muted")}>
          <Clock className="size-4" />
          {group === "overdue" ? "Overdue · " : "Due "}
          {dueLabel(task)}
        </div>
      </div>

      {task.aiContext && (
        <AiCallout title="Why the AI created this">
          <p>{task.aiContext}</p>
          {task.aiConfidence && <p className="mt-1 text-xs text-muted">Detected follow-up intent · confidence {task.aiConfidence}%</p>}
        </AiCallout>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Type">
          <Select value={task.type} onChange={(e) => onUpdate({ ...task, type: e.target.value as TaskType }, "Type updated")}>
            {(Object.keys(taskTypeMeta) as TaskType[]).map((t) => (
              <option key={t} value={t}>
                {taskTypeMeta[t].label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Assignee">
          <Select value={task.assigneeId} onChange={(e) => onUpdate({ ...task, assigneeId: e.target.value }, `Reassigned to ${assigneeName(e.target.value)}`)}>
            <option value="ai">Anvita AI (handles it automatically)</option>
            {team.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} · {m.role}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <Field label="Priority">
        <Segmented<TaskPriority>
          value={task.priority}
          onChange={(p) => onUpdate({ ...task, priority: p }, `Priority set to ${p}`)}
          items={[
            { value: "high", label: "High" },
            { value: "normal", label: "Normal" },
            { value: "low", label: "Low" },
          ]}
        />
      </Field>

      {contact && (
        <section>
          <SectionTitle>Linked contact</SectionTitle>
          <div className="rounded-xl border border-line p-3">
            <div className="flex items-center gap-3">
              <Avatar name={contact.name} size="md" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="truncate text-sm font-semibold">{contact.name}</span>
                  <Badge tone={stageMeta[contact.stage].tone} dot>
                    {stageMeta[contact.stage].label}
                  </Badge>
                </div>
                <div className="truncate text-xs text-muted">
                  {contact.company ? `${contact.company} · ` : ""}
                  {contact.phone}
                </div>
              </div>
              <ScoreBar score={contact.score} />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link href={`/contacts/${contact.id}`} className="inline-flex h-7 items-center gap-1 rounded-md border border-line px-2 text-xs font-medium hover:bg-surface-2">
                <UserRound className="size-3.5" /> Open profile
              </Link>
              <Button size="xs" variant="outline" onClick={() => toast({ title: `Calling ${contact.phone}…`, description: "Call is recorded and summarised by AI.", tone: "info" })}>
                Call {first}
              </Button>
              <Button size="xs" variant="outline" onClick={() => toast({ title: `WhatsApp opened for ${first}`, description: "Copilot pre-filled a follow-up draft.", tone: "info" })}>
                WhatsApp
              </Button>
            </div>
          </div>
        </section>
      )}

      {conv && (
        <section>
          <SectionTitle
            action={
              <Link href={`/inbox?c=${conv.id}`} className="inline-flex items-center gap-0.5 text-xs font-medium text-primary hover:underline">
                Open in inbox <ArrowUpRight className="size-3" />
              </Link>
            }
          >
            Linked conversation
          </SectionTitle>
          <div className="rounded-xl border border-line">
            <div className="flex items-center gap-2 border-b border-line px-3 py-2 text-xs text-muted">
              <ChannelIcon channel={conv.channel} size="xs" />
              {channelMeta[conv.channel].label} · {conv.intent} · {conv.time} ago
            </div>
            <ul className="space-y-2 p-3">
              {conv.messages.slice(-3).map((m) => (
                <li key={m.id} className={cn("flex", m.author === "contact" ? "justify-start" : "justify-end")}>
                  <div
                    className={cn(
                      "max-w-[85%] rounded-xl px-3 py-1.5 text-xs",
                      m.note ? "border border-warning/30 bg-warning-soft/60 text-fg-2" : m.author === "contact" ? "bg-surface-2 text-fg" : m.author === "ai" ? "bg-ai-soft text-fg" : "bg-primary-soft text-fg",
                    )}
                  >
                    {m.author === "ai" && <span className="mb-0.5 block text-[10px] font-semibold text-ai">AI</span>}
                    {m.note && <span className="mb-0.5 block text-[10px] font-semibold text-warning">Internal note</span>}
                    <span className="line-clamp-3">{m.body}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {!contact && !conv && (
        <div className="flex items-center gap-2 rounded-lg border border-dashed border-line-strong px-3 py-2.5 text-sm text-muted">
          <MessagesSquare className="size-4" /> Not linked to a contact or conversation.
        </div>
      )}

      <Field label="Notes">
        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} onBlur={() => notes !== (task.notes ?? "") && onUpdate({ ...task, notes }, "Notes saved")} placeholder="Add context for whoever picks this up…" />
      </Field>

      <section>
        <SectionTitle>History</SectionTitle>
        <ul className="space-y-2">
          {history.map((h, i) => (
            <li key={i} className="flex items-start justify-between gap-3 text-xs">
              <span className="text-fg-2">{h.text}</span>
              <span className="shrink-0 text-muted">{h.at <= NOW_STAMP ? relativeLabel(h.at) : stampLabel(h.at)}</span>
            </li>
          ))}
        </ul>
      </section>

      <button onClick={() => onDelete(task)} className="inline-flex items-center gap-1.5 text-xs font-medium text-danger hover:underline">
        <Trash2 className="size-3.5" /> Delete task
      </button>
    </div>
  );
}
