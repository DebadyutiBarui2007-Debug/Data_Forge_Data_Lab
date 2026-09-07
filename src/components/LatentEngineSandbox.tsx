/**
 * LatentEngineSandbox Component (Blueprint A)
 * Interactive sandbox exploring Recurrent Latent-Space Reasoning and Inference Scaling in Pathway BDH-CQ.
 */

import React, { useState } from 'react';
import { LatentReasoningConfig } from '../types';
import { ARC_PUZZLES, runLatentReasoningSimulation } from '../engine/latentReasoningEngine';
import { BackendClient } from '../api/backendClient';
import { GridVisualizer } from './GridVisualizer';
import { ParetoGraph } from './ParetoGraph';
import { Activity, Clock, Cpu, Layers, Play, Sparkles, Zap } from 'lucide-react';

export const LatentEngineSandbox: React.FC = () => {
  const [selectedPuzzleId, setSelectedPuzzleId] = useState<string>(ARC_PUZZLES[0].id);
  const [config, setConfig] = useState<LatentReasoningConfig>({
    recurrentSteps: 8,
    reasoningMode: 'latent-bdhcq',
    puzzleType: 'arc-grid',
    noiseLevel: 0
  });

  const puzzle = ARC_PUZZLES.find(p => p.id === selectedPuzzleId) || ARC_PUZZLES[0];

  // Run live simulation
  const results = runLatentReasoningSimulation(puzzle, config);
  const currentStepIndex = Math.min(config.recurrentSteps - 1, results.length - 1);
  const currentRes = results[currentStepIndex] || results[0];

  // Also calculate CoT comparison results
  const cotResults = runLatentReasoningSimulation(puzzle, {
    ...config,
    reasoningMode: 'cot-transformer'
  });
  const currentCotRes = cotResults[currentStepIndex] || cotResults[0];

  const [aiInterpretation, setAiInterpretation] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const handleAiInterpretation = async () => {
    setIsAiLoading(true);
    setAiError(null);
    try {
      // Create a mock activation vector based on the grid structure to send to the backend
      // In a real scenario, this would be the raw Float32Array from the BDH engine
      const mockLatent = currentRes.currentGridPrediction.flat().map(val => val > 0 ? Math.random() * val : 0);
      
      const interpretation = await BackendClient.interpretLatentState({
        latentVector: mockLatent,
        sparsityThreshold: '5%',
        contextPhase: `Latent Recurrence Step k=${config.recurrentSteps}`
      });
      setAiInterpretation(interpretation);
    } catch (err: any) {
      setAiError(err.message || 'Failed to connect to backend AI.');
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      
      {/* Title Bar & Config Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                <Cpu className="w-5 h-5" />
              </span>
              <h2 className="text-lg font-bold text-slate-100">
                The Latent Engine: Recurrent Reasoning in BDH-CQ
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Test Pathway BDH-CQ&apos;s ability to &ldquo;think&rdquo; by refining internal hidden state vectors h_k+1 = Norm(h_k + &sigma;(W_rec h_k)) without generating text tokens.
            </p>
          </div>

          {/* Mode Selector */}
          <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
            <button
              onClick={() => setConfig({ ...config, reasoningMode: 'latent-bdhcq' })}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                config.reasoningMode === 'latent-bdhcq'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>BDH-CQ Latent Recurrence</span>
            </button>

            <button
              onClick={() => setConfig({ ...config, reasoningMode: 'cot-transformer' })}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                config.reasoningMode === 'cot-transformer'
                  ? 'bg-purple-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Chain-of-Thought (CoT)</span>
            </button>
          </div>
        </div>

        {/* Puzzle Selector & Slider */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
          
          {/* Puzzle Choice */}
          <div>
            <label className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">Select Challenge Puzzle</label>
            <select
              value={selectedPuzzleId}
              onChange={e => setSelectedPuzzleId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded text-xs text-slate-200 px-3 py-2 font-mono focus:outline-none focus:border-cyan-500"
            >
              {ARC_PUZZLES.map(p => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>

          {/* Recurrent Compute Steps Slider k */}
          <div className="md:col-span-2">
            <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
              <span>Recurrent Compute Steps (k): <strong className="text-cyan-400 font-mono text-sm">{config.recurrentSteps}</strong></span>
              <span className="text-slate-400 font-mono">
                Optimal Step Threshold: k = {puzzle.minRecurrentStepsNeeded}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="20"
              value={config.recurrentSteps}
              onChange={e => setConfig({ ...config, recurrentSteps: Number(e.target.value) })}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
              <span>k = 1 (Shallow Inference)</span>
              <span>k = {puzzle.minRecurrentStepsNeeded} (Convergence)</span>
              <span>k = 20 (Deep Recurrence)</span>
            </div>
          </div>

        </div>
      </div>

      {/* Real-Time Pareto Frontier Graph (Updates on Slider Movement) */}
      <ParetoGraph
        activeK={config.recurrentSteps}
        puzzle={puzzle}
        reasoningMode={config.reasoningMode}
        onKChange={(newK) => setConfig({ ...config, recurrentSteps: newK })}
      />

      {/* Main Grid Visualizer Section (Truth Beside Estimate) */}
      <GridVisualizer
        inputGrid={puzzle.inputGrid}
        predictedGrid={currentRes.currentGridPrediction}
        targetGrid={puzzle.targetGrid}
        title={`${puzzle.title} • Recurrent Step k=${config.recurrentSteps}`}
      />

      {/* Metrics & Pareto Curve Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Metric Cards */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-cyan-400" />
              Live Compute & Cost Metrics
            </h4>

            <div className="space-y-2 font-mono text-xs">
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Target Accuracy:</span>
                <span className="text-emerald-400 font-bold">{currentRes.cellAccuracy}%</span>
              </div>

              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Tokens Generated:</span>
                <span className={config.reasoningMode === 'latent-bdhcq' ? 'text-cyan-400 font-bold' : 'text-purple-400 font-bold'}>
                  {currentRes.tokensGenerated} Tokens
                </span>
              </div>

              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Cumulative Latency:</span>
                <span className="text-amber-400 font-bold">{currentRes.cumLatencyMs} ms</span>
              </div>

              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Compute Energy (FLOPs):</span>
                <span className="text-cyan-400 font-bold">{currentRes.cumFlops} GFLOPs</span>
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-[11px] text-slate-300 leading-tight">
              <strong>BDH-CQ Advantage:</strong> BDH-CQ reaches {currentRes.cellAccuracy}% accuracy in <strong>{currentRes.cumLatencyMs} ms</strong> with <strong>0 text tokens generated</strong>, compared to CoT generating {currentCotRes.tokensGenerated} tokens taking {currentCotRes.cumLatencyMs} ms!
            </div>

            {/* Cloud AI Integration Button */}
            <div className="pt-2 border-t border-slate-800/60 mt-4">
              <button
                onClick={handleAiInterpretation}
                disabled={isAiLoading}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
              >
                {isAiLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-emerald-400/20 border-t-emerald-400 rounded-full animate-spin" />
                    Querying Server Backend AI...
                  </span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Backend AI: Interpret Latent Vector
                  </>
                )}
              </button>

              {aiError && (
                <div className="mt-2 p-2 bg-rose-500/10 border border-rose-500/30 rounded text-rose-400 text-[10px]">
                  {aiError}
                </div>
              )}
              {aiInterpretation && !isAiLoading && (
                <div className="mt-3 p-3 bg-slate-950 border border-emerald-500/30 rounded-lg space-y-1">
                  <span className="text-[10px] uppercase font-bold text-emerald-500 tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Gemini Mechanistic Interpretation
                  </span>
                  <p className="text-xs text-slate-300 font-mono leading-relaxed">
                    {aiInterpretation}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Latency vs Accuracy Comparison Table & Trajectory */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              Pareto Frontier: Latency (ms) vs Accuracy Trajectory
            </h3>

            <div className="overflow-x-auto border border-slate-800 rounded-lg">
              <table className="w-full text-left font-mono text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="p-2">Recurrent Step k</th>
                    <th className="p-2">Cell Accuracy</th>
                    <th className="p-2">BDH-CQ Latency</th>
                    <th className="p-2">CoT Latency</th>
                    <th className="p-2">CoT Token Overhead</th>
                    <th className="p-2">Speedup Factor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-900/50">
                  {results.slice(0, 12).map((res, i) => {
                    const cotStep = cotResults[i] || cotResults[0];
                    const speedup = (cotStep.cumLatencyMs / Math.max(1, res.cumLatencyMs)).toFixed(1);
                    return (
                      <tr key={i} className={i === currentStepIndex ? 'bg-cyan-500/10 font-bold' : ''}>
                        <td className="p-2 text-slate-400">k = {res.step}</td>
                        <td className="p-2 text-emerald-400">{res.cellAccuracy}%</td>
                        <td className="p-2 text-cyan-400">{res.cumLatencyMs} ms</td>
                        <td className="p-2 text-purple-400">{cotStep.cumLatencyMs} ms</td>
                        <td className="p-2 text-slate-300">{cotStep.tokensGenerated} tok</td>
                        <td className="p-2 text-amber-400 font-bold">{speedup}x Faster</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
