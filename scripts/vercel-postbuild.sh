#!/bin/bash
# Vercel postbuild hook
# Run after build completes but before restarting the app

echo "📦 Running post-build migration hook..."

# DATABASE_URL が設定されていれば migrations を実行
if [ -n "$DATABASE_URL" ]; then
  echo "🔄 Running Prisma migrations..."
  pnpm prisma migrate deploy
  
  if [ $? -eq 0 ]; then
    echo "✅ Migrations completed successfully!"
  else
    echo "⚠️  Migration warning - this may be normal if all migrations are already applied"
  fi
else
  echo "⏭️  DATABASE_URL not set, skipping migrations"
fi

echo "✅ Post-build hook completed"
