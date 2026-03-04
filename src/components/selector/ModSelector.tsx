import { ITEM_REGISTRY } from '../../lib/loader';

interface Props {
  compatibleMods: string[];
  selectedModIds: string[];
  onToggleMod: (modId: string) => void;
}

export function ModSelector({ compatibleMods, selectedModIds, onToggleMod }: Props) {
  if (compatibleMods.length === 0) return null;

  return (
    <div className="mt-2">
      <span className="text-xs text-gray-500">Mods:</span>
      <div className="flex flex-wrap gap-1 mt-1">
        {compatibleMods.map(modId => {
          const mod = ITEM_REGISTRY.get(modId);
          if (!mod) return null;
          const isSelected = selectedModIds.includes(modId);
          return (
            <button
              key={modId}
              onClick={() => onToggleMod(modId)}
              className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${
                isSelected
                  ? 'bg-blue-600/30 border-blue-500 text-blue-300'
                  : 'bg-gray-800 border-gray-600 text-gray-400 hover:border-gray-500 hover:text-gray-300'
              }`}
            >
              {mod.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
