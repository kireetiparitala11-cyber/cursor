#!/bin/bash

# Lead Scoring Platform Setup Script
# This script sets up the development environment for the Lead Scoring Platform

set -e

echo "🚀 Setting up Lead Scoring Platform..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
check_node() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18+ is required. Current version: $(node -v)"
        exit 1
    fi
    
    print_success "Node.js $(node -v) is installed"
}

# Check if npm is installed
check_npm() {
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm."
        exit 1
    fi
    
    print_success "npm $(npm -v) is installed"
}

# Install backend dependencies
setup_backend() {
    print_status "Setting up backend..."
    
    cd backend
    
    if [ ! -f "package.json" ]; then
        print_error "package.json not found in backend directory"
        exit 1
    fi
    
    print_status "Installing backend dependencies..."
    npm install
    
    # Create logs directory
    mkdir -p logs
    
    # Create uploads directory
    mkdir -p uploads
    
    print_success "Backend setup complete"
    cd ..
}

# Install frontend dependencies
setup_frontend() {
    print_status "Setting up frontend..."
    
    cd frontend
    
    if [ ! -f "package.json" ]; then
        print_error "package.json not found in frontend directory"
        exit 1
    fi
    
    print_status "Installing frontend dependencies..."
    npm install
    
    print_success "Frontend setup complete"
    cd ..
}

# Install mobile dependencies
setup_mobile() {
    print_status "Setting up mobile app..."
    
    cd mobile
    
    if [ ! -f "package.json" ]; then
        print_error "package.json not found in mobile directory"
        exit 1
    fi
    
    print_status "Installing mobile dependencies..."
    npm install
    
    # Check if React Native CLI is installed
    if ! command -v react-native &> /dev/null; then
        print_warning "React Native CLI not found. Installing globally..."
        npm install -g react-native-cli
    fi
    
    print_success "Mobile setup complete"
    cd ..
}

# Create environment files
setup_env_files() {
    print_status "Creating environment files..."
    
    # Backend .env
    if [ ! -f "backend/.env" ]; then
        cp backend/.env.example backend/.env
        print_success "Created backend/.env from template"
        print_warning "Please update backend/.env with your actual values"
    else
        print_warning "backend/.env already exists, skipping"
    fi
    
    # Frontend .env
    if [ ! -f "frontend/.env" ]; then
        cat > frontend/.env << EOF
REACT_APP_API_URL=http://localhost:5000/api
EOF
        print_success "Created frontend/.env"
    else
        print_warning "frontend/.env already exists, skipping"
    fi
    
    # Mobile .env
    if [ ! -f "mobile/.env" ]; then
        cat > mobile/.env << EOF
REACT_APP_API_URL=http://localhost:5000/api
EOF
        print_success "Created mobile/.env"
    else
        print_warning "mobile/.env already exists, skipping"
    fi
}

# Setup database
setup_database() {
    print_status "Database setup instructions..."
    print_warning "Please set up MongoDB Atlas:"
    echo "1. Go to https://cloud.mongodb.com"
    echo "2. Create a new cluster"
    echo "3. Create a database user"
    echo "4. Configure network access"
    echo "5. Get your connection string"
    echo "6. Update MONGODB_URI in backend/.env"
}

# Setup API keys
setup_api_keys() {
    print_status "API Keys setup instructions..."
    print_warning "Please obtain the following API keys:"
    echo ""
    echo "Meta Ads API:"
    echo "1. Go to https://developers.facebook.com"
    echo "2. Create a new app"
    echo "3. Get App ID, App Secret, and Access Token"
    echo "4. Update backend/.env with META_* variables"
    echo ""
    echo "Google Ads API:"
    echo "1. Go to https://ads.google.com"
    echo "2. Set up API access"
    echo "3. Get Developer Token, Client ID, Client Secret, Refresh Token"
    echo "4. Update backend/.env with GOOGLE_ADS_* variables"
    echo ""
    echo "Email (Optional):"
    echo "1. Set up SMTP credentials"
    echo "2. Update backend/.env with SMTP_* variables"
    echo ""
    echo "SMS (Optional):"
    echo "1. Set up Twilio account"
    echo "2. Update backend/.env with TWILIO_* variables"
}

# Main setup function
main() {
    echo "=========================================="
    echo "Lead Scoring Platform Setup"
    echo "=========================================="
    echo ""
    
    # Check prerequisites
    check_node
    check_npm
    
    # Setup each component
    setup_backend
    setup_frontend
    setup_mobile
    setup_env_files
    
    echo ""
    echo "=========================================="
    print_success "Setup completed successfully!"
    echo "=========================================="
    echo ""
    
    # Additional setup instructions
    setup_database
    echo ""
    setup_api_keys
    echo ""
    
    print_status "Next steps:"
    echo "1. Update environment variables in backend/.env"
    echo "2. Set up MongoDB Atlas database"
    echo "3. Configure API keys for Meta Ads and Google Ads"
    echo "4. Start the development servers:"
    echo "   - Backend: cd backend && npm run dev"
    echo "   - Frontend: cd frontend && npm start"
    echo "   - Mobile: cd mobile && npm run android (or ios)"
    echo ""
    print_success "Happy coding! 🎉"
}

# Run main function
main "$@"