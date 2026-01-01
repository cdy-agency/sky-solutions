# SKY Solutions API Documentation

Base URL: \`http://localhost:5000/api\`

## Authentication Endpoints

### Register
```
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "role": "entrepreneur" | "investor" | "admin"
}

Response: { token, user, message }
```

### Login
```
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}

Response: { token, user, message }
```

### Verify Email
```
POST /auth/verify/:token
```

### Logout
```
POST /auth/logout
Authorization: Bearer {token}
```

## Admin Endpoints

### Categories

```
GET /admin/categories
GET /admin/categories/:id
POST /admin/categories
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "E-commerce",
  "description": "Online retail businesses",
  "registrationFee": 500
}

PUT /admin/categories/:id
DELETE /admin/categories/:id
```

### Business Submissions Review

```
GET /admin/submissions
GET /admin/submissions/:id
POST /admin/submissions/:id/approve
POST /admin/submissions/:id/reject
Content-Type: application/json

{
  "feedback": "Needs more market research"
}
```

### Create Public Listings

```
POST /admin/businesses
Content-Type: multipart/form-data
Authorization: Bearer {token}

{
  "submission_id": "submission_id",
  "description": "Business description",
  "image": File,
  "document": File,
  "needed_funds": 50000,
  "equity_percentage": 10
}
```

### User Management

```
GET /admin/users
GET /admin/users/:id
PUT /admin/users/:id
DELETE /admin/users/:id
```

## Entrepreneur Endpoints

### Submit Intake Form

```
POST /entrepreneur/intake
Authorization: Bearer {token}
Content-Type: multipart/form-data

{
  "founder_name": "John Doe",
  "founder_email": "john@example.com",
  "business_name": "Tech Startup",
  "category_id": "category_id",
  "business_document": File,
  "employment_status": "employed",
  "business_concept": "AI-powered tool",
  "market_analysis": "Market size is \$1B",
  "funding_needed": 100000,
  "commitment": true
}
```

### Get Intake Forms

```
GET /entrepreneur/intake
Authorization: Bearer {token}
```

### Submit Business Plan

```
POST /entrepreneur/businesses
Authorization: Bearer {token}
Content-Type: multipart/form-data

{
  "business_name": "My Startup",
  "category_id": "category_id",
  "business_plan": File
}
```

### Get My Submissions

```
GET /entrepreneur/businesses
Authorization: Bearer {token}
```

## Investor Endpoints

### Browse Public Businesses

```
GET /investor/businesses
GET /investor/businesses/:id
```

### Make Investment

```
POST /investor/investments
Authorization: Bearer {token}
Content-Type: application/json

{
  "business_id": "business_id",
  "amount": 10000
}
```

### Get My Investments

```
GET /investor/investments
Authorization: Bearer {token}
```

## Error Responses

All errors follow standard format:

```json
{
  "message": "Error description",
  "error": "error_code"
}
```

Common status codes:
- 200 OK - Request successful
- 201 Created - Resource created
- 400 Bad Request - Invalid input
- 401 Unauthorized - Missing authentication
- 403 Forbidden - Insufficient permissions
- 404 Not Found - Resource not found
- 500 Internal Server Error
