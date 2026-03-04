interface Props {
  header: React.ReactNode;
  left: React.ReactNode;
  right: React.ReactNode;
}

export function Layout({ header, left, right }: Props) {
  return (
    <div className="flex flex-col h-screen bg-gray-950 text-gray-100">
      {header}
      <div className="flex flex-1 min-h-0">
        {/* Left panel - Loadout selector */}
        <div className="w-full sm:w-80 lg:w-96 flex flex-col border-r border-gray-700 bg-gray-900 shrink-0">
          <div className="px-4 py-3 border-b border-gray-700">
            <h2 className="text-sm font-semibold text-gray-300">Loadout Selector</h2>
            <p className="text-xs text-gray-500 mt-0.5">Choose blueprints, ranks, and mods</p>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {left}
          </div>
        </div>

        {/* Right panel - Shopping list */}
        <div className="flex-1 flex flex-col min-w-0 bg-gray-950">
          <div className="px-6 py-3 border-b border-gray-700">
            <h2 className="text-sm font-semibold text-gray-300">Shopping List</h2>
            <p className="text-xs text-gray-500 mt-0.5">Materials needed to craft your loadout</p>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            {right}
          </div>
        </div>
      </div>
    </div>
  );
}
