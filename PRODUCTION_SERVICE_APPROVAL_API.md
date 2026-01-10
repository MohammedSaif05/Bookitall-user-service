# Production Service Approval APIs - Documentation

This document provides complete API documentation with sample payloads for all production service approval endpoints.

---

## 1. Upload Service Image (Step 1)

**Endpoint:** `POST /api/vendor/:businessId/prod-upload-service-image`

**Description:** Uploads service image to R2 storage (iOS-safe, 2-step flow)

**Content-Type:** `multipart/form-data`

**URL Parameters:**
- `businessId` (string, required) - The business ID

**Request Body (Form Data):**
```form-data
businessId: "69615ddd7c6e18f8055b5a29"
serviceImage: <File> (image file - jpg, png, etc.)
```

**Sample cURL:**
```bash
curl -X POST \
  'https://api.example.com/api/vendor/69615ddd7c6e18f8055b5a29/prod-upload-service-image' \
  -H 'Content-Type: multipart/form-data' \
  -F 'businessId=69615ddd7c6e18f8055b5a29' \
  -F 'serviceImage=@/path/to/image.jpg'
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "imageUrl": "https://pub-856ab7e271b341b8b280eef24b5a9a84.r2.dev/vendors/hbHMEafVg45Y6w/service-123e4567-e89b-12d3-a456-426614174000"
  }
}
```

**Error Response (400/404):**
```json
{
  "success": false,
  "statusCode": 400,
  "message": "serviceImage file is required",
  "path": "/api/vendor/69615ddd7c6e18f8055b5a29/prod-upload-service-image",
  "timestamp": "2026-01-09T20:00:00.000Z"
}
```

---

## 2. Save Service Request (Step 2)

**Endpoint:** `PATCH /api/vendor/:businessId/prod-save-service-request`

**Description:** Saves service request metadata to `services_approval` collection

**Content-Type:** `application/json`

**URL Parameters:**
- `businessId` (string, required) - The business ID

**Request Body (JSON):**
```json
{
  "businessId": "69615ddd7c6e18f8055b5a29",
  "serviceName": "Haircut",
  "description": "Professional haircut service",
  "durationInMinutes": 45,
  "bufferTimeInMinutes": 5,
  "price": 250,
  "category": "per person charges",
  "gender": "male",
  "maxBookingsPerSlot": 1,
  "serviceImage": "https://pub-856ab7e271b341b8b280eef24b5a9a84.r2.dev/vendors/hbHMEafVg45Y6w/service-123e4567-e89b-12d3-a456-426614174000"
}
```

**Field Descriptions:**
- `businessId` (string, required) - Must match URL parameter
- `serviceName` (string, required) - Name of the service
- `description` (string, optional) - Service description
- `durationInMinutes` (number, required, min: 1) - Duration in minutes
- `bufferTimeInMinutes` (number, optional, min: 0, default: 0) - Buffer time
- `price` (number, required, min: 0) - Service price
- `category` (string, optional) - Service category
- `gender` (string, optional) - One of: "male", "female", "both"
- `maxBookingsPerSlot` (number, optional, min: 1, default: 1) - Maximum bookings per slot
- `serviceImage` (string, required, URL) - Image URL from Step 1

**Sample cURL:**
```bash
curl -X PATCH \
  'https://api.example.com/api/vendor/69615ddd7c6e18f8055b5a29/prod-save-service-request' \
  -H 'Content-Type: application/json' \
  -d '{
    "businessId": "69615ddd7c6e18f8055b5a29",
    "serviceName": "Haircut",
    "description": "Professional haircut service",
    "durationInMinutes": 45,
    "bufferTimeInMinutes": 5,
    "price": 250,
    "category": "per person charges",
    "gender": "male",
    "maxBookingsPerSlot": 1,
    "serviceImage": "https://pub-856ab7e271b341b8b280eef24b5a9a84.r2.dev/vendors/hbHMEafVg45Y6w/service-123e4567-e89b-12d3-a456-426614174000"
  }'
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "success": true,
    "message": "Service request saved successfully",
    "approvalId": "69615eee7c6e18f8055b5a30"
  }
}
```

