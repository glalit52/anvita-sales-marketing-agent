# 02 — Anvita Feature Catalog

This catalog merges every feature from Origami, Diffrent and Podium (see
[01-competitive-analysis.md](01-competitive-analysis.md)) into one product, grouped into **9 modules**.
Priority: **P0** = MVP, **P1** = next, **P2** = later. The source column shows which competitor
inspired each feature (O = Origami, D = Diffrent, P = Podium, ★ = Anvita original).

## M1. Workspace & onboarding
| # | Feature | Pri | Src |
|---|---|:-:|:-:|
| 1.1 | Sign-up (Google/Microsoft/email OTP), org → locations/brands → users | P0 | P |
| 1.2 | Roles: Owner, Admin, Manager, Agent (human), Viewer. Per-location access. | P0 | P |
| 1.3 | **Business profile auto-builder:** paste a website URL, then the AI crawls it and drafts the services, hours, FAQs, pricing, tone and ICP | P0 | ★ |
| 1.4 | Channel connection wizard (WhatsApp, SMS number, email inbox, website widget, Google Business Profile, Facebook/Instagram) | P0 | P |
| 1.5 | Industry templates (clinic, real estate, auto, education, home services, B2B SaaS, agri-input dealers) | P1 | P |
| 1.6 | Billing: platform plan + usage credits (Stripe / Razorpay) | P0 | O |

## M2. Prospecting (find)
| # | Feature | Pri | Src |
|---|---|:-:|:-:|
| 2.1 | Chat-based ICP search: "dental clinics in Pune with < 4★ rating" | P1 | O |
| 2.2 | Search planner agent: turns the prompt into a multi-source query plan the user can review | P1 | O |
| 2.3 | Source connectors: Google Places, web search, company registries (MCA/Companies House/OpenCorporates), job boards, app stores, Shopify detection | P1 | O |
| 2.4 | Results table with **AI columns** ("Does this clinic offer implants?" answered per row by reading the site) | P1 | O |
| 2.5 | Waterfall enrichment: email → verify, phone → verify, firmographics, tech stack | P1 | O |
| 2.6 | Signals & alerts: new hiring, funding, new review, new licence, matching new businesses | P2 | O |
| 2.7 | Dedupe against the CRM, suppression lists, do-not-contact | P1 | ★ |
| 2.8 | Lead scoring against the ICP (fit + intent) | P1 | ★ |

## M3. Outreach (engage, outbound)
| # | Feature | Pri | Src |
|---|---|:-:|:-:|
| 3.1 | Multi-step sequences: email, WhatsApp (template messages), SMS, LinkedIn tasks, call tasks | P1 | O |
| 3.2 | AI personalisation per lead (uses the enrichment + website research) | P1 | O |
| 3.3 | Mailbox connection (Gmail/Outlook OAuth, SMTP), rotation, daily limits, warm-up | P1 | O |
| 3.4 | Reply detection & classification (interested / not now / unsubscribe / OOO / wrong person). Replies land in the unified inbox. | P1 | ★ |
| 3.5 | Auto-pause on reply, bounce, unsubscribe. Compliance footer. | P1 | O |
| 3.6 | A/B testing of steps | P2 | O |

## M4. Marketing (attract)
| # | Feature | Pri | Src |
|---|---|:-:|:-:|
| 4.1 | Broadcast campaigns (WhatsApp/SMS/email) to segments, with scheduling | P1 | P |
| 4.2 | Segments built from CRM fields, tags, behaviour, or AI ("customers likely to churn") | P1 | P |
| 4.3 | **SEO & content agent:** keyword research → content calendar → brief → draft → publish (WordPress/Webflow) | P2 | D |
| 4.4 | **Ads co-pilot:** connect Google Ads / Meta. Get AI insights, budget-shift suggestions and ad-copy generation. Approve before changes go live. | P2 | D |
| 4.5 | Social post generator + scheduler (Instagram, Facebook, LinkedIn, GBP posts) | P2 | D |
| 4.6 | Landing-page / lead-form builder with UTM capture | P2 | D |

## M5. Conversations (engage, inbound)
| # | Feature | Pri | Src |
|---|---|:-:|:-:|
| 5.1 | **Unified inbox:** WhatsApp, SMS, email, webchat, Instagram/FB DMs, GBP messages, call logs, reviews | P0 | P |
| 5.2 | Website webchat widget (JS snippet). Continues on WhatsApp/SMS after the visitor leaves. | P0 | P |
| 5.3 | Assignment, internal notes, @mentions, snooze, tags, saved replies | P0 | P |
| 5.4 | Mobile app (iOS/Android) with push notifications | P1 | P |
| 5.5 | Click-to-WhatsApp / QR codes / missed-call → text-back | P1 | P |

