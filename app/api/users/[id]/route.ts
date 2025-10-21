// app/api/users/[id]/route.ts
// @path: app/api/users/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { updateUserSettingsSchema } from "@/lib/validations/user";
import type { ZodError } from "zod";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const { id } = await params;

    if (session.user.id !== id) {
      return NextResponse.json({ error: "権限がありません" }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = updateUserSettingsSchema.parse(body);

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        acceptedPaymentMethods: validatedData.acceptedPaymentMethods,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        acceptedPaymentMethods: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    if ((error as ZodError)?.name === "ZodError") {
      return NextResponse.json(
        { error: "入力内容が不正です" },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "設定の更新に失敗しました" },
      { status: 500 }
    );
  }
}
