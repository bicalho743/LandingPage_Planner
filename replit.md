# PlannerPro Organizer

## Overview

PlannerPro Organizer (also called "Planner Organizer" / "PlannerOrganiza") is a SaaS platform for professional organizers to manage their business. It features a landing page, subscription-based pricing (monthly, annual, lifetime plans with 7-day trial), Stripe payment processing, Firebase authentication, and a user dashboard. The application is a full-stack TypeScript project with a React frontend and Express backend, using PostgreSQL (via Neon) for data persistence.

The primary domain is `plannerorganiza.com.br` and the project targets Brazilian Portuguese-speaking users.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React SPA using Vite as the build tool
- **Routing**: Wouter (lightweight client-side router)
- **Styling**: Tailwind CSS with shadcn/ui component library (New York style)
- **State Management**: TanStack React Query for server state
- **Forms**: React Hook Form with Zod validation (via `@hookform/resolvers`)
- **Code Splitting**: Lazy-loaded routes with React.lazy/Suspense
- **Path Aliases**: `@/` maps to `client/src/`, `@shared/` maps to `shared/`
- **Source Location**: All frontend code lives in `client/src/`
- **Analytics**: Google Tag Manager, Google Analytics (G-DNEQ1CZ89E), Meta Pixel, and Brevo tracking are embedded in `client/index.html`

### Backend
- **Framework**: Express.js running on Node.js
- **Language**: TypeScript, compiled with esbuild for production and tsx for development
- **Module System**: ESM (`"type": "module"` in package.json)
- **Entry Point**: `server/index.ts`
- **Build Output**: `dist/index.js` (server) and `dist/public/` (client assets)
- **API Pattern**: RESTful routes organized into separate router files
- **Key Routes**:
  - `/api/register` – User registration + Stripe checkout creation
  - `/api/stripe-webhook`, `/api/stripe-webhook-new`, `/api/webhook-direto`, `/api/webhook-fixuser` – Multiple Stripe webhook endpoints (raw body parsing configured before JSON middleware)
  - `/api/trial-checkout` – Checkout with 7-day trial period
  - `/api/sync-user` – Sync users between database and Firebase
  - `/api/admin/users` – Admin user listing
  - `/api/admin/user` (DELETE) – Admin user deletion from Firebase
  - `/api/migrate` – Database migration endpoint
  - `/api/teste-email` – Test email sending via Brevo

### Database
- **Database**: PostgreSQL hosted on Neon (serverless Postgres)
- **ORM**: Drizzle ORM with `drizzle-kit` for schema management
- **Connection**: `node-postgres` (pg) Pool with SSL enabled, connection pooling configured
- **Schema Location**: `shared/schema.ts`
- **Key Tables**:
  - `users` – id, email, password, name, firebase_uid, status (enum: pendente/ativo/bloqueado), senha_hash, trial_start, trial_end, timestamps
  - `leads` – Marketing lead capture
  - `subscriptions` – User subscription data (plan_type enum: monthly/annual/lifetime, status enum: active/canceled/past_due/unpaid)
  - `contacts` – Contact form submissions
  - `tasks` – User tasks (referenced via relations)
- **Migrations**: `drizzle-kit push` for schema sync; also has manual migration endpoints and scripts
- **Schema Push Command**: `npm run db:push`

### Authentication
- **Provider**: Firebase Authentication (email/password)
- **Server-side**: Firebase Admin SDK initialized with service account credentials from `FIREBASE_ADMIN_CREDENTIALS` environment variable
- **Flow**: User registers → saved to PostgreSQL → payment via Stripe → webhook creates Firebase user → user can log in
- **Client-side**: Firebase client SDK configured via `VITE_FIREBASE_*` environment variables
- **Auth Context**: `client/src/lib/AuthContext` provides authentication state
- **Protected Routes**: `ProtectedRoute` component guards authenticated pages

### Payment Flow
- Users register with name, email, password, and selected plan
- Registration creates a user record in PostgreSQL and initiates a Stripe Checkout session
- Stripe webhooks process `checkout.session.completed` to create Firebase auth accounts and activate users
- Trial support: 7-day free trial on subscription plans via Stripe's trial_period_days
- Multiple webhook endpoints exist for different processing strategies (historical iterations)
- Raw body parsing is critical for Stripe signature verification and must be configured before `express.json()`

### Email System
- **Provider**: Brevo (formerly SendInBlue) via `sib-api-v3-sdk`
- **Capabilities**: Contact list management (list ID 7), transactional emails (welcome emails with password reset links)
- **Configuration**: `BREVO_API_KEY` environment variable

### Environment Configuration
The app distinguishes between development and production via `NODE_ENV`. Key environment variables:
- `DATABASE_URL` – PostgreSQL connection string
- `STRIPE_SECRET_KEY`, `STRIPE_PUBLIC_KEY` – Stripe API keys
- `STRIPE_PRICE_MONTHLY`, `STRIPE_PRICE_ANNUAL`, `STRIPE_PRICE_LIFETIME` – Stripe price IDs
- `STRIPE_WEBHOOK_SECRET` – Stripe webhook signing secret
- `FIREBASE_ADMIN_CREDENTIALS` – JSON string of Firebase service account
- `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_APP_ID` – Firebase client config
- `BREVO_API_KEY` – Brevo email API key

### Build & Development
- **Dev**: `npm run dev` → runs `tsx server/index.ts` with Vite dev server middleware (HMR)
- **Build**: `npm run build` → Vite builds frontend to `dist/public/`, esbuild bundles server to `dist/index.js`
- **Start**: `npm run start` → runs `node dist/index.js` in production mode
- **Type Checking**: `npm run check` → TypeScript compiler check

## External Dependencies

### Stripe
- Payment processing for subscription plans (monthly, annual, lifetime)
- Stripe Checkout (hosted) for payment collection
- Webhooks for event processing (checkout.session.completed, invoice.paid, subscription events)
- Client-side: `@stripe/stripe-js` and `@stripe/react-stripe-js`
- Server-side: `stripe` npm package

### Firebase
- Firebase Authentication for user login (email/password method)
- Firebase Admin SDK for server-side user management (create, delete, lookup users)
- No Firestore usage for data storage (PostgreSQL is used instead)

### Neon PostgreSQL
- Serverless PostgreSQL database
- Connected via `@neondatabase/serverless` and `pg` packages
- SSL required for connections
- Database name: configurable via `DATABASE_URL`

### Brevo (SendInBlue)
- Email marketing and transactional emails
- Contact management (adding leads to lists)
- SDK: `sib-api-v3-sdk`

### Drizzle ORM
- PostgreSQL ORM for type-safe database queries
- Schema defined in `shared/schema.ts`
- Config in `drizzle.config.ts`
- Uses `drizzle-zod` for schema-to-validation integration

### Analytics & Tracking
- Google Tag Manager (GTM-MWS7DRR3)
- Google Analytics 4 (G-DNEQ1CZ89E)
- Meta/Facebook Pixel (654529850558184)
- Brevo client-side tracking