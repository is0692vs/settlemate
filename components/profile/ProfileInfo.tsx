// components/profile/ProfileInfo.tsx
// @path: components/profile/ProfileInfo.tsx

import Image from "next/image";

type UserSummary = {
  name: string | null;
  email: string | null;
  image: string | null;
};

export default function ProfileInfo({ user }: { user: UserSummary }) {
  const displayName = user.name ?? "名前未設定";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">
        プロフィール情報
      </h2>
      <div className="flex items-center space-x-4">
        {user.image ? (
          <Image
            src={user.image}
            alt={displayName}
            width={80}
            height={80}
            className="rounded-full object-cover"
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-500 text-2xl font-bold text-white">
            {initial || "U"}
          </div>
        )}
        <div>
          <p className="text-xl font-semibold text-gray-900">{displayName}</p>
          <p className="text-sm text-gray-600">
            {user.email ?? "メール未設定"}
          </p>
        </div>
      </div>
    </div>
  );
}
