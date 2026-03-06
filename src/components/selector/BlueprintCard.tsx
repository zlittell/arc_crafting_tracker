import type { Item } from '../../types/item';
import type { CraftSelection } from '../../types/resolver';
import { RankSelector } from './RankSelector';

interface Props {
  item: Item;
  selection: CraftSelection | undefined;
  canCraft: boolean;
  onToggle: (itemId: string) => void;
  onSetLevel: (itemId: string, level: number) => void;
  onSetQuantity: (itemId: string, qty: number) => void;
  onMarkCrafted: (itemId: string) => void;
}

export function BlueprintCard({ item, selection, canCraft, onToggle, onSetLevel, onSetQuantity, onMarkCrafted }: Props) {
  const isSelected = !!selection;
  const availableLevels = item.upgrades?.map(u => u.level) ?? [];
  const quantity = selection?.quantity ?? 1;

  return (
    <div className={`rounded-lg border p-3 transition-colors ${
      isSelected
        ? 'border-arc-cyan/50 bg-arc-cyan/10'
        : 'border-gray-700 bg-gray-800/30 hover:border-gray-600'
    }`}>
      <label className="flex items-start gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggle(item.id)}
          className="mt-0.5 rounded border-gray-600 bg-gray-700 text-arc-cyan focus:ring-arc-cyan focus:ring-offset-0 focus:ring-offset-transparent"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-gray-200">{item.name}</span>
            {item.ammo_type && (
              <span className="text-xs text-gray-500">{item.ammo_type}</span>
            )}
          </div>
        </div>
      </label>

      {isSelected && selection && (
        <div className="mt-2 pl-5 space-y-2">
          {availableLevels.length > 0 && (
            <RankSelector
              availableLevels={availableLevels}
              selectedLevel={selection.target_level}
              onSetLevel={(level) => onSetLevel(item.id, level)}
            />
          )}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Qty:</span>
            <button
              onClick={() => onSetQuantity(item.id, quantity - 1)}
              className="w-9 h-9 sm:w-6 sm:h-6 flex items-center justify-center rounded bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm leading-none"
            >
              −
            </button>
            <span className="text-sm text-gray-200 w-6 text-center">{quantity}</span>
            <button
              onClick={() => onSetQuantity(item.id, quantity + 1)}
              className="w-9 h-9 sm:w-6 sm:h-6 flex items-center justify-center rounded bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm leading-none"
            >
              +
            </button>
            <button
              onClick={() => onMarkCrafted(item.id)}
              disabled={quantity === 0 || !canCraft}
              className="ml-2 text-xs px-2 py-1 rounded bg-arc-green/10 hover:bg-arc-green/20 text-arc-green border border-arc-green/30 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Crafted 1
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
