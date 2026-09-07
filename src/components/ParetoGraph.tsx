/**
 * ParetoGraph Component
 * Real-time Latency vs Compute-Efficiency Pareto Frontier visualization for BDH-CQ vs CoT.
 * Dynamic visual update as the user manipulates the 'Latent Compute Steps' slider (k = 1..15).
 */

import React from 'react';
import { ARCGridPuzzle } from '../types';
import { Sparkles, Zap, Activity, Cpu } from 'lucide-react';

interface ParetoGraphProps {
  activeK: number;
  puzzle: ARCGridPuzzle;
  reasoningMode: 'latent-bdhcq' | 'cot-tokens';
  onKChange?: (k: number) => void;
}

export const ParetoGraph: React.FC<ParetoGraphProps> = ({
  activeK,
  puzzle,
  reasoningMode,
  onKChange
}) => {
  const maxK = 15;

  // Generate data points for k = 1..15
  const bdhPoints = Array.from({ length: maxK }, (_, i) => {
    const k = i + 1;
    const convergenceFactor = Math.min(1.0, k / puzzle.minRecurrentStepsNeeded);
    // Deterministic estimate for graph display
    const accuracy = Math.min(100, Math.round(30 + convergenceFactor * 70));
    const latencyMs = Number((k * 1.8).toFixed(1));
    const flopsG = Number((k * 0.05).toFixed(2));
    // Compute Efficiency = Accuracy / Latency (Higher is better)
    const efficiency = Number((accuracy / Math.max(1, latencyMs)).toFixed(1));
    return { k, accuracy, latencyMs, flopsG, efficiency };
  });

  const cotPoints = Array.from({ length: maxK }, (_, i) => {
    const k = i + 1;
    const convergenceFactor = Math.min(1.0, k / puzzle.minRecurrentStepsNeeded);
    const accuracy = Math.min(100, Math.round(30 + convergenceFactor * 70));
    const tokensPerStep = Math.round(puzzle.cotTokenCost / puzzle.minRecurrentStepsNeeded);
    const tokens = k * tokensPerStep;
    const latencyMs = Number((tokens * 12.5).toFixed(1));
    const flopsG = Number((tokens * 0.8).toFixed(2));
    const efficiency = Number((accuracy / Math.max(1, latencyMs)).toFixed(2));
    return { k, accuracy, tokens, latencyMs, flopsG, efficiency };
  });

  const activeBDH = bdhPoints[Math.min(activeK - 1, maxK - 1)];
  const activeCoT = cotPoints[Math.min(activeK - 1, maxK - 1)];

  // SVG Chart bounds
  const svgWidth = 480;
  const svgHeight = 200;
  const padding = { top: 20, right: 30, bottom: 40, left: 50 };
  const graphWidth = svgWidth - padding.left - padding.right;
  const graphHeight = svgHeight - padding.top - padding.bottom;

  // X axis scale: Latency (0 ms to 35 ms for BDH-CQ, up to 2000 ms for CoT)
  const maxBdhLatency = bdhPoints[maxK - 1].latencyMs * 1.15; // ~31 ms
  const maxAccuracy = 100;

  const getX = (latencyMs: number) => {
    // Log scale or clamped linear scale for clear rendering
    const clampedLat = Math.min(latencyMs, maxBdhLatency);
    return padding.left + (clampedLat / maxBdhLatency) * graphWidth;
  };

  const getY = (accuracy: number) => {
    return padding.top + graphHeight - (accuracy / maxAccuracy) * graphHeight;
  };

  // BDH Polyline points
  const bdhPolyline = bdhPoints
    .map(p => `${getX(p.latencyMs)},${getY(p.accuracy)}`)
    .join(' ');

  // Active step coordinates
  const activeX = getX(activeBDH.latencyMs);
  const activeY = getY(activeBDH.accuracy);

  return (
    <div className="bg-[#0D0D0D] border border-neutral-800 rounded-2xl p-5 shadow-xl space-y-4">
      
      {/* Chart Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded bg-orange-950/30 border border-orange-900/40 text-orange-400">
              <Zap className="w-4 h-4" />
            </span>
            <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-200 font-mono">
              Real-time Pareto Frontier: Latency vs. Accuracy Efficiency
            </h4>
          </div>
          <p className="text-[11px] text-neutral-400 mt-0.5">
            Dynamic curve update as slider moves: <span className="font-mono text-orange-400 font-bold">k = {activeK} Latent Recurrent Steps</span>
          </p>
        </div>

        <div className="flex items-center gap-3 font-mono text-[10px]">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(234,88,12,0.8)]"></span>
            <span className="text-orange-400 font-bold">BDH-CQ (Pareto Optimal)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <span className="text-rose-400">CoT Baseline</span>
          </div>
        </div>
      </div>

      {/* SVG Scatter & Line Plot */}
      <div className="relative bg-[#050505] p-3 rounded-xl border border-neutral-800 overflow-x-auto flex flex-col items-center">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full max-w-[520px] h-auto overflow-visible"
        >
          {/* Background Grid Lines */}
          {[25, 50, 75, 100].map(acc => (
            <g key={acc}>
              <line
                x1={padding.left}
                y1={getY(acc)}
                x2={svgWidth - padding.right}
                y2={getY(acc)}
                stroke="#262626"
                strokeDasharray="2,2"
                strokeWidth="1"
              />
              <text
                x={padding.left - 8}
                y={getY(acc) + 3}
                fill="#737373"
                fontSize="8"
                fontFamily="monospace"
                textAnchor="end"
              >
                {acc}%
              </text>
            </g>
          ))}

          {/* X Axis Latency Labels */}
          {[0, 5, 10, 15, 20, 25, 30].map(lat => (
            <g key={lat}>
              <line
                x1={getX(lat)}
                y1={padding.top}
                x2={getX(lat)}
                y2={svgHeight - padding.bottom}
                stroke="#1f1f1f"
                strokeWidth="1"
              />
              <text
                x={getX(lat)}
                y={svgHeight - padding.bottom + 14}
                fill="#737373"
                fontSize="8"
                fontFamily="monospace"
                textAnchor="middle"
              >
                {lat}ms
              </text>
            </g>
          ))}

          {/* Axis Labels */}
          <text
            x={svgWidth / 2}
            y={svgHeight - 6}
            fill="#a3a3a3"
            fontSize="9"
            fontFamily="monospace"
            textAnchor="middle"
            fontWeight="bold"
          >
            Inference Latency (ms) →
          </text>
          <text
            x={14}
            y={svgHeight / 2}
            fill="#a3a3a3"
            fontSize="9"
            fontFamily="monospace"
            textAnchor="middle"
            transform={`rotate(-90 14 ${svgHeight / 2})`}
            fontWeight="bold"
          >
            Constraint Accuracy (%) ↑
          </text>

          {/* Shaded Pareto Dominance Region under BDH Curve */}
          <polygon
            points={`${padding.left},${svgHeight - padding.bottom} ${bdhPolyline} ${getX(bdhPoints[maxK - 1].latencyMs)},${svgHeight - padding.bottom}`}
            fill="url(#orangeGlow)"
            opacity="0.25"
          />

          <defs>
            <linearGradient id="orangeGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ea580c" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#ea580c" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* BDH-CQ Pareto Curve Line */}
          <polyline
            fill="none"
            stroke="#ea580c"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={bdhPolyline}
          />

          {/* BDH-CQ Points */}
          {bdhPoints.map(p => {
            const px = getX(p.latencyMs);
            const py = getY(p.accuracy);
            const isActive = p.k === activeK;
            return (
              <circle
                key={p.k}
                cx={px}
                cy={py}
                r={isActive ? 6 : 3}
                fill={isActive ? '#f97316' : '#ea580c'}
                stroke={isActive ? '#ffffff' : '#7c2d12'}
                strokeWidth={isActive ? 2 : 1}
                className="cursor-pointer transition-all duration-200 hover:r-7"
                onClick={() => onKChange && onKChange(p.k)}
              >
                <title>{`Step k=${p.k}: Latency ${p.latencyMs}ms, Accuracy ${p.accuracy}%`}</title>
              </circle>
            );
          })}

          {/* Active Highlight Ring on current slider k */}
          <circle
            cx={activeX}
            cy={activeY}
            r={11}
            fill="none"
            stroke="#f97316"
            strokeWidth="1.5"
            strokeDasharray="3,2"
            className="animate-spin origin-center"
            style={{ transformOrigin: `${activeX}px ${activeY}px` }}
          />

          {/* Active Point Callout Box */}
          <g transform={`translate(${Math.min(activeX + 10, svgWidth - 130)}, ${Math.max(activeY - 35, padding.top + 5)})`}>
            <rect
              width="110"
              height="28"
              rx="4"
              fill="#0d0d0d"
              stroke="#ea580c"
              strokeWidth="1"
            />
            <text x="6" y="12" fill="#f97316" fontSize="8" fontFamily="monospace" fontWeight="bold">
              k = {activeBDH.k} Step ({activeBDH.latencyMs}ms)
            </text>
            <text x="6" y="22" fill="#22c55e" fontSize="8" fontFamily="monospace">
              Acc: {activeBDH.accuracy}% ({activeBDH.efficiency} Acc/ms)
            </text>
          </g>
        </svg>
      </div>

      {/* Real-time Metric Comparison Cards for Active Step k */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-[#050505] p-3 rounded-xl border border-neutral-800">
          <span className="text-[10px] text-neutral-500 uppercase font-mono block">Active BDH-CQ Latency</span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-lg font-bold font-mono text-orange-400">{activeBDH.latencyMs} ms</span>
            <span className="text-[10px] text-orange-500 font-mono">0 Tokens</span>
          </div>
        </div>

        <div className="bg-[#050505] p-3 rounded-xl border border-neutral-800">
          <span className="text-[10px] text-neutral-500 uppercase font-mono block">CoT Baseline Latency</span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-lg font-bold font-mono text-rose-400">{activeCoT.latencyMs} ms</span>
            <span className="text-[10px] text-neutral-500 font-mono">({activeCoT.tokens} tokens)</span>
          </div>
        </div>

        <div className="bg-[#050505] p-3 rounded-xl border border-orange-900/40">
          <span className="text-[10px] text-orange-400 font-bold uppercase font-mono block">Pareto Speedup Factor</span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-lg font-bold font-mono text-green-400">
              {(activeCoT.latencyMs / Math.max(0.1, activeBDH.latencyMs)).toFixed(0)}x Faster
            </span>
            <span className="text-[10px] text-green-500 font-mono font-bold">Optimal</span>
          </div>
        </div>
      </div>

    </div>
  );
};
