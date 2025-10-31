// app/dashboard/profile/page.tsx
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Mail } from "lucide-react";
import { updateUserSettingsSchema } from "@/lib/validations/user";
import { aggregateBalancesByUser } from "@/lib/utils/cross-group-balance";
import { getDisplayName } from "@/lib/utils/user";
import { AggregatedBalanceList } from "@/components/balance/AggregatedBalanceList";
import PaymentMethodsSettings from "@/components/profile/PaymentMethodsSettings";
import DisplayNameSettings from "@/components/profile/DisplayNameSettings";
import { DEFAULT_PAYMENT_METHOD_VALUES, type PaymentMethodValue } from "@/lib/constants/payment-methods";
import type { Prisma } from "@prisma/client";

const DEFAULT_METHODS: PaymentMethodValue[] = [...DEFAULT_PAYMENT_METHOD_VALUES];

function normalizeAcceptedMethods(value: Prisma.JsonValue | null | undefined): PaymentMethodValue[] {
  if (Array.isArray(value)) {
    const filtered = value.filter((item): item is PaymentMethodValue => typeof item === "string");
    return filtered.length > 0 ? filtered : DEFAULT_METHODS;
  }
  return DEFAULT_METHODS;
}

async function updatePaymentMethods(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user?.id) throw new Error("Authentication required");
  const selectedMethods = formData.getAll("paymentMethods").map(String);
  const validated = updateUserSettingsSchema.parse({ acceptedPaymentMethods: selectedMethods });
  await prisma.user.update({
    where: { id: session.user.id },
    data: { acceptedPaymentMethods: validated.acceptedPaymentMethods },
  });
  revalidatePath("/dashboard/profile");
}

async function updateDisplayName(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user?.id) throw new Error("Authentication required");
  const displayName = formData.get("displayName") as string;
  const validated = updateUserSettingsSchema.parse({ displayName });
  await prisma.user.update({
    where: { id: session.user.id },
    data: { displayName: validated.displayName || null },
  });
  revalidatePath("/dashboard/profile");
}

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, displayName: true, email: true, image: true, acceptedPaymentMethods: true },
  });

  if (!user) redirect("/auth/signin");

  const balances = await prisma.balance.findMany({
    where: { OR: [{ userFrom: session.user.id }, { userTo: session.user.id }] },
    include: {
      fromUser: { select: { id: true, name: true, displayName: true, image: true } },
      toUser: { select: { id: true, name: true, displayName: true, image: true } },
      group: { select: { id: true, name: true, icon: true } },
    },
  });

  const aggregated = aggregateBalancesByUser(balances, session.user.id);
  const acceptedMethods = normalizeAcceptedMethods(user.acceptedPaymentMethods);

  const totalToPay = aggregated.toPay.reduce((acc, p) => acc + p.totalAmount, 0);
  const totalToReceive = aggregated.toReceive.reduce((acc, r) => acc + r.totalAmount, 0);
  const netBalance = totalToReceive - totalToPay;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <h1 className="text-xl font-bold">マイページ</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-4xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>プロフィール情報</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                {user.image && <AvatarImage src={user.image} />}
                <AvatarFallback>{getDisplayName(user).charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{getDisplayName(user)}</h3>
                {user.email && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <Mail className="w-4 h-4" />
                    <span>{user.email}</span>
                  </div>
                )}
              </div>
            </div>
            <DisplayNameSettings currentDisplayName={user.displayName} updateAction={updateDisplayName} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>全グループの残高</CardTitle>
            <CardDescription>すべてのグループの合計金額</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-muted-foreground">支払う合計</p>
                <p className="text-2xl font-bold text-destructive">¥{totalToPay.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">受け取る合計</p>
                <p className="text-2xl font-bold text-green-600">¥{totalToReceive.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">純残高</p>
                <p className={`text-2xl font-bold ${netBalance >= 0 ? "text-green-600" : "text-destructive"}`}>
                  {netBalance >= 0 ? "+" : ""}¥{netBalance.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <AggregatedBalanceList toPay={aggregated.toPay} toReceive={aggregated.toReceive} />

        <PaymentMethodsSettings acceptedMethods={acceptedMethods} updateAction={updatePaymentMethods} />
      </div>
    </div>
  );
}