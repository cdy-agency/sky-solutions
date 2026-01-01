# Database Schema & Models

## Overview

MongoDB-based database with Mongoose ODM for schema validation.

## Models

### User

```typescript
{
  _id: ObjectId
  email: string (unique)
  password: string (hashed)
  role: 'entrepreneur' | 'investor' | 'admin'
  verified: boolean
  verificationToken: string (optional)
  createdAt: Date
  updatedAt: Date
}
```

### Category

```typescript
{
  _id: ObjectId
  name: string
  description: string
  registrationFee: number
  createdAt: Date
  updatedAt: Date
}
```

### IntakeSubmission

```typescript
{
  _id: ObjectId
  user_id: ObjectId (ref: User)
  status: 'draft' | 'submitted' | 'approved' | 'rejected'
  
  // Step 1: Founder Info
  founder_name: string
  founder_email: string
  
  // Step 2: Employment
  employment_status: string
  years_experience: number
  
  // Step 3: Business Concept
  business_name: string
  category_id: ObjectId (ref: Category)
  business_concept: string
  
  // Step 4: Market Analysis
  target_market: string
  market_size: string
  market_analysis: string
  
  // Step 5: Funding Needs
  funding_needed: number
  use_of_funds: string
  
  // Step 6: Commitment
  commitment: boolean
  terms_accepted: boolean
  
  feedback: string (optional)
  createdAt: Date
  updatedAt: Date
}
```

### Business

```typescript
{
  _id: ObjectId
  type: 'submission' | 'public'
  submission_id: ObjectId (ref: IntakeSubmission, only for 'submission' type)
  user_id: ObjectId (ref: User)
  
  // Core fields
  business_name: string
  category_id: ObjectId (ref: Category)
  
  // Submission-only field
  business_plan: string (URL, only for 'submission' type)
  
  // Public listing fields
  description: string (optional)
  image: string (Cloudinary URL, optional)
  document: string (Cloudinary URL, optional)
  needed_funds: number (optional)
  equity_percentage: number (optional)
  
  // Status
  status: 'pending' | 'approved' | 'rejected' | 'published'
  feedback: string (optional)
  
  createdAt: Date
  updatedAt: Date
}
```

### Investment

```typescript
{
  _id: ObjectId
  investor_id: ObjectId (ref: User)
  business_id: ObjectId (ref: Business)
  amount: number
  status: 'pending' | 'completed' | 'cancelled'
  createdAt: Date
  updatedAt: Date
}
```

## Relationships

```
User
├── IntakeSubmission (1:many)
├── Business (1:many)
└── Investment (1:many)

Category
└── Business (1:many)
└── IntakeSubmission (1:many)

IntakeSubmission
└── Business (1:1 - public listing)

Business
└── Investment (1:many)
```

## Indexes

- User.email (unique)
- IntakeSubmission.user_id
- IntakeSubmission.status
- Business.type
- Business.user_id
- Business.category_id
- Investment.investor_id
- Investment.business_id
