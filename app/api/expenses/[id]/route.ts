import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { updateExpenseSchema } from "@/lib/validations/expense";
import { calculateEqualSplit, calculateManualSplit } from "@/lib/utils/balance";

// GET: 詳細取得
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const expense = await prisma.expense.findUnique({
      where: { id },
      include: {
        payer: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        group: true,
      },
    });

    if (!expense) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // メンバーシップ検証
    const member = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: expense.groupId,
          userId: session.user.id,
        },
      },
    });

    if (!member) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(expense);
  } catch (error) {
    console.error("Error fetching expense:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH: 更新
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const validated = updateExpenseSchema.parse(body);

    const expense = await prisma.expense.findUnique({
      where: { id },
    });

    if (!expense) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // 支払い者のみ更新可能
    if (expense.paidBy !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updated = await prisma.expense.update({
      where: { id },
      data: validated,
    });

    return NextResponse.json(updated);
  } catch (error: unknown) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    console.error("Error updating expense:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE: 削除
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const expense = await prisma.expense.findUnique({
      where: { id },
    });

    if (!expense) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // 支払い者のみ削除可能
    if (expense.paidBy !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // トランザクション処理：Balance逆計算 + Expense削除
    await prisma.$transaction(async (tx) => {
      // participants を Participant[] にキャスト
      const participants = expense.participants as unknown as Array<{
        userId: string;
        amount: number;
      }>;

      // Balance逆計算
      const balances =
        expense.splitType === "equal"
          ? calculateEqualSplit(
              expense.amount,
              expense.paidBy,
              participants.map((p) => p.userId)
            )
          : calculateManualSplit(expense.paidBy, participants);

      for (const balance of balances) {
        const existing = await tx.balance.findUnique({
          where: {
            groupId_userFrom_userTo: {
              groupId: expense.groupId,
              userFrom: balance.userFrom,
              userTo: balance.userTo,
            },
          },
        });

        if (existing) {
          const newAmount = existing.amount - balance.amount;
          if (newAmount <= 0) {
            // 残高が0以下なら削除
            await tx.balance.delete({ where: { id: existing.id } });
          } else {
            // 減算
            await tx.balance.update({
              where: { id: existing.id },
              data: { amount: newAmount },
            });
          }
        }
      }

      // Expense削除
      await tx.expense.delete({ where: { id } });
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting expense:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
