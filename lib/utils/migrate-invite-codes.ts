// lib/utils/migrate-invite-codes.ts
import { prisma } from "@/lib/prisma";
import { generateInviteCode } from "./invite-code";

export async function migrateInviteCodes() {
  const groupsWithoutCode = await prisma.group.findMany({
    where: { inviteCode: null },
    select: { id: true },
  });

  console.log(`Found ${groupsWithoutCode.length} groups without invite codes`);

  for (const group of groupsWithoutCode) {
    let inviteCode = generateInviteCode();
    let isUnique = false;

    while (!isUnique) {
      const existing = await prisma.group.findUnique({
        where: { inviteCode },
      });

      if (!existing) {
        isUnique = true;
      } else {
        inviteCode = generateInviteCode();
      }
    }

    await prisma.group.update({
      where: { id: group.id },
      data: { inviteCode },
    });

    console.log(`Assigned invite code ${inviteCode} to group ${group.id}`);
  }

  console.log("Migration complete");
}
