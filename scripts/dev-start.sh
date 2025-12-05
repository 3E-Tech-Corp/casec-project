#!/bin/bash

# CASEC Development Environment Startup Script
# Starts both backend and frontend development servers

echo "🚀 Starting CASEC Development Environment"
echo "========================================"

# Check if we're in the right directory
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ Error: Must run from casec-monorepo root directory"
    exit 1
fi

# Start backend
echo ""
echo "📦 Starting .NET Backend..."
cd backend/CasecApi
dotnet run &
BACKEND_PID=$!
cd ../..

# Wait for backend to initialize
echo "⏳ Waiting for backend to start..."
sleep 5

# Start frontend
echo ""
echo "⚛️  Starting React Frontend..."
cd frontend/casec-frontend
npm run dev &
FRONTEND_PID=$!
cd ../..

# Display info
echo ""
echo "✅ Development servers started!"
echo "================================"
echo ""
echo "🔧 Backend API:  http://localhost:5000"
echo "🌐 Frontend:     http://localhost:5173"
echo ""
echo "📝 Logs:"
echo "   Backend PID: $BACKEND_PID"
echo "   Frontend PID: $FRONTEND_PID"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

# Handle shutdown
cleanup() {
    echo ""
    echo "🛑 Shutting down servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ Servers stopped"
    exit 0
}

trap cleanup INT TERM

# Keep script running
wait
