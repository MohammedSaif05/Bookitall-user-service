# Nearby Businesses API Documentation

This document provides complete API documentation with flow, payloads, and responses for the Nearby Businesses module.

---

## Overview

The Nearby Businesses API allows users to search for businesses near their location with geospatial queries, service price aggregation, ratings, and flexible sorting options. The system uses a single MongoDB aggregation pipeline for optimal performance.

### Key Features

- **Geospatial Search**: Uses `$geoNear` for efficient location-based queries
- **Service Aggregation**: Automatically computes price ranges from active services
- **Business Filtering**: Only returns businesses with active, discoverable services
- **Rating Integration**: Includes business ratings (average, count) in results
- **Flexible Sorting**: Sort by distance (closest first) or rating (highest first)
- **Pagination**: Supports pagination with `hasMore` indicator
- **Performance Optimized**: Single aggregation pipeline, no N+1 queries

---

## 1. Get Nearby Businesses

**Endpoint:** `GET /api/businesses/nearby`

**Description:** Search for businesses near a specified location with optional filtering by category, sorting, and pagination.

**Content-Type:** `application/json`

**Query Parameters:**

| Parameter | Type | Required | Default | Constraints | Description |
|-----------|------|----------|---------|-------------|-------------|
| `lat` | number | Yes | - | - | Latitude of the search location |
| `lng` | number | Yes | - | - | Longitude of the search location |
| `radius` | number | No | 10000 | 100 - 25000 | Search radius in meters |
| `category` | string | No | - | - | Business category slug (e.g., "turf", "saloon") |
| `page` | number | No | 1 | ≥ 1 | Page number for pagination |
| `limit` | number | No | 10 | 1 - 20 | Number of results per page |
| `sort` | string | No | "distance" | "distance" \| "rating" | Sort order |

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "businesses": [
      {
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
        "distanceInKm": 1.2,
        "price": {
          "type": "range",
          "min": 250,
          "max": 1200
        }
      }
    ],
    "page": 1,
    "limit": 10,
    "hasMore": true
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
- `distanceInKm` (number) - Distance from search location in kilometers (rounded to 1 decimal)
- `price` (object) - Price range information
  - `type` (string) - Either `"single"` (1 service) or `"range"` (multiple services)
  - `min` (number) - Minimum service price
  - `max` (number) - Maximum service price

**Pagination Object:**
- `page` (number) - Current page number
- `limit` (number) - Number of results per page
- `hasMore` (boolean) - Whether there are more results available

**Error Responses:**

