# Overview

This project is a modern, full-stack TypeScript Persian e-commerce and support web application. It offers comprehensive features including user management, a ticketing system, inventory, and subscription services with role-based access control. The platform is designed for the Persian market, featuring a fully localized Farsi UI, responsive design, and AI-powered functionalities like smart ordering and WhatsApp-based deposit receipt processing. The ambition is to provide an intuitive and powerful online business tool, enhancing user experience through advanced AI and robust system architecture.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## UI/UX Decisions
- **Frontend**: React 18 with TypeScript and Vite.
- **Components & Styling**: shadcn/ui (Radix UI-based) and Tailwind CSS, with Vazirmatn font for Persian script and RTL support.
- **Responsiveness**: Mobile-first design featuring a hamburger menu and drawer for mobile navigation, and a fixed sidebar for desktop.
- **Design Elements**: Compact card layouts, auto-sliding carousels, dynamic notifications, and Persian invoice templates with currency conversion.

## Technical Implementations
- **Backend**: Node.js with Express.js, TypeScript, and ES modules.
- **API**: RESTful, JSON-based.
- **Authentication**: JWT with bcrypt hashing and role-based access control (admin, user_level_1, user_level_2).
- **File Management**: Multer for uploads, local storage for images, Puppeteer for HTML-to-image invoice generation.
- **Data Storage**: PostgreSQL with Drizzle ORM, Neon Database for serverless hosting, Drizzle Kit for migrations, and connect-pg-simple for session storage.

## Feature Specifications
- **WhatsApp Integration**: AI-powered OCR for deposit receipts (Gemini Vision), smart product ordering, duplicate transaction detection, automated notifications, and invoice delivery. Includes an intelligent, rate-limited queue system (3 messages/sec per user) with retries to prevent API blocking.
- **Internal Chat**: Real-time unread message badges with role-based visibility.
- **Order Management**: Enhanced order display for sellers, new order notifications, unshipped orders dashboard, and automatic invoice generation.
- **Transaction Management**: Duplicate transaction detection and automated WhatsApp notifications for approval/rejection.
- **Shipping Management**: Configurable shipping methods (Pishaz, Ordinary, Courier, Free) for sellers, with buyer selection during checkout.
- **VAT Management**: Seller-configurable Value Added Tax (VAT) with customizable percentage, enable/disable toggle, and invoice thank you message. VAT calculation is integrated into order totals and displayed separately on invoices.
- **Password Reset**: Secure OTP-based recovery via WhatsApp with rate limiting.
- **Cart Page Redesign**: Responsive two-column layout showing product details on the right and order summary, delivery, and shipping options on the left.
- **Automatic Order Processing**: Upon deposit transaction approval, the system automatically processes pending orders chronologically, confirming them, deducting payment, and updating balances until funds are insufficient.
- **Database Backup & Restore**: Complete database backup and restore system for admin users with:
  - Full PostgreSQL backup creation using pg_dump with automatic download
  - Restore from SQL backup files with psql
  - List of saved backups with file size and creation date
  - Download individual backup files
  - Delete old backup files
  - Path traversal protection with filename validation and directory containment checks
  - Admin-only access with JWT authentication
  - Persian UI accessible at /database-backup in admin settings menu
- **Blockchain Settings Management**: Centralized blockchain API token management system:
  - Database-backed storage for blockchain provider API keys (blockchain_settings table)
  - Admin UI for configuring Cardano, Tron, Ripple API tokens
  - Runtime token reload without server restart
  - Fallback to environment variables for backward compatibility
  - Secure admin-only access with JWT authentication
- **Cardano Integration**: Cardanoscan API integration for blockchain transaction retrieval:
  - Fetch transaction history for any Cardano wallet address
  - Support for pagination (up to 50 transactions per request)
  - Free tier API usage with proper authentication
  - Automatic formatting of ADA amounts with Persian date display
  - Direct links to Cardanoscan explorer for transaction details
  - Centered table alignment for better UX
- **Cryptocurrency Price Tracking**: Real-time price fetching from TGJU.org profile pages:
  - Scraping-based price retrieval from individual cryptocurrency profile pages (Tron, USDT, Ripple, Cardano)
  - All prices are fetched and stored in Rial (not Toman) for consistency
  - Direct live fetching with no caching - always gets the latest price from TGJU.org
  - Frontend auto-refresh every 2 minutes for real-time price display
  - Validation ranges to ensure scraped values are reasonable (800K-2M for USDT, 100K-1M for TRX, 1M-10M for XRP, 100K-2M for ADA)
  - Error handling: throws error if price cannot be fetched or is out of valid range
  - Centralized fetchProfilePriceInRial helper for consistent scraping logic

