import type { Blueprint } from '../../types/blueprint';
import type { LoadoutSelection } from '../../types/resolver';
import { RankSelector } from './RankSelector';
import { rarityColor, rarityBadgeColor, capitalize } from '../../lib/utils';

interface Props {
  blueprint: Blueprint;
  selection: LoadoutSelection | undefined;
  onToggle: (blueprintId: string) => void;
  onSetRank: (blueprintId: string, rank: number) => void;
  onSetQuantity: (blueprintId: string, qty: number) => void;
  onMarkCrafted: (blueprintId: string) => void;
}

export function BlueprintCard({ blueprint, selection, onToggle, onSetRank, onSetQuantity, onMarkCrafted }: Props) {
  const isSelected = !!selection;
  const availableRanks = blueprint.ranks.map(r => r.rank);
  const quantity = selection?.quantity ?? 1;

  return (
    <div className={`rounded-lg border p-3 transition-colors ${
      isSelected
        ? 'border-blue-600/50 bg-blue-950/20'
        : 'border-gray-700 bg-gray-800/30 hover:border-gray-600'
    }`}>
      <label className="flex items-start gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggle(blueprint.id)}
          className="mt-0.5 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-0 focus:ring-offset-transparent"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-sm font-semibold ${rarityColor(blueprint.rarity)}`}>
              {blueprint.name}
            </span>
            <span className={`text-xs px-1.5 py-0.5 rounded ${rarityBadgeColor(blueprint.rarity)}`}>
              {capitalize(blueprint.rarity)}
            </span>
            {blueprint.ammo_type && (
              <span className="text-xs text-gray-500">{blueprint.ammo_type}</span>
            )}
          </div>
        </div>
      </label>

      {isSelected && selection && (
        <div className="mt-2 pl-5 space-y-2">
          <RankSelector
            availableRanks={availableRanks}
            selectedRank={selection.target_rank}
            onSetRank={(rank) => onSetRank(blueprint.id, rank)}
          />
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Qty:</span>
            <button
              onClick={() => onSetQuantity(blueprint.id, quantity - 1)}
              className="w-6 h-6 flex items-center justify-center rounded bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm leading-none"
            >
              −
            </button>
            <span className="text-sm text-gray-200 w-6 text-center">{quantity}</span>
            <button
              onClick={() => onSetQuantity(blueprint.id, quantity + 1)}
              className="w-6 h-6 flex items-center justify-center rounded bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm leading-none"
            >
              +
            </button>
            <button
              onClick={() => onMarkCrafted(blueprint.id)}
              disabled={quantity === 0}
              className="ml-2 text-xs px-2 py-1 rounded bg-green-800/50 hover:bg-green-700/60 text-green-300 border border-green-700/50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Crafted 1
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
