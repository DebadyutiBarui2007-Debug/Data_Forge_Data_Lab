/**
 * DataForge BDH Lab: Main App Component
 * IIT KGP DataForge 2026 Hackathon (Pathway Track) & NeurIPS 2026 Education Track
 */

import React, { useState } from 'react';
import { AppMode, AudienceRole } from './types';
import { Header } from './components/Header';
import { ClaimBanner } from './components/ClaimBanner';
import { GuidedTutorial } from './components/GuidedTutorial';
import { FastWeightsSandbox } from './components/FastWeightsSandbox';
import { LatentEngineSandbox } from './components/LatentEngineSandbox';
import { BdhArchitectureDeepDive } from './components/BdhArchitectureDeepDive';
import { ParetoBenchmarkAnalyzer } from './components/ParetoBenchmarkAnalyzer';
import { TermExplorer, FloatingTermExplorerLauncher } from './components/TermExplorer';
import { Award, BookOpen, Sparkles, Zap } from 'lucide-react';

export default function App() {
  const [currentMode, setCurrentMode] = useState<AppMode>('guided');
  const [audienceRole, setAudienceRole] = useState<AudienceRole>('judge');
  const [isExplorerOpen, setIsExplorerOpen] = useState(false);
  const [selectedTermKey, setSelectedTermKey] = useState<string | undefined>(undefined);

  const handleOpenExplorer = (termKey?: string) => {
    setSelectedTermKey(termKey);
    setIsExplorerOpen(true);
  };

  const handleUnlockSandbox = (targetSandbox: 'fastweights' | 'latent') => {
    if (targetSandbox === 'fastweights') {
      setCurrentMode('sandbox-fastweights');
    } else {
      setCurrentMode('sandbox-latent');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      
      {/* App Header */}
      <Header currentMode={currentMode} onModeChange={setCurrentMode} />

      {/* Claim Banner & Audience Role Selector */}
      <ClaimBanner audienceRole={audienceRole} onAudienceChange={setAudienceRole} />

      {/* Audience Context Message Bar */}
      <div className="bg-slate-900/80 border-b border-slate-800/80 px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-slate-300">
          {audienceRole === 'judge' && (
            <div className="flex items-center gap-2 text-cyan-400 font-medium">
              <Award className="w-4 h-4 shrink-0" />
              <span>
                <strong>Judges Perspective (IIT KGP & Pathway):</strong> Validating real computational matrix substrate, zero-token latent recurrence, and BDH 5% sparse activation mechanics.
              </span>
            </div>
          )}

          {audienceRole === 'learner' && (
            <div className="flex items-center gap-2 text-emerald-400 font-medium">
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>
                <strong>Learner Perspective (Data Scientist):</strong> Hands-on computational intuition for Hebbian fast weights, memory overhead, and catastrophic forgetting.
              </span>
            </div>
          )}

          {audienceRole === 'educator' && (
            <div className="flex items-center gap-2 text-purple-400 font-medium">
              <Zap className="w-4 h-4 shrink-0" />
              <span>
                <strong>NeurIPS Edu Perspective:</strong> Open-source self-contained visual essay & interactive lab bridging frontier research to classroom instruction.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main Mode View */}
      <main className="flex-1">
        {currentMode === 'guided' && (
          <GuidedTutorial onUnlockSandbox={handleUnlockSandbox} />
        )}

        {currentMode === 'sandbox-fastweights' && (
          <FastWeightsSandbox />
        )}

        {currentMode === 'sandbox-latent' && (
          <LatentEngineSandbox />
        )}

        {currentMode === 'deepdive' && (
          <BdhArchitectureDeepDive onOpenExplorer={handleOpenExplorer} />
        )}

        {currentMode === 'benchmark' && (
          <ParetoBenchmarkAnalyzer />
        )}
      </main>

      {/* Floating Term Explorer Launcher Button (Accessible on ALL pages/modes) */}
      <FloatingTermExplorerLauncher onOpen={() => handleOpenExplorer()} />

      {/* Term Explorer Overlay Modal */}
      <TermExplorer
        isOpen={isExplorerOpen}
        onClose={() => setIsExplorerOpen(false)}
        selectedKey={selectedTermKey}
      />

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800/80 px-4 py-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-200">DataForge BDH Lab</span>
            <span>•</span>
            <span>Pathway Dragon Hatchling (BDH / BDH-CQ) Explainer</span>
          </div>
          <div className="text-slate-400 font-mono text-[11px]">
            IIT KGP DataForge 2026 Hackathon • Pathway Track • NeurIPS 2026 Education Track
          </div>
        </div>
      </footer>

    </div>
  );
}
