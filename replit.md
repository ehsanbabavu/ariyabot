# Overview

**Ariya Bot** is an intelligent 24/7 customer support assistant and a modern, full-stack TypeScript Persian e-commerce platform. It aims to transform customer communication and streamline online business management, offering features from automated customer interactions to order processing. The project provides a comprehensive web application built for the Persian market, including intelligent customer support, e-commerce, user management, ticketing, inventory control, and subscription services with role-based access. It features a fully localized Farsi UI with RTL support, a responsive mobile-first design, and AI-powered functionalities like smart ordering and WhatsApp-based deposit receipt processing, enhancing user experience through advanced AI and robust system architecture.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## UI/UX Decisions
- **Frontend**: React 18 with TypeScript and Vite.
- **Components & Styling**: shadcn/ui (Radix UI-based) and Tailwind CSS, utilizing Vazirmatn font for Persian script and RTL support.
- **Responsiveness**: Mobile-first design with a hamburger menu and drawer for mobile, and a fixed sidebar for desktop.
- **Design Elements**: Compact card layouts, auto-sliding carousels, dynamic notifications, and Persian invoice templates with currency conversion.

## Technical Implementations
- **Backend**: Node.js with Express.js, TypeScript, and ES modules.
- **API**: RESTful, JSON-based.
- **Authentication**: JWT with bcrypt hashing and role-based access control (admin, user_level_1, user_level_2).
- **File Management**: Multer for uploads, local storage for images, Puppeteer for HTML-to-image invoice generation.
- **Data Storage**: PostgreSQL with Drizzle ORM, Neon Database for serverless hosting, Drizzle Kit for migrations, and connect-pg-simple for session storage.

## Feature Specifications
- **WhatsApp Integration**: AI-powered OCR for deposit receipts (Gemini Vision), smart product ordering, duplicate transaction detection, automated notifications, and invoice delivery. Includes an intelligent, rate-limited queue system.
- **Internal Chat**: Real-time unread message badges with role-based visibility.
- **Order Management**: Enhanced order display, new order notifications, unshipped orders dashboard, and automatic invoice generation.
- **Transaction Management**: Duplicate transaction detection and automated WhatsApp notifications.
- **Shipping Management**: Configurable shipping methods for sellers, with buyer selection.
- **VAT Management**: Seller-configurable VAT with customizable percentage, toggle, and invoice thank you message.
- **Password Reset**: Secure OTP-based recovery via WhatsApp with rate limiting.
- **Cart Page Redesign**: Responsive two-column layout for product details and order summary.
- **Automatic Order Processing**: Processes pending orders chronologically upon deposit transaction approval.
- **Database Backup & Restore**: Full PostgreSQL backup and restore system for admins, including download, deletion, and path traversal protection.
- **Blockchain Settings Management**: Centralized blockchain API token management system via admin UI for Cardano, Tron, Ripple, with runtime token reload and environment variable fallback.
- **Cardano Integration**: Cardanoscan API integration for transaction history retrieval, pagination, ADA amount formatting, and direct links to explorer.
- **Cryptocurrency Price Tracking**: Real-time scraping-based price retrieval from TGJU.org for Tron, USDT, Ripple, Cardano, stored in Rial, with frontend auto-refresh and validation ranges.
- **Vitrin AI Chat Redesign**: New mobile-only storefront design with AI chat functionality (Gemini AI), product display, and shopping cart tabs. Includes intelligent context for AI chat.
- **Personal Storefront (Vitrin)**: Public storefront pages (`/vitrin/:username`) for Level 1 sellers to display products, with seller-configurable settings.
- **Auto-Save Crypto Transactions**: System to automatically save cryptocurrency transaction details for orders.
- **Guest Chat System**: Chat system for non-member visitors on the home page, with admin management.
- **New Homepage**: Modern landing page with Framer Motion animations and news carousel.

## System Design Choices
- **AI Architecture**: Dual AI provider system (Gemini AI, Liara AI) with an AI Service Orchestrator for centralized management and automatic failover.
- **Development & Deployment**: Vite for frontend bundling; Express serves static assets. Configured for VM deployment.
- **Security**: JWT_SECRET and ADMIN_PASSWORD managed via Replit Secrets.

# External Dependencies

## Core Frameworks
- React 18, React Hook Form, TanStack Query, Wouter, Vite.

## UI & Styling
- Radix UI, shadcn/ui, Tailwind CSS, PostCSS, Lucide React, Google Fonts.

## Backend Services
- Express.js, Drizzle ORM, Multer, jsonwebtoken, bcrypt, Puppeteer.

## AI Services
- Gemini AI
- Liara AI (OpenAI-compatible)

## Database & Storage
- Neon Database (PostgreSQL), Drizzle Kit.

## Blockchain Services
- Cardanoscan API
- TGJU.org (for cryptocurrency price scraping)