// app/groups/join/[code]/page.tsx
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function JoinGroupPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const session = await auth();
  const { code } = await params;

  // 未ログインの場合はログインページへ（リダイレクト後にこのページに戻る）
  if (!session?.user?.id) {
    redirect(`/auth/signin?callbackUrl=/groups/join/${code}`);
  }

  // 招待コードからグループを検索
  const group = await prisma.group.findUnique({
    where: { inviteCode: code },
  });

  if (!group) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-md">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          招待リンクが無効です
        </div>
      </div>
    );
  }

  // 既にメンバーか確認
  const existingMember = await prisma.groupMember.findUnique({
    where: {
      groupId_userId: {
        groupId: group.id,
        userId: session.user.id,
      },
    },
  });

  if (existingMember) {
    // 既にメンバーならグループ詳細へ
    redirect(`/dashboard/groups/${group.id}`);
  }

  // メンバー追加
  await prisma.groupMember.create({
    data: {
      groupId: group.id,
      userId: session.user.id,
    },
  });

  // グループ詳細へリダイレクト
  redirect(`/dashboard/groups/${group.id}`);
}
