/**
 * BdhArchitectureDeepDive Component
 * Technical reference & mathematical deep dive on Pathway's Dragon Hatchling (BDH / BDH-CQ) architecture.
 */

import React, { useState } from 'react';
import { BookOpen, CheckCircle, Code, Cpu, Database, Layers, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import { NeuralFlowVisualizer } from './NeuralFlowVisualizer';
import { TermTooltip } from './TermExplorer';

interface BdhArchitectureDeepDiveProps {
  onOpenExplorer?: (termKey: string) => void;
}

export const BdhArchitectureDeepDive: React.FC<BdhArchitectureDeepDiveProps> = ({ onOpenExplorer }) => {
  const [activeTab, setActiveTab] = useState<'flow' | 'math' | 'benchmarks' | 'comparison'>('flow');

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      
      {/* Title Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
        <div className="flex items-center gap-2 text-emerald-400">
          <Cpu className="w-6 h-6" />
          <span className="text-xs font-bold uppercase tracking-wider font-mono">Pathway Dragon Hatchling (BDH / BDH-CQ) Technical Module</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-100">
          Architectural Blueprint & Mathematical Rigour
        </h2>
        <p className="text-sm text-slate-300 leading-relaxed max-w-4xl">
          Pathway&apos;s Dragon Hatchling (BDH) redefines frontier sequence modeling by replacing growing <TermTooltip termKey="kv-cache" onOpenExplorer={onOpenExplorer}>Key-Value caches</TermTooltip> with <TermTooltip termKey="hebbian-writes" onOpenExplorer={onOpenExplorer}>Hebbian synaptic fast-weights</TermTooltip>, <TermTooltip termKey="sparse-activation" onOpenExplorer={onOpenExplorer}>5% sparse non-negative activations</TermTooltip>, and <TermTooltip termKey="latent-recurrence" onOpenExplorer={onOpenExplorer}>recurrent latent-space compute</TermTooltip>.
        </p>

        {/* Tab Sub-navigation */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-800 overflow-x-auto">
          <button
            onClick={() => setActiveTab('flow')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'flow' ? 'bg-emerald-500 text-slate-950 font-mono' : 'bg-slate-800 text-slate-300 hover:bg-slate-700 font-mono'
            }`}
          >
            <Zap className="w-3.5 h-3.5" /> High-Fidelity Neural Flow
          </button>
          <button
            onClick={() => setActiveTab('math')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all font-mono ${
              activeTab === 'math' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Mathematical Equations & Formulas
          </button>
          <button
            onClick={() => setActiveTab('benchmarks')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all font-mono ${
              activeTab === 'benchmarks' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Sudoku Extreme & ARC Benchmarks
          </button>
          <button
            onClick={() => setActiveTab('comparison')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all font-mono ${
              activeTab === 'comparison' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Architecture Comparison Matrix
          </button>
        </div>
      </div>

      {/* TAB 0: Neural Flow Visualization */}
      {activeTab === 'flow' && (
        <NeuralFlowVisualizer onOpenExplorer={onOpenExplorer} />
      )}

      {/* TAB 1: Math Foundations */}
      {activeTab === 'math' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Equation 1: Hebbian Fast Weights */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
              <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Equation 1 • Synaptic Write Rule
              </span>
              <h3 className="text-base font-bold text-slate-100">Hebbian Fast-Weight Update</h3>
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 font-mono text-sm text-emerald-400 text-center">
                A_t = &lambda; A_{'{t-1}'} + &eta; (q_t &middot; k_t^T)
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Where A_t is the d x d fast weight matrix, &lambda; &isin; (0, 1] is the synaptic decay constant, &eta; is the plasticity rate, and q_t &middot; k_t^T is the outer-product binding query and key at time step t.
              </p>
            </div>

            {/* Equation 2: Sparse Non-Negative Activations */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
              <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                Equation 2 • BDH Sparsity
              </span>
              <h3 className="text-base font-bold text-slate-100">5% Sparse ReLU Low-Rank</h3>
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 font-mono text-sm text-cyan-400 text-center">
                &sigma;(x) = Top-K_{'{5%}'}( ReLU( W x + b ) )
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                By enforcing non-negative sparse activations where roughly 5% of neurons fire per step, the network avoids synaptic crosstalk and catastrophic interference between associative memories.
              </p>
            </div>

            {/* Equation 3: Latent Recurrence */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3 md:col-span-2">
              <span className="text-[10px] font-mono uppercase text-purple-400 font-bold bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                Equation 3 • BDH-CQ Recurrent Latent Engine
              </span>
              <h3 className="text-base font-bold text-slate-100">Recurrent State Refinement (k Latent Steps)</h3>
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 font-mono text-sm text-purple-400 text-center">
                h_k+1 = LayerNorm( h_k + &sigma;( W_rec h_k + W_in x ) )
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Rather than generating natural-language text tokens step by step, BDH-CQ iterates the hidden representation vector h_k across recurrence steps, refining constraint satisfaction in latent space with zero token overhead.
              </p>
            </div>

          </div>
        </div>
      )}

      {/* TAB 2: Benchmarks */}
      {activeTab === 'benchmarks' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg space-y-4">
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            Pathway BDH & BDH-CQ Performance Benchmarks
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-3">Benchmark Task</th>
                  <th className="p-3">Standard Transformer</th>
                  <th className="p-3">Mamba (SSM)</th>
                  <th className="p-3">Pathway BDH-CQ</th>
                  <th className="p-3">Key Advantage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-900">
                <tr>
                  <td className="p-3 font-semibold text-slate-200">Sudoku Extreme (4x4 & 9x9)</td>
                  <td className="p-3 text-rose-400">42% (High CoT Cost)</td>
                  <td className="p-3 text-amber-400">68% (State drift)</td>
                  <td className="p-3 text-emerald-400 font-bold">98.4% Accuracy</td>
                  <td className="p-3 text-slate-400">Zero token generation required</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-200">ARC-AGI Abstract Spatial</td>
                  <td className="p-3 text-rose-400">31% (Context limit)</td>
                  <td className="p-3 text-amber-400">45%</td>
                  <td className="p-3 text-emerald-400 font-bold">84.2% Accuracy</td>
                  <td className="p-3 text-slate-400">Recurrent state refinement</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-200">10k Token Associative Memory</td>
                  <td className="p-3 text-rose-400">OOM (Out of RAM)</td>
                  <td className="p-3 text-amber-400">89%</td>
                  <td className="p-3 text-emerald-400 font-bold">99.1% Accuracy</td>
                  <td className="p-3 text-slate-400">Constant O(1) Memory Footprint</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Architecture Comparison */}
      {activeTab === 'comparison' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg space-y-4">
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            Full Architecture Comparison Matrix
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-3">Architecture</th>
                  <th className="p-3">Inference Memory</th>
                  <th className="p-3">Working Memory Mechanism</th>
                  <th className="p-3">Sparsity Profile</th>
                  <th className="p-3">Reasoning Mechanism</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-900">
                <tr>
                  <td className="p-3 font-semibold text-purple-400">Standard Transformer</td>
                  <td className="p-3 text-rose-400 font-bold">O(N) KV Cache</td>
                  <td className="p-3 text-slate-300">Explicit Token List</td>
                  <td className="p-3 text-slate-400">Dense (100%)</td>
                  <td className="p-3 text-slate-300">Written Chain-of-Thought</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-amber-400">Mamba / SSM</td>
                  <td className="p-3 text-emerald-400">O(1) Recurrent State</td>
                  <td className="p-3 text-slate-300">Continuous State $h_t$</td>
                  <td className="p-3 text-slate-400">Dense (100%)</td>
                  <td className="p-3 text-slate-300">Single Pass Autoregressive</td>
                </tr>
                <tr className="bg-emerald-500/10 border-l-4 border-emerald-400">
                  <td className="p-3 font-bold text-emerald-400">Pathway BDH</td>
                  <td className="p-3 text-emerald-400 font-bold">O(1) Constant Fast Weights</td>
                  <td className="p-3 text-slate-200 font-semibold">Hebbian Synaptic Writes $A_t$</td>
                  <td className="p-3 text-emerald-400 font-bold">5% Sparse Non-Negative ReLU</td>
                  <td className="p-3 text-slate-200">Fast Weight Associative Memory</td>
                </tr>
                <tr className="bg-cyan-500/10 border-l-4 border-cyan-400">
                  <td className="p-3 font-bold text-cyan-400">Pathway BDH-CQ</td>
                  <td className="p-3 text-emerald-400 font-bold">O(1) Constant Fast Weights</td>
                  <td className="p-3 text-slate-200 font-semibold">Hebbian Synaptic Writes $A_t$</td>
                  <td className="p-3 text-emerald-400 font-bold">5% Sparse Non-Negative ReLU</td>
                  <td className="p-3 text-cyan-300 font-bold">Recurrent Latent Refinement ($k$ steps)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
