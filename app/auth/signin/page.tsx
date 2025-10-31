// app/auth/signin/page.tsx
import { signIn } from "@/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Chrome } from "lucide-react";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/20 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-3 text-center pb-8">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-2">
            <span className="text-3xl">💰</span>
          </div>
          <CardTitle className="text-2xl font-bold">SettleMate</CardTitle>
          <CardDescription className="text-base">
            割り勘・立て替え管理アプリ
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: "/dashboard" });
            }}
          >
            <Button className="w-full h-12 text-base" size="lg" type="submit">
              <Chrome className="w-5 h-5 mr-2" />
              Googleでログイン
            </Button>
          </form>
          <p className="text-xs text-center text-muted-foreground px-4">
            ログインすることで、利用規約とプライバシーポリシーに同意したものとみなされます
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
