export interface Ingredient {
  material_id: string;
  quantity: number;
}

export interface CraftRecipe {
  station: string;
  ingredients: Ingredient[];
}

export interface Material {
  id: string;
  name: string;
  rarity: string;
  category: string;
  craft_recipe?: CraftRecipe;
}
