// app/auth/signin/page.tsx
import { signIn } from "@/auth";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">SettleMate</h1>
          <p className="mt-2 text-gray-600">割り勘・立て替え管理アプリ</p>
        </div>
        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/dashboard" });
          }}
        >
          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 px-4 py-3 text-white hover:bg-blue-700"
          >
            Googleでログイン
          </button>
        </form>
      </div>
    </div>
  );
}
