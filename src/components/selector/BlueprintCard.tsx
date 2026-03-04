import type { Blueprint } from '../../types/blueprint';
import type { LoadoutSelection } from '../../types/resolver';
import { RankSelector } from './RankSelector';
import { ModSelector } from './ModSelector';
import { rarityColor, rarityBadgeColor, capitalize } from '../../lib/utils';

interface Props {
  blueprint: Blueprint;
  selection: LoadoutSelection | undefined;
  onToggle: (blueprintId: string) => void;
  onSetRank: (blueprintId: string, rank: number) => void;
  onToggleMod: (blueprintId: string, modId: string) => void;
}

export function BlueprintCard({ blueprint, selection, onToggle, onSetRank, onToggleMod }: Props) {
  const isSelected = !!selection;
  const availableRanks = blueprint.ranks.map(r => r.rank);

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
            {blueprint.blueprint_required && (
              <span className="text-xs text-orange-400/70">BP required</span>
            )}
          </div>
        </div>
      </label>

      {isSelected && selection && (
        <div className="mt-2 pl-5">
          <RankSelector
            availableRanks={availableRanks}
            selectedRank={selection.target_rank}
            onSetRank={(rank) => onSetRank(blueprint.id, rank)}
          />
          <ModSelector
            compatibleMods={blueprint.compatible_mods}
            selectedModIds={selection.selected_mod_ids}
            onToggleMod={(modId) => onToggleMod(blueprint.id, modId)}
          />
        </div>
      )}
    </div>
  );
}
