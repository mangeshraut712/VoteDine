#!/bin/bash

# VoteDine - Setup Script
# This script installs all dependencies and sets up the project

echo "🚀 Setting up VoteDine..."
echo "=================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 22+ first."
    echo "Visit: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 22 ]; then
    echo "❌ Node.js version $NODE_VERSION is too old. Please upgrade to Node.js 22+"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

echo "✅ Docker version: $(docker --version)"

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker Compose version: $(docker-compose --version)"

# Create environment file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your API keys before running the app"
fi

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install

# Generate Prisma client
echo "🗄️  Generating Prisma client..."
npx prisma generate

cd ..

# Create logs directory
echo "📁 Creating logs directory..."
mkdir -p backend/logs

echo ""
echo "🎉 Setup complete!"
echo "=================="
echo ""
echo "Next steps:"
echo "1. Edit .env file with your API keys (Yelp, Google Maps)"
echo "2. Start the application with: make dev"
echo "3. Or start manually: docker-compose up -d"
echo ""
echo "Available commands:"
echo "- make dev          # Start all services"
echo "- make db-migrate   # Run database migrations"
echo "- make test         # Run all tests"
echo "- make clean        # Clean everything"
echo ""
echo "Access the app:"
echo "- Frontend: http://localhost:3000"
echo "- Backend API: http://localhost:3001"
echo "- API Docs: http://localhost:3001/docs"
echo ""
echo "📚 For more information, see README.md"
