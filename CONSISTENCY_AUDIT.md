# Project Consistency Audit Report

## Issues Found

### 1. User ID Inconsistency (CRITICAL)

**Problem**: Some routes use `req.user?.id` while User model uses `_id`

**Affected Files**:
- `backend/src/routes/notifications.ts` - Lines 10, 51
- `backend/src/routes/library.ts` - Line 49
- `backend/src/routes/shares.ts` - Line 19

**Impact**: These routes will fail because `req.user` (IUser) doesn't have an `id` property, only `_id`

**Fix**: Change all `req.user?.id` to `req.user?._id`

---

### 2. Response Format Inconsistency

**Problem**: Login and profile endpoints return `id` instead of `_id`, but other endpoints may return `_id`

**Affected Files**:
- `backend/src/routes/auth.ts` - Lines 115, 247, 275

**Impact**: Frontend may expect inconsistent field names

**Current Behavior**:
- Login returns: `{ id: user._id, ... }`
- Profile returns: `{ id: user._id, ... }`
- But user model has `_id`

**Recommendation**: Standardize on either `_id` or `id` throughout

---

### 3. Field Naming Convention

**Backend**: Uses `snake_case` consistently ✅
- `category_id`, `business_plan_url`, `user_id`, `is_active`, etc.

**Frontend**: 
- FormData uses `snake_case` ✅ (correct)
- Need to verify response handling

---

### 4. Business Model Field Optionality

**Issue**: `category_id` in Business model is now optional (after recent change), but some routes may still assume it's required

**Status**: ✅ Already fixed - category_id is optional

---

### 5. File Upload Field Names

**Frontend sends**: `business_plan` ✅
**Backend expects**: `business_plan` ✅
**Status**: Consistent

---

## Summary

### ✅ Fixed Issues

1. **User ID Inconsistency** (CRITICAL - FIXED)
   - Fixed `req.user?.id` → `req.user?._id` in:
     - `backend/src/routes/notifications.ts` (2 instances)
     - `backend/src/routes/library.ts` (1 instance)
     - `backend/src/routes/shares.ts` (1 instance)

2. **Missing Business Model Fields** (FIXED)
   - Added `needed_funds?: number` to Business model
   - Added `equity_percentage?: number` to Business model
   - Updated admin routes to handle these fields
   - Fixed aggregation query to handle optional `needed_funds`

3. **Missing Admin Endpoints** (FIXED)
   - Added `POST /admin/businesses/public` - Create public business
   - Added `GET /admin/businesses/public` - Get public businesses
   - Added `PUT /admin/businesses/public/:id` - Update public business

4. **Category Field Naming** (FIXED)
   - Frontend was using `category` but backend returns `category_id` (populated object)
   - Fixed all frontend interfaces to use `category_id`
   - Updated all frontend displays to handle `category_id.name`
   - Fixed form submission to use `category_id` instead of `category`

5. **Category Fee Field** (FIXED)
   - Frontend was sending `fee` but backend expects `registration_fee`
   - Fixed `app/admin/categories/page.tsx` to send `registration_fee`

6. **Business Plan Field** (FIXED)
   - Fixed `businessPlan_url` → `business_plan_url` in admin page
   - Updated interfaces to match backend

7. **Business Status Enum** (FIXED)
   - Added missing statuses: `"draft"`, `"in_review"`, `"active"` to frontend interfaces
   - Updated status color mapping

8. **Response Structure** (FIXED)
   - Fixed `getPublicBusinesses` to handle paginated response `{ businesses, pagination }`
   - Fixed `getBusinesses` (investor) to handle paginated response

9. **Investor Business Interface** (FIXED)
   - Updated to match backend response structure
   - Added proper handling for `category_id` (populated object)
   - Added fallback for `needed_funds` calculation from shares

### ✅ Verified Consistent

1. **Field Naming**: Backend uses `snake_case` consistently ✅
2. **File Upload**: Field names match (`business_plan`) ✅
3. **Response Format**: Backend converts `_id` to `id` for frontend (intentional) ✅
4. **Category Optionality**: Business model and routes handle optional category ✅
5. **User Response**: Login/profile return `id` (converted from `_id`) - matches frontend expectation ✅

### 📋 Field Mapping Reference

| Frontend Expects | Backend Returns | Status |
|-----------------|-----------------|--------|
| `id` | `id` (converted from `_id`) | ✅ Consistent |
| `category` | `category_id` (populated object) | ✅ Fixed |
| `category_id.name` | `category_id.name` | ✅ Fixed |
| `business_plan` | `business_plan` | ✅ Consistent |
| `business_plan_url` | `business_plan_url` | ✅ Fixed |
| `needed_funds` | `needed_funds` | ✅ Added to model |
| `equity_percentage` | `equity_percentage` | ✅ Added to model |
| `registration_fee` | `registration_fee` | ✅ Fixed |
| `is_active` | `is_active` | ✅ Consistent |
| `intake_completed` | `intake_completed` | ✅ Consistent |

### 🎯 All Issues Resolved

All inconsistencies have been identified and fixed. The project now has:
- ✅ Consistent field naming (snake_case)
- ✅ Matching interfaces between frontend and backend
- ✅ Proper handling of populated fields (category_id)
- ✅ Complete model fields matching frontend usage
- ✅ All required endpoints implemented

