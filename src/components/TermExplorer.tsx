/**
 * TermExplorer Component
 * Provides interactive definitions, mathematical formulas, and comparative context
 * for BDH-specific terminology (Hebbian writes, sparse activation, latent recurrence, etc.).
 * Accessible across all sandbox modes via floating tooltips and launcher drawer.
 */

import React, { useState } from 'react';
import { BookOpen, Search, X, Sparkles, Code, Cpu, Info, CheckCircle, ExternalLink } from 'lucide-react';

export interface BDHTerm {
  key: string;
  title: string;
  category: 'Architecture' | 'Memory' | 'Sparsity' | 'Reasoning' | 'Optimization';
  shortDef: string;
  fullDef: string;
  mathFormula?: string;
  bdhVsTransformer: string;
  tags: string[];
}

export const BDH_GLOSSARY: BDHTerm[] = [
  {
    key: 'hebbian-writes',
    title: 'Hebbian Synaptic Writes',
    category: 'Memory',
    shortDef: 'Dynamic updates to fast-weight synaptic matrices based on binding key-query outer products.',
    fullDef: 'Inspired by biological neuroplasticity ("neurons that fire together, wire together"), Hebbian writes store associative bindings directly into a fixed-size d x d weight matrix A_t at inference time, avoiding linear growth in RAM.',
    mathFormula: 'A_t = \\lambda A_{t-1} + \\eta (q_t \\cdot k_t^T)',
    bdhVsTransformer: 'Standard Transformers store every key and value vector in an ever-growing KV cache O(N). BDH compresses incoming key-value associations into the fixed matrix A_t O(1).',
    tags: ['Fast Weights', 'Memory', 'Outer Product', 'Plasticity']
  },
  {
    key: 'sparse-activation',
    title: '5% Sparse Non-Negative Activation',
    category: 'Sparsity',
    shortDef: 'Enforcing that roughly 5% of network neurons fire per step using Top-K non-negative ReLU.',
    fullDef: 'By suppressing 95% of activations per step and keeping non-negative representations, BDH creates orthogonal neural firing patterns that eliminate synaptic crosstalk and catastrophic interference when storing multiple memories.',
    mathFormula: '\\sigma(x) = \\text{Top-K}_{5\\%}(\\text{ReLU}(W x + b))',
    bdhVsTransformer: 'Standard Transformers use dense GELU/SiLU activations where 100% of neurons fire simultaneously, causing severe interference and memory corruption.',
    tags: ['Top-K ReLU', 'Sparsity', 'Crosstalk Mitigation', 'Non-negative']
  },
  {
    key: 'latent-recurrence',
    title: 'Latent Recurrence (BDH-CQ)',
    category: 'Reasoning',
    shortDef: 'Iterating state vectors across k internal compute steps directly in hidden representation space.',
    fullDef: 'BDH-CQ refines constraint satisfaction (e.g. Sudoku or ARC puzzle rules) by recycling the latent vector h_k through recurrence layers, increasing reasoning depth without emitting natural language text tokens.',
    mathFormula: 'h_{k+1} = \\text{LayerNorm}(h_k + \\sigma(W_{\\text{rec}} h_k + W_{\\text{in}} x))',
    bdhVsTransformer: 'Chain-of-Thought (CoT) Transformers require generating hundreds of text tokens step-by-step, multiplying latency and GPU cost by 20x-100x.',
    tags: ['Zero-Token Compute', 'BDH-CQ', 'Constraint Satisfaction', 'Pareto Frontier']
  },
  {
    key: 'fast-weights',
    title: 'Fast Weights',
    category: 'Architecture',
    shortDef: 'Dynamic synaptic connections that update rapidly during a single forward pass to serve as working memory.',
    fullDef: 'Fast weights act as a short-term memory substrate that stores context bindings during inference, complementing the static "slow weights" trained offline via backpropagation.',
    mathFormula: 'W_{\\text{eff}} = W_{\\text{slow}} + A_t^{\\text{fast}}',
    bdhVsTransformer: 'Transformers use explicit key-value sequences stored in external GPU RAM rather than parametric fast weight connections.',
    tags: ['Working Memory', 'Associative Recall', 'Plasticity', 'Substrate']
  },
  {
    key: 'slow-weights',
    title: 'Slow Weights',
    category: 'Architecture',
    shortDef: 'Pre-trained, static neural network parameters optimized during offline backpropagation.',
    fullDef: 'Slow weights encode long-term world knowledge, grammar, and general transformations. In BDH, slow weights project inputs into keys and queries that guide Hebbian fast-weight writes.',
    mathFormula: 'W \\in \\mathbb{R}^{d_{\\text{out}} \\times d_{\\text{in}}}',
    bdhVsTransformer: 'Identical in concept, but in standard Transformers, slow weights are the only weights present.',
    tags: ['Backpropagation', 'Static Weights', 'Long-term Memory']
  },
  {
    key: 'kv-cache',
    title: 'Key-Value (KV) Cache',
    category: 'Memory',
    shortDef: 'The linear memory buffer used by standard Transformers to store past token representations.',
    fullDef: 'As prompt lengths grow (e.g., to 10k or 100k tokens), the KV cache consumes gigabytes of VRAM and introduces quadratic prefill bottlenecks. BDH replaces the KV cache entirely with constant-memory fast weights.',
    mathFormula: 'M_{\\text{KV}} = 2 \\cdot N \\cdot L \\cdot d_{\\text{head}} \\cdot n_{\\text{heads}} \\quad \\mathcal{O}(N)',
    bdhVsTransformer: 'BDH maintains O(1) constant memory footprint regardless of sequence length N.',
    tags: ['VRAM Overhead', 'Context Limit', 'Quadratic Bottleneck']
  },
  {
    key: 'catastrophic-crosstalk',
    title: 'Synaptic Crosstalk & Interference',
    category: 'Optimization',
    shortDef: 'Memory degradation occurring when overlapping dense activations overwrite fast-weight memories.',
    fullDef: 'When dense activations update a fast-weight matrix, non-orthogonal state updates bleed into existing synaptic values, destroying previously stored associations. BDH 5% sparse ReLU solves this by ensuring distinct firing paths.',
    mathFormula: '\\langle \\sigma(x_i), \\sigma(x_j) \\rangle \\approx 0 \\quad \\text{(Orthogonal)}',
    bdhVsTransformer: 'Dense models suffer catastrophic forgetting when forced to store multiple new facts in a single context window.',
    tags: ['Forgetting', 'Interference', 'Orthogonality', 'Rule-Shift']
  },
  {
    key: 'dragon-hatchling',
    title: 'Dragon Hatchling (BDH)',
    category: 'Architecture',
    shortDef: 'Pathway\'s sub-quadratic neural architecture featuring associative fast weights and sparse representations.',
    fullDef: 'Developed by Pathway, BDH achieves linear sequence processing complexity and constant working memory while maintaining associative reasoning power competitive with standard dense Transformers.',
    bdhVsTransformer: 'Delivers 10x-50x lower latency and memory usage on long-context and multi-step reasoning tasks.',
    tags: ['Pathway', 'Sub-quadratic', 'Frontier Model', 'Neuromorphic']
  },
  {
    key: 'pareto-frontier',
    title: 'Latency vs Compute-Efficiency Pareto Frontier',
    category: 'Optimization',
    shortDef: 'The trade-off boundary showing maximum accuracy achieved for a given inference latency limit.',
    fullDef: 'BDH-CQ defines an optimal Pareto frontier: by tuning latent steps k, users achieve up to 98%+ constraint accuracy at <30ms latency, compared to CoT Transformer baselines taking 1,000ms+.',
    bdhVsTransformer: 'Standard CoT sits far off the Pareto frontier due to high token generation overhead.',
    tags: ['Pareto Optimal', 'Efficiency', 'Latency', 'Benchmark']
  }
];