**Error Response (400/404):**
```json
{
  "success": false,
  "statusCode": 404,
  "message": "Business with businessId \"69615ddd7c6e18f8055b5a29\" not found",
  "path": "/api/vendor/69615ddd7c6e18f8055b5a29/prod-save-service-request",
  "timestamp": "2026-01-09T20:00:00.000Z"
}
```

---

## 3. Approve Service Request

**Endpoint:** `POST /api/vendor/:serviceApprovalId/prod-approve-service`

**Description:** Approves service request and creates service + availability documents (uses MongoDB transaction)

**Content-Type:** `application/json`

**URL Parameters:**
- `serviceApprovalId` (string, required) - The service approval document ID

**Request Body:** None

**Sample cURL:**
```bash
curl -X POST \
  'https://api.example.com/api/vendor/69615eee7c6e18f8055b5a30/prod-approve-service' \
  -H 'Content-Type: application/json'
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "success": true,
    "message": "Service approved and created successfully",
    "serviceId": "69615fff7c6e18f8055b5a31"
  }
}
```

**Error Response (400/404):**
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Service approval is already approved. Cannot approve again.",
  "path": "/api/vendor/69615eee7c6e18f8055b5a30/prod-approve-service",
  "timestamp": "2026-01-09T20:00:00.000Z"
}
```

**What happens:**
1. Fetches service approval document (fails if not found or not "pending")
2. Fetches corresponding business document
3. Creates service document in `services` collection with location from business
4. Creates `service_availability` documents based on business timing rules:
   - If `business.differentTimingsEachDay === true` → uses `business.days[]` array
   - Else → uses `business.workingDays[]` with same `startTime`, `endTime`, `breaks`
   - Creates ONE document per service per day
5. Deletes approval document (keeps R2 image)
6. All operations run in MongoDB transaction (rollback on failure)

---

## 4. Reject Service Request

**Endpoint:** `POST /api/vendor/:serviceApprovalId/prod-reject-service`

**Description:** Rejects service request and deletes image from R2 storage

**Content-Type:** `application/json`

**URL Parameters:**
- `serviceApprovalId` (string, required) - The service approval document ID

**Request Body:** None

**Sample cURL:**
```bash
curl -X POST \
  'https://api.example.com/api/vendor/69615eee7c6e18f8055b5a30/prod-reject-service' \
  -H 'Content-Type: application/json'
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "success": true,
    "message": "Service request rejected and image deleted successfully"
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "statusCode": 404,
  "message": "Service approval with id \"69615eee7c6e18f8055b5a30\" not found",
  "path": "/api/vendor/69615eee7c6e18f8055b5a30/prod-reject-service",
  "timestamp": "2026-01-09T20:00:00.000Z"
}
```

**What happens:**
1. Fetches service approval document
2. Deletes service image from R2 storage
3. Deletes approval document from `services_approval` collection

---

## 5. Get Service Approvals List

**Endpoint:** `GET /api/vendor/service-approvals`

**Description:** Lists all service approvals with optional filtering

**Content-Type:** `application/json`

**Query Parameters (all optional):**
- `status` (string) - Filter by status: "pending", "approved", or "rejected"
- `vendorId` (string) - Filter by vendor ID
- `businessId` (string) - Filter by business ID

**Sample Requests:**

**Get all pending approvals:**
```bash
curl -X GET \
  'https://api.example.com/api/vendor/service-approvals?status=pending' \
  -H 'Content-Type: application/json'
```

**Get approvals for specific vendor:**
```bash
curl -X GET \
  'https://api.example.com/api/vendor/service-approvals?vendorId=hbHMEafVg45Y6w' \
  -H 'Content-Type: application/json'
```

**Get pending approvals for specific business:**
```bash
curl -X GET \
  'https://api.example.com/api/vendor/service-approvals?status=pending&businessId=69615ddd7c6e18f8055b5a29' \
  -H 'Content-Type: application/json'
