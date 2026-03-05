import type { Item } from '../types/item';
import { ALL_ITEMS } from '../data/generated';

export const ITEM_REGISTRY = new Map<string, Item>();
for (const item of ALL_ITEMS) ITEM_REGISTRY.set(item.id, item);
