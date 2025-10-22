// lib/utils/user.ts

export function getDisplayName(
  user: { name: string | null; displayName?: string | null } | null
): string {
  if (!user) return 'Unknown';
  return user.displayName || user.name || 'Unknown';
}
