# Frontend Setup & Features Guide

## Installation

```bash
npm install
```

## Environment Variables

Create `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Running the Frontend

Development:
```bash
npm run dev
```

Production:
```bash
npm run build
npm start
```

## Project Structure

```
app/
├── layout.tsx              # Root layout with metadata
├── page.tsx               # Landing page with public listings
├── login/                 # Login page
├── register/              # Registration page
├── verify/[token]/        # Email verification
├── admin/
│   ├── layout.tsx         # Role protection
│   ├── page.tsx           # Admin dashboard
│   ├── categories/        # Category management
│   ├── businesses/        # Review submissions & create listings
│   ├── users/             # User management
│   └── investments/       # Investment tracking
├── entrepreneur/
│   ├── layout.tsx         # Role protection
│   ├── page.tsx           # Entrepreneur dashboard
│   ├── intake/            # Multi-step intake form
│   └── businesses/        # Submission status
└── investor/
    ├── layout.tsx         # Role protection
    ├── page.tsx           # Investor dashboard
    ├── browse/            # Public business listings
    └── investments/       # Portfolio tracking

components/
├── dashboard-layout.tsx   # Shared layout
├── explore-startups.tsx   # Public listings component
├── ideation-form-wizard.tsx # Multi-step form
└── ui/                    # shadcn/ui components

lib/
├── api.ts                 # API client functions
├── auth-context.tsx       # Authentication context
├── role-guard.ts          # Role utilities
└── use-role-guard.ts      # Role protection hook
```

## Key Features

### Authentication
- Email/password registration
- Email verification required
- JWT token management
- Automatic role-based redirects
- Logout functionality

### Role-Based Access
- Separate dashboards per role
- Layout-level protection preventing unauthorized access
- Automatic redirects on login
- Role validation on all protected routes

### Entrepreneur Features
- Multi-step Intake Form Wizard (6 steps)
- Business submission tracking
- View intake form history
- Monitor submission status (pending, approved, rejected)

### Admin Features
- Review entrepreneur submissions
- Create public business listings
- Manage business categories
- User account management
- Investment tracking
- Approval/rejection workflow

### Investor Features
- Browse public business listings
- Advanced filtering and search
- View business details
- Make investment commitments
- Track portfolio

### Public Features
- Landing page with featured businesses
- Business detail pages
- SEO optimized

## Form Validation

Forms use React Hook Form + Zod for:
- Client-side validation
- Type-safe schema definition
- Real-time error feedback
- File size validation (2MB max)

## Styling

- Tailwind CSS v4 with semantic design tokens
- Responsive mobile-first design
- Brand colors: Royal Blue (#1B4F91) & Golden Yellow (#D4A84B)
- Accessible UI components from shadcn/ui

## SEO Optimizations

- Dynamic metadata per page
- Open Graph tags for social sharing
- JSON-LD structured data
- Canonical URLs
- XML sitemap
- robots.txt configuration
