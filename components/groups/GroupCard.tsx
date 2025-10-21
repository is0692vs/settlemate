// components/groups/GroupCard.tsx
import Link from "next/link";

type Props = {
  group: {
    id: string;
    name: string;
    icon: string | null;
    memberCount?: number;
  };
};

export default function GroupCard({ group }: Props) {
  return (
    <Link href={`/dashboard/groups/${group.id}`}>
      <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer h-full">
        <div className="flex items-center gap-3 mb-4">
          {group.icon && <span className="text-4xl">{group.icon}</span>}
          <h3 className="text-lg font-semibold">{group.name}</h3>
        </div>
        <p className="text-gray-500 text-sm">
          メンバー: {group.memberCount ?? 0}人
        </p>
      </div>
    </Link>
  );
}
