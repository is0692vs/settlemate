import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import GroupCard from "@/components/groups/GroupCard";

export default async function GroupsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const groups = await prisma.group.findMany({
    where: {
      members: {
        some: {
          userId: session.user.id,
        },
      },
    },
    include: {
      _count: {
        select: { members: true },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const formattedGroups = groups.map((group) => ({
    id: group.id,
    name: group.name,
    icon: group.icon,
    createdAt: group.createdAt.toISOString(),
    memberCount: group._count.members,
  }));

  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">グループ</h1>
          <Link href="/dashboard/groups/new">
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              新規作成
            </button>
          </Link>
        </div>

        {formattedGroups.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">グループがありません</p>
            <Link
              href="/dashboard/groups/new"
              className="text-blue-600 hover:underline"
            >
              最初のグループを作成
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {formattedGroups.map((group) => (
              <GroupCard key={group.id} group={group} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
