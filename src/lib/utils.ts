export const RARITY_COLORS: Record<string, string> = {
  legendary: 'text-yellow-400',
  epic: 'text-purple-400',
  rare: 'text-blue-400',
  uncommon: 'text-green-400',
  common: 'text-gray-300',
};

export const RARITY_BG_COLORS: Record<string, string> = {
  legendary: 'bg-yellow-900/30 border-yellow-700/50',
  epic: 'bg-purple-900/30 border-purple-700/50',
  rare: 'bg-blue-900/30 border-blue-700/50',
  uncommon: 'bg-green-900/30 border-green-700/50',
  common: 'bg-gray-800/30 border-gray-600/50',
};

export const RARITY_BADGE_COLORS: Record<string, string> = {
  legendary: 'bg-yellow-900 text-yellow-300 border border-yellow-700',
  epic: 'bg-purple-900 text-purple-300 border border-purple-700',
  rare: 'bg-blue-900 text-blue-300 border border-blue-700',
  uncommon: 'bg-green-900 text-green-300 border border-green-700',
  common: 'bg-gray-800 text-gray-300 border border-gray-600',
};

export function rarityColor(rarity: string): string {
  return RARITY_COLORS[rarity] ?? RARITY_COLORS.common;
}

export function rarityBgColor(rarity: string): string {
  return RARITY_BG_COLORS[rarity] ?? RARITY_BG_COLORS.common;
}

export function rarityBadgeColor(rarity: string): string {
  return RARITY_BADGE_COLORS[rarity] ?? RARITY_BADGE_COLORS.common;
}

export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function groupBy<T>(items: T[], key: (item: T) => string): Record<string, T[]> {
  return items.reduce((acc, item) => {
    const k = key(item);
    if (!acc[k]) acc[k] = [];
    acc[k].push(item);
    return acc;
  }, {} as Record<string, T[]>);
}

export const RANK_LABELS: Record<number, string> = {
  1: 'I',
  2: 'II',
  3: 'III',
  4: 'IV',
};
