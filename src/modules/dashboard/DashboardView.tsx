import React from 'react';
import {
  Layers,
  FileText,
  Users,
  Building2,
  Calendar,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  TrendingUp,
  ShieldCheck,
  Plus,
  Compass,
  FileCheck,
  Palette,
  BarChart3,
  PieChart as PieChartIcon,
  Check
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import type { Activity, AuditLogItem, OrganizationBranding, UserProfile } from '../../types';

interface DashboardViewProps {
  branding: OrganizationBranding;
  activities: Activity[];
  auditLogs: AuditLogItem[];
  currentUser: UserProfile;
  onOpenNewActivity: () => void;
  onOpenBrandCenter: () => void;
  onNavigate: (module: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  branding,
  activities,
  auditLogs,
  currentUser,
  onOpenNewActivity,
  onOpenBrandCenter,
  onNavigate
}) => {
  // Real calculations
  const upcomingActivities = activities.filter(
    (a) => a.status === 'Planned' || a.status === 'In Preparation' || a.status === 'Ready'
  );

  const ongoingActivities = activities.filter(
    (a) => a.status === 'Planned' || a.status === 'In Preparation' || a.status === 'Ready'
  );

  const completedActivities = activities.filter(
    (a) => a.status === 'Completed' || a.status === 'Complete' || a.status === 'Documentation' || a.status === 'Archived'
  );

  const draftActivities = activities.filter(
    (a) => a.status === 'Draft' || a.status === 'Idea'
  );

  const approvedPosters = activities.filter((a) => a.hasPoster);

  const pendingApprovalsCount = activities.filter((a) => !a.hasReport || !a.hasPoster).length;
  
  const avgReadiness =
    activities.length > 0
      ? Math.round(activities.reduce((acc, a) => acc + (a.readinessScore || 20), 0) / activities.length)
      : 0;

  // Status Distribution for Donut Chart
  const statusChartData = [
    { name: 'أنشطة جارية ومخططة', value: Math.max(ongoingActivities.length, activities.length === 0 ? 1 : 0), color: '#10B981' },
    { name: 'أنشطة منجزة وموثقة', value: completedActivities.length, color: '#0EA5E9' },
    { name: 'مسودات وأفكار', value: draftActivities.length, color: '#F59E0B' }
  ];

  // Activities vs Approved Posters by Type for Bar Chart
  const typeChartData = [
    {
      name: 'ندوات فكرية',
      أنشطة: activities.filter((a) => a.type === 'ندوة فكرية').length,
      ملصقات_معتمدة: activities.filter((a) => a.type === 'ندوة فكرية' && a.hasPoster).length
    },
    {
      name: 'قوافل تضامنية',
      أنشطة: activities.filter((a) => a.type === 'قافلة خيرية' || a.type === 'نشاط تضامني').length,
      ملصقات_معتمدة: activities.filter((a) => (a.type === 'قافلة خيرية' || a.type === 'نشاط تضامني') && a.hasPoster).length
    },
    {
      name: 'ورش تكوينية',
      أنشطة: activities.filter((a) => a.type === 'ورشة تكوينية').length,
      ملصقات_معتمدة: activities.filter((a) => a.type === 'ورشة تكوينية' && a.hasPoster).length
    },
    {
      name: 'جموع عامة',
      أنشطة: activities.filter((a) => a.type === 'جمع عام').length,
      ملصقات_معتمدة: activities.filter((a) => a.type === 'جمع عام' && a.hasPoster).length
    }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Institutional Top Greeting Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-6 shadow-2xl">
        <div className="absolute top-0 left-0 -ml-10 -mt-10 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 -mr-10 -mb-10 w-60 h-60 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-18 h-18 rounded-2xl bg-white p-2.5 border-2 border-amber-400 shadow-[0_0_30px_rgba(212,175,55,0.45)] flex items-center justify-center flex-shrink-0 transition-transform duration-300 hover:scale-105">
              <img
                src={branding.logoUrl}
                alt="AMDS Logo"
                className="w-full h-full object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)]"
              />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 bg-emerald-950/70 border border-emerald-800 px-2 py-0.5 rounded">
                  {branding.acronym} — نظام الكتابة العامة الذكي
                </span>
                <span className="text-xs text-slate-400">
                  {new Date().toLocaleDateString('ar-MA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>
              <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
                مرحباً بكم، {currentUser.displayName}
              </h1>
              <p className="text-sm font-serif italic text-amber-300/90">
                «{branding.slogan}»
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => onNavigate('activity-room')}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-950/60 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>إنشاء غرفة نشاط جديدة</span>
            </button>
            <button
              onClick={onOpenNewActivity}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition-colors"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>+ نموذج إدخال سريع</span>
            </button>
            <button
              onClick={onOpenBrandCenter}
              className="flex items-center gap-2 px-3 py-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold border border-slate-700 transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>الهوية الرسمية</span>
            </button>
          </div>
        </div>
      </div>

      {/* Real Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">الأنشطة المؤسساتية</span>
            <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-800/60 text-emerald-400">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-white">{activities.length}</span>
            <span className="text-xs text-emerald-400">
              {upcomingActivities.length} قيد الإعداد
            </span>
          </div>
          <span className="text-[11px] text-slate-500 mt-2 block border-t border-slate-800/80 pt-1.5">
            القلب المركزي لكافة وثائق الرابطة
          </span>
        </div>

        {/* Metric 2 */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">متوسط الجاهزية الرقمية</span>
            <div className="p-2 rounded-lg bg-amber-950/60 border border-amber-800/60 text-amber-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-white">{avgReadiness}%</span>
            <span className="text-xs text-amber-400">
              {activities.length > 0 ? 'معدل الحزم' : 'في انتظار البيانات'}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 mt-2 block border-t border-slate-800/80 pt-1.5">
            حسب اكتمال الملصق والبرنامج والتقرير
          </span>
        </div>

        {/* Metric 3 */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">ملفات تتطلب استكمالاً</span>
            <div className="p-2 rounded-lg bg-red-950/60 border border-red-800/60 text-red-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-white">{pendingApprovalsCount}</span>
            <span className="text-xs text-red-400">تحتاج مراجعة</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-2 block border-t border-slate-800/80 pt-1.5">
            «هل نسيت شيئاً؟» يفحص النواقص
          </span>
        </div>

        {/* Metric 4 */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">عمليات التدقيق الموثقة</span>
            <div className="p-2 rounded-lg bg-sky-950/60 border border-sky-800/60 text-sky-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-white">{auditLogs.length}</span>
            <span className="text-xs text-sky-400">سجل مؤمن</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-2 block border-t border-slate-800/80 pt-1.5">
            توثيق التعديلات الحساسة والاعتمادات
          </span>
        </div>
      </div>

      {/* Quick Overview & Interactive Charts Card (Recharts) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-800 flex items-center justify-center text-emerald-400">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <span>لوحة المؤشرات البيانية للأنشطة والملصقات</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
                  Recharts Analytics
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                تتبع ديناميكي مباشر لمسار الأنشطة الجارية، المنتهية، ونسبة تغطية الملصقات الرسمية المعتمدة.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs">
              <span className="text-slate-400 ml-1.5">الأنشطة الجارية:</span>
              <span className="font-bold text-emerald-400 font-mono">{ongoingActivities.length}</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs">
              <span className="text-slate-400 ml-1.5">المنتهية:</span>
              <span className="font-bold text-sky-400 font-mono">{completedActivities.length}</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs">
              <span className="text-slate-400 ml-1.5">الملصقات المعتمدة:</span>
              <span className="font-bold text-amber-300 font-mono">{approvedPosters.length}</span>
            </div>
          </div>
        </div>

        {/* Charts & Showcase Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Chart 1: Donut Status Distribution (4 cols) */}
          <div className="lg:col-span-4 bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                <PieChartIcon className="w-3.5 h-3.5 text-emerald-400" />
                <span>توزيع حالة الأنشطة</span>
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">{activities.length} نشاط</span>
            </div>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#0f172a" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      fontSize: '11px',
                      color: '#fff',
                      direction: 'rtl'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Custom Legend */}
            <div className="grid grid-cols-3 gap-1 pt-2 border-t border-slate-800/60 text-[10px]">
              <div className="text-center">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mb-0.5" />
                <p className="text-slate-400">جارية</p>
                <p className="font-bold text-white">{ongoingActivities.length}</p>
              </div>
              <div className="text-center">
                <span className="inline-block w-2 h-2 rounded-full bg-sky-500 mb-0.5" />
                <p className="text-slate-400">منتهية</p>
                <p className="font-bold text-white">{completedActivities.length}</p>
              </div>
              <div className="text-center">
                <span className="inline-block w-2 h-2 rounded-full bg-amber-500 mb-0.5" />
                <p className="text-slate-400">مسودة</p>
                <p className="font-bold text-white">{draftActivities.length}</p>
              </div>
            </div>
          </div>

          {/* Chart 2: Bar Chart by Type & Posters (5 cols) */}
          <div className="lg:col-span-5 bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5 text-amber-400" />
                <span>الأنشطة والملصقات المعتمدة حسب الصنف</span>
              </h3>
              <span className="text-[10px] text-amber-300 font-mono">
                {approvedPosters.length}/{activities.length} ملصق
              </span>
            </div>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={typeChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      fontSize: '11px',
                      color: '#fff',
                      direction: 'rtl'
                    }}
                  />
                  <Bar dataKey="أنشطة" fill="#10B981" radius={[4, 4, 0, 0]} name="إجمالي الأنشطة" />
                  <Bar dataKey="ملصقات_معتمدة" fill="#D4AF37" radius={[4, 4, 0, 0]} name="الملصقات المعتمدة" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="flex items-center justify-center gap-4 pt-2 border-t border-slate-800/60 text-[10px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block" />
                <span>إجمالي الأنشطة المبرمجة</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-[#D4AF37] inline-block" />
                <span>الملصقات الرسمية المعتمدة</span>
              </span>
            </div>
          </div>

          {/* Section 3: Recently Approved Posters Showcase (3 cols) */}
          <div className="lg:col-span-3 bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-emerald-400" />
                <span>أحدث الملصقات المعتمدة</span>
              </h3>
              <button
                onClick={() => onNavigate('design-engine')}
                className="text-[10px] text-amber-400 hover:text-amber-300 font-medium"
              >
                محرك التصاميم «
              </button>
            </div>

            {approvedPosters.length === 0 ? (
              <div className="my-auto text-center py-6">
                <Palette className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                <p className="text-[11px] text-slate-400">لم يتم اعتماد ملصقات بعد.</p>
                <button
                  onClick={() => onNavigate('design-engine')}
                  className="mt-2 px-2.5 py-1 text-[11px] bg-emerald-600 hover:bg-emerald-500 text-white rounded font-medium"
                >
                  تصميم أول ملصق
                </button>
              </div>
            ) : (
              <div className="space-y-2.5 my-auto">
                {approvedPosters.slice(0, 2).map((act) => (
                  <div
                    key={act.id}
                    className="p-2.5 rounded-lg bg-slate-900 border border-amber-400/40 hover:border-amber-400 transition-all flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                        <p className="text-[11px] font-bold text-white truncate">{act.title}</p>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {act.date} — {act.city}
                      </p>
                    </div>

                    <button
                      onClick={() => onNavigate('design-engine')}
                      className="p-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 flex-shrink-0 transition-colors"
                      title="فتح في محرك التصاميم"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
              <span>نسبة تغطية الهوية:</span>
              <span className="font-bold font-mono text-emerald-400">
                {activities.length > 0 ? Math.round((approvedPosters.length / activities.length) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Upcoming Activities (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-400" />
                الأنشطة القادمة والمبرمجة للرابطة
              </h2>
              <button
                onClick={() => onNavigate('activities')}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
              >
                <span>عرض الكل</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {upcomingActivities.length === 0 ? (
              <div className="text-center py-10 px-4 bg-slate-950/50 rounded-lg border border-slate-800/80">
                <p className="text-xs text-slate-400 mb-3">لا توجد أنشطة مبرمجة في الوقت الحالي.</p>
                <button
                  onClick={onOpenNewActivity}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
                >
                  + برمجة نشاط جديد
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingActivities.slice(0, 3).map((act) => (
                  <div
                    key={act.id}
                    className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-medium">
                          {act.status}
                        </span>
                        <span className="text-xs font-bold text-white line-clamp-1">{act.title}</span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {act.date} {act.time ? `(${act.time})` : ''} | {act.city} — {act.location}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">الجاهزية</span>
                        <span className="text-xs font-bold font-mono text-emerald-400">{act.readinessScore || 20}%</span>
                      </div>
                      <button
                        onClick={() => onNavigate('activities')}
                        className="px-3 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors"
                      >
                        تفاصيل النشاط
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Access to Fundamental Modules */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => onNavigate('activities')}
              className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-600/50 transition-all text-right group"
            >
              <Layers className="w-5 h-5 text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
              <h3 className="text-xs font-bold text-white">إدارة الأنشطة والفعاليات</h3>
              <p className="text-[11px] text-slate-400 mt-1">تتبع دورة الحياة وإصدارات النشاط والملفات</p>
            </button>

            <button
              onClick={onOpenBrandCenter}
              className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-600/50 transition-all text-right group"
            >
              <ShieldCheck className="w-5 h-5 text-amber-400 mb-2 group-hover:scale-110 transition-transform" />
              <h3 className="text-xs font-bold text-white">مركز الهوية الرسمية</h3>
              <p className="text-[11px] text-slate-400 mt-1">الشعار المعتمد، الألوان، وترويسة المراسلات</p>
            </button>

            <button
              onClick={() => onNavigate('audit')}
              className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-600/50 transition-all text-right group"
            >
              <Clock className="w-5 h-5 text-sky-400 mb-2 group-hover:scale-110 transition-transform" />
              <h3 className="text-xs font-bold text-white">سجل العمليات والتدقيق</h3>
              <p className="text-[11px] text-slate-400 mt-1">توثيق زمني غير قابل للمسح لكافة الإجراءات</p>
            </button>
          </div>
        </div>

        {/* Right Column: Recent Operational Audit Trail & Institutional Info */}
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h2 className="text-sm font-bold text-white border-b border-slate-800 pb-3 mb-3 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-sky-400" />
                سجل العمليات الأخير (Audit Log)
              </span>
              <button
                onClick={() => onNavigate('audit')}
                className="text-[11px] text-sky-400 hover:underline"
              >
                الكل
              </button>
            </h2>

            {auditLogs.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">لا توجد عمليات مسجلة حتى الآن.</p>
            ) : (
              <div className="space-y-3">
                {auditLogs.slice(0, 5).map((log) => (
                  <div key={log.id} className="text-xs p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200">{log.performedBy}</span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(log.timestamp).toLocaleTimeString('ar-MA', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-400 text-[11px]">{log.details}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Institutional Integrity Box */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-emerald-900/40 rounded-xl p-4 text-xs text-slate-300 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>مِداد: نظام العمل الرقمي للكاتب العام</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              «مِداد ليس مجرد مولد نصوص؛ إنه الحافظ لذاكرة الرابطة ومحرك العمل الرقمي المتكامل لتوثيق الأنشطة، وتأكيد صحة البيانات، وإصدار الوثائق الرسمية.»
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
