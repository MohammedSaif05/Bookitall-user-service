# Refactored Services API Documentation

This document provides complete API documentation for the refactored category-based services system.

---

## Overview

The services system has been completely refactored to support category-based fields. Each service category has its own set of required and optional fields while sharing common mandatory fields.

### Supported Categories

1. **turf** - Sports turf/ground services
2. **saloon** - Hair salon services
3. **swimming-pool** - Swimming pool services
4. **spa** - Spa and wellness services
5. **beauty-parlor** - Beauty parlor services

---

## Common Mandatory Fields (All Categories)

All services must have these fields:

- `businessId` (ObjectId, required) - Reference to Business document
- `category` (string, required) - One of: "turf", "saloon", "swimming-pool", "spa", "beauty-parlor"
- `serviceName` (string, required) - Name of the service
- `serviceImage` (string, optional) - URL of the service image
- `isActive` (boolean, default: true) - Service active status
- `isDiscoverable` (boolean, default: true) - Service discoverable status
- `bufferTimeInMinutes` (number, required) - Buffer time between bookings
- `priceUnitLabel` (string, required) - Label for price unit (e.g., "per hour", "per person", "per session")

---

## Category-Specific Schemas

### 1. TURF Category

#### Required Fields

- `sportType` (string) - Type of sport (e.g., "cricket", "football")
- `slotDurationInMinutes` (number) - Duration of each slot in minutes
- `bufferTimeInMinutes` (number) - Buffer time between slots
- `pricePerSlot` (number) - Price per slot
- `priceUnitLabel` (string) - Label for price (e.g., "per hour")
- `maxPlayers` (number) - Maximum number of players allowed
- `allowedGenders` (string) - "male" | "female" | "mixed"

#### Optional Fields

- `amenities` (string[]) - Array of amenities (e.g., ["lights", "parking", "washroom"])

#### Example Schema

```json
{
  "businessId": "69615ddd7c6e18f8055b5a29",
  "category": "turf",
  "serviceName": "Cricket Pitch",
  "sportType": "cricket",
  "serviceImage": "https://...",
  "slotDurationInMinutes": 60,
  "bufferTimeInMinutes": 5,
  "pricePerSlot": 900,
  "priceUnitLabel": "per hour",
  "maxPlayers": 12,
  "allowedGenders": "mixed",
  "amenities": ["lights", "parking"],
  "isActive": true,
  "isDiscoverable": true
}
```

---

### 2. SALOON Category

#### Required Fields

- `serviceDurationInMinutes` (number) - Duration of service in minutes
- `bufferTimeInMinutes` (number) - Buffer time between bookings
- `price` (number) - Price of the service
- `priceUnitLabel` (string) - Label for price (e.g., "per person")
- `serviceFor` (string) - "male" | "female" | "mixed"
- `maxConcurrentBookings` (number) - Maximum concurrent bookings allowed

#### Optional Fields

- `assignedStaff` (string[]) - Array of staff names (e.g., ["Ramesh", "Suresh"])
- `categoryLabel` (string) - Category label (e.g., "Hair")

#### Example Schema

```json
{
  "businessId": "69615ddd7c6e18f8055b5a29",
  "category": "saloon",
  "serviceName": "Haircut",
  "serviceImage": "https://...",
  "serviceDurationInMinutes": 45,
  "bufferTimeInMinutes": 5,
  "price": 250,
  "priceUnitLabel": "per person",
  "serviceFor": "male",
  "maxConcurrentBookings": 1,
  "assignedStaff": ["Ramesh"],
  "categoryLabel": "Hair",
  "isActive": true,
  "isDiscoverable": true
}
```

---

### 3. SWIMMING_POOL Category

#### Required Fields

- `slotDurationInMinutes` (number) - Duration of each slot in minutes
- `bufferTimeInMinutes` (number) - Buffer time between slots
- `pricePerPerson` (number) - Price per person
- `priceUnitLabel` (string) - Label for price (e.g., "per person")
- `maxCapacity` (number) - Maximum capacity of the pool
- `ageGroup` (string) - "adults" | "children"
- `allowedGenders` (string) - "male" | "female" | "mixed"

#### Optional Fields

- `dressCode` (string) - Dress code requirements
- `amenities` (string[]) - Array of amenities (e.g., ["locker", "shower"])

#### Example Schema

