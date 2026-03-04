export type ItemCategory =
  | 'weapon'
  | 'shield'
  | 'augment'
  | 'ammunition'
  | 'weapon_mod'
  | 'quick_use'
  | 'key'
  | 'crafting_material'
  | 'misc';

export interface Ingredient {
  material_id: string;
  quantity: number;
}

export interface UpgradeLevel {
  level: number;
  label?: string;
  ingredients: Ingredient[];
  perks?: string[];
}

export interface Item {
  id: string;
  name: string;
  category: ItemCategory;
  subcategory?: string;
  ammo_type?: string;
  slot?: string;
  craft_recipe?: { ingredients: Ingredient[] };
  upgrades?: UpgradeLevel[];
}
