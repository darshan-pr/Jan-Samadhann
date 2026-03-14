# Jan Samadhan

Jan Samadhan is a citizen-to-government digital grievance platform where users can report civic issues, track updates, and engage with community posts, while administrators triage, route, and resolve cases through a dedicated operations dashboard.

## Tech Stack

<p>
	<img alt="Next.js" src="https://img.shields.io/badge/NEXT.JS-111827?style=for-the-badge&logo=nextdotjs&logoColor=white" />
	<img alt="React" src="https://img.shields.io/badge/REACT-0EA5E9?style=for-the-badge&logo=react&logoColor=white" />
	<img alt="TypeScript" src="https://img.shields.io/badge/TYPESCRIPT-2563EB?style=for-the-badge&logo=typescript&logoColor=white" />
	<img alt="Convex" src="https://img.shields.io/badge/CONVEX-7C3AED?style=for-the-badge&logoColor=white" />
	<img alt="Tailwind CSS" src="https://img.shields.io/badge/TAILWIND_CSS-0D9488?style=for-the-badge&logo=tailwindcss&logoColor=white" />
</p>

## Core Capabilities

- **Dual-role experience**: Citizen flow and administrator flow with role-based routing.
- **Issue reporting lifecycle**: Create posts with issue type, location, priority, and media.
- **Emergency reporting**: Dedicated emergency intake with urgency levels and rapid routing support.
- **Real-time civic feed**: Likes, reposts, bookmarks, comments, and status updates.
- **Operational dashboards**: Admin overview, analytics, high-priority queue, and department management.
- **Notification system**: User-specific notifications for status changes, comments, and engagement actions.
- **Geo-assisted reporting**: Browser geolocation + reverse geocoding for improved location accuracy.
- **AI-assisted writing (optional)**: Gemini integration to improve complaint text and suggest hashtags.

## Product Modules

### Citizen-facing
- `/signup` – account creation using name, phone, and city.
- `/login` – user login by phone.
- `/dashboard` – main community feed and post creation.
- `/explore` – discover/filter reports across cities and statuses.
- `/posts` – user’s own reports and activity.
- `/emergency` – emergency report submission and tracking.

### Admin-facing
- `/login` (administrator mode) – email/password admin login.
- `/admin` – operational console with:
	- Overview and KPIs
	- High-priority reports (10+ likes)
	- All reports table
	- Emergency management
	- Department routing and monitoring
	- Analytics view

## Architecture Overview

- **Frontend**: Next.js App Router (`app/`) with React 19 + TypeScript.
- **Backend/Data**: Convex functions (`convex/`) for queries, mutations, storage, and business rules.
- **State/Auth**:
	- Convex hooks (`useQuery`, `useMutation`) for reactive data.
	- Client-side session context (`app/lib/auth.tsx`) using localStorage.
- **Media**: Convex file storage for post and emergency photos.
- **Styling**: Tailwind CSS 4 with responsive, mobile-first UI patterns.

## Data Domain (Convex)

Major tables in `convex/schema.ts`:

- `users`, `admins`
- `posts`, `userVotes`
- `comments`, `commentLikes`
- `photos`
- `notifications`
- `departments`, `departmentRouting`, `departmentPerformance`
- `hashtags`, `postHashtags`, `replies`

This model supports full report lifecycle management, social interactions, notifications, and department operations.

## Local Setup

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment

Copy `.env.example` to `.env.local` and update values:

```bash
cp .env.example .env.local
```

Required / optional variables:

| Variable | Required | Purpose |
| --- | --- | --- |
| `CONVEX_DEPLOYMENT` | Yes | Convex deployment target for CLI commands |
| `NEXT_PUBLIC_CONVEX_URL` | Yes | Public Convex endpoint used by the web app |
| `NEXT_PUBLIC_MAPTILER_API_KEY` | Optional | Satellite map preview in post composer/modal |
| `NEXT_PUBLIC_GEMINI_API_KEY` | Optional | AI-assisted complaint refinement + hashtag generation |

### 3) Start Convex dev backend

```bash
npx convex dev
```

### 4) Bootstrap initial data (recommended)

Create default admin:

```bash
npx convex run admins:createDefaultAdmin
```

Seed core departments:

```bash
npx convex run seedDepartments:seedCoreDepartments
```

### 5) Start frontend

```bash
npm run dev
```

Open http://localhost:3000

## Scripts

- `npm run dev` – run Next.js dev server (Turbopack).
- `npm run build` – production build.
- `npm start` – start production server.
- `npm run lint` – run ESLint.

## Demo Credentials (Development)

After running `admins:createDefaultAdmin`:

- **Admin Email**: `admin@jansamadhan.com`
- **Admin Password**: `admin123`

> Note: This credential is for local development only. Use secure authentication and hashed passwords in production.

## Repository Structure

```text
rectify/
├── app/                 # Next.js App Router pages, layouts, UI components
├── convex/              # Convex schema, queries, mutations, seed utilities
├── public/              # Static assets and PWA manifest
├── package.json         # Scripts and dependencies
└── .env.example         # Environment variable template
```

## Deployment Notes

- Deploy the Next.js app to Vercel (or equivalent Node-compatible hosting).
- Deploy/sync Convex functions and schema with Convex CLI.
- Configure production environment variables for both frontend and Convex deployment.
- Replace development admin/password patterns with secure, production-grade authentication.

## License

No license file is currently provided in this repository.
