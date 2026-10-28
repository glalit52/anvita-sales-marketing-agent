# Anvita Web

The Anvita product UI. It is a clickable frontend for every module in
[docs/02-feature-catalog.md](../../docs/02-feature-catalog.md). It runs in one of two modes:

- **Demo mode** (default, and the GitHub Pages build): all data is mock data in `src/lib/mock/`, and actions
  (sending, booking, AI streaming, drag & drop) are simulated in local state.
- **Live mode**: set `NEXT_PUBLIC_API_URL` to an [Anvita API](https://github.com/glalit52/anvita-sales-marketing-agent-backend)
  and the app signs in with email and password and reads and writes your real workspace.

## Live mode

```bash
# terminal 1: the API (see the backend README), e.g. with its demo workspace seeded
# terminal 2:
cd apps/web
NEXT_PUBLIC_API_URL=http://localhost:8000 npm run dev
# sign in as priya@smiledental.in / demo-password-123, or create a workspace
```

| Connected to the API | Still on demo data |
|---|---|
| Sign-in, sign-up, invites, sign-out | Pipeline, calendar, payments list |
| Dashboard (KPIs, trend, escalations, today's tasks, AI activity) | AI Agent Studio, settings, integrations |
| Inbox (live threads, replies, notes, assign, take over / hand back, close, AI suggest, approve AI drafts) | Prospecting, sequences, campaigns, marketing, reviews |
| Contacts (list, add, edit, bulk tag, consent, notes, timeline, full profile) | Analytics, automations |
| Tasks, notifications, top-bar bell and sidebar counters | Public booking page |
| Webchat widget on `/site-demo` (set `NEXT_PUBLIC_WIDGET_ORG_SLUG` for another workspace) | |
| Customer pay page `/pay/[token]` | |

Modules that are still on demo data show a "not connected yet" card in live mode instead of mixing demo records
into a real workspace. How it works: `src/lib/live/` holds the API client (token refresh), the session gate, and
adapters that load API data into the same collections the screens already read, so each screen needs only small,
mode-aware changes.

## Run it

```bash
cd apps/web
npm install
npm run dev        # http://localhost:3000
npm run typecheck  # generates Next route types, then runs tsc
npm run lint
npm run build
```

Stack: Next.js 16 (App Router), React 19, Tailwind CSS v4, TypeScript, lucide-react, recharts.

## Screens

**Public website**
| Route | What it shows |
|---|---|
| `/` | Homepage: hero with live product demo, how it works, features, comparison, testimonials, FAQ |
| `/pricing` | Plans in ₹ (monthly/yearly), bill estimator, feature table, usage credits |
| `/solutions/clinics` | Industry page / case study template |

**The app** (sidebar shell)
| Route | What it shows |
|---|---|
| `/login`, `/onboarding` | Sign-in, plus the 5-step setup: website import → channels → goals → sandbox test → go live |
| `/dashboard` | KPIs, leads & bookings trend, funnel, escalations, tasks, AI activity |
| `/inbox` | Unified inbox across WhatsApp/SMS/email/webchat/social/calls, AI vs human handling, take over / hand back, AI suggest, notes, contact panel |
| `/tasks`, `/notifications`, `/help` | AI-created follow-ups with natural-language quick add, notification center, help center with Ask AI |
| `/agent` | AI Agent Studio: persona, knowledge, playbooks, escalation rules, sandbox with tool-call trace, versions & QA |
| `/contacts`, `/contacts/[id]` | CRM table and full-page contact profile with merged activity timeline |
| `/pipeline`, `/calendar`, `/payments` | Drag-and-drop deals, appointment calendar & booking settings, pay links/invoices/payouts |
| `/prospecting`, `/sequences`, `/campaigns` | AI lead search with streaming results, AI columns & enrichment, outbound sequences, broadcast campaigns |
| `/marketing` | AI campaign planner with brand memory, approvals, landing pages, AI search (AEO), ads co-pilot, SEO, social |
| `/reviews`, `/analytics` | Review monitoring & requests; funnel, attribution, AI and team performance |
| `/automations`, `/integrations`, `/settings` | Workflow builder, integration catalog & API keys, workspace/team/channels/billing/compliance |

**Customer-facing pages** (what a business's customers see, usually opened from WhatsApp)
| Route | What it shows |
|---|---|
| `/book/smile-dental` | Booking flow: clinic → service → dentist → slot → details & consent → deposit → confirmation |
| `/pay/8KD2`, `/pay/INV-1042` | Payment page (UPI/card/netbanking), GST invoice, receipt. Add `?state=failed` to see the failure state |
| `/feedback/r-meera` | Post-visit rating: happy → Google review with AI draft, unhappy → private feedback |
| `/site-demo` | A sample clinic website running the live Anvita webchat widget |

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
