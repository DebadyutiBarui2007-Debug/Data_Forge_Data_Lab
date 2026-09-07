/**
 * ClaimBanner Component
 * Prominently presents the Falsifiable One-Sentence Claim and evaluation criteria.
 */

import React from 'react';
import { AudienceRole } from '../types';
import { Award, CheckCircle2, ShieldCheck, Sparkles, Zap } from 'lucide-react';

interface ClaimBannerProps {
  audienceRole: AudienceRole;
  onAudienceChange: (role: AudienceRole) => void;
}

export const ClaimBanner: React.FC<ClaimBannerProps> = ({
  audienceRole,
  onAudienceChange
}) => {
  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border-b border-slate-800 px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        
        {/* Claim Text */}
        <div className="flex items-start gap-3 flex-1">
          <div className="mt-0.5 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Falsifiable 1-Sentence Claim
              </span>
              <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                IIT KGP DataForge 2026 • Pathway Track
              </span>
            </div>
            <p className="text-xs md:text-sm font-medium text-slate-200 leading-relaxed italic">
              &ldquo;Synaptic plasticity via Hebbian fast weights combined with sparse non-negative activations (~5% ReLU) and recurrent latent reasoning enables fixed-size state architectures (Pathway BDH / BDH-CQ) to achieve constant O(1) inference memory and solve out-of-distribution reasoning tasks without O(N) KV-cache growth, subject to a critical fast-weight plasticity threshold.&rdquo;
            </p>
          </div>
        </div>

        {/* Audience Context Selector */}
        <div className="flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-800 shrink-0">
          <button
            onClick={() => onAudienceChange('learner')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              audienceRole === 'learner'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Learner</span>
          </button>

          <button
            onClick={() => onAudienceChange('judge')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              audienceRole === 'judge'
                ? 'bg-cyan-500 text-slate-950 shadow-md font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Judges (Pathway)</span>
          </button>

          <button
            onClick={() => onAudienceChange('educator')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              audienceRole === 'educator'
                ? 'bg-purple-500 text-white shadow-md font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>NeurIPS Edu</span>
          </button>
        </div>

      </div>
    </div>
  );
};
