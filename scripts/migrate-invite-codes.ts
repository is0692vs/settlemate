import { migrateInviteCodes } from "../lib/utils/migrate-invite-codes";

async function main() {
  console.log("Starting invite code migration...");
  await migrateInviteCodes();
  process.exit(0);
}

main().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
