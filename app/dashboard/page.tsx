// app/dashboard/page.tsx
import { auth, signOut } from "@/auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">ダッシュボード</h1>
            <p className="text-gray-600">ようこそ、{session.user.name}さん</p>
          </div>
          <form
            action={async () => {
              "use server";
              await signOut({ redirect: false });
              redirect("/");
            }}
          >
            <button
              type="submit"
              className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
            >
              ログアウト
            </button>
          </form>
        </div>

        {/* メイン機能カード */}
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* グループ管理 */}
          <Link href="/dashboard/groups">
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer h-full">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">👥</span>
                <h2 className="text-xl font-semibold">グループ管理</h2>
              </div>
              <p className="text-gray-600 text-sm">
                グループの作成・編集・削除
              </p>
            </div>
          </Link>
          {/* マイページ */}
          <Link href="/dashboard/profile">
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer h-full">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">🙋‍♂️</span>
                <h2 className="text-xl font-semibold">マイページ</h2>
              </div>
              <p className="text-gray-600 text-sm">
                プロフィールや決済方法の設定ができます
              </p>
            </div>
          </Link>

          {/* 支出記録（Coming Soon） */}
          <div className="bg-gray-100 rounded-lg shadow p-6 opacity-50">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">💰</span>
              <h2 className="text-xl font-semibold">支出記録</h2>
            </div>
            <p className="text-gray-600 text-sm">Coming Soon</p>
          </div>

          {/* 統計分析（Coming Soon） */}
          <div className="bg-gray-100 rounded-lg shadow p-6 opacity-50">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">📊</span>
              <h2 className="text-xl font-semibold">統計分析</h2>
            </div>
            <p className="text-gray-600 text-sm">Coming Soon</p>
          </div>
        </div>
      </div>
    </div>
  );
}
