import { useState } from 'react';

interface Props {
  header: React.ReactNode;
  left: React.ReactNode;
  right: React.ReactNode;
  raid: React.ReactNode;
}

export function Layout({ header, left, right, raid }: Props) {
  const [activeTab, setActiveTab] = useState<'planner' | 'list' | 'raid'>('planner');
  const [activeRightTab, setActiveRightTab] = useState<'shopping' | 'raid'>('shopping');

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-gray-100">
      {header}
      <div className="flex flex-1 min-h-0">
        {/* Left panel - Craft planner */}
        <div className={`${activeTab === 'planner' ? 'flex' : 'hidden'} sm:flex w-full sm:w-80 lg:w-96 flex-col border-r border-gray-700 bg-gray-900 shrink-0`}>
          <div className="px-4 py-3 border-b border-gray-700">
            <h2 className="text-sm font-semibold text-gray-300">Craft Planner</h2>
            <p className="text-xs text-gray-500 mt-0.5">Choose blueprints, ranks, and mods</p>
          </div>
          <div className="flex-1 min-h-0 flex flex-col p-4">
            {left}
          </div>
        </div>

        {/* Right panel - Shopping list / Raid list */}
        <div className={`${activeTab === 'list' || activeTab === 'raid' ? 'flex' : 'hidden'} sm:flex flex-1 flex-col min-w-0 bg-gray-950`}>
          {/* Desktop tab strip */}
          <div className="px-6 py-0 border-b border-gray-700 flex items-end gap-0">
            <button
              onClick={() => { setActiveRightTab('shopping'); setActiveTab('list'); }}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeRightTab === 'shopping'
                  ? 'border-arc-cyan text-arc-cyan'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              Shopping List
            </button>
            <button
              onClick={() => { setActiveRightTab('raid'); setActiveTab('raid'); }}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeRightTab === 'raid'
                  ? 'border-arc-cyan text-arc-cyan'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              Raid List
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 sm:p-6">
            {activeRightTab === 'shopping' ? right : raid}
          </div>
        </div>
      </div>

      {/* Mobile tab bar */}
      <nav className="sm:hidden flex shrink-0 border-t border-gray-700 bg-gray-900">
        <button
          onClick={() => setActiveTab('planner')}
          className={`flex-1 py-3 text-sm font-medium transition-colors border-t-2 ${
            activeTab === 'planner'
              ? 'border-arc-cyan text-arc-cyan'
              : 'border-transparent text-gray-400'
          }`}
        >
          Craft Planner
        </button>
        <button
          onClick={() => { setActiveTab('list'); setActiveRightTab('shopping'); }}
          className={`flex-1 py-3 text-sm font-medium transition-colors border-t-2 ${
            activeTab === 'list'
              ? 'border-arc-cyan text-arc-cyan'
              : 'border-transparent text-gray-400'
          }`}
        >
          Shopping List
        </button>
        <button
          onClick={() => { setActiveTab('raid'); setActiveRightTab('raid'); }}
          className={`flex-1 py-3 text-sm font-medium transition-colors border-t-2 ${
            activeTab === 'raid'
              ? 'border-arc-cyan text-arc-cyan'
              : 'border-transparent text-gray-400'
          }`}
        >
          Raid List
        </button>
      </nav>
    </div>
  );
}
