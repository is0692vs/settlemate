#!/usr/bin/env tsx
/**
 * Migration runner script
 * 
 * Usage:
 *   pnpm tsx scripts/run-migrations.ts
 * 
 * This script should be run in production environments AFTER deployment
 * to apply pending database migrations.
 */

import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

async function runMigrations() {
  try {
    console.log("🔄 Running Prisma migrations...");
    const { stdout, stderr } = await execAsync("prisma migrate deploy", {
      env: process.env,
    });

    if (stdout) {
      console.log("✅ Migration output:", stdout);
    }
    if (stderr) {
      console.log("⚠️  Migration stderr:", stderr);
    }

    console.log("✅ Migrations completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

runMigrations();
