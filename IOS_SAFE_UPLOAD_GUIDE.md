# iOS-Safe Upload Implementation Guide

## Overview

This implementation provides iOS-safe, production-grade file upload endpoints that separate file uploads from database operations. This solves iOS-specific HTTP stream handling issues.

## Architecture: 2-Step Upload Flow

### Step 1: Upload File Only (POST)
- Uploads file(s) to Cloudflare R2
- Returns small JSON response with URL(s) only
- **No database operations**
- **No large payloads**
- **No exceptions after upload starts**

### Step 2: Save Metadata (PATCH)
- Pure JSON request (no file streams)
- Saves URL(s) to MongoDB
- Returns small success response

## Endpoints

### Business Images

#### 1. Upload Business Images
```
POST /api/vendor/:userId/upload-business-images
Content-Type: multipart/form-data

Body:
- userId: string (in JSON)
- businessImages: File[] (2 files required)
```

**Response:**
```json
{
  "success": true,
  "data": {
    "imageUrls": [
      "https://pub-.../vendors/.../business-xxx-0",
      "https://pub-.../vendors/.../business-xxx-1"
    ]
  }
}
```

#### 2. Save Business Images Metadata
```
PATCH /api/vendor/:userId/save-business-images
Content-Type: application/json

Body:
{
  "userId": "string",
  "imageUrls": [
    "https://pub-.../vendors/.../business-xxx-0",
    "https://pub-.../vendors/.../business-xxx-1"
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "message": "Business images saved successfully"
  }
}
```

### Business Document

#### 1. Upload Business Document
```
POST /api/vendor/:userId/upload-business-document
Content-Type: multipart/form-data

Body:
- userId: string (in JSON)
- businessDocument: File (1 file required)
```

**Response:**
```json
{
  "success": true,
  "data": {
    "documentUrl": "https://pub-.../vendors/.../business-document-xxx"
  }
}
```

#### 2. Save Business Document Metadata
```
PATCH /api/vendor/:userId/save-business-document
Content-Type: application/json

Body:
{
  "userId": "string",
  "documentUrl": "https://pub-.../vendors/.../business-document-xxx"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "message": "Business document saved successfully"
  }
}
```

### Service Image

#### 1. Upload Service Image
```
POST /api/vendor/:userId/upload-service-image
Content-Type: multipart/form-data

Body:
- userId: string (in JSON)
- serviceId: string (in JSON)
- serviceImage: File (1 file required)
```

**Response:**
```json
{
  "success": true,
  "data": {
    "imageUrl": "https://pub-.../vendors/.../service-xxx"
  }
}
```

#### 2. Save Service Image Metadata
```
PATCH /api/vendor/:userId/save-service-image
Content-Type: application/json

Body:
{
  "userId": "string",
  "serviceId": "string",
  "imageUrl": "https://pub-.../vendors/.../service-xxx"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "message": "Service image saved successfully"
  }
}
```

## React Native Implementation Example

```typescript
// Step 1: Upload file
async function uploadBusinessImages(userId: string, images: File[]) {
  const formData = new FormData();
  formData.append('userId', userId);
  images.forEach((image, index) => {
    formData.append('businessImages', {
      uri: image.uri,
      type: image.type,
      name: `image${index}.jpg`,
    } as any);
  });

  const response = await fetch(
    `https://api.example.com/api/vendor/${userId}/upload-business-images`,
    {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  const result = await response.json();
  return result.data.imageUrls; // Array of URLs
}

// Step 2: Save metadata
async function saveBusinessImages(userId: string, imageUrls: string[]) {
  const response = await fetch(
    `https://api.example.com/api/vendor/${userId}/save-business-images`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        imageUrls,
      }),
    }
  );

  return await response.json();
}

// Usage
const imageUrls = await uploadBusinessImages(userId, [image1, image2]);
await saveBusinessImages(userId, imageUrls);
```

## Key Features

✅ **iOS-Safe**: Uses POST for multipart uploads
✅ **Small Responses**: Upload endpoints return only URLs
✅ **No DB in Upload**: Database operations separated
✅ **Explicit Termination**: Responses explicitly ended
✅ **Error Handling**: Errors thrown before upload starts
✅ **Cleanup**: Failed uploads cleaned up automatically
✅ **Backward Compatible**: Legacy endpoints still available

## Error Handling

All validation happens **before** upload starts:
- Invalid userId → Error before upload
- Missing files → Error before upload
- Invalid file format → Error before upload

If upload fails:
- Uploaded files are automatically cleaned up from R2
- Error response returned
- No partial state in database

## Legacy Endpoints

The following legacy endpoints are still available for backward compatibility but should be migrated to the 2-step flow:

- `PATCH /api/vendor/:userId/business-images` (legacy)
- `PATCH /api/vendor/:userId/business-document` (legacy)
- `PATCH /api/vendor/:userId/add-service` (legacy)

## Best Practices

1. **Always use POST for multipart uploads** (iOS requirement)
2. **Upload first, then save metadata** (2-step flow)
3. **Handle errors in Step 1** before proceeding to Step 2
4. **Store URLs temporarily** if Step 2 might fail
5. **Implement retry logic** for Step 2 (metadata save)
6. **Clean up orphaned files** if Step 2 fails repeatedly

## Production Checklist

- [x] POST method for multipart uploads
- [x] Small JSON responses from upload endpoints
- [x] No database operations in upload endpoints
- [x] Explicit response termination
- [x] Error handling before upload starts
- [x] Automatic cleanup on failure
- [x] Backward compatibility maintained

