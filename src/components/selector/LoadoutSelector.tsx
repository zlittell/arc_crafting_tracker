import { useState } from 'react';
import type { LoadoutSelection } from '../../types/resolver';
import { BLUEPRINT_REGISTRY, MOD_REGISTRY } from '../../lib/loader';
import { CategorySection } from './CategorySection';
import { ModCard } from './ModCard';
import { groupBy, capitalize } from '../../lib/utils';

interface Props {
  selections: LoadoutSelection[];
  modQuantities: Record<string, number>;
  onToggle: (blueprintId: string) => void;
  onSetRank: (blueprintId: string, rank: number) => void;
  onSetBlueprintQuantity: (blueprintId: string, qty: number) => void;
  onMarkBlueprintCrafted: (blueprintId: string) => void;
  onToggleMod: (modId: string) => void;
  onSetModQuantity: (modId: string, qty: number) => void;
  onMarkModCrafted: (modId: string) => void;
}

const CATEGORY_ORDER = ['weapon', 'armor', 'tool'];

export function LoadoutSelector({
  selections, modQuantities, onToggle, onSetRank,
  onSetBlueprintQuantity, onMarkBlueprintCrafted,
  onToggleMod, onSetModQuantity, onMarkModCrafted,
}: Props) {
  const [modsCollapsed, setModsCollapsed] = useState(false);

  const blueprints = Array.from(BLUEPRINT_REGISTRY.values());
  const grouped = groupBy(blueprints, b => b.category);
  const mods = Array.from(MOD_REGISTRY.values());

  const orderedCategories = [
    ...CATEGORY_ORDER.filter(c => grouped[c]),
    ...Object.keys(grouped).filter(c => !CATEGORY_ORDER.includes(c)),
  ];

  const groupedMods = groupBy(mods, m => m.slot);
  const activeModCount = Object.keys(modQuantities).length;

  return (
    <div className="flex-1 overflow-y-auto px-1">
      {orderedCategories.map(category => (
        <CategorySection
          key={category}
          category={category}
          blueprints={grouped[category]}
          selections={selections}
          onToggle={onToggle}
          onSetRank={onSetRank}
          onSetQuantity={onSetBlueprintQuantity}
          onMarkCrafted={onMarkBlueprintCrafted}
        />
      ))}

      {mods.length > 0 && (
        <div className="mb-5">
          <button
            onClick={() => setModsCollapsed(c => !c)}
            className="flex items-center gap-2 w-full text-left mb-2 group"
          >
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 group-hover:text-gray-300 transition-colors">
              Mods
            </span>
            {activeModCount > 0 && (
              <span className="text-xs bg-blue-600/30 text-blue-400 px-1.5 py-0.5 rounded-full border border-blue-600/50">
                {activeModCount}
              </span>
            )}
            <span className="ml-auto text-gray-600 text-xs">{modsCollapsed ? '▶' : '▼'}</span>
          </button>

          {!modsCollapsed && (
            <div className="space-y-4">
              {Object.entries(groupedMods).map(([slot, slotMods]) => (
                <div key={slot}>
                  <div className="text-xs text-gray-600 uppercase tracking-wide mb-1 pl-1">
                    {capitalize(slot.replace(/_/g, ' '))}
                  </div>
                  <div className="space-y-2">
                    {slotMods.map(mod => (
                      <ModCard
                        key={mod.id}
                        mod={mod}
                        isSelected={mod.id in modQuantities}
                        quantity={modQuantities[mod.id] ?? 0}
                        onToggle={onToggleMod}
                        onSetQuantity={onSetModQuantity}
                        onMarkCrafted={onMarkModCrafted}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
