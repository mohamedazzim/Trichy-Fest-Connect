# Trichy Fresh Connect - Local Produce Marketplace

## Overview
Production-ready Next.js marketplace application that connects local produce producers with consumers for buying fresh produce locally. Built using modern tech stack with comprehensive security and data integrity.

## Purpose & Goals
- Connect local producers directly with consumers
- Support fresh produce discovery and purchasing
- Provide role-based experiences for producers and consumers
- Enable local food economy growth in Trichy region

## Current State: Phase 2 Complete ✅
The marketplace foundation is production-ready with secure authentication, user management, and database operations.

## Tech Stack
- **Frontend**: Next.js 14 App Router, TypeScript, Tailwind CSS v4, shadcn/ui, Framer Motion
- **Backend**: Next.js API Routes, NextAuth.js
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: NextAuth.js (Email/Password, Google OAuth, GitHub OAuth)
- **Validation**: Zod schemas
- **Security**: CSRF protection, input validation, session management

## Recent Changes - Phase 2 (September 16, 2025)
### Database Schema & Integrity
- ✅ Created complete marketplace schema (users, products, categories, listings)
- ✅ Implemented foreign key constraints for data integrity
- ✅ Added performance indexes for efficient queries
- ✅ Fixed migration reproducibility for fresh deployments

### User Profile Management
- ✅ Built producer profiles with business information
- ✅ Created consumer profiles with preferences
- ✅ Implemented secure profile API endpoints
- ✅ Added form validation and real-time updates

### Security Hardening
- ✅ CSRF protection with strict origin/referer validation
- ✅ Input validation with Zod schemas
- ✅ Protected route middleware
- ✅ Email normalization and data sanitization

## User Personas
### Producers
- Local farmers and produce growers
- Need to list and manage their produce
- Want direct customer connections
- Require business profile management

### Consumers
- Local residents seeking fresh produce
- Value direct farmer connections
- Need easy product discovery
- Want convenient purchasing options

## Project Architecture

### Database Models
- **Users**: Core user data with producer/consumer roles
- **Categories**: Produce organization (vegetables, fruits, herbs, etc.)
- **Products**: Producer's produce items with details
- **Listings**: Active marketplace listings with pricing/availability

### API Endpoints
- `/api/auth/*` - NextAuth authentication
- `/api/user/profile` - User profile management (GET/PUT)

### Key Files
- `src/lib/auth.ts` - NextAuth configuration
- `src/lib/schema.ts` - Database schema definitions
- `src/lib/db.ts` - Database connection
- `src/app/profile/page.tsx` - User profile interface
- `src/components/profile/*` - Profile components

## Development Guidelines
- Use exact host matching for CSRF protection
- Validate all inputs with Zod schemas
- Follow Next.js App Router patterns
- Maintain foreign key integrity
- Use `npm run db:push --force` for schema changes

## Phase Completion Status
- ✅ **Phase 1**: Authentication system with multi-provider OAuth
- ✅ **Phase 2**: User profiles and database operations  
- 🚧 **Phase 3**: Product management and listings (Next)
- ⏳ **Phase 4**: Consumer browsing and search
- ⏳ **Phase 5**: Marketplace transactions

## Next Steps (Phase 3)
- Producer dashboard for product management
- Product creation and editing interfaces
- Basic category setup for produce organization
- Listing management functionality