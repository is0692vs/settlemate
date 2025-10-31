// app/dashboard/page.tsx
import { auth, signOut } from "@/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, User, BarChart3, Wallet, LogOut } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">ダッシュボード</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              ようこそ、{session.user.name}さん
            </span>
            <form
              action={async () => {
                "use server";
                await signOut({ redirect: false });
                redirect("/");
              }}
            >
              <Button variant="ghost" size="icon" type="submit">
                <LogOut className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <Link href="/dashboard/groups">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-medium">
                    グループ管理
                  </CardTitle>
                  <Users className="w-5 h-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>グループの作成・編集・削除</CardDescription>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <Link href="/dashboard/profile">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-medium">
                    マイページ
                  </CardTitle>
                  <User className="w-5 h-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  プロフィールや決済方法の設定
                </CardDescription>
              </CardContent>
            </Link>
          </Card>

          <Card className="opacity-60 cursor-not-allowed">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-medium">
                  支払い履歴
                </CardTitle>
                <Wallet className="w-5 h-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>Coming Soon</CardDescription>
            </CardContent>
          </Card>

          <Card className="opacity-60 cursor-not-allowed">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-medium">統計</CardTitle>
                <BarChart3 className="w-5 h-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>Coming Soon</CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}