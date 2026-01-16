# Promotions API Documentation

This document provides complete API documentation with flow, payloads, and responses for the Promotions module.

---

## Overview

The Promotions module allows vendors to submit promotion requests, admins to upload promotional images, vendors to select images, and customers to view active promotions.

### Flow Summary

1. **Vendor submits promotion request** → Status: `pending`
2. **Admin views all promotion requests** → See all vendor requests (can filter by status)
3. **Admin uploads promotion images** → Status: `images_uploaded`
4. **Vendor views their promotion requests** → See all requests with statuses
5. **Vendor fetches promotional images** → View all uploaded images for a request
6. **Vendor selects ONE image** → Mark an image as selected
7. **Admin approves promotion** → Status: `approved`, creates promotion document
8. **Customer fetches active promotions** → View active promotions in the app

---

## Step 1: Vendor Submits Promotion Request

**Endpoint:** `POST /api/vendor/promotions/request`

**Description:** Vendor creates a new promotion request with category, description, and duration type.

**Content-Type:** `application/json`

**Request Body:**
```json
{
  "vendorId": "vendor123",
  "category": "offer",
  "description": "Special discount on all services",
  "durationType": "weekly"
}
```

**Field Validations:**
- `vendorId` (string, required) - The vendor's user ID (Note: In production, this should come from authentication token)
- `category` (enum, required) - Must be either `"offer"` or `"featured"`
- `description` (string, required) - Description of the promotion
- `durationType` (enum, required) - Must be either `"weekly"` or `"monthly"`

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "requestId": "65a1b2c3d4e5f6g7h8i9j0k1",
    "vendorId": "vendor123",
    "category": "offer",
    "description": "Special discount on all services",
    "durationType": "weekly",
    "status": "pending",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "statusCode": 400,
  "message": "category must be either 'offer' or 'featured'",
  "path": "/api/vendor/promotions/request",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Sample cURL:**
```bash
curl -X POST \
  'https://api.example.com/api/vendor/promotions/request' \
  -H 'Content-Type: application/json' \
  -d '{
    "vendorId": "vendor123",
    "category": "offer",
    "description": "Special discount on all services",
    "durationType": "weekly"
  }'
```

---

## Step 2a: Admin Views All Promotion Requests

**Endpoint:** `GET /api/admin/promotions/requests?status=pending`

**Description:** Admin fetches all promotion requests from all vendors. Can optionally filter by status.

**Content-Type:** `application/json`

**Query Parameters:**
- `status` (string, optional) - Filter by status: `pending`, `images_uploaded`, `approved`, or `rejected`

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "requestId": "65a1b2c3d4e5f6g7h8i9j0k1",
      "vendorId": "vendor123",
      "category": "offer",
      "description": "Special discount on all services",
      "durationType": "weekly",
      "status": "pending",
      "businessName": "Beauty Salon & Spa",
      "businessCategory": "Beauty & Wellness",
      "city": "Mumbai",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    },
    {
      "requestId": "65a1b2c3d4e5f6g7h8i9j0k6",
      "vendorId": "vendor456",
      "category": "featured",
      "description": "Featured vendor promotion",
      "durationType": "monthly",
      "status": "images_uploaded",
      "businessName": "Hair Studio Pro",
      "businessCategory": "Hair Salon",
      "city": "Delhi",
      "createdAt": "2024-01-14T09:00:00.000Z",
      "updatedAt": "2024-01-15T11:00:00.000Z"
    }
  ]
}
```

**Response Fields:**
- `requestId` (string) - The promotion request ID
- `vendorId` (string) - The vendor's user ID
- `category` (string) - Promotion category: "offer" or "featured"
- `description` (string) - Description of the promotion
- `durationType` (string) - Duration type: "weekly" or "monthly"
- `status` (string) - Request status: "pending", "images_uploaded", "approved", or "rejected"
- `businessName` (string | null) - Business name from vendor's business profile
- `businessCategory` (string | null) - Business category from vendor's business profile
- `city` (string | null) - City from vendor's business address
- `createdAt` (Date) - Request creation timestamp
- `updatedAt` (Date) - Request last update timestamp

**Note:** `businessName`, `businessCategory`, and `city` will be `null` if the vendor hasn't completed their business profile setup.

**Sample cURL:**
```bash
# Get all requests
curl -X GET \
  'https://api.example.com/api/admin/promotions/requests' \
  -H 'Content-Type: application/json'

