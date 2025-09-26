# API Documentation

This document provides comprehensive API documentation for the Lead Scoring Platform.

## Base URL

```
Production: https://your-backend-url.com/api
Development: http://localhost:5000/api
```

## Authentication

All API endpoints (except auth endpoints) require authentication using JWT tokens.

### Headers

```
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
```

## Response Format

All API responses follow this format:

```json
{
  "success": true,
  "message": "Optional message",
  "data": {}, // Response data
  "count": 10, // For paginated responses
  "total": 100,
  "page": 1,
  "pages": 10
}
```

## Error Responses

```json
{
  "success": false,
  "message": "Error description",
  "errors": [] // Validation errors (optional)
}
```

## Authentication Endpoints

### Register User

**POST** `/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "company": "Acme Corp",
  "phone": "+1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "company": "Acme Corp",
      "role": "user",
      "isActive": true
    },
    "token": "jwt_token_here"
  }
}
```

### Login User

**POST** `/auth/login`

Authenticate user and return JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "company": "Acme Corp",
      "role": "user",
      "isActive": true,
      "lastLogin": "2024-01-01T00:00:00.000Z"
    },
    "token": "jwt_token_here"
  }
}
```

### Get Current User

**GET** `/auth/me`

Get current authenticated user information.

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "company": "Acme Corp",
      "role": "user",
      "phone": "+1234567890",
      "avatar": "avatar_url",
      "isActive": true,
      "lastLogin": "2024-01-01T00:00:00.000Z",
      "preferences": {
        "notifications": {
          "email": true,
          "sms": false,
          "push": true
        },
        "dashboard": {
          "defaultView": "leads",
          "itemsPerPage": 25
        }
      },
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### Update Profile

**PUT** `/auth/profile`

Update user profile information.

**Request Body:**
```json
{
  "name": "John Smith",
  "phone": "+1234567891",
  "company": "New Company"
}
```

### Change Password

**PUT** `/auth/password`

Change user password.

**Request Body:**
```json
{
  "currentPassword": "old_password",
  "newPassword": "new_password"
}
```

### Update Preferences

**PUT** `/auth/preferences`

Update user preferences.

**Request Body:**
```json
{
  "preferences": {
    "notifications": {
      "email": true,
      "sms": true,
      "push": false
    },
    "dashboard": {
      "defaultView": "campaigns",
      "itemsPerPage": 50
    }
  }
}
```

## Leads Endpoints

### Get All Leads

**GET** `/leads`

Get paginated list of leads with optional filtering.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 25, max: 100)
- `status` (string): Filter by lead status
- `priority` (string): Filter by priority
- `campaign` (string): Filter by campaign ID
- `assignedTo` (string): Filter by assigned user ID
- `source` (string): Filter by lead source
- `sortBy` (string): Sort field (default: score)
- `sortOrder` (string): Sort order - asc/desc (default: desc)

**Response:**
```json
{
  "success": true,
  "count": 25,
  "total": 100,
  "page": 1,
  "pages": 4,
  "data": [
    {
      "_id": "lead_id",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "company": "Acme Corp",
      "jobTitle": "Manager",
      "campaign": {
        "_id": "campaign_id",
        "name": "Summer Campaign",
        "platform": "meta",
        "type": "lead_generation"
      },
      "adPlatform": "meta",
      "adId": "ad_123",
      "source": "facebook",
      "engagement": {
        "pageViews": 5,
        "timeOnSite": 300,
        "bounceRate": 0.2,
        "lastActivity": "2024-01-01T00:00:00.000Z",
        "interactions": []
      },
      "score": {
        "current": 85,
        "previous": 80,
        "factors": [],
        "lastCalculated": "2024-01-01T00:00:00.000Z",
        "confidence": 0.9
      },
      "status": "new",
      "priority": "high",
      "assignedTo": null,
      "owner": {
        "_id": "user_id",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "conversion": {
        "isConverted": false,
        "convertedAt": null,
        "conversionValue": 0,
        "conversionType": null,
        "notes": null
      },
      "notes": [],
      "tags": ["hot", "enterprise"],
      "quality": {
        "emailValid": true,
        "phoneValid": true,
        "companyValid": true,
        "completeness": 90
      },
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### Get Single Lead

**GET** `/leads/:id`

Get detailed information about a specific lead.

**Response:**
```json
{
  "success": true,
  "data": {
    // Full lead object with populated references
  }
}
```

### Create Lead

**POST** `/leads`

Create a new lead.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "company": "Acme Corp",
  "jobTitle": "Manager",
  "campaign": "campaign_id",
  "adPlatform": "meta",
  "adId": "ad_123",
  "source": "facebook",
  "formData": {
    "customField": "value"
  }
}
```

### Update Lead

**PUT** `/leads/:id`

Update an existing lead.

**Request Body:**
```json
{
  "status": "contacted",
  "priority": "high",
  "assignedTo": "user_id",
  "notes": "Called and left voicemail"
}
```

### Delete Lead

**DELETE** `/leads/:id`

Delete a lead.

### Add Note to Lead

**POST** `/leads/:id/notes`

Add a note to a lead.

**Request Body:**
```json
{
  "content": "Called lead, interested in our services",
  "isPrivate": false
}
```

### Add Interaction to Lead

**POST** `/leads/:id/interactions`

Record an interaction with a lead.

**Request Body:**
```json
{
  "type": "email_open",
  "metadata": {
    "emailId": "email_123",
    "subject": "Welcome to our service"
  }
}
```

### Get Lead Scoring Explanation

**GET** `/leads/:id/scoring`

Get detailed scoring explanation for a lead.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalScore": 85,
    "confidence": 0.9,
    "factors": [
      {
        "name": "formCompleteness",
        "score": 90,
        "weight": 0.15,
        "description": "Form completion percentage",
        "impact": 13.5
      },
      {
        "name": "emailQuality",
        "score": 80,
        "weight": 0.10,
        "description": "Email domain quality and validity",
        "impact": 8.0
      }
    ],
    "recommendations": [
      "Encourage users to complete more form fields",
      "Verify email address quality and validity"
    ]
  }
}
```

## Campaigns Endpoints

### Get All Campaigns

**GET** `/campaigns`

Get paginated list of campaigns.

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `status` (string): Filter by campaign status
- `platform` (string): Filter by platform
- `sortBy` (string): Sort field
- `sortOrder` (string): Sort order

**Response:**
```json
{
  "success": true,
  "count": 10,
  "total": 50,
  "page": 1,
  "pages": 5,
  "data": [
    {
      "_id": "campaign_id",
      "name": "Summer Campaign",
      "description": "Summer promotion campaign",
      "platform": "meta",
      "platformCampaignId": "fb_campaign_123",
      "type": "lead_generation",
      "objective": "leads",
      "budget": {
        "daily": 100,
        "total": 3000,
        "spent": 1500,
        "currency": "USD"
      },
      "targeting": {
        "demographics": {
          "ageMin": 25,
          "ageMax": 45,
          "genders": ["male", "female"],
          "locations": ["United States"],
          "languages": ["English"]
        },
        "interests": ["technology", "business"],
        "behaviors": ["online_shopping"],
        "customAudiences": [],
        "lookalikeAudiences": []
      },
      "creative": {
        "adFormat": "single_image",
        "headline": "Get 50% Off Today!",
        "description": "Limited time offer",
        "callToAction": "Shop Now",
        "images": ["image_url_1", "image_url_2"],
        "videos": [],
        "landingPageUrl": "https://example.com/offer"
      },
      "metrics": {
        "impressions": 100000,
        "clicks": 5000,
        "conversions": 250,
        "costPerClick": 0.50,
        "costPerConversion": 10.00,
        "clickThroughRate": 5.0,
        "conversionRate": 5.0,
        "lastUpdated": "2024-01-01T00:00:00.000Z"
      },
      "status": "active",
      "startDate": "2024-01-01T00:00:00.000Z",
      "endDate": "2024-03-31T23:59:59.000Z",
      "owner": {
        "_id": "user_id",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "scoringConfig": {
        "enabled": true,
        "factors": [],
        "autoUpdate": true,
        "updateFrequency": "hourly"
      },
      "integration": {
        "webhookUrl": "https://api.example.com/webhooks/leads",
        "autoSync": true,
        "syncFrequency": "hourly",
        "lastSync": "2024-01-01T00:00:00.000Z"
      },
      "tags": ["summer", "promotion"],
      "category": "seasonal",
      "notes": [],
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### Get Single Campaign

**GET** `/campaigns/:id`

Get detailed campaign information with statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "campaign": {
      // Full campaign object
    },
    "statistics": {
      "totalLeads": 250,
      "averageScore": 75,
      "statusCounts": {
        "new": 100,
        "contacted": 75,
        "qualified": 50,
        "closed_won": 25
      }
    }
  }
}
```

### Create Campaign

**POST** `/campaigns`

Create a new campaign.

**Request Body:**
```json
{
  "name": "New Campaign",
  "description": "Campaign description",
  "platform": "meta",
  "platformCampaignId": "fb_campaign_456",
  "startDate": "2024-01-01T00:00:00.000Z",
  "type": "lead_generation",
  "objective": "leads"
}
```

### Update Campaign

**PUT** `/campaigns/:id`

Update campaign information.

### Delete Campaign

**DELETE** `/campaigns/:id`

Delete a campaign (only if no leads are associated).

### Add Note to Campaign

**POST** `/campaigns/:id/notes`

Add a note to a campaign.

**Request Body:**
```json
{
  "content": "Campaign performing well, consider increasing budget"
}
```

### Update Campaign Metrics

**PUT** `/campaigns/:id/metrics`

Update campaign performance metrics.

**Request Body:**
```json
{
  "impressions": 150000,
  "clicks": 7500,
  "conversions": 375,
  "costPerClick": 0.45,
  "costPerConversion": 9.00
}
```

### Get Campaign Leads

**GET** `/campaigns/:id/leads`

Get all leads for a specific campaign.

## Scoring Endpoints

### Recalculate Lead Scores

**POST** `/scoring/recalculate`

Recalculate scores for leads.

**Request Body:**
```json
{
  "leadIds": ["lead_id_1", "lead_id_2"], // Optional: specific leads
  "campaignId": "campaign_id", // Optional: all leads in campaign
  "allLeads": true // Optional: all user's leads
}
```

**Response:**
```json
{
  "success": true,
  "message": "Score recalculation completed. Processed: 100, Errors: 0",
  "data": {
    "processed": 100,
    "errors": 0,
    "results": [
      {
        "leadId": "lead_id",
        "email": "john@example.com",
        "oldScore": 80,
        "newScore": 85,
        "confidence": 0.9
      }
    ],
    "errors": []
  }
}
```

### Get Scoring Configuration

**GET** `/scoring/config`

Get available scoring factors and configuration.

**Response:**
```json
{
  "success": true,
  "data": {
    "defaultFactors": {
      "formCompleteness": {
        "weight": 0.15,
        "description": "Form completion percentage"
      }
    },
    "availableFactors": [
      {
        "name": "formCompleteness",
        "description": "Form completion percentage",
        "weight": 0.15,
        "type": "percentage"
      }
    ]
  }
}
```

### Update Scoring Configuration

**PUT** `/scoring/config/:campaignId`

Update scoring configuration for a campaign.

**Request Body:**
```json
{
  "factors": [
    {
      "name": "formCompleteness",
      "weight": 0.20,
      "enabled": true,
      "description": "Form completion percentage"
    }
  ],
  "enabled": true,
  "autoUpdate": true,
  "updateFrequency": "hourly"
}
```

### Get Scoring Analytics

**GET** `/scoring/analytics`

Get scoring analytics and insights.

**Query Parameters:**
- `campaignId` (string): Filter by campaign
- `dateFrom` (string): Start date (ISO 8601)
- `dateTo` (string): End date (ISO 8601)

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalLeads": 1000,
      "avgScore": 75,
      "maxScore": 95,
      "minScore": 25,
      "highQualityLeads": 300,
      "mediumQualityLeads": 500,
      "lowQualityLeads": 200
    },
    "distribution": [
      {
        "range": "0-20",
        "count": 50,
        "percentage": 5
      }
    ],
    "topFactors": [
      {
        "_id": "formCompleteness",
        "avgValue": 85,
        "count": 1000
      }
    ]
  }
}
```

### Get Lead Score History

**GET** `/scoring/history/:leadId`

Get score history for a specific lead.

**Response:**
```json
{
  "success": true,
  "data": {
    "leadId": "lead_id",
    "currentScore": 85,
    "previousScore": 80,
    "lastCalculated": "2024-01-01T00:00:00.000Z",
    "confidence": 0.9,
    "history": [
      {
        "timestamp": "2024-01-01T00:00:00.000Z",
        "factors": [],
        "score": 85
      }
    ]
  }
}
```

## Analytics Endpoints

### Get Dashboard Analytics

**GET** `/analytics/dashboard`

Get dashboard analytics and metrics.

**Query Parameters:**
- `dateFrom` (string): Start date (ISO 8601)
- `dateTo` (string): End date (ISO 8601)

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalLeads": 1000,
      "totalCampaigns": 10,
      "activeCampaigns": 8,
      "avgScore": 75
    },
    "distribution": {
      "byStatus": [
        { "_id": "new", "count": 400 },
        { "_id": "contacted", "count": 300 }
      ],
      "bySource": [
        { "_id": "facebook", "count": 500 },
        { "_id": "google", "count": 300 }
      ],
      "byPriority": [
        { "_id": "high", "count": 200 },
        { "_id": "medium", "count": 600 }
      ]
    },
    "conversions": {
      "totalLeads": 1000,
      "convertedLeads": 100,
      "conversionRate": 10,
      "totalValue": 50000,
      "avgValue": 500
    },
    "recentLeads": [],
    "topCampaigns": [],
    "trends": {
      "leadsOverTime": []
    }
  }
}
```

