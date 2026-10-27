"use client";

import { Building, Clock, Globe, MapPin, Pencil, Plus, Sparkles, Upload } from "lucide-react";
import { useState } from "react";
import { AiCallout, Badge, Button, Card, CardBody, CardHeader, Field, Input, Modal, Select, useToast } from "@/components/ui";
import { businessProfile, locations as locSeed } from "@/lib/mock/platform";
import { uid } from "@/components/platform/shared";

export function GeneralSettings() {
  const toast = useToast();
  const [profile, setProfile] = useState(businessProfile);
  const [locs, setLocs] = useState(locSeed);
  const [locOpen, setLocOpen] = useState(false);
  const [newLoc, setNewLoc] = useState({ name: "", address: "" });
  const [dirty, setDirty] = useState(false);

  const set = (k: keyof typeof profile, v: string) => {
    setProfile((p) => ({ ...p, [k]: v }));
    setDirty(true);
  };

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
      <Card className="xl:col-span-2">
        <CardHeader
          title="Business profile"
          description="Used by your AI agent, invoices and booking pages"
          action={
            <Button
              size="sm"
              disabled={!dirty}
              onClick={() => {
                setDirty(false);
                toast({ title: "Business profile saved" });
              }}
            >
              Save changes
            </Button>
          }
        />
        <CardBody className="space-y-5">
          <div className="flex flex-wrap items-center gap-4">
            <span className="inline-flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-info to-primary text-2xl font-bold text-white shadow-card">S</span>
            <div>
              <div className="text-sm font-medium">Logo</div>
              <div className="text-xs text-muted">PNG or SVG, at least 256×256. Shown in webchat and invoices.</div>
              <div className="mt-2 flex gap-2">
                <Button size="xs" variant="outline" onClick={() => toast({ title: "Logo uploaded", description: "smile-dental-logo.svg" })}>
                  <Upload /> Upload
                </Button>
                <Button size="xs" variant="ghost" onClick={() => toast({ title: "Logo removed", tone: "info" })}>
                  Remove
                </Button>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Business name">
              <Input value={profile.name} onChange={(e) => set("name", e.target.value)} />
            </Field>
            <Field label="Legal name">
              <Input value={profile.legalName} onChange={(e) => set("legalName", e.target.value)} />
            </Field>
            <Field label="Industry">
              <Select value={profile.industry} onChange={(e) => set("industry", e.target.value)}>
                {["Dental clinic", "Multi-specialty clinic", "Real estate", "Automobile dealer", "Education / coaching", "Home services", "B2B SaaS", "Agri-input dealer"].map((i) => (
                  <option key={i}>{i}</option>
                ))}
              </Select>
            </Field>
            <Field label="Website">
              <Input icon={<Globe />} value={profile.website} onChange={(e) => set("website", e.target.value)} />
            </Field>
            <Field label="Timezone">
              <Select value={profile.timezone} onChange={(e) => set("timezone", e.target.value)}>
                <option>Asia/Kolkata (IST, UTC+5:30)</option>
                <option>Asia/Dubai (GST, UTC+4)</option>
                <option>Asia/Singapore (SGT, UTC+8)</option>
                <option>Europe/London (GMT/BST)</option>
              </Select>
            </Field>
            <Field label="Currency">
              <Select value={profile.currency} onChange={(e) => set("currency", e.target.value)}>
                <option>INR (₹)</option>
                <option>USD ($)</option>
                <option>AED (د.إ)</option>
              </Select>
            </Field>
            <Field label="GSTIN" hint="(printed on invoices)">
              <Input value={profile.gstin} onChange={(e) => set("gstin", e.target.value)} className="font-mono" />
            </Field>
            <Field label="Main phone">
              <Input value={profile.phone} onChange={(e) => set("phone", e.target.value)} />
            </Field>
          </div>
        </CardBody>
      </Card>

      <div className="space-y-4">
        <Card>
          <CardHeader
            title="Locations"
            description={`${locs.length} locations · used for routing and booking`}
            action={
              <Button size="xs" variant="outline" onClick={() => setLocOpen(true)}>
                <Plus /> Add
              </Button>
            }
          />
          <ul className="divide-y divide-line border-t border-line">
            {locs.map((l) => (
              <li key={l.id} className="px-5 py-3">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
                    <Building className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{l.name}</span>
                      {l.primary && <Badge tone="primary">Primary</Badge>}
                    </div>
                    <div className="mt-0.5 flex items-start gap-1 text-xs text-muted">
                      <MapPin className="mt-0.5 size-3 shrink-0" /> {l.address}
                    </div>
                    <div className="mt-0.5 flex items-center gap-1 text-xs text-muted">
                      <Clock className="size-3" /> {l.hours} · {l.chairs} chairs · {l.phone}
                    </div>
                  </div>
                  <Button size="icon-sm" variant="ghost" aria-label={`Edit ${l.name}`} onClick={() => toast({ title: `Editing ${l.name}`, tone: "info" })}>
                    <Pencil />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </Card>
        <AiCallout
          title="Keep your profile fresh"
          action={
            <Button size="xs" variant="ai" onClick={() => toast({ title: "Re-crawling smiledental.in", description: "We'll suggest updates to services, hours and FAQs.", tone: "info" })}>
              <Sparkles /> Re-import from website
            </Button>
          }
        >
          Your website lists Sunday hours for Koregaon Park, but your profile doesn&apos;t. Re-import to sync.
        </AiCallout>
      </div>

      <Modal
        open={locOpen}
        onClose={() => setLocOpen(false)}
        title="Add location"
        footer={
          <>
            <Button variant="ghost" onClick={() => setLocOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={!newLoc.name}
              onClick={() => {
                setLocs((all) => [...all, { id: `l${uid()}`, name: newLoc.name, address: newLoc.address || "Pune", hours: "Mon–Sat 10–8", chairs: 2, phone: "+91 20 6712 3400", primary: false }]);
                setLocOpen(false);
                setNewLoc({ name: "", address: "" });
                toast({ title: "Location added", description: "Connect a calendar for it in Integrations." });
              }}
            >
              Add location
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <Field label="Name">
            <Input placeholder="e.g. Kharadi" value={newLoc.name} onChange={(e) => setNewLoc({ ...newLoc, name: e.target.value })} />
          </Field>
          <Field label="Address">
            <Input placeholder="Street, area, city, PIN" value={newLoc.address} onChange={(e) => setNewLoc({ ...newLoc, address: e.target.value })} />
          </Field>
        </div>
      </Modal>
    </div>
  );
}
