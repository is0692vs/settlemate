import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createGroupSchema } from "@/lib/validations/group";
import { NextResponse } from "next/server";

/**
 * POST /api/groups
 * グループを作成し、作成者を自動的にメンバーとして追加
 */
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = createGroupSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const { name, icon } = result.data;
    const userId = session.user!.id;

    // トランザクションでグループ作成とメンバー追加を実行
    const group = await prisma.$transaction(async (tx) => {
      const createdGroup = await tx.group.create({
        data: {
          name,
          icon: icon || null,
          createdBy: userId,
        },
      });

      // 作成者を自動的にメンバーとして追加
      await tx.groupMember.create({
        data: {
          groupId: createdGroup.id,
          userId: userId,
        },
      });

      return createdGroup;
    });

    return NextResponse.json(
      {
        id: group.id,
        name: group.name,
        icon: group.icon,
        createdAt: group.createdAt,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating group:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/groups
 * 認証済みユーザーが参加しているグループ一覧を取得
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const groups = await prisma.group.findMany({
      where: {
        members: {
          some: {
            userId: session.user.id,
          },
        },
      },
      select: {
        id: true,
        name: true,
        icon: true,
        createdAt: true,
        _count: {
          select: {
            members: true,
          },
        },
      },
    });

    return NextResponse.json(
      groups.map((group) => ({
        id: group.id,
        name: group.name,
        icon: group.icon,
        createdAt: group.createdAt,
        memberCount: group._count.members,
      })),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching groups:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
