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
  const [mode, setMode] = useState<ResolutionMode>('craftable');
  const [collected, setCollected] = useState<Record<string, number>>(
    () => JSON.parse(localStorage.getItem('arc_collected') ?? '{}')
  );

  useEffect(() => {
    localStorage.setItem('arc_collected', JSON.stringify(collected));
  }, [collected]);

  const shoppingList = useMemo(
    () => resolveShoppingList(selections, mode),
    [selections, mode]
  );

  function handleToggleBlueprint(blueprintId: string) {
    setSelections(prev => {
      const exists = prev.find(s => s.blueprint_id === blueprintId);
      if (exists) {
        return prev.filter(s => s.blueprint_id !== blueprintId);
      }
      const blueprint = BLUEPRINT_REGISTRY.get(blueprintId);
      const defaultRank = blueprint?.ranks[0]?.rank ?? 1;
      return [...prev, { blueprint_id: blueprintId, target_rank: defaultRank, selected_mod_ids: [] }];
    });
  }

  function handleSetRank(blueprintId: string, rank: number) {
    setSelections(prev =>
      prev.map(s => s.blueprint_id === blueprintId ? { ...s, target_rank: rank } : s)
    );
  }

  function handleToggleMod(blueprintId: string, modId: string) {
    setSelections(prev =>
      prev.map(s => {
        if (s.blueprint_id !== blueprintId) return s;
        const has = s.selected_mod_ids.includes(modId);
        return {
          ...s,
          selected_mod_ids: has
            ? s.selected_mod_ids.filter(id => id !== modId)
            : [...s.selected_mod_ids, modId],
        };
      })
    );
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
          onToggle={handleToggleBlueprint}
          onSetRank={handleSetRank}
          onToggleMod={handleToggleMod}
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
