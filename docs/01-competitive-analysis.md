# 01 — Competitive Analysis: Origami, Different, Podium

> Research date: October 2026. Origami and Podium don't publish full pricing, and third-party sources
> disagree, so every price below is indicative. Confirm on the vendor sites before relying on it.

## TL;DR

The three companies cover **three different parts of the revenue funnel**:

| | **Origami** (origami.chat) | **Different** (different.ai) | **Podium** (podium.com) |
|---|---|---|---|
| **Funnel stage** | Top of funnel: *find* customers (outbound) | Middle: *attract* demand (marketing campaigns) | Bottom: *convert & retain* customers (inbound) |
| **What it is** | Self-serve AI prospecting SaaS | AI marketing system that runs B2B demand generation end to end (SaaS; came out of stealth Oct 2026) | AI-first customer-interaction platform for local businesses |
| **Core promise** | "Describe your ideal customer in plain English → get a verified lead list in minutes" | "An AI marketing team that plans, creates, launches and optimises campaigns across ads, email, landing pages and AEO, and you approve before anything goes live" | "Your AI Employee answers every lead in under a minute, books the appointment, collects the review and the payment" |
| **Buyer** | Founders, SDRs, agencies, B2B sales teams selling to SMBs | Lean B2B marketing teams (e.g. 3-person teams at SaaS companies) | Local SMBs: auto dealers, home services, med-spa, dental, retail |
| **Pricing (indicative)** | Free tier (~1,000 one-time credits). Paid plans reported from ~$29–$99/mo, credit-based, not per-seat | Not public (sales-led; $48M seed from General Catalyst and Lightspeed) | ~$399/mo (Core), ~$599/mo (Pro), Signature on quote. AI Employee on higher tiers |
| **AI usage** | Agents that crawl the live web, enrich data, and write outreach | Multi-channel campaign agents working from a shared memory of strategy, brand and results | Conversational agent (text + voice) that runs the playbooks, plus AI review replies |

**The opportunity for Anvita:** no single product covers *find → attract → engage → convert → retain*
end to end with one AI agent and one customer record. Origami stops once the list is exported or the
sequence is sent. Podium only starts once the customer contacts you. Different generates demand but
hands the resulting leads to someone else's CRM and sales team, and it targets B2B marketers, not the
business owner. A product that covers all three stages, on one customer record, is the gap.

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

## 2. Different (different.ai)

**Category:** AI demand-generation / "AI marketing team" platform for B2B (competes with HubSpot
Marketing Hub AI, 6sense, Jasper, Mutiny-style tools).

### Company
- San Francisco. Came out of stealth on **20 Oct 2026** with a **$48M seed** led by General Catalyst, with
  Lightspeed participating.
- Founded by **Ajeet Singh**, co-founder of Nutanix and ThoughtSpot.
- Positioning: *"the AI marketing system that runs B2B demand gen end to end"* for **lean marketing
  teams**.

### How it works
1. **Shared memory.** The system holds the company's strategy, ICP, brand voice and past results in one
   place, and every agent works from it.
2. **Plan.** AI proposes campaigns: goal, audience, channels and budget.
3. **Audience selection.** It picks the target accounts and segments for each campaign.
4. **Create.** It generates the assets: **ads**, **emails** and **landing pages**.
5. **Approve.** Marketers **review and approve everything before it goes live** (human-in-the-loop).
6. **Launch & optimise.** It runs the campaigns and moves budget and targeting based on results. What it
   learns on one channel is applied to the others.
7. **Answer-engine optimisation (AEO).** It optimises content so the brand shows up in AI answers
   (ChatGPT, Perplexity, Google AI Overviews), not just in classic SEO.

### Claimed results (company-reported, not independently verified)
- **Motif:** a 3-person team went from running 1 campaign at a time to **12+ campaigns across 4
  channels** in one month.
- **Descope:** found and redirected **60% of paid spend** that was wasted on poor targeting.

### Feature list
- Campaign planner from goals and strategy memory
- Audience/segment selection
- Ad creative + copy generation and launch (paid search and social)
- Email campaign generation
- Landing page generation
- AEO (AI-search visibility) content
- Cross-channel optimisation loop (results → budget and targeting changes)
- Approval workflow before anything ships

### Strengths / weaknesses
- ✅ Strong founder and funding. Agentic "does the work" positioning instead of "assists the marketer".
  Cross-channel memory. AEO is an early, differentiated wedge.
- ❌ Very new: no public pricing, integrations list or independent reviews yet. Crowded category, with
  HubSpot, Salesforce and 6sense all adding AI. Stops at the lead: there's no inbox, AI replies, booking or
  payments. B2B-only; not built for SMBs or WhatsApp markets.

### What to take from it
- **A strategy-memory "brain"** shared by every Anvita agent (marketing, outbound, inbox), so voice,
  offers and learnings stay consistent across channels.
- **Campaign planner → asset generation → approve → launch → optimise** as the core UX of Anvita's
  Marketing module. The Ads co-pilot, SEO/AEO and landing-page screens follow this loop.
- **An approval queue** for every AI-generated asset or spend change, with an audit log and revert.
- **Closed-loop optimisation.** Anvita can go further than Different because it owns the conversation,
  the booking and the payment, so it optimises on *cost per booked/paid customer*, not cost per lead.

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

Legend: ✅ strong · 🟡 partial / basic · ❌ none · ❓ not publicly documented yet

