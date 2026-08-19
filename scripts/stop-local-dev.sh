#!/bin/bash

echo "=========================================================="
echo "🛑 Alojamiento Solidario Colombia — LocalStack Dev Stopper"
echo "=========================================================="

kill_port() {
  local port="$1"
  local label="$2"
  local pids
  pids=$(lsof -ti "tcp:$port" 2>/dev/null || true)
  if [ -n "$pids" ]; then
    echo "🔪 Stopping $label on port $port (pid(s): $pids)..."
    kill $pids 2>/dev/null || true
    sleep 1
    # Force-kill anything still alive.
    pids=$(lsof -ti "tcp:$port" 2>/dev/null || true)
    if [ -n "$pids" ]; then
      kill -9 $pids 2>/dev/null || true
    fi
  else
    echo "✅ Nothing listening on port $port ($label)."
  fi
}

# Next.js dev server
kill_port 3000 "Next.js website"

# Fastify backend (tsx watch spawns a child process, so kill both the tsx
# wrapper and the child it watches over).
kill_port 4000 "Fastify backend API"
pkill -f "tsx watch src/dev/server.ts" 2>/dev/null || true

# LocalStack container
if docker ps --format '{{.Names}}' | grep -q "^proyecto-colombia-localstack$"; then
  echo "🐳 Stopping LocalStack container..."
  docker stop proyecto-colombia-localstack >/dev/null
else
  echo "✅ LocalStack container not running."
fi

echo "✅ Local dev environment stopped."
