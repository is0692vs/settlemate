import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

interface Params {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(_request: Request, { params }: Params) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: groupId } = await params;

    const membership = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId: session.user.id,
        },
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "Forbidden: Not a group member" },
        { status: 403 }
      );
    }

    const settlements = await prisma.settlement.findMany({
      where: {
        groupId,
      },
      include: {
        payer: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        settledAt: "desc",
      },
    });

    return NextResponse.json(
      settlements.map((settlement) => ({
        id: settlement.id,
        groupId: settlement.groupId,
        userFrom: settlement.paidBy,
        userTo: settlement.paidTo,
        amount: settlement.amount,
        method: settlement.method,
        description: settlement.description,
        createdAt: settlement.settledAt,
        fromUser: settlement.payer,
        toUser: settlement.receiver,
      }))
    );
  } catch (error) {
    console.error("Settlements fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
