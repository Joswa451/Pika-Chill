# Pika-Chill
pika chill store

Web-based online ordering system with inventory and sales management for **Pika-Chill**.

## Project Overview
Pika-Chill allows customers to browse the menu, place orders, and track order status, while giving admins tools to manage products, orders, inventory, and sales — all through a centralized web platform.

## Tech Stack
- **Frontend:** React.js, Tailwind CSS
- **Backend:** Node.js, Express.js
- **Database & Services:** Supabase (PostgreSQL, Auth, Realtime)
- **Design:** Figma
- **API Testing:** Postman

## Scope
- Pickup only — cash payment at counter (no online payment)
- CUSTOMER and ADMIN roles only
- Per-product inventory tracking (no ingredient-level breakdown)
- In-app notifications via Supabase Realtime

## Project Structure
Pika-Chill/
├── frontend/ → React app
├── backend/ → Express API
├── database/ → ERD, schema docs, seed data (actual DB hosted on Supabase)
└── docs/ → system flow, UI/UX, screenshots


## Getting Started

### Frontend
\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`


### Backend
\`\`\`bash
cd backend
npm install
npx nodemon src/server.js
\`\`\`


### Environment Variables
Create `.env` files in both `frontend/` and `backend/` — see `.env.example` in each folder for required keys. **Never commit `.env` files.**

## Status
In Development
