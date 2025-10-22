// lib/utils/cross-group-balance.ts

import { netBalances } from "./balance";
import { getDisplayName } from "./user";

// Type definition for  BalanceWithDetails
export type BalanceWithDetails = {
  id: string;
  groupId: string;
  userFrom: string;
  userTo: string;
  amount: number;
  fromUser: {
    id: string;
    name: string | null;
    displayName?: string | null;
    image: string | null;
  };
  toUser: {
    id: string;
    name: string | null;
    displayName?: string | null;
    image: string | null;
  };
  group: {
    id: string;
    name: string;
    icon: string | null;
  };
};

// Balance per group
export type GroupBalance = {
  groupId: string;
  groupName: string;
  groupIcon: string | null;
  amount: number;
};

// Type of balance aggregated by user
export type AggregatedBalance = {
  userId: string;
  userName: string;
  userImage: string | null;
  totalAmount: number;
  direction: "pay" | "receive"; // pay or receive
  groupBalances: GroupBalance[];
};

/**
 * Aggregate balances across all groups by user
 * @param balances Balance data for all groups (including fromUser/toUser relations)
 * @param currentUserId Current user ID
 * @returns Aggregated balance data (separated by pay/receive)
 */
export function aggregateBalancesByUser(
  balances: BalanceWithDetails[],
  currentUserId: string
): {
  toPay: AggregatedBalance[];
  toReceive: AggregatedBalance[];
} {
  // Group balances by group first
  const balancesByGroup = new Map<string, BalanceWithDetails[]>();
  for (const balance of balances) {
    if (!balancesByGroup.has(balance.groupId)) {
      balancesByGroup.set(balance.groupId, []);
    }
    balancesByGroup.get(balance.groupId)!.push(balance);
  }

  // Apply netting within each group separately
  const nettedBalances: BalanceWithDetails[] = [];
  for (const [, groupBalances] of balancesByGroup) {
    const netted = netBalances(groupBalances);
    nettedBalances.push(...netted);
  }

  // Group by user
  const userMap = new Map<string, AggregatedBalance>();

  for (const balance of nettedBalances) {
    // When the current user pays
    if (balance.userFrom === currentUserId) {
      const userId = balance.userTo;
      if (!userMap.has(userId)) {
        userMap.set(userId, {
          userId,
          userName: getDisplayName(balance.toUser),
          userImage: balance.toUser.image,
          totalAmount: 0,
          direction: "pay",
          groupBalances: [],
        });
      }
      const user = userMap.get(userId)!;
      user.totalAmount += balance.amount;
      user.groupBalances.push({
        groupId: balance.groupId,
        groupName: balance.group.name,
        groupIcon: balance.group.icon,
        amount: balance.amount,
      });
    }
    // When the current user receives
    else if (balance.userTo === currentUserId) {
      const userId = balance.userFrom;
      if (!userMap.has(userId)) {
        userMap.set(userId, {
          userId,
          userName: getDisplayName(balance.fromUser),
          userImage: balance.fromUser.image,
          totalAmount: 0,
          direction: "receive",
          groupBalances: [],
        });
      }
      const user = userMap.get(userId)!;
      user.totalAmount += balance.amount;
      user.groupBalances.push({
        groupId: balance.groupId,
        groupName: balance.group.name,
        groupIcon: balance.group.icon,
        amount: balance.amount,
      });
    }
  }

  // Separate by pay/receive and sort by largest amount
  const toPay: AggregatedBalance[] = [];
  const toReceive: AggregatedBalance[] = [];

  for (const balance of userMap.values()) {
    if (balance.direction === "pay") {
      toPay.push(balance);
    } else {
      toReceive.push(balance);
    }
  }

  // Sort in descending order by amount
  toPay.sort((a, b) => b.totalAmount - a.totalAmount);
  toReceive.sort((a, b) => b.totalAmount - a.totalAmount);

  return { toPay, toReceive };
}
