import dagre from "@dagrejs/dagre";
import type { Node, Edge } from "@xyflow/react";

export type Balance = {
  userFrom: string;
  userTo: string;
  amount: number;
  groupId: string;
};

export type User = {
  id: string;
  name: string | null;
  image: string | null;
};

export type UserNodeData = {
  name: string;
  image: string | null;
  isMe: boolean;
};

export type DebtEdgeData = {
  amount: number;
  isMyDebt: boolean;
  isMyCredit: boolean;
};

/**
 * Balance配列をReact Flowのノードとエッジに変換する
 * @param balances 残高データ
 * @param users グループメンバー
 * @param currentUserId 現在のユーザーID
 * @returns { nodes, edges }
 */
export function balancesToGraph(
  balances: Balance[],
  users: User[],
  currentUserId?: string
): { nodes: Node<UserNodeData>[]; edges: Edge<DebtEdgeData>[] } {
  // 1. 全メンバーのノードを作成
  const nodes: Node<UserNodeData>[] = users.map((user) => ({
    id: user.id,
    type: "userNode",
    position: { x: 0, y: 0 }, // Dagreで後から計算
    data: {
      name: user.name ?? "名前未設定",
      image: user.image,
      isMe: user.id === currentUserId,
    },
  }));

  // 2. 残高があるエッジのみ作成
  const edges: Edge<DebtEdgeData>[] = balances
    .filter((balance) => balance.amount > 0)
    .map((balance) => ({
      id: `${balance.userFrom}-${balance.userTo}`,
      source: balance.userFrom, // 債務者（借りてる人）
      target: balance.userTo, // 債権者（貸してる人）
      type: "debtEdge",
      label: `¥${balance.amount.toLocaleString()}`,
      data: {
        amount: balance.amount,
        isMyDebt: balance.userFrom === currentUserId,
        isMyCredit: balance.userTo === currentUserId,
      },
    }));

  // 3. Dagreでレイアウト計算
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: "LR" }); // 左→右レイアウト

  // 4. ノードをDagreに追加
  const nodeWidth = 180;
  const nodeHeight = 80;
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  // 5. エッジをDagreに追加
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  // 6. レイアウト計算
  dagre.layout(dagreGraph);

  // 7. 計算された座標をノードに適用
  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
}
