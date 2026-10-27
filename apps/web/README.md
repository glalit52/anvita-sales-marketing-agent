# Anvita Web

The Anvita product UI. It is a clickable frontend for every module in
[docs/02-feature-catalog.md](../../docs/02-feature-catalog.md). There is no backend yet: all data is mock data in
`src/lib/mock/`, and actions (sending, booking, AI streaming, drag & drop) are simulated in local state.

## Run it

```bash
cd apps/web
npm install
npm run dev        # http://localhost:3000
npm run typecheck
npm run lint
npm run build
```

Stack: Next.js 16 (App Router), React 19, Tailwind CSS v4, TypeScript, lucide-react, recharts.

## Screens

| Route | What it shows |
|---|---|
| `/login`, `/onboarding` | Sign-in, plus the 5-step setup: website import → channels → goals → sandbox test → go live |
| `/dashboard` | KPIs, leads & bookings trend, funnel, escalations, tasks, AI activity |
| `/inbox` | Unified inbox across WhatsApp/SMS/email/webchat/social/calls, AI vs human handling, take over / hand back, AI suggest, notes, contact panel |
| `/agent` | AI Agent Studio: persona, knowledge, playbooks, escalation rules, sandbox with tool-call trace, versions & QA |
| `/contacts`, `/pipeline`, `/calendar`, `/payments` | CRM, drag-and-drop deals, appointment calendar & booking settings, pay links/invoices/payouts |
| `/prospecting`, `/sequences`, `/campaigns` | AI lead search with streaming results, AI columns & enrichment, outbound sequences, broadcast campaigns |
| `/marketing`, `/reviews`, `/analytics` | Ads co-pilot, SEO & social, review monitoring & requests, funnel/attribution/AI performance |
| `/automations`, `/integrations`, `/settings` | Workflow builder, integration catalog & API keys, workspace/team/channels/billing/compliance |

## Code layout

```text
src/
├── app/(app)/<route>/page.tsx   # pages inside the app shell (sidebar + top bar)
├── app/login, app/onboarding    # full-screen pages
├── components/ui/               # design system: Button, Card, Badge, Modal, Drawer, Tabs, StatCard…
├── components/charts/           # recharts wrappers that follow the data-viz rules
├── components/shell/            # sidebar, top bar, command palette (⌘K), theme toggle
├── components/<module>/         # module-specific pieces (sell, outbound, growth, platform)
└── lib/mock/                    # demo workspace data ("Smile Dental", Pune + B2B agri-dealer outbound)
```

## Conventions

- Colors come only from the design tokens in `src/app/globals.css` (`bg-surface`, `text-muted`, `bg-primary`…).
  That makes light/dark mode automatic: it follows the OS setting, and the top-bar toggle overrides it.
- `cn()` merges class names with tailwind-merge, so a `className` passed to a component overrides its defaults.
- Chart series use `--chart-1…6` in fixed order. Never use dual axes. A chart with two or more series gets a legend.
- Modals and drawers render through a portal into `<body>`.
- Pages that read `useSearchParams()` are wrapped in `<Suspense>`.
