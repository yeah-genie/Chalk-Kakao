#!/bin/bash

# Maestro Cloud iOS Test Runner
# Usage: ./maestro_cloud.sh <APP_URL_OR_FILE>

APP_PATH=$1

if [ -z "$APP_PATH" ]; then
    echo "Error: Please provide the app path or URL."
    echo "Example: ./maestro_cloud.sh https://expo.dev/artifacts/ios-build.tar.gz"
    exit 1
fi

if [ -z "$MAESTRO_CLOUD_API_KEY" ]; then
    echo "Error: MAESTRO_CLOUD_API_KEY is not set."
    exit 1
fi

echo "--- Uploading to Maestro Cloud ---"
maestro cloud \
  --apiKey "$MAESTRO_CLOUD_API_KEY" \
  --app "$APP_PATH" \
  --flows .maestro/happy_path.yaml \
  --device-os 16 \
  --device-model "iPhone 14"
