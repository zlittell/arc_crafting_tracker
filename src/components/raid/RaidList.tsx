import { useState } from 'react';
import type { ResolvedMaterial } from '../../types/resolver';

export interface RaidItem extends ResolvedMaterial {
  remaining: number;
}

interface Props {
  raidItems: RaidItem[];
}

export function RaidList({ raidItems }: Props) {
  const [skipped, setSkipped] = useState<Set<string>>(new Set());
  const [showSkipped, setShowSkipped] = useState(false);

  const activeItems = raidItems.filter(item => !skipped.has(item.material_id));
  const skippedItems = raidItems.filter(item => skipped.has(item.material_id));

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
    const text = activeItems.map(item => `${item.name} ×${item.remaining}`).join('\n');
    navigator.clipboard.writeText(text);
  }

  if (raidItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 py-20">
        <div className="text-4xl mb-4">✓</div>
        <p className="text-lg font-medium">You have everything you need!</p>
        <p className="text-sm mt-1">All materials are collected. Time to craft.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-700">
        <div>
          <span className="text-sm text-gray-400">{activeItems.length} materials to gather</span>
          <p className="text-xs text-gray-600 mt-0.5">Sorted by most needed first</p>
        </div>
        <button
          onClick={handleCopy}
          className="text-xs text-gray-400 hover:text-gray-200 px-3 py-2 sm:px-2 sm:py-1 rounded border border-gray-700 hover:border-gray-500 transition-colors"
        >
          Copy list
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Active items */}
        {activeItems.length === 0 ? (
          <div className="text-sm text-gray-500 px-3 py-4 text-center">
            All items skipped — expand the skipped section below to restore.
          </div>
        ) : (
          <div className="space-y-0.5">
            {activeItems.map(item => {
              const uniqueNames = [...new Set(item.sources.map(s => s.item_name))];
              const sourceDisplay =
                uniqueNames.slice(0, 2).join(', ') +
                (uniqueNames.length > 2 ? `, +${uniqueNames.length - 2} more` : '');

              return (
                <div
                  key={item.material_id}
                  className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-800/40 group"
                >
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-gray-200">{item.name}</span>
                    {sourceDisplay && (
                      <div className="text-xs text-gray-500 truncate mt-0.5">{sourceDisplay}</div>
                    )}
                  </div>
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
              );
            })}
          </div>
        )}

        {/* Skipped section */}
        {skippedItems.length > 0 && (
          <div className="mt-4 border-t border-gray-800 pt-3">
            <div className="flex items-center justify-between px-3 mb-1">
              <button
                onClick={() => setShowSkipped(s => !s)}
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors py-2 px-1"
              >
                <span className="text-gray-600">{showSkipped ? '▼' : '▶'}</span>
                Skipped ({skippedItems.length})
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
                {skippedItems.map(item => (
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
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
