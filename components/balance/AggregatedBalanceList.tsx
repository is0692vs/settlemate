// components/balance/AggregatedBalanceList.tsx
"use client";

import type { AggregatedBalance } from "@/lib/utils/cross-group-balance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getDisplayName } from "@/lib/utils/user";

type Props = {
  toPay: AggregatedBalance[];
  toReceive: AggregatedBalance[];
};

export function AggregatedBalanceList({ toPay, toReceive }: Props) {
  if (toPay.length === 0 && toReceive.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">すべてのグループで残高はありません。</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {toPay.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>支払う ({toPay.length}人)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {toPay.map((balance) => (
              <div key={balance.userId} className="space-y-3">
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      {balance.userImage && <AvatarImage src={balance.userImage} alt={getDisplayName(balance)} />}
                      <AvatarFallback>{getDisplayName(balance).charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{getDisplayName(balance)}</p>
                      <p className="text-sm text-muted-foreground">{balance.groupBalances.length}グループ</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-destructive">¥{balance.totalAmount.toLocaleString()}</p>
                    <Badge variant="outline" className="text-xs border-destructive text-destructive">支払う</Badge>
                  </div>
                </div>
                <div className="pl-16 space-y-2">
                  {balance.groupBalances.map((gb) => (
                    <div key={gb.groupId} className="flex items-center gap-2 text-sm">
                      <span className="text-lg">{gb.groupIcon || "👥"}</span>
                      <span className="text-muted-foreground">{gb.groupName}</span>
                      <span className="ml-auto font-medium text-destructive">¥{gb.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {toReceive.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>受け取る ({toReceive.length}人)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {toReceive.map((balance) => (
              <div key={balance.userId} className="space-y-3">
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      {balance.userImage && <AvatarImage src={balance.userImage} alt={getDisplayName(balance)} />}
                      <AvatarFallback>{getDisplayName(balance).charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{getDisplayName(balance)}</p>
                      <p className="text-sm text-muted-foreground">{balance.groupBalances.length}グループ</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">¥{balance.totalAmount.toLocaleString()}</p>
                    <Badge variant="outline" className="text-xs border-green-600 text-green-600">受け取る</Badge>
                  </div>
                </div>
                <div className="pl-16 space-y-2">
                  {balance.groupBalances.map((gb) => (
                    <div key={gb.groupId} className="flex items-center gap-2 text-sm">
                      <span className="text-lg">{gb.groupIcon || "👥"}</span>
                      <span className="text-muted-foreground">{gb.groupName}</span>
                      <span className="ml-auto font-medium text-green-600">¥{gb.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}