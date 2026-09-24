# DemandDrop 🎙️

**Voice-powered demand tracking for India's small merchants .**

DemandDrop closes the gap between what customers ask for and what a neighbourhood shop stocks. A customer walks in, can't find a product, taps one button, and *says* what they wanted — in English, Hindi, or Hinglish. AI turns that messy sentence into a clean, structured stock request on the owner's dashboard. When the owner restocks the item and flips its status to **Just stocked**, every customer who left their number gets a WhatsApp message: *"Good news! It's back in stock."*

---

## The Problem

India's ~12 million kirana stores lose sales every day to a silent failure: a customer asks for something that's out of stock, the owner nods, and the demand evaporates.

- No pen-and-paper system captures it reliably.
- Owners can't type English product names quickly, and customers won't fill forms.
- Even when the item is restocked, the customer who asked never finds out — the sale (and the loyalty) is lost.

## The Solution

A two-sided flow that takes **under 10 seconds** for the customer:

1. **Customer side (a phone at the counter):** Tap the mic, say *"woh Maggi wala noodles nahi mila"* or type it. Done.
2. **AI pipeline:** Speech is transcribed, then an LLM extracts a clean, standardised product name and category (`"Brown Bread"`, `"Bakery"`) from the messy input — handling English, Hindi, and Hinglish.
3. **Stock alert opt-in:** The customer can leave their WhatsApp number to be told when the item is back.
4. **Owner dashboard:** Requests are grouped by product and ranked by demand count, so the owner sees *what to order first*. Each product shows how many customers are waiting and lists their WhatsApp numbers.
5. **The loop closes:** The owner can set a product's status to **Just stocked** to send alerts automatically, or press **Send WhatsApp** to notify everyone waiting without changing the status. Each customer is notified exactly once.

No app install, no login, no training. One button.

## Key Features

| Feature | Details |
|---|---|
| 🎤 One-tap voice capture | Web Audio recording with live level meter; falls back to typing |
| 🌏 Multilingual AI | Transcription + product extraction tuned for English / Hindi / Hinglish kirana speech |
| 🧹 Smart normalisation | Messy speech → clean retail name + category (`Dairy`, `Bakery`, `Beverages`, `Snacks`, `Staples`, `Personal Care`, `Household`) |
| 📊 Demand-ranked dashboard | Products grouped and sorted by request count, with clear status colors: **Just stocked** is green and **Ignored** is red |
| 📱 Visible waiting contacts | Each product shows the WhatsApp numbers of customers still waiting for its stock alert |
| 💬 WhatsApp stock alerts | Send automatically when marked **Just stocked**, or manually with the per-product **Send WhatsApp** button; each customer is notified once |
| 🔒 Locked-down data | All database access is server-side; the browser has zero direct table access |

## Tech Stack

- **Framework:** TanStack Start v1 (React 19, SSR) + Vite 7
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **Backend:** Lovable Cloud (Supabase Postgres, Row Level Security, server functions via `createServerFn`)
- **AI:** Lovable AI Gateway — `google/gemini-3.5-transcribe` (speech-to-text) + `google/gemini-3.8-flash` (structured product extraction)
- **Messaging:** Meta WhatsApp Cloud API (`graph.facebook.com/v21.0`)

## Architecture

```text
Customer phone (counter)
   │  voice / text
   ▼
submitDemand (server function)
   ├── Gemini transcription      → transcript
   ├── Gemini product extraction → { product_name, category, confidence }
   ▼
Postgres: demand_requests  (RLS locked, service-role only)
   ▲
Owner dashboard ── polls listDemands every 2s
   │  "Just stocked" or "Send WhatsApp"
   ▼
WhatsApp Cloud API ── template message to each waiting customer
   └── notified_at stamped so nobody is messaged twice
```

**Security model:** the `demand_requests` table has RLS enabled with *no* client policies — every read and write flows through validated server functions (`submitDemand`, `listDemands`, `setDemandStatus`, `saveNotifyNumber`, `notifyDemandCustomers`). Phone numbers are normalised to WhatsApp's international format and validated server-side. Manual sends accept only validated request IDs and are limited to 200 recipients per action.

## Owner Dashboard Workflow

1. Open `/dashboard` to see live customer requests, grouped by product and ranked by demand.
2. Check the waiting-customer line beneath a product to see every WhatsApp number that has opted in and has not yet been notified.
3. Choose a stock state from the dropdown:
   - **New** — newly requested.
   - **Ordering now** — the owner is sourcing the item.
   - **Just stocked** — shown in green; saves the status and immediately sends the stock alert.
   - **Ignored** — shown in red.
4. Alternatively, press **Send WhatsApp** beside any product to alert its waiting customers directly.
5. The dashboard reports how many messages succeeded or failed, then removes successfully notified contacts from the waiting list.

## Running Locally

```sh
# prerequisites: Node.js 20+ (or Bun)
npm install        # or: bun install
npm run dev        # starts on http://localhost:8080
```

You'll need a `.env` with:

```sh
# Lovable Cloud / Supabase (auto-provided in Lovable)
SUPABASE_URL=...
SUPABASE_PUBLISHABLE_KEY=...

# Lovable AI Gateway (auto-provided in Lovable)
LOVABLE_API_KEY=...

# WhatsApp alerts (optional — app works without them)
WHATSAPP_ACCESS_TOKEN=<Meta app access token>
WHATSAPP_PHONE_NUMBER_ID=<WhatsApp Business phone number ID>
WHATSAPP_TEMPLATE_NAME=stock_alert   # optional, defaults to "stock_alert"
```

The WhatsApp template body expects one `{{1}}` parameter (the product name), e.g.:

> *"Good news! {{1}} is back in stock at our store. Come by anytime."*

## Project Structure

```text
src/
├── routes/
│   ├── index.tsx          # Customer screen: mic, text fallback, WhatsApp opt-in
│   ├── dashboard.tsx      # Owner dashboard: demand ranking, status, alerts
│   └── __root.tsx         # App shell
├── lib/
│   ├── demand.functions.ts  # Server functions: AI pipeline, DB, WhatsApp send
│   └── useRecorder.ts       # Microphone hook (Web Audio)
└── integrations/supabase/   # Generated client + types
supabase/migrations/         # demand_requests schema + RLS lockdown
```

## Hackathon Highlights

- **Real problem, real scale:** 12M+ kirana stores; zero training or literacy required.
- **AI where it matters:** not a chatbot gimmick — AI converts chaotic multilingual speech into *structured, actionable inventory data*.
- **Closed revenue loop:** doesn't just record demand — it brings the customer back, measurably, via WhatsApp.
- **Demo in 10 seconds:** tap mic → speak → add a WhatsApp number → watch the dashboard update → click **Send WhatsApp** or mark **Just stocked** → alert fires.

## Roadmap

- Multi-shop support with owner auth
- SMS fallback for non-WhatsApp numbers
- Demand analytics over time (seasonality, reorder suggestions)
- Direct distributor/wholesaler ordering from the dashboard

---

*Built with Lovable. Demo: [demand-drop.lovable.app](https://demand-drop.lovable.app)*
