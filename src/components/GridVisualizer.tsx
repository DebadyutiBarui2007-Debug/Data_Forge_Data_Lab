/**
 * GridVisualizer Component
 * Displays ARC-AGI / Sudoku grid states with live ground truth comparison and error highlighting.
 */

import React from 'react';

interface GridVisualizerProps {
  inputGrid: number[][];
  predictedGrid: number[][];
  targetGrid: number[][];
  title?: string;
  showComparison?: boolean;
}

const COLOR_MAP: Record<number, { bg: string; text: string; label: string }> = {
  0: { bg: 'bg-slate-900', text: 'text-slate-600', label: '0' },
  1: { bg: 'bg-blue-600', text: 'text-white', label: '1' },
  2: { bg: 'bg-emerald-500', text: 'text-slate-950', label: '2' },
  3: { bg: 'bg-amber-500', text: 'text-slate-950', label: '3' },
  4: { bg: 'bg-purple-600', text: 'text-white', label: '4' },
  5: { bg: 'bg-rose-600', text: 'text-white', label: '5' },
};

export const GridVisualizer: React.FC<GridVisualizerProps> = ({
  inputGrid,
  predictedGrid,
  targetGrid,
  title = 'ARC Spatial State Grid',
  showComparison = true
}) => {
  const rows = targetGrid.length;
  const cols = targetGrid[0].length;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-lg w-full">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3">{title}</h4>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        {/* Input Grid */}
        <div className="flex flex-col items-center bg-slate-950/80 p-3 rounded-lg border border-slate-800">
          <span className="text-[11px] font-medium text-slate-400 mb-2">Input Grid X</span>
          <div
            className="grid gap-1"
            style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
          >
            {inputGrid.map((row, r) =>
              row.map((cell, c) => (
                <div
                  key={`in-${r}-${c}`}
                  className={`w-7 h-7 md:w-8 md:h-8 rounded flex items-center justify-center font-mono text-xs font-bold shadow-inner ${
                    COLOR_MAP[cell]?.bg || 'bg-slate-800'
                  } ${COLOR_MAP[cell]?.text || 'text-slate-200'}`}
                >
                  {cell !== 0 ? cell : ''}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Live Model Prediction */}
        <div className="flex flex-col items-center bg-slate-950/80 p-3 rounded-lg border border-emerald-500/30">
          <div className="flex items-center gap-1.5 mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-[11px] font-medium text-emerald-400">Live Model Latent Prediction (Estimate)</span>
          </div>
          <div
            className="grid gap-1"
            style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
          >
            {predictedGrid.map((row, r) =>
              row.map((cell, c) => {
                const targetVal = targetGrid[r][c];
                const isMatch = cell === targetVal;
                return (
                  <div
                    key={`pred-${r}-${c}`}
                    className={`w-7 h-7 md:w-8 md:h-8 rounded flex items-center justify-center font-mono text-xs font-bold transition-all duration-200 relative ${
                      COLOR_MAP[cell]?.bg || 'bg-slate-800'
                    } ${COLOR_MAP[cell]?.text || 'text-slate-200'} ${
                      isMatch ? 'ring-2 ring-emerald-400/80' : 'ring-2 ring-rose-500/80 opacity-90'
                    }`}
                  >
                    {cell !== 0 ? cell : ''}
                    {!isMatch && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 border border-slate-950" />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Target Ground Truth */}
        {showComparison && (
          <div className="flex flex-col items-center bg-slate-950/80 p-3 rounded-lg border border-cyan-500/30">
            <span className="text-[11px] font-medium text-cyan-400 mb-2">Ground Truth Target Y</span>
            <div
              className="grid gap-1"
              style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
            >
              {targetGrid.map((row, r) =>
                row.map((cell, c) => (
                  <div
                    key={`tgt-${r}-${c}`}
                    className={`w-7 h-7 md:w-8 md:h-8 rounded flex items-center justify-center font-mono text-xs font-bold shadow-inner ${
                      COLOR_MAP[cell]?.bg || 'bg-slate-800'
                    } ${COLOR_MAP[cell]?.text || 'text-slate-200'}`}
                  >
                    {cell !== 0 ? cell : ''}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
