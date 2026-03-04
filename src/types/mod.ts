import type { Ingredient } from './material';

export interface Mod {
  id: string;
  name: string;
  slot: string;
  required_skill?: string;
  ingredients: Ingredient[];
}
