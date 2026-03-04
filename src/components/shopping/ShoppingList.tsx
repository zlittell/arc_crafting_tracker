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
  const totalCount = materials.length;
  const collectedCount = materials.filter(m => (collected[m.material_id] ?? 0) >= m.quantity).length;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-700">
        <div>
          <span className="text-sm text-gray-400">
            {collectedCount}/{totalCount} materials collected
          </span>
          <div className="mt-1 h-1.5 bg-gray-700 rounded-full w-48">
            <div
              className="h-full bg-green-500 rounded-full transition-all"
              style={{ width: `${totalCount > 0 ? (collectedCount / totalCount) * 100 : 0}%` }}
            />
          </div>
        </div>
        <button
          onClick={onClearCollected}
          className="text-xs text-gray-500 hover:text-gray-300 px-2 py-1 rounded border border-gray-700 hover:border-gray-500 transition-colors"
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
            onSetCollected={onSetCollected}
            onRefineMaterial={onRefineMaterial}
          />
        )}
        {craft.length > 0 && (
          <MaterialGroup
            label="Craft"
            materials={craft as ResolvedMaterial[]}
            collected={collected}
            onSetCollected={onSetCollected}
            onRefineMaterial={onRefineMaterial}
          />
        )}
      </div>
    </div>
  );
}
