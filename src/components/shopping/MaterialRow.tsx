import { useState } from 'react';
import type { ResolvedMaterial } from '../../types/resolver';
import { rarityColor } from '../../lib/utils';

interface Props {
  material: ResolvedMaterial;
  collected: number;
  onSetCollected: (materialId: string, count: number) => void;
}

export function MaterialRow({ material, collected, onSetCollected }: Props) {
  const [showSources, setShowSources] = useState(false);
  const remaining = Math.max(0, material.quantity - collected);
  const isComplete = remaining === 0;

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
    <div className={`flex items-center gap-3 px-3 py-2 rounded transition-colors ${
      isComplete ? 'opacity-50' : ''
    }`}>
      {/* Material name + rarity */}
      <div className="flex-1 min-w-0">
        <button
          onClick={() => setShowSources(s => !s)}
          className={`text-left text-sm font-medium truncate w-full ${rarityColor(material.rarity)} ${
            isComplete ? 'line-through' : ''
          } hover:underline bg-transparent border-0 p-0 cursor-pointer`}
          title="Click to show sources"
        >
          {material.name}
          {material.craft_recipe_available && (
            <span className="ml-1 text-xs text-gray-500">[craftable]</span>
          )}
        </button>

        {showSources && (
          <div className="mt-1 text-xs text-gray-400 space-y-0.5">
            {material.sources.map((s, i) => (
              <div key={i} className="pl-2 border-l border-gray-600">
                {s.blueprint_name} — {s.context}: ×{s.quantity}
              </div>
            ))}
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
          className="w-6 h-6 flex items-center justify-center rounded bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm leading-none"
        >
          −
        </button>
        <input
          type="number"
          value={collected}
          onChange={handleInput}
          min={0}
          max={material.quantity}
          className="w-12 text-center text-sm bg-gray-800 border border-gray-600 rounded px-1 py-0.5 text-gray-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <button
          onClick={increment}
          className="w-6 h-6 flex items-center justify-center rounded bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm leading-none"
        >
          +
        </button>
        <span className="text-xs text-gray-500 w-8 text-right">
          {isComplete ? (
            <span className="text-green-400">✓</span>
          ) : (
            <span className="text-yellow-500">{remaining}</span>
          )}
        </span>
      </div>
    </div>
  );
}
