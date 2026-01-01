# SKY Solutions - Investment & Entrepreneurship Platform

SKY Solutions is a comprehensive full-stack platform connecting entrepreneurs with investors. It facilitates business funding by allowing entrepreneurs to submit business ideas for review, while providing investors with vetted investment opportunities.

## Project Overview

SKY Solutions operates on three user roles with distinct workflows:
- **Entrepreneurs**: Submit business ideas and intake forms for admin review
- **Admin/Evaluators**: Review submissions, create public listings, manage categories and fees
- **Investors**: Browse approved businesses and make investment commitments

## Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS v4** - Utility-first styling
- **shadcn/ui** - Component library
- **React Hook Form** - Form state management
- **Zod** - Schema validation
- **SWR** - Data fetching and caching

### Backend
- **Node.js + Express** - Server framework
- **TypeScript** - Type-safe backend
- **MongoDB + Mongoose** - Database and ODM
- **JWT** - Authentication
- **Cloudinary** - Image hosting
- **Nodemailer** - Email notifications
- **Multer** - File uploads

## Quick Start

### Frontend Setup
```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run development server
npm run dev
```

### Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Run development server
npm run dev
```

## Environment Variables

See `.env.example` and `backend/.env.example` for required configuration.

## Features

- **Email Verification** - Secure account creation with email confirmation
- **Role-Based Access** - Protected routes preventing unauthorized access
- **Intake Forms** - Multi-step wizard for comprehensive entrepreneur applications
- **File Management** - Secure file uploads to Cloudinary (2MB limit)
- **Business Listings** - Admin-curated public business opportunities
- **Investment Tracking** - Track investments and commitments
- **Category Management** - Admin-managed business categories with registration fees
- **SEO Optimized** - Meta tags, Open Graph, JSON-LD structured data
- **Responsive Design** - Mobile-first UI matching brand colors

## Brand Colors

- Primary: Royal Blue (#1B4F91)
- Secondary: Golden Yellow (#D4A84B)
- Neutral: White, Grays, Black variants

## Documentation

- [Backend Setup & API](./BACKEND.md)
- [Frontend Setup & Features](./FRONTEND.md)
- [Database Schema](./DATABASE.md)
- [API Endpoints](./API.md)
- [User Workflows](./WORKFLOW.md)
- [Deployment Guide](./DEPLOYMENT.md)

## Project Structure

```
sky-solutions/
├── app/                    # Next.js frontend
│   ├── admin/             # Admin dashboard
│   ├── entrepreneur/      # Entrepreneur dashboard
│   ├── investor/          # Investor dashboard
│   ├── login/             # Authentication
│   ├── register/          # Registration
│   └── page.tsx          # Landing page
├── backend/               # Express server
│   └── src/
│       ├── models/        # Mongoose schemas
│       ├── routes/        # API routes
│       ├── middleware/    # Auth, uploads
│       └── config/        # Database, email, etc
├── components/            # React components
├── lib/                   # Utilities & hooks
├── public/                # Static assets
└── docs/                  # Documentation
```

## Support

For issues and support, refer to the detailed documentation or contact the development team.
