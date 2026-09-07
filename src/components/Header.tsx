/**
 * Header Component
 * Main app header, navigation tabs, and system status indicators.
 */

import React from 'react';
import { AppMode } from '../types';
import {
  Activity,
  BookOpen,
  BrainCircuit,
  Cpu,
  Layers,
  Sparkles,
  Zap
} from 'lucide-react';

interface HeaderProps {
  currentMode: AppMode;
  onModeChange: (mode: AppMode) => void;
  onReplayLoader?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentMode, onModeChange, onReplayLoader }) => {
  return (
    <header className="bg-slate-950 border-b border-slate-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 p-0.5 flex items-center justify-center shadow-lg shadow-emerald-500/10">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-emerald-400">
              <BrainCircuit className="w-6 h-6 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-100 tracking-tight">
                DataForge <span className="text-emerald-400">BDH Lab</span>
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                Pathway BDH / BDH-CQ
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Frontier AI Explainer • NeurIPS 2026 Education Track
            </p>
          </div>
        </div>

        {/* Navigation Tabs & Replay Loader Button */}
        <div className="flex items-center gap-2 max-w-full overflow-x-auto">
          <nav className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 shrink-0">
            <button
              onClick={() => onModeChange('guided')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 shrink-0 ${
                currentMode === 'guided'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>1. Guided Tour</span>
            </button>

            <button
              onClick={() => onModeChange('sandbox-fastweights')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 shrink-0 ${
                currentMode === 'sandbox-fastweights'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>2. Synaptic Sandbox (Fast Weights)</span>
            </button>

            <button
              onClick={() => onModeChange('sandbox-latent')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 shrink-0 ${
                currentMode === 'sandbox-latent'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>3. Latent Engine (BDH-CQ)</span>
            </button>

            <button
              onClick={() => onModeChange('deepdive')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 shrink-0 ${
                currentMode === 'deepdive'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>4. BDH Deep Dive</span>
            </button>

            <button
              onClick={() => onModeChange('benchmark')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 shrink-0 ${
                currentMode === 'benchmark'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>5. Pareto Benchmark</span>
            </button>
          </nav>

          {onReplayLoader && (
            <button
              onClick={onReplayLoader}
              title="Replay Intro Matrix Loader"
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/50 transition-all shrink-0"
            >
              <Sparkles className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>
    </header>
  );
};
