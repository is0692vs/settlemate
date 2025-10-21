// components/graphs/DebtEdge.tsx
"use client";

import { memo } from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type EdgeProps,
} from "@xyflow/react";
import type { DebtEdgeData } from "@/lib/utils/graph";

function DebtEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  if (!data) return null;

  const { amount, isMyDebt, isMyCredit } = data as DebtEdgeData;

  // 色分けルール
  let strokeColor = "#94a3b8"; // グレー（他人間の借金）
  if (isMyDebt) strokeColor = "#ef4444"; // 赤（自分が払う）
  if (isMyCredit) strokeColor = "#22c55e"; // 緑（自分が貰える）

  // 線の太さ（金額に応じて変化）
  const strokeWidth = Math.max(2, amount / 500);

  return (
    <>
      {/* SVG矢印マーカー */}
      <defs>
        <marker
          id={`arrow-${id}`}
          markerWidth="12"
          markerHeight="12"
          viewBox="-10 -10 20 20"
          orient="auto"
          refX="0"
          refY="0"
        >
          <polyline
            stroke={strokeColor}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1"
            fill={strokeColor}
            points="-5,-4 0,0 -5,4 -5,-4"
          />
        </marker>
      </defs>

      {/* エッジ本体 */}
      <BaseEdge
        id={id as string}
        path={edgePath}
        markerEnd={`url(#arrow-${id})`}
        style={{
          stroke: strokeColor,
          strokeWidth,
        }}
      />

      {/* 金額ラベル */}
      <EdgeLabelRenderer>
        <div
          className="nodrag nopan absolute pointer-events-auto"
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
          }}
        >
          <div className="bg-white px-2 py-1 rounded border border-gray-300 text-xs font-medium shadow-sm">
            ¥{amount.toLocaleString()}
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

export default memo(DebtEdge);
