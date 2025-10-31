// app/dashboard/groups/page.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, ArrowLeft, Users } from "lucide-react";

import type { Group } from "@prisma/client";

export default async function GroupsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const userId = session.user.id;

  const groups = await prisma.group.findMany({
    where: {
      members: {
        some: {
          userId,
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <h1 className="text-xl font-bold">グループ</h1>
          </div>
          <Button size="sm" asChild>
            <Link href="/dashboard/groups/new">
              <Plus className="w-4 h-4 mr-1" />
              新規作成
            </Link>
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {groups.length === 0 ? (
          <div className="text-center py-20">
            <h2 className="text-xl font-semibold mb-2">グループがありません</h2>
            <p className="text-muted-foreground mb-6">最初のグループを作成して、割り勘を始めましょう。</p>
            <Button asChild>
              <Link href="/dashboard/groups/new">
                <Plus className="w-4 h-4 mr-2" />
                グループを作成
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.map((group) => (
              <Card key={group.id} className="hover:shadow-md transition-shadow cursor-pointer" asChild>
                <Link href={`/dashboard/groups/${group.id}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="text-2xl bg-primary/10">{group.icon || "👥"}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base font-semibold truncate">{group.name}</CardTitle>
                        <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                          <Users className="w-3.5 h-3.5" />
                          <span>メンバー: {group._count.members}人</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}