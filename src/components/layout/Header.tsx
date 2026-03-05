export function Header() {
  return (
    <header className="flex items-center px-6 py-3 bg-gray-900 border-b border-gray-700 shrink-0">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-bold text-white tracking-tight">
          Arc Raiders Crafting Tracker
        </h1>
        <span className="text-xs text-gray-500 hidden sm:block">Arc Raiders crafting planner</span>
      </div>
    </header>
  );
}
