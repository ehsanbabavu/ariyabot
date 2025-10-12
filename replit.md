# Overview

This is a modern Persian e-commerce and support web application built with a full-stack TypeScript architecture. The application provides user management, a ticketing system, inventory management, and subscription services with role-based access control. All user-facing content is displayed in Persian (Farsi) while maintaining a modern, responsive design. The project aims to provide a comprehensive and intuitive platform for online business operations in the Persian market, incorporating AI-powered features for smart ordering and deposit receipt processing via WhatsApp.

## Replit Setup (Fresh GitHub Import - October 11, 2025)

This project has been successfully imported from GitHub and configured to run in the Replit environment:

- **Database**: PostgreSQL database (DATABASE_URL secret configured), Drizzle schema pushed successfully
- **Dependencies**: All npm packages installed (638 packages)
- **Development Server**: Running on port 5000 (http://0.0.0.0:5000) with Vite dev server
- **Default Users**: Automatically created on first run
  - Admin: username `ehsan`, password `admin123`
  - Test Seller: username `test_seller`, password `test123`
- **Test Data**: Pre-loaded with 3 mobile categories and 6 test products
- **Deployment**: Configured for autoscale deployment with build (`npm run build`) and run (`npm start`) scripts
- **Vite Configuration**: Already configured with `allowedHosts: true` for Replit proxy compatibility
- **Workflow**: Single workflow "Server" running `npm run dev` on port 5000
- **Git Ignore**: Comprehensive .gitignore added for Node.js project (node_modules, dist, .env, uploads, etc.)

### Important Notes
- Gemini AI token can be configured in the admin panel (AI Token Settings) to enable AI-powered features
- WhatsApp integration requires token configuration in admin settings
- The application runs frontend and backend on the same port (5000) using Vite in development mode
- JWT_SECRET environment variable is optional for development (uses fixed secret) but required for production
- ADMIN_PASSWORD environment variable is optional (defaults to "admin123" if not set)
- GEMINI_API_KEY is optional and can be set for AI features

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite
- **UI Components**: shadcn/ui built on Radix UI
- **Styling**: Tailwind CSS with Persian font support (Vazirmatn) and RTL layout
- **Routing**: Wouter
- **State Management**: TanStack Query
- **Form Handling**: React Hook Form with Zod validation
- **UI/UX Decisions**: Compact card layouts for lists, auto-sliding carousels, dynamic notification bells, Persian invoice template adhering to business standards, and currency conversion/number-to-words for financial displays.

## Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with JSON responses
- **File Uploads**: Multer middleware
- **Authentication**: JWT-based with bcrypt for password hashing
- **Middleware**: Custom authentication and request logging
- **Invoice Generation**: Puppeteer-based HTML-to-image conversion for professional Persian invoices
- **Feature Specifications**:
    - **WhatsApp Integration**: AI-powered deposit receipt processing (OCR with Gemini Vision), smart product ordering with session management, duplicate transaction detection, automated user notifications for transaction status, and automatic invoice delivery via WhatsApp after order completion.
    - **Internal Chat**: Unread message badge system with real-time updates and role-based display.
    - **Order Management**: Enhanced order display for level 1 users with customer details, notification bell for new orders, unshipped orders dashboard, and automatic invoice generation with WhatsApp delivery upon order completion.
    - **Transaction Management**: Comprehensive duplicate transaction detection and automatic WhatsApp notifications for approval/rejection.
    - **Security**: JWT authentication with role-based access control.

## Data Storage Solutions
- **Database**: PostgreSQL with Drizzle ORM
- **Connection**: Neon Database serverless PostgreSQL
- **Schema Management**: Drizzle Kit for migrations
- **Session Storage**: Connect-pg-simple for PostgreSQL session storage
- **File Storage**: Local file system for uploaded images

## Authentication and Authorization
- **Authentication Method**: JWT tokens with localStorage persistence
- **Password Security**: bcrypt hashing
- **Role-Based Access Control**: Three user roles (admin, user_level_1, user_level_2)
- **Protected Routes**: Custom route components
- **Session Management**: Automatic token validation and renewal

## Database Schema Design
- **Key Tables**: Users, Tickets, Products, Subscriptions, WhatsApp Settings, Received Messages (with imageUrl for receipts).

# External Dependencies

## Core Framework Dependencies
- **React Ecosystem**: React 18, React DOM, React Hook Form, TanStack Query
- **Build Tools**: Vite
- **Routing**: Wouter

## UI and Styling
- **Component Library**: Radix UI, shadcn/ui
- **Styling Framework**: Tailwind CSS, PostCSS
- **Icons**: Lucide React
- **Typography**: Google Fonts

## Backend Services
- **Web Framework**: Express.js
- **Database ORM**: Drizzle ORM
- **File Processing**: Multer
- **Authentication**: JWT, bcrypt
- **Invoice Generation**: Puppeteer (headless Chrome for HTML-to-image conversion)

## AI Services
- **Gemini AI**: For intelligent deposit receipt OCR (Gemini 2.0 Flash Vision) and natural language understanding for WhatsApp product ordering.

## Database and Storage
- **Database Provider**: Neon Database
- **Migration Tools**: Drizzle Kit

## Development Tools
- **Type Safety**: TypeScript
- **Code Quality**: ESLint
- **Development Server**: Vite dev server