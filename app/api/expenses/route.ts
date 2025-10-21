import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createExpenseSchema } from "@/lib/validations/expense";
import type { Prisma } from "@prisma/client";
import {
  calculateEqualSplit,
  calculateManualSplit,
  updateBalances,
} from "@/lib/utils/balance";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validated = createExpenseSchema.parse(body);

    // メンバーシップ検証
    const member = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: validated.groupId,
          userId: session.user.id,
        },
      },
    });

    if (!member) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 参加者（債務者）が全員グループメンバーか確認
    const participantIds = validated.participants.map((p) => p.userId);
    const members = await prisma.groupMember.findMany({
      where: {
        groupId: validated.groupId,
        userId: { in: [...participantIds, validated.paidBy] },
      },
    });

    if (members.length !== participantIds.length + 1) {
      return NextResponse.json(
        { error: "Invalid participants" },
        { status: 400 }
      );
    }

    // トランザクション処理
    const expense = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        // 1. Expense作成
        const newExpense = await tx.expense.create({
          data: {
            groupId: validated.groupId,
            paidBy: validated.paidBy,
            amount: validated.amount,
            description: validated.description,
            participants: validated.participants, // 金額付き配列を保存
            splitType: validated.splitType,
          },
        });

        // 2. 残高計算
        const balances =
          validated.splitType === "equal"
            ? calculateEqualSplit(
                validated.amount,
                validated.paidBy,
                participantIds
              )
            : calculateManualSplit(validated.paidBy, validated.participants);

        // 3. Balance更新
        await updateBalances(tx, validated.groupId, balances);

        return newExpense;
      }
    );

    return NextResponse.json(expense, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    console.error("Error creating expense:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