```json
{
  "businessId": "69615ddd7c6e18f8055b5a29",
  "category": "swimming-pool",
  "serviceName": "Adult Swimming",
  "serviceImage": "https://...",
  "slotDurationInMinutes": 60,
  "bufferTimeInMinutes": 10,
  "pricePerPerson": 150,
  "priceUnitLabel": "per person",
  "maxCapacity": 30,
  "ageGroup": "adults",
  "allowedGenders": "mixed",
  "dressCode": "nylon swimwear only",
  "amenities": ["locker", "shower"],
  "isActive": true,
  "isDiscoverable": true
}
```

---

### 4. SPA Category

#### Required Fields

- `serviceDurationInMinutes` (number) - Duration of service in minutes
- `bufferTimeInMinutes` (number) - Buffer time between bookings
- `price` (number) - Price of the service
- `priceUnitLabel` (string) - Label for price (e.g., "per session")
- `therapistGender` (string) - "male" | "female"
- `maxConcurrentSessions` (number) - Maximum concurrent sessions allowed

#### Optional Fields

- `roomType` (string) - Type of room (e.g., "single")
- `treatmentCategory` (string) - Category of treatment (e.g., "massage")

#### Example Schema

```json
{
  "businessId": "69615ddd7c6e18f8055b5a29",
  "category": "spa",
  "serviceName": "Full Body Massage",
  "serviceImage": "https://...",
  "serviceDurationInMinutes": 60,
  "bufferTimeInMinutes": 10,
  "price": 1800,
  "priceUnitLabel": "per session",
  "therapistGender": "female",
  "roomType": "single",
  "maxConcurrentSessions": 3,
  "treatmentCategory": "massage",
  "isActive": true,
  "isDiscoverable": true
}
```

---

### 5. BEAUTY_PARLOUR Category

#### Required Fields

- `serviceDurationInMinutes` (number) - Duration of service in minutes
- `bufferTimeInMinutes` (number) - Buffer time between bookings
- `price` (number) - Price of the service
- `priceUnitLabel` (string) - Label for price (e.g., "per session")
- `serviceFor` (string) - "male" | "female" | "mixed"
- `maxConcurrentSessions` (number) - Maximum concurrent sessions allowed

#### Optional Fields

- `beauticianLevel` (string) - Level of beautician (e.g., "senior")
- `treatmentCategory` (string) - Category of treatment (e.g., "facial")
- `productsUsed` (string[]) - Array of products used (e.g., ["Lakme", "O3+"])

#### Example Schema

```json
{
  "businessId": "69615ddd7c6e18f8055b5a29",
  "category": "beauty-parlor",
  "serviceName": "Gold Facial",
  "serviceImage": "https://...",
  "serviceDurationInMinutes": 60,
  "bufferTimeInMinutes": 5,
  "price": 1200,
  "priceUnitLabel": "per session",
  "serviceFor": "female",
  "maxConcurrentSessions": 2,
  "beauticianLevel": "senior",
  "treatmentCategory": "facial",
  "productsUsed": ["Lakme", "O3+"],
  "isActive": true,
  "isDiscoverable": true
}
```

---

## API Endpoints

### Production Service APIs (Uses `services` Collection)

#### 1. Upload Service Image (Step 1)

**Endpoint:** `POST /api/vendor/:businessId/prod-upload-service-image`

**Description:** Uploads service image to R2 storage

**Content-Type:** `multipart/form-data`

**Request Body:**
```form-data
businessId: "69615ddd7c6e18f8055b5a29"
serviceImage: <File>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "imageUrl": "https://..."
  }
}
```

---

#### 2. Save Service Request (Step 2)

**Endpoint:** `PATCH /api/vendor/:businessId/prod-save-service-request`

**Description:** Saves service request to `services_approval` collection

**Content-Type:** `application/json`

**Request Body (Turf Example):**
```json
{
  "businessId": "69615ddd7c6e18f8055b5a29",
  "category": "turf",
  "serviceName": "Cricket Pitch",
  "serviceImage": "https://...",
  "sportType": "cricket",
  "slotDurationInMinutes": 60,
  "bufferTimeInMinutes": 5,
  "pricePerSlot": 900,
  "priceUnitLabel": "per hour",
  "maxPlayers": 12,
  "allowedGenders": "mixed",
  "amenities": ["lights", "parking"],
  "isActive": true,
  "isDiscoverable": true
}
```

**Response:**
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

---

#### 3. Approve Service Request

**Endpoint:** `POST /api/vendor/:serviceApprovalId/prod-approve-service`

**Description:** Approves service request and creates service + availability documents

**Response:**
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

---

#### 4. Reject Service Request

**Endpoint:** `POST /api/vendor/:serviceApprovalId/prod-reject-service`

