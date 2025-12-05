# Persian Chat Application

## Overview
A full-stack TypeScript chat application with a Persian/Farsi interface. This is a modern web application built with React and Express, featuring a clean UI with chat functionality, sidebar navigation, and responsive design.

## Tech Stack
- **Frontend**: React 19, Vite, Wouter (routing), TailwindCSS, Radix UI
- **Backend**: Express.js, TypeScript
- **Database**: In-memory storage (MemStorage) with schema ready for PostgreSQL
- **Build System**: Vite (frontend), esbuild (backend)

## Project Structure
```
├── client/               # Frontend React application
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── pages/       # Page components (chat, not-found)
│   │   ├── lib/         # Utilities and query client
│   │   └── App.tsx      # Main app component
│   └── index.html
├── server/              # Backend Express server
│   ├── index.ts        # Server entry point
│   ├── routes.ts       # API routes
│   ├── storage.ts      # Storage interface (in-memory)
│   └── vite.ts         # Vite dev server setup
├── shared/             # Shared types and schemas
│   └── schema.ts       # Database schema (Drizzle ORM)
└── script/
    └── build.ts        # Production build script
```

## Development
The server runs on port 5000 and serves both the API and frontend:
- Frontend: Vite dev server in middleware mode
- Backend: Express with API routes at `/api/*`
- The server is configured to work with Replit's proxy (allowedHosts: true)

## Storage
Currently using in-memory storage (MemStorage class) which implements user CRUD operations. The project is ready to switch to PostgreSQL by:
1. Setting up DATABASE_URL environment variable
2. Running `npm run db:push` to push the schema
3. Implementing a DB storage class to replace MemStorage

## Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Run production server
- `npm run check` - Type check
- `npm run db:push` - Push database schema (requires DATABASE_URL)

## Recent Changes (December 3, 2025)
- Imported from GitHub and set up in Replit environment
- Installed dependencies
- Configured workflow to run on port 5000
- Added .gitignore file
- Configured deployment settings (autoscale)
- Verified frontend is working correctly with Persian UI

## Features
- Persian language chat interface
- Dark/light theme toggle
- Sidebar with chat suggestions
- Bottom navigation
- Responsive design with mobile support
- Ready for AI integration (simulated responses currently)
