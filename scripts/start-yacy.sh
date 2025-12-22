#!/bin/bash
# =============================================================================
# YaCy P2P Search Engine Starter Script
# =============================================================================

YACY_DIR="${YACY_HOME:-./yacy}"
YACY_PORT="${YACY_PORT:-8090}"

echo "================================================"
echo "  YaCy P2P Search Engine - Beast Mode Edition"
echo "================================================"
echo ""

# Check if YaCy directory exists
if [ ! -d "$YACY_DIR" ]; then
    echo "ERROR: YaCy directory not found at: $YACY_DIR"
    echo ""
    echo "Please set YACY_HOME environment variable or install YaCy:"
    echo "  1. Download from: https://yacy.net/download_installation/"
    echo "  2. Extract to: $YACY_DIR"
    echo "  3. Run this script again"
    exit 1
fi

# Check for Java
if ! command -v java &> /dev/null; then
    echo "ERROR: Java not found. Please install Java 11 or higher."
    exit 1
fi

echo "Starting YaCy on port $YACY_PORT..."
echo ""

cd "$YACY_DIR"

# Start YaCy
if [ -f "./startYACY.sh" ]; then
    ./startYACY.sh
elif [ -f "./yacy.sh" ]; then
    ./yacy.sh start
else
    echo "ERROR: YaCy start script not found."
    exit 1
fi

echo ""
echo "YaCy is starting..."
echo ""
echo "Access URLs:"
echo "  Search:     http://localhost:$YACY_PORT/yacysearch.html"
echo "  Status:     http://localhost:$YACY_PORT/Status.html"
echo "  Crawler:    http://localhost:$YACY_PORT/CrawlStartExpert.html"
echo "  Settings:   http://localhost:$YACY_PORT/ConfigBasic.html"
echo ""
echo "================================================"
