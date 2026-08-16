#!/bin/bash
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
WEBSITE_DIR="$(cd "$DIR/.." >/dev/null 2>&1 && pwd)"
INFRA_DIR="$(cd "$WEBSITE_DIR/../infra-proyecto-colombia" >/dev/null 2>&1 && pwd)"

echo "=========================================================="
echo "🇨🇴 Alojamiento Solidario Colombia — LocalStack Dev Runner"
echo "=========================================================="

# 1. Check Docker Daemon
if ! docker info >/dev/null 2>&1; then
  echo "❌ Error: Docker daemon is not running. Please launch Docker Desktop and try again."
  exit 1
fi

# 2. Check / Start LocalStack Container
echo "🐳 Checking LocalStack container..."
if ! docker ps --format '{{.Names}}' | grep -q "^proyecto-colombia-localstack$"; then
  echo "🚀 Starting LocalStack via docker-compose..."
  (cd "$INFRA_DIR" && docker compose up -d || docker-compose up -d)
fi

echo "⏳ Waiting for LocalStack services on http://localhost:4566..."
MAX_RETRIES=30
COUNT=0
until curl -s http://localhost:4566/_localstack/health | grep -q "\"dynamodb\": \"\(running\|available\)\"" || [ $COUNT -eq $MAX_RETRIES ]; do
  sleep 1
  COUNT=$((COUNT+1))
done

if [ $COUNT -eq $MAX_RETRIES ]; then
  echo "⚠️ Warning: LocalStack took longer than expected to report healthy, continuing..."
fi

# 3. Apply Local Terraform Infrastructure
echo "🏗️ Provisioning LocalStack Terraform infrastructure..."
(
  cd "$INFRA_DIR"
  terraform init -backend=false >/dev/null 2>&1 || true
  terraform apply -var-file="environments/local.tfvars" -var="use_localstack=true" -state="terraform.local.tfstate" -auto-approve
)

# 4. Seed LocalStack DynamoDB Table
echo "🌱 Seeding sample Colombian emergency housing listings..."
(
  cd "$INFRA_DIR"
  npm run seed:local
)

# 5. Trap cleanup on exit
cleanup() {
  echo -e "\n🛑 Shutting down Local API Server..."
  if [ -n "$API_PID" ]; then
    kill "$API_PID" 2>/dev/null || true
  fi
  exit 0
}
trap cleanup SIGINT SIGTERM EXIT

# 6. Start Local API Server in Background
echo "⚡ Starting Local Serverless API on port 4000..."
(
  cd "$WEBSITE_DIR"
  node scripts/local-server.mjs
) &
API_PID=$!

# Wait for local API to respond
sleep 1

# 7. Start Next.js Development Server
echo "🚀 Starting Next.js website on http://localhost:3000..."
cd "$WEBSITE_DIR"
export NEXT_PUBLIC_API_URL="http://localhost:4000/api/listings"
export NEXT_PUBLIC_TURNSTILE_SITE_KEY="1x00000000000000000000AA"
npx next dev
