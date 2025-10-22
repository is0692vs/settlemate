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

  const result = spawnSync("pnpm", ["prisma", "migrate", "deploy"], {
    stdio: "inherit",
    env: process.env,
  });

  if (result.status !== 0) {
    throw new Error(
      `Failed to run migrations (exit code ${result.status ?? "unknown"}).`
    );
  }
}

try {
  main();
} catch (error) {
  console.error("[migrations] Error while running migrations:", error);
  process.exit(1);
}
