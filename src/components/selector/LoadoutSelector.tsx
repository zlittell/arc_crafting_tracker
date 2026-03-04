import type { LoadoutSelection } from '../../types/resolver';
import { BLUEPRINT_REGISTRY } from '../../lib/loader';
import { CategorySection } from './CategorySection';
import { groupBy } from '../../lib/utils';

interface Props {
  selections: LoadoutSelection[];
  onToggle: (blueprintId: string) => void;
  onSetRank: (blueprintId: string, rank: number) => void;
  onToggleMod: (blueprintId: string, modId: string) => void;
}

const CATEGORY_ORDER = ['weapon', 'armor', 'tool'];

export function LoadoutSelector({ selections, onToggle, onSetRank, onToggleMod }: Props) {
  const blueprints = Array.from(BLUEPRINT_REGISTRY.values());
  const grouped = groupBy(blueprints, b => b.category);

  const orderedCategories = [
    ...CATEGORY_ORDER.filter(c => grouped[c]),
    ...Object.keys(grouped).filter(c => !CATEGORY_ORDER.includes(c)),
  ];

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
          onToggleMod={onToggleMod}
        />
      ))}
    </div>
  );
}
