# Lead Scoring Platform

A comprehensive lead scoring and management platform with AI-driven intelligence.

## 🚀 Phase 1: Smart Scoring Engine (MVP)

### Features
- **Ad Platform Integrations**: Meta Ads (Facebook, Instagram), Google Ads
- **Lead Scoring Engine**: Configurable, transparent, explainable scoring logic
- **Client Dashboard**: Real-time lead stream with filtering and conversion insights
- **Cross-Platform Apps**: React Native iOS + Android apps

### Tech Stack
- **Frontend**: React (deployed on Vercel/Netlify)
- **Backend**: Node.js (Vercel/Firebase)
- **Database**: MongoDB Atlas
- **Mobile**: React Native
- **CI/CD**: GitHub Actions

## 🧠 Phase 2: AI-Driven Intelligence

### Features
- **ML-Based Scoring**: Predictive AI scoring with continuous learning
- **Automated Outreach**: Email/SMS with AI personalization
- **Sales Enablement AI**: FAQ auto-responses and smart nudges
- **Advanced Integrations**: Calendar sync, WhatsApp, HubSpot, Apollo.io, Zapier

## 📁 Project Structure

```
lead-scoring-platform/
├── backend/          # Node.js API server
├── frontend/         # React dashboard
├── mobile/           # React Native apps
├── docs/             # Documentation
└── scripts/          # Deployment scripts
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Meta Ads API access
- Google Ads API access

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   cd ../mobile && npm install
   ```

3. Set up environment variables (see `.env.example` files)

4. Start development servers:
   ```bash
   # Backend
   cd backend && npm run dev
   
   # Frontend
   cd frontend && npm start
   
   # Mobile
   cd mobile && npm run ios # or npm run android
   ```

## 📊 API Documentation

See `docs/api/` for detailed API documentation.

## 🚀 Deployment

See `docs/deployment/` for deployment instructions.

## 📱 Mobile Apps

The React Native apps are ready for App Store and Google Play submission.

## 🔧 Development

### Backend Development
```bash
cd backend
npm run dev          # Start development server
npm run test         # Run tests
npm run build        # Build for production
```

### Frontend Development
```bash
cd frontend
npm start            # Start development server
npm run build        # Build for production
npm run test         # Run tests
```

### Mobile Development
```bash
cd mobile
npm run ios          # Run on iOS simulator
npm run android      # Run on Android emulator
npm run build:ios    # Build iOS app
npm run build:android # Build Android app
```

## 📈 Roadmap

- [x] Phase 1: Smart Scoring Engine (MVP)
- [ ] Phase 2: AI-Driven Intelligence
- [ ] Advanced Analytics
- [ ] Enterprise Features

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.