"use client";

import Image from "next/image";

export type BalanceWithUser = {
  userFrom: string;
  userTo: string;
  amount: number;
  fromUser: {
    id: string;
    name: string | null;
    image: string | null;
  } | null;
  toUser: {
    id: string;
    name: string | null;
    image: string | null;
  } | null;
};

interface BalanceListProps {
  balances: BalanceWithUser[];
  currentUserId: string;
}

export default function BalanceList({
  balances,
  currentUserId,
}: BalanceListProps) {
  // 払う必要がある残高
  const toPay = balances.filter(
    (balance) => balance.userFrom === currentUserId && balance.amount > 0
  );

  // 貰える残高
  const toReceive = balances.filter(
    (balance) => balance.userTo === currentUserId && balance.amount > 0
  );

  // 合計計算
  const totalToPay = toPay.reduce((sum, balance) => sum + balance.amount, 0);
  const totalToReceive = toReceive.reduce(
    (sum, balance) => sum + balance.amount,
    0
  );
  const difference = totalToPay - totalToReceive;

  // 空データ対応
  if (toPay.length === 0 && toReceive.length === 0) {
    return (
      <div className="h-[400px] md:h-[600px] flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <p className="text-gray-500">残高がありません</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">あなたの残高</h3>

      {/* 払う必要があるセクション */}
      {toPay.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-red-700">払う必要がある</h4>
          <div className="space-y-2">
            {toPay.map((balance) => {
              const user = balance.toUser;
              const userName = user?.name ?? "名前未設定";
              const userImage = user?.image;
              const initial = userName ? userName.charAt(0).toUpperCase() : "?";

              return (
                <div
                  key={`pay-${balance.userTo}`}
                  className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200"
                >
                  <div className="flex items-center gap-3">
                    {/* ユーザーアイコン */}
                    {userImage ? (
                      <Image
                        src={userImage}
                        alt={userName}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-red-200 flex items-center justify-center text-red-700 font-semibold">
                        {initial}
                      </div>
                    )}
                    <span className="font-medium text-gray-900">
                      {userName}に
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-red-600">
                      ¥{balance.amount.toLocaleString()}
                    </span>
                    <span className="text-red-600">→</span>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="text-right">
            <span className="text-sm text-gray-600">小計: </span>
            <span className="text-lg font-bold text-red-600">
              ¥{totalToPay.toLocaleString()}
            </span>
          </div>
        </div>
      )}

      {/* 貰えるセクション */}
      {toReceive.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-green-700">貰える</h4>
          <div className="space-y-2">
            {toReceive.map((balance) => {
              const user = balance.fromUser;
              const userName = user?.name ?? "名前未設定";
              const userImage = user?.image;
              const initial = userName ? userName.charAt(0).toUpperCase() : "?";

              return (
                <div
                  key={`receive-${balance.userFrom}`}
                  className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200"
                >
                  <div className="flex items-center gap-3">
                    {/* ユーザーアイコン */}
                    {userImage ? (
                      <Image
                        src={userImage}
                        alt={userName}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-green-200 flex items-center justify-center text-green-700 font-semibold">
                        {initial}
                      </div>
                    )}
                    <span className="font-medium text-gray-900">
                      {userName}から
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-600">←</span>
                    <span className="text-lg font-bold text-green-600">
                      ¥{balance.amount.toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="text-right">
            <span className="text-sm text-gray-600">小計: </span>
            <span className="text-lg font-bold text-green-600">
              ¥{totalToReceive.toLocaleString()}
            </span>
          </div>
        </div>
      )}

      {/* 差額表示 */}
      <div className="pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-base font-medium text-gray-700">差額</span>
          <div className="text-right">
            <span
              className={`text-xl font-bold ${
                difference > 0
                  ? "text-red-600"
                  : difference < 0
                  ? "text-green-600"
                  : "text-gray-600"
              }`}
            >
              {difference > 0 ? "-" : difference < 0 ? "+" : ""}¥
              {Math.abs(difference).toLocaleString()}
            </span>
            {difference !== 0 && (
              <p className="text-xs text-gray-500 mt-1">
                {difference > 0 ? "払う方が多い" : "貰う方が多い"}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