| Capability | Origami | Different | Podium | **Anvita (target)** |
|---|:-:|:-:|:-:|:-:|
| Natural-language lead search | ✅ | ❌ | ❌ | ✅ |
| Live web / Maps / registry crawling | ✅ | ❌ | ❌ | ✅ |
| Contact enrichment + verification waterfall | ✅ | ❌ | ❌ | ✅ |
| Outbound sequences (email / LinkedIn) | 🟡 | 🟡 | ❌ | ✅ (+ WhatsApp) |
| Paid-ads creation, launch & optimisation | ❌ | ✅ | ❌ | 🟡 → ✅ |
| SEO / content generation | ❌ | ✅ | ❌ | ✅ |
| Answer-engine optimisation (AEO) | ❌ | ✅ | ❌ | ✅ |
| Landing page generation | ❌ | ✅ | ❌ | ✅ |
| Campaign planner + shared strategy/brand memory | ❌ | ✅ | ❌ | ✅ |
| Approval workflow for AI-generated assets | ❌ | ✅ | 🟡 | ✅ |
| Website webchat widget | ❌ | ❌ | ✅ | ✅ |
| Unified inbox (SMS, WhatsApp, email, social) | ❌ | ❌ | ✅ | ✅ |
| AI agent replies 24/7 (text) | ❌ | ❌ | ✅ | ✅ |
| AI voice agent (calls) | ❌ | ❌ | ✅ | ✅ (phase 3) |
| Appointment booking | ❌ | ❌ | ✅ | ✅ |
| Reviews: request + AI reply | ❌ | ❌ | ✅ | ✅ |
| Text-to-pay / invoices | ❌ | ❌ | ✅ | ✅ |
| Broadcast campaigns + segments | ❌ | 🟡 (email) | ✅ | ✅ |
| Agent sandbox / evals / escalation rules | ❌ | ❌ | ✅ | ✅ |
| Full-funnel attribution (ad → lead → revenue) | ❌ | 🟡 | 🟡 | ✅ |
| CRM integrations (HubSpot, Salesforce, Zoho) | 🟡 | ❓ | ✅ | ✅ |
| Public API + webhooks | 🟡 | ❓ | 🟡 | ✅ |
| Self-serve, transparent pricing | ✅ | ❌ | ❌ | ✅ |
| WhatsApp-first (India, LATAM, EU) | ❌ | ❌ | ❌ | ✅ |

## 5. Positioning recommendation

**"Anvita: the AI revenue team for growing businesses. It finds your customers, markets to them,
answers every enquiry, and turns conversations into revenue."**

Differentiators to lean on:
1. **One agent, one customer record across the funnel.** The agent that found the lead is the one
   that answers its reply, books the meeting and asks for the review.
2. **WhatsApp-first, multi-market.** Podium and Origami are US/SMS/email-centric.
3. **Demand gen that's measured on revenue.** Do what Different does for campaigns, but optimise on booked
   and paid customers, because Anvita owns the conversation, booking and payment.
4. **Transparent self-serve pricing** with a credit model (Origami-style) on top of a flat platform fee.

## Sources
- [Origami launches chat-based AI tool for sales leads (IT Brief)](https://itbrief.news/story/origami-launches-chat-based-ai-tool-for-sales-leads)
- [What Is Origami? AI Prospecting Tool Review 2026](https://origami.chat/blog/what-is-origami-ai-prospecting-tool-review-2026)
- [Origami vs Clay 2026](https://origami.chat/blog/origami-vs-clay-comparison-2026)
- [origami.chat review: syncgtm](https://syncgtm.com/blog/origami-chat-review)
- [Origami review: toolradar](https://toolradar.com/tools/origami-chat)
- [Origami lead generation tool review: DIY Marketers](https://diymarketers.com/origami-lead-generation-tool-review/)
- [Origami review: citeware](https://citeware.io/products/origami)
- [Different: official site](https://www.different.ai/)
- [Introducing Different: $48M to change how B2B marketing gets done](https://www.different.ai/blog/introducing-different)
- [Different emerges from stealth with $48M (Yahoo Finance)](https://finance.yahoo.com/technology/ai/articles/different-emerges-stealth-48m-ai-100000584.html)
- [Different exits stealth with $48M seed (Dealroom)](https://dealroom.co/news/164349-different-exits-stealth-with-48m-seed-to-automate-b2b-demand-generation/)
- [Different raises $48M seed (MarTech Edge)](https://martechedge.com/news/different-raises-48m-seed-to-automate-end-to-end-ai-marketing)
- [Different emerges from stealth (Let's Data Science)](https://letsdatascience.com/news/different-emerges-from-stealth-with-48m-seed-for-ai-demand-g-d2433642)
- [Nutanix founder Ajeet Singh floats Different (Inc42)](https://inc42.com/buzz/nutanix-founder-ajeet-singh-floats-new-ai-martech-startup-different/)
- [Podium AI Employee](https://www.podium.com/product/ai-employee/)
- [Podium homepage](https://podium.com)
- [Podium pricing: PricingSaaS](https://pricingsaas.com/companies/podium)
- [Podium AI Employee features in Signature plan: PricingSaaS](https://pricingsaas.com/companies/podium/diffs/2024Q3)
- [Podium pricing: Capterra](https://www.capterra.com/p/164285/Podium/pricing/)
- [Podium pricing: SocialPilot](https://www.socialpilot.co/reviews/podium-pricing)
- [Podium pricing: Quo](https://www.quo.com/blog/podium-pricing/)
- [Podium vs Reviews.io: WiserReview](https://wiserreview.com/blog/podium-vs-reviews-io/)
- [Podium reviews: G2](https://www.g2.com/products/podium/reviews)
