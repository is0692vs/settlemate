// components/expenses/ExpenseList.tsx
import type { Expense, User } from "@prisma/client";
import { ExpenseCard } from "./ExpenseCard";

type ExpenseWithPayer = Expense & {
  payer: User;
};

interface ExpenseListProps {
  expenses: ExpenseWithPayer[];
  groupId: string;
  members: User[];
  currentUserId: string;
}

export function ExpenseList({
  expenses,
  groupId,
  members,
  currentUserId,
}: ExpenseListProps) {
  if (expenses.length === 0) {
    return <p className="text-gray-500">まだ支出が記録されていません</p>;
  }

  return (
    <div className="space-y-4">
      {expenses.map((expense) => (
        <ExpenseCard
          key={expense.id}
          expense={expense}
          groupId={groupId}
          members={members}
          currentUserId={currentUserId}
        />
      ))}
    </div>
  );
}
