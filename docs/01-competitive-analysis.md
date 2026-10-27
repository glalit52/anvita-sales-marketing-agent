# 01 — Competitive Analysis: Origami, Diffrent, Podium

> Research date: October 2026. Origami and Podium don't publish full pricing, and third-party sources
> disagree, so every price below is indicative. Confirm on the vendor sites before relying on it.

## TL;DR

The three companies cover **three different parts of the revenue funnel**:

| | **Origami** (origami.chat) | **Diffrent** (diffrent.ai) | **Podium** (podium.com) |
|---|---|---|---|
| **Funnel stage** | Top of funnel: *find* customers (outbound) | Middle: *attract* customers (marketing) | Bottom: *convert & retain* customers (inbound) |
| **What it is** | Self-serve AI prospecting SaaS | Norwegian digital-marketing agency with AI & automation services (a service business, not SaaS) | AI-first customer-interaction platform for local businesses |
| **Core promise** | "Describe your ideal customer in plain English → get a verified lead list in minutes" | "Senior team + AI handles your performance marketing, SEO and automation, without hourly billing" | "Your AI Employee answers every lead in under a minute, books the appointment, collects the review and the payment" |
| **Buyer** | Founders, SDRs, agencies, B2B sales teams selling to SMBs | Mid-size companies that outsource marketing | Local SMBs: auto dealers, home services, med-spa, dental, retail |
| **Pricing (indicative)** | Free tier (~1,000 one-time credits). Paid plans reported from ~$29–$99/mo, credit-based, not per-seat | Retainer / project (agency) | ~$399/mo (Core), ~$599/mo (Pro), Signature on quote. AI Employee on higher tiers |
| **AI usage** | Agents that crawl the live web, enrich data, and write outreach | AI used internally to deliver marketing work faster | Conversational agent (text + voice) that runs the playbooks, plus AI review replies |

**The opportunity for Anvita:** no single product covers *find → attract → engage → convert → retain*
end to end with one AI agent and one customer record. Origami stops once the list is exported or the
sequence is sent. Podium only starts once the customer contacts you. Diffrent does the marketing in
between as a human service. A product that does all three, with AI doing the work the agency does today,
is the gap.

---

## 1. Origami (origami.chat)

**Category:** AI prospecting / lead generation (competes with Clay, Apollo, Clearbit-style tools).

### How it works
1. The user types an ICP in plain English, e.g. *"HVAC contractors in Texas with 4.5+ Google rating and
   fewer than 50 reviews that are hiring technicians."*
2. Origami's agents search **15–50+ live sources in parallel**: Google Maps, Yelp, state license boards,
   LinkedIn, Indeed and other job boards, business registries, Shopify stores, funding databases and
   review sites. These are live searches, not a static database.
3. The results land in a **table** (spreadsheet-like), one row per company or person.
4. **Enrichment:** contact details, firmographics (employee count, service area), tech-stack detection
   (which CRM or analytics tools they use). One review reports email verification across a
   **5-provider waterfall** and phone verification across a **9-provider waterfall**.
5. **Action:** export to CSV, or launch the **built-in sequencer** (multi-step email + LinkedIn).

### Feature list
- Natural-language ICP → agent plan → live multi-source search
- Local-business discovery (Google Maps by category, location, rating, review count). Reviewers call
  this its strongest area.
- Signal-based search (hiring, funding, tech stack, new licences)
- Spreadsheet-style results table with AI columns
- Waterfall contact enrichment and verification (email + phone)
- Built-in email + LinkedIn sequencer
- CSV export. API availability is reported inconsistently.
- Credit-based usage. The free plan has limited agent messages (~20) and rows per table (~30).

### Strengths / weaknesses
- ✅ Fresh data, excellent for SMB and local-business lists, very low time-to-value (chat UX)
- ❌ Few native CRM integrations reported. Thin outreach compared with dedicated sequencers. Nothing
  after the reply (no inbox, booking or payments).

---

## 2. Diffrent (diffrent.ai)

