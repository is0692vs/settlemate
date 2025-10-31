import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Wallet, Users, TrendingUp, Shield } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="flex flex-col items-center text-center space-y-8 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Wallet className="w-4 h-4" />
            <span>割り勘・立て替え管理アプリ</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-balance">SettleMate</h1>

          <p className="text-lg md:text-xl text-muted-foreground text-pretty max-w-2xl">
            グループでの支払いをスマートに管理。誰がいくら払ったか、誰がいくら受け取るべきか、一目で分かります。
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Button size="lg" className="text-base" asChild>
              <Link href="/auth/signin">ログイン</Link>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mt-20 max-w-5xl mx-auto">
          <div className="flex flex-col items-center text-center p-6 rounded-xl bg-card border shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">グループ管理</h3>
            <p className="text-sm text-muted-foreground">
              複数のグループを作成して、それぞれの支払いを個別に管理できます
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-6 rounded-xl bg-card border shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">自動計算</h3>
            <p className="text-sm text-muted-foreground">誰がいくら払うべきか、複雑な計算を自動で行います</p>
          </div>

          <div className="flex flex-col items-center text-center p-6 rounded-xl bg-card border shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">安全・簡単</h3>
            <p className="text-sm text-muted-foreground">Googleアカウントで簡単ログイン。データは安全に保護されます</p>
          </div>
        </div>
      </div>
    </div>
  );
}