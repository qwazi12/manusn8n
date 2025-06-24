#!/bin/bash

# NodePilot Docker Deployment Script
# This script builds and deploys NodePilot with all optimizations

set -e

echo "🚀 Starting NodePilot Docker Deployment..."

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

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if .env.local exists
if [ ! -f .env.local ]; then
    print_warning ".env.local not found. Creating from .env.production template..."
    cp .env.production .env.local
    print_warning "Please edit .env.local with your actual environment variables before continuing."
    read -p "Press Enter to continue after editing .env.local..."
fi

# Load environment variables
if [ -f .env.local ]; then
    export $(cat .env.local | grep -v '^#' | xargs)
fi

print_status "Building NodePilot Docker images..."

# Build the Docker images
docker-compose build --no-cache

print_success "Docker images built successfully!"

print_status "Starting NodePilot services..."

# Start the services
docker-compose up -d

print_success "NodePilot services started!"

# Wait for services to be ready
print_status "Waiting for services to be ready..."
sleep 30

# Check health
print_status "Checking service health..."

# Check frontend health
if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    print_success "Frontend is healthy!"
else
    print_warning "Frontend health check failed. Checking logs..."
    docker-compose logs nodepilot-frontend
fi

# Check if backend is running (if enabled)
if docker-compose ps | grep -q nodepilot-backend; then
    if curl -f http://localhost:8080/health > /dev/null 2>&1; then
        print_success "Backend is healthy!"
    else
        print_warning "Backend health check failed. Checking logs..."
        docker-compose logs nodepilot-backend
    fi
fi

print_status "Loading optimization data..."

# Load node patterns and tips
docker-compose exec nodepilot-frontend node scripts/load_node_patterns.js
docker-compose exec nodepilot-frontend node scripts/load_workflow_tips.js

print_success "Optimization data loaded!"

echo ""
echo "🎉 NodePilot deployment complete!"
echo ""
echo "📊 Service Status:"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:8080 (if enabled)"
echo "  Health:   http://localhost:3000/api/health"
echo ""
echo "🔧 Management Commands:"
echo "  View logs:    docker-compose logs -f"
echo "  Stop:         docker-compose down"
echo "  Restart:      docker-compose restart"
echo "  Update:       ./deploy-docker.sh"
echo ""
echo "🚀 NodePilot is now running with 10x faster workflow generation!"

# Optional: Open browser
if command -v open &> /dev/null; then
    read -p "Open NodePilot in browser? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        open http://localhost:3000
    fi
fi
