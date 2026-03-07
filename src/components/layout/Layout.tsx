import { useState } from 'react';

interface Props {
  header: React.ReactNode;
  left: React.ReactNode;
  right: React.ReactNode;
  raid: React.ReactNode;
}

function CraftIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l5.654-4.654m5.65-5.65 3.029-2.497a1.5 1.5 0 0 1 2.122 2.122l-2.498 3.029m-5.652 5.652L6.27 9.77m5.652 5.651-5.652-5.651" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z" />
    </svg>
  );
}

function RaidIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" strokeLinecap="round" />
      <circle cx="12" cy="12" r="3.5" strokeLinecap="round" />
      <path strokeLinecap="round" d="M12 2.25v3M12 18.75v3M2.25 12h3M18.75 12h3" />
    </svg>
  );
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
          {/* Desktop-only tab strip */}
          <div className="hidden sm:flex px-6 py-0 border-b border-gray-700 items-end gap-0">
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

      {/* Mobile tab bar — icons + short labels */}
      <nav className="sm:hidden flex shrink-0 border-t border-gray-700 bg-gray-900">
        <button
          onClick={() => setActiveTab('planner')}
          className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-colors border-t-2 ${
            activeTab === 'planner'
              ? 'border-arc-cyan text-arc-cyan'
              : 'border-transparent text-gray-500'
          }`}
        >
          <CraftIcon />
          <span className="text-xs font-medium">Craft</span>
        </button>
        <button
          onClick={() => { setActiveTab('list'); setActiveRightTab('shopping'); }}
          className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-colors border-t-2 ${
            activeTab === 'list'
              ? 'border-arc-cyan text-arc-cyan'
              : 'border-transparent text-gray-500'
          }`}
        >
          <ListIcon />
          <span className="text-xs font-medium">List</span>
        </button>
        <button
          onClick={() => { setActiveTab('raid'); setActiveRightTab('raid'); }}
          className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-colors border-t-2 ${
            activeTab === 'raid'
              ? 'border-arc-cyan text-arc-cyan'
              : 'border-transparent text-gray-500'
          }`}
        >
          <RaidIcon />
          <span className="text-xs font-medium">Raid</span>
        </button>
      </nav>
    </div>
  );
}
