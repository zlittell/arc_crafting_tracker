import { useState } from 'react';

export interface RaidSubIngredient {
  material_id: string;
  name: string;
  quantityPerRefine: number;
  totalNeeded: number;
  remaining: number;
}

export interface RaidCraftGroup {
  material_id: string;
  name: string;
  craftRemaining: number;
  subIngredients: RaidSubIngredient[];
}

export interface RaidDirectItem {
  material_id: string;
  name: string;
  remaining: number;
}

export interface RaidData {
  directGather: RaidDirectItem[];
  craftGroups: RaidCraftGroup[];
}

interface Props {
  raidData: RaidData;
}

export function RaidList({ raidData }: Props) {
  const [skipped, setSkipped] = useState<Set<string>>(new Set());
  const [showSkipped, setShowSkipped] = useState(false);

  const { directGather, craftGroups } = raidData;

  const activeGather = directGather.filter(item => !skipped.has(item.material_id));
  const activeGroups = craftGroups.filter(g => !skipped.has(g.material_id));
  const skippedGather = directGather.filter(item => skipped.has(item.material_id));
  const skippedGroups = craftGroups.filter(g => skipped.has(g.material_id));
  const skippedCount = skippedGather.length + skippedGroups.length;

  const isEmpty = directGather.length === 0 && craftGroups.length === 0;
  const allActive = activeGather.length === 0 && activeGroups.length === 0;

  function skip(id: string) {
    setSkipped(prev => new Set([...prev, id]));
  }

  function restore(id: string) {
    setSkipped(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }

  function restoreAll() {
    setSkipped(new Set());
    setShowSkipped(false);
  }

  function handleCopy() {
    const lines: string[] = [];
    for (const item of activeGather) {
      lines.push(`${item.name} ×${item.remaining}`);
    }
    for (const group of activeGroups) {
      lines.push(`[Craft: ${group.name} ×${group.craftRemaining}]`);
      for (const ing of group.subIngredients) {
        lines.push(`  ${ing.name} ×${ing.totalNeeded} (×${ing.quantityPerRefine}/refine)`);
      }
    }
    navigator.clipboard.writeText(lines.join('\n'));
  }

  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 py-20">
        <div className="text-4xl mb-4">✓</div>
        <p className="text-lg font-medium">You have everything you need!</p>
        <p className="text-sm mt-1">All materials are collected. Time to craft.</p>
      </div>
    );
  }

  const totalActiveCount = activeGather.length + activeGroups.length;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-700">
        <div>
          <span className="text-sm text-gray-400">{totalActiveCount} items to find</span>
          <p className="text-xs text-gray-600 mt-0.5">Gather items and craft groups</p>
        </div>
        <button
          onClick={handleCopy}
          className="text-xs text-gray-400 hover:text-gray-200 px-3 py-2 sm:px-2 sm:py-1 rounded border border-gray-700 hover:border-gray-500 transition-colors"
        >
          Copy list
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {allActive ? (
          <div className="text-sm text-gray-500 px-3 py-4 text-center">
            All items skipped — expand the skipped section below to restore.
          </div>
        ) : (
          <>
            {/* Direct gather section */}
            {activeGather.length > 0 && (
              <div className="mb-4">
                <div className="px-3 mb-1">
                  <span className="text-xs text-gray-500 uppercase tracking-wider">Gather</span>
                </div>
                <div className="space-y-0.5">
                  {activeGather.map(item => (
                    <div
                      key={item.material_id}
                      className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-800/40 group"
                    >
                      <span className="flex-1 text-sm font-medium text-gray-200">{item.name}</span>
                      <span className="text-sm font-mono text-arc-yellow whitespace-nowrap">
                        ×{item.remaining}
                      </span>
                      <button
                        onClick={() => skip(item.material_id)}
                        title="Skip this item for this raid"
                        className="w-10 h-10 sm:w-7 sm:h-7 flex items-center justify-center rounded-lg sm:rounded bg-gray-800/60 sm:bg-transparent text-gray-500 hover:text-gray-200 transition-colors shrink-0"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Craft groups section */}
            {activeGroups.length > 0 && (
              <div className="mb-4">
                <div className="px-3 mb-1">
                  <span className="text-xs text-gray-500 uppercase tracking-wider">Craft / Refine</span>
                </div>
                <div className="space-y-3">
                  {activeGroups.map(group => (
                    <div key={group.material_id} className="rounded-lg border border-gray-700/60 overflow-hidden">
                      {/* Group header */}
                      <div className="flex items-center gap-3 px-3 py-2 bg-gray-800/40">
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-semibold text-gray-200">{group.name}</span>
                          <span className="ml-2 text-xs text-gray-500">×{group.craftRemaining} to craft</span>
                        </div>
                        <button
                          onClick={() => skip(group.material_id)}
                          title="Skip this group for this raid"
                          className="w-10 h-10 sm:w-7 sm:h-7 flex items-center justify-center rounded-lg sm:rounded bg-gray-800/60 sm:bg-transparent text-gray-500 hover:text-gray-200 transition-colors shrink-0"
                        >
                          ×
                        </button>
                      </div>
                      {/* Sub-ingredients */}
                      <div className="divide-y divide-gray-800/60">
                        {group.subIngredients.map(ing => (
                          <div
                            key={ing.material_id}
                            className="flex items-center gap-3 px-3 py-1.5 pl-5"
                          >
                            <span className="flex-1 text-sm text-gray-300">{ing.name}</span>
                            <span className="text-sm font-mono text-arc-yellow whitespace-nowrap">
                              ×{ing.totalNeeded}
                            </span>
                            <span className="text-xs text-gray-600 whitespace-nowrap">
                              ×{ing.quantityPerRefine}/refine
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Skipped section */}
        {skippedCount > 0 && (
          <div className="mt-4 border-t border-gray-800 pt-3">
            <div className="flex items-center justify-between px-3 mb-1">
              <button
                onClick={() => setShowSkipped(s => !s)}
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors py-2 px-1"
              >
                <span className="text-gray-600">{showSkipped ? '▼' : '▶'}</span>
                Skipped ({skippedCount})
              </button>
              <button
                onClick={restoreAll}
                className="text-xs text-gray-500 hover:text-gray-300 transition-colors px-3 py-2 sm:px-2 sm:py-1"
              >
                Restore all
              </button>
            </div>

            {showSkipped && (
              <div className="space-y-0.5">
                {skippedGather.map(item => (
                  <div
                    key={item.material_id}
                    className="flex items-center gap-3 px-3 py-1.5 rounded"
                  >
                    <span className="flex-1 text-sm text-gray-600 truncate">{item.name}</span>
                    <span className="text-sm font-mono text-gray-600 whitespace-nowrap">
                      ×{item.remaining}
                    </span>
                    <button
                      onClick={() => restore(item.material_id)}
                      title="Restore to active list"
                      className="w-10 h-10 sm:w-7 sm:h-7 flex items-center justify-center rounded-lg sm:rounded bg-gray-800/60 sm:bg-transparent text-gray-600 hover:text-gray-300 transition-colors shrink-0"
                    >
                      ↩
                    </button>
                  </div>
                ))}
                {skippedGroups.map(group => (
                  <div
                    key={group.material_id}
                    className="flex items-center gap-3 px-3 py-1.5 rounded"
                  >
                    <span className="flex-1 text-sm text-gray-600 truncate">
                      {group.name} <span className="text-gray-700">×{group.craftRemaining}</span>
                    </span>
                    <button
                      onClick={() => restore(group.material_id)}
                      title="Restore to active list"
                      className="w-10 h-10 sm:w-7 sm:h-7 flex items-center justify-center rounded-lg sm:rounded bg-gray-800/60 sm:bg-transparent text-gray-600 hover:text-gray-300 transition-colors shrink-0"
                    >
                      ↩
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