**Missing Required Parameters (400):**
```json
{
  "success": false,
  "statusCode": 400,
  "message": [
    "lat must be a number conforming to the specified constraints",
    "lng must be a number conforming to the specified constraints"
  ],
  "path": "/api/businesses/nearby",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Invalid Radius (400):**
```json
{
  "success": false,
  "statusCode": 400,
  "message": [
    "radius must not be less than 100",
    "radius must not be greater than 25000"
  ],
  "path": "/api/businesses/nearby?lat=12.4903&lng=78.5769&radius=50000",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Invalid Sort Parameter (400):**
```json
{
  "success": false,
  "statusCode": 400,
  "message": "sort must be either 'distance' or 'rating'",
  "path": "/api/businesses/nearby?lat=12.4903&lng=78.5769&sort=price",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Sample cURL Requests:**

**Basic Request (Default Radius, Distance Sort):**
```bash
curl -X GET \
  'https://api.example.com/api/businesses/nearby?lat=12.4903&lng=78.5769' \
  -H 'Content-Type: application/json'
```

**With Category Filter:**
```bash
curl -X GET \
  'https://api.example.com/api/businesses/nearby?lat=12.4903&lng=78.5769&category=turf' \
  -H 'Content-Type: application/json'
```

**With Custom Radius and Rating Sort:**
```bash
curl -X GET \
  'https://api.example.com/api/businesses/nearby?lat=12.4903&lng=78.5769&radius=5000&sort=rating' \
  -H 'Content-Type: application/json'
```

**With Pagination:**
```bash
curl -X GET \
  'https://api.example.com/api/businesses/nearby?lat=12.4903&lng=78.5769&page=2&limit=20' \
  -H 'Content-Type: application/json'
```

---

## Backend Flow

### STEP 1: Validate Input

The backend validates and applies defaults/clamps:

1. **Required Fields**: Ensures `lat` and `lng` exist and are valid numbers
2. **Defaults**:
   - `radius = 10000` meters (10 km)
   - `page = 1`
   - `limit = 10`
   - `sort = "distance"`
3. **Clamps**:
   - `radius`: Minimum 100m, Maximum 25000m (25 km)
   - `limit`: Minimum 1, Maximum 20
   - `page`: Minimum 1

### STEP 2: Geo Query on Businesses

Uses `$geoNear` aggregation stage (must be first stage):

- **Center**: User location `[lng, lat]` (longitude first for GeoJSON)
- **Max Distance**: `radius` in meters
- **Filters** (applied in `$geoNear.query`):
  - `isActive = true`
  - `isDiscoverable = true`
  - `businessCategory = category` (if provided)
- **Distance Field**: `distanceInMeters` (automatically calculated)

Result includes: business document + `distanceInMeters` field

### STEP 3: Aggregate Services → Price Range

For each business, the pipeline:

1. **$lookup**: Joins with `services` collection matching `businessId`
2. **$unwind**: Expands services array (excludes businesses without services)
3. **$match**: Filters services:
   - `services.isActive = true`
   - `services.isDiscoverable = true`
4. **$group**: Computes per business:
   - `minPrice`: Minimum service price
   - `maxPrice`: Maximum service price
   - `serviceCount`: Number of active services
   - Preserves business fields (`businessName`, `category`, `city`, `images`, `rating`, `distanceInMeters`)

**Business Exclusion Rule**: Businesses with no active services are automatically excluded (via `preserveNullAndEmptyArrays: false`)

**Price Type Logic**:
- If `serviceCount = 1` → `priceType = "single"`
- If `serviceCount > 1` → `priceType = "range"`

### STEP 4: Attach Ratings

Ratings are read from `businesses.rating` aggregate field (already computed):

- `average`: Average rating (0-5, rounded to 1 decimal)
- `count`: Total number of ratings

If missing: `average = 0`, `count = 0` (handled via `$ifNull`)

### STEP 5: Shape Output

Pipeline projects and transforms:

- `distanceInMeters` → `distanceInKm` (divided by 1000, rounded to 1 decimal)
- `serviceCount` → `price.type` ("single" or "range")
- Selects required fields for response

### STEP 6: Sorting

**Default (`sort = "distance")**:
- Primary: `distanceInKm ASC` (closest first)

