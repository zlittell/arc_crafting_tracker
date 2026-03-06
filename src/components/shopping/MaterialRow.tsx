import { useState } from 'react';
import type { ResolvedMaterial } from '../../types/resolver';
import { ITEM_REGISTRY } from '../../lib/loader';

interface Props {
  material: ResolvedMaterial;
  allCollected: Record<string, number>;
  expandAll: boolean;
  onSetCollected: (materialId: string, count: number) => void;
  onRefineMaterial: (materialId: string) => void;
}

export function MaterialRow({ material, allCollected, expandAll, onSetCollected, onRefineMaterial }: Props) {
  const [expanded, setExpanded] = useState(false);

  const collected = allCollected[material.material_id] ?? 0;
  const remaining = Math.max(0, material.quantity - collected);
  const isComplete = remaining === 0;

  const recipe = material.craft_recipe_available
    ? ITEM_REGISTRY.get(material.material_id)?.craft_recipe ?? null
    : null;

  const showRecipe = recipe && (expandAll || expanded);
  const remainingRefines = Math.max(0, material.quantity - collected);
  const canAffordRefine = !recipe || recipe.ingredients.every(
    ing => (allCollected[ing.material_id] ?? 0) >= ing.quantity
  );

  // Deduplicated source names, capped at 2 with overflow count
  const uniqueNames = [...new Set(material.sources.map(s => s.item_name))];
  const displaySources = uniqueNames.slice(0, 2).join(', ') +
    (uniqueNames.length > 2 ? `, +${uniqueNames.length - 2} more` : '');

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const val = parseInt(e.target.value, 10);
    onSetCollected(material.material_id, isNaN(val) ? 0 : Math.max(0, val));
  }

  function increment() {
    onSetCollected(material.material_id, Math.min(collected + 1, material.quantity));
  }

  function decrement() {
    onSetCollected(material.material_id, Math.max(0, collected - 1));
  }

  return (
    <div className={isComplete ? 'opacity-50' : ''}>
      {/* Main row */}
      <div className="flex items-center gap-3 px-3 py-2">
        {/* Expand arrow — only shown for craftable materials */}
        {recipe ? (
          <button
            onClick={() => setExpanded(e => !e)}
            className="text-gray-500 hover:text-gray-300 transition-colors w-4 shrink-0 text-xs"
            title="Toggle refinery recipe"
          >
            {showRecipe ? '▼' : '▶'}
          </button>
        ) : (
          <span className="w-4 shrink-0" />
        )}

        {/* Material name + always-visible sources */}
        <div className="flex-1 min-w-0">
          <span className={`text-sm font-medium text-gray-200 ${isComplete ? 'line-through' : ''}`}>
            {material.name}
          </span>
          {uniqueNames.length > 0 && (
            <div className="text-xs text-gray-500 truncate mt-0.5">
              {displaySources}
            </div>
          )}
        </div>

        {/* Total needed */}
        <span className="text-sm text-gray-400 whitespace-nowrap">
          ×{material.quantity}
          {material.per_craft_quantity !== material.quantity && (
            <span className="text-xs text-gray-600 ml-1">(×{material.per_craft_quantity}/craft)</span>
          )}
        </span>

        {/* Collection controls */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={decrement}
            className="w-9 h-9 sm:w-6 sm:h-6 flex items-center justify-center rounded bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm leading-none"
          >
            −
          </button>
          <input
            type="number"
            inputMode="numeric"
            value={collected}
            onChange={handleInput}
            min={0}
            max={material.quantity}
            className="w-12 text-center text-base sm:text-sm bg-gray-800 border border-gray-600 rounded px-1 py-0.5 text-gray-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <button
            onClick={increment}
            className="w-9 h-9 sm:w-6 sm:h-6 flex items-center justify-center rounded bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm leading-none"
          >
            +
          </button>
          <span className="text-xs text-gray-500 w-8 text-right">
            {isComplete ? (
              <span className="text-arc-green">✓</span>
            ) : (
              <span className="text-arc-yellow">{remaining}</span>
            )}
          </span>
        </div>
      </div>

      {/* Expanded refinery panel */}
      {showRecipe && (
        <div className="mx-3 mb-2 rounded border border-gray-600/50 bg-gray-900/60 px-3 py-2 space-y-1.5">
          <div className="text-xs uppercase tracking-wide mb-1 flex items-center justify-between">
            <span className="text-gray-500">Refinery recipe (yields 1)</span>
            {remainingRefines > 0 && (
              <span className="text-arc-yellow normal-case tracking-normal">
                {remainingRefines} more {remainingRefines === 1 ? 'refine' : 'refines'} needed
              </span>
            )}
          </div>

          {recipe.ingredients.map(ing => {
            const mat = ITEM_REGISTRY.get(ing.material_id);
            const ingCollected = allCollected[ing.material_id] ?? 0;
            const hasEnough = ingCollected >= ing.quantity;
            const totalNeeded = ing.quantity * remainingRefines;
            return (
              <div key={ing.material_id} className="flex items-center gap-2 text-xs">
                <span className={`flex-1 text-gray-300 ${hasEnough ? 'line-through opacity-50' : ''}`}>
                  {mat?.name ?? ing.material_id}
                </span>
                <span className="text-gray-600 whitespace-nowrap">×{ing.quantity}/refine</span>
                {remainingRefines > 0 && (
                  <span className="text-gray-400 whitespace-nowrap">×{totalNeeded} total</span>
                )}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => onSetCollected(ing.material_id, Math.max(0, ingCollected - 1))}
                    className="w-5 h-5 flex items-center justify-center rounded bg-gray-700 hover:bg-gray-600 text-gray-300 leading-none"
                  >
                    −
                  </button>
                  <span className={`w-5 text-center tabular-nums ${hasEnough ? 'text-arc-green' : 'text-gray-400'}`}>
                    {ingCollected}
                  </span>
                  <button
                    onClick={() => onSetCollected(ing.material_id, ingCollected + 1)}
                    className="w-5 h-5 flex items-center justify-center rounded bg-gray-700 hover:bg-gray-600 text-gray-300 leading-none"
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}

          <button
            onClick={() => onRefineMaterial(material.material_id)}
            disabled={!canAffordRefine}
            className="mt-1 text-xs px-2 py-1 rounded bg-arc-yellow/10 hover:bg-arc-yellow/20 text-arc-yellow border border-arc-yellow/30 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Refine 1
          </button>
        </div>
      )}
    </div>
  );
}