# Get only pending requests
curl -X GET \
  'https://api.example.com/api/admin/promotions/requests?status=pending' \
  -H 'Content-Type: application/json'
```

---

## Step 2: Admin Uploads Promotion Images

**Endpoint:** `POST /api/admin/promotions/:requestId/upload-images`

**Description:** Admin uploads exactly 4 promotional images for a promotion request. Images are stored in R2 storage and linked to the promotion request. The request status is updated to `images_uploaded`.

**Content-Type:** `multipart/form-data`

**URL Parameters:**
- `requestId` (string, required) - The promotion request ID from Step 1

**Request Body (Form Data):**
```form-data
requestId: "65a1b2c3d4e5f6g7h8i9j0k1"
promotionImages: <File> (4 image files required - jpg, png, etc.)
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "imageUrls": [
      "https://pub-.../promotions/65a1b2c3d4e5f6g7h8i9j0k1/promotion-image-xxx-0",
      "https://pub-.../promotions/65a1b2c3d4e5f6g7h8i9j0k1/promotion-image-xxx-1",
      "https://pub-.../promotions/65a1b2c3d4e5f6g7h8i9j0k1/promotion-image-xxx-2",
      "https://pub-.../promotions/65a1b2c3d4e5f6g7h8i9j0k1/promotion-image-xxx-3"
    ],
    "assetIds": [
      "65a1b2c3d4e5f6g7h8i9j0k2",
      "65a1b2c3d4e5f6g7h8i9j0k3",
      "65a1b2c3d4e5f6g7h8i9j0k4",
      "65a1b2c3d4e5f6g7h8i9j0k5"
    ]
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "statusCode": 400,
  "message": "promotionImages must contain exactly 4 files",
  "path": "/api/admin/promotions/65a1b2c3d4e5f6g7h8i9j0k1/upload-images",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Error Response (404):**
```json
{
  "success": false,
  "statusCode": 404,
  "message": "Promotion request with id 65a1b2c3d4e5f6g7h8i9j0k1 not found",
  "path": "/api/admin/promotions/65a1b2c3d4e5f6g7h8i9j0k1/upload-images",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Sample cURL:**
```bash
curl -X POST \
  'https://api.example.com/api/admin/promotions/65a1b2c3d4e5f6g7h8i9j0k1/upload-images' \
  -H 'Content-Type: multipart/form-data' \
  -F 'requestId=65a1b2c3d4e5f6g7h8i9j0k1' \
  -F 'promotionImages=@/path/to/image1.jpg' \
  -F 'promotionImages=@/path/to/image2.jpg' \
  -F 'promotionImages=@/path/to/image3.jpg' \
  -F 'promotionImages=@/path/to/image4.jpg'
```

**Note:** After successful upload, the promotion request status is automatically updated to `images_uploaded`.

---

## Step 3: Vendor Views Promotion Requests

**Endpoint:** `GET /api/vendor/promotions/requests?vendorId=xxx`

**Description:** Vendor fetches all their promotion requests with different statuses (pending, images_uploaded, approved, rejected).

**Content-Type:** `application/json`

**Query Parameters:**
- `vendorId` (string, required) - The vendor's user ID

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "requestId": "65a1b2c3d4e5f6g7h8i9j0k1",
      "vendorId": "vendor123",
      "category": "offer",
      "description": "Special discount on all services",
      "durationType": "weekly",
      "status": "images_uploaded",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T11:00:00.000Z"
    },
    {
      "requestId": "65a1b2c3d4e5f6g7h8i9j0k6",
      "vendorId": "vendor123",
      "category": "featured",
      "description": "Featured vendor promotion",
      "durationType": "monthly",
      "status": "approved",
      "createdAt": "2024-01-10T09:00:00.000Z",
      "updatedAt": "2024-01-12T14:30:00.000Z"
    }
  ]
}
```

