import React from 'react';
import { Lock, Sparkles, CheckCircle2, ArrowRight, Layers, FileText, Bot, FolderArchive } from 'lucide-react';

interface PhasePlaceholderViewProps {
  moduleName: string;
  targetPhase: number;
  description: string;
  features: string[];
  onBackToDashboard: () => void;
}

export const PhasePlaceholderView: React.FC<PhasePlaceholderViewProps> = ({
  moduleName,
  targetPhase,
  description,
  features,
  onBackToDashboard
}) => {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-5 shadow-2xl relative overflow-hidden">
        <div className="w-16 h-16 rounded-2xl bg-amber-950/60 border border-amber-800/80 flex items-center justify-center mx-auto text-amber-400 shadow-inner">
          <Lock className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono uppercase tracking-wider text-amber-400 bg-amber-950/80 border border-amber-800 px-2.5 py-1 rounded-full">
            المرحلة القادمة في خريطة الطريق: Phase {targetPhase}
          </span>
          <h2 className="text-xl font-bold text-white tracking-tight">{moduleName}</h2>
          <p className="text-xs text-slate-400 max-w-lg mx-auto leading-relaxed">
            {description}
          </p>
        </div>

        {/* Feature roadmap list */}
        <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 text-right max-w-lg mx-auto space-y-2.5">
          <span className="text-xs font-bold text-slate-300 block mb-2">المواصفات الهندسية المبرمجة لهذه الوحدة:</span>
          {features.map((feat, idx) => (
            <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>{feat}</span>
            </div>
          ))}
        </div>

        <div className="pt-3">
          <button
            onClick={onBackToDashboard}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-lg transition-all"
          >
            العودة إلى لوحة التحكم المؤسساتية (Phase 1)
          </button>
        </div>
      </div>
    </div>
  );
};
