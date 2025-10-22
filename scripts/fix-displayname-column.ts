#!/usr/bin/env tsx
/**
 * Emergency script to add displayName column to production database
 * Run this with: DATABASE_URL="<production-url>" pnpm tsx scripts/fix-displayname-column.ts
 */
import { PrismaClient } from "@prisma/client";

async function main() {
  const prisma = new PrismaClient();

  try {
    console.log("Checking if displayName column exists...");

    // Try to select displayName - if it fails, column doesn't exist
    try {
      await prisma.$queryRaw`SELECT "displayName" FROM "User" LIMIT 1`;
      console.log("✓ displayName column already exists!");
      return;
    } catch (error) {
      console.log("displayName column does not exist. Adding it now...");
    }

    // Add the column
    await prisma.$executeRaw`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "displayName" TEXT`;

    console.log("✓ Successfully added displayName column!");

    // Verify it was added
    const result = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'User' AND column_name = 'displayName'
    `;

    console.log("Verification:", result);
  } catch (error) {
    console.error("Error:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .then(() => {
    console.log("Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Failed:", error);
    process.exit(1);
  });
