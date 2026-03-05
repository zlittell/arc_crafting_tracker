import { useState } from 'react';
import type { CraftSelection } from '../../types/resolver';
import { ITEM_REGISTRY } from '../../lib/loader';
import { CategorySection } from './CategorySection';
import { ModCard } from './ModCard';
import { groupBy, capitalize } from '../../lib/utils';

interface Props {
  selections: CraftSelection[];
  modQuantities: Record<string, number>;
  onToggleItem: (itemId: string) => void;
  onSetLevel: (itemId: string, level: number) => void;
  onSetItemQuantity: (itemId: string, qty: number) => void;
  onMarkItemCrafted: (itemId: string) => void;
  onToggleMod: (modId: string) => void;
  onSetModQuantity: (modId: string, qty: number) => void;
  onMarkModCrafted: (modId: string) => void;
}

const UPGRADEABLE_CATEGORY_ORDER = ['weapon'];

const CATEGORY_LABELS: Record<string, string> = {
  weapon: 'Weapons',
  shield: 'Shields',
  augment: 'Augments',
  ammunition: 'Ammunition',
  quick_use: 'Quick Use',
  crafting_material: 'Crafting Materials',
};

export function CraftSelector({
  selections, modQuantities, onToggleItem, onSetLevel,
  onSetItemQuantity, onMarkItemCrafted,
  onToggleMod, onSetModQuantity, onMarkModCrafted,
}: Props) {
  const [modsCollapsed, setModsCollapsed] = useState(true);
  const [search, setSearch] = useState('');

  const searchLower = search.toLowerCase();
  const allItems = Array.from(ITEM_REGISTRY.values());

  const selectableItems = allItems
    .filter(i => (i.upgrades || i.craft_recipe || i.category === 'crafting_material') && i.category !== 'weapon_mod' && i.category !== 'key')
    .filter(i => !search || i.name.toLowerCase().includes(searchLower));

  const grouped = groupBy(selectableItems, i => i.category);

  const orderedCategories = [
    ...UPGRADEABLE_CATEGORY_ORDER.filter(c => grouped[c]),
    ...Object.keys(grouped).filter(c => !UPGRADEABLE_CATEGORY_ORDER.includes(c)),
  ];

  const mods = allItems
    .filter(i => i.category === 'weapon_mod')
    .filter(i => !search || i.name.toLowerCase().includes(searchLower));

  const groupedMods = groupBy(mods, m => m.slot ?? 'other');
  const activeModCount = Object.keys(modQuantities).length;
  const searchActive = search.length > 0;
  const showModsContent = !modsCollapsed || (searchActive && mods.length > 0);

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Search box */}
      <div className="px-1 pb-3">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search items and mods…"
          className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-1.5 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-arc-cyan"
        />
      </div>

      {/* Scrollable list */}
      <div className="flex-1 overflow-y-auto px-1">
        {orderedCategories.map(category => (
          <CategorySection
            key={category}
            category={category}
            label={CATEGORY_LABELS[category]}
            items={grouped[category]}
            selections={selections}
            forceExpanded={searchActive}
            onToggle={onToggleItem}
            onSetLevel={onSetLevel}
            onSetQuantity={onSetItemQuantity}
            onMarkCrafted={onMarkItemCrafted}
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
                <span className="text-xs bg-arc-cyan/20 text-arc-cyan px-1.5 py-0.5 rounded-full border border-arc-cyan/50">
                  {activeModCount}
                </span>
              )}
              <span className="ml-auto text-gray-600 text-xs">{showModsContent ? '▼' : '▶'}</span>
            </button>

            {showModsContent && (
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

        {searchActive && selectableItems.length === 0 && mods.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-8">No results for "{search}"</p>
        )}
      </div>
    </div>
  );
}
