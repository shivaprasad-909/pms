# 🚀 PMS — Project Management System

A production-level, full-stack project management application with role-based access control, real-time collaboration, Kanban boards, sprint management, time tracking, and analytics.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 15 + React + TypeScript + Tailwind CSS |
| **Backend** | Express.js + TypeScript |
| **Database** | PostgreSQL + Prisma ORM |
| **State** | Zustand + TanStack Query |
| **Real-time** | Socket.IO |
| **Charts** | Recharts |
| **Auth** | JWT (Access + Refresh tokens) |

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database
- Redis (optional, for BullMQ queues)

### 1. Setup Database

Create a PostgreSQL database:
```sql
CREATE DATABASE pms_db;
```

### 2. Backend Setup

```bash
cd server

# Install dependencies
npm install

# Update .env with your PostgreSQL connection string
# DATABASE_URL="postgresql://username:password@localhost:5432/pms_db?schema=public"

# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed sample data
npm run db:seed

# Start development server
npm run dev
```

### 3. Frontend Setup

```bash
cd client

# Install dependencies
npm install

# Start development server
npm run dev
```

### 4. Access the App

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

### Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Founder | founder@acme.com | Password123 |
| Admin | admin@acme.com | Password123 |
| Manager | manager@acme.com | Password123 |
| Developer | dev1@acme.com | Password123 |
| Developer | dev2@acme.com | Password123 |

## Features

- ✅ Role-based dashboards (Founder, Admin, Manager, Developer)
- ✅ Project management with CRUD
- ✅ Kanban board with drag support
- ✅ Task management with comments and assignments
- ✅ Sprint management
- ✅ Time tracking
- ✅ Team management
- ✅ Activity audit logs
- ✅ Team messaging
- ✅ Calendar view
- ✅ Reports & analytics with charts
- ✅ Notification system
- ✅ Automation rules
- ✅ Document knowledge base
- ✅ JWT authentication with token refresh
- ✅ Permission-based UI rendering
