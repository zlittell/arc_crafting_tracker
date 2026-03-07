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

export function MaterialGroup({ label: _label, materials, collected, expandAll, onSetCollected, onRefineMaterial }: Props) {
  return (
    <div className="mb-4">
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