interface TermExplorerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedKey?: string;
}

export const TermExplorer: React.FC<TermExplorerProps> = ({
  isOpen,
  onClose,
  selectedKey
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [activeTermKey, setActiveTermKey] = useState<string>(selectedKey || 'hebbian-writes');

  if (!isOpen) return null;

  const categories = ['All', 'Architecture', 'Memory', 'Sparsity', 'Reasoning', 'Optimization'];

  const filteredTerms = BDH_GLOSSARY.filter(term => {
    const matchesCategory = activeCategory === 'All' || term.category === activeCategory;
    const matchesSearch = searchQuery === '' || 
      term.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      term.shortDef.toLowerCase().includes(searchQuery.toLowerCase()) ||
      term.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const activeTerm = BDH_GLOSSARY.find(t => t.key === activeTermKey) || BDH_GLOSSARY[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header Bar */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-400">
            <BookOpen className="w-5 h-5" />
            <h3 className="text-base font-bold text-slate-100 font-mono uppercase tracking-wider">
              BDH Technical Term Explorer & Glossary
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-100 hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filter Controls */}
        <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search BDH terms, equations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-all whitespace-nowrap ${
                  activeCategory === cat
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Content Body: Sidebar list + Detail view */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-800">
          
          {/* Term List Sidebar */}
          <div className="md:col-span-5 overflow-y-auto p-3 space-y-2 max-h-[400px] md:max-h-none">
            {filteredTerms.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500 font-mono">
                No matching terminology found.
              </div>
            ) : (
              filteredTerms.map(term => {
                const isSelected = term.key === activeTermKey;
                return (
                  <div
                    key={term.key}
                    onClick={() => setActiveTermKey(term.key)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-emerald-500/10 border-emerald-500/50 text-slate-100 shadow-md'
                        : 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:bg-slate-800/60 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-bold font-mono">{term.title}</h4>
                      <span className="text-[9px] font-mono uppercase bg-slate-800 text-emerald-400 px-1.5 py-0.5 rounded border border-slate-700">
                        {term.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                      {term.shortDef}
                    </p>
                  </div>
                );
              })
            )}
          </div>

          {/* Active Term Details View */}
          <div className="md:col-span-7 overflow-y-auto p-6 space-y-5 bg-slate-950/40">
            {activeTerm && (
              <>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      {activeTerm.category}
                    </span>
                    <h3 className="text-lg font-bold text-slate-100 font-mono">{activeTerm.title}</h3>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed mt-2 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                    {activeTerm.fullDef}
                  </p>
                </div>

                {/* Math Formula if present */}
                {activeTerm.mathFormula && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold flex items-center gap-1">
                      <Code className="w-3.5 h-3.5" /> Mathematical Formulation
                    </span>
                    <div className="bg-slate-950 p-3 rounded-lg border border-cyan-900/40 font-mono text-xs text-cyan-300 text-center shadow-inner">
                      {activeTerm.mathFormula}
                    </div>
                  </div>
                )}

                {/* BDH vs Standard Transformer Comparison */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono uppercase text-purple-400 font-bold flex items-center gap-1">
                    <Cpu className="w-3.5 h-3.5" /> BDH vs. Standard Transformer Baseline
                  </span>
                  <div className="bg-purple-950/20 p-3 rounded-lg border border-purple-900/40 text-xs text-purple-200 leading-relaxed">
                    {activeTerm.bdhVsTransformer}
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-800">
                  {activeTerm.tags.map(tag => (
                    <span
                      key={tag}
                      className="text-[10px] font-mono bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

/**
 * TermTooltip Component
 * Interactive term hover card wrapper to embed anywhere across sandbox modes.
 */
interface TermTooltipProps {
  termKey: string;
  children?: React.ReactNode;
  className?: string;
  onOpenExplorer?: (termKey: string) => void;
}

export const TermTooltip: React.FC<TermTooltipProps> = ({
  termKey,
  children,
  className = '',
  onOpenExplorer
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const term = BDH_GLOSSARY.find(t => t.key === termKey);

  if (!term) {
    return <span className={className}>{children}</span>;
  }

  return (
    <span
      className="relative inline-block cursor-help group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span className={`border-b border-dashed border-emerald-400 text-emerald-300 font-medium hover:text-emerald-200 transition ${className}`}>
        {children || term.title}
      </span>

      {/* Hover Card Popup */}
      {isHovered && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3 bg-slate-900 border border-emerald-500/40 rounded-xl shadow-2xl pointer-events-auto animate-fadeIn text-left">
          <div className="flex items-center justify-between gap-1 border-b border-slate-800 pb-1.5 mb-1.5">
            <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase">
              {term.title}
            </span>
            <span className="text-[9px] font-mono bg-emerald-500/10 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-500/30">
              {term.category}
            </span>
          </div>

          <p className="text-[11px] text-slate-300 leading-snug">
            {term.shortDef}
          </p>

          {term.mathFormula && (
            <div className="mt-2 p-1.5 bg-slate-950 rounded border border-slate-800 font-mono text-[10px] text-cyan-300 text-center">
              {term.mathFormula}
            </div>
          )}

          {onOpenExplorer && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenExplorer(term.key);
              }}
              className="mt-2 w-full text-center text-[10px] font-mono font-bold text-emerald-400 hover:text-emerald-300 bg-slate-800 hover:bg-slate-700 py-1 rounded transition flex items-center justify-center gap-1"
            >
              <ExternalLink className="w-3 h-3" /> Explore Full Term & Math
            </button>
          )}
        </div>
      )}
    </span>
  );
};

/**
 * FloatingTermExplorerLauncher Component
 * Floating pill button present on all sandbox screens to trigger Term Explorer drawer.
 */
export const FloatingTermExplorerLauncher: React.FC<{
  onOpen: () => void;
}> = ({ onOpen }) => {
  return (
    <button
      onClick={onOpen}
      className="fixed bottom-5 right-5 z-40 bg-slate-900 hover:bg-slate-800 border border-emerald-500/50 text-emerald-400 font-mono text-xs font-bold px-3.5 py-2.5 rounded-full shadow-2xl flex items-center gap-2 group transition-all duration-300 hover:scale-105"
      title="Open BDH Interactive Term Explorer & Glossary"
    >
      <span className="p-1 rounded-full bg-emerald-500/20 text-emerald-300 group-hover:rotate-12 transition-transform">
        <BookOpen className="w-4 h-4" />
      </span>
      <span>BDH Term Explorer</span>
      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
    </button>
  );
};
