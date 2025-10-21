"use client";

import { memo } from "react";
import Image from "next/image";
import { Handle, Position } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import type { UserNodeData } from "@/lib/utils/graph";

function UserNode({ data }: NodeProps) {
  const { name, image, isMe } = data as UserNodeData;

  // イニシャル生成
  const initial = name.charAt(0).toUpperCase();

  return (
    <div
      className={`
        px-4 py-3 rounded-lg border-2 bg-white shadow-md
        w-[180px] h-[80px]
        ${isMe ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-300"}
      `}
    >
      <Handle type="target" position={Position.Left} className="!bg-gray-400" />
      <Handle
        type="source"
        position={Position.Right}
        className="!bg-gray-400"
      />

      <div className="flex items-center gap-3 h-full">
        {/* ユーザーアイコン */}
        <div className="flex-shrink-0">
          {image ? (
            <Image
              src={image}
              alt={name}
              width={40}
              height={40}
              className="rounded-full"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold">
              {initial}
            </div>
          )}
        </div>

        {/* ユーザー名 */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{name}</p>
          {isMe && <p className="text-xs text-blue-600 font-medium">あなた</p>}
        </div>
      </div>
    </div>
  );
}

export default memo(UserNode);
