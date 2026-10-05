import React, { useState } from 'react';
import {
  LayoutDashboard,
  Layers,
  ShieldCheck,
  FileText,
  Users,
  Archive,
  Bot,
  Clock,
  Settings,
  HelpCircle,
  FolderOpen,
  Sparkles,
  Palette,
  Send,
  Building,
  CheckCircle2,
  Lock,
  Database
} from 'lucide-react';
import type { OrganizationBranding, UserProfile } from '../../types';

interface AppLayoutProps {
  currentModule: string;
  onNavigate: (module: string) => void;
  branding: OrganizationBranding;
  currentUser: UserProfile;
  children: React.ReactNode;
  activityCount: number;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  currentModule,
  onNavigate,
  branding,
  currentUser,
  children,
  activityCount
}) => {
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    {
      id: 'dashboard',
      label: 'لوحة التحكم',
      icon: LayoutDashboard,
      phase: 1,
      badge: null
    },
    {
      id: 'activity-room',
      label: 'إنشاء غرفة نشاط جديدة',
      icon: Sparkles,
      phase: 1,
      badge: 'جديد'
    },
    {
      id: 'activities',
      label: 'الأنشطة والفعاليات',
      icon: Layers,
      phase: 1, // Core active in Phase 1 & 2
      badge: activityCount > 0 ? String(activityCount) : null
    },
    {
      id: 'brand',
      label: 'مركز الهوية الرسمية',
      icon: ShieldCheck,
      phase: 1,
      badge: 'معتمد'
    },
    {
      id: 'data-hub',
      label: 'قاعدة البيانات والمستودع (Data & Storage)',
      icon: Database,
      phase: 1,
      badge: 'نشط'
    },
    {
      id: 'audit',
      label: 'سجل العمليات (Audit)',
      icon: Clock,
      phase: 1,
      badge: null
    },
    {
      divider: true
    },
    {
      id: 'documents',
      label: 'المراسلات والوثائق',
      icon: Send,
      phase: 2,
      badge: 'مرحلة 2'
    },
    {
      id: 'file-manager',
      label: 'مدير الملفات (Drive)',
      icon: FolderOpen,
      phase: 3,
      badge: 'مرحلة 3'
    },
    {
      id: 'ai',
      label: 'اسأل مِداد (الذكاء الاصطناعي)',
      icon: Bot,
      phase: 4,
      badge: 'مرحلة 4'
    },
    {
      id: 'design-engine',
      label: 'محرك التصاميم والملصقات',
      icon: Palette,
      phase: 1,
      badge: 'نشط'
    },
    {
      id: 'members',
      label: 'الأعضاء والفروع والشركاء',
      icon: Users,
      phase: 7,
      badge: 'مرحلة 7'
    },
    {
      id: 'archive',
      label: 'الأرشيف والذاكرة المؤسسية',
      icon: Archive,
      phase: 4,
      badge: 'مرحلة 4'
    },
  ];

  return (
    <div className="flex-1 flex overflow-hidden bg-slate-950 text-slate-100">
      {/* RTL Sidebar */}
      <aside
        className={`${
          collapsed ? 'w-16' : 'w-64'
        } bg-slate-900 border-l border-slate-800 flex flex-col justify-between transition-all duration-200 select-none z-20 flex-shrink-0`}
      >
        <div className="flex flex-col h-full overflow-y-auto">
          {/* Institution Header inside sidebar */}
          <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-white border border-amber-400 shadow-[0_0_15px_rgba(212,175,55,0.45)] flex items-center justify-center p-1 flex-shrink-0 transition-transform duration-300 hover:scale-105">
                <img src={branding.logoUrl} alt="Logo" className="w-full h-full object-contain filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.15)]" />
              </div>
              {!collapsed && (
                <div className="overflow-hidden">
                  <h2 className="text-xs font-bold text-white truncate">{branding.acronym}</h2>
                  <p className="text-[10px] text-slate-400 truncate">نظام الكتابة العامة</p>
                </div>
              )}
            </div>
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="text-slate-500 hover:text-slate-200 text-xs p-1 rounded hover:bg-slate-800"
              title={collapsed ? 'توسيع القائمة' : 'طي القائمة'}
            >
              {collapsed ? '«' : '»'}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-2 space-y-1 flex-1">
            {navItems.map((item, index) =>
              'divider' in item ? (
                <div key={index} className="my-2 border-t border-slate-800/80" />
              ) : (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center ${
                    collapsed ? 'justify-center px-2' : 'justify-between px-3'
                  } py-2 rounded-xl text-xs font-medium transition-all ${
                    currentModule === item.id
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/60 font-semibold'
                      : item.phase > 1
                      ? 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                  title={item.label}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <item.icon
                      className={`w-4 h-4 flex-shrink-0 ${
                        currentModule === item.id ? 'text-white' : 'text-slate-400'
                      }`}
                    />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </div>

                  {!collapsed && item.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                        currentModule === item.id
                          ? 'bg-emerald-800 text-emerald-100'
                          : item.phase === 1
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                          : 'bg-slate-800 text-slate-400 border border-slate-700/60'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              )
            )}
          </nav>

          {/* User Brief in Footer */}
          {!collapsed && (
            <div className="p-3 m-2 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-medium">الكاتب العام المعتمد:</span>
                <span className="text-[10px] text-emerald-400 font-mono">v1.0.0</span>
              </div>
              <p className="font-bold text-white text-xs truncate">{branding.secretaryGeneral}</p>
              <p className="text-[10px] text-slate-500 font-mono truncate">{branding.email}</p>
            </div>
          )}
        </div>
      </aside>

      {/* Main Workspace Content Area */}
      <main className="flex-1 overflow-y-auto bg-slate-950/90 relative">
        {children}
      </main>
    </div>
  );
};
