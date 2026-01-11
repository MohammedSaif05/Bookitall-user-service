# Category Management APIs - Documentation

This document provides complete API documentation with sample payloads for all category management endpoints.

---

## 1. Upload Category Image (Step 1)

**Endpoint:** `POST /api/admin/categories/upload-category-image`

**Description:** Uploads category image to R2 storage (iOS-safe, 2-step flow)

**Content-Type:** `multipart/form-data`

**Request Body (Form Data):**
```form-data
image: <File> (image file - jpg, png, etc.)
```

**Sample cURL:**
```bash
curl -X POST \
  'https://api.example.com/api/admin/categories/upload-category-image' \
  -H 'Content-Type: multipart/form-data' \
  -F 'image=@/path/to/category-image.jpg'
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "imageUrl": "https://pub-856ab7e271b341b8b280eef24b5a9a84.r2.dev/categories/category-123e4567-e89b-12d3-a456-426614174000"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "statusCode": 400,
  "message": "image file is required",
  "path": "/api/admin/categories/upload-category-image",
  "timestamp": "2026-01-10T20:00:00.000Z"
}
```

---

## 2. Add Category (Step 2)

**Endpoint:** `POST /api/admin/categories/add-prod-category`

**Description:** Saves category metadata to `categories` collection. Generates slug from name and enforces uniqueness.

**Content-Type:** `application/json`

**Request Body (JSON):**
```json
{
  "name": "Turf",
  "image": "https://pub-856ab7e271b341b8b280eef24b5a9a84.r2.dev/categories/category-123e4567-e89b-12d3-a456-426614174000",
  "order": 1
}
```

**Field Descriptions:**
- `name` (string, required) - Category name (slug will be generated from this)
- `image` (string, required, URL) - Image URL from Step 1
- `order` (number, required, min: 0) - Display order for sorting

**Backend Logic:**
- Generates slug from name (lowercase, spaces to hyphens, removes special chars)
- Enforces unique slug (adds number suffix if slug exists, e.g., "turf-1", "turf-2")
- Sets `isActive = true` by default

**Sample cURL:**
```bash
curl -X POST \
  'https://api.example.com/api/admin/categories/add-prod-category' \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Turf",
    "image": "https://pub-856ab7e271b341b8b280eef24b5a9a84.r2.dev/categories/category-123e4567-e89b-12d3-a456-426614174000",
    "order": 1
  }'
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "success": true,
    "message": "Category saved successfully",
    "categoryId": "69628b1d55dfcfeedbaa98f9"
  }
}
```

