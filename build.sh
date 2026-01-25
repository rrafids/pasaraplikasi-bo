#!/usr/bin/env bash
set -e

# Stop and remove existing container (ignore if missing, e.g. first deploy)
docker stop tukuaplikasi-bo 2>/dev/null || true
docker rm tukuaplikasi-bo 2>/dev/null || true

# Remove existing image so we get a clean build (ignore if missing)
docker rmi tukuaplikasi-bo:latest 2>/dev/null || true

docker build -t tukuaplikasi-bo:latest .
docker run --name tukuaplikasi-bo --env-file .env -d -p 3002:3002 tukuaplikasi-bo:latest