**Description:** Rejects service request and deletes image from R2

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "message": "Service request rejected and image deleted successfully"
  }
}
```

---

#### 5. Get Service Approvals

**Endpoint:** `GET /api/vendor/service-approvals`

**Query Parameters:**
- `status` (optional) - "pending" | "approved" | "rejected"
- `vendorId` (optional) - Filter by vendor ID
- `businessId` (optional) - Filter by business ID

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "69615eee7c6e18f8055b5a30",
      "category": "turf",
      "serviceName": "Cricket Pitch",
      "status": "pending",
      ...
    }
  ]
}
```

---

### Legacy Vendor Service APIs (Uses `vendors` Collection)

#### 0. Upload Service Image (Step 1)

**Endpoint:** `POST /api/vendor/:userId/upload-service-image`

**Description:** Uploads a single service image to R2 (no DB write). Returns a presigned/public URL that can be saved in the next step.

**Content-Type:** `multipart/form-data`

**Request Body:**
```form-data
userId: "user123"         // must match :userId param
serviceId: "service456"   // any new/temporary id for the service
serviceImage: <File>      // required
```

**Response:**
```json
{
  "success": true,
  "data": {
    "imageUrl": "https://..."
  }
}
```

#### 1. Save Service Image Metadata (Step 2)

**Endpoint:** `PATCH /api/vendor/:userId/save-service-image`

**Description:** Saves the uploaded image URL to the vendor document for a specific service (no file upload).

**Content-Type:** `application/json`

**Request Body:**
```json
{
  "userId": "user123",        // must match :userId param
  "serviceId": "service456",  // the service to attach the image to
  "imageUrl": "https://..."   // URL returned from step 1
}
```

---

#### 1. Add Service (JSON)

**Endpoint:** `PATCH /api/vendor/:userId/add-service-json`

**Description:** Adds service to vendor document (legacy)

**Content-Type:** `application/json`

**Request Body (Saloon Example):**
```json
{
  "service": {
    "category": "saloon",
    "serviceName": "Haircut",
    "serviceImage": "https://...",
    "serviceDurationInMinutes": 45,
    "bufferTimeInMinutes": 5,
    "price": 250,
    "priceUnitLabel": "per person",
    "serviceFor": "male",
    "maxConcurrentBookings": 1,
    "assignedStaff": ["Ramesh"],
    "categoryLabel": "Hair",
    "isActive": true,
    "isDiscoverable": true
  }
}
```

---

#### 2. Update Service (JSON)

**Endpoint:** `PATCH /api/vendor/:userId/update-service-json`

**Description:** Updates service in vendor document (legacy)

**Content-Type:** `application/json`

**Request Body:**
```json
{
  "userId": "user123",
  "serviceId": "service456",
  "serviceName": "Premium Haircut",
  "price": 350,
  "serviceDurationInMinutes": 60
}
```

**Note:** All fields are optional except `userId` and `serviceId`

---

#### 3. Delete Service

**Endpoint:** `DELETE /api/vendor/:userId/service`

**Description:** Deletes service from vendor document (legacy)

**Content-Type:** `application/json`

**Request Body:**
```json
{
  "serviceId": "service456"
}
```

---

## Service Schema (MongoDB Collection: `services`)

The Service schema in MongoDB supports all category fields dynamically. Fields are validated based on the `category` field using DTOs.

### Indexes

- `location: "2dsphere"` - Geospatial index for location-based queries
- `isActive: 1` - Index for active services
- `businessId: 1` - Index for business queries
- `vendorId: 1` - Index for vendor queries

---

## ServiceApproval Schema (MongoDB Collection: `services_approval`)

The ServiceApproval schema mirrors the Service schema with an additional `status` field.

### Status Values

- `pending` (default) - Service request is pending approval
- `approved` - Service request has been approved
- `rejected` - Service request has been rejected

### Indexes

- `status: 1, createdAt: -1` - Most important index for pending approvals
- `vendorId: 1, status: 1` - Index for vendor-specific queries
- `businessId: 1` - Index for business-specific queries

---

## Validation Rules

### Category-Based Validation

The DTOs use `@ValidateIf` decorators to ensure that:
1. Required fields for a category are present when that category is selected
2. Optional fields can only be provided for their respective categories
3. Invalid category values are rejected

### Field Requirements by Category