```

**Get all approvals:**
```bash
curl -X GET \
  'https://api.example.com/api/vendor/service-approvals' \
  -H 'Content-Type: application/json'
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "69615eee7c6e18f8055b5a30",
      "vendorId": "hbHMEafVg45Y6w",
      "businessId": "69615ddd7c6e18f8055b5a29",
      "serviceName": "Haircut",
      "description": "Professional haircut service",
      "durationInMinutes": 45,
      "bufferTimeInMinutes": 5,
      "price": 250,
      "category": "per person charges",
      "gender": "male",
      "maxBookingsPerSlot": 1,
      "serviceImage": "https://pub-856ab7e271b341b8b280eef24b5a9a84.r2.dev/vendors/hbHMEafVg45Y6w/service-123e4567-e89b-12d3-a456-426614174000",
      "status": "pending",
      "createdAt": "2026-01-09T20:00:00.000Z"
    },
    {
      "_id": "69615eee7c6e18f8055b5a31",
      "vendorId": "hbHMEafVg45Y6w",
      "businessId": "69615ddd7c6e18f8055b5a29",
      "serviceName": "Beard Trim",
      "description": "Professional beard trimming",
      "durationInMinutes": 30,
      "bufferTimeInMinutes": 5,
      "price": 150,
      "category": "per person charges",
      "gender": "male",
      "maxBookingsPerSlot": 1,
      "serviceImage": "https://pub-856ab7e271b341b8b280eef24b5a9a84.r2.dev/vendors/hbHMEafVg45Y6w/service-456e7890-e89b-12d3-a456-426614174001",
      "status": "pending",
      "createdAt": "2026-01-09T19:30:00.000Z"
    }
  ]
}
```

**Error Response (400):**
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Invalid status. Must be one of: pending, approved, rejected",
  "path": "/api/vendor/service-approvals",
  "timestamp": "2026-01-09T20:00:00.000Z"
}
```

**Notes:**
- Results are sorted by `createdAt` descending (most recent first)
- Uses the most important index: `{ status: 1, createdAt: -1 }`
- All query parameters are optional - omitting them returns all records

---

## Complete Workflow Example

### Step 1: Upload Service Image
```bash
POST /api/vendor/69615ddd7c6e18f8055b5a29/prod-upload-service-image
Content-Type: multipart/form-data

Response: { "imageUrl": "https://..." }
```

### Step 2: Save Service Request
```bash
PATCH /api/vendor/69615ddd7c6e18f8055b5a29/prod-save-service-request
Content-Type: application/json

{
  "businessId": "69615ddd7c6e18f8055b5a29",
  "serviceName": "Haircut",
  "durationInMinutes": 45,
  "price": 250,
  ...
  "serviceImage": "https://..." // from Step 1
}

Response: { "approvalId": "69615eee7c6e18f8055b5a30" }
```

### Step 3a: Approve Service Request
```bash
POST /api/vendor/69615eee7c6e18f8055b5a30/prod-approve-service

Response: { "serviceId": "69615fff7c6e18f8055b5a31" }
```

### OR Step 3b: Reject Service Request
```bash
POST /api/vendor/69615eee7c6e18f8055b5a30/prod-reject-service

Response: { "message": "Service request rejected and image deleted successfully" }
```

---

## Important Notes

1. **2-Step Upload Flow:** The image upload (Step 1) and metadata save (Step 2) are separate endpoints for iOS compatibility
2. **Transaction Safety:** The approval endpoint uses MongoDB transactions - if any step fails, everything rolls back
3. **No Availability Input:** Availability is always copied from business rules, never from request body
4. **Image Cleanup:** Rejected requests automatically delete images from R2 storage
5. **Status Validation:** Approval endpoint prevents multiple approvals - status must be "pending"
6. **Index Usage:** List endpoint uses optimized indexes for fast queries by status and creation date

