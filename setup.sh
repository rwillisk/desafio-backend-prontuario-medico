#!/usr/bin/env bash
set -e

echo "Installing dependencies..."
npm install

echo "Running Prisma migrations..."
npx prisma migrate dev

echo "Creating default user..."
npx ts-node-dev --transpile-only scripts/createUser.ts

echo "Initial setup completed."