**Optional (`sort = "rating")**:
- Primary: `rating.average DESC` (highest rating first)
- Secondary: `distanceInKm ASC` (closest first for same rating)

### STEP 7: Pagination

Pipeline applies:
- `$skip`: `(page - 1) × limit`
- `$limit`: `limit + 1` (fetches one extra to determine `hasMore`)

**hasMore Logic**:
- If `results.length > limit` → `hasMore = true`, remove last item
- Otherwise → `hasMore = false`

---

## Performance Optimization

### Single Aggregation Pipeline

All operations are performed in **one MongoDB aggregation pipeline**:
- No N+1 queries
- No app-level joins
- All filters pushed to database
- Results limited early (via `$limit`)

### Indexes Used

**Businesses Collection:**
- `{ location: "2dsphere" }` - For `$geoNear` geospatial queries
- `{ isActive: 1 }` - For filtering active businesses
- `{ businessCategory: 1 }` - For category filtering

**Services Collection:**
- `{ businessId: 1 }` - For `$lookup` joins
- `{ isActive: 1 }` - For filtering active services
- `{ isDiscoverable: 1 }` - For filtering discoverable services

### Query Efficiency

1. **Early Filtering**: Business filters applied in `$geoNear.query` for better performance
2. **Service Filtering**: Active/discoverable services filtered before grouping
3. **Limited Results**: Pagination applied at database level
4. **Distance Calculation**: Done automatically by MongoDB (no manual computation)

---

## Use Cases

### 1. Find Nearest Businesses

```bash
GET /api/businesses/nearby?lat=12.4903&lng=78.5769
```

Returns 10 nearest businesses, sorted by distance.

### 2. Find Businesses in Category

```bash
GET /api/businesses/nearby?lat=12.4903&lng=78.5769&category=turf
```

Returns nearest businesses in "turf" category.

### 3. Find Highest Rated Businesses

```bash
GET /api/businesses/nearby?lat=12.4903&lng=78.5769&sort=rating
```

Returns businesses sorted by rating (highest first), then by distance.

### 4. Search Within Custom Radius

```bash
GET /api/businesses/nearby?lat=12.4903&lng=78.5769&radius=2000
```

Searches within 2 km (2000 meters).

### 5. Paginated Results

```bash
GET /api/businesses/nearby?lat=12.4903&lng=78.5769&page=2&limit=20
```

Returns page 2 with 20 results per page.

---

## Important Notes

### Business Exclusion Rules

1. **No Active Services**: Businesses without any active, discoverable services are automatically excluded from results
2. **Inactive Businesses**: Only businesses with `isActive = true` and `isDiscoverable = true` are included
3. **No Geo Index**: Businesses without valid `location` coordinates are excluded by `$geoNear`

### Price Type Behavior

- **Single Service**: If a business has exactly 1 active service, `price.type = "single"` and `min = max`
- **Multiple Services**: If a business has 2+ active services, `price.type = "range"` with `min` and `max` values
- **No Services**: Business is excluded (see above)

### Distance Calculation

- Distance is calculated by MongoDB using the 2dsphere index
- Always returned in **kilometers** (rounded to 1 decimal place)
- Distance is calculated from the point `[lng, lat]` to each business's `location.coordinates`

### Rating Display

- Ratings are pre-computed aggregates on the `businesses` collection
- If no ratings exist: `average = 0`, `count = 0`
- Average is rounded to 1 decimal place

### Pagination Behavior

- Maximum results per page: 20
- `hasMore = true` indicates more results are available
- To get next page, increment `page` parameter
- Empty result set: `businesses = []`, `hasMore = false`

---

## Error Handling

All endpoints follow consistent error handling:

- **400 Bad Request**: Invalid input (missing required params, invalid values, out of range)
- **500 Internal Server Error**: Database errors, aggregation failures

All errors include:
- `success`: false
- `statusCode`: HTTP status code
- `message`: Descriptive error message or array of validation errors
- `path`: The API endpoint path
- `timestamp`: ISO 8601 timestamp

---

## Complete Example

### Request
```bash
GET /api/businesses/nearby?lat=12.4903&lng=78.5769&radius=5000&category=saloon&sort=rating&page=1&limit=10
```

### Response
```json
{
  "success": true,
  "data": {
    "businesses": [
      {
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
        "distanceInKm": 1.2,
        "price": {
          "type": "range",
          "min": 250,
          "max": 1200
        }
      },
      {
        "businessId": "69615ddd7c6e18f8055b5a30",
        "businessName": "Elite Hair Studio",
        "category": "saloon",
        "city": "Hosur",
        "images": [
          "https://pub-abc123.example.com/vendors/vendor456/business-yyy-0"
        ],
        "rating": {
          "average": 4.8,
          "count": 340
        },
        "distanceInKm": 2.5,
        "price": {
          "type": "single",
          "min": 500,
          "max": 500
        }
      }
    ],
    "page": 1,
    "limit": 10,
    "hasMore": false
  }
}
```

---

## Future Enhancements (Optional)

Potential future features that could be added:
- Filter by price range (minPrice, maxPrice)
- Filter by minimum rating
- Filter by business type
- Include business hours/availability in results
- Include distance-based sorting weights
- Support for polygon/area-based searches
- Caching for frequently accessed locations
- Analytics on popular search locations

