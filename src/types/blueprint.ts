import type { Ingredient } from './material';

export interface Rank {
  rank: number;
  label: string;
  ingredients: Ingredient[];
  perks?: string[];
}

export interface Blueprint {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  rarity: string;
  ammo_type?: string;
  ranks: Rank[];
  compatible_mods: string[];
}
