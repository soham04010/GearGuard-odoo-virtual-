# GearGuard – Intelligent Asset Maintenance Platform

GearGuard is a centralized asset intelligence platform designed to connect equipment, maintenance teams, and repair workflows. It streamlines industrial operations by tracking breakdowns, scheduling preventive maintenance, and providing real-time analytics on asset health.

## 📺 Project Demo

Watch the full walkthrough of GearGuard here:
**[View Loom Demo](https://www.loom.com/share/cf38a46e897c4508a00ad83d5d006aff)**

---

## 🚀 Key Features

* *Smart Inventory Management*: Real-time monitoring of physical assets with dynamic search and detail views.
* *Kanban Workflow*: A drag-and-drop board to manage the lifecycle of maintenance requests from "New" to "Repaired" or "Scrap".
* *Preventive Scheduler*: A dedicated calendar view to plan and track routine asset checkups.
* *Personalized Dashboard*: User-specific views that highlight active assignments and critical system alerts.
* *Performance Analytics*: Dynamic reporting on high-risk assets and team efficiency (Downtime vs. Repairs).
* *Automation Logic*: Moving a task to "Scrap" automatically marks the asset as unusable, and "Repaired" updates the last service timestamp.

---

## 🛠️ Tech Stack

### Frontend

* *Framework*: Next.js (App Router)
* *State Management*: TanStack Query (React Query)
* *UI Library*: Shadcn/UI & Tailwind CSS
* *Icons*: Lucide React

### Backend

* *Runtime*: Node.js with Express
* *Database*: PostgreSQL
* *ORM*: Drizzle ORM
* *Language*: TypeScript

---

## 🏃 Getting Started

### Prerequisites

* Node.js (v18+)
* PostgreSQL database instance

### 1. Database Setup

Ensure your PostgreSQL instance is running. Define your tables using the provided schema:

bash
# Navigate to backend and run migrations
npx drizzle-kit push:pg



### 2. Backend Installation

bash
cd gearguard-backend
npm install
# Create a .env file with your DATABASE_URL
npm run dev



### 3. Frontend Installation

bash
cd gearguard-frontend
npm install
# Ensure lib/api.ts points to your backend URL (http://localhost:3001/api)
npm run dev



---

## 🔄 Core Workflow

1. *Register Asset*: Add your machine with serial numbers, location, and work center details.
2. *Create Request*: Log a Corrective (breakdown) or Preventive (scheduled) request and assign a technician.
3. *Manage Board*: Move tasks through the Kanban stages.
4. *Analyze*: Use the Reporting tab to identify which equipment is costing the most in downtime.

---

## 🧠 Smart Buttons & Logic

GearGuard features "Odoo-like" smart buttons on every equipment form. These buttons display a live badge count of open requests for that specific machine and provide a direct link to the maintenance audit trail.
