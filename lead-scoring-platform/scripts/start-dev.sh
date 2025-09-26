#!/bin/bash

# Lead Scoring Platform Development Server Startup Script
# This script starts all development servers for the Lead Scoring Platform

set -e

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

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        return 0
    else
        return 1
    fi
}

# Function to kill process on port
kill_port() {
    local port=$1
    if check_port $port; then
        print_warning "Port $port is in use. Killing existing process..."
        lsof -ti:$port | xargs kill -9
        sleep 2
    fi
}

# Function to start backend server
start_backend() {
    print_status "Starting backend server..."
    
    if [ ! -d "backend" ]; then
        print_error "Backend directory not found"
        exit 1
    fi
    
    cd backend
    
    if [ ! -f "package.json" ]; then
        print_error "Backend package.json not found"
        exit 1
    fi
    
    # Check if dependencies are installed
    if [ ! -d "node_modules" ]; then
        print_warning "Backend dependencies not installed. Installing..."
        npm install
    fi
    
    # Check if .env exists
    if [ ! -f ".env" ]; then
        print_warning "Backend .env file not found. Please run setup script first."
        exit 1
    fi
    
    # Kill any existing process on port 5000
    kill_port 5000
    
    print_status "Starting backend on http://localhost:5000"
    npm run dev &
    BACKEND_PID=$!
    
    cd ..
    print_success "Backend server started (PID: $BACKEND_PID)"
}

# Function to start frontend server
start_frontend() {
    print_status "Starting frontend server..."
    
    if [ ! -d "frontend" ]; then
        print_error "Frontend directory not found"
        exit 1
    fi
    
    cd frontend
    
    if [ ! -f "package.json" ]; then
        print_error "Frontend package.json not found"
        exit 1
    fi
    
    # Check if dependencies are installed
    if [ ! -d "node_modules" ]; then
        print_warning "Frontend dependencies not installed. Installing..."
        npm install
    fi
    
    # Kill any existing process on port 3000
    kill_port 3000
    
    print_status "Starting frontend on http://localhost:3000"
    npm start &
    FRONTEND_PID=$!
    
    cd ..
    print_success "Frontend server started (PID: $FRONTEND_PID)"
}

# Function to start mobile development server
start_mobile() {
    print_status "Starting mobile development server..."
    
    if [ ! -d "mobile" ]; then
        print_error "Mobile directory not found"
        exit 1
    fi
    
    cd mobile
    
    if [ ! -f "package.json" ]; then
        print_error "Mobile package.json not found"
        exit 1
    fi
    
    # Check if dependencies are installed
    if [ ! -d "node_modules" ]; then
        print_warning "Mobile dependencies not installed. Installing..."
        npm install
    fi
    
    # Kill any existing Metro bundler
    kill_port 8081
    
    print_status "Starting Metro bundler on http://localhost:8081"
    npm start &
    METRO_PID=$!
    
    cd ..
    print_success "Mobile development server started (PID: $METRO_PID)"
}

# Function to show running servers
show_status() {
    echo ""
    echo "=========================================="
    print_success "Development servers are running!"
    echo "=========================================="
    echo ""
    echo "🌐 Frontend: http://localhost:3000"
    echo "🔧 Backend API: http://localhost:5000"
    echo "📱 Mobile Metro: http://localhost:8081"
    echo ""
    echo "📋 Server PIDs:"
    echo "   Backend: $BACKEND_PID"
    echo "   Frontend: $FRONTEND_PID"
    echo "   Metro: $METRO_PID"
    echo ""
    echo "🛑 To stop all servers, press Ctrl+C"
    echo ""
}

# Function to cleanup on exit
cleanup() {
    echo ""
    print_status "Shutting down servers..."
    
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
        print_status "Backend server stopped"
    fi
    
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
        print_status "Frontend server stopped"
    fi
    
    if [ ! -z "$METRO_PID" ]; then
        kill $METRO_PID 2>/dev/null || true
        print_status "Metro bundler stopped"
    fi
    
    print_success "All servers stopped"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Main function
main() {
    echo "=========================================="
    echo "Lead Scoring Platform Development Servers"
    echo "=========================================="
    echo ""
    
    # Check if we're in the right directory
    if [ ! -f "README.md" ]; then
        print_error "Please run this script from the project root directory"
        exit 1
    fi
    
    # Start servers
    start_backend
    sleep 3  # Give backend time to start
    
    start_frontend
    sleep 2  # Give frontend time to start
    
    start_mobile
    
    # Show status
    show_status
    
    # Wait for user to stop servers
    print_status "Press Ctrl+C to stop all servers..."
    wait
}

# Run main function
main "$@"