**Error Response (400):**
```json
{
  "success": false,
  "statusCode": 400,
  "message": "vendorId is required",
  "path": "/api/vendor/promotions/requests",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Sample cURL:**
```bash
curl -X GET \
  'https://api.example.com/api/vendor/promotions/requests?vendorId=vendor123' \
  -H 'Content-Type: application/json'
```

---

## Step 4: Vendor Fetches Promotional Images

**Endpoint:** `GET /api/vendor/promotions/:requestId/assets?vendorId=xxx`

**Description:** Vendor fetches all promotional images (assets) for a specific promotion request. Backend validates that the vendor owns the promotion request.

**Content-Type:** `application/json`

**URL Parameters:**
- `requestId` (string, required) - The promotion request ID

**Query Parameters:**
- `vendorId` (string, required) - The vendor's user ID

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "assetId": "65a1b2c3d4e5f6g7h8i9j0k2",
      "imageUrl": "https://pub-.../promotions/65a1b2c3d4e5f6g7h8i9j0k1/promotion-image-xxx-0",
      "isSelectedByVendor": false
    },
    {
      "assetId": "65a1b2c3d4e5f6g7h8i9j0k3",
      "imageUrl": "https://pub-.../promotions/65a1b2c3d4e5f6g7h8i9j0k1/promotion-image-xxx-1",
      "isSelectedByVendor": false
    },
    {
      "assetId": "65a1b2c3d4e5f6g7h8i9j0k4",
      "imageUrl": "https://pub-.../promotions/65a1b2c3d4e5f6g7h8i9j0k1/promotion-image-xxx-2",
      "isSelectedByVendor": true
    },
    {
      "assetId": "65a1b2c3d4e5f6g7h8i9j0k5",
      "imageUrl": "https://pub-.../promotions/65a1b2c3d4e5f6g7h8i9j0k1/promotion-image-xxx-3",
      "isSelectedByVendor": false
    }
  ]
}
```

