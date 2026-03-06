import type { Item } from '../../types/item';

interface Props {
  mod: Item;
  isSelected: boolean;
  quantity: number;
  onToggle: (modId: string) => void;
  onSetQuantity: (modId: string, qty: number) => void;
  onMarkCrafted: (modId: string) => void;
}

export function ModCard({ mod, isSelected, quantity, onToggle, onSetQuantity, onMarkCrafted }: Props) {

  return (
    <div className={`rounded-lg border p-3 transition-colors ${
      isSelected
        ? 'border-arc-cyan/50 bg-arc-cyan/10'
        : 'border-gray-700 bg-gray-800/30 hover:border-gray-600'
    }`}>
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggle(mod.id)}
          className="rounded border-gray-600 bg-gray-700 text-arc-cyan focus:ring-arc-cyan focus:ring-offset-0 focus:ring-offset-transparent"
        />
        <span className="text-sm font-medium text-gray-200">{mod.name}</span>
        {mod.slot && <span className="ml-auto text-xs text-gray-500">{mod.slot}</span>}
      </label>

      {isSelected && (
        <div className="mt-2 pl-5 flex items-center gap-2">
          <span className="text-xs text-gray-400">Qty:</span>
          <button
            onClick={() => onSetQuantity(mod.id, quantity - 1)}
            className="w-9 h-9 sm:w-6 sm:h-6 flex items-center justify-center rounded bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm leading-none"
          >
            −
          </button>
          <span className="text-sm text-gray-200 w-6 text-center">{quantity}</span>
          <button
            onClick={() => onSetQuantity(mod.id, quantity + 1)}
            className="w-9 h-9 sm:w-6 sm:h-6 flex items-center justify-center rounded bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm leading-none"
          >
            +
          </button>
          <button
            onClick={() => onMarkCrafted(mod.id)}
            disabled={quantity === 0}
            className="ml-2 text-xs px-2 py-1 rounded bg-arc-green/10 hover:bg-arc-green/20 text-arc-green border border-arc-green/30 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Crafted 1
          </button>
        </div>
      )}
    </div>
  );
}
