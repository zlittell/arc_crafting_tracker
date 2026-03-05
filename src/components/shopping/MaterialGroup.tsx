import type { ResolvedMaterial } from '../../types/resolver';
import { MaterialRow } from './MaterialRow';

interface Props {
  label: string;
  materials: ResolvedMaterial[];
  collected: Record<string, number>;
  expandAll: boolean;
  onSetCollected: (materialId: string, count: number) => void;
  onRefineMaterial: (materialId: string) => void;
}

export function MaterialGroup({ label, materials, collected, expandAll, onSetCollected, onRefineMaterial }: Props) {
  const completedCount = materials.filter(m => (collected[m.material_id] ?? 0) >= m.quantity).length;

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-1 px-1">
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-700 text-gray-300">
          {label}
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
            allCollected={collected}
            expandAll={expandAll}
            onSetCollected={onSetCollected}
            onRefineMaterial={onRefineMaterial}
          />
        ))}
      </div>
    </div>
  );
}
