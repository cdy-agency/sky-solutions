# Backend Setup & Development Guide

## Overview

The backend is built with Node.js, Express, and MongoDB. It handles authentication, business submissions, file uploads, and investor management.

## Installation

```bash
cd backend
npm install
```

## Environment Variables

Create a `.env` file in the backend directory:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/sky-solutions
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRE=7d

# Email Configuration (Nodemailer)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@skysolutions.com

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Server
PORT=5000
NODE_ENV=development
```

## Running the Server

Development:
```bash
npm run dev
```

Production:
```bash
npm run build
npm start
```

## Database Models

### User
- Email authentication
- Role-based access (entrepreneur, investor, admin)
- Profile information

### Category
- Business categories
- Registration fees per category
- Created/managed by admins

### IntakeSubmission
- Entrepreneur's multi-step application
- Status tracking (pending, approved, rejected, submitted)
- Stores founder info, employment, business concept, etc.

### Business
- Two types: "submission" (entrepreneur form) and "public" (admin-created listing)
- Public listings visible to investors
- Submissions private to entrepreneur and admin

### Investment
- Records investor commitments
- Links to public businesses
- Amount and status tracking

## API Endpoints

See [API.md](./API.md) for complete endpoint documentation.

## Authentication Flow

1. User registers with email/password
2. Email verification sent via Nodemailer
3. User confirms email to activate account
4. Login generates JWT token
5. Token stored in secure HTTP-only cookie
6. Protected routes verify JWT in Authorization header

## File Uploads

- Files uploaded to Cloudinary
- 2MB size limit enforced
- Supported: PDF, PNG, JPG for documents and images
- Automatic optimization and CDN delivery

## Email Service

Configured with Nodemailer to send:
- Email verification links
- Password reset instructions
- Submission status notifications
- Investment confirmations

## Middleware

### Authentication
- JWT verification
- Role checking
- Session management

### Upload Handler
- File validation
- Size checking (2MB max)
- Cloudinary integration

## Error Handling

Standard error responses:
- 400 Bad Request - Invalid input
- 401 Unauthorized - Missing/invalid auth
- 403 Forbidden - Insufficient permissions
- 404 Not Found - Resource doesn't exist
- 500 Server Error - Internal issues
