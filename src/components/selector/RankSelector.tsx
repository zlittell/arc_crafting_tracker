import { LEVEL_LABELS } from '../../lib/utils';

interface Props {
  availableLevels: number[];
  selectedLevel: number;
  onSetLevel: (level: number) => void;
}

export function RankSelector({ availableLevels, selectedLevel, onSetLevel }: Props) {
  return (
    <div className="flex items-center gap-1 mt-2">
      <span className="text-xs text-gray-500 mr-1">Target Level:</span>
      {availableLevels.map(level => (
        <button
          key={level}
          onClick={() => onSetLevel(level)}
          className={`w-8 h-7 text-xs font-semibold rounded transition-colors ${
            selectedLevel === level
              ? 'bg-arc-cyan/20 border border-arc-cyan text-arc-cyan'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          {LEVEL_LABELS[level] ?? level}
        </button>
      ))}
    </div>
  );
}