**Error Response (400/409):**
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation error messages",
  "path": "/api/admin/categories/add-prod-category",
  "timestamp": "2026-01-10T20:00:00.000Z"
}
```

**Example: Adding "Turf" category:**
- Name: "Turf" → Slug: "turf"
- If "turf" exists → Slug: "turf-1"
- If "turf-1" exists → Slug: "turf-2", etc.

---

## 3. Update Category

**Endpoint:** `PUT /api/admin/categories/:categoryId`

**Description:** Updates category (rename, change image, change order, activate/deactivate). **Slug does NOT change even if name changes.**

**Content-Type:** `application/json`

**URL Parameters:**
- `categoryId` (string, required) - The category document `_id`

**Request Body (JSON) - All fields optional:**
```json
{
  "name": "Sports Turf",
  "image": "https://pub-856ab7e271b341b8b280eef24b5a9a84.r2.dev/categories/category-new-image-url",
  "order": 2,
  "isActive": true
}
```

**Field Descriptions:**
- `name` (string, optional) - Category name (slug stays the same)
- `image` (string, optional, URL) - New image URL
- `order` (number, optional, min: 0) - New display order
- `isActive` (boolean, optional) - Active/inactive status

**Important:** 
- ⚠️ Slug is identity and does NOT change even if name changes
- Only provide fields you want to update

**Sample cURL:**
```bash
curl -X PUT \
  'https://api.example.com/api/admin/categories/69628b1d55dfcfeedbaa98f9' \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Sports Turf",
    "order": 2,
    "isActive": true
  }'
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "success": true,
    "message": "Category updated successfully"
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "statusCode": 404,
  "message": "Category with id \"69628b1d55dfcfeedbaa98f9\" not found",
  "path": "/api/admin/categories/69628b1d55dfcfeedbaa98f9",
  "timestamp": "2026-01-10T20:00:00.000Z"
}
```

**Example Scenarios:**

1. **Rename only:**
```json
{
  "name": "Sports Turf"
}
```
- Slug remains "turf" (doesn't change)

2. **Change order only:**
```json
{
  "order": 5
}
```

3. **Deactivate:**
```json
{
  "isActive": false
}
```

4. **Update multiple fields:**
```json
{
  "name": "Premium Turf",
  "image": "https://...",
  "order": 1,
  "isActive": true
}
```

---

## 4. Delete Category (Soft Delete)

**Endpoint:** `DELETE /api/admin/categories/:categoryId`

**Description:** Soft deletes category by setting `isActive = false`. **Does NOT hard delete the document.**

**Content-Type:** `application/json`

**URL Parameters:**
- `categoryId` (string, required) - The category document `_id`

**Request Body:** None

**Sample cURL:**
```bash
curl -X DELETE \
  'https://api.example.com/api/admin/categories/69628b1d55dfcfeedbaa98f9' \
  -H 'Content-Type: application/json'
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "success": true,
    "message": "Category deleted successfully"
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "statusCode": 404,
  "message": "Category with id \"69628b1d55dfcfeedbaa98f9\" not found",
  "path": "/api/admin/categories/69628b1d55dfcfeedbaa98f9",
  "timestamp": "2026-01-10T20:00:00.000Z"
}
```

**What happens:**
- Document remains in database
- `isActive` field is set to `false`
- Category will NOT appear in GET `/api/categories` (only active categories are returned)
- Can be reactivated later using PUT endpoint with `"isActive": true`

---

## 5. Get Categories (Public Endpoint)

**Endpoint:** `GET /api/categories`

**Description:** Returns all active categories sorted by order (ASC)

**Content-Type:** `application/json`

**Query Parameters:** None

**Sample cURL:**
```bash
curl -X GET \
  'https://api.example.com/api/categories' \
  -H 'Content-Type: application/json'
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "69628b1d55dfcfeedbaa98f9",
      "slug": "turf",
      "name": "Turf",
      "image": "https://pub-856ab7e271b341b8b280eef24b5a9a84.r2.dev/categories/category-123e4567-e89b-12d3-a456-426614174000",
      "order": 1,
      "isActive": true,
      "createdAt": "2026-01-10T20:00:00.000Z",
      "updatedAt": "2026-01-10T20:00:00.000Z"
    },
    {
      "_id": "69628b1d55dfcfeedbaa98fa",
      "slug": "saloon",
      "name": "Saloon",
      "image": "https://pub-856ab7e271b341b8b280eef24b5a9a84.r2.dev/categories/category-456e7890-e89b-12d3-a456-426614174001",
      "order": 2,
      "isActive": true,
      "createdAt": "2026-01-10T19:00:00.000Z",
      "updatedAt": "2026-01-10T19:00:00.000Z"
    },
    {
      "_id": "69628b1d55dfcfeedbaa98fb",
      "slug": "spa",
      "name": "Spa",
      "image": "https://pub-856ab7e271b341b8b280eef24b5a9a84.r2.dev/categories/category-789e0123-e89b-12d3-a456-426614174002",
      "order": 3,
      "isActive": true,
      "createdAt": "2026-01-10T18:00:00.000Z",
      "updatedAt": "2026-01-10T18:00:00.000Z"
    }
  ]
}
```

**Query Behavior:**
- Filters: `isActive = true` only
- Sort: `order ASC` (ascending)
- Uses index: `{ isActive: 1, order: 1 }` for optimized query

**Notes:**
- Only returns categories where `isActive = true`
- Results are sorted by `order` field in ascending order
- Categories with `isActive = false` are excluded (soft-deleted categories)

---

## Complete Workflow Examples

### Example 1: Create a New Category

**Step 1: Upload Image**
```bash
POST /api/admin/categories/upload-category-image
Content-Type: multipart/form-data
Body: image file

Response: { "imageUrl": "https://..." }
```

**Step 2: Save Category**
```bash
POST /api/admin/categories/add-prod-category
Content-Type: application/json
Body: {
  "name": "Turf",
  "image": "https://...",
  "order": 1
}

Response: { "categoryId": "69628b1d55dfcfeedbaa98f9" }
```

### Example 2: Update Category

```bash
PUT /api/admin/categories/69628b1d55dfcfeedbaa98f9
Content-Type: application/json
Body: {
  "name": "Sports Turf",
  "order": 2
}

Response: { "message": "Category updated successfully" }
```
- Slug remains "turf" (doesn't change)

### Example 3: Soft Delete Category

```bash
DELETE /api/admin/categories/69628b1d55dfcfeedbaa98f9

Response: { "message": "Category deleted successfully" }
```
- Category is now `isActive = false`
- Will NOT appear in GET `/api/categories`

### Example 4: Get All Active Categories

```bash
GET /api/categories

Response: Array of active categories sorted by order
```

---

## Database Schema

**Collection:** `categories`

**Document Structure:**
```json
{
  "_id": ObjectId,
  "slug": "turf",           // Unique, generated from name
  "name": "Turf",           // Display name
  "image": "https://...",   // Category image URL
  "order": 1,               // Sort order
  "isActive": true,         // Active/inactive status
  "createdAt": ISODate,
  "updatedAt": ISODate
}
```

**Indexes:**
1. `{ slug: 1 }` UNIQUE - Unique category identity
2. `{ isActive: 1, order: 1 }` - App category listing (optimized query)

---

## Important Notes

1. **Slug Generation:**
   - Generated from name (lowercase, spaces → hyphens, special chars removed)
   - Auto-increments with number suffix if duplicate (e.g., "turf", "turf-1", "turf-2")
   - Slug is **immutable** - does NOT change when name is updated

2. **Soft Delete:**
   - DELETE endpoint sets `isActive = false`
   - Document remains in database
   - Can be reactivated using PUT endpoint

3. **2-Step Upload Flow:**
   - Step 1: Upload image to R2
   - Step 2: Save metadata with image URL
   - This pattern ensures iOS compatibility

4. **Public vs Admin Endpoints:**
   - Admin endpoints: `/api/admin/categories/*`
   - Public endpoint: `/api/categories` (GET only, returns active categories)

5. **Unique Slug Enforcement:**
   - Backend automatically handles slug conflicts
   - Adds numeric suffix if slug already exists
   - Ensures no duplicate slugs in database

