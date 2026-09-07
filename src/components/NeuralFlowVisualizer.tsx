/**
 * NeuralFlowVisualizer Component
 * High-fidelity real-time data flow visualization for Pathway's Dragon Hatchling (BDH) layer.
 * Maps data flow through token projections, 5% sparse activation gates, Hebbian fast-weight matrices,
 * and recurrent latent loops — strictly differentiating between active and inactive synapses.
 */

import React, { useState, useEffect } from 'react';
import { Activity, Cpu, Play, Pause, RefreshCw, Zap, ShieldCheck, AlertTriangle, Eye, Layers } from 'lucide-react';
import { TermTooltip } from './TermExplorer';

interface Synapse {
  id: string;
  fromIndex: number;
  toIndex: number;
  isActive: boolean;
  weight: number;
  firingIntensity: number;
}

interface NeuralFlowVisualizerProps {
  onOpenExplorer?: (termKey: string) => void;
}

export const NeuralFlowVisualizer: React.FC<NeuralFlowVisualizerProps> = ({ onOpenExplorer }) => {
  const nodeCount = 10; // 10-dimensional representation for visual clarity
  const [isPlaying, setIsPlaying] = useState(true);
  const [pulseStep, setPulseStep] = useState(0);
  const [sparsityPercent, setSparsityPercent] = useState(5); // 5% BDH default
  const [recurrentK, setRecurrentK] = useState(3);
  const [synapseFilter, setSynapseFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedSynapse, setSelectedSynapse] = useState<Synapse | null>(null);

  // Animation ticker for pulse flow
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setPulseStep((prev) => (prev + 1) % 100);
    }, 40);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Compute active neuron indices based on top-k sparsity
  const activeCount = Math.max(1, Math.round((nodeCount * sparsityPercent) / 100));
  
  // Deterministic seed pattern for demo nodes firing
  const activeIndices = Array.from({ length: nodeCount }, (_, i) => i)
    .sort((a, b) => ((a * 7 + pulseStep) % 13) - ((b * 7 + pulseStep) % 13))
    .slice(0, activeCount);

  // Generate 10x10 = 100 synapses between Query nodes (q) and Key nodes (k)
  const synapses: Synapse[] = [];
  for (let q = 0; q < nodeCount; q++) {
    for (let k = 0; k < nodeCount; k++) {
      const qActive = activeIndices.includes(q);
      const kActive = activeIndices.includes(k);
      // Both source and target must be active for Hebbian synaptic binding to fire
      const isActive = qActive && kActive;
      
      // Pseudo-random deterministic weight based on indices
      const rawWeight = Number((0.2 + ((q * 3 + k * 5) % 80) / 100).toFixed(2));
      const firingIntensity = isActive ? Number((0.7 + ((pulseStep + q + k) % 30) / 100).toFixed(2)) : 0.05;

      synapses.push({
        id: `syn-${q}-${k}`,
        fromIndex: q,
        toIndex: k,
        isActive,
        weight: rawWeight,
        firingIntensity
      });
    }
  }

  const activeSynapseCount = synapses.filter((s) => s.isActive).length;
  const inactiveSynapseCount = synapses.length - activeSynapseCount;
  const crosstalkRisk = Number(Math.min(99.9, (sparsityPercent / 100) ** 2 * 100).toFixed(1));

  return (
    <div className="bg-[#080B10] border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
      
      {/* Header & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Cpu className="w-5 h-5" />
            </span>
            <h3 className="text-sm font-bold font-mono text-slate-100 uppercase tracking-widest">
              Dragon Hatchling Layer: Real-Time Synaptic Neural Flow
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Mapping forward signal propagation through <TermTooltip termKey="sparse-activation" onOpenExplorer={onOpenExplorer}>5% Sparse ReLU</TermTooltip>, <TermTooltip termKey="hebbian-writes" onOpenExplorer={onOpenExplorer}>Hebbian Fast-Weight</TermTooltip> matrices ($A_t$), and <TermTooltip termKey="latent-recurrence" onOpenExplorer={onOpenExplorer}>Latent Recurrence</TermTooltip>.
          </p>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold flex items-center gap-1.5 transition ${
              isPlaying
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
            }`}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {isPlaying ? 'Pause Neural Pulse' : 'Resume Pulse'}
          </button>
          <button
            onClick={() => setPulseStep(0)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            title="Reset pulse step"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Interactive Control Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-950/70 p-4 rounded-xl border border-slate-800/80">
        
        {/* Sparsity Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-slate-300 font-bold flex items-center gap-1">
              Top-K Sparsity: <span className="text-emerald-400">{sparsityPercent}%</span>
            </span>
            <span className="text-[10px] text-slate-400">
              {sparsityPercent === 5 ? '(BDH Default)' : sparsityPercent > 20 ? '(High Crosstalk)' : ''}
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="100"
            step="1"
            value={sparsityPercent}
            onChange={(e) => setSparsityPercent(Number(e.target.value))}
            className="w-full accent-emerald-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[9px] font-mono text-slate-400">
            <span>1% (Hyper-sparse)</span>
            <span>5% BDH</span>
            <span>100% (Dense Transformer)</span>
          </div>
        </div>

        {/* Latent Recurrence Steps */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-slate-300 font-bold">
              Latent Steps ($k$): <span className="text-cyan-400">{recurrentK}</span>
            </span>
            <span className="text-[10px] text-cyan-500 font-bold">0 Tokens</span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            step="1"
            value={recurrentK}
            onChange={(e) => setRecurrentK(Number(e.target.value))}
            className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[9px] font-mono text-slate-400">
            <span>k=1 (Single pass)</span>
            <span>k=5 (ARC Solver)</span>
            <span>k=10 (Sudoku Extreme)</span>
          </div>
        </div>

        {/* Synapse View Filter Toggle */}
        <div className="space-y-1.5">
          <span className="text-xs font-mono font-bold text-slate-300 block">
            Synapse Visibility Filter:
          </span>
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setSynapseFilter('all')}
              className={`flex-1 py-1 rounded text-[10px] font-mono transition ${
                synapseFilter === 'all'
                  ? 'bg-slate-700 text-slate-100 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All (100)
            </button>
            <button
              onClick={() => setSynapseFilter('active')}
              className={`flex-1 py-1 rounded text-[10px] font-mono transition ${
                synapseFilter === 'active'
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'text-emerald-400 hover:bg-emerald-950/40'
              }`}
            >
              Active ({activeSynapseCount})
            </button>
            <button
              onClick={() => setSynapseFilter('inactive')}
              className={`flex-1 py-1 rounded text-[10px] font-mono transition ${
                synapseFilter === 'inactive'
                  ? 'bg-slate-800 text-slate-300 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Inactive ({inactiveSynapseCount})
            </button>
          </div>
        </div>

      </div>

      {/* Primary Neural Data Flow Diagram (SVG) */}
      <div className="relative bg-[#030508] border border-slate-800 rounded-2xl p-4 overflow-x-auto flex flex-col items-center">
        
        {/* Layer Stage Labels Header */}
        <div className="w-full max-w-[850px] grid grid-cols-4 gap-2 text-center text-[11px] font-mono font-bold uppercase tracking-wider mb-2">
          <div className="text-slate-400 bg-slate-900/60 py-1.5 rounded-lg border border-slate-800">
            Stage 1 • Input $x_t$
          </div>
          <div className="text-emerald-400 bg-emerald-950/30 py-1.5 rounded-lg border border-emerald-900/40">
            Stage 2 • 5% Sparse Gate
          </div>
          <div className="text-cyan-400 bg-cyan-950/30 py-1.5 rounded-lg border border-cyan-900/40">
            Stage 3 • Fast Weights $A_t$
          </div>
          <div className="text-purple-400 bg-purple-950/30 py-1.5 rounded-lg border border-purple-900/40">
            Stage 4 • Recurrent $h_k$
          </div>
        </div>

        <svg
          viewBox="0 0 850 360"
          className="w-full max-w-[850px] h-auto overflow-visible font-mono select-none"
        >
          <defs>
            {/* Glowing filter for active synapses */}
            <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Active Synapse Line Gradients */}
            <linearGradient id="activeSynapseGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#06b6d4" stopOpacity="1" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.9" />
            </linearGradient>

            {/* Pulse Wave Gradient */}
            <linearGradient id="pulseWave" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#34d399" stopOpacity="0" />
              <stop offset="50%" stopColor="#38bdf8" stopOpacity="1" />
              <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* STAGE 1: Input Vector Nodes (Left Column x=80) */}
          {Array.from({ length: nodeCount }).map((_, i) => {
            const y = 35 + i * 30;
            const isActive = activeIndices.includes(i);
            return (
              <g key={`in-${i}`}>
                <line x1="80" y1={y} x2="220" y2={y} stroke={isActive ? '#059669' : '#1e293b'} strokeWidth={isActive ? 1.5 : 0.8} />
                <circle
                  cx="80"
                  cy={y}
                  r={isActive ? 8 : 5}
                  fill={isActive ? '#10b981' : '#0f172a'}
                  stroke={isActive ? '#6ee7b7' : '#334155'}
                  strokeWidth={isActive ? 2 : 1}
                  filter={isActive ? 'url(#neonGlow)' : undefined}
                />
                <text x="62" y={y + 3} fill={isActive ? '#a7f3d0' : '#475569'} fontSize="10" textAnchor="end">
                  x[{i}]
                </text>
              </g>
            );
          })}

          {/* STAGE 2: 5% Sparse Activation Layer (Column x=220) */}
          {Array.from({ length: nodeCount }).map((_, i) => {
            const y = 35 + i * 30;
            const isActive = activeIndices.includes(i);
            return (
              <g key={`sparse-${i}`}>
                <rect
                  x="205"
                  y={y - 10}
                  width="30"
                  height="20"
                  rx="4"
                  fill={isActive ? '#064e3b' : '#020617'}
                  stroke={isActive ? '#10b981' : '#1e293b'}
                  strokeWidth={isActive ? 1.5 : 1}
                  filter={isActive ? 'url(#neonGlow)' : undefined}
                />
                <text
                  x="220"
                  y={y + 3}
                  fill={isActive ? '#34d399' : '#334155'}
                  fontSize="9"
                  fontWeight={isActive ? 'bold' : 'normal'}
                  textAnchor="middle"
                >
                  {isActive ? 'FIRE' : '0.00'}
                </text>
              </g>
            );
          })}

          {/* STAGE 3: Synaptic Connections (between x=235 and x=550) */}
          {synapses.map((syn) => {
            const qY = 35 + syn.fromIndex * 30;
            const kY = 35 + syn.toIndex * 30;
            const isVisible =
              synapseFilter === 'all' ||
              (synapseFilter === 'active' && syn.isActive) ||
              (synapseFilter === 'inactive' && !syn.isActive);

            if (!isVisible) return null;

            if (syn.isActive) {
              // Active Synapse: Bright glowing animated pulse line
              const strokeWidth = 1.8 + syn.firingIntensity * 1.5;
              return (
                <g key={syn.id} className="cursor-pointer" onClick={() => setSelectedSynapse(syn)}>
                  <line
                    x1="235"
                    y1={qY}
                    x2="550"
                    y2={kY}
                    stroke="url(#activeSynapseGrad)"
                    strokeWidth={strokeWidth}
                    opacity="0.85"
                    filter="url(#neonGlow)"
                  />
                  {/* Moving signal pulse along active synapse */}
                  <circle
                    cx={235 + ((pulseStep * 3 + syn.fromIndex * 15 + syn.toIndex * 10) % 100) * 3.15}
                    cy={qY + ((kY - qY) * (((pulseStep * 3 + syn.fromIndex * 15 + syn.toIndex * 10) % 100) / 100))}
                    r="3.5"
                    fill="#38bdf8"
                    filter="url(#neonGlow)"
                  />
                </g>
              );
            } else {
              // Inactive Synapse: Dimmed, thin dashed line
              return (
                <line
                  key={syn.id}
                  x1="235"
                  y1={qY}
                  x2="550"
                  y2={kY}
                  stroke="#1e293b"
                  strokeWidth="0.5"
                  strokeDasharray="2,3"
                  opacity="0.18"
                />
              );
            }
          })}

          {/* STAGE 3: Hebbian Fast-Weight Matrix Nodes (Column x=550) */}
          {Array.from({ length: nodeCount }).map((_, i) => {
            const y = 35 + i * 30;
            const isActive = activeIndices.includes(i);
            return (
              <g key={`fw-${i}`}>
                <circle
                  cx="550"
                  cy={y}
                  r={isActive ? 8 : 5}
                  fill={isActive ? '#0891b2' : '#0f172a'}
                  stroke={isActive ? '#22d3ee' : '#334155'}
                  strokeWidth={isActive ? 2 : 1}
                  filter={isActive ? 'url(#neonGlow)' : undefined}
                />
                <text x="566" y={y + 3} fill={isActive ? '#67e8f9' : '#475569'} fontSize="10">
                  A_t[{i}]
                </text>
              </g>
            );
          })}

          {/* STAGE 4: Recurrent Latent Refinement Loop (Column x=680 to 760) */}
          <g transform="translate(680, 100)">
            {/* Recurrent Loop Box */}
            <rect
              x="0"
              y="0"
              width="110"
              height="150"
              rx="12"
              fill="#0f172a"
              stroke="#818cf8"
              strokeWidth="1.5"
              filter="url(#neonGlow)"
            />
            <text x="55" y="24" fill="#a5b4fc" fontSize="11" fontWeight="bold" textAnchor="middle">
              Recurrent $h_k$
            </text>
            <text x="55" y="42" fill="#818cf8" fontSize="9" textAnchor="middle">
              Step {pulseStep % recurrentK + 1} / {recurrentK}
            </text>

            {/* Recurrent Feedback Loop Arc */}
            <path
              d="M 90 60 C 130 60, 130 110, 90 110"
              fill="none"
              stroke="#6366f1"
              strokeWidth="2.5"
              strokeDasharray="4,2"
            />
            <polygon points="90,110 98,105 98,115" fill="#6366f1" />

            <text x="55" y="75" fill="#38bdf8" fontSize="10" fontWeight="bold" textAnchor="middle">
              LayerNorm
            </text>
            <text x="55" y="92" fill="#34d399" fontSize="10" fontWeight="bold" textAnchor="middle">
              Constraint Refinement
            </text>

            <text x="55" y="130" fill="#a7f3d0" fontSize="9" textAnchor="middle">
              0 Text Tokens
            </text>
          </g>

          {/* Connect Fast Weights to Recurrent Box */}
          {Array.from({ length: nodeCount }).map((_, i) => {
            const y = 35 + i * 30;
            const isActive = activeIndices.includes(i);
            return (
              <line
                key={`rec-conn-${i}`}
                x1="580"
                y1={y}
                x2="680"
                y2={175}
                stroke={isActive ? '#818cf8' : '#1e293b'}
                strokeWidth={isActive ? 1.2 : 0.4}
                opacity={isActive ? 0.7 : 0.15}
              />
            );
          })}

        </svg>

        {/* Legend Footer */}
        <div className="w-full max-w-[850px] mt-2 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]"></span>
            <span className="text-emerald-300 font-bold">Active Neuron / Firing Synapse (Top-{sparsityPercent}%)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-slate-800 border border-slate-600"></span>
            <span className="text-slate-400">Inactive Synapse (Suppressed 95%)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]"></span>
            <span className="text-cyan-300">Hebbian Fast-Weight $A_t$</span>
          </div>
        </div>

      </div>

      {/* Real-time Metrics & Synapse Inspection Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        
        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
          <span className="text-[10px] font-mono text-slate-400 uppercase block">Active Synapses</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-bold font-mono text-emerald-400">{activeSynapseCount}</span>
            <span className="text-xs text-slate-400 font-mono">/ 100 Total</span>
          </div>
          <span className="text-[10px] text-emerald-500 font-mono block mt-1">
            {(activeSynapseCount / 100 * 100).toFixed(0)}% Synaptic Load
          </span>
        </div>

        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
          <span className="text-[10px] font-mono text-slate-400 uppercase block">Suppressed Synapses</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-bold font-mono text-slate-300">{inactiveSynapseCount}</span>
            <span className="text-xs text-slate-500 font-mono">Quiet (95%)</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono block mt-1">
            Zero crosstalk interference
          </span>
        </div>

        <div className={`p-3.5 rounded-xl border ${
          crosstalkRisk > 20
            ? 'bg-rose-950/20 border-rose-900/50'
            : 'bg-emerald-950/20 border-emerald-900/50'
        }`}>
          <span className="text-[10px] font-mono text-slate-400 uppercase block flex items-center justify-between">
            Crosstalk Risk
            {crosstalkRisk > 20 && <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />}
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className={`text-xl font-bold font-mono ${
              crosstalkRisk > 20 ? 'text-rose-400' : 'text-emerald-400'
            }`}>
              {crosstalkRisk}%
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {crosstalkRisk > 20 ? 'High' : 'Optimal'}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono block mt-1">
            {crosstalkRisk > 20 ? 'Dense activations overlap' : 'Orthogonal representations'}
          </span>
        </div>

        <div className="bg-slate-950 p-3.5 rounded-xl border border-cyan-900/40">
          <span className="text-[10px] font-mono text-cyan-400 uppercase block font-bold">
            Selected Synapse Inspector
          </span>
          {selectedSynapse ? (
            <div className="mt-1 space-y-0.5 text-xs font-mono">
              <div className="text-slate-200 font-bold">
                q[{selectedSynapse.fromIndex}] → k[{selectedSynapse.toIndex}]
              </div>
              <div className="text-cyan-300 text-[11px]">
                Weight: {selectedSynapse.weight}
              </div>
              <div className={`text-[10px] font-bold ${
                selectedSynapse.isActive ? 'text-emerald-400' : 'text-slate-500'
              }`}>
                {selectedSynapse.isActive ? 'ACTIVE (Firing)' : 'INACTIVE (Suppressed)'}
              </div>
            </div>
          ) : (
            <p className="text-[11px] text-slate-500 font-mono mt-1">
              Click any active synapse line to inspect weight $A_t[q, k]$.
            </p>
          )}
        </div>

      </div>

    </div>
  );
};
