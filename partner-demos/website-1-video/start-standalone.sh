#!/bin/bash

# ============================================
# Start Partner Website 1 - Standalone Mode
# ============================================

echo "🚀 Starting Partner Website 1 (Video Learning Platform)"
echo "----------------------------------------"

# Load environment variables
export $(cat .env.standalone | xargs)

# Check MongoDB connection
echo "📦 Checking MongoDB connection..."
if mongosh "$MONGODB_URI" --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
    echo "✅ MongoDB connected"
else
    echo "❌ MongoDB connection failed"
    echo "   Please ensure MongoDB is running"
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📥 Installing dependencies..."
    npm install
fi

# Start server
echo "🌐 Starting server on port $PORT..."
npm start
