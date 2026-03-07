import { useState } from 'react';
import type { ShoppingList as ShoppingListType, ResolvedMaterial } from '../../types/resolver';
import { MaterialGroup } from './MaterialGroup';

interface Props {
  shoppingList: ShoppingListType;
  collected: Record<string, number>;
  onSetCollected: (materialId: string, count: number) => void;
  onClearCollected: () => void;
  onRefineMaterial: (materialId: string) => void;
}

export function ShoppingList({ shoppingList, collected, onSetCollected, onClearCollected, onRefineMaterial }: Props) {
  const [expandAll, setExpandAll] = useState(false);
  const { materials } = shoppingList;

  if (materials.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 py-20">
        <div className="text-4xl mb-4">📋</div>
        <p className="text-lg font-medium">No items selected</p>
        <p className="text-sm mt-1">Select blueprints and ranks on the left to see your shopping list.</p>
      </div>
    );
  }

  const gather = materials.filter(m => !m.craft_recipe_available);
  const craft = materials.filter(m => m.craft_recipe_available);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-end gap-2 mb-4 pb-3 border-b border-gray-700">
        {craft.length > 0 && (
          <button
            onClick={() => setExpandAll(e => !e)}
            className="text-xs text-gray-400 hover:text-gray-200 px-3 py-2 sm:px-2 sm:py-1 rounded border border-gray-700 hover:border-gray-500 transition-colors"
          >
            {expandAll ? 'Collapse recipes' : 'Expand recipes'}
          </button>
        )}
        <button
          onClick={onClearCollected}
          className="text-xs text-gray-500 hover:text-gray-300 px-3 py-2 sm:px-2 sm:py-1 rounded border border-gray-700 hover:border-gray-500 transition-colors"
        >
          Clear collected
        </button>
      </div>

      {/* Material groups */}
      <div className="flex-1 overflow-y-auto">
        {gather.length > 0 && (
          <MaterialGroup
            label="Gather"
            materials={gather}
            collected={collected}
            expandAll={false}
            onSetCollected={onSetCollected}
            onRefineMaterial={onRefineMaterial}
          />
        )}
        {craft.length > 0 && (
          <MaterialGroup
            label="Craft"
            materials={craft as ResolvedMaterial[]}
            collected={collected}
            expandAll={expandAll}
            onSetCollected={onSetCollected}
            onRefineMaterial={onRefineMaterial}
          />
        )}
      </div>
    </div>
  );
}
