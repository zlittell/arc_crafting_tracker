import type { LoadoutSelection, ResolutionMode, ResolvedMaterial, MaterialSource, ShoppingList } from '../types/resolver';
import { BLUEPRINT_REGISTRY, MOD_REGISTRY, MATERIAL_REGISTRY } from './loader';

interface Accumulator {
  quantity: number;
  per_craft_quantity: number;
  sources: MaterialSource[];
}

function expandIngredient(
  material_id: string,
  totalQty: number,
  unitQty: number,
  mode: ResolutionMode,
  source: MaterialSource,
  accumulator: Map<string, Accumulator>,
  visited: Set<string>
): void {
  const material = MATERIAL_REGISTRY.get(material_id);

  if (mode === 'raw' && material?.craft_recipe && !visited.has(material_id)) {
    const visited2 = new Set(visited);
    visited2.add(material_id);
    for (const sub of material.craft_recipe.ingredients) {
      expandIngredient(
        sub.material_id,
        sub.quantity * totalQty,
        sub.quantity * unitQty,
        mode,
        source,
        accumulator,
        visited2
      );
    }
  } else {
    const existing = accumulator.get(material_id);
    if (existing) {
      existing.quantity += totalQty;
      existing.per_craft_quantity += unitQty;
      existing.sources.push({ ...source, quantity: totalQty });
    } else {
      accumulator.set(material_id, {
        quantity: totalQty,
        per_craft_quantity: unitQty,
        sources: [{ ...source, quantity: totalQty }],
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
  modQuantities: Record<string, number>,
  mode: ResolutionMode
): ShoppingList {
  const accumulator = new Map<string, Accumulator>();

  for (const selection of selections) {
    const blueprint = BLUEPRINT_REGISTRY.get(selection.blueprint_id);
    if (!blueprint) continue;
    const qty = selection.quantity ?? 1;

    for (let rankNum = 1; rankNum <= selection.target_rank; rankNum++) {
      const rankData = blueprint.ranks.find(r => r.rank === rankNum);
      if (!rankData) continue;

      for (const ingredient of rankData.ingredients) {
        expandIngredient(
          ingredient.material_id,
          ingredient.quantity * qty,
          ingredient.quantity,
          mode,
          { blueprint_name: blueprint.name, context: rankData.label, quantity: ingredient.quantity * qty },
          accumulator,
          new Set()
        );
      }
    }
  }

  for (const [modId, modQty] of Object.entries(modQuantities)) {
    const mod = MOD_REGISTRY.get(modId);
    if (!mod) continue;

    for (const ingredient of mod.ingredients) {
      expandIngredient(
        ingredient.material_id,
        ingredient.quantity * modQty,
        ingredient.quantity,
        mode,
        { blueprint_name: mod.name, context: 'Mod', quantity: ingredient.quantity * modQty },
        accumulator,
        new Set()
      );
    }
  }

  const materials: ResolvedMaterial[] = [];
  for (const [material_id, acc] of accumulator) {
    const material = MATERIAL_REGISTRY.get(material_id);
    materials.push({
      material_id,
      name: material?.name ?? material_id,
      rarity: material?.rarity ?? 'common',
      category: material?.category ?? 'unknown',
      quantity: acc.quantity,
      per_craft_quantity: acc.per_craft_quantity,
      craft_recipe_available: !!material?.craft_recipe,
      sources: acc.sources,
    });
  }

  materials.sort(raritySort);

  return { materials };
}
