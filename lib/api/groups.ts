import type {
  CreateGroupInput,
  UpdateGroupInput,
} from "@/lib/validations/group";

export type Group = {
  id: string;
  name: string;
  icon: string | null;
  createdAt: string;
  memberCount?: number;
};

export type GroupDetail = Group & {
  members: Array<{
    userId: string;
    name: string;
    email: string;
    joinedAt: string;
  }>;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Unknown error" }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }
  return response.json();
}

// GET /api/groups - グループ一覧取得
export async function getGroups(): Promise<Group[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/groups`, {
      method: "GET",
      credentials: "include",
    });
    return handleResponse<Group[]>(response);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Network error: ${error.message}`);
    }
    throw new Error("Unknown network error");
  }
}

// GET /api/groups/[id] - グループ詳細取得
export async function getGroup(id: string): Promise<GroupDetail> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/groups/${id}`, {
      method: "GET",
      credentials: "include",
    });
    return handleResponse<GroupDetail>(response);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Network error: ${error.message}`);
    }
    throw new Error("Unknown network error");
  }
}

// POST /api/groups - グループ作成
export async function createGroup(data: CreateGroupInput): Promise<Group> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/groups`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return handleResponse<Group>(response);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Network error: ${error.message}`);
    }
    throw new Error("Unknown network error");
  }
}

// PATCH /api/groups/[id] - グループ更新
export async function updateGroup(
  id: string,
  data: UpdateGroupInput
): Promise<Group> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/groups/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return handleResponse<Group>(response);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Network error: ${error.message}`);
    }
    throw new Error("Unknown network error");
  }
}

// DELETE /api/groups/[id] - グループ削除
export async function deleteGroup(id: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/groups/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ error: "Unknown error" }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Network error: ${error.message}`);
    }
    throw new Error("Unknown network error");
  }
}
