import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import DeleteGroupButton from "@/components/groups/DeleteGroupButton";
import { InviteLink } from "@/components/groups/InviteLink";
import { ExpenseList } from "@/components/expenses/ExpenseList";
import BalanceViewer from "@/components/graphs/BalanceViewer";
import { balancesToGraph } from "@/lib/utils/graph";
import type { GroupMember, User } from "@prisma/client";

async function deleteGroupAction(groupId: string) {
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

  await prisma.group.delete({
    where: { id: groupId },
  });

  revalidatePath("/dashboard/groups");
  redirect("/dashboard/groups");
}

export default async function GroupDetailPage({
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
    include: {
      members: {
        include: {
          user: true,
        },
        orderBy: {
          joinedAt: "asc",
        },
      },
      expenses: {
        include: {
          payer: true,
        },
        orderBy: { date: "desc" },
      },
      balances: {
        include: {
          fromUser: { select: { id: true, name: true, image: true } },
          toUser: { select: { id: true, name: true, image: true } },
        },
      },
    },
  });

  if (!group) {
    return (
      <div className="min-h-screen p-8">
        <div className="mx-auto max-w-4xl">
          <p className="text-red-600">グループが見つかりません</p>
          <Link
            href="/dashboard/groups"
            className="mt-4 inline-block text-blue-600 hover:underline"
          >
            グループ一覧に戻る
          </Link>
        </div>
      </div>
    );
  }

  const members = group.members.map(
    (member: GroupMember & { user: User | null }) => ({
      userId: member.userId,
      name: member.user?.name ?? "名前未設定",
      email: member.user?.email ?? "メール未設定",
      joinedAt: member.joinedAt.toISOString(),
    })
  );

  // グラフデータを生成
  const users = group.members
    .map((m: GroupMember & { user: User | null }) => m.user)
    .filter((user): user is User => user !== null);

  const balances = group.balances.map((balance) => ({
    userFrom: balance.userFrom,
    userTo: balance.userTo,
    amount: balance.amount,
    groupId: balance.groupId,
  }));

  const { nodes, edges } = balancesToGraph(balances, users, session.user.id);

  // リスト表示用データ（ユーザー情報を含む）
  const balancesWithUser = group.balances.map((balance) => ({
    userFrom: balance.userFrom,
    userTo: balance.userTo,
    amount: balance.amount,
    fromUser: balance.fromUser,
    toUser: balance.toUser,
  }));

  const deleteAction = deleteGroupAction.bind(null, group.id);

  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {group.icon && <span className="text-5xl">{group.icon}</span>}
            <h1 className="text-3xl font-bold">{group.name}</h1>
          </div>
          <div className="flex gap-2">
            <Link href="/dashboard/groups">
              <button className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
                戻る
              </button>
            </Link>
            <Link href={`/dashboard/groups/${group.id}/expenses/new`}>
              <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                支出を追加
              </button>
            </Link>
            <Link href={`/dashboard/groups/${group.id}/edit`}>
              <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                編集
              </button>
            </Link>
            <DeleteGroupButton onDelete={deleteAction} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <InviteLink inviteCode={group.inviteCode} />
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">残高</h2>
          <BalanceViewer
            nodes={nodes}
            edges={edges}
            balances={balancesWithUser}
            currentUserId={session.user.id}
          />
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">支出履歴</h2>
          <ExpenseList expenses={group.expenses} groupId={group.id} />
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">
            メンバー ({members.length})
          </h2>
          {members.length === 0 ? (
            <p className="text-gray-700">メンバーがいません</p>
          ) : (
            <ul className="space-y-2">
              {members.map(
                (member: {
                  userId: string;
                  name: string;
                  email: string;
                  joinedAt: string;
                }) => (
                  <li
                    key={member.userId}
                    className="flex items-center gap-3 p-3 border-b last:border-b-0"
                  >
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-sm text-gray-700">{member.email}</p>
                    </div>
                  </li>
                )
              )}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
