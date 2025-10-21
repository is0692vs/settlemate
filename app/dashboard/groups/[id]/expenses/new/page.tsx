import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { ExpenseForm } from "@/components/expenses/ExpenseForm";
import { ManualExpenseForm } from "@/components/expenses/ManualExpenseForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

export default async function NewExpensePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const { id } = await params;

  const group = await prisma.group.findUnique({
    where: { id },
    include: {
      members: {
        include: { user: true },
      },
    },
  });

  if (!group) notFound();

  // メンバーシップ検証
  const isMember = group.members.some((m) => m.userId === session.user?.id);
  if (!isMember) {
    return (
      <div className="min-h-screen p-8">
        <div className="mx-auto max-w-2xl">
          <p className="text-red-600">
            このグループへのアクセス権限がありません
          </p>
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

  const members = group.members.map((m) => m.user);

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link
            href={`/dashboard/groups/${group.id}`}
            className="text-blue-600 hover:underline"
          >
            ← 戻る
          </Link>
          <h1 className="text-3xl font-bold">支出を追加 - {group.name}</h1>
        </div>

        <Tabs defaultValue="equal" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="equal">均等割り</TabsTrigger>
            <TabsTrigger value="manual">手動登録</TabsTrigger>
          </TabsList>

          <TabsContent value="equal">
            <ExpenseForm groupId={group.id} members={members} />
          </TabsContent>

          <TabsContent value="manual">
            <ManualExpenseForm groupId={group.id} members={members} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
