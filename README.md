# 🌱 Trichy Fresh Connect

A production-ready Next.js marketplace connecting local producers (farmers & home gardeners) with consumers for fresh, local produce.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- MongoDB database
- Cloudinary account (for image storage)

### Setup
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy environment variables:
   ```bash
   cp .env.example .env.local
   ```
4. Configure your environment variables in `.env.local`
5. Run the development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:5000](http://localhost:5000) to view the application.

## 🛠 Tech Stack

- **Framework:** Next.js 15 (App Router) with TypeScript
- **Styling:** Tailwind CSS v4 + shadcn/ui components
- **Animations:** Framer Motion
- **Database:** MongoDB with Prisma ORM
- **Authentication:** NextAuth.js
- **Image Storage:** Cloudinary
- **Forms:** React Hook Form + Zod validation

## 📁 Project Structure

```
src/
├── app/                 # Next.js App Router
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Home page
│   └── globals.css     # Global styles
├── components/         # React components
│   └── ui/            # shadcn/ui components
├── lib/               # Utilities and configurations
│   └── utils.ts       # Utility functions
└── hooks/             # Custom React hooks
```

## 🎯 Features (Phase 0 Complete)

✅ Next.js 15 App Router setup
✅ TypeScript configuration
✅ Tailwind CSS v4 integration
✅ shadcn/ui component system
✅ Framer Motion ready
✅ Development environment configured
✅ Basic landing page

## 🔧 Development Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## 📋 Phase 0 Status: ✅ COMPLETE

- [x] Next.js App Router project setup
- [x] TypeScript configuration
- [x] Tailwind CSS v4 + shadcn/ui integration
- [x] Framer Motion installation
- [x] Basic project structure
- [x] Development workflow configuration
- [x] Environment variables template
- [x] README documentation

## 🚧 Next Phases

- **Phase 1:** Authentication system (NextAuth + register/login)
- **Phase 2:** Database integration (MongoDB + Prisma)
- **Phase 3:** Listings CRUD operations
- **Phase 4:** Browse & search functionality
- **Phase 5:** Producer dashboard
- **Phase 6:** Image uploads & contact system
- **Phase 7:** UI polish & animations
- **Phase 8:** Testing & CI/CD
- **Phase 9:** Docker & deployment

## 🎨 Design System

- **Colors:** Fresh greens + neutrals
- **Typography:** Inter font family
- **Layout:** Grid-based with generous whitespace
- **Animations:** Subtle, staggered, premium feel

## 📄 License

This project is licensed under the MIT License.
