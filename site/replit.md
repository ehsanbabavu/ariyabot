# REST Express - Full Stack Application

## Overview
A modern full-stack web application built with React, Express, TypeScript, and Vite. This project features a clean architecture with separate client and server directories, utilizing Radix UI components and Tailwind CSS for the frontend.

**Current State**: Imported from GitHub and configured for Replit environment. Ready for development.

## Recent Changes
- **2024-11-25**: Initial import and Replit environment setup
  - Installed npm dependencies
  - Configured development workflow for port 5000
  - Set up for frontend development with Vite
  - Currently using in-memory storage (MemStorage)

## Project Architecture

### Frontend (client/)
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Routing**: Wouter
- **UI Library**: Radix UI components
- **Styling**: Tailwind CSS v4
- **State Management**: TanStack Query (React Query)
- **Forms**: React Hook Form with Zod validation

### Backend (server/)
- **Framework**: Express.js
- **Language**: TypeScript with ESM modules
- **Development**: tsx for TypeScript execution
- **Production**: esbuild for bundling

### Database
- **ORM**: Drizzle ORM
- **Dialect**: PostgreSQL
- **Current Storage**: MemStorage (in-memory) - temporary solution
- **Schema**: Defined in `shared/schema.ts`
- **Note**: PostgreSQL database needs to be provisioned through Replit UI (Database tab) to enable persistent storage

### Project Structure
```
├── client/              # Frontend React application
│   ├── public/          # Static assets
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── hooks/       # Custom React hooks
│   │   ├── lib/         # Utilities and config
│   │   └── pages/       # Page components
│   └── index.html
├── server/              # Backend Express server
│   ├── app.ts           # Express app configuration
│   ├── index-dev.ts     # Development server with Vite
│   ├── index-prod.ts    # Production server
│   ├── routes.ts        # API routes
│   └── storage.ts       # Storage interface and implementations
├── shared/              # Shared types and schemas
│   └── schema.ts        # Database schema and types
└── attached_assets/     # Generated assets
```

## Development Workflow

### Scripts
- `npm run dev` - Start development server (backend with Vite middleware)
- `npm run dev:client` - Start Vite dev server only (port 5000)
- `npm run build` - Build for production
- `npm run start` - Run production server
- `npm run check` - TypeScript type checking
- `npm run db:push` - Push database schema changes (requires DATABASE_URL)

### Running the Application
The application runs on port 5000 in development mode. The Replit workflow is configured to:
1. Start the Express server with Vite middleware
2. Serve the React frontend through Vite's dev server
3. Handle API requests on `/api` routes
4. Enable HMR (Hot Module Replacement) for frontend changes

### Port Configuration
- **Frontend**: Port 5000 (required by Replit for webview)
- **Backend**: Integrated with frontend on same port
- **Host**: 0.0.0.0 (configured for Replit proxy)

## Database Setup (Required for Production)

To enable persistent storage:

1. Go to the Replit Database tab
2. Create a PostgreSQL database
3. The DATABASE_URL will be automatically set
4. Run migrations: `npm run db:push`
5. Update `server/storage.ts` to use PostgreSQL storage instead of MemStorage

## Configuration Files
- `vite.config.ts` - Vite configuration with Replit plugins and proxy settings
- `drizzle.config.ts` - Database ORM configuration
- `tsconfig.json` - TypeScript compiler options
- `package.json` - Dependencies and scripts

## User Preferences
- None specified yet

## Dependencies
- React 19 with TypeScript
- Express.js for backend API
- Vite for fast development and building
- Drizzle ORM for database operations
- Radix UI for accessible components
- Tailwind CSS v4 for styling
- TanStack Query for data fetching
- Wouter for routing

## Notes
- The application uses ESM modules (`"type": "module"` in package.json)
- Vite is configured with `allowedHosts: true` for Replit proxy compatibility
- Development server binds to 0.0.0.0:5000 as required by Replit
- Currently using in-memory storage; database provisioning required for persistence
