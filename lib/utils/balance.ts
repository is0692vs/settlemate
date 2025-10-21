export type BalanceUpdate = {
  groupId: string;
  userFrom: string;
  userTo: string;
  amount: number;
};

// Prismaトランザクション用の型
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TransactionClient = any;

// 均等割りの残高計算
// 注意: Math.floor() により端数が切り捨てられます。
// 例: 3000円を3人で割ると999円×3=2997円となり、3円の端数は支払い者が負担します。
export function calculateEqualSplit(
  amount: number,
  paidBy: string,
  participants: string[]
): BalanceUpdate[] {
  const participantCount = participants.length;
  const perPerson = Math.floor(amount / participantCount);

  const balances: BalanceUpdate[] = [];

  // 払った人以外が perPerson ずつ返す
  for (const userId of participants) {
    if (userId !== paidBy) {
      balances.push({
        groupId: "", // 後で設定
        userFrom: userId,
        userTo: paidBy,
        amount: perPerson,
      });
    }
  }

  return balances;
}

// 手動借金登録の残高計算
export function calculateManualSplit(
  amount: number,
  paidBy: string,
  participants: string[]
): BalanceUpdate[] {
  // participants内で paidBy以外が借りた人
  const borrower = participants.find((id) => id !== paidBy);

  if (!borrower) {
    throw new Error("Invalid participants for manual split");
  }

  return [
    {
      groupId: "",
      userFrom: borrower,
      userTo: paidBy,
      amount,
    },
  ];
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
