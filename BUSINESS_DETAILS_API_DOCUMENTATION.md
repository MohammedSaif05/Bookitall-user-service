# Business Details API Documentation

This document provides complete API documentation with flow, payloads, and responses for the Business Details module.

---

## Overview

The Business Details API allows users to fetch complete information about a specific business, including business details, active services, and recent reviews. The endpoint combines data from multiple collections efficiently using optimized queries.

### Key Features

- **Complete Business Information**: Returns business name, category, address, images, and ratings
- **Service Listing**: Returns all active and discoverable services for the business
- **Recent Reviews**: Returns the 5 most recent reviews with user names (excluding empty reviews)
- **Privacy Protection**: Does not expose userId or phone numbers
- **Optimized Queries**: Uses aggregation pipeline for efficient data retrieval

---

## 1. Get Business Details

**Endpoint:** `GET /api/businesses/:businessId/details`

**Description:** Fetch complete business details including business information, services, and recent reviews.

**Content-Type:** `application/json`

**URL Parameters:**
- `businessId` (string, required) - The MongoDB ObjectId of the business

**Query Parameters (Optional):**
- `lat` (number, optional) - User's latitude (for distance calculation)
- `lng` (number, optional) - User's longitude (for distance calculation)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "business": {
      "businessId": "69615ddd7c6e18f8055b5a29",
      "businessName": "The Luxe Salon",
      "category": "saloon",
      "city": "Hosur",
      "images": [
        "https://pub-.../vendors/.../business-xxx-0",
        "https://pub-.../vendors/.../business-xxx-1"
      ],
      "rating": {
        "average": 4.9,
        "count": 520
      },
      "address": {
        "address": "122 Gandhi Nagar",
        "landmark": "Near XYZ",
        "city": "Hosur"
      },
      "distanceInKm": 1.2
    },
    "timings": [
      {
        "day": "Monday",
        "open": "08:00",
        "close": "23:00",
        "breaks": [],
        "isClosed": false
      },
      {
        "day": "Tuesday",
        "open": "08:00",
        "close": "23:00",
        "breaks": [],
        "isClosed": false
      },
      {
        "day": "Wednesday",
        "open": "08:00",
        "close": "23:00",
        "breaks": [
          {
            "start": "13:00",
            "end": "14:00"
          }
        ],
        "isClosed": false
      },
      {
        "day": "Thursday",
        "open": "08:00",
        "close": "23:00",
        "breaks": [],
        "isClosed": false
      },
      {
        "day": "Friday",
        "open": "08:00",
        "close": "23:00",
        "breaks": [],
        "isClosed": false
      },
      {
        "day": "Saturday",
        "open": "09:00",
        "close": "22:00",
        "breaks": [],
        "isClosed": false
      },
      {
        "day": "Sunday",
        "isClosed": true
      }
    ],
    "services": [
      {
        "serviceId": "69615eee7c6e18f8055b5a30",
        "serviceName": "Haircut",
        "price": 250,
        "durationInMinutes": 45,
        "serviceImage": "https://pub-.../vendors/.../service-xxx"
      },
      {
        "serviceId": "69615fff7c6e18f8055b5a31",
        "serviceName": "Hair Coloring",
        "price": 1200,
        "durationInMinutes": 120,
        "serviceImage": "https://pub-.../vendors/.../service-yyy"
      }
    ],
    "reviews": [
      {
        "userName": "John Doe",
        "rating": 5,
        "review": "Excellent service! Very professional staff.",
        "createdAt": "2026-01-12T10:20:00.000Z"
      },
      {
        "userName": "Jane Smith",
        "rating": 4,
        "review": "Great experience overall. Would recommend.",
        "createdAt": "2026-01-10T09:30:00.000Z"
      }
    ]
  }
}
```

**Response Fields:**

**Business Object:**
- `businessId` (string) - The MongoDB ObjectId of the business
- `businessName` (string) - Name of the business
- `category` (string) - Business category slug
- `city` (string) - City where the business is located
- `images` (string[]) - Array of business image URLs
- `rating` (object) - Business rating information
  - `average` (number) - Average rating (0-5, rounded to 1 decimal)
  - `count` (number) - Total number of ratings
- `address` (object) - Business address information
  - `address` (string) - Street address
  - `landmark` (string, optional) - Nearby landmark
  - `city` (string) - City name
- `distanceInKm` (number, optional) - Distance from user location in kilometers (only included if lat/lng query params provided)

**Timings Array:**
Each timing object contains:
- `day` (string) - Day name (Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday)
- `open` (string, optional) - Opening time in "HH:MM" format (only if not closed)
- `close` (string, optional) - Closing time in "HH:MM" format (only if not closed)
- `breaks` (array, optional) - Array of break periods (only if not closed)
  - `start` (string) - Break start time in "HH:MM" format
  - `end` (string) - Break end time in "HH:MM" format
- `isClosed` (boolean) - Whether the business is closed on this day

**Services Array:**
Each service object contains:
- `serviceId` (string) - The MongoDB ObjectId of the service
- `serviceName` (string) - Name of the service
- `price` (number) - Price of the service
- `durationInMinutes` (number) - Duration of the service in minutes
- `serviceImage` (string, optional) - Service image URL

**Reviews Array:**
Each review object contains:
- `userName` (string) - Name of the user who wrote the review (or "Anonymous" if not available)
- `rating` (number) - Rating value (1-5)
- `review` (string) - Review text
- `createdAt` (string) - ISO 8601 timestamp when the review was created

**Error Responses:**

**Invalid Business ID (400):**
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Invalid businessId format: \"invalid-id\"",
  "path": "/api/businesses/invalid-id/details",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Business Not Found (404):**
```json
{
  "success": false,
  "statusCode": 404,
  "message": "Business with id \"69615ddd7c6e18f8055b5a29\" not found",
  "path": "/api/businesses/69615ddd7c6e18f8055b5a29/details",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Sample cURL:**

**Without Distance:**
```bash
curl -X GET \
  'https://api.example.com/api/businesses/69615ddd7c6e18f8055b5a29/details' \
  -H 'Content-Type: application/json'
```

**With Distance Calculation:**
```bash
curl -X GET \
  'https://api.example.com/api/businesses/69615ddd7c6e18f8055b5a29/details?lat=12.4903&lng=78.5769' \
  -H 'Content-Type: application/json'
```

---

## Backend Flow

### STEP 1: Fetch Business

The backend fetches business details from the `businesses` collection:

**Fields Retrieved:**
- `businessName` - Business name
- `businessCategory` - Category slug
- `address` - Full address object (address, city, landmark)
- `images` - Array of image URLs
- `rating` - Rating aggregate (average, count)

**Validation:**
- Validates `businessId` format (must be valid MongoDB ObjectId)
- Returns 404 if business not found

### STEP 2: Fetch Services

The backend queries the `services` collection:

**Query Filters:**
- `businessId` - Matches the requested business
- `isActive = true` - Only active services
- `isDiscoverable = true` - Only discoverable services

**Fields Retrieved:**
- `serviceId` - Service ObjectId
- `serviceName` - Service name
- `price` - Service price
- `durationInMinutes` - Service duration
- `serviceImage` - Service image URL (optional)

**Note:** Services are returned in the order they appear in the database. No specific sorting is applied.

### STEP 3: Calculate Distance (Optional)

If `lat` and `lng` query parameters are provided:
- Calculates distance using Haversine formula
- Distance is calculated from user location to business location
- Returns distance in kilometers, rounded to 1 decimal place
- Only included in response if user location is provided

### STEP 4: Fetch Working Hours

The backend queries the `service_availability` collection:

**Query Filters:**
- `businessId` - Matches the requested business
- `isActive = true` - Only active availability records

**Data Structure:**
- Returns one document per day (enforced by unique index on `{ businessId, dayOfWeek }`)
- Each document contains: `dayOfWeek` (0-6), `startTime`, `endTime`, `breaks`

**Timings Array Building:**
- Always returns all 7 days (Sunday=0 to Saturday=6)
- Maps day numbers to day names:
  - 0 = Sunday
  - 1 = Monday
  - 2 = Tuesday
  - 3 = Wednesday
  - 4 = Thursday
  - 5 = Friday
  - 6 = Saturday

**Rules:**
- If availability document exists for a day → `isClosed = false`, includes `open`, `close`, `breaks`
- If no availability document exists for a day → `isClosed = true`, no other fields
- No merging or computation - direct mapping from database

### STEP 5: Fetch Reviews

The backend queries the `business_ratings` collection using an aggregation pipeline:

**Query Filters:**
- `businessId` - Matches the requested business
- `review` - Must exist, not null, and not empty string
  - Uses: `{ $exists: true, $ne: null, $nin: [null, ""] }`

**Sorting:**
- `updatedAt DESC` - Most recently updated reviews first

**Limit:**
- Maximum 5 reviews (never more)

**User Lookup:**
- Uses `$lookup` to join with `users` collection
- Retrieves `customerName` for each review
- Falls back to "Anonymous" if user not found or name not available

**Fields Retrieved:**
- `userName` - User's customer name (or "Anonymous")
- `rating` - Rating value (1-5)
- `review` - Review text
- `createdAt` - Review creation timestamp

**Privacy:**
- ❌ Does NOT expose `userId`
- ❌ Does NOT expose phone numbers
- Only exposes `customerName` (if available)

---

## Important Notes

### Business Information

1. **Rating Display**: If no ratings exist, `average = 0` and `count = 0`
2. **Images**: Returns empty array `[]` if no images are available
3. **Address**: `landmark` field is optional and may be omitted if not provided
4. **Distance**: Only included if `lat` and `lng` query parameters are provided. Calculated using Haversine formula, rounded to 1 decimal place.

### Working Hours

1. **Always 7 Days**: The `timings` array always contains all 7 days of the week, in order (Monday through Sunday)
2. **Closed Days**: If no availability document exists for a day, `isClosed = true` and no `open`/`close`/`breaks` fields
3. **Open Days**: If availability exists, includes:
   - `open`: Opening time in "HH:MM" format
   - `close`: Closing time in "HH:MM" format
   - `breaks`: Array of break periods (can be empty array `[]`)
4. **Break Format**: Each break has `start` and `end` times in "HH:MM" format
5. **No Merging**: Each day is mapped directly from the database - no computation or merging of times

### Services

1. **Filtering**: Only services with `isActive = true` AND `isDiscoverable = true` are returned
2. **Empty Services**: If a business has no active services, the `services` array will be empty `[]`
3. **Service Image**: The `serviceImage` field is optional and may be `undefined` if not provided

### Reviews

1. **Review Filtering**: Only reviews with non-empty review text are included
   - Reviews with only ratings (no text) are excluded
   - Empty strings are excluded
   - Null values are excluded

2. **Limit**: Always returns maximum 5 reviews (most recent first)
   - If fewer than 5 reviews exist, returns all available reviews
   - If no reviews exist, returns empty array `[]`

3. **User Names**: 
   - Uses `customerName` from the `users` collection
   - Falls back to "Anonymous" if:
     - User not found
     - `customerName` is not set
     - User document doesn't exist

4. **Sorting**: Reviews are sorted by `updatedAt DESC` (most recently updated first)
   - This ensures users see the latest reviews

5. **Privacy Protection**:
   - ❌ `userId` is never exposed in the response
   - ❌ Phone numbers are never exposed
   - Only `userName` (customerName) is included

### Performance

1. **Optimized Queries**: 
   - Business and services use simple `find()` queries
   - Reviews use aggregation pipeline with `$lookup` for efficient user name retrieval
   - No N+1 queries - all user lookups happen in a single aggregation

2. **Indexes Used**:
   - `businesses._id` - For business lookup
   - `services.businessId` - For service filtering
   - `services.isActive` - For service filtering
   - `services.isDiscoverable` - For service filtering
   - `business_ratings.businessId` - For review filtering
   - `business_ratings.updatedAt` - For review sorting
   - `users.userId` - For user name lookup

---

## Use Cases

### 1. View Business Profile

```bash
GET /api/businesses/69615ddd7c6e18f8055b5a29/details
```

Returns complete business information including all active services and recent reviews.

### 2. Display Service List

The `services` array can be used to:
- Display service cards in the UI
- Show pricing information
- Display service images
- Calculate total service duration

### 3. Show Recent Reviews

The `reviews` array can be used to:
- Display review cards
- Show user testimonials
- Build trust with potential customers
- Display rating distribution

---

## Error Handling

All endpoints follow consistent error handling:

- **400 Bad Request**: Invalid input (invalid businessId format)
- **404 Not Found**: Business not found
- **500 Internal Server Error**: Database errors, aggregation failures

All errors include:
- `success`: false
- `statusCode`: HTTP status code
- `message`: Descriptive error message
- `path`: The API endpoint path
- `timestamp`: ISO 8601 timestamp

---

## Complete Example

### Request
```bash
GET /api/businesses/69615ddd7c6e18f8055b5a29/details
```

### Response
```json
{
  "success": true,
  "data": {
    "business": {
      "businessId": "69615ddd7c6e18f8055b5a29",
      "businessName": "The Luxe Salon",
      "category": "saloon",
      "city": "Hosur",
      "images": [
        "https://pub-abc123.example.com/vendors/vendor123/business-xxx-0",
        "https://pub-abc123.example.com/vendors/vendor123/business-xxx-1"
      ],
      "rating": {
        "average": 4.9,
        "count": 520
      },
      "address": {
        "address": "122 Gandhi Nagar",
        "landmark": "Near XYZ Mall",
        "city": "Hosur"
      },
      "distanceInKm": 1.2
    },
    "timings": [
      {
        "day": "Monday",
        "open": "08:00",
        "close": "23:00",
        "breaks": [],
        "isClosed": false
      },
      {
        "day": "Tuesday",
        "open": "08:00",
        "close": "23:00",
        "breaks": [],
        "isClosed": false
      },
      {
        "day": "Wednesday",
        "open": "08:00",
        "close": "23:00",
        "breaks": [
          {
            "start": "13:00",
            "end": "14:00"
          }
        ],
        "isClosed": false
      },
      {
        "day": "Thursday",
        "open": "08:00",
        "close": "23:00",
        "breaks": [],
        "isClosed": false
      },
      {
        "day": "Friday",
        "open": "08:00",
        "close": "23:00",
        "breaks": [],
        "isClosed": false
      },
      {
        "day": "Saturday",
        "open": "09:00",
        "close": "22:00",
        "breaks": [],
        "isClosed": false
      },
      {
        "day": "Sunday",
        "isClosed": true
      }
    ],
    "services": [
      {
        "serviceId": "69615eee7c6e18f8055b5a30",
        "serviceName": "Haircut",
        "price": 250,
        "durationInMinutes": 45,
        "serviceImage": "https://pub-abc123.example.com/vendors/vendor123/service-xxx"
      },
      {
        "serviceId": "69615fff7c6e18f8055b5a31",
        "serviceName": "Hair Coloring",
        "price": 1200,
        "durationInMinutes": 120,
        "serviceImage": "https://pub-abc123.example.com/vendors/vendor123/service-yyy"
      },
      {
        "serviceId": "69615ggg7c6e18f8055b5a32",
        "serviceName": "Hair Spa",
        "price": 800,
        "durationInMinutes": 90
      }
    ],
    "reviews": [
      {
        "userName": "John Doe",
        "rating": 5,
        "review": "Excellent service! Very professional staff and clean environment.",
        "createdAt": "2026-01-12T10:20:00.000Z"
      },
      {
        "userName": "Jane Smith",
        "rating": 4,
        "review": "Great experience overall. Would definitely recommend to others.",
        "createdAt": "2026-01-10T09:30:00.000Z"
      },
      {
        "userName": "Anonymous",
        "rating": 5,
        "review": "Amazing place! Best salon in the area.",
        "createdAt": "2026-01-08T14:15:00.000Z"
      }
    ]
  }
}
```

---

## Data Privacy

### What is Exposed

✅ **Business Information:**
- Business name, category, city
- Address (street, landmark, city)
- Images
- Rating aggregates

✅ **Services:**
- Service names, prices, durations
- Service images

✅ **Reviews:**
- User names (customerName)
- Ratings and review text
- Review timestamps

### What is NOT Exposed

❌ **User Identifiers:**
- `userId` - Never exposed in reviews or anywhere else

❌ **Contact Information:**
- Phone numbers (mobileNo, alternatePhone)
- Email addresses
- Any vendor contact details

❌ **Internal Data:**
- Business internal IDs (vendorId)
- Service internal references
- Database ObjectIds (converted to strings)

---

## Future Enhancements (Optional)

Potential future features that could be added:
- Pagination for reviews (show more than 5)
- Filter reviews by rating (e.g., only 5-star reviews)
- Include business hours/availability
- Include staff information
- Include business description
- Include business contact information (with privacy controls)
- Include service descriptions
- Include service categories
- Include service gender preferences
- Include distance from user location (if coordinates provided)
- Include business verification status
- Include business documents/licenses

---

## Integration Notes

### Frontend Implementation

1. **Business Details Display:**
   - Use `business` object for header/card display
   - Display images in a carousel or gallery
   - Show rating with star display
   - Display address with map integration

2. **Services List:**
   - Render services as cards or list items
   - Display price prominently
   - Show duration for booking purposes
   - Handle missing service images gracefully

3. **Reviews Section:**
   - Display reviews in a scrollable list
   - Show user names with avatars (if available)
   - Format dates appropriately
   - Handle "Anonymous" users gracefully
   - Show rating with stars

### Error Handling

- Always check for `success: true` before accessing data
- Handle empty arrays gracefully (services, reviews)
- Show appropriate messages when business not found
- Handle network errors and retries

### Caching Considerations

- Business details can be cached (changes infrequently)
- Services may change more often (consider shorter cache)
- Reviews are dynamic (cache with short TTL or don't cache)

