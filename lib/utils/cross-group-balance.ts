// lib/utils/cross-group-balance.ts

import { netBalances } from './balance';

// BalanceWithDetailsの型定義
export type BalanceWithDetails = {
  id: string;
  groupId: string;
  userFrom: string;
  userTo: string;
  amount: number;
  fromUser: {
    id: string;
    name: string | null;
    image: string | null;
  };
  toUser: {
    id: string;
    name: string | null;
    image: string | null;
  };
  group: {
    id: string;
    name: string;
    icon: string | null;
  };
};

// グループごとの残高
export type GroupBalance = {
  groupId: string;
  groupName: string;
  groupIcon: string | null;
  amount: number;
};

// ユーザーごとに集計された残高の型
export type AggregatedBalance = {
  userId: string;
  userName: string;
  userImage: string | null;
  totalAmount: number;
  direction: 'pay' | 'receive'; // 払う or 貰う
  groupBalances: GroupBalance[];
};

/**
 * 全グループの残高をユーザーごとに集計
 * @param balances 全グループの残高データ（fromUser/toUserリレーション含む）
 * @param currentUserId 現在のユーザーID
 * @returns 集計された残高データ（払う/貰う別）
 */
export function aggregateBalancesByUser(
  balances: BalanceWithDetails[],
  currentUserId: string
): {
  toPay: AggregatedBalance[];
  toReceive: AggregatedBalance[];
} {
  // まず相殺処理を適用
  const netted = netBalances(balances);

  // ユーザーごとにグループ化
  const userMap = new Map<string, AggregatedBalance>();

  for (const balance of netted) {
    // 自分が払う場合
    if (balance.userFrom === currentUserId) {
      const userId = balance.userTo;
      if (!userMap.has(userId)) {
        userMap.set(userId, {
          userId,
          userName: balance.toUser.name || 'Unknown',
          userImage: balance.toUser.image,
          totalAmount: 0,
          direction: 'pay',
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
    // 自分が貰う場合
    else if (balance.userTo === currentUserId) {
      const userId = balance.userFrom;
      if (!userMap.has(userId)) {
        userMap.set(userId, {
          userId,
          userName: balance.fromUser.name || 'Unknown',
          userImage: balance.fromUser.image,
          totalAmount: 0,
          direction: 'receive',
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

  // 払う/貰うで分離し、金額の大きい順にソート
  const toPay: AggregatedBalance[] = [];
  const toReceive: AggregatedBalance[] = [];

  for (const balance of userMap.values()) {
    if (balance.direction === 'pay') {
      toPay.push(balance);
    } else {
      toReceive.push(balance);
    }
  }

  // 金額の降順でソート
  toPay.sort((a, b) => b.totalAmount - a.totalAmount);
  toReceive.sort((a, b) => b.totalAmount - a.totalAmount);

  return { toPay, toReceive };
}
