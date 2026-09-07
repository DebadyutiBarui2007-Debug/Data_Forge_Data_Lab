/**
 * MatrixHeatmap Component
 * Renders a d x d matrix as an interactive, color-coded SVG heatmap.
 */

import React, { useState } from 'react';

interface MatrixHeatmapProps {
  matrix: number[][];
  title?: string;
  subtitle?: string;
  maxAbsValue?: number;
}

export const MatrixHeatmap: React.FC<MatrixHeatmapProps> = ({
  matrix,
  title = 'Hebbian Fast-Weight Matrix A_t',
  subtitle = 'd x d Synaptic Weights',
  maxAbsValue = 2.0
}) => {
  const [hoveredCell, setHoveredCell] = useState<{ r: number; c: number; val: number } | null>(null);

  if (!matrix || matrix.length === 0) return null;
  const rows = matrix.length;
  const cols = matrix[0].length;

  // Get color for a value: Green for positive, Purple/Amber for negative, Dark for near 0
  const getColor = (val: number) => {
    const norm = Math.min(1.0, Math.abs(val) / maxAbsValue);
    if (val > 0) {
      // Emerald / Cyan for positive Hebbian reinforcement
      return `rgba(16, 185, 129, ${0.15 + norm * 0.85})`;
    } else if (val < 0) {
      // Rose / Amber for inhibition
      return `rgba(244, 63, 94, ${0.15 + norm * 0.85})`;
    }
    return 'rgba(30, 41, 59, 0.4)';
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-lg flex flex-col items-center">
      <div className="w-full flex items-center justify-between mb-2">
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">{title}</h4>
          <p className="text-[11px] text-slate-400">{subtitle}</p>
        </div>
        {hoveredCell && (
          <div className="text-[11px] font-mono bg-slate-800 border border-slate-700 px-2 py-0.5 rounded text-emerald-400">
            A[{hoveredCell.r}][{hoveredCell.c}] = {hoveredCell.val.toFixed(3)}
          </div>
        )}
      </div>

      <div className="relative overflow-auto max-w-full p-2 bg-slate-950 rounded-lg border border-slate-800/80">
        <div
          className="grid gap-1"
          style={{
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`
          }}
        >
          {matrix.map((row, r) =>
            row.map((val, c) => (
              <div
                key={`${r}-${c}`}
                onMouseEnter={() => setHoveredCell({ r, c, val })}
                onMouseLeave={() => setHoveredCell(null)}
                className="w-5 h-5 md:w-6 md:h-6 rounded-sm transition-all duration-150 cursor-crosshair border border-slate-800/50 hover:scale-125 hover:z-10 hover:border-emerald-400 flex items-center justify-center"
                style={{ backgroundColor: getColor(val) }}
                title={`Row ${r}, Col ${c}: ${val.toFixed(4)}`}
              >
                {cols <= 8 && (
                  <span className="text-[8px] font-mono text-slate-200/80 select-none">
                    {Math.abs(val) > 0.1 ? val.toFixed(1) : ''}
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 text-[10px] text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-emerald-500/80 inline-block"></span>
          <span>Positive Hebbian Weight (+val)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-rose-500/80 inline-block"></span>
          <span>Inhibitory Weight (-val)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-slate-800 inline-block"></span>
          <span>Zero / Decay</span>
        </div>
      </div>
    </div>
  );
};
