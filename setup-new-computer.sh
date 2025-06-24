#!/bin/bash

# NodePilot - New Computer Setup Script
# This script automates the setup process for NodePilot on a new computer

set -e  # Exit on any error

echo "🚀 NodePilot - New Computer Setup"
echo "=================================="

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
check_nodejs() {
    print_status "Checking Node.js installation..."
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_success "Node.js found: $NODE_VERSION"
        
        # Check if version is 18 or higher
        MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
        if [ "$MAJOR_VERSION" -ge 18 ]; then
            print_success "Node.js version is compatible (18+)"
        else
            print_error "Node.js version must be 18 or higher. Please update Node.js."
            exit 1
        fi
    else
        print_error "Node.js not found. Please install Node.js 18+ from https://nodejs.org/"
        exit 1
    fi
}

# Check if Git is installed
check_git() {
    print_status "Checking Git installation..."
    if command -v git &> /dev/null; then
        GIT_VERSION=$(git --version)
        print_success "Git found: $GIT_VERSION"
    else
        print_error "Git not found. Please install Git from https://git-scm.com/"
        exit 1
    fi
}

# Install dependencies
install_dependencies() {
    print_status "Installing frontend dependencies..."
    npm install
    print_success "Frontend dependencies installed"
    
    print_status "Installing backend dependencies..."
    cd backend
    npm install
    cd ..
    print_success "Backend dependencies installed"
}

# Create environment file templates
create_env_templates() {
    print_status "Creating environment file templates..."
    
    # Frontend .env.local template
    if [ ! -f ".env.local" ]; then
        cat > .env.local << 'EOF'
# Clerk Configuration
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
CLERK_SECRET_KEY=your_clerk_secret_key_here
CLERK_WEBHOOK_SECRET=your_clerk_webhook_secret_here

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# AI Configuration
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
EOF
        print_success "Created .env.local template"
    else
        print_warning ".env.local already exists, skipping..."
    fi
    
    # Backend .env template
    if [ ! -f "backend/.env" ]; then
        cat > backend/.env << 'EOF'
# Supabase Configuration
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Clerk Configuration
CLERK_SECRET_KEY=your_clerk_secret_key_here
CLERK_WEBHOOK_SECRET=your_clerk_webhook_secret_here

# AI Configuration
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# JWT Configuration (generate a secure secret)
JWT_SECRET=your_secure_jwt_secret_here
JWT_EXPIRES_IN=1d
EOF
        print_success "Created backend/.env template"
    else
        print_warning "backend/.env already exists, skipping..."
    fi
}

# Install optional CLIs
install_optional_clis() {
    print_status "Installing optional CLIs..."
    
    read -p "Install Railway CLI for backend deployment? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        npm install -g @railway/cli
        print_success "Railway CLI installed"
    fi
    
    read -p "Install Vercel CLI for frontend deployment? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        npm install -g vercel
        print_success "Vercel CLI installed"
    fi
}

# Main setup process
main() {
    echo
    print_status "Starting NodePilot setup process..."
    echo
    
    # Check prerequisites
    check_nodejs
    check_git
    
    # Install dependencies
    install_dependencies
    
    # Create environment templates
    create_env_templates
    
    # Install optional CLIs
    install_optional_clis
    
    echo
    print_success "🎉 Setup completed successfully!"
    echo
    print_warning "⚠️  IMPORTANT: Update the environment files with your actual API keys:"
    echo "   - .env.local (frontend)"
    echo "   - backend/.env (backend)"
    echo
    print_status "Next steps:"
    echo "   1. Update environment variables with real values"
    echo "   2. Run 'npm run dev' to start frontend (localhost:8080)"
    echo "   3. Run 'cd backend && npm run dev' to start backend (localhost:4000)"
    echo
    print_status "For detailed setup instructions, see NEW_COMPUTER_SETUP.md"
    echo
}

# Run main function
main
