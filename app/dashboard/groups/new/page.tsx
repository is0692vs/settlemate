import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { generateInviteCode } from "@/lib/utils/invite-code";
import GroupForm from "@/components/groups/GroupForm";
import type { CreateGroupInput } from "@/lib/validations/group";
import Link from "next/link";
import type { Prisma } from "@prisma/client";

async function createGroupAction(data: CreateGroupInput) {
  "use server";

  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("認証が必要です");
  }

  const userId = session.user.id;

  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    // 一意な招待コードを生成
    let inviteCode = generateInviteCode();
    let isUnique = false;

    while (!isUnique) {
      const existing = await tx.group.findUnique({
        where: { inviteCode },
      });

      if (!existing) {
        isUnique = true;
      } else {
        inviteCode = generateInviteCode();
      }
    }

    const newGroup = await tx.group.create({
      data: {
        name: data.name,
        icon: data.icon || null,
        createdBy: userId,
        inviteCode,
      },
    });

    await tx.groupMember.create({
      data: {
        groupId: newGroup.id,
        userId,
      },
    });
  });

  revalidatePath("/dashboard/groups");
  redirect("/dashboard/groups");
}

export default async function NewGroupPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">新規グループ作成</h1>
          <Link href="/dashboard/groups">
            <button className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
              戻る
            </button>
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <GroupForm onSubmit={createGroupAction} submitLabel="作成" />
        </div>
      </div>
    </div>
  );
}
