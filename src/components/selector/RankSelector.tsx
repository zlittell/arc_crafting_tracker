import { RANK_LABELS } from '../../lib/utils';

interface Props {
  availableRanks: number[];
  selectedRank: number;
  onSetRank: (rank: number) => void;
}

export function RankSelector({ availableRanks, selectedRank, onSetRank }: Props) {
  return (
    <div className="flex items-center gap-1 mt-2">
      <span className="text-xs text-gray-500 mr-1">Target Rank:</span>
      {availableRanks.map(rank => (
        <button
          key={rank}
          onClick={() => onSetRank(rank)}
          className={`w-8 h-7 text-xs font-semibold rounded transition-colors ${
            selectedRank === rank
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          {RANK_LABELS[rank] ?? rank}
        </button>
      ))}
    </div>
  );
}
