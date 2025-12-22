#!/bin/bash
# =============================================================================
# SearXNG Meta Search Engine Starter Script (Docker)
# =============================================================================

SEARXNG_PORT="${SEARXNG_PORT:-8888}"
CONTAINER_NAME="${SEARXNG_CONTAINER:-searxng}"

echo "================================================"
echo "  SearXNG Meta Search Engine"
echo "================================================"
echo ""

# Check if Docker is available
if ! command -v docker &> /dev/null; then
    echo "ERROR: Docker not found. Please install Docker first."
    echo "  Installation: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if container exists
if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    # Container exists, try to start it
    echo "Starting existing SearXNG container..."
    docker start "$CONTAINER_NAME"
else
    # Container doesn't exist, create and run it
    echo "Creating new SearXNG container..."
    docker run -d \
        --name "$CONTAINER_NAME" \
        -p "$SEARXNG_PORT:8080" \
        --restart unless-stopped \
        searxng/searxng
fi

echo ""
echo "SearXNG is starting..."
echo ""
echo "Access URL: http://localhost:$SEARXNG_PORT"
echo ""
echo "================================================"
