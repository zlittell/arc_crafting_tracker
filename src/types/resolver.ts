export interface LoadoutSelection {
  blueprint_id: string;
  target_rank: number;
  selected_mod_ids: string[];
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
  craft_recipe_available: boolean;
  sources: MaterialSource[];
}

export interface ShoppingList {
  materials: ResolvedMaterial[];
}
