# Deployment Guide

This guide covers deploying the Lead Scoring Platform to various cloud platforms.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Vercel Deployment (Frontend)](#vercel-deployment-frontend)
- [Firebase Deployment (Backend)](#firebase-deployment-backend)
- [MongoDB Atlas Setup](#mongodb-atlas-setup)
- [Environment Variables](#environment-variables)
- [CI/CD Pipeline](#cicd-pipeline)
- [Mobile App Deployment](#mobile-app-deployment)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying, ensure you have:

- Node.js 18+ installed
- MongoDB Atlas account
- Vercel account
- Firebase account
- GitHub account
- Meta Ads API access
- Google Ads API access

## Environment Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd lead-scoring-platform
```

### 2. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install

# Mobile
cd ../mobile
npm install
```

## Vercel Deployment (Frontend)

### 1. Install Vercel CLI

```bash
npm install -g vercel
```

### 2. Deploy Frontend

```bash
cd frontend
vercel --prod
```

### 3. Configure Environment Variables

In Vercel dashboard, add these environment variables:

```
REACT_APP_API_URL=https://your-backend-url.com/api
```

### 4. Custom Domain (Optional)

1. Go to Vercel dashboard
2. Select your project
3. Go to Settings > Domains
4. Add your custom domain

## Firebase Deployment (Backend)

### 1. Install Firebase CLI

```bash
npm install -g firebase-tools
```

### 2. Login to Firebase

```bash
firebase login
```

### 3. Initialize Firebase Project

```bash
cd backend
firebase init
```

Select:
- Functions
- Hosting
- Firestore
- Storage

### 4. Deploy Backend

```bash
firebase deploy
```

## MongoDB Atlas Setup

### 1. Create Cluster

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a new cluster
3. Choose your preferred region
4. Select M0 (Free tier) for development

### 2. Configure Database Access

1. Go to Database Access
2. Add new database user
3. Set username and password
4. Grant read/write permissions

### 3. Configure Network Access

1. Go to Network Access
2. Add IP address (0.0.0.0/0 for development)
3. For production, add specific IP ranges

### 4. Get Connection String

1. Go to Clusters
2. Click "Connect"
3. Choose "Connect your application"
4. Copy the connection string

## Environment Variables

### Backend Environment Variables

Create `backend/.env`:

```env
# Server Configuration
NODE_ENV=production
PORT=5000
HOST=0.0.0.0

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/lead-scoring?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d

# API Keys
META_APP_ID=your-meta-app-id
META_APP_SECRET=your-meta-app-secret
META_ACCESS_TOKEN=your-meta-access-token

GOOGLE_ADS_DEVELOPER_TOKEN=your-google-ads-developer-token
GOOGLE_ADS_CLIENT_ID=your-google-ads-client-id
GOOGLE_ADS_CLIENT_SECRET=your-google-ads-client-secret
GOOGLE_ADS_REFRESH_TOKEN=your-google-ads-refresh-token

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# SMS Configuration (Twilio)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=your-twilio-phone-number

# Frontend URL
FRONTEND_URL=https://your-frontend-domain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend Environment Variables

Create `frontend/.env`:

```env
REACT_APP_API_URL=https://your-backend-url.com/api
```

### Mobile Environment Variables

Create `mobile/.env`:

```env
REACT_APP_API_URL=https://your-backend-url.com/api
```

## CI/CD Pipeline

### 1. GitHub Secrets

Add these secrets to your GitHub repository:

```
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-vercel-org-id
VERCEL_PROJECT_ID=your-vercel-project-id
FIREBASE_SERVICE_ACCOUNT=your-firebase-service-account-json
FIREBASE_PROJECT_ID=your-firebase-project-id
REACT_APP_API_URL=https://your-backend-url.com/api
```

### 2. Workflow Triggers

The CI/CD pipeline automatically triggers on:
- Push to `main` branch → Production deployment
- Push to `develop` branch → Staging deployment
- Pull requests → Run tests only

### 3. Manual Deployment

To manually trigger deployment:

```bash
# Deploy to staging
git push origin develop

# Deploy to production
git push origin main
```

## Mobile App Deployment

### Android

#### 1. Generate Signed APK

```bash
cd mobile/android
./gradlew assembleRelease
```

#### 2. Upload to Google Play Console

1. Go to [Google Play Console](https://play.google.com/console)
2. Create new app
3. Upload APK
4. Fill in store listing
5. Submit for review

### iOS

#### 1. Build for App Store

```bash
cd mobile/ios
xcodebuild -workspace LeadScoring.xcworkspace -scheme LeadScoring -configuration Release -destination generic/platform=iOS -archivePath LeadScoring.xcarchive archive
```

#### 2. Upload to App Store Connect

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Create new app
3. Upload build using Xcode or Application Loader
4. Fill in app information
5. Submit for review

## Troubleshooting

### Common Issues

#### 1. Build Failures

**Problem**: Frontend build fails
**Solution**: Check environment variables and dependencies

```bash
cd frontend
npm ci
npm run build
```

#### 2. Database Connection Issues

**Problem**: Cannot connect to MongoDB
**Solution**: Check connection string and network access

```bash
# Test connection
mongosh "your-connection-string"
```

#### 3. API Authentication Issues

**Problem**: JWT token errors
**Solution**: Check JWT_SECRET and token expiration

#### 4. Mobile Build Issues

**Problem**: React Native build fails
**Solution**: Clean and rebuild

```bash
cd mobile
npm run clean
npm install
npm run android  # or npm run ios
```

### Performance Optimization

#### 1. Database Indexing

Add indexes for better performance:

```javascript
// In MongoDB Atlas or MongoDB Compass
db.leads.createIndex({ "score.current": -1 })
db.leads.createIndex({ "createdAt": -1 })
db.leads.createIndex({ "owner": 1, "status": 1 })
```

#### 2. Caching

Implement Redis for session caching:

```bash
# Add to backend dependencies
npm install redis
```

#### 3. CDN

Use Vercel's CDN for static assets or configure CloudFlare.

### Monitoring

#### 1. Error Tracking

Add Sentry for error tracking:

```bash
# Backend
npm install @sentry/node

# Frontend
npm install @sentry/react
```

#### 2. Analytics

Add Google Analytics or Mixpanel for user analytics.

#### 3. Uptime Monitoring

Use services like UptimeRobot or Pingdom.

### Security

#### 1. HTTPS

Ensure all deployments use HTTPS.

#### 2. Environment Variables

Never commit sensitive data to version control.

#### 3. API Rate Limiting

Configure appropriate rate limits for production.

#### 4. CORS

Configure CORS properly for production domains.

## Support

For deployment issues:

1. Check the logs in your hosting platform
2. Review the CI/CD pipeline logs
3. Test locally with production environment variables
4. Contact support with specific error messages

## Next Steps

After successful deployment:

1. Set up monitoring and alerting
2. Configure backup strategies
3. Implement security best practices
4. Plan for scaling as your user base grows
5. Set up staging environment for testing