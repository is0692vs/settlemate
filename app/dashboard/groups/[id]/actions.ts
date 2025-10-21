"use server";

import { auth } from "@/auth";
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

  const response = await fetch(`${process.env.NEXTAUTH_URL}/api/settlements`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "返済記録の作成に失敗しました");
  }

  revalidatePath(`/dashboard/groups/${formData.groupId}`);
  return await response.json();
}

export async function cancelSettlement(settlementId: string, groupId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const response = await fetch(
    `${process.env.NEXTAUTH_URL}/api/settlements/${settlementId}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "返済記録の取消に失敗しました");
  }

  revalidatePath(`/dashboard/groups/${groupId}`);
}
