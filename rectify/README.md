# Rectify

A community-driven problem-solving platform built with Next.js 15, React 19, and Convex. Rectify enables users to report and track local infrastructure issues like potholes, water problems, and street lighting issues.

## Core Technologies

- **Framework**: Next.js 15 with Turbopack
- **React**: Version 19
- **Backend**: Convex (real-time backend platform)
- **Styling**: TailwindCSS 4
- **TypeScript**: Full TypeScript support
- **Linting**: ESLint with Next.js config

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Development Commands

- `npm run dev`: Start development server with Turbopack
- `npm run build`: Build production application with Turbopack  
- `npm start`: Start production server
- `npm run lint`: Run ESLint for code quality

## Features

- **Authentication System**: Phone-based user signup and role-based admin login
- **Community Reporting**: Users can report infrastructure issues with location and categorization
- **Location Services**: Automatic geolocation with fallback to manual entry
- **Real-time Updates**: Upvoting and community interaction on reports
- **Admin Dashboard**: Status management and report filtering for administrators
- **Responsive Design**: Mobile-first UI optimized for mobile web app

## Project Architecture

### App Router Structure
- Uses Next.js 15 App Router (app directory)
- Main entry point: `app/page.tsx` - Authentication router
- Layout: `app/layout.tsx` - Root layout with Convex and Auth providers
- **Pages**: `/signup`, `/login`, `/dashboard` (users), `/admin` (administrators)

### State Management
- React hooks for local state
- Authentication context provider for user sessions
- Convex for backend data persistence
- localStorage for client-side report caching

### Data Models
- **Users**: name, phone, city, role (stored in Convex)
- **Admins**: email, password, role (stored in Convex) 
- **Reports**: id, userId, type, description, location, coordinates, timestamp, status, upvotes
- **Report Types**: Predefined categories (Pothole, Road Damage, Water Issue, etc.)

## Authentication System

- **User Registration**: Phone-based signup with name, phone, and city
- **Admin Access**: Email/password login (demo: admin@rectify.com / admin123)
- **Role-based Routing**: Users → /dashboard, Admins → /admin
- **Session Management**: Client-side authentication with localStorage persistence

## Development Notes

- Path alias `@/*` maps to project root
- All components use Tailwind for styling with dark theme
- Mobile-first responsive design optimized for mobile web app
- Geolocation uses both OpenCage and Nominatim APIs for reverse geocoding

## Configuration Files

- `next.config.ts`: Next.js configuration
- `tsconfig.json`: TypeScript configuration with Next.js plugin
- `convex/tsconfig.json`: Separate TypeScript config for Convex functions
- `eslint.config.mjs`: ESLint configuration
- `postcss.config.mjs`: PostCSS configuration for TailwindCSS

## Learn More

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API
- [Convex Documentation](https://docs.convex.dev/) - learn about Convex backend platform
- [TailwindCSS Documentation](https://tailwindcss.com/docs) - learn about TailwindCSS

## Deploy

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new) from the creators of Next.js. Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