**Error Response (403):**
```json
{
  "success": false,
  "statusCode": 403,
  "message": "You do not have permission to access this promotion request",
  "path": "/api/vendor/promotions/65a1b2c3d4e5f6g7h8i9j0k1/assets",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Error Response (404):**
```json
{
  "success": false,
  "statusCode": 404,
  "message": "Promotion request with id 65a1b2c3d4e5f6g7h8i9j0k1 not found",
  "path": "/api/vendor/promotions/65a1b2c3d4e5f6g7h8i9j0k1/assets",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Sample cURL:**
```bash
curl -X GET \
  'https://api.example.com/api/vendor/promotions/65a1b2c3d4e5f6g7h8i9j0k1/assets?vendorId=vendor123' \
  -H 'Content-Type: application/json'
```

---

## Step 5: Vendor Selects ONE Image

**Endpoint:** `POST /api/vendor/promotions/assets/:assetId/select`

**Description:** Vendor selects one promotional image. Backend ensures the asset belongs to the vendor's promotion request and ensures only one asset is selected (unselects others).

**Content-Type:** `application/json`

**URL Parameters:**
- `assetId` (string, required) - The promotion asset ID

**Request Body:**
```json
{
  "vendorId": "vendor123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "assetId": "65a1b2c3d4e5f6g7h8i9j0k4",
    "imageUrl": "https://pub-.../promotions/65a1b2c3d4e5f6g7h8i9j0k1/promotion-image-xxx-2",
    "isSelectedByVendor": true,
    "message": "Asset selected successfully"
  }
}
```

**Error Response (403):**
```json
{
  "success": false,
  "statusCode": 403,
  "message": "You do not have permission to select this asset",
  "path": "/api/vendor/promotions/assets/65a1b2c3d4e5f6g7h8i9j0k4/select",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Error Response (404):**
```json
{
  "success": false,
  "statusCode": 404,
  "message": "Promotion asset with id 65a1b2c3d4e5f6g7h8i9j0k4 not found",
  "path": "/api/vendor/promotions/assets/65a1b2c3d4e5f6g7h8i9j0k4/select",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Sample cURL:**
```bash
curl -X POST \
  'https://api.example.com/api/vendor/promotions/assets/65a1b2c3d4e5f6g7h8i9j0k4/select' \
  -H 'Content-Type: application/json' \
  -d '{
    "vendorId": "vendor123"
  }'
```

**Note:** When a vendor selects an asset, all other assets for the same promotion request are automatically unselected.

---

## Step 6: Admin Approves Promotion

**Endpoint:** `POST /api/admin/promotions/:requestId/approve`

**Description:** Admin approves a promotion request. Backend fetches the selected asset, computes start and end dates based on duration type (weekly: +7 days, monthly: +30 days), creates a promotion document, and marks the request as approved.

**Content-Type:** `application/json`

**URL Parameters:**
- `requestId` (string, required) - The promotion request ID

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "promotionId": "65a1b2c3d4e5f6g7h8i9j0k7",
    "vendorId": "vendor123",
    "imageUrl": "https://pub-.../promotions/65a1b2c3d4e5f6g7h8i9j0k1/promotion-image-xxx-2",
    "category": "offer",
    "description": "Special discount on all services",
    "startDate": "2024-01-15T12:00:00.000Z",
    "endDate": "2024-01-22T12:00:00.000Z",
    "isActive": true,
    "message": "Promotion approved successfully"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "statusCode": 400,
  "message": "No asset has been selected by the vendor for this promotion request",
  "path": "/api/admin/promotions/65a1b2c3d4e5f6g7h8i9j0k1/approve",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Error Response (404):**
```json
{
  "success": false,
  "statusCode": 404,
  "message": "Promotion request with id 65a1b2c3d4e5f6g7h8i9j0k1 not found",
  "path": "/api/admin/promotions/65a1b2c3d4e5f6g7h8i9j0k1/approve",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Sample cURL:**
```bash
curl -X POST \
  'https://api.example.com/api/admin/promotions/65a1b2c3d4e5f6g7h8i9j0k1/approve' \
  -H 'Content-Type: application/json'
```

**Note:** 
- For `weekly` duration: endDate = startDate + 7 days
- For `monthly` duration: endDate = startDate + 30 days
- The promotion request status is automatically updated to `approved`

---

## Step 7: Customer Fetches Active Promotions

**Endpoint:** `GET /api/promotions?isActive=true`

**Description:** Customer (user app) fetches active promotions. Returns promotions where `isActive = true` and current date is between `startDate` and `endDate`.

**Content-Type:** `application/json`

**Query Parameters:**
- `isActive` (boolean, optional) - Filter by active status. Default: `true`

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "promotionId": "65a1b2c3d4e5f6g7h8i9j0k7",
      "vendorId": "vendor123",
      "imageUrl": "https://pub-.../promotions/65a1b2c3d4e5f6g7h8i9j0k1/promotion-image-xxx-2",
      "category": "offer",
      "description": "Special discount on all services",
      "startDate": "2024-01-15T12:00:00.000Z",
      "endDate": "2024-01-22T12:00:00.000Z",
      "isActive": true
    },
    {
      "promotionId": "65a1b2c3d4e5f6g7h8i9j0k8",
      "vendorId": "vendor456",
      "imageUrl": "https://pub-.../promotions/65a1b2c3d4e5f6g7h8i9j0k9/promotion-image-yyy-1",
      "category": "featured",
      "description": "Featured vendor of the month",
      "startDate": "2024-01-01T00:00:00.000Z",
      "endDate": "2024-01-31T23:59:59.000Z",
      "isActive": true
    }
  ]
}
```

**Sample cURL:**
```bash
curl -X GET \
  'https://api.example.com/api/promotions?isActive=true' \
  -H 'Content-Type: application/json'
```

**Note:** The query automatically filters promotions where:
- `isActive = true` (or as specified in query)
- `startDate <= current date <= endDate`

---

## Database Collections

### 1. `promotion_requests`
Stores promotion requests submitted by vendors.

**Fields:**
- `vendorId` (string, required)
- `category` (enum: "offer" | "featured", required)
- `description` (string, required)
- `durationType` (enum: "weekly" | "monthly", required)
- `status` (enum: "pending" | "images_uploaded" | "approved" | "rejected", default: "pending")
- `createdAt` (Date, auto)
- `updatedAt` (Date, auto)

**Indexes:**
- `vendorId`
- `status`
- `vendorId + status` (compound)
- `createdAt` (descending)

### 2. `promotion_assets`
Stores promotional images uploaded by admin.

**Fields:**
- `promotionRequestId` (ObjectId, required, ref: PromotionRequest)
- `imageUrl` (string, required)
- `isSelectedByVendor` (boolean, default: false)
- `createdAt` (Date, auto)
- `updatedAt` (Date, auto)

**Indexes:**
- `promotionRequestId`
- `promotionRequestId + isSelectedByVendor` (compound)
- `createdAt` (descending)

### 3. `promotions`
Stores approved promotions visible to customers.

**Fields:**
- `vendorId` (string, required)
- `promotionRequestId` (ObjectId, required, ref: PromotionRequest)
- `promotionAssetId` (ObjectId, required, ref: PromotionAsset)
- `imageUrl` (string, required)
- `category` (enum: "offer" | "featured", required)
- `description` (string, required)
- `startDate` (Date, required)
- `endDate` (Date, required)
- `isActive` (boolean, default: true)
- `createdAt` (Date, auto)
- `updatedAt` (Date, auto)

**Indexes:**
- `vendorId`
- `isActive`
- `startDate + endDate` (compound)
- `isActive + startDate + endDate` (compound)
- `createdAt` (descending)

---

## Status Flow

```
pending → images_uploaded → approved
   ↓
rejected
```

1. **pending**: Initial state when vendor submits request
2. **images_uploaded**: Admin has uploaded images
3. **approved**: Admin approved and promotion is live
4. **rejected**: Admin rejected the request (can be added in future)

---

## Error Handling

All endpoints follow consistent error response format:

```json
{
  "success": false,
  "statusCode": <HTTP_STATUS_CODE>,
  "message": "<ERROR_MESSAGE>",
  "path": "<API_PATH>",
  "timestamp": "<ISO_TIMESTAMP>"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors, missing fields)
- `403` - Forbidden (permission denied)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error

---

## Notes

1. **Authentication**: Currently, `vendorId` is passed in request body/query. In production, this should come from authentication tokens (JWT).

2. **File Upload**: The admin upload endpoint accepts exactly 4 images. All images are uploaded to R2 storage and linked to the promotion request.

3. **Asset Selection**: Only one asset can be selected per promotion request. Selecting a new asset automatically unselects the previous one.

4. **Date Calculation**: 
   - Weekly promotions: endDate = startDate + 7 days
   - Monthly promotions: endDate = startDate + 30 days

5. **Active Promotions**: The customer endpoint filters promotions where current date is between startDate and endDate, and isActive is true.

---

## Testing Checklist

- [ ] Vendor can create promotion request
- [ ] Admin can upload exactly 4 images
- [ ] Vendor can view all their promotion requests
- [ ] Vendor can fetch images for their promotion request
- [ ] Vendor can select one image (others unselected)
- [ ] Admin can approve promotion (creates promotion document)
- [ ] Customer can fetch active promotions
- [ ] Date calculations are correct (weekly/monthly)
- [ ] Authorization checks work (vendor can only access their own requests)
- [ ] Error handling works for all edge cases

