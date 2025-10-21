export type BalanceUpdate = {
  groupId: string;
  userFrom: string;
  userTo: string;
  amount: number;
};

export type Participant = {
  userId: string;
  amount: number;
};

/**
 * 双方向の借金を相殺する
 * AがBに100円、BがAに400円の場合、相殺後は「BがAに300円」のみとなる
 * @param balances 相殺前のBalance配列
 * @returns 相殺後のBalance配列
 */
export function netBalances<
  T extends {
    userFrom: string;
    userTo: string;
    groupId?: string;
    amount: number;
  }
>(balances: T[]): T[] {
  const processed = new Set<string>();
  const result: T[] = [];

  for (const balance of balances) {
    const key = `${balance.userFrom}-${balance.userTo}`;

    // 既に処理済みならスキップ
    if (processed.has(key)) continue;

    // 逆方向のBalanceを検索
    const reverse = balances.find(
      (b) =>
        b.userFrom === balance.userTo &&
        b.userTo === balance.userFrom &&
        (!balance.groupId || !b.groupId || b.groupId === balance.groupId)
    );

    if (reverse) {
      // 双方向の借金が存在する場合、相殺
      const diff = balance.amount - reverse.amount;

      if (diff > 0) {
        // balance側が大きい → balance方向に差額
        result.push({ ...balance, amount: diff });
      } else if (diff < 0) {
        // reverse側が大きい → reverse方向に差額
        result.push({ ...reverse, amount: -diff });
      }
      // diff === 0 なら完全相殺（何も追加しない）

      // 両方向を処理済みとしてマーク
      processed.add(key);
      processed.add(`${reverse.userFrom}-${reverse.userTo}`);
    } else {
      // 一方向のみの借金 → そのまま追加
      result.push(balance);
      processed.add(key);
    }
  }

  return result;
}

// Prismaトランザクション用の型
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TransactionClient = any;

// 均等割りの残高計算
// 端数は最初の債務者から順に+1円ずつ割り振る
export function calculateEqualSplit(
  amount: number,
  paidBy: string,
  participantUserIds: string[]
): BalanceUpdate[] {
  const debtors = participantUserIds.filter((id) => id !== paidBy);
  const debtorCount = debtors.length;

  if (debtorCount === 0) {
    return [];
  }

  const perPerson = Math.floor(amount / (debtorCount + 1)); // 払った人も含めて計算
  const remainder = amount % (debtorCount + 1);

  const balances: BalanceUpdate[] = [];

  debtors.forEach((userId, index) => {
    const debtAmount = perPerson + (index < remainder ? 1 : 0);
    balances.push({
      groupId: "",
      userFrom: userId,
      userTo: paidBy,
      amount: debtAmount,
    });
  });

  return balances;
}

// 手動登録の残高計算（複数債務者対応）
export function calculateManualSplit(
  paidBy: string,
  participants: Participant[]
): BalanceUpdate[] {
  const balances: BalanceUpdate[] = [];

  for (const participant of participants) {
    if (participant.userId !== paidBy) {
      balances.push({
        groupId: "",
        userFrom: participant.userId,
        userTo: paidBy,
        amount: participant.amount,
      });
    }
  }

  return balances;
}

// Balanceテーブル更新（upsert）
export async function updateBalances(
  tx: TransactionClient,
  groupId: string,
  balances: BalanceUpdate[]
) {
  for (const balance of balances) {
    // 既存残高を取得
    const existing = await tx.balance.findUnique({
      where: {
        groupId_userFrom_userTo: {
          groupId,
          userFrom: balance.userFrom,
          userTo: balance.userTo,
        },
      },
    });

    if (existing) {
      // 既存残高に加算
      await tx.balance.update({
        where: { id: existing.id },
        data: {
          amount: existing.amount + balance.amount,
        },
      });
    } else {
      // 新規作成
      await tx.balance.create({
        data: {
          groupId,
          userFrom: balance.userFrom,
          userTo: balance.userTo,
          amount: balance.amount,
        },
      });
    }
  }
}
