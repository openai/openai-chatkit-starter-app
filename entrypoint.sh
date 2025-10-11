#!/bin/sh
set -e

# Load env variables from a mounted .env.local if present
if [ -f "/app/.env.local" ]; then
  export $(grep -E '^[A-Za-z_][A-Za-z0-9_]*=' /app/.env.local | xargs)
  echo "✓ Loaded environment variables from .env.local"
fi

# Validate required environment variables
if [ -z "$OPENAI_API_KEY" ]; then
  echo "ERROR: OPENAI_API_KEY is not set"
  echo "Make sure it's defined in .env.local"
  exit 1
fi

if [ -z "$NEXT_PUBLIC_CHATKIT_WORKFLOW_ID" ]; then
  echo "ERROR: NEXT_PUBLIC_CHATKIT_WORKFLOW_ID is not set"
  echo "Make sure it's defined in .env.local"
  exit 1
fi

echo "✓ All required environment variables are validated"

exec "$@"