> ⚠️ **Check this is the right company.** diffrent.ai resolves to a **Norwegian digital-marketing
> agency**, not a SaaS product. If you meant a different company (e.g. a similarly named AI tool),
> send the correct URL and this section can be redone.

**Category:** AI-augmented marketing agency ("more than just a digital marketing agency").

### Service lines (from its website)
| Service | What it covers |
|---|---|
| **Performance marketing** | Paid search and paid social (Google Ads, Meta, LinkedIn), budget allocation, conversion tracking |
| **AI & automation** | Custom AI solutions and automations built for clients ("builds its own technology solutions") |
| **SEO & content** | Technical SEO, keyword strategy, content production |
| **Strategy & business development** | Go-to-market and growth strategy |
| **Data insight & visualisation** | Dashboards, attribution, reporting |

### Business model
- Senior team, no traditional staffing pyramid and **no hourly billing** (client testimonial from
  Amesto TechHouse). Clients include AutoriaGruppen and Amesto TechHouse.

### What to take from it
Diffrent sells *outcomes* (pipeline, traffic, ROAS) delivered by people who use AI. Anvita can
**turn these service lines into product**:
- Ads co-pilot (create, monitor and optimise Google/Meta campaigns)
- SEO and content agent (keyword research → briefs → articles → publish)
- Automation builder (no-code workflows across CRM, inbox and campaigns)
- An analytics and attribution dashboard that ties ad spend → lead → conversation → revenue

---

## 3. Podium (podium.com)

**Category:** Customer-interaction / "lead-to-revenue" platform for local businesses (competes with
Birdeye, NiceJob, GoHighLevel, Weave).

