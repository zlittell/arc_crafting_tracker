import { useState, useMemo, useEffect } from 'react';
import type { LoadoutSelection, ResolutionMode } from './types/resolver';
import { BLUEPRINT_REGISTRY } from './lib/loader';
import { resolveShoppingList } from './lib/resolver';
import { Layout } from './components/layout/Layout';
import { Header } from './components/layout/Header';
import { LoadoutSelector } from './components/selector/LoadoutSelector';
import { ShoppingList } from './components/shopping/ShoppingList';

export default function App() {
  const [selections, setSelections] = useState<LoadoutSelection[]>([]);
  const [modQuantities, setModQuantities] = useState<Record<string, number>>({});
  const [mode, setMode] = useState<ResolutionMode>('craftable');
  const [collected, setCollected] = useState<Record<string, number>>(
    () => JSON.parse(localStorage.getItem('arc_collected') ?? '{}')
  );

  useEffect(() => {
    localStorage.setItem('arc_collected', JSON.stringify(collected));
  }, [collected]);

  const shoppingList = useMemo(
    () => resolveShoppingList(selections, modQuantities, mode),
    [selections, modQuantities, mode]
  );

  function handleToggleBlueprint(blueprintId: string) {
    setSelections(prev => {
      const exists = prev.find(s => s.blueprint_id === blueprintId);
      if (exists) {
        return prev.filter(s => s.blueprint_id !== blueprintId);
      }
      const blueprint = BLUEPRINT_REGISTRY.get(blueprintId);
      const defaultRank = blueprint?.ranks[0]?.rank ?? 1;
      return [...prev, { blueprint_id: blueprintId, target_rank: defaultRank, quantity: 1 }];
    });
  }

  function handleSetRank(blueprintId: string, rank: number) {
    setSelections(prev =>
      prev.map(s => s.blueprint_id === blueprintId ? { ...s, target_rank: rank } : s)
    );
  }

  function handleSetBlueprintQuantity(blueprintId: string, qty: number) {
    setSelections(prev =>
      prev.map(s => s.blueprint_id === blueprintId ? { ...s, quantity: Math.max(0, qty) } : s)
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

  function handleMarkBlueprintCrafted(blueprintId: string) {
    const selection = selections.find(s => s.blueprint_id === blueprintId);
    if (!selection) return;

    // Cost of one craft
    const oneCraft = resolveShoppingList([{ ...selection, quantity: 1 }], {}, mode);
    setCollected(prev => {
      const next = { ...prev };
      for (const mat of oneCraft.materials) {
        next[mat.material_id] = Math.max(0, (next[mat.material_id] ?? 0) - mat.quantity);
      }
      return next;
    });
    handleSetBlueprintQuantity(blueprintId, selection.quantity - 1);
  }

  function handleMarkModCrafted(modId: string) {
    const qty = modQuantities[modId];
    if (!qty) return;

    const oneCraft = resolveShoppingList([], { [modId]: 1 }, mode);
    setCollected(prev => {
      const next = { ...prev };
      for (const mat of oneCraft.materials) {
        next[mat.material_id] = Math.max(0, (next[mat.material_id] ?? 0) - mat.quantity);
      }
      return next;
    });
    handleSetModQuantity(modId, qty - 1);
  }

  function handleSetCollected(materialId: string, count: number) {
    setCollected(prev => ({ ...prev, [materialId]: count }));
  }

  function handleClearCollected() {
    setCollected({});
  }

  return (
    <Layout
      header={<Header mode={mode} onSetMode={setMode} />}
      left={
        <LoadoutSelector
          selections={selections}
          modQuantities={modQuantities}
          onToggle={handleToggleBlueprint}
          onSetRank={handleSetRank}
          onSetBlueprintQuantity={handleSetBlueprintQuantity}
          onMarkBlueprintCrafted={handleMarkBlueprintCrafted}
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
        />
      }
    />
  );
}
