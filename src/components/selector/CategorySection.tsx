import { useState } from 'react';
import type { Blueprint } from '../../types/blueprint';
import type { LoadoutSelection } from '../../types/resolver';
import { BlueprintCard } from './BlueprintCard';
import { capitalize } from '../../lib/utils';

interface Props {
  category: string;
  blueprints: Blueprint[];
  selections: LoadoutSelection[];
  onToggle: (blueprintId: string) => void;
  onSetRank: (blueprintId: string, rank: number) => void;
  onSetQuantity: (blueprintId: string, qty: number) => void;
  onMarkCrafted: (blueprintId: string) => void;
}

export function CategorySection({ category, blueprints, selections, onToggle, onSetRank, onSetQuantity, onMarkCrafted }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const activeCount = blueprints.filter(b => selections.some(s => s.blueprint_id === b.id)).length;

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
        <span className="ml-auto text-gray-600 text-xs">{collapsed ? '▶' : '▼'}</span>
      </button>

      {!collapsed && (
        <div className="space-y-2">
          {blueprints.map(blueprint => (
            <BlueprintCard
              key={blueprint.id}
              blueprint={blueprint}
              selection={selections.find(s => s.blueprint_id === blueprint.id)}
              onToggle={onToggle}
              onSetRank={onSetRank}
              onSetQuantity={onSetQuantity}
              onMarkCrafted={onMarkCrafted}
            />
          ))}
        </div>
      )}
    </div>
  );
}
