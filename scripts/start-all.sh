#!/bin/bash
# =============================================================================
# Dezentrale Suche - Start All Services
# =============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "================================================"
echo "  DEZENTRALE SUCHE - Starting All Services"
echo "================================================"
echo ""

# Start YaCy in background
echo "[1/3] Starting YaCy..."
"$SCRIPT_DIR/start-yacy.sh" &
YACY_PID=$!

# Wait a bit for YaCy to initialize
sleep 2

# Start SearXNG
echo ""
echo "[2/3] Starting SearXNG..."
"$SCRIPT_DIR/start-searxng.sh"

echo ""
echo "[3/3] All services started!"
echo ""
echo "================================================"
echo "  SERVICE OVERVIEW"
echo "================================================"
echo ""
echo "  YaCy Search:      http://localhost:8090"
echo "  SearXNG:          http://localhost:8888"
echo ""
echo "  Algorithm-Free Alternatives:"
echo "  - YouTube:        https://yewtu.be"
echo "  - Twitter:        https://nitter.net"
echo "  - Reddit:         https://libreddit.kavin.rocks"
echo "  - Maps:           https://openstreetmap.org"
echo ""
echo "================================================"
echo "  DEZENTRALE SUCHE - AKTIV!"
echo "================================================"
