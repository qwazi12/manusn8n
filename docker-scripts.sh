#!/bin/bash

# NodePilot Docker Management Scripts

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

# Check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker Desktop."
        exit 1
    fi
    print_success "Docker is running"
}

# Setup environment
setup_env() {
    if [ ! -f .env ]; then
        print_warning ".env file not found. Creating from .env.docker template..."
        cp .env.docker .env
        print_success "Created .env file. Please review and update values if needed."
    else
        print_success ".env file exists"
    fi
}

# Build images
build() {
    print_status "Building NodePilot Docker images..."
    docker-compose build --no-cache
    print_success "Images built successfully"
}

# Start services
start() {
    print_status "Starting NodePilot services..."
    docker-compose up -d
    print_success "Services started successfully"
    
    print_status "Waiting for services to be ready..."
    sleep 10
    
    # Check service health
    if docker-compose ps | grep -q "Up"; then
        print_success "Services are running:"
        docker-compose ps
        echo ""
        print_status "Access your application:"
        echo "  Frontend: http://localhost:3000"
        echo "  Backend API: http://localhost:4000"
        echo "  Nginx Proxy: http://localhost:80"
        echo "  Redis: localhost:6379"
    else
        print_error "Some services failed to start"
        docker-compose logs
    fi
}

# Stop services
stop() {
    print_status "Stopping NodePilot services..."
    docker-compose down
    print_success "Services stopped"
}

# Restart services
restart() {
    print_status "Restarting NodePilot services..."
    docker-compose restart
    print_success "Services restarted"
}

# View logs
logs() {
    if [ -n "$1" ]; then
        print_status "Showing logs for $1..."
        docker-compose logs -f "$1"
    else
        print_status "Showing logs for all services..."
        docker-compose logs -f
    fi
}

# Clean up
clean() {
    print_warning "This will remove all containers, images, and volumes. Are you sure? (y/N)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        print_status "Cleaning up Docker resources..."
        docker-compose down -v --rmi all
        docker system prune -f
        print_success "Cleanup completed"
    else
        print_status "Cleanup cancelled"
    fi
}

# Deploy to production
deploy() {
    print_status "Building and pushing images for production..."
    
    # Build with production tags
    docker build -t qwazi1/nodepilot-frontend:latest .
    docker build -t qwazi1/nodepilot-backend:latest ./backend
    
    # Push to Docker Hub
    docker push qwazi1/nodepilot-frontend:latest
    docker push qwazi1/nodepilot-backend:latest
    
    print_success "Images pushed to Docker Hub"
    print_status "You can now deploy these images to any Docker-compatible platform"
}

# Show help
help() {
    echo "NodePilot Docker Management"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  setup     - Setup environment files"
    echo "  build     - Build Docker images"
    echo "  start     - Start all services"
    echo "  stop      - Stop all services"
    echo "  restart   - Restart all services"
    echo "  logs      - View logs (optional: specify service name)"
    echo "  clean     - Clean up all Docker resources"
    echo "  deploy    - Build and push images for production"
    echo "  help      - Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 start"
    echo "  $0 logs frontend"
    echo "  $0 logs backend"
}

# Main script logic
case "$1" in
    setup)
        check_docker
        setup_env
        ;;
    build)
        check_docker
        setup_env
        build
        ;;
    start)
        check_docker
        setup_env
        start
        ;;
    stop)
        check_docker
        stop
        ;;
    restart)
        check_docker
        restart
        ;;
    logs)
        check_docker
        logs "$2"
        ;;
    clean)
        check_docker
        clean
        ;;
    deploy)
        check_docker
        deploy
        ;;
    help|--help|-h)
        help
        ;;
    *)
        print_error "Unknown command: $1"
        help
        exit 1
        ;;
esac
