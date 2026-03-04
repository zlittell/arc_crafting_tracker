import type { ResolvedMaterial } from '../../types/resolver';
import { MaterialRow } from './MaterialRow';
import { rarityBadgeColor, capitalize } from '../../lib/utils';

interface Props {
  rarity: string;
  materials: ResolvedMaterial[];
  collected: Record<string, number>;
  onSetCollected: (materialId: string, count: number) => void;
}

export function MaterialGroup({ rarity, materials, collected, onSetCollected }: Props) {
  const completedCount = materials.filter(m => (collected[m.material_id] ?? 0) >= m.quantity).length;

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-1 px-1">
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${rarityBadgeColor(rarity)}`}>
          {capitalize(rarity)}
        </span>
        <span className="text-xs text-gray-500">
          {completedCount}/{materials.length}
        </span>
      </div>
      <div className="rounded-lg border border-gray-700 bg-gray-800/50 divide-y divide-gray-700/50">
        {materials.map(material => (
          <MaterialRow
            key={material.material_id}
            material={material}
            collected={collected[material.material_id] ?? 0}
            onSetCollected={onSetCollected}
          />
        ))}
      </div>
    </div>
  );
}
