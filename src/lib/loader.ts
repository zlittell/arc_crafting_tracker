import yaml from 'js-yaml';
import type { Item } from '../types/item';

const allModules = import.meta.glob('../data/**/*.yaml', { eager: true, query: '?raw', import: 'default' });

export const ITEM_REGISTRY = new Map<string, Item>();

for (const [, raw] of Object.entries(allModules)) {
  const parsed = yaml.load(raw as string) as Record<string, unknown> | null;
  if (!parsed || typeof parsed !== 'object') continue;

  // List format: { category: ..., items: [...] } or legacy { category: ..., materials: [...] }
  const listEntries =
    ('items' in parsed && Array.isArray(parsed.items)) ? parsed.items as Record<string, unknown>[] :
    ('materials' in parsed && Array.isArray(parsed.materials)) ? parsed.materials as Record<string, unknown>[] :
    null;
  if (listEntries) {
    const category = parsed.category;
    for (const entry of listEntries) {
      if (entry?.id) ITEM_REGISTRY.set(entry.id as string, { ...entry, category } as Item);
    }
  // Single item format: { id: ..., category: ..., ... }
  } else if (typeof parsed.id === 'string' && parsed.id) {
    ITEM_REGISTRY.set(parsed.id, parsed as unknown as Item);
  }
}
