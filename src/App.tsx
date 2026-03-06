import { useState, useMemo } from 'react';
import type { CraftSelection } from './types/resolver';
import { ITEM_REGISTRY } from './lib/loader';
import { resolveShoppingList } from './lib/resolver';
import { Layout } from './components/layout/Layout';
import { Header } from './components/layout/Header';
import { CraftSelector } from './components/selector/CraftSelector';
import { ShoppingList } from './components/shopping/ShoppingList';
import { RaidList } from './components/raid/RaidList';
import { usePersistence } from './hooks/usePersistence';

function tryParse<T>(key: string, fallback: T): T {
  try {
    return JSON.parse(localStorage.getItem(key) ?? JSON.stringify(fallback));
  } catch {
    return fallback;
  }
}

export default function App() {
  const [selections, setSelections] = useState<CraftSelection[]>(() => tryParse('arc_selections', []));
  const [modQuantities, setModQuantities] = useState<Record<string, number>>(() => tryParse('arc_mod_quantities', {}));
  const [collected, setCollected] = useState<Record<string, number>>(() => tryParse('arc_collected', {}));

  usePersistence({ selections, setSelections, modQuantities, setModQuantities, collected, setCollected });

  const shoppingList = useMemo(
    () => resolveShoppingList(selections, modQuantities, 'craftable'),
    [selections, modQuantities]
  );

  const rawShoppingList = useMemo(
    () => resolveShoppingList(selections, modQuantities, 'raw'),
    [selections, modQuantities]
  );

  const raidItems = useMemo(() => {
    return rawShoppingList.materials
      .map(m => ({ ...m, remaining: Math.max(0, m.quantity - (collected[m.material_id] ?? 0)) }))
      .filter(m => m.remaining > 0)
      .sort((a, b) => b.remaining - a.remaining);
  }, [rawShoppingList, collected]);

  const itemAffordability = useMemo(() => {
    const result: Record<string, boolean> = {};
    for (const sel of selections) {
      const oneCraft = resolveShoppingList([{ ...sel, quantity: 1 }], {}, 'craftable');
      result[sel.item_id] = oneCraft.materials.every(
        mat => (collected[mat.material_id] ?? 0) >= mat.quantity
      );
    }
    return result;
  }, [selections, collected]);

  const modAffordability = useMemo(() => {
    const result: Record<string, boolean> = {};
    for (const [modId, qty] of Object.entries(modQuantities)) {
      if (!qty) continue;
      const oneCraft = resolveShoppingList([], { [modId]: 1 }, 'craftable');
      result[modId] = oneCraft.materials.every(
        mat => (collected[mat.material_id] ?? 0) >= mat.quantity
      );
    }
    return result;
  }, [modQuantities, collected]);

  function handleToggleItem(itemId: string) {
    setSelections(prev => {
      const exists = prev.find(s => s.item_id === itemId);
      if (exists) return prev.filter(s => s.item_id !== itemId);
      const item = ITEM_REGISTRY.get(itemId);
      const defaultLevel = item?.upgrades?.[0]?.level ?? 1;
      return [...prev, { item_id: itemId, target_level: defaultLevel, quantity: 1 }];
    });
  }

  function handleSetLevel(itemId: string, level: number) {
    setSelections(prev =>
      prev.map(s => s.item_id === itemId ? { ...s, target_level: level } : s)
    );
  }

  function handleSetItemQuantity(itemId: string, qty: number) {
    setSelections(prev =>
      prev.map(s => s.item_id === itemId ? { ...s, quantity: Math.max(0, qty) } : s)
    );
  }

  function handleToggleMod(modId: string) {
    setModQuantities(prev => {
      if (modId in prev) {
        const next = { ...prev };
        delete next[modId];
        return next;
      }
      return { ...prev, [modId]: 1 };
    });
  }

  function handleSetModQuantity(modId: string, qty: number) {
    setModQuantities(prev => ({ ...prev, [modId]: Math.max(0, qty) }));
  }

  function handleMarkItemCrafted(itemId: string) {
    const selection = selections.find(s => s.item_id === itemId);
    if (!selection) return;
    const oneCraft = resolveShoppingList([{ ...selection, quantity: 1 }], {}, 'craftable');
    const canAfford = oneCraft.materials.every(
      mat => (collected[mat.material_id] ?? 0) >= mat.quantity
    );
    if (!canAfford) return;
    setCollected(prev => {
      const next = { ...prev };
      for (const mat of oneCraft.materials) {
        next[mat.material_id] = Math.max(0, (next[mat.material_id] ?? 0) - mat.quantity);
      }
      return next;
    });
    handleSetItemQuantity(itemId, selection.quantity - 1);
  }

  function handleMarkModCrafted(modId: string) {
    const qty = modQuantities[modId];
    if (!qty) return;
    const oneCraft = resolveShoppingList([], { [modId]: 1 }, 'craftable');
    const canAfford = oneCraft.materials.every(
      mat => (collected[mat.material_id] ?? 0) >= mat.quantity
    );
    if (!canAfford) return;
    setCollected(prev => {
      const next = { ...prev };
      for (const mat of oneCraft.materials) {
        next[mat.material_id] = Math.max(0, (next[mat.material_id] ?? 0) - mat.quantity);
      }
      return next;
    });
    handleSetModQuantity(modId, qty - 1);
  }

  function handleRefineItem(itemId: string) {
    const item = ITEM_REGISTRY.get(itemId);
    if (!item?.craft_recipe) return;
    const canAfford = item.craft_recipe.ingredients.every(
      ing => (collected[ing.material_id] ?? 0) >= ing.quantity
    );
    if (!canAfford) return;
    setCollected(prev => {
      const next = { ...prev };
      for (const ing of item.craft_recipe!.ingredients) {
        next[ing.material_id] = Math.max(0, (next[ing.material_id] ?? 0) - ing.quantity);
      }
      next[itemId] = (next[itemId] ?? 0) + 1;
      return next;
    });
  }

  function handleSetCollected(materialId: string, count: number) {
    setCollected(prev => ({ ...prev, [materialId]: count }));
  }

  function handleClearCollected() {
    setCollected({});
  }

  return (
    <Layout
      header={<Header />}
      left={
        <CraftSelector
          selections={selections}
          modQuantities={modQuantities}
          itemAffordability={itemAffordability}
          modAffordability={modAffordability}
          onToggleItem={handleToggleItem}
          onSetLevel={handleSetLevel}
          onSetItemQuantity={handleSetItemQuantity}
          onMarkItemCrafted={handleMarkItemCrafted}
          onToggleMod={handleToggleMod}
          onSetModQuantity={handleSetModQuantity}
          onMarkModCrafted={handleMarkModCrafted}
        />
      }
      right={
        <ShoppingList
          shoppingList={shoppingList}
          collected={collected}
          onSetCollected={handleSetCollected}
          onClearCollected={handleClearCollected}
          onRefineMaterial={handleRefineItem}
        />
      }
      raid={<RaidList raidItems={raidItems} />}
    />
  );
}
