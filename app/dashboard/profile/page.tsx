// app/dashboard/profile/page.tsx
// @path: app/dashboard/profile/page.tsx

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import ProfileInfo from "@/components/profile/ProfileInfo";
import PaymentMethodsSettings from "@/components/profile/PaymentMethodsSettings";
import { AggregatedBalanceList } from "@/components/balance/AggregatedBalanceList";
import {
  DEFAULT_PAYMENT_METHOD_VALUES,
  type PaymentMethodValue,
} from "@/lib/constants/payment-methods";
import { updateUserSettingsSchema } from "@/lib/validations/user";
import { aggregateBalancesByUser } from "@/lib/utils/cross-group-balance";
import type { Prisma } from "@prisma/client";

const DEFAULT_METHODS: PaymentMethodValue[] = [
  ...DEFAULT_PAYMENT_METHOD_VALUES,
];

function normalizeAcceptedMethods(
  value: Prisma.JsonValue | null | undefined
): PaymentMethodValue[] {
  if (Array.isArray(value)) {
    const filtered = value.filter(
      (item): item is PaymentMethodValue => typeof item === "string"
    );
    return filtered.length > 0 ? filtered : DEFAULT_METHODS;
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        const filtered = parsed.filter(
          (item): item is PaymentMethodValue => typeof item === "string"
        );
        if (filtered.length > 0) {
          return filtered;
        }
      }
    } catch {
      // ignore
    }
  }

  return DEFAULT_METHODS;
}

async function updatePaymentMethods(formData: FormData) {
  "use server";

  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("認証が必要です");
  }

  const selectedMethods = formData
    .getAll("paymentMethods")
    .map((value) => String(value));

  const validated = updateUserSettingsSchema.parse({
    acceptedPaymentMethods: selectedMethods,
  });

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      acceptedPaymentMethods: validated.acceptedPaymentMethods,
    },
  });

  revalidatePath("/dashboard/profile");
}

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      acceptedPaymentMethods: true,
    },
  });

  if (!user) {
    redirect("/auth/signin");
  }

  const acceptedMethods = normalizeAcceptedMethods(user.acceptedPaymentMethods);

  // 全グループの残高を取得
  const balances = await prisma.balance.findMany({
    where: {
      OR: [{ userFrom: session.user.id }, { userTo: session.user.id }],
    },
    include: {
      fromUser: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      toUser: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      group: {
        select: {
          id: true,
          name: true,
          icon: true,
        },
      },
    },
  });

  // Aggregate by user
  const aggregated = aggregateBalancesByUser(balances, session.user.id);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">マイページ</h1>
          <Link
            href="/dashboard/groups"
            className="text-sm text-blue-600 transition hover:text-blue-700"
          >
            ← グループ一覧に戻る
          </Link>
        </div>

        <div className="mb-8">
          <ProfileInfo user={user} />
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            全グループの残高
          </h2>
          <AggregatedBalanceList
            toPay={aggregated.toPay}
            toReceive={aggregated.toReceive}
          />
        </div>

        <PaymentMethodsSettings
          acceptedMethods={acceptedMethods}
          updateAction={updatePaymentMethods}
        />
      </div>
    </div>
  );
}
