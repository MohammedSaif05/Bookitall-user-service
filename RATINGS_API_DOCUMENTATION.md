# Ratings API Documentation

This document provides complete API documentation with flow, payloads, and responses for the Ratings module.

---

## Overview

The Ratings module allows users to submit and update ratings for businesses. The system maintains aggregate rating statistics (average, count, total) on the business document and handles both first-time ratings and updates atomically using MongoDB transactions.

### Key Features

- **Atomic Operations**: All rating updates use MongoDB transactions to ensure data consistency
- **Automatic Aggregation**: Business rating aggregates (average, count, total) are automatically maintained
- **Update Support**: Users can update their existing ratings, and aggregates are recalculated efficiently
- **Validation**: Comprehensive validation for rating values (1-5), business existence, and user permissions

---

## 1. Submit or Update Rating

**Endpoint:** `PATCH /api/businesses/:businessId/rating`

**Description:** Submit a new rating or update an existing rating for a business. The system automatically handles both cases:
- **CASE A (First Time)**: Creates new rating document and increments business aggregate
- **CASE B (Update)**: Updates existing rating and recalculates business aggregate

**Content-Type:** `application/json`

**URL Parameters:**
- `businessId` (string, required) - The MongoDB ObjectId of the business

**Request Body:**
```json
{
  "userId": "h5uwiri44",
  "rating": 4,
  "review": "Great service! Very professional staff."
}
```

**Field Validations:**
- `userId` (string, required) - The user's ID who is submitting the rating
- `rating` (number, required) - Must be an integer between 1 and 5 (inclusive)
- `review` (string, optional) - Optional text review/comment

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "businessId": "65a1b2c3d4e5f6g7h8i9j0k1",
    "rating": {
      "average": 4.9,
      "count": 520
    },
    "userRating": 4
  }
}
```

**Response Fields:**
- `businessId` (string) - The business ID
- `rating.average` (number) - Average rating (rounded to 1 decimal place)
- `rating.count` (number) - Total number of ratings
- `userRating` (number) - The rating value submitted by the user

**Error Responses:**

**Invalid Business ID (400):**
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Invalid businessId format: \"invalid-id\"",
  "path": "/api/businesses/invalid-id/rating",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Business Not Found (404):**
```json
{
  "success": false,
  "statusCode": 404,
  "message": "Business with id \"65a1b2c3d4e5f6g7h8i9j0k1\" not found",
  "path": "/api/businesses/65a1b2c3d4e5f6g7h8i9j0k1/rating",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Invalid Rating Value (400):**
```json
{
  "success": false,
  "statusCode": 400,
  "message": [
    "rating must be a number conforming to the specified constraints",
    "rating must not be less than 1",
    "rating must not be greater than 5"
  ],
  "path": "/api/businesses/65a1b2c3d4e5f6g7h8i9j0k1/rating",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Sample cURL:**

**First Time Rating:**
```bash
curl -X PATCH \
  'https://api.example.com/api/businesses/65a1b2c3d4e5f6g7h8i9j0k1/rating' \
  -H 'Content-Type: application/json' \
  -d '{
    "userId": "h5uwiri44",
    "rating": 4,
    "review": "Great service! Very professional staff."
  }'
```

**Update Existing Rating:**
```bash
curl -X PATCH \
  'https://api.example.com/api/businesses/65a1b2c3d4e5f6g7h8i9j0k1/rating' \
  -H 'Content-Type: application/json' \
  -d '{
    "userId": "h5uwiri44",
    "rating": 5,
    "review": "Updated review: Even better than before!"
  }'
