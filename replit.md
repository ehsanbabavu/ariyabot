# Overview

This is a modern Persian e-commerce and support web application built with a full-stack TypeScript architecture. The application provides user management, a ticketing system, inventory management, and subscription services with role-based access control. All user-facing content is displayed in Persian (Farsi) while maintaining a modern, responsive design. The project aims to provide a comprehensive and intuitive platform for online business operations in the Persian market, incorporating AI-powered features for smart ordering and deposit receipt processing via WhatsApp.

## Replit Setup (Fresh GitHub Clone - October 17, 2025)

This project has been successfully cloned from GitHub and configured to run in the Replit environment:

- **Database**: PostgreSQL database provisioned (helium) and schema pushed successfully via `npm run db:push`
- **Dependencies**: All npm packages installed successfully (430 packages in node_modules)
- **Development Server**: Running on port 5000 (http://0.0.0.0:5000) with Vite dev server
- **Default Users**: Automatically created on first run
  - Admin: username `ehsan`, password `admin123`
  - Test Seller: username `test_seller`, password `test123`
- **Test Data**: Pre-loaded with 3 mobile categories and 6 test products
- **Deployment**: Configured for VM deployment with build (`npm run build`) and run (`npm start`) scripts
- **Vite Configuration**: Pre-configured with `allowedHosts: true` for Replit proxy compatibility
- **Workflow**: Single workflow "Server" running `npm run dev` on port 5000 with webview output
- **Application Status**: ✅ Running successfully with Persian RTL login page

### Setup Steps Completed (Fresh GitHub Clone - October 17, 2025)
1. ✅ Database environment already configured via Replit (PostgreSQL helium database at `helium:5432/heliumdb`)
2. ✅ All npm dependencies verified (430 packages in node_modules)
3. ✅ Database schema pushed successfully using Drizzle ORM (`npm run db:push`)
4. ✅ Development workflow "Server" configured and running on port 5000 with webview output
5. ✅ Deployment settings configured for VM deployment type:
   - Build: `npm run build` (vite build + esbuild bundling)
   - Run: `npm start` (production mode with compiled dist/index.js)
6. ✅ Application verified with screenshot - Persian RTL login page displaying correctly
7. ✅ Import process completed successfully

### Important Security Notes
- **JWT_SECRET**: Currently using fixed development secret - **MUST** set JWT_SECRET environment variable for production
- **ADMIN_PASSWORD**: Default password is "admin123" - **MUST** set ADMIN_PASSWORD environment variable to change it
- **GEMINI_API_KEY**: Optional for AI-powered features (WhatsApp OCR, smart ordering) - configure in admin panel or via environment variable
- **WhatsApp Integration**: Configure WhatsApp token in admin settings for messaging features

### Environment Variables (Required for Production)
- `DATABASE_URL`: ✅ Already configured (postgresql://postgres:password@helium/heliumdb?sslmode=disable)
- `JWT_SECRET`: ⚠️ Not set (using fixed development secret)
- `ADMIN_PASSWORD`: ⚠️ Not set (defaults to "admin123")
- `GEMINI_API_KEY`: ⚠️ Not set (AI features disabled)

### Architecture Notes
- The application runs frontend and backend on the same port (5000) using Vite in development mode
- In production, Vite builds static assets to `dist/public/` and Express serves them
- Backend listens on `0.0.0.0:5000` for Replit compatibility
- Database sessions stored in PostgreSQL using connect-pg-simple
- File uploads stored in `uploads/` directory
- Invoice images generated in `public/invoices/` directory

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
    - **Shipping Management**: Level 1 sellers can configure four shipping methods (پست پیشتاز, پست معمولی, پیک, ارسال رایگان) with enable/disable toggles and minimum amount for free shipping. Level 2 buyers select from enabled methods during web checkout and WhatsApp ordering. Shipping method is stored with each order for tracking and reporting.
    - **VAT Management (October 15, 2025)**: Level 1 sellers can configure Value Added Tax (ارزش افزوده) with customizable percentage rate (default 9%) and enable/disable toggle. VAT is automatically calculated and applied to order totals during checkout and displayed separately in invoices (showing subtotal, VAT amount, and total). VAT settings are seller-specific and stored per userId.
    - **Password Reset System**: Secure OTP-based password recovery via WhatsApp with crypto.randomInt for secure 6-digit code generation, 5-minute expiration, one-time use validation, and rate limiting (3 attempts per 15 minutes per user).
    - **Security**: JWT authentication with role-based access control, secure password reset with OTP validation.

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