### Get Campaign Performance Analytics

**GET** `/analytics/campaigns`

Get campaign performance analytics.

**Query Parameters:**
- `dateFrom` (string): Start date
- `dateTo` (string): End date
- `platform` (string): Filter by platform

### Get Lead Quality Analytics

**GET** `/analytics/quality`

Get lead quality analytics and insights.

**Query Parameters:**
- `dateFrom` (string): Start date
- `dateTo` (string): End date
- `campaignId` (string): Filter by campaign

## Integrations Endpoints

### Get Integration Settings

**GET** `/integrations`

Get current integration settings.

**Response:**
```json
{
  "success": true,
  "data": {
    "integrations": {
      "meta": {
        "isConnected": true,
        "appId": "***1234",
        "hasAccessToken": true
      },
      "google": {
        "isConnected": false,
        "clientId": null,
        "hasRefreshToken": false
      }
    }
  }
}
```

### Update Meta Integration

**PUT** `/integrations/meta`

Update Meta Ads integration settings.

**Request Body:**
```json
{
  "appId": "your_app_id",
  "appSecret": "your_app_secret",
  "accessToken": "your_access_token"
}
```

### Update Google Integration

**PUT** `/integrations/google`

Update Google Ads integration settings.

**Request Body:**
```json
{
  "developerToken": "your_developer_token",
  "clientId": "your_client_id",
  "clientSecret": "your_client_secret",
  "refreshToken": "your_refresh_token"
}
```