```

**What Happens Behind the Scenes:**

### CASE A: First Time Rating
1. Validates businessId format and existence
2. Checks if user already rated this business (not found)
3. **Transaction Start**
4. Inserts new document into `business_ratings` collection with:
   - `businessId`: The business ObjectId
   - `userId`: The user ID
   - `rating`: The rating value (1-5)
   - `review`: Optional review text
5. Updates `businesses` document:
   - `rating.count = count + 1`
   - `rating.total = total + newRating`
   - `rating.average = total / count` (rounded to 1 decimal)
6. **Transaction Commit**

### CASE B: Updating Existing Rating
1. Validates businessId format and existence
2. Finds existing rating document for this user and business
3. **Transaction Start**
4. Reads old rating value (e.g., old = 3)
5. Updates `business_ratings` document:
   - `rating`: Set to new value (e.g., new = 5)
   - `review`: Update if provided
6. Updates `businesses` document:
   - `rating.total = total - old + new`
   - `rating.count`: Stays the same
   - `rating.average = total / count` (rounded to 1 decimal)
7. **Transaction Commit**

**Important Notes:**
- All operations are atomic (MongoDB transaction) - if any step fails, everything rolls back
- Business rating aggregates are always kept in sync
- Average is rounded to 1 decimal place for display
- The compound index `{ businessId: 1, userId: 1 }` ensures one rating per user per business

---

## 2. Get User's Rating

**Endpoint:** `GET /api/businesses/:businessId/:userId/my-rating`

**Description:** Retrieve a specific user's rating and review for a business, including timestamps.

**Content-Type:** `application/json`

**URL Parameters:**
- `businessId` (string, required) - The MongoDB ObjectId of the business
- `userId` (string, required) - The user's ID

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "rating": 4,
    "review": "Great service! Very professional staff.",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Response Fields:**
- `rating` (number) - The rating value (1-5)
- `review` (string, optional) - The review text (if provided)
- `createdAt` (string) - ISO 8601 timestamp when rating was first created
- `updatedAt` (string) - ISO 8601 timestamp when rating was last updated

**Error Responses:**

**Invalid Business ID (400):**
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Invalid businessId format: \"invalid-id\"",
  "path": "/api/businesses/invalid-id/user123/my-rating",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Rating Not Found (404):**
```json
{
  "success": false,
  "statusCode": 404,
  "message": "Rating not found for businessId \"65a1b2c3d4e5f6g7h8i9j0k1\" and userId \"h5uwiri44\"",
  "path": "/api/businesses/65a1b2c3d4e5f6g7h8i9j0k1/h5uwiri44/my-rating",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Sample cURL:**
```bash
curl -X GET \
  'https://api.example.com/api/businesses/65a1b2c3d4e5f6g7h8i9j0k1/h5uwiri44/my-rating' \
  -H 'Content-Type: application/json'
```

**What Happens:**
1. Validates businessId format
2. Queries `business_ratings` collection for matching `businessId` and `userId`
3. Returns rating data with timestamps if found
4. Returns 404 if no rating exists for this user-business combination

---

## Database Schema

### Business Rating Schema (`business_ratings` collection)

```typescript
{
  businessId: ObjectId,  // Reference to Business document
  userId: string,        // User ID who submitted the rating
  rating: number,        // Rating value (1-5)
  review?: string,       // Optional review text
  createdAt: Date,       // Auto-generated timestamp
  updatedAt: Date        // Auto-generated timestamp
}
```

**Indexes:**
- Compound unique index: `{ businessId: 1, userId: 1 }` - Ensures one rating per user per business
- Index on `businessId` for fast lookups
- Index on `userId` for fast lookups

### Business Schema Update (`businesses` collection)

The `businesses` collection now includes a `rating` field:

```typescript
{
  // ... existing business fields ...
  rating: {
    average: number,  // Average rating (rounded to 1 decimal)
    count: number,    // Total number of ratings
    total: number     // Sum of all ratings
  }
}
```

**Default Values:**
- `average`: 0
- `count`: 0
- `total`: 0

---

## Complete Workflow Example

### Step 1: User Submits First Rating
```bash
PATCH /api/businesses/65a1b2c3d4e5f6g7h8i9j0k1/rating
Content-Type: application/json

{
  "userId": "h5uwiri44",
  "rating": 4,
  "review": "Great service!"
}

Response:
{
  "success": true,
  "data": {
    "businessId": "65a1b2c3d4e5f6g7h8i9j0k1",
    "rating": {
      "average": 4.0,
      "count": 1
    },
    "userRating": 4
  }
}
```

### Step 2: User Updates Rating
```bash
PATCH /api/businesses/65a1b2c3d4e5f6g7h8i9j0k1/rating
Content-Type: application/json

{
  "userId": "h5uwiri44",
  "rating": 5,
  "review": "Updated: Even better!"
}

Response:
{
  "success": true,
  "data": {
    "businessId": "65a1b2c3d4e5f6g7h8i9j0k1",
    "rating": {
      "average": 5.0,
      "count": 1
    },
    "userRating": 5
  }
}
```

### Step 3: User Retrieves Their Rating
```bash
GET /api/businesses/65a1b2c3d4e5f6g7h8i9j0k1/h5uwiri44/my-rating

Response:
{
  "success": true,
  "data": {
    "rating": 5,
    "review": "Updated: Even better!",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T11:45:00.000Z"
  }
}
```

---

## Important Notes

1. **Transaction Safety**: All rating operations use MongoDB transactions. If any step fails, the entire operation rolls back, ensuring data consistency.

2. **Aggregate Maintenance**: Business rating aggregates are automatically maintained. You don't need to manually recalculate averages - the system handles it atomically.

3. **Efficient Updates**: When updating a rating, the system uses the formula `total = total - old + new` instead of re-scanning all ratings, making updates very efficient even for businesses with thousands of ratings.

4. **One Rating Per User**: The unique compound index ensures each user can only have one rating per business. Subsequent PATCH requests update the existing rating rather than creating duplicates.

5. **Rating Validation**: The system validates that:
   - Rating exists in the request
   - Rating is between 1 and 5 (inclusive)
   - BusinessId exists and is valid
   - BusinessId format is a valid MongoDB ObjectId

6. **Review Field**: The review field is optional. Users can submit ratings without reviews, and reviews can be added or updated later.

7. **Average Rounding**: Average ratings are rounded to 1 decimal place for consistent display (e.g., 4.666... becomes 4.7).

---

## Error Handling

All endpoints follow consistent error handling:

- **400 Bad Request**: Invalid input (invalid businessId format, invalid rating value, missing required fields)
- **404 Not Found**: Business or rating not found
- **500 Internal Server Error**: Database errors, transaction failures (automatically rolled back)

All errors include:
- `success`: false
- `statusCode`: HTTP status code
- `message`: Descriptive error message
- `path`: The API endpoint path
- `timestamp`: ISO 8601 timestamp

---

## Performance Considerations

1. **Indexes**: The compound unique index `{ businessId: 1, userId: 1 }` ensures fast lookups when checking for existing ratings.

2. **Atomic Updates**: Using MongoDB transactions ensures that rating aggregates are always consistent, even under concurrent load.

3. **Efficient Aggregation**: Update operations use incremental calculations (`total - old + new`) rather than re-scanning all ratings, making updates O(1) instead of O(n).

4. **No Re-scanning**: The system never needs to count or sum all ratings from scratch - aggregates are maintained incrementally.

---

## Future Enhancements (Optional)

Potential future features that could be added:
- Bulk rating retrieval for multiple businesses
- Rating statistics (distribution of 1-5 star ratings)
- Rating moderation/flagging
- Rating replies from business owners
- Rating sorting and filtering
- Rating analytics dashboard

