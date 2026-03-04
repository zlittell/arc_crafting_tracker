export interface LoadoutSelection {
  blueprint_id: string;
  target_rank: number;
  quantity: number;
}

export type ResolutionMode = 'craftable' | 'raw';

export interface MaterialSource {
  blueprint_name: string;
  context: string;
  quantity: number;
}

export interface ResolvedMaterial {
  material_id: string;
  name: string;
  rarity: string;
  category: string;
  quantity: number;
  per_craft_quantity: number;
  craft_recipe_available: boolean;
  sources: MaterialSource[];
}

export interface ShoppingList {
  materials: ResolvedMaterial[];
}