## M6. AI Agent ("Anvita AI Employee")
| # | Feature | Pri | Src |
|---|---|:-:|:-:|
| 6.1 | Replies to every inbound message in < 60 s, 24/7, in the customer's language (incl. Hindi/Hinglish and regional languages) | P0 | P |
| 6.2 | Knowledge base (website, PDFs, FAQs, catalogue/inventory, price list) with citations | P0 | P |
| 6.3 | **Playbooks** (goal-driven skills): Qualify lead, Book appointment, Answer FAQ, Quote price, Collect payment, Request review, Re-engage, Handle complaint | P0 | P |
| 6.4 | Tools the agent can call: calendar availability/booking, CRM read/write, create payment link, create ticket, handoff to human | P0 | P |
| 6.5 | **Escalation rules:** keyword, sentiment, low confidence, VIP, explicit request → human. The agent drafts a summary for the human. | P0 | P |
| 6.6 | Copilot mode (AI drafts, human sends) vs Autopilot mode, per channel and per playbook | P0 | ★ |
| 6.7 | **Agent Studio:** sandbox chat, test scenarios, versioned prompts/playbooks, conversation QA scoring, analytics | P1 | P |
| 6.8 | AI voice agent: answers calls, books, transfers (Twilio/Exotel + streaming speech) | P2 | P |
| 6.9 | Follow-up memory: "Customer asked to call back next Tuesday" becomes a scheduled task | P1 | ★ |

## M7. Convert & retain
| # | Feature | Pri | Src |
|---|---|:-:|:-:|
| 7.1 | Scheduling: Google/Outlook calendars, staff/resource availability, booking page, reminders, reschedule by chat | P0 | P |
| 7.2 | Deals pipeline (Kanban), stages, values, owners | P1 | ★ |
| 7.3 | Text-to-Pay: payment links (Stripe / Razorpay / UPI), invoices, receipts | P1 | P |
| 7.4 | Review engine: post-visit review request, routing, monitoring (Google, Facebook, Justdial, Practo…), AI-drafted replies | P1 | P |
| 7.5 | NPS / CSAT surveys over WhatsApp | P2 | P |
| 7.6 | Re-engagement automations (win-back, renewal, service due) | P1 | P |

## M8. Analytics & attribution
| # | Feature | Pri | Src |
|---|---|:-:|:-:|
| 8.1 | Dashboard: leads, response time, AI resolution rate, bookings, revenue, reviews | P0 | P |
| 8.2 | Funnel attribution: source/UTM/ad → conversation → booking → payment | P1 | D |
| 8.3 | Prospecting & sequence metrics: open/reply/meeting rate per sequence and per ICP | P1 | O |
| 8.4 | Weekly AI-written "growth report" with recommendations | P1 | D |
| 8.5 | Custom reports & CSV export | P2 | D |

## M9. Platform
| # | Feature | Pri | Src |
|---|---|:-:|:-:|
| 9.1 | Integrations: HubSpot, Salesforce, Zoho, Pipedrive, Google Sheets, Shopify, WooCommerce, Calendly, Zapier/Make | P1 | P |
| 9.2 | Public REST API + webhooks | P1 | O |
| 9.3 | Workflow builder (trigger → condition → action), no-code | P1 | D |
| 9.4 | Audit log, data export, GDPR/DPDP deletion, consent records | P0 | ★ |
| 9.5 | White-label / agency mode (manage many client workspaces). This is the Diffrent use case as a product. | P2 | D |

## Pricing model (suggested)
| Plan | Who | Includes |
|---|---|---|
| **Starter** | Solo / single location | Inbox, webchat, WhatsApp, AI agent (Copilot), 500 AI conversations |
| **Growth** | SMB, multi-user | + Autopilot, booking, reviews, payments, campaigns, 2,000 AI conversations, prospecting credits |
| **Scale** | Multi-location / B2B sales teams | + Sequences, Agent Studio, integrations, API, voice minutes |
| **Agency** | Agencies (Diffrent-type) | White-label, client workspaces, rebilling |

Usage credits cover prospecting rows, enrichment lookups, AI conversations above the quota, voice
minutes, and WhatsApp/SMS pass-through costs.
