#!/bin/zsh
# Test script for WebRTC Study Room

echo "🧪 WebRTC Study Room - Test Checklist"
echo "===================================="
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ .env.local not found"
    exit 1
fi

echo "✅ .env.local exists"

# Check for OpenAI key
if grep -q "OPENAI_API_KEY=sk-" .env.local; then
    echo "✅ OPENAI_API_KEY configured"
else
    echo "⚠️  OPENAI_API_KEY not set (transcription won't work)"
fi

# Check for socket URL
if grep -q "NEXT_PUBLIC_SOCKET_URL=" .env.local; then
    echo "✅ NEXT_PUBLIC_SOCKET_URL configured"
else
    echo "⚠️  NEXT_PUBLIC_SOCKET_URL not configured"
fi

# Check if ports are free
echo ""
echo "Checking ports..."

if lsof -i :3000 >/dev/null 2>&1; then
    echo "⚠️  Port 3000 already in use"
    echo "   Run: kill -9 \$(lsof -t -i:3000)"
else
    echo "✅ Port 3000 is free"
fi

if lsof -i :3001 >/dev/null 2>&1; then
    echo "⚠️  Port 3001 already in use"
    echo "   Run: kill -9 \$(lsof -t -i:3001)"
else
    echo "✅ Port 3001 is free"
fi

echo ""
echo "📋 To start testing:"
echo "   1. Terminal 1: npm run server"
echo "   2. Terminal 2: npm run dev"
echo "   3. Open http://localhost:3000 in two browsers"
echo ""
echo "🔍 Expected behavior:"
echo "   ✓ Both clients see each other's video"
echo "   ✓ No RTCPeerConnection state errors"
echo "   ✓ No 'cannot signal after peer destroyed' errors"
echo "   ✓ Transcription appears (if OPENAI_API_KEY is set)"
echo ""
