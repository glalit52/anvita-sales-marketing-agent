"use client";

import { BellRing, Mail, MessageCircle, Monitor, Smartphone } from "lucide-react";
import { Fragment, useState } from "react";
import { Button, Card, CardBody, CardHeader, Checkbox, Field, Select, useToast } from "@/components/ui";
import { notificationEvents } from "@/lib/mock/platform";

type Ch = "inApp" | "email" | "whatsapp" | "push";
const cols: { key: Ch; label: string; icon: typeof Mail }[] = [
  { key: "inApp", label: "In-app", icon: Monitor },
  { key: "email", label: "Email", icon: Mail },
  { key: "whatsapp", label: "WhatsApp", icon: MessageCircle },
  { key: "push", label: "Mobile push", icon: Smartphone },
];

export function NotificationSettings() {
  const toast = useToast();
  const [rows, setRows] = useState(notificationEvents);
  const groups = Array.from(new Set(rows.map((r) => r.group)));

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
      <Card className="xl:col-span-2">
        <CardHeader
          title="Notify me about"
          description="Personal preferences for Priya Sharma. Escalations always show in the inbox."
          action={
            <Button size="sm" onClick={() => toast({ title: "Notification preferences saved" })}>
              Save
            </Button>
          }
        />
        <div className="overflow-x-auto border-t border-line">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="text-xs text-muted">
                <th className="px-5 py-2 text-left font-medium">Event</th>
                {cols.map((c) => (
                  <th key={c.key} className="px-3 py-2 text-center font-medium">
                    <span className="inline-flex items-center gap-1">
                      <c.icon className="size-3.5" /> {c.label}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {groups.map((g) => (
                <Fragment key={g}>
                  <tr className="bg-surface-2/60">
                    <td colSpan={5} className="px-5 py-1.5 text-[11px] font-semibold tracking-wide text-muted uppercase">
                      {g}
                    </td>
                  </tr>
                  {rows
                    .filter((r) => r.group === g)
                    .map((r) => (
                      <tr key={r.id} className="border-t border-line">
                        <td className="px-5 py-2.5 text-fg-2">{r.label}</td>
                        {cols.map((c) => (
                          <td key={c.key} className="px-3 py-2.5 text-center">
                            <Checkbox
                              checked={r[c.key]}
                              label={`${r.label} via ${c.label}`}
                              onChange={(v) => setRows((all) => all.map((x) => (x.id === r.id ? { ...x, [c.key]: v } : x)))}
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <div className="space-y-4">
        <Card>
          <CardHeader title="Delivery" description="Where and when we reach you" />
          <CardBody className="space-y-4">
            <Field label="WhatsApp alerts to">
              <Select defaultValue="p">
                <option value="p">+91 98220 00001 (Priya, verified)</option>
              </Select>
            </Field>
            <Field label="Do not disturb">
              <Select defaultValue="22">
                <option value="none">Never</option>
                <option value="22">10 PM – 7 AM (urgent escalations still ring)</option>
                <option value="21">9 PM – 8 AM</option>
              </Select>
            </Field>
            <Field label="Daily digest language">
              <Select defaultValue="en">
                <option value="en">English</option>
                <option value="hi">हिन्दी</option>
                <option value="mr">मराठी</option>
              </Select>
            </Field>
          </CardBody>
        </Card>
        <Card className="p-4">
          <div className="flex items-start gap-3">
            <BellRing className="mt-0.5 size-4 text-primary" />
            <div className="text-sm">
              <div className="font-medium">Send a test notification</div>
              <p className="mt-0.5 text-xs text-muted">Check that WhatsApp and push alerts reach your phone.</p>
              <Button size="xs" variant="outline" className="mt-2" onClick={() => toast({ title: "Test sent", description: "Check WhatsApp and the Anvita mobile app.", tone: "info" })}>
                Send test
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
