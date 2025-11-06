#!/bin/bash

# Judge0 Quick Start Script

echo "=========================================="
echo "  Judge0 Local Docker Setup"
echo "=========================================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "   Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    echo "   Visit: https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"
echo ""

# Start Judge0 services
echo "🚀 Starting Judge0 services..."
echo ""

docker-compose up -d

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Judge0 services started successfully!"
    echo ""
    echo "Waiting for services to be ready..."
    sleep 10
    
    # Check if Judge0 is responding
    echo ""
    echo "🔍 Checking Judge0 API..."
    
    if curl -s http://localhost:2358/about > /dev/null 2>&1; then
        echo "✅ Judge0 API is responding!"
        echo ""
        echo "=========================================="
        echo "  Judge0 is ready!"
        echo "=========================================="
        echo ""
        echo "📋 Service Information:"
        echo "   - Judge0 API: http://localhost:2358"
        echo "   - API Documentation: http://localhost:2358/docs"
        echo ""
        echo "🧪 Test Judge0:"
        echo "   curl http://localhost:2358/about"
        echo ""
        echo "📊 View logs:"
        echo "   docker-compose logs -f"
        echo ""
        echo "🛑 Stop services:"
        echo "   docker-compose stop"
        echo ""
        echo "🔄 Restart services:"
        echo "   docker-compose restart"
        echo ""
        echo "✅ You can now use the code execution API!"
        echo ""
    else
        echo "⚠️  Judge0 is starting but not ready yet."
        echo "   Wait a few more seconds and check: curl http://localhost:2358/about"
        echo ""
        echo "   View logs: docker-compose logs -f judge0-server"
    fi
else
    echo ""
    echo "❌ Failed to start Judge0 services."
    echo "   Check the logs: docker-compose logs"
    exit 1
fi