## System Design Choices
- **AI Architecture**: Dual AI provider system supporting Gemini AI (Google) and Liara AI (OpenAI-compatible) with an AI Service Orchestrator for centralized management and automatic failover. Only one provider is active at a time, configurable via admin settings.
- **Development & Deployment**: Vite for frontend bundling and development server; Express serves static assets in production. Configured for VM deployment.
- **Security**: JWT_SECRET and ADMIN_PASSWORD managed via Replit Secrets.

# External Dependencies

## Core Frameworks
- React 18, React Hook Form, TanStack Query, Wouter, Vite.

## UI & Styling
- Radix UI, shadcn/ui, Tailwind CSS, PostCSS, Lucide React, Google Fonts.

## Backend Services
- Express.js, Drizzle ORM, Multer, jsonwebtoken, bcrypt, Puppeteer.

## AI Services
- **Gemini AI**: For OCR and natural language processing.
- **Liara AI**: OpenAI-compatible alternative AI provider.

## Database & Storage
- Neon Database (PostgreSQL), Drizzle Kit.

## Blockchain Services
- **Cardanoscan API**: For Cardano blockchain transaction retrieval and wallet monitoring.

# Replit Setup & Configuration

## Initial Setup (Completed)
- **Date**: November 11, 2025 (Re-imported from GitHub)
- **Status**: ✅ Successfully imported and configured in Replit environment (Fresh GitHub Clone)
- **Setup Actions**:
  - ✅ Installed all npm dependencies (640 packages)
  - ✅ Connected to PostgreSQL database (DATABASE_URL configured)
  - ✅ Pushed database schema using Drizzle Kit (`npm run db:push`)
  - ✅ Created admin and test user accounts automatically
  - ✅ Initialized test data (3 categories, 6 products, landing page content)
  - ✅ Configured development workflow (npm run dev on port 5000 with webview)
  - ✅ Set up VM deployment configuration (build + start commands)
  - ✅ Created .gitignore file for proper version control
  - ✅ Frontend configured with allowedHosts: true for Replit proxy support
  - ✅ All services started successfully (WhatsApp, AI, cleanup)
  - ✅ Application is fully functional and accessible on port 5000
  - ✅ Persian landing page displaying correctly with RTL support

## Environment Configuration
1. **Database**: PostgreSQL database is provisioned and connected via `DATABASE_URL`
2. **Schema**: Database schema pushed successfully using Drizzle Kit (`npm run db:push`)
3. **Port**: Server runs on port 5000 (both dev and production)
4. **Host**: 0.0.0.0 (configured for Replit proxy support with allowedHosts: true in vite.config.ts)

## Default Credentials
- **Admin User**: 
  - Username: `ehsan`
  - Password: `admin123` (change via `ADMIN_PASSWORD` environment variable)
- **Test Seller**:
  - Username: `test_seller`
  - Password: `test123`

## Required Environment Variables (Optional)
The following environment variables can be set for enhanced functionality:
- `JWT_SECRET`: Custom JWT secret (defaults to dev secret if not set)
- `ADMIN_PASSWORD`: Custom admin password (defaults to admin123)
- `GEMINI_API_KEY`: For AI-powered features (OCR, smart ordering)
- `LIARA_AI_API_KEY`: Alternative AI provider
- `CARDANOSCAN_API_KEY`: For Cardano blockchain transaction retrieval (can also be configured via admin panel)
- WhatsApp integration tokens (configured per user in admin panel)

**Note**: Blockchain API tokens (Cardano, Tron, Ripple) are now managed through the admin panel at `/cardano-settings` (accessible from Settings menu in admin panel) and stored in the database. Environment variables serve as fallback only.

## Development Workflow
- **Start Dev Server**: `npm run dev` (automatically configured)
- **Database Push**: `npm run db:push`
- **Type Check**: `npm run check`
- **Build**: `npm run build`

## Deployment
- **Type**: VM (always-on server)
- **Build Command**: `npm run build`
- **Run Command**: `npm start`
- **Configuration**: Already set up and ready to publish

## Test Data
The application automatically creates:
- Admin and test seller accounts
- 3 mobile phone categories
- 6 sample products

All ready for testing and demonstration purposes.