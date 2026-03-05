import type { LoadoutSelection, ResolutionMode, ResolvedMaterial, MaterialSource, ShoppingList } from '../types/resolver';
import { ITEM_REGISTRY } from './loader';

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
  const item = ITEM_REGISTRY.get(material_id);

  if (mode === 'raw' && item?.craft_recipe && !visited.has(material_id)) {
    const visited2 = new Set(visited);
    visited2.add(material_id);
    for (const sub of item.craft_recipe.ingredients) {
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

export function resolveShoppingList(
  selections: LoadoutSelection[],
  modQuantities: Record<string, number>,
  mode: ResolutionMode
): ShoppingList {
  const accumulator = new Map<string, Accumulator>();

  for (const selection of selections) {
    const item = ITEM_REGISTRY.get(selection.item_id);
    if (!item) continue;
    const qty = selection.quantity ?? 1;

    if (item.upgrades) {
      for (let levelNum = 1; levelNum <= selection.target_level; levelNum++) {
        const levelData = item.upgrades.find(u => u.level === levelNum);
        if (!levelData) continue;

        for (const ingredient of levelData.ingredients) {
          expandIngredient(
            ingredient.material_id,
            ingredient.quantity * qty,
            ingredient.quantity,
            mode,
            { item_name: item.name, context: levelData.label ?? `Level ${levelNum}`, quantity: ingredient.quantity * qty },
            accumulator,
            new Set()
          );
        }
      }
    } else if (item.craft_recipe) {
      for (const ingredient of item.craft_recipe.ingredients) {
        expandIngredient(
          ingredient.material_id,
          ingredient.quantity * qty,
          ingredient.quantity,
          mode,
          { item_name: item.name, context: 'Craft', quantity: ingredient.quantity * qty },
          accumulator,
          new Set()
        );
      }
    } else {
      // Raw material selected directly — add the item itself to the gather list
      const existing = accumulator.get(item.id);
      if (existing) {
        existing.quantity += qty;
        existing.per_craft_quantity += 1;
        existing.sources.push({ item_name: item.name, context: 'Goal', quantity: qty });
      } else {
        accumulator.set(item.id, {
          quantity: qty,
          per_craft_quantity: 1,
          sources: [{ item_name: item.name, context: 'Goal', quantity: qty }],
        });
      }
    }
  }

  for (const [modId, modQty] of Object.entries(modQuantities)) {
    const mod = ITEM_REGISTRY.get(modId);
    if (!mod?.craft_recipe) continue;

    for (const ingredient of mod.craft_recipe.ingredients) {
      expandIngredient(
        ingredient.material_id,
        ingredient.quantity * modQty,
        ingredient.quantity,
        mode,
        { item_name: mod.name, context: 'Mod', quantity: ingredient.quantity * modQty },
        accumulator,
        new Set()
      );
    }
  }

  const materials: ResolvedMaterial[] = [];
  for (const [material_id, acc] of accumulator) {
    const item = ITEM_REGISTRY.get(material_id);
    materials.push({
      material_id,
      name: item?.name ?? material_id,
      quantity: acc.quantity,
      per_craft_quantity: acc.per_craft_quantity,
      craft_recipe_available: !!item?.craft_recipe,
      sources: acc.sources,
    });
  }

  materials.sort((a, b) => {
    if (a.craft_recipe_available !== b.craft_recipe_available) {
      return a.craft_recipe_available ? 1 : -1;
    }
    return a.name.localeCompare(b.name);
  });

  return { materials };
}
