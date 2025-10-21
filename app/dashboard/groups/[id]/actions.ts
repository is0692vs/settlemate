"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createSettlementSchema } from "@/lib/validations/settlement";
import { revalidatePath } from "next/cache";

export async function createSettlement(formData: {
  groupId: string;
  userTo: string;
  amount: number;
  method: string;
  description?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const result = createSettlementSchema.safeParse(formData);
  if (!result.success) {
    const errorMessages = result.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join(", ");
    throw new Error(`バリデーションエラー: ${errorMessages}`);
  }

  const { groupId, userTo, amount, method, description } = result.data;
  const userId = session.user.id;

  // グループメンバーシップチェック
  const membership = await prisma.groupMember.findUnique({
    where: {
      groupId_userId: {
        groupId,
        userId,
      },
    },
  });

  if (!membership) {
    throw new Error("Forbidden: Not a group member");
  }

  // Balance検索
  const balance = await prisma.balance.findUnique({
    where: {
      groupId_userFrom_userTo: {
        groupId,
        userFrom: userId,
        userTo,
      },
    },
  });

  if (!balance) {
    throw new Error("残高が存在しません");
  }

  // 残高チェック
  if (balance.amount < amount) {
    throw new Error(
      `返済金額が残高を超過しています（残高: ¥${balance.amount}）`
    );
  }

  // トランザクション処理
  const settlement = await prisma.$transaction(async (tx) => {
    const newSettlement = await tx.settlement.create({
      data: {
        groupId,
        paidBy: userId,
        paidTo: userTo,
        amount,
        method,
        ...(description && { description }),
      },
    });

    const newAmount = balance.amount - amount;

    if (newAmount === 0) {
      await tx.balance.delete({
        where: {
          groupId_userFrom_userTo: {
            groupId,
            userFrom: userId,
            userTo,
          },
        },
      });
    } else {
      await tx.balance.update({
        where: {
          groupId_userFrom_userTo: {
            groupId,
            userFrom: userId,
            userTo,
          },
        },
        data: {
          amount: newAmount,
        },
      });
    }

    return newSettlement;
  });

  revalidatePath(`/dashboard/groups/${formData.groupId}`);
  return settlement;
}

export async function cancelSettlement(settlementId: string, groupId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Settlement検索
  const settlement = await prisma.settlement.findUnique({
    where: { id: settlementId },
  });

  if (!settlement) {
    throw new Error("Settlement not found");
  }

  // 権限チェック
  if (settlement.paidBy !== session.user.id) {
    throw new Error("Forbidden: Only the payer can cancel");
  }

  // トランザクション処理
  await prisma.$transaction(async (tx) => {
    await tx.settlement.delete({
      where: { id: settlementId },
    });

    await tx.balance.upsert({
      where: {
        groupId_userFrom_userTo: {
          groupId: settlement.groupId,
          userFrom: settlement.paidBy,
          userTo: settlement.paidTo,
        },
      },
      update: {
        amount: {
          increment: settlement.amount,
        },
      },
      create: {
        groupId: settlement.groupId,
        userFrom: settlement.paidBy,
        userTo: settlement.paidTo,
        amount: settlement.amount,
      },
    });
  });

  revalidatePath(`/dashboard/groups/${groupId}`);
}
