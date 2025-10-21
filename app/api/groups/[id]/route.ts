// app/api/groups/[id]/route.ts
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { updateGroupSchema } from "@/lib/validations/group";
import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";

interface Params {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/groups/[id]
 * グループ詳細情報とメンバー一覧を取得
 */
export async function GET(_request: Request, { params }: Params) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // ユーザーがメンバーであることを確認
    const membership = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: id,
          userId: session.user.id,
        },
      },
    });

    if (!membership) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // グループ情報とメンバー一覧を取得
    const group = await prisma.group.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        icon: true,
        createdAt: true,
        members: {
          select: {
            userId: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            joinedAt: true,
          },
        },
      },
    });

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        id: group.id,
        name: group.name,
        icon: group.icon,
        createdAt: group.createdAt,
        members: group.members.map((member) => ({
          userId: member.userId,
          name: member.user.name,
          email: member.user.email,
          joinedAt: member.joinedAt,
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching group:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/groups/[id]
 * グループ情報を更新 / メンバー追加
 */
export async function PATCH(request: Request, { params }: Params) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // グループの存在確認
    const group = await prisma.group.findUnique({
      where: { id },
      select: {
        id: true,
        createdBy: true,
      },
    });

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    // メンバーであることを確認
    const membership = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: id,
          userId: session.user.id,
        },
      },
    });

    if (!membership) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // リクエストボディを取得
    const body = await request.json();

    // グループ情報更新の場合
    const result = updateGroupSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const { name, icon } = result.data;

    // 更新データを構築（変更されたフィールドのみ）
    const updateData: Prisma.GroupUpdateInput = {};
    if (name !== undefined) updateData.name = name;
    if (icon !== undefined) updateData.icon = icon || null;

    const updatedGroup = await prisma.group.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        icon: true,
        createdAt: true,
      },
    });

    return NextResponse.json(updatedGroup, { status: 200 });
  } catch (error) {
    console.error("Error updating group:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/groups/[id]
 * グループを削除（作成者のみ）
 */
export async function DELETE(_request: Request, { params }: Params) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // グループの存在確認
    const group = await prisma.group.findUnique({
      where: { id },
      select: {
        id: true,
        createdBy: true,
      },
    });

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    // 作成者権限の確認
    if (group.createdBy !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // グループを削除（カスケードで関連データも削除）
    await prisma.group.delete({
      where: { id },
    });

    return NextResponse.json(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting group:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