### Products
| Module | Features |
|---|---|
| **AI Employee** (named "Jerry" in G2's listing) | Replies to every new lead 24/7 in under a minute. Asks qualifying questions. Books straight into the calendar. Sends confirmations and reminders to cut no-shows. Re-engages past customers. Requests reviews after a sale. Replies to Google reviews. Industry playbooks (e.g. auto: knows inventory, books test drives). |
| **AI voice agent** | Answers calls (Pro includes ~300 AI voice minutes, with overages billed beyond that) |
| **AI Studio** | Performance monitoring, a **sandbox to test changes before going live**, **escalation rules** for human handoff |
| **Unified inbox** | Calls, SMS, webchat, Facebook/Instagram, Google, reviews and third-party messages in one place. Mobile app. |
| **Webchat** | Website widget that turns visitors into SMS conversations |
| **Reviews** | Review invitations by SMS, monitoring across sites, AI-suggested responses |
| **Payments** | Text-to-Pay links, card terminals, invoices |
| **Marketing** | SMS/email campaigns, segmentation, promotions |
| **Phones** | Business phone lines and call tracking |
| **Integrations** | CRMs, DMS (auto), PMS (dental, med), POS. Custom integrations on Signature. |

### Plans (indicative, third-party sources)
- **Core ~$399/mo:** inbox, webchat, reviews, payments
- **Pro ~$599/mo:** plus AI Employee, automations, AI voice minutes
- **Signature (quote):** plus AI Scheduler, AI Salesperson, AI Marketer, custom integrations

### Strengths / weaknesses
- ✅ Huge distribution with local SMBs, mature inbox and reviews, strong vertical playbooks
- ❌ Expensive for small businesses, opaque pricing, annual contracts. No outbound prospecting. Weak
  marketing analytics. US-centric (SMS-first, while many markets such as India run on **WhatsApp**).

---

## 4. Head-to-head feature matrix

Legend: ✅ strong · 🟡 partial / basic · ❌ none · 🧑 delivered as a human service

| Capability | Origami | Diffrent | Podium | **Anvita (target)** |
|---|:-:|:-:|:-:|:-:|
| Natural-language lead search | ✅ | ❌ | ❌ | ✅ |
| Live web / Maps / registry crawling | ✅ | ❌ | ❌ | ✅ |
| Contact enrichment + verification waterfall | ✅ | ❌ | ❌ | ✅ |
| Outbound sequences (email / LinkedIn) | 🟡 | 🧑 | ❌ | ✅ (+ WhatsApp) |
| Paid-ads management | ❌ | 🧑 | ❌ | 🟡 → ✅ |
| SEO / content generation | ❌ | 🧑 | ❌ | ✅ |
| Website webchat widget | ❌ | ❌ | ✅ | ✅ |
| Unified inbox (SMS, WhatsApp, email, social) | ❌ | ❌ | ✅ | ✅ |
| AI agent replies 24/7 (text) | ❌ | ❌ | ✅ | ✅ |
| AI voice agent (calls) | ❌ | ❌ | ✅ | ✅ (phase 3) |
| Appointment booking | ❌ | ❌ | ✅ | ✅ |
| Reviews: request + AI reply | ❌ | ❌ | ✅ | ✅ |
| Text-to-pay / invoices | ❌ | ❌ | ✅ | ✅ |
| Broadcast campaigns + segments | ❌ | 🧑 | ✅ | ✅ |
| Agent sandbox / evals / escalation rules | ❌ | ❌ | ✅ | ✅ |
| Full-funnel attribution (ad → lead → revenue) | ❌ | 🧑 | 🟡 | ✅ |
| CRM integrations (HubSpot, Salesforce, Zoho) | 🟡 | 🧑 | ✅ | ✅ |
| Public API + webhooks | 🟡 | ❌ | 🟡 | ✅ |
| Self-serve, transparent pricing | ✅ | ❌ | ❌ | ✅ |
| WhatsApp-first (India, LATAM, EU) | ❌ | ❌ | ❌ | ✅ |

## 5. Positioning recommendation

**"Anvita: the AI revenue team for growing businesses. It finds your customers, markets to them,
answers every enquiry, and turns conversations into revenue."**

Differentiators to lean on:
1. **One agent, one customer record across the funnel.** The agent that found the lead is the one
   that answers its reply, books the meeting and asks for the review.
2. **WhatsApp-first, multi-market.** Podium and Origami are US/SMS/email-centric.
3. **Agency outcomes at SaaS prices.** Productise Diffrent's service lines.
4. **Transparent self-serve pricing** with a credit model (Origami-style) on top of a flat platform fee.

## Sources
- [Origami launches chat-based AI tool for sales leads (IT Brief)](https://itbrief.news/story/origami-launches-chat-based-ai-tool-for-sales-leads)
- [What Is Origami? AI Prospecting Tool Review 2026](https://origami.chat/blog/what-is-origami-ai-prospecting-tool-review-2026)
- [Origami vs Clay 2026](https://origami.chat/blog/origami-vs-clay-comparison-2026)
- [origami.chat review: syncgtm](https://syncgtm.com/blog/origami-chat-review)
- [Origami review: toolradar](https://toolradar.com/tools/origami-chat)
- [Origami lead generation tool review: DIY Marketers](https://diymarketers.com/origami-lead-generation-tool-review/)
- [Origami review: citeware](https://citeware.io/products/origami)
- [Diffrent: official site](https://www.diffrent.ai/)
- [Podium AI Employee](https://www.podium.com/product/ai-employee/)
- [Podium homepage](https://podium.com)
- [Podium pricing: PricingSaaS](https://pricingsaas.com/companies/podium)
- [Podium AI Employee features in Signature plan: PricingSaaS](https://pricingsaas.com/companies/podium/diffs/2024Q3)
- [Podium pricing: Capterra](https://www.capterra.com/p/164285/Podium/pricing/)
- [Podium pricing: SocialPilot](https://www.socialpilot.co/reviews/podium-pricing)
- [Podium pricing: Quo](https://www.quo.com/blog/podium-pricing/)
- [Podium vs Reviews.io: WiserReview](https://wiserreview.com/blog/podium-vs-reviews-io/)
- [Podium reviews: G2](https://www.g2.com/products/podium/reviews)
