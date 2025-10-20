import { auth, signOut } from "@/auth";
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
              await signOut({ redirectTo: "/" });
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
        <div className="mt-8">
          <p>認証が成功しました！🎉</p>
        </div>
      </div>
    </div>
  );
}
