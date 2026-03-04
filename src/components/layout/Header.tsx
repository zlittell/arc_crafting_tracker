import type { ResolutionMode } from '../../types/resolver';

interface Props {
  mode: ResolutionMode;
  onSetMode: (mode: ResolutionMode) => void;
}

export function Header({ mode, onSetMode }: Props) {
  return (
    <header className="flex items-center justify-between px-6 py-3 bg-gray-900 border-b border-gray-700 shrink-0">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-bold text-white tracking-tight">
          Arc Craft Tracker
        </h1>
        <span className="text-xs text-gray-500 hidden sm:block">Arc Raiders loadout planner</span>
      </div>

      {/* Mode toggle */}
      <div className="flex items-center gap-1 bg-gray-800 rounded-lg p-1 border border-gray-700">
        <button
          onClick={() => onSetMode('craftable')}
          className={`text-xs px-3 py-1 rounded-md transition-colors font-medium ${
            mode === 'craftable'
              ? 'bg-blue-600 text-white'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Craftable
        </button>
        <button
          onClick={() => onSetMode('raw')}
          className={`text-xs px-3 py-1 rounded-md transition-colors font-medium ${
            mode === 'raw'
              ? 'bg-blue-600 text-white'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Raw Materials
        </button>
      </div>
    </header>
  );
}
