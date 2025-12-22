#!/bin/bash
# =============================================================================
# Dezentrale Suche - Stop All Services
# =============================================================================

YACY_DIR="${YACY_HOME:-./yacy}"
SEARXNG_CONTAINER="${SEARXNG_CONTAINER:-searxng}"

echo "================================================"
echo "  DEZENTRALE SUCHE - Stopping All Services"
echo "================================================"
echo ""

# Stop YaCy
echo "[1/2] Stopping YaCy..."
if [ -d "$YACY_DIR" ]; then
    cd "$YACY_DIR"
    if [ -f "./stopYACY.sh" ]; then
        ./stopYACY.sh
    elif [ -f "./yacy.sh" ]; then
        ./yacy.sh stop
    fi
fi
echo "  YaCy stopped."

# Stop SearXNG
echo ""
echo "[2/2] Stopping SearXNG..."
if command -v docker &> /dev/null; then
    docker stop "$SEARXNG_CONTAINER" 2>/dev/null
    echo "  SearXNG stopped."
else
    echo "  Docker not available, skipping SearXNG."
fi

echo ""
echo "================================================"
echo "  All services stopped."
echo "================================================"
