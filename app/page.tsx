// app/page.tsx
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-4xl font-bold">SettleMate</h1>
      <p className="mt-4 text-xl text-gray-600">割り勘・立て替え管理アプリ</p>
      <Link
        href="/auth/signin"
        className="mt-8 rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
      >
        ログイン
      </Link>
    </div>
  );
}
