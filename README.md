# Northpath

Multi-account LinkedIn management tool with posting, analytics, and post scheduling.

## Features

- **Multi-Account Management** — Connect and manage multiple LinkedIn accounts from a single dashboard
- **Post Composer** — Create and edit LinkedIn posts with rich text and media support
- **Post Scheduling** — Schedule posts for optimal engagement times across accounts
- **Analytics Dashboard** — Track impressions, engagement, clicks, and follower growth per account
- **Content Calendar** — Visual calendar view of scheduled and published posts

## Tech Stack

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Next.js API Routes, Prisma ORM
- **Database:** PostgreSQL
- **Auth:** NextAuth.js
- **Queue:** BullMQ + Redis (post scheduling)
- **LinkedIn API:** OAuth 2.0, Share API, Analytics API

## Project Structure

```
northpath/
├── src/
│   ├── app/                  # Next.js App Router pages
│   │   ├── (auth)/           # Auth pages (login, signup)
│   │   ├── (dashboard)/      # Dashboard pages
│   │   │   ├── accounts/     # Account management
│   │   │   ├── analytics/    # Analytics views
│   │   │   ├── calendar/     # Content calendar
│   │   │   ├── compose/      # Post composer
│   │   │   └── schedule/     # Scheduling management
│   │   └── api/              # API routes
│   │       ├── auth/         # Auth endpoints
│   │       ├── accounts/     # Account CRUD
│   │       ├── posts/        # Post CRUD & publishing
│   │       ├── schedule/     # Scheduling endpoints
│   │       └── analytics/    # Analytics endpoints
│   ├── components/           # Shared UI components
│   ├── lib/                  # Utilities, LinkedIn API client, db
│   ├── hooks/                # Custom React hooks
│   └── types/                # TypeScript type definitions
├── prisma/                   # Database schema & migrations
├── workers/                  # BullMQ job processors
└── public/                   # Static assets
```

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL
- Redis
- LinkedIn Developer App (OAuth credentials)

### Setup

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Fill in your LinkedIn OAuth credentials, database URL, etc.

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

## Environment Variables

See `.env.example` for all required configuration.

## License

MIT
