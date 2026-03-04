import type { Ingredient } from './material';

export interface Rank {
  rank: number;
  label: string;
  required_skill?: string;
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
  blueprint_required?: boolean;
  ranks: Rank[];
  compatible_mods: string[];
}
