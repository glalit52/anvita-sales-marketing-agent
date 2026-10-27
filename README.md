# Anvita: AI Sales & Marketing Agent

Anvita is an AI revenue team for growing businesses. It **finds** customers (outbound prospecting),
**attracts** them (marketing), **answers** every enquiry 24/7 on WhatsApp, SMS, email and webchat,
**converts** them (booking + payments), and **retains** them (reviews + re-engagement), all on one
customer record.

It is inspired by:
- [Origami](https://origami.chat): AI agents that build lead lists from plain-English prompts
- [Diffrent](https://www.diffrent.ai): AI-augmented performance marketing, SEO & automation agency
- [Podium](https://www.podium.com): AI Employee, unified inbox, reviews, payments for local businesses

## Product & architecture docs
| Doc | Contents |
|---|---|
| [01 — Competitive analysis](docs/01-competitive-analysis.md) | Deep-dive on each company, feature matrix, positioning |
| [02 — Feature catalog](docs/02-feature-catalog.md) | All features merged into 9 modules with priorities and pricing model |
| [03 — User journeys](docs/03-user-journeys.md) | Personas, onboarding, inbound, outbound, marketing, human-in-the-loop journeys, metrics |
| [04 — Technical architecture](docs/04-technical-architecture.md) | System design, stack, data model, agent runtime, prospecting engine, compliance, roadmap |

## Frontend
The full product UI lives in [`apps/web`](apps/web/README.md): Next.js 16 + Tailwind v4, with mock data and every
module clickable (inbox, AI Agent Studio, CRM, prospecting, campaigns, marketing, analytics, settings).

```bash
cd apps/web && npm install && npm run dev
```
