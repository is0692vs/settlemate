# SettleMate Database Migration Guide

## Overview

Database migrations for SettleMate are managed using Prisma. This document outlines the migration process for different environments.

## Development Environment

Migrations are automatically applied when running the development server:

```bash
pnpm dev
```

The `@prisma/client` will sync with the schema automatically in development mode.

## Production Environment (Vercel)

### Initial Deployment

1. **First Deployment**: The initial schema is created as part of the build process
2. **Subsequent Deployments**: Use the post-build migration hook

### Running Migrations After Deployment

The build pipeline automatically executes a safe migration helper script. If `DATABASE_URL` is defined, it runs `prisma migrate deploy`. When the variable is missing (such as in CI preview builds), the script skips the step and the build continues.

After deploying to Vercel, run migrations using:

```bash
pnpm tsx scripts/run-migrations.ts
```

Or manually using Prisma CLI:

```bash
DATABASE_URL="your_database_url" pnpm prisma migrate deploy
```

### Vercel Environment Variables

Ensure `DATABASE_URL` is set in Vercel project settings:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add `DATABASE_URL` with your PostgreSQL connection string
3. Mark it as available for Production, Preview, and Development

### Migration Script

A Node.js script is available for running migrations:

**Location**: `scripts/run-migrations.ts`

**Usage**:

```bash
# Ensure DATABASE_URL is set
export DATABASE_URL="postgresql://..."

# Run migrations
pnpm tsx scripts/run-migrations.ts
```

## Create a New Migration

When modifying the Prisma schema:

1. Update `prisma/schema.prisma`
2. Create migration file:
   ```bash
   pnpm prisma migrate dev --name <migration_name>
   ```
3. Review generated SQL in `prisma/migrations/<timestamp>_<name>/migration.sql`
4. Commit the migration files
5. Follow the production deployment process

## Rollback (Emergency Only)

To rollback to a previous migration state:

```bash
pnpm prisma migrate resolve --rolled-back <migration_name>
```

## Migration Files

Migrations are stored in `prisma/migrations/` directory:

- Each migration has a timestamp prefix
- SQL file contains the actual database changes
- `migration_lock.toml` tracks migration state

## Troubleshooting

### "Column X does not exist" Error

This typically means migrations haven't been applied to the current database:

```bash
DATABASE_URL="your_connection_string" pnpm prisma migrate deploy
```

### Connection Issues

Verify your `DATABASE_URL`:

- Format: `postgresql://user:password@host:port/database`
- Ensure database server is running
- Check firewall rules if remote connection

### Prisma Client Out of Sync

Regenerate Prisma Client:

```bash
pnpm prisma generate
```

## References

- [Prisma Migrations Documentation](https://www.prisma.io/docs/orm/prisma-migrate/understanding-prisma-migrate)
- [Vercel PostgreSQL Setup](https://vercel.com/docs/storage/vercel-postgres)
