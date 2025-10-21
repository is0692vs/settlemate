import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createSettlementSchema } from "@/lib/validations/settlement";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = createSettlementSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation error", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { groupId, userTo, amount, method, description } = result.data;
    const userId = session.user.id;

    const membership = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId,
        },
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "Forbidden: Not a group member" },
        { status: 403 }
      );
    }

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
      return NextResponse.json(
        { error: "残高が存在しません" },
        { status: 404 }
      );
    }

    if (balance.amount < amount) {
      return NextResponse.json(
        { error: `返済金額が残高を超過しています（残高: ¥${balance.amount}）` },
        { status: 400 }
      );
    }

    const settlement = await prisma.$transaction(async (tx) => {
      const newSettlement = await tx.settlement.create({
        data: {
          groupId,
          paidBy: userId,
          paidTo: userTo,
          amount,
          method,
          description: description ?? null,
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

    return NextResponse.json(
      {
        id: settlement.id,
        groupId: settlement.groupId,
        userFrom: settlement.paidBy,
        userTo: settlement.paidTo,
        amount: settlement.amount,
        method: settlement.method,
        description: settlement.description,
        createdAt: settlement.settledAt,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Settlement creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
