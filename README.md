# Xeno Pulse AI — Autonomous Shopper Growth Engine

Built as a submission for the **Xeno Engineering Take-Home Assignment**.

## Overview
Xeno Pulse AI goes beyond a traditional CRM. It is an **AI-Native Autonomous Growth Platform** designed to act as a digital marketer for a brand. Instead of manually creating segments and sending campaigns, the platform uses a **Multi-Agent LLM architecture** to analyze customer data, proactively identify opportunities, generate behavioral personas, craft tailored messaging, simulate delivery across multiple channels, and continuously learn from real-time campaign results.

> **Tagline:** *"Set goals, not campaigns."*

---

## Evaluation Focus Areas
This submission was built specifically to address the core evaluation criteria of the assignment:

1. **Creativity in Scoping:** It isn't just a basic CRUD CRM where a user clicks "Upload CSV → Create Segment → Send". It's an autonomous loop that discovers opportunities and executes them on your behalf.
2. **AI-Native Thinking:** Uses LLMs (Google Gemini) as intelligent agents that orchestrate complex workflows, explain their reasoning, and predict outcomes, rather than just generating text snippets.
3. **System Design:** The delivery pipeline is decoupled into a separate microservice (`channel-service`). This service acts as a simulated telecom provider, introducing realistic network delays, probabilistic conversions, and asynchronous webhooks back to the core API.
4. **Product Thinking:** Features a premium, high-fidelity UI/UX that feels like a polished, market-ready D2C SaaS platform, complete with bespoke CSS, digital twins, and Sankey-style data visualizations.

---

## The 12 Core Features Built

| Feature | Description |
|---------|-------------|
| **1. AI Opportunity Discovery** | AI continuously scans the MongoDB data to surface proactive revenue opportunities (e.g., "Win-back 132 Churning VIPs for ₹87,000 potential revenue"). |
| **2. NL Audience Builder** | Natural language inputs ("Find customers who spent over ₹5000 but haven't ordered in 90 days") are automatically translated into precise MongoDB queries. |
| **3. AI Customer Personas** | Automatically clusters raw rows of customer data into human-readable behavioral "tribes" (e.g., "Weekend Coffee Lovers"). |
| **4. Campaign Co-Pilot** | Provides a goal, and the AI suggests the target audience, preferred channel, message copy, and predicted conversion rates. |
| **5. Campaign Simulator** | Predicts open, click, and conversion rates per channel (WhatsApp vs SMS vs Email) based on historical data *before* sending. |
| **6. Message Tournament** | Generates A/B/C/D message variants with different tones (Urgent, FOMO, Casual) and predicts the winning copy. |
| **7. Multi-Agent Architecture** | 5 specialized AI agents orchestrated in sequence: Audience, Campaign, Channel, Analytics, and Optimization. |
| **8. Customer Digital Twin** | Every customer gets a detailed, AI-generated behavioral profile (Churn Risk, LTV Prediction, Preferred Channel) updated in real time. |
| **9. Autonomous Campaign Mode** | Give the AI a revenue goal (e.g., "Increase revenue by ₹50K"), and it generates an entire multi-campaign plan across different segments. |
| **10. AI Explainability** | Every AI recommendation includes a transparent reasoning panel and a confidence score to build user trust. |
| **11. Journey Visualization** | Real-time Sankey-style funnel rendering the campaign lifecycle: Sent → Delivered → Opened → Clicked → Purchased. |
| **12. Self-Learning Engine** | Post-campaign analysis translates results into actionable insights to improve future campaigns. |

---

## Architecture

The project is a mono-repo containing three main components:

### 1. `client` (Frontend)
- **Tech Stack:** React 18, Vite, React Router DOM, Tailwind CSS + Custom CSS.
- Features a massive design system, responsive UI, interactive dashboards, and a full-screen AI Growth Agent chat interface.

### 2. `server` (Main Backend)
- **Tech Stack:** Node.js, Express.js, MongoDB Atlas, Google Gemini API.
- Houses the REST API and the **Multi-Agent Orchestrator**.
- Manages the core entities (Customers, Orders, Segments, Campaigns) and the intelligence loop.

### 3. `channel-service` (Mock Delivery Microservice)
- **Tech Stack:** Node.js, Express.js.
- Simulates a real-world communications provider (like Twilio).
- Receives `POST /send` payloads, introduces asynchronous delays, calculates probabilistic success funnels, and fires `POST /api/receipt` webhooks back to the main server.

---

## Prerequisites
- Node.js (v18+)
- MongoDB Atlas cluster URL
- Google Gemini API Key (for the multi-agent AI system)

---

## Running Locally

### 1. Install Dependencies
Install packages for all three services:
```bash
cd client && npm install
cd ../server && npm install
cd ../channel-service && npm install
```

### 2. Configure Environment Variables
- **In `server/.env`:**
  ```env
  PORT=5000
  MONGO_URI=your_mongodb_connection_string
  GEMINI_API_KEY=your_gemini_api_key
  CHANNEL_SERVICE_URL=http://localhost:5001
  ```
- **In `channel-service/.env`:**
  ```env
  PORT=5001
  WEBHOOK_SECRET=xeno_secret_token_123
  ```
- **In `client/.env`:**
  ```env
  VITE_API_URL=http://localhost:5000
  ```

### 3. Seed the Database
Generate 500+ realistic customers and 6,000+ orders:
```bash
cd server
node seed.js
```

### 4. Start the Services
You will need three separate terminal windows:
```bash
# Terminal 1 - Main API Server
cd server
node server.js

# Terminal 2 - Channel Service (Delivery simulator)
cd channel-service
node server.js

# Terminal 3 - Frontend Client
cd client
npm run dev
```

### 5. Open the Application
Navigate to `http://localhost:5173` in your browser.

---
*Built with ❤️ for the Xeno Engineering Team.*