### Disconnect Integration

**DELETE** `/integrations/meta`
**DELETE** `/integrations/google`

Disconnect an integration.

### Sync Campaigns

**POST** `/integrations/meta/sync`
**POST** `/integrations/google/sync`

Sync campaigns from the platform.

### Test Connection

**POST** `/integrations/test/:platform`

Test integration connection.

**Path Parameters:**
- `platform`: "meta" or "google"

### Get Webhook Information

**GET** `/integrations/webhooks`

Get webhook configuration information.

## Webhook Endpoints

### Lead Webhook

**POST** `/webhooks/leads`

Receive lead data from external platforms.

**Request Body:**
```json
{
  "platform": "meta",
  "campaignId": "fb_campaign_123",
  "leadData": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890"
  },
  "metadata": {
    "adId": "ad_123",
    "adSetId": "adset_456",
    "source": "facebook"
  }
}
```

## Rate Limiting

API endpoints are rate limited to prevent abuse:

- **General endpoints**: 100 requests per 15 minutes per IP
- **Auth endpoints**: 10 requests per 15 minutes per IP
- **Webhook endpoints**: 1000 requests per hour per IP

Rate limit headers are included in responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid input data |
| 401 | Unauthorized - Invalid or missing token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource already exists |
| 422 | Unprocessable Entity - Validation errors |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server error |

