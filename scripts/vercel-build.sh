#!/bin/bash
# Vercel build script
# Automatically switches Prisma from SQLite (local) to PostgreSQL (production)

echo "[vercel-build] Switching Prisma datasource to PostgreSQL..."

# Replace sqlite provider with postgresql in schema.prisma
sed -i 's/provider = "sqlite"/provider = "postgresql"/' prisma/schema.prisma

echo "[vercel-build] Generating Prisma client for PostgreSQL..."
npx prisma generate

echo "[vercel-build] Pushing schema to database..."
npx prisma db push --accept-data-loss

echo "[vercel-build] Building Next.js..."
next build
