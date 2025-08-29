# Afro Village Platform

## Overview

Afro Village is a comprehensive platform for managing a sustainable, off-grid eco-village and cultural center. It combines African diaspora culture, sustainable living, education, and community building into a unified digital ecosystem. The platform serves as a hub for community members, visitors, educators, and partners to engage with events, learning opportunities, cultural activities, funding projects, and resource management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Routing**: Wouter for client-side routing
- **Styling**: Tailwind CSS with custom design system featuring African-inspired color schemes (primary orange, secondary green, accent gold)
- **UI Components**: Radix UI primitives with shadcn/ui component library for consistent, accessible interfaces
- **State Management**: TanStack React Query for server state management and data fetching
- **Form Handling**: React Hook Form with Zod validation schemas for type-safe form processing

### Backend Architecture
- **Runtime**: Node.js with Express.js server framework
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Authentication**: Replit Auth integration with session-based authentication using express-session and connect-pg-simple
- **API Design**: RESTful API endpoints with structured error handling and request logging middleware

### Database Schema Design
- **Core Entities**: Users, Events, Courses, Projects, Accommodations, Bookings, Artist Profiles, Messages, Resources
- **Relationships**: Proper foreign key relationships with enrollment tracking, event registrations, and donation management
- **Session Management**: Dedicated sessions table for authentication persistence
- **Flexible Metadata**: JSONB fields for extensible resource monitoring and project metadata

### Authentication & Authorization
- **Provider**: Replit OpenID Connect (OIDC) integration
- **Session Storage**: PostgreSQL-backed session store with configurable TTL
- **Role-Based Access**: User roles including visitor, resident, educator, partner, and admin
- **Security**: HTTP-only cookies, CSRF protection, and secure session configuration

### Resource Management System
- **Off-Grid Monitoring**: Real-time tracking of solar energy, water levels, food production, and internet connectivity
- **Status Alerts**: Critical, warning, and normal status indicators with automated monitoring
- **Sustainability Metrics**: Progress tracking for eco-village sustainability goals and resource efficiency

### Cultural & Educational Features
- **Artist Profiles**: Portfolio management for cultural creators with specialties, ratings, and work showcases
- **Learning Hub**: Course enrollment system with progress tracking and completion metrics
- **Event Management**: Comprehensive event system supporting workshops, retreats, festivals, and community gatherings

### Project Funding Platform
- **Crowdfunding**: Goal-based funding with progress tracking and deadline management
- **Multi-Currency**: Support for different currencies with proper formatting
- **Donation Management**: Secure donation processing with contribution tracking

## External Dependencies

### Database Services
- **Neon Database**: Serverless PostgreSQL database hosting with connection pooling
- **WebSocket Support**: Real-time database connections using ws library for Neon compatibility

### Authentication Services
- **Replit Auth**: OpenID Connect authentication provider with automatic user provisioning
- **Session Management**: PostgreSQL session storage with automatic cleanup and TTL management

### Development Tools
- **Vite**: Fast build tool and development server with React plugin support
- **TypeScript**: Full type safety across frontend, backend, and shared schemas
- **Drizzle Kit**: Database migration and schema management tools
- **ESBuild**: Fast JavaScript bundling for production builds

### Payment Processing
- **Stripe**: Payment processing integration for donations and event registrations (configured but not yet implemented)

### UI Framework Dependencies
- **Radix UI**: Accessible component primitives for complex UI interactions
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens
- **Date-fns**: Date manipulation and formatting utilities
- **Lucide React**: Consistent icon system throughout the application

### Development Environment
- **Replit Integration**: Custom plugins for development banner and cartographer tooling
- **Runtime Error Handling**: Development-specific error overlay for debugging
- **Path Aliases**: Configured module resolution for clean imports (@/, @shared/, @assets/)