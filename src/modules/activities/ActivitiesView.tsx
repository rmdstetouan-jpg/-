import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Search,
  Filter,
  Calendar,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  Sparkles,
  FileText,
  UserCheck,
  Check,
  ChevronRight,
  Palette
} from 'lucide-react';
import type { Activity, ActivityStatus, UserProfile } from '../../types';

interface ActivitiesViewProps {
  activities: Activity[];
  onOpenNewActivity: () => void;
  currentUser: UserProfile;
  onSelectActivity?: (activity: Activity) => void;
  onDesignPoster?: (activity: Activity) => void;
  onOpenActivityRoom?: () => void;
}

export const ActivitiesView: React.FC<ActivitiesViewProps> = ({
  activities,
  onOpenNewActivity,
  currentUser,
  onSelectActivity,
  onDesignPoster,
  onOpenActivityRoom
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedActivityForCheck, setSelectedActivityForCheck] = useState<Activity | null>(null);

  const filteredActivities = activities.filter((act) => {
    const matchesSearch =
      act.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (act.responsiblePerson && act.responsiblePerson.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || act.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: ActivityStatus) => {
    const map: Record<ActivityStatus, { label: string; bg: string; text: string; border: string }> = {
      Idea: { label: 'فكرة', bg: 'bg-purple-950/80', text: 'text-purple-300', border: 'border-purple-800' },
      Draft: { label: 'مسودة', bg: 'bg-slate-800', text: 'text-slate-300', border: 'border-slate-700' },
      Planned: { label: 'مخطط له', bg: 'bg-sky-950/80', text: 'text-sky-300', border: 'border-sky-800' },
      'In Preparation': { label: 'قيد التحضير', bg: 'bg-amber-950/80', text: 'text-amber-300', border: 'border-amber-800' },
      Ready: { label: 'جاهز للتنفيذ', bg: 'bg-emerald-950/80', text: 'text-emerald-300', border: 'border-emerald-800' },
      Completed: { label: 'تم الإنجاز', bg: 'bg-blue-950/80', text: 'text-blue-300', border: 'border-blue-800' },
      Documentation: { label: 'قيد التوثيق', bg: 'bg-indigo-950/80', text: 'text-indigo-300', border: 'border-indigo-800' },
      Complete: { label: 'مكتمل ومعتمد', bg: 'bg-emerald-900/90', text: 'text-emerald-200', border: 'border-emerald-700' },
      Archived: { label: 'مؤرشف', bg: 'bg-zinc-900', text: 'text-zinc-400', border: 'border-zinc-800' }
    };
    const s = map[status] || map.Draft;
    return (
      <span className={`px-2 py-0.5 rounded text-[11px] font-medium border ${s.bg} ${s.text} ${s.border}`}>
        {s.label}
      </span>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-400" />
            <span>إدارة الأنشطة والفعاليات (Activities Hub)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            القلب المركزي لنظام مِداد: إدخال المعلومة مرة واحدة لتغذية كافة المراسلات والتقارير والملصقات
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onOpenActivityRoom && (
            <button
              onClick={onOpenActivityRoom}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg font-bold text-xs transition-all shadow-lg shadow-emerald-950/50 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>إنشاء غرفة نشاط جديدة</span>
            </button>
          )}

          <button
            onClick={onOpenNewActivity}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg font-medium text-xs transition-colors"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>+ نموذج سريع</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row items-center gap-3 bg-slate-900 border border-slate-800 p-3 rounded-xl">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute right-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث في الأنشطة بالاسم، المدينة، النوع، أو المسؤول..."
            className="w-full pl-3 pr-9 py-1.5 bg-slate-950 border border-slate-700/80 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-950 border border-slate-700/80 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">جميع الحالات</option>
            <option value="Idea">فكرة</option>
            <option value="Draft">مسودة</option>
            <option value="Planned">مخطط له</option>
            <option value="In Preparation">قيد التحضير</option>
            <option value="Ready">جاهز للتنفيذ</option>
            <option value="Completed">تم الإنجاز</option>
            <option value="Documentation">قيد التوثيق</option>
            <option value="Complete">مكتمل</option>
          </select>
        </div>
      </div>

      {/* Activities Grid */}
      {filteredActivities.length === 0 ? (
        <div className="text-center py-16 px-4 bg-slate-900/50 border border-slate-800/80 rounded-2xl space-y-4">
          <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
            <Layers className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">لا توجد أنشطة مسجلة بعد</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              سجل النشاط الأول للرابطة لبدء توليد الوثائق والتصاميم والتقارير تلقائياً وتوثيقها في الذاكرة المؤسسية.
            </p>
          </div>
          <button
            onClick={onOpenNewActivity}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ إنشاء أول نشاط</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredActivities.map((act) => (
            <div
              key={act.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-xl p-4 flex flex-col justify-between transition-all hover:shadow-xl group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  {getStatusBadge(act.status)}
                  <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                    {act.type}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors line-clamp-2">
                    {act.title}
                  </h3>
                  {act.slogan && (
                    <p className="text-xs text-amber-400/90 font-serif italic mt-1 line-clamp-1">
                      «{act.slogan}»
                    </p>
                  )}
                </div>

                <div className="space-y-1.5 text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{act.date} {act.time ? `(${act.time})` : ''}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-sky-400" />
                    <span className="truncate">{act.city} — {act.location}</span>
                  </div>
                </div>

                {/* Readiness Score Progress Bar */}
                <div className="pt-2">
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-slate-400">درجة الجاهزية المؤسسية:</span>
                    <span className="font-mono font-bold text-emerald-400">{act.readinessScore || 20}%</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        (act.readinessScore || 20) >= 80
                          ? 'bg-emerald-500'
                          : (act.readinessScore || 20) >= 50
                          ? 'bg-amber-500'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${act.readinessScore || 20}%` }}
                    />
                  </div>
                </div>

                {/* Badges of linked components */}
                <div className="flex flex-wrap gap-1 pt-1 text-[10px]">
                  <span className={`px-1.5 py-0.5 rounded border ${act.hasPoster ? 'bg-emerald-950 text-emerald-300 border-emerald-800' : 'bg-slate-950 text-slate-500 border-slate-800'}`}>
                    {act.hasPoster ? '✓ الملصق' : '○ الملصق'}
                  </span>
                  <span className={`px-1.5 py-0.5 rounded border ${act.hasProgram ? 'bg-emerald-950 text-emerald-300 border-emerald-800' : 'bg-slate-950 text-slate-500 border-slate-800'}`}>
                    {act.hasProgram ? '✓ البرنامج' : '○ البرنامج'}
                  </span>
                  <span className={`px-1.5 py-0.5 rounded border ${act.hasInvitations ? 'bg-emerald-950 text-emerald-300 border-emerald-800' : 'bg-slate-950 text-slate-500 border-slate-800'}`}>
                    {act.hasInvitations ? '✓ الدعوات' : '○ الدعوات'}
                  </span>
                  <span className={`px-1.5 py-0.5 rounded border ${act.hasReport ? 'bg-emerald-950 text-emerald-300 border-emerald-800' : 'bg-slate-950 text-slate-500 border-slate-800'}`}>
                    {act.hasReport ? '✓ التقرير' : '○ التقرير'}
                  </span>
                </div>
              </div>

              {/* Action footer */}
              <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-800/80">
                <button
                  onClick={() => setSelectedActivityForCheck(act)}
                  className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>هل نسيت شيئاً؟</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onDesignPoster && onDesignPoster(act)}
                    className="text-[11px] text-emerald-400 hover:text-white flex items-center gap-1 font-medium bg-emerald-950/70 hover:bg-emerald-800 border border-emerald-800/80 px-2 py-1 rounded transition-colors"
                    title="توليد وتصميم الملصق الرسمي لهذا النشاط"
                  >
                    <Palette className="w-3 h-3" />
                    <span>الملصق</span>
                  </button>

                  <button
                    onClick={() => onSelectActivity && onSelectActivity(act)}
                    className="text-[11px] text-slate-300 hover:text-white flex items-center gap-1 font-medium bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded"
                  >
                    <span>التفاصيل</span>
                    <ChevronRight className="w-3 h-3 rotate-180" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* "هل نسيت شيئاً؟" Modal / Drawer */}
      {selectedActivityForCheck && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white text-sm">
                  فحص الجاهزية والملفات الناقصة — «هل نسيت شيئاً؟»
                </h3>
              </div>
              <button
                onClick={() => setSelectedActivityForCheck(null)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded bg-slate-800"
              >
                إغلاق
              </button>
            </div>

            <div>
              <p className="text-xs text-slate-300 font-semibold mb-1">النشاط المستهدف:</p>
              <p className="text-sm font-bold text-emerald-400">{selectedActivityForCheck.title}</p>
              <p className="text-xs text-slate-500 mt-0.5">التاريخ: {selectedActivityForCheck.date} | المدينة: {selectedActivityForCheck.city}</p>
            </div>

            <div className="space-y-2.5 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-xs font-bold text-slate-300 block mb-2">قائمة التحقق المؤسساتية (Checklist):</span>
              
              <div className="flex items-center justify-between text-xs py-1.5 border-b border-slate-900">
                <span className="text-slate-300">تصميم واعتماد الملصق الرسمي (Poster):</span>
                {selectedActivityForCheck.hasPoster ? (
                  <span className="text-emerald-400 font-medium flex items-center gap-1">✓ مكتمل</span>
                ) : (
                  <span className="text-amber-400 font-medium flex items-center gap-1">⚠️ ناقص — لم يتم توليد الملصق بعد</span>
                )}
              </div>

              <div className="flex items-center justify-between text-xs py-1.5 border-b border-slate-900">
                <span className="text-slate-300">برنامج وتوقيت المداخلات (Program):</span>
                {selectedActivityForCheck.hasProgram ? (
                  <span className="text-emerald-400 font-medium flex items-center gap-1">✓ مكتمل</span>
                ) : (
                  <span className="text-amber-400 font-medium flex items-center gap-1">⚠️ ناقص — البرنامج غير مرفق</span>
                )}
              </div>

              <div className="flex items-center justify-between text-xs py-1.5 border-b border-slate-900">
                <span className="text-slate-300">توجيه بطاقات الدعوة للشركاء والضيوف:</span>
                {selectedActivityForCheck.hasInvitations ? (
                  <span className="text-emerald-400 font-medium flex items-center gap-1">✓ مكتمل</span>
                ) : (
                  <span className="text-amber-400 font-medium flex items-center gap-1">⚠️ ناقص — الدعوات لم تعتمد</span>
                )}
              </div>

              <div className="flex items-center justify-between text-xs py-1.5 border-b border-slate-900">
                <span className="text-slate-300">لائحة توقيعات الحضور الفعلي:</span>
                {selectedActivityForCheck.hasAttendance ? (
                  <span className="text-emerald-400 font-medium flex items-center gap-1">✓ مكتمل</span>
                ) : (
                  <span className="text-slate-500 font-medium">○ غير مرفوع بعد (يتم بعد التنفيذ)</span>
                )}
              </div>

              <div className="flex items-center justify-between text-xs py-1.5">
                <span className="text-slate-300">التقرير الأدبي والمالي للنشاط:</span>
                {selectedActivityForCheck.hasReport ? (
                  <span className="text-emerald-400 font-medium flex items-center gap-1">✓ معتمد</span>
                ) : (
                  <span className="text-slate-500 font-medium">○ قيد التوثيق</span>
                )}
              </div>
            </div>

            <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-lg text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>مِداد يساعدك في إنشاء كل وثيقة بنقرة واحدة مستخدماً البيانات المعتمدة في هذا النشاط دون إعادة إدخالها.</span>
            </div>

            {!selectedActivityForCheck.hasPoster && (
              <button
                onClick={() => {
                  const act = selectedActivityForCheck;
                  setSelectedActivityForCheck(null);
                  if (onDesignPoster) onDesignPoster(act);
                }}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-950/50"
              >
                <Palette className="w-4 h-4 text-amber-300" />
                <span>توليد وتصميم الملصق الرسمي الآن بـ AI Design Engine</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
