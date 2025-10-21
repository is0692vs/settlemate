import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createExpenseSchema } from "@/lib/validations/expense";
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

    // 参加者が全員グループメンバーか確認
    const members = await prisma.groupMember.findMany({
      where: {
        groupId: validated.groupId,
        userId: { in: validated.participants },
      },
    });

    if (members.length !== validated.participants.length) {
      return NextResponse.json(
        { error: "Invalid participants" },
        { status: 400 }
      );
    }

    // トランザクション処理
    const expense = await prisma.$transaction(async (tx) => {
      // 1. Expense作成
      const newExpense = await tx.expense.create({
        data: {
          groupId: validated.groupId,
          paidBy: validated.paidBy,
          amount: validated.amount,
          description: validated.description,
          participants: validated.participants,
          splitType: validated.splitType,
        },
      });

      // 2. 残高計算
      const balances =
        validated.splitType === "equal"
          ? calculateEqualSplit(
              validated.amount,
              validated.paidBy,
              validated.participants
            )
          : calculateManualSplit(
              validated.amount,
              validated.paidBy,
              validated.participants
            );

      // 3. Balance更新
      await updateBalances(tx, validated.groupId, balances);

      return newExpense;
    });

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
