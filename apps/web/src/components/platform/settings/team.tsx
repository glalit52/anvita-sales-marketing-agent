"use client";

import { Check, Mail, Minus, ShieldCheck, ShieldOff, UserPlus } from "lucide-react";
import { useState } from "react";
import { Avatar, Badge, Button, Card, CardHeader, Checkbox, Field, Input, Modal, Select, useToast } from "@/components/ui";
import { team, type TeamMember } from "@/lib/mock/core";
import { locations, memberAccess, pendingInvites, rolePermissions } from "@/lib/mock/platform";

const roles = ["Owner", "Admin", "Manager", "Agent", "Viewer"] as const;

export function TeamSettings() {
  const toast = useToast();
  const [members, setMembers] = useState(team.map((m) => ({ ...m, role: m.role as string, ...memberAccess[m.id] })));
  const [invites, setInvites] = useState(pendingInvites);
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Agent");
  const [locs, setLocs] = useState<string[]>(["Koregaon Park"]);

  const invite = () => {
    setInvites((i) => [...i, { email, role, sent: "Just now" }]);
    setOpen(false);
    setEmail("");
    toast({ title: "Invite sent", description: `${email} will get an email and WhatsApp link.` });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader
          title="Members"
          description={`${members.length} members · ${invites.length} pending · Growth plan includes 10 seats`}
          action={
            <Button size="sm" onClick={() => setOpen(true)}>
              <UserPlus /> Invite
            </Button>
          }
        />
        <div className="overflow-x-auto border-t border-line">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="text-left text-xs text-muted">
                <th className="px-5 py-2 font-medium">Member</th>
                <th className="px-3 py-2 font-medium">Role</th>
                <th className="px-3 py-2 font-medium">Location access</th>
                <th className="px-3 py-2 font-medium">2FA</th>
                <th className="px-5 py-2 font-medium">Last active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {members.map((m) => (
                <tr key={m.id}>
                  <td className="px-5 py-2.5">
                    <div className="flex items-center gap-3">
                      <Avatar name={m.name} online={m.online} />
                      <div className="min-w-0">
                        <div className="font-medium">{m.name}</div>
                        <div className="text-xs text-muted">{m.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    {m.role === "Owner" ? (
                      <Badge tone="primary">Owner</Badge>
                    ) : (
                      <Select
                        aria-label={`Role for ${m.name}`}
                        className="h-8 w-32 text-xs"
                        value={m.role}
                        onChange={(e) => {
                          setMembers((all) => all.map((x) => (x.id === m.id ? { ...x, role: e.target.value as TeamMember["role"] } : x)));
                          toast({ title: `${m.name} is now ${e.target.value}`, description: "Logged in the audit trail." });
                        }}
                      >
                        {roles.slice(1).map((r) => (
                          <option key={r}>{r}</option>
                        ))}
                      </Select>
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex flex-wrap gap-1">
                      {m.locations.map((l) => (
                        <Badge key={l}>{l}</Badge>
                      ))}
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    {m.twoFA ? (
                      <Badge tone="success">
                        <ShieldCheck /> On
                      </Badge>
                    ) : (
                      <button onClick={() => toast({ title: `2FA reminder sent to ${m.name}`, tone: "info" })}>
                        <Badge tone="warning">
                          <ShieldOff /> Off · remind
                        </Badge>
                      </button>
                    )}
                  </td>
                  <td className="px-5 py-2.5 text-xs text-muted">{m.lastActive}</td>
                </tr>
              ))}
              {invites.map((i) => (
                <tr key={i.email} className="bg-surface-2/40">
                  <td className="px-5 py-2.5">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex size-8 items-center justify-center rounded-full border border-dashed border-line-strong text-muted">
                        <Mail className="size-3.5" />
                      </span>
                      <div>
                        <div className="font-medium">{i.email}</div>
                        <div className="text-xs text-muted">Invited {i.sent}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <Badge>{i.role}</Badge>
                  </td>
                  <td className="px-3 py-2.5">
                    <Badge tone="info">Pending</Badge>
                  </td>
                  <td className="px-3 py-2.5" />
                  <td className="px-5 py-2.5">
                    <div className="flex gap-2 text-xs">
                      <button className="font-medium text-primary hover:underline" onClick={() => toast({ title: "Invite resent" })}>
                        Resend
                      </button>
                      <button
                        className="text-muted hover:text-danger"
                        onClick={() => {
                          setInvites((all) => all.filter((x) => x.email !== i.email));
                          toast({ title: "Invite revoked", tone: "info" });
                        }}
                      >
                        Revoke
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <CardHeader title="Roles & permissions" description="What each role can do. Location access further limits which conversations a member sees." />
        <div className="overflow-x-auto border-t border-line">
          <table className="w-full min-w-[600px] text-sm">
            <thead>
              <tr className="text-xs text-muted">
                <th className="px-5 py-2 text-left font-medium">Permission</th>
                {roles.map((r) => (
                  <th key={r} className="px-3 py-2 text-center font-medium">
                    {r}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rolePermissions.map((p) => (
                <tr key={p.perm}>
                  <td className="px-5 py-2.5 text-fg-2">{p.perm}</td>
                  {roles.map((r) => (
                    <td key={r} className="px-3 py-2.5 text-center">
                      {p[r] ? <Check className="mx-auto size-4 text-success" aria-label="Allowed" /> : <Minus className="mx-auto size-4 text-line-strong" aria-label="Not allowed" />}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Invite teammate"
        description="They'll get an email + WhatsApp invite valid for 7 days."
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={invite} disabled={!email.includes("@")}>
              Send invite
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Email">
            <Input icon={<Mail />} type="email" placeholder="name@smiledental.in" value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          <Field label="Role">
            <Select value={role} onChange={(e) => setRole(e.target.value)}>
              {roles.slice(1).map((r) => (
                <option key={r}>{r}</option>
              ))}
            </Select>
          </Field>
          <Field label="Location access">
            <div className="space-y-2">
              {locations.map((l) => (
                <label key={l.id} className="flex items-center gap-2 text-sm">
                  <Checkbox checked={locs.includes(l.name)} onChange={(v) => setLocs((all) => (v ? [...all, l.name] : all.filter((x) => x !== l.name)))} label={l.name} />
                  {l.name}
                </label>
              ))}
            </div>
          </Field>
        </div>
      </Modal>
    </div>
  );
}
