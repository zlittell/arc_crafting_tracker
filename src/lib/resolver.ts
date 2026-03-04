import type { Ingredient } from '../types/material';
import type { LoadoutSelection, ResolutionMode, ResolvedMaterial, MaterialSource, ShoppingList } from '../types/resolver';
import { BLUEPRINT_REGISTRY, MOD_REGISTRY, MATERIAL_REGISTRY } from './loader';

interface Accumulator {
  quantity: number;
  sources: MaterialSource[];
}

function expandIngredient(
  ingredient: Ingredient,
  mode: ResolutionMode,
  source: MaterialSource,
  accumulator: Map<string, Accumulator>,
  visited: Set<string>
): void {
  const { material_id, quantity } = ingredient;
  const material = MATERIAL_REGISTRY.get(material_id);

  if (mode === 'raw' && material?.craft_recipe && !visited.has(material_id)) {
    // Recurse into sub-ingredients, scaled by quantity needed
    const visited2 = new Set(visited);
    visited2.add(material_id);
    for (const subIngredient of material.craft_recipe.ingredients) {
      expandIngredient(
        { material_id: subIngredient.material_id, quantity: subIngredient.quantity * quantity },
        mode,
        source,
        accumulator,
        visited2
      );
    }
  } else {
    // Accumulate this material directly
    const existing = accumulator.get(material_id);
    if (existing) {
      existing.quantity += quantity;
      existing.sources.push({ ...source, quantity });
    } else {
      accumulator.set(material_id, {
        quantity,
        sources: [{ ...source, quantity }],
      });
    }
  }
}

const RARITY_ORDER: Record<string, number> = {
  legendary: 0,
  epic: 1,
  rare: 2,
  uncommon: 3,
  common: 4,
};

function raritySort(a: ResolvedMaterial, b: ResolvedMaterial): number {
  const aOrder = RARITY_ORDER[a.rarity] ?? 99;
  const bOrder = RARITY_ORDER[b.rarity] ?? 99;
  if (aOrder !== bOrder) return aOrder - bOrder;
  return a.name.localeCompare(b.name);
}

export function resolveShoppingList(
  selections: LoadoutSelection[],
  mode: ResolutionMode
): ShoppingList {
  const accumulator = new Map<string, Accumulator>();

  for (const selection of selections) {
    const blueprint = BLUEPRINT_REGISTRY.get(selection.blueprint_id);
    if (!blueprint) continue;

    // Collect ingredients from ranks 1..target_rank (all delta costs summed)
    for (let rankNum = 1; rankNum <= selection.target_rank; rankNum++) {
      const rankData = blueprint.ranks.find(r => r.rank === rankNum);
      if (!rankData) continue;

      for (const ingredient of rankData.ingredients) {
        expandIngredient(
          ingredient,
          mode,
          {
            blueprint_name: blueprint.name,
            context: rankData.label,
            quantity: ingredient.quantity,
          },
          accumulator,
          new Set()
        );
      }
    }

    // Collect mod ingredients
    for (const modId of selection.selected_mod_ids) {
      const mod = MOD_REGISTRY.get(modId);
      if (!mod) continue;

      for (const ingredient of mod.ingredients) {
        expandIngredient(
          ingredient,
          mode,
          {
            blueprint_name: blueprint.name,
            context: `Mod: ${mod.name}`,
            quantity: ingredient.quantity,
          },
          accumulator,
          new Set()
        );
      }
    }
  }

  // Convert accumulator to ResolvedMaterial[]
  const materials: ResolvedMaterial[] = [];
  for (const [material_id, acc] of accumulator) {
    const material = MATERIAL_REGISTRY.get(material_id);
    materials.push({
      material_id,
      name: material?.name ?? material_id,
      rarity: material?.rarity ?? 'common',
      category: material?.category ?? 'unknown',
      quantity: acc.quantity,
      craft_recipe_available: !!material?.craft_recipe,
      sources: acc.sources,
    });
  }

  materials.sort(raritySort);

  return { materials };
}
