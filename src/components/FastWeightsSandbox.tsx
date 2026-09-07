/**
 * FastWeightsSandbox Component (Blueprint B)
 * Interactive computational sandbox testing Synaptic Fast Weights, Hebbian Writes, Sparsity, and Catastrophic Forgetting.
 */

import React, { useState } from 'react';
import { FastWeightsConfig } from '../types';
import { runFastWeightsSimulation } from '../engine/bdhSimulation';
import { MatrixHeatmap } from './MatrixHeatmap';
import { Activity, AlertTriangle, CheckCircle2, Cpu, Database, Play, RefreshCw, RotateCcw, Sparkles, XCircle, Zap } from 'lucide-react';

export const FastWeightsSandbox: React.FC = () => {
  const [config, setConfig] = useState<FastWeightsConfig>({
    plasticityRate: 0.45,
    decayConstant: 0.85,
    sparsityThreshold: 5, // BDH 5% default
    sequenceLength: 60,
    dimension: 8,
    task: 'rule-shift',
    useSparseActivations: true
  });

  const [activeStepIndex, setActiveStepIndex] = useState<number>(30);

  // Run simulation live on every parameter change
  const results = runFastWeightsSimulation(config);

  const safeIndex = Math.min(activeStepIndex, results.length - 1);
  const currentStep = results[safeIndex] || results[0];

  const totalSteps = results.length;
  const task1FinalAcc = results[results.length - 1]?.baselineTaskAccuracy ?? 0;
  const task2FinalAcc = results[results.length - 1]?.shiftedTaskAccuracy ?? 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      
      {/* Title & Control Panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <Zap className="w-5 h-5" />
              </span>
              <h2 className="text-lg font-bold text-slate-100">
                Synaptic Sandbox: Fast Weights & Hebbian Memory
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Explore how Pathway BDH maintains O(1) constant memory via Hebbian fast weights A_t = &lambda; A_t-1 + &eta; (q_t &middot; k_t^T) and prevents catastrophic forgetting via 5% sparse activations.
            </p>
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-2 overflow-x-auto">
            <button
              onClick={() =>
                setConfig({
                  ...config,
                  plasticityRate: 0.45,
                  decayConstant: 0.85,
                  sparsityThreshold: 5,
                  useSparseActivations: true,
                  task: 'rule-shift'
                })
              }
              className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Preset: BDH Optimal (5% Sparse)</span>
            </button>

            <button
              onClick={() =>
                setConfig({
                  ...config,
                  plasticityRate: 0.8,
                  decayConstant: 0.95,
                  sparsityThreshold: 100,
                  useSparseActivations: false,
                  task: 'rule-shift'
                })
              }
              className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Preset: Catastrophic Overwrite (Dense)</span>
            </button>
          </div>
        </div>

        {/* Sliders Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
          
          {/* Plasticity Rate eta */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
              <span>Plasticity Rate (&eta;)</span>
              <span className="text-emerald-400 font-mono">{config.plasticityRate.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.01"
              max="1.0"
              step="0.01"
              value={config.plasticityRate}
              onChange={e => setConfig({ ...config, plasticityRate: Number(e.target.value) })}
              className="w-full accent-emerald-400 cursor-pointer"
            />
            <span className="text-[10px] text-slate-500 block mt-0.5">Hebbian write magnitude</span>
          </div>

          {/* Synaptic Decay Constant lambda */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
              <span>Synaptic Decay (&lambda;)</span>
              <span className="text-cyan-400 font-mono">{config.decayConstant.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="1.0"
              step="0.01"
              value={config.decayConstant}
              onChange={e => setConfig({ ...config, decayConstant: Number(e.target.value) })}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <span className="text-[10px] text-slate-500 block mt-0.5">Retention rate of old weights</span>
          </div>

          {/* Sparsity Threshold % */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
              <span>Sparsity Threshold</span>
              <span className="text-amber-400 font-mono">{config.sparsityThreshold}%</span>
            </div>
            <input
              type="range"
              min="1"
              max="100"
              step="1"
              value={config.sparsityThreshold}
              onChange={e => setConfig({ ...config, sparsityThreshold: Number(e.target.value) })}
              className="w-full accent-amber-400 cursor-pointer"
            />
            <span className="text-[10px] text-slate-500 block mt-0.5">Top-k active neurons (BDH = 5%)</span>
          </div>

          {/* Task & Sparsity Toggle */}
          <div className="flex flex-col justify-between">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-300">Sparse Activations</span>
              <button
                onClick={() => setConfig({ ...config, useSparseActivations: !config.useSparseActivations })}
                className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                  config.useSparseActivations ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {config.useSparseActivations ? 'ON (BDH)' : 'OFF (Dense)'}
              </button>
            </div>

            <div className="mt-2">
              <label className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">Sequence Task</label>
              <select
                value={config.task}
                onChange={e => setConfig({ ...config, task: e.target.value as any })}
                className="w-full bg-slate-900 border border-slate-800 rounded text-xs text-slate-200 px-2 py-1 font-mono focus:outline-none focus:border-emerald-500"
              >
                <option value="rule-shift">Rule-Shift (Catastrophic Forgetting Test)</option>
                <option value="associative-recall">Dynamic Key-Value Associative Recall</option>
              </select>
            </div>
          </div>

        </div>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Live Matrix Heatmap & Memory Footprint */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Matrix Heatmap */}
          <MatrixHeatmap
            matrix={currentStep.queryVector.map(() => currentStep.queryVector.map(v => v * (currentStep.fastWeightNorm / 5)))}
            title="Fast-Weight Matrix A_t"
            subtitle={`Step ${currentStep.step} / ${totalSteps} • ||A_t||_F = ${currentStep.fastWeightNorm.toFixed(2)}`}
          />

          {/* Memory Overhead Live Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Database className="w-4 h-4 text-emerald-400" />
                Live Inference Memory Comparison
              </h4>
            </div>

            <div className="grid grid-cols-2 gap-3 font-mono">
              <div className="bg-slate-950 p-3 rounded-lg border border-rose-500/30">
                <span className="text-[10px] text-slate-400 uppercase block">Standard Transformer (KV Cache)</span>
                <span className="text-sm font-bold text-rose-400">{currentStep.kvCacheMemoryMB} MB</span>
                <span className="text-[9px] text-slate-500 block mt-0.5">Scales O(N) with context</span>
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-emerald-500/30">
                <span className="text-[10px] text-slate-400 uppercase block">Pathway BDH Fast-Weight State</span>
                <span className="text-sm font-bold text-emerald-400">{currentStep.bdhMemoryMB} MB</span>
                <span className="text-[9px] text-slate-500 block mt-0.5">Constant O(1) memory!</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 leading-tight">
              <strong>Memory Savings:</strong> Pathway BDH runs at <strong>{(currentStep.kvCacheMemoryMB / currentStep.bdhMemoryMB).toFixed(1)}x less RAM</strong> at step {currentStep.step}.
            </div>
          </div>

        </div>

        {/* Right 2 Columns: Stream Progress & Truth Beside Estimate */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Stream Scrubber Slider */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Sequence Time Step Scrubber
                </h3>
              </div>
              <span className="text-xs font-mono text-emerald-400 font-bold">
                Step {safeIndex + 1} of {totalSteps}
              </span>
            </div>

            <input
              type="range"
              min="0"
              max={totalSteps - 1}
              value={safeIndex}
              onChange={e => setActiveStepIndex(Number(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer"
            />

            {/* Retention Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase text-slate-400 block font-semibold">Task 1 (Original Rule) Accuracy</span>
                  <span className={`text-base font-bold font-mono ${task1FinalAcc >= 70 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {task1FinalAcc}%
                  </span>
                </div>
                {task1FinalAcc >= 70 ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-rose-400" />
                )}
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase text-slate-400 block font-semibold">Task 2 (Shifted Rule) Accuracy</span>
                  <span className="text-base font-bold font-mono text-cyan-400">
                    {task2FinalAcc}%
                  </span>
                </div>
                <Sparkles className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
          </div>

          {/* Truth Beside Estimate Token Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Truth Beside Estimate: Token Stream Verification
              </h3>
              <span className="text-[11px] text-slate-400">
                Sparsity: {currentStep.activeNeuronPercent}% active
              </span>
            </div>

            <div className="overflow-x-auto max-h-72 border border-slate-800 rounded-lg">
              <table className="w-full text-left font-mono text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800 sticky top-0">
                  <tr>
                    <th className="p-2">Step</th>
                    <th className="p-2">Input x_t</th>
                    <th className="p-2">Target y_t (Truth)</th>
                    <th className="p-2">Model Output y_hat (Estimate)</th>
                    <th className="p-2">Match Status</th>
                    <th className="p-2">Sparsity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-900/50">
                  {results.slice(0, 20).map((res, i) => (
                    <tr
                      key={i}
                      onClick={() => setActiveStepIndex(i)}
                      className={`hover:bg-slate-800/80 cursor-pointer transition-colors ${
                        i === safeIndex ? 'bg-emerald-500/10 font-bold border-l-2 border-emerald-400' : ''
                      }`}
                    >
                      <td className="p-2 text-slate-400">#{res.step}</td>
                      <td className="p-2 text-slate-200">{res.inputToken}</td>
                      <td className="p-2 text-cyan-400">{res.targetToken}</td>
                      <td className={`p-2 font-bold ${res.isCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {res.predictedToken}
                      </td>
                      <td className="p-2">
                        {res.isCorrect ? (
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" /> MATCH
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] text-rose-400 font-semibold bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                            <XCircle className="w-3 h-3" /> DISCREPANCY
                          </span>
                        )}
                      </td>
                      <td className="p-2 text-slate-400 text-[10px]">
                        {res.activeNeuronCount} neurons ({res.activeNeuronPercent}%)
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