## SDKs and Libraries

### JavaScript/TypeScript

```bash
npm install axios
```

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://your-api-url.com/api',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

// Get leads
const leads = await api.get('/leads');

// Create lead
const newLead = await api.post('/leads', leadData);
```

### Python

```bash
pip install requests
```

```python
import requests

headers = {
    'Authorization': f'Bearer {token}',
    'Content-Type': 'application/json'
}

# Get leads
response = requests.get('https://your-api-url.com/api/leads', headers=headers)
leads = response.json()

# Create lead
response = requests.post('https://your-api-url.com/api/leads', 
                        json=lead_data, headers=headers)
```

### PHP

```php
<?php
$token = 'your_jwt_token';
$headers = [
    'Authorization: Bearer ' . $token,
    'Content-Type: application/json'
];

// Get leads
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'https://your-api-url.com/api/leads');
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);

$leads = json_decode($response, true);
?>
```

## Support

For API support:

1. Check the error message and status code
2. Verify your authentication token
3. Ensure request format matches documentation
4. Check rate limiting if getting 429 errors
5. Contact support with specific error details

## Changelog

### v1.0.0 (2024-01-01)
- Initial API release
- Authentication endpoints
- Leads management
- Campaigns management
- Scoring engine
- Analytics endpoints
- Integrations support