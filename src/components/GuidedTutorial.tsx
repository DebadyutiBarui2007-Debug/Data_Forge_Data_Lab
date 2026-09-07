/**
 * GuidedTutorial Component
 * "Guide, then Sandbox" Flow: 5-step interactive lesson introducing Hebbian Fast Weights, Sparsity, and Latent Recurrence.
 */

import React, { useState } from 'react';
import { ArrowRight, CheckCircle, HelpCircle, Lightbulb, Play, RotateCcw, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import { MatrixHeatmap } from './MatrixHeatmap';
import { ParetoGraph } from './ParetoGraph';
import { runFastWeightsSimulation } from '../engine/bdhSimulation';
import { ARC_PUZZLES, runLatentReasoningSimulation } from '../engine/latentReasoningEngine';

interface GuidedTutorialProps {
  onUnlockSandbox: (targetSandbox: 'fastweights' | 'latent') => void;
}

export const GuidedTutorial: React.FC<GuidedTutorialProps> = ({ onUnlockSandbox }) => {
  const [currentStep, setCurrentStep] = useState(1);

  // Micro-interactive variables for step 1 & 2
  const [seqLength, setSeqLength] = useState(512);
  const [plasticity, setPlasticity] = useState(0.4);
  const [useSparsity, setUseSparsity] = useState(false);
  const [recurrentK, setRecurrentK] = useState(6);

  // Calculate live KV Cache memory vs BDH memory for step 1
  const kvMemoryMB = (2 * seqLength * 64 * 32 * 2) / (1024 * 1024); // FP16 32 heads, 64 dim
  const bdhMemoryMB = (64 * 64 * 2) / (1024 * 1024); // 0.0078 MB constant!

  // Simulation for step 3 & 4
  const step3Sim = runFastWeightsSimulation({
    plasticityRate: plasticity,
    decayConstant: 0.85,
    sparsityThreshold: useSparsity ? 5 : 100,
    sequenceLength: 40,
    dimension: 8,
    task: 'rule-shift',
    useSparseActivations: useSparsity
  });

  const lastStepRes = step3Sim[step3Sim.length - 1];

  // Simulation for step 5
  const latentSim = runLatentReasoningSimulation(ARC_PUZZLES[0], {
    recurrentSteps: recurrentK,
    reasoningMode: 'latent-bdhcq',
    puzzleType: 'arc-grid',
    noiseLevel: 0
  });
  const currentLatentRes = latentSim[latentSim.length - 1];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Progress Stepper Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" />
            <span>Interactive Guided Walkthrough • Step {currentStep} of 5</span>
          </span>
          <span className="text-xs text-slate-400 font-mono">
            {currentStep === 1 && '1. The KV-Cache Memory Wall'}
            {currentStep === 2 && '2. Hebbian Fast Weights O(1) Memory'}
            {currentStep === 3 && '3. Fast-Weight Interference & Forgetting'}
            {currentStep === 4 && '4. Pathway BDH 5% Sparse Activations'}
            {currentStep === 5 && '5. BDH-CQ Latent Reasoning'}
          </span>
        </div>

        <div className="grid grid-cols-5 gap-2">
          {[1, 2, 3, 4, 5].map(step => (
            <button
              key={step}
              onClick={() => setCurrentStep(step)}
              className={`h-2 rounded-full transition-all duration-300 ${
                step === currentStep
                  ? 'bg-emerald-400 shadow-md shadow-emerald-400/30'
                  : step < currentStep
                  ? 'bg-emerald-600/60'
                  : 'bg-slate-800'
              }`}
            />
          ))}
        </div>
      </div>

      {/* STEP 1: The KV-Cache Wall */}
      {currentStep === 1 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-sm">1</span>
              The KV-Cache Memory Explosion in Standard Transformers
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Standard Transformers store every prior token&apos;s Key and Value vector ($K, V$) in a growing <span className="text-emerald-400 font-semibold">KV Cache</span>. As the sequence length $N$ grows, memory scales as <strong className="text-rose-400 font-mono">O(N)</strong>, creating a severe bottleneck for long contexts.
            </p>
          </div>

          {/* Interactive Micro-Widget */}
          <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                  Sequence Length N Tokens: <span className="text-emerald-400 font-mono text-sm">{seqLength}</span>
                </label>
                <input
                  type="range"
                  min="64"
                  max="10000"
                  step="64"
                  value={seqLength}
                  onChange={e => setSeqLength(Number(e.target.value))}
                  className="w-full accent-emerald-400 cursor-pointer"
                />
              </div>

              <div className="flex items-center gap-4 bg-slate-900 p-3 rounded-lg border border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">Standard Transformer KV-Cache</span>
                  <span className="text-base font-bold font-mono text-rose-400">{kvMemoryMB.toFixed(2)} MB</span>
                </div>
                <div className="border-l border-slate-800 pl-4">
                  <span className="text-[10px] text-slate-400 uppercase block">Pathway BDH Fast-Weight State</span>
                  <span className="text-base font-bold font-mono text-emerald-400">{bdhMemoryMB.toFixed(4)} MB</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800/80 text-xs text-slate-300 flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p>
                <strong>The Core Insight:</strong> At $N = {seqLength}$ tokens, standard KV cache consumes <strong>{(kvMemoryMB / bdhMemoryMB).toFixed(0)}x</strong> more RAM than Pathway BDH, which stays strictly constant!
              </p>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-sm flex items-center gap-2 hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20"
            >
              <span>Next: Fast Weights Solution</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Hebbian Fast Weights */}
      {currentStep === 2 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-sm">2</span>
              Hebbian Synaptic Writes: Fast Weights as Working Memory
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Instead of appending tokens to a list, Pathway Dragon Hatchling (BDH) updates a fixed $d \times d$ synaptic matrix $A_t$ using a Hebbian outer-product write rule:
            </p>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-xs text-emerald-400 text-center">
              A_t = &lambda; A_{'{t-1}'} + &eta; (q_t &middot; k_t^T)
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="space-y-3 text-xs text-slate-300">
              <p>
                As tokens stream in, key-query correlations physically alter the connection strengths in A_t. The slow weights W_slow represent permanent pre-trained knowledge, while A_t serves as dynamic working memory.
              </p>
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                <span className="text-slate-400 font-semibold block uppercase text-[10px]">Mathematical Guarantee</span>
                <span className="font-mono text-emerald-400">Memory Complexity: O(d^2) = Constant O(1) wrt Sequence Length N</span>
              </div>
            </div>

            <MatrixHeatmap matrix={step3Sim[10].queryVector.map(() => lastStepRes.queryVector)} title="Live Hebbian Matrix A_t" />
          </div>

          <div className="flex justify-between items-center pt-2">
            <button
              onClick={() => setCurrentStep(1)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-sm font-medium hover:bg-slate-700"
            >
              Back
            </button>
            <button
              onClick={() => setCurrentStep(3)}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-sm flex items-center gap-2 hover:bg-emerald-400 shadow-lg shadow-emerald-500/20"
            >
              <span>Next: See The Catastrophic Catch</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Interference & Catastrophic Forgetting */}
      {currentStep === 3 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-sm">3</span>
              The Catch: Fast-Weight Interference & Catastrophic Forgetting
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              When a dense fast-weight matrix absorbs too many new associations or when the plasticity rate $\eta$ is set too high, old synaptic associations get overwritten—causing <strong className="text-rose-400">catastrophic forgetting</strong>.
            </p>
          </div>

          {/* Micro-Simulation Control */}
          <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold uppercase text-slate-300 mb-1">
                <span>Plasticity Rate (&eta;): {plasticity}</span>
                <span className={lastStepRes.baselineTaskAccuracy < 50 ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                  Task 1 Retention Accuracy: {lastStepRes.baselineTaskAccuracy}%
                </span>
              </div>
              <input
                type="range"
                min="0.05"
                max="1.0"
                step="0.05"
                value={plasticity}
                onChange={e => setPlasticity(Number(e.target.value))}
                className="w-full accent-emerald-400 cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 text-center text-xs">
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase">Old Task 1 Rule Accuracy</span>
                <span className={`text-base font-bold font-mono ${lastStepRes.baselineTaskAccuracy >= 80 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {lastStepRes.baselineTaskAccuracy}%
                </span>
              </div>
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase">New Task 2 Rule Accuracy</span>
                <span className="text-base font-bold font-mono text-cyan-400">
                  {lastStepRes.shiftedTaskAccuracy}%
                </span>
              </div>
            </div>

            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-xs text-rose-300 flex items-start gap-2">
              <HelpCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <p>
                <strong>Observe the Trade-off:</strong> High plasticity ($\eta &gt; 0.5$) lets the model adapt quickly to Task 2, but destroys memory of Task 1! How does Pathway BDH fix this without giving up constant memory?
              </p>
            </div>
          </div>

          <div className="flex justify-between items-center pt-2">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-sm font-medium hover:bg-slate-700"
            >
              Back
            </button>
            <button
              onClick={() => {
                setUseSparsity(true);
                setCurrentStep(4);
              }}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-sm flex items-center gap-2 hover:bg-emerald-400 shadow-lg shadow-emerald-500/20"
            >
              <span>Next: Pathway BDH 5% Sparsity Solution</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: BDH 5% Sparse Non-Negative Activations */}
      {currentStep === 4 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-sm">4</span>
              Pathway BDH Solution: Sparse Non-Negative Activations (~5% ReLU)
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Pathway Dragon Hatchling solves fast-weight interference by forcing activations to be <strong>sparse and non-negative (~5% active neurons via ReLU top-k)</strong>. Because only 5% of synapses fire at any token step, associations are stored in nearly orthogonal sub-spaces—preventing crosstalk!
            </p>
          </div>

          <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 uppercase">BDH Sparsity Mode</span>
              <button
                onClick={() => setUseSparsity(!useSparsity)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  useSparsity ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                }`}
              >
                {useSparsity ? 'ON (5% Sparse ReLU)' : 'OFF (Dense 100% Activations)'}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase block">Active Synapse Count</span>
                <span className="text-lg font-bold font-mono text-emerald-400">
                  {lastStepRes.activeNeuronCount} / {lastStepRes.activeNeuronPercent}%
                </span>
              </div>
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase block">Task 1 Retention</span>
                <span className={`text-lg font-bold font-mono ${lastStepRes.baselineTaskAccuracy > 70 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {lastStepRes.baselineTaskAccuracy}%
                </span>
              </div>
            </div>

            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-xs text-emerald-300 flex items-start gap-2">
              <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
              <p>
                <strong>Proof of Claim:</strong> With 5% sparsity active, Task 1 memory is retained even as Task 2 streams in! Synaptic interference drops significantly.
              </p>
            </div>
          </div>

          <div className="flex justify-between items-center pt-2">
            <button
              onClick={() => setCurrentStep(3)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-sm font-medium hover:bg-slate-700"
            >
              Back
            </button>
            <button
              onClick={() => setCurrentStep(5)}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-sm flex items-center gap-2 hover:bg-emerald-400 shadow-lg shadow-emerald-500/20"
            >
              <span>Next: BDH-CQ Latent Reasoning</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: BDH-CQ Recurrent Latent-Space Reasoning */}
      {currentStep === 5 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-sm">5</span>
              BDH-CQ: Thinking in Latent Space Without Generating Tokens
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              In addition to synaptic memory, Pathway&apos;s <strong>BDH-CQ</strong> architecture introduces recurrent latent compute steps. Instead of spilling out hundreds of written Chain-of-Thought (CoT) tokens, the network iteratively refines its internal hidden state $h_k$ to solve complex constraint puzzles like Sudoku Extreme or ARC-AGI.
            </p>
          </div>

          {/* Micro Slider */}
          <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-300 uppercase mb-1">
                <span>Latent Recurrent Compute Steps (k): {recurrentK}</span>
                <span className="text-emerald-400 font-mono">Accuracy: {currentLatentRes.cellAccuracy}%</span>
              </div>
              <input
                type="range"
                min="1"
                max="15"
                value={recurrentK}
                onChange={e => setRecurrentK(Number(e.target.value))}
                className="w-full accent-emerald-400 cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-3 gap-3 text-center text-xs">
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase block">Tokens Generated</span>
                <span className="text-sm font-bold font-mono text-emerald-400">0 Tokens (Pure Latent)</span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase block">Latency Overhead</span>
                <span className="text-sm font-bold font-mono text-cyan-400">{currentLatentRes.cumLatencyMs} ms</span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 text-[10px] uppercase block">Grid Cell Accuracy</span>
                <span className="text-sm font-bold font-mono text-emerald-400">{currentLatentRes.cellAccuracy}%</span>
              </div>
            </div>
          </div>

          {/* Real-time Pareto Frontier Graph */}
          <ParetoGraph
            activeK={recurrentK}
            puzzle={ARC_PUZZLES[0]}
            reasoningMode="latent-bdhcq"
            onKChange={(k) => setRecurrentK(k)}
          />

          <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                Walkthrough Complete! Unlock Full Interactive Sandboxes
              </h4>
              <p className="text-xs text-slate-300">
                Now test any hypothesis freely in the computational laboratories.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => onUnlockSandbox('fastweights')}
                className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition-all shadow-md"
              >
                Launch Synaptic Sandbox (Fast Weights)
              </button>
              <button
                onClick={() => onUnlockSandbox('latent')}
                className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition-all shadow-md"
              >
                Launch Latent Engine (BDH-CQ)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
