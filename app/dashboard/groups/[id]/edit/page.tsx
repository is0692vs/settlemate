import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import GroupForm from "@/components/groups/GroupForm";
import type { CreateGroupInput } from "@/lib/validations/group";
import Link from "next/link";
import { AddMemberForm } from "@/components/groups/AddMemberForm";

async function updateGroupAction(groupId: string, data: CreateGroupInput) {
  "use server";

  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("認証が必要です");
  }

  const userId = session.user.id;

  const membership = await prisma.groupMember.findUnique({
    where: {
      groupId_userId: {
        groupId,
        userId,
      },
    },
    select: { id: true },
  });

  if (!membership) {
    throw new Error("グループへのアクセス権限がありません");
  }

  await prisma.group.update({
    where: { id: groupId },
    data: {
      name: data.name,
      icon: data.icon || null,
    },
  });

  revalidatePath(`/dashboard/groups/${groupId}`);
  revalidatePath("/dashboard/groups");
  redirect(`/dashboard/groups/${groupId}`);
}

export default async function EditGroupPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const { id } = await Promise.resolve(params);

  const group = await prisma.group.findFirst({
    where: {
      id,
      members: {
        some: {
          userId: session.user.id,
        },
      },
    },
    select: {
      id: true,
      name: true,
      icon: true,
    },
  });

  if (!group) {
    return (
      <div className="min-h-screen p-8">
        <div className="mx-auto max-w-md">
          <p className="text-red-600">グループが見つかりません</p>
        </div>
      </div>
    );
  }

  const updateAction = updateGroupAction.bind(null, group.id);

  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto max-w-md space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">グループ編集</h1>
          <Link href={`/dashboard/groups/${group.id}`}>
            <button className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
              戻る
            </button>
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">グループ情報</h2>
          <GroupForm
            defaultValues={{
              name: group.name,
              icon: group.icon ?? "",
            }}
            onSubmit={updateAction}
            submitLabel="更新"
          />
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">メンバー管理</h2>
          <AddMemberForm groupId={group.id} />
        </div>
      </div>
    </div>
  );
}
