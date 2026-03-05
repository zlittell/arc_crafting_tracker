import { useState } from 'react';
import type { Item } from '../../types/item';
import type { LoadoutSelection } from '../../types/resolver';
import { BlueprintCard } from './BlueprintCard';
import { capitalize } from '../../lib/utils';

interface Props {
  category: string;
  items: Item[];
  selections: LoadoutSelection[];
  forceExpanded?: boolean;
  onToggle: (itemId: string) => void;
  onSetLevel: (itemId: string, level: number) => void;
  onSetQuantity: (itemId: string, qty: number) => void;
  onMarkCrafted: (itemId: string) => void;
}

export function CategorySection({ category, items, selections, forceExpanded, onToggle, onSetLevel, onSetQuantity, onMarkCrafted }: Props) {
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
          {capitalize(category)}s
        </span>
        {activeCount > 0 && (
          <span className="text-xs bg-blue-600/30 text-blue-400 px-1.5 py-0.5 rounded-full border border-blue-600/50">
            {activeCount}
          </span>
        )}
        <span className="ml-auto text-gray-600 text-xs">{showContent ? '▼' : '▶'}</span>
      </button>

      {showContent && (
        <div className="space-y-2">
          {items.map(item => (
            <BlueprintCard
              key={item.id}
              item={item}
              selection={selections.find(s => s.item_id === item.id)}
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
