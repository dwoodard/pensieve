#!/bin/bash
# Build script for pensieve
# Handles TypeScript compilation and asset distribution

set -e

echo "Building pensieve..."

# Compile TypeScript
npm run tsc

# Copy templates to dist
mkdir -p dist/templates
cp -r src/templates/* dist/templates/

echo "Build complete ✓"
