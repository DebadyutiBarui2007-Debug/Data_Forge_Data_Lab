import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cpu, Sparkles, Activity, Layers, ShieldCheck, Zap } from 'lucide-react';

interface AppLoaderProps {
  onComplete: () => void;
  durationMs?: number; // default 2800ms
}

const BOOT_STAGES = [
  { progress: 15, label: 'Initializing Hebbian Matrix W_fast ∈ ℝ¹²⁸ˣ¹²⁸...', icon: Cpu },
  { progress: 40, label: 'Enforcing 5% Top-K Monosemantic Sparsity Mask...', icon: Layers },
  { progress: 70, label: 'Calibrating Zero-Token Latent Reasoning Engine...', icon: Zap },
  { progress: 90, label: 'Quantizing BDH-CQ 2-Bit Codebook Projection...', icon: Activity },
  { progress: 100, label: 'DataForge BDH Lab Environment Ready', icon: ShieldCheck }
];

export const AppLoader: React.FC<AppLoaderProps> = ({ onComplete, durationMs = 2800 }) => {
  const [progress, setProgress] = useState(0);
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.floor((elapsed / durationMs) * 100));
      setProgress(pct);

      if (pct < 25) setStageIndex(0);
      else if (pct < 55) setStageIndex(1);
      else if (pct < 80) setStageIndex(2);
      else if (pct < 98) setStageIndex(3);
      else setStageIndex(4);

      if (elapsed >= durationMs) {
        clearInterval(interval);
        setTimeout(() => {
          onComplete();
        }, 300);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [durationMs, onComplete]);

  const CurrentIcon = BOOT_STAGES[stageIndex].icon;

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.98, filter: 'blur(8px)' }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center p-6 selection:bg-emerald-500 selection:text-slate-950 overflow-hidden"
    >
      {/* Background Subtle Cybernetic Matrix Grid & Ambient Glows */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.08)_0%,transparent_65%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b12_1px,transparent_1px),linear-gradient(to_bottom,#1e293b12_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* Floating Synaptic Particles (Decorative SVGs) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full bg-emerald-400/30"
            style={{
              top: `${(i * 17) % 90 + 5}%`,
              left: `${(i * 23) % 90 + 5}%`
            }}
            animate={{
              y: [-10, 10, -10],
              opacity: [0.2, 0.7, 0.2],
              scale: [0.8, 1.4, 0.8]
            }}
            transition={{
              duration: 3 + (i % 3),
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.2
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-md w-full flex flex-col items-center text-center space-y-8">
        
        {/* Central Futuristic Neural Core Ring Visualizer */}
        <div className="relative w-32 h-32 flex items-center justify-center">
          
          {/* Outer Pulsing Outer Halo */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 rounded-full border border-dashed border-emerald-500/40"
          />

          {/* Reverse Orbit Counter Ring */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-2 rounded-full border border-cyan-500/30 border-t-cyan-400 border-b-cyan-400"
          />

          {/* Core Pulsing Glow Circle */}
          <motion.div
            animate={{ scale: [0.95, 1.08, 0.95], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute inset-4 rounded-full bg-gradient-to-br from-emerald-500/20 via-cyan-500/20 to-purple-500/20 border border-emerald-400/50 backdrop-blur-md flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.3)]"
          />

          {/* Animated Central Synaptic Node Icon */}
          <motion.div
            key={stageIndex}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="relative z-10 text-emerald-400"
          >
            <CurrentIcon className="w-10 h-10 drop-shadow-[0_0_12px_rgba(16,185,129,0.8)]" />
          </motion.div>
        </div>

        {/* Branding & Subtitle */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Pathway Track • DataForge 2026</span>
          </div>

          <h1 className="text-2xl font-extrabold text-white tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-300 via-cyan-200 to-indigo-300">
            DataForge BDH Lab
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            Dragon Hatchling (BDH & BDH-CQ) Architecture Explainer
          </p>
        </div>

        {/* Real-time Stage Status Bar */}
        <div className="w-full space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <div className="flex items-center gap-1.5 text-emerald-400 font-medium truncate max-w-[280px]">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
              <span className="truncate">{BOOT_STAGES[stageIndex].label}</span>
            </div>
            <span className="font-bold text-emerald-400 shrink-0">{progress}%</span>
          </div>

          {/* Progress Bar Track */}
          <div className="h-2 w-full bg-slate-900 rounded-full border border-slate-800 p-0.5 overflow-hidden shadow-inner">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-cyan-400 to-indigo-500 shadow-[0_0_12px_rgba(16,185,129,0.6)]"
              style={{ width: `${progress}%` }}
              transition={{ ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Micro Tech Footer Badges */}
        <div className="pt-2 flex items-center justify-center gap-4 text-[10px] font-mono text-slate-500">
          <span>O(1) Memory Engine</span>
          <span>•</span>
          <span>5% Top-K Monosemantic</span>
          <span>•</span>
          <span>Zero-Token Latent</span>
        </div>

      </div>
    </motion.div>
  );
};
