import { useState } from 'react';
import type { Item } from '../../types/item';
import type { CraftSelection } from '../../types/resolver';
import { BlueprintCard } from './BlueprintCard';
import { capitalize } from '../../lib/utils';

interface Props {
  category: string;
  label?: string;
  items: Item[];
  selections: CraftSelection[];
  itemAffordability: Record<string, boolean>;
  forceExpanded?: boolean;
  onToggle: (itemId: string) => void;
  onSetLevel: (itemId: string, level: number) => void;
  onSetQuantity: (itemId: string, qty: number) => void;
  onMarkCrafted: (itemId: string) => void;
}

export function CategorySection({ category, label, items, selections, itemAffordability, forceExpanded, onToggle, onSetLevel, onSetQuantity, onMarkCrafted }: Props) {
  const [collapsed, setCollapsed] = useState(true);
  const activeCount = items.filter(i => selections.some(s => s.item_id === i.id)).length;
  const showContent = !collapsed || !!forceExpanded;

  return (
    <div className="mb-5">
      <button
        onClick={() => setCollapsed(c => !c)}
        className="flex items-center gap-2 w-full text-left mb-2 group"
      >
        <span className="text-xs font-bold uppercase tracking-wider text-gray-400 group-hover:text-gray-300 transition-colors">
          {label ?? `${capitalize(category)}s`}
        </span>
        {activeCount > 0 && (
          <span className="text-xs bg-arc-cyan/20 text-arc-cyan px-1.5 py-0.5 rounded-full border border-arc-cyan/50">
            {activeCount}
          </span>
        )}
        <span className={`ml-auto text-gray-500 text-xs inline-block transition-transform duration-150 ${showContent ? 'rotate-90' : ''}`}>▶</span>
      </button>

      {showContent && (
        <div className="space-y-2">
          {items.map(item => (
            <BlueprintCard
              key={item.id}
              item={item}
              selection={selections.find(s => s.item_id === item.id)}
              canCraft={itemAffordability[item.id] ?? false}
              onToggle={onToggle}
              onSetLevel={onSetLevel}
              onSetQuantity={onSetQuantity}
              onMarkCrafted={onMarkCrafted}
            />
          ))}
        </div>
      )}
    </div>
  );
}
