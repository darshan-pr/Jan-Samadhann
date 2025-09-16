# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Rectify is a community-driven problem-solving platform built with Next.js 15, React 19, and Convex for the backend. The application enables users to report and track local infrastructure issues like potholes, water problems, and street lighting issues.

## Core Technologies

- **Framework**: Next.js 15 with Turbopack
- **React**: Version 19
- **Backend**: Convex (real-time backend platform)
- **Styling**: TailwindCSS 4
- **TypeScript**: Full TypeScript support
- **Linting**: ESLint with Next.js config

## Development Commands

- `npm run dev`: Start development server with Turbopack
- `npm run build`: Build production application with Turbopack  
- `npm start`: Start production server
- `npm run lint`: Run ESLint for code quality

### Convex Backend Commands
- `npx convex dev`: Start Convex development server (run alongside npm run dev)
- `npx convex deploy`: Deploy backend functions to production
- `npx convex docs`: Open Convex documentation
- `npx convex dashboard`: Open Convex dashboard
- `npx convex logs`: View backend function logs

## Project Architecture

### App Router Structure
- Uses Next.js 15 App Router (app directory)
- Main entry point: `app/page.tsx` - Authentication router (redirects to signup/dashboard/admin)
- Layout: `app/layout.tsx` - Root layout with Convex and Auth providers
- **Pages**: `/signup`, `/login`, `/dashboard` (users), `/admin` (administrators)

### Key Features
- **Authentication System**: Phone-based user signup and role-based admin login
- **Community Reporting**: Users can report infrastructure issues with location and categorization
- **Location Services**: Automatic geolocation with fallback to manual entry
- **Real-time Updates**: Upvoting and community interaction on reports
- **Admin Dashboard**: Status management and report filtering for administrators
- **Responsive Design**: Mobile-first UI optimized for mobile web app

### State Management
- React hooks (useState, useEffect) for local state
- Authentication context provider for user sessions
- Convex for backend data persistence
- localStorage for client-side report caching

### Convex Integration
- Backend functions should be written in `convex/` directory
- Generated types available in `convex/_generated/`
- Database schema defined in `convex/schema.ts`
- Function patterns: queries for reading data, mutations for writing data
- Import from `./_generated/server` for query/mutation functions
- Use `useQuery` and `useMutation` hooks in React components
- File storage handled through Convex's built-in storage system

### Data Models
- **Users**: name, phone, city, role (stored in Convex) - indexed by phone
- **Admins**: email, password, role (stored in Convex) - indexed by email
- **Posts**: Main entity for issue reports with status, priority, likes, coordinates
- **Comments**: User and admin comments on posts with like functionality
- **UserVotes**: Tracks user interactions (likes, dislikes, reposts, bookmarks)
- **Photos**: File storage references linked to posts
- **Notifications**: Real-time notifications for users
- **Reports**: Legacy entity for issue tracking (being migrated to Posts)
- **Hashtags**: Community tagging system for posts
- **PointsTransactions**: Track user points earned and spent with reasons
- **Badges**: Available badges with cost, rarity, and category
- **UserBadges**: Badges owned by users with equipped status

## Authentication System

- **User Registration**: Phone-based signup with name, phone, and city
- **Admin Access**: Email/password login (demo: admin@rectify.com / admin123)
- **Role-based Routing**: Users → /dashboard, Admins → /admin
- **Authentication Flow**: Homepage redirects to signup for new users
- **Session Management**: Client-side authentication with localStorage persistence

## Development Notes

- Path alias `@/*` maps to project root
- All components use Tailwind for styling with dark theme
- Mobile-first responsive design optimized for mobile web app
- Geolocation uses both OpenCage and Nominatim APIs for reverse geocoding
- Profile section displays user info fetched from Convex database
- Admin dashboard provides comprehensive report management tools
- **Important**: Both "Reports" and "Posts" models exist - Posts is the current system, Reports is legacy

## Key Architectural Patterns

### Authentication Flow
- Client-side auth context provider (`app/lib/auth.tsx`) manages user sessions
- Role-based routing: users access `/dashboard`, admins access `/admin`
- Authentication state persisted in localStorage for session management

### Component Structure
- Shared components in `app/components/` (PostCard, CommentsSection, etc.)
- Page-specific logic in route directories (`dashboard/`, `admin/`, etc.)
- ConvexClientProvider wraps the entire app for real-time data access

### Real-time Features
- Convex provides automatic real-time updates for data changes
- Comments, likes, and status updates reflect immediately across clients
- Notifications system provides real-time alerts to users

### Points and Badge System
- Users earn Rectify Points when their posts are resolved by admins
- Points awarded: 50 base + priority bonus (high: 25, medium: 15, low: 10)
- Points can be spent in the Badge Shop to purchase decorative badges
- Badges have rarity levels: common, rare, epic, legendary
- Users can equip one badge at a time to display on their profile
- Badge categories: contribution, achievement, premium, special
- Badge Shop accessible from sidebar and profile sections
- Mobile-optimized design with responsive grid layout and scrollable categories

## Configuration Files

- `next.config.ts`: Next.js configuration (minimal setup)
- `tsconfig.json`: TypeScript configuration with Next.js plugin
- `convex/tsconfig.json`: Separate TypeScript config for Convex functions
- `eslint.config.mjs`: ESLint configuration
- `postcss.config.mjs`: PostCSS configuration for TailwindCSS