| Field | Turf | Saloon | Swimming Pool | Spa | Beauty Parlour |
|-------|------|--------|---------------|-----|----------------|
| `sportType` | ✅ | ❌ | ❌ | ❌ | ❌ |
| `slotDurationInMinutes` | ✅ | ❌ | ✅ | ❌ | ❌ |
| `serviceDurationInMinutes` | ❌ | ✅ | ❌ | ✅ | ✅ |
| `pricePerSlot` | ✅ | ❌ | ❌ | ❌ | ❌ |
| `pricePerPerson` | ❌ | ❌ | ✅ | ❌ | ❌ |
| `price` | ❌ | ✅ | ❌ | ✅ | ✅ |
| `maxPlayers` | ✅ | ❌ | ❌ | ❌ | ❌ |
| `maxCapacity` | ❌ | ❌ | ✅ | ❌ | ❌ |
| `maxConcurrentBookings` | ❌ | ✅ | ❌ | ❌ | ❌ |
| `maxConcurrentSessions` | ❌ | ❌ | ❌ | ✅ | ✅ |
| `allowedGenders` | ✅ | ❌ | ✅ | ❌ | ❌ |
| `serviceFor` | ❌ | ✅ | ❌ | ❌ | ✅ |
| `therapistGender` | ❌ | ❌ | ❌ | ✅ | ❌ |
| `ageGroup` | ❌ | ❌ | ✅ | ❌ | ❌ |

---

## Migration Notes

### Breaking Changes

1. **Field Names Changed:**
- `durationInMinutes` → `serviceDurationInMinutes` (for saloon/spa/beauty-parlor) or `slotDurationInMinutes` (for turf/swimming-pool)
- `price` → `pricePerSlot` (turf) or `pricePerPerson` (swimming-pool) or `price` (saloon/spa/beauty-parlor)
- `gender` → `serviceFor` (saloon/beauty-parlor) or `allowedGenders` (turf/swimming-pool) or `therapistGender` (spa)
- `maxBookingsPerSlot` → `maxPlayers` (turf) or `maxCapacity` (swimming-pool) or `maxConcurrentBookings` (saloon) or `maxConcurrentSessions` (spa/beauty-parlor)

2. **New Required Field:**
   - `priceUnitLabel` - Now required for all categories

3. **Category-Specific Fields:**
   - Each category now has its own set of required and optional fields

---

## Error Responses

All endpoints return errors in the following format:

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Error message here",
  "path": "/api/vendor/...",
  "timestamp": "2026-01-09T20:00:00.000Z"
}
```

### Common Error Codes

- `400` - Bad Request (validation errors, invalid category, etc.)
- `404` - Not Found (service, business, vendor not found)
- `500` - Internal Server Error

---

## Notes

1. **Category Validation:** The `category` field must be one of the supported categories. Invalid categories will result in validation errors.

2. **Field Validation:** Required fields for each category are validated at the DTO level. Missing required fields will result in validation errors.

3. **Optional Fields:** Optional fields can be omitted or set to `null`. They will only be stored if provided.

4. **Service Approval Flow:** Production services go through an approval flow:
   - Upload image → Save request → Approve/Reject → Service created

5. **Legacy Support:** Legacy vendor services (stored in Vendor document) still support the new category-based structure but are stored differently.

---

## Examples by Category

### Creating a Turf Service

```bash
curl -X PATCH \
  'https://api.example.com/api/vendor/69615ddd7c6e18f8055b5a29/prod-save-service-request' \
  -H 'Content-Type: application/json' \
  -d '{
    "businessId": "69615ddd7c6e18f8055b5a29",
    "category": "turf",
    "serviceName": "Cricket Pitch",
    "serviceImage": "https://...",
    "sportType": "cricket",
    "slotDurationInMinutes": 60,
    "bufferTimeInMinutes": 5,
    "pricePerSlot": 900,
    "priceUnitLabel": "per hour",
    "maxPlayers": 12,
    "allowedGenders": "mixed",
    "amenities": ["lights", "parking"],
    "isActive": true,
    "isDiscoverable": true
  }'
```

### Creating a Saloon Service

```bash
curl -X PATCH \
  'https://api.example.com/api/vendor/69615ddd7c6e18f8055b5a29/prod-save-service-request' \
  -H 'Content-Type: application/json' \
  -d '{
    "businessId": "69615ddd7c6e18f8055b5a29",
    "category": "saloon",
    "serviceName": "Haircut",
    "serviceImage": "https://...",
    "serviceDurationInMinutes": 45,
    "bufferTimeInMinutes": 5,
    "price": 250,
    "priceUnitLabel": "per person",
    "serviceFor": "male",
    "maxConcurrentBookings": 1,
    "assignedStaff": ["Ramesh"],
    "categoryLabel": "Hair",
    "isActive": true,
    "isDiscoverable": true
  }'
```

---

## Support

For questions or issues related to the refactored services API, please refer to the codebase or contact the development team.

