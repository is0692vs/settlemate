// app/api/settlements/[id]/route.ts
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

interface Params {
  params: Promise<{
    id: string;
  }>;
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const settlement = await prisma.settlement.findUnique({
      where: { id },
    });

    if (!settlement) {
      return NextResponse.json(
        { error: "Settlement not found" },
        { status: 404 }
      );
    }

    if (settlement.paidBy !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden: Only the payer can cancel" },
        { status: 403 }
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.settlement.delete({
        where: { id },
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

    return NextResponse.json({ message: "Settlement cancelled successfully" });
  } catch (error) {
    console.error("Settlement cancellation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
