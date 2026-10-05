import React, { useState, useEffect } from 'react';
import { Search, X, Layers, ShieldCheck, Clock, FileText, ArrowRight, Sparkles } from 'lucide-react';
import type { Activity } from '../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  activities: Activity[];
  onNavigate: (module: string) => void;
  onOpenNewActivity: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  activities,
  onNavigate,
  onOpenNewActivity
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredActivities = activities.filter(
    (a) =>
      a.title.toLowerCase().includes(query.toLowerCase()) ||
      a.city.toLowerCase().includes(query.toLowerCase()) ||
      a.type.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-start justify-center pt-20 p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden divide-y divide-slate-800">
        {/* Search Input */}
        <div className="flex items-center px-4 py-3 gap-3">
          <Search className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="البحث الشامل في مِداد (أنشطة، وثائق، شركاء، سجلات، أو أوامر)..."
            className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none font-medium"
          />
          <kbd className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400 font-mono border border-slate-700">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="p-3 max-h-96 overflow-y-auto space-y-3 text-xs">
          {/* Quick Actions */}
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2 block mb-1">
              إجراءات سريعة
            </span>
            <div className="space-y-1">
              <button
                onClick={() => {
                  onClose();
                  onOpenNewActivity();
                }}
                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-emerald-950/50 hover:text-emerald-300 text-slate-300 text-right transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  <span className="font-semibold">+ تسجيل نشاط مؤسساتي جديد</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">Ctrl+N</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onNavigate('brand');
                }}
                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-800 text-slate-300 text-right transition-colors"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>فتح مركز الهوية الرسمية (Brand Center)</span>
                </div>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onNavigate('audit');
                }}
                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-800 text-slate-300 text-right transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-sky-400" />
                  <span>عرض سجل العمليات وتتبع التعديلات (Audit Log)</span>
                </div>
              </button>
            </div>
          </div>

          {/* Activities Matches */}
          {filteredActivities.length > 0 && (
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2 block mb-1">
                الأنشطة المؤسساتية المطابقة ({filteredActivities.length})
              </span>
              <div className="space-y-1">
                {filteredActivities.slice(0, 5).map((act) => (
                  <button
                    key={act.id}
                    onClick={() => {
                      onClose();
                      onNavigate('activities');
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-800 text-slate-300 text-right transition-colors"
                  >
                    <div>
                      <div className="font-bold text-white text-xs">{act.title}</div>
                      <div className="text-[10px] text-slate-400">
                        {act.date} | {act.city} — {act.type}
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                      {act.status}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
