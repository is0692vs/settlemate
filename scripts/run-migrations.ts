#!/usr/bin/env tsx
import { spawnSync } from "node:child_process";

function main() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.info(
      "[migrations] DATABASE_URL is not set. Skipping `prisma migrate deploy`."
    );
    return;
  }

  console.log("[migrations] Running prisma migrate deploy...");
  
  const result = spawnSync("pnpm", ["prisma", "migrate", "deploy"], {
    stdio: "inherit",
    env: process.env,
  });

  if (result.status !== 0) {
    console.error(`[migrations] Migration failed with exit code ${result.status ?? "unknown"}`);
    
    // Don't fail the build, but log the error
    console.warn("[migrations] Continuing build despite migration error. You may need to run migrations manually.");
    return;
  }
  
  console.log("[migrations] Migrations completed successfully!");
}

try {
  main();
} catch (error) {
  console.error("[migrations] Error while running migrations:", error);
  console.warn("[migrations] Continuing build despite migration error.");
}
