export interface LoadoutSelection {
  item_id: string;
  target_level: number;
  quantity: number;
}

export type ResolutionMode = 'craftable' | 'raw';

export interface MaterialSource {
  item_name: string;
  context: string;
  quantity: number;
}

export interface ResolvedMaterial {
  material_id: string;
  name: string;
  quantity: number;
  per_craft_quantity: number;
  craft_recipe_available: boolean;
  sources: MaterialSource[];
}

export interface ShoppingList {
  materials: ResolvedMaterial[];
}
