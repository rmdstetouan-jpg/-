import React, { useState } from 'react';
import {
  Minus,
  Square,
  X,
  ShieldCheck,
  Wifi,
  Sparkles,
  Command,
  Sliders,
  LogOut,
  UserCheck
} from 'lucide-react';
import type { OrganizationBranding, UserProfile } from '../types';

interface TitleBarProps {
  branding: OrganizationBranding;
  currentUser: UserProfile;
  isConnected: boolean;
  onOpenCommandPalette: () => void;
  onOpenBrandCenter: () => void;
  onOpenAuth: () => void;
  onNavigate: (module: string) => void;
}

export const TitleBar: React.FC<TitleBarProps> = ({
  branding,
  currentUser,
  isConnected,
  onOpenCommandPalette,
  onOpenBrandCenter,
  onOpenAuth,
  onNavigate
}) => {
  const [isMaximized, setIsMaximized] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const toggleMaximize = () => {
    setIsMaximized(!isMaximized);
  };

  const handleMinimize = () => {
    // Desktop Shell hook simulation
  };

  const handleClose = () => {
    // Desktop Shell hook simulation
  };

  const menuItems = [
    {
      id: 'file',
      label: 'ملف',
      items: [
        { label: 'إنشاء غرفة نشاط جديدة...', shortcut: 'Ctrl+G', action: () => onNavigate('activity-room') },
        { label: 'نشاط جديد...', shortcut: 'Ctrl+N', action: () => onNavigate('activities-new') },
        { label: 'البحث الشامل في الذاكرة...', shortcut: 'Ctrl+K', action: onOpenCommandPalette },
        { label: 'تصدير حزمة الأرشيف (ZIP)', shortcut: 'Ctrl+E', action: () => onNavigate('archive') },
        { divider: true },
        { label: 'إغلاق البرنامج', shortcut: 'Alt+F4', action: handleClose },
      ]
    },
    {
      id: 'modules',
      label: 'الأنشطة والوثائق',
      items: [
        { label: 'لوحة التحكم المؤسساتية', action: () => onNavigate('dashboard') },
        { label: 'إدارة الأنشطة والفعاليات', action: () => onNavigate('activities') },
        { label: 'المراسلات والوثائق الرسمية', action: () => onNavigate('documents') },
        { label: 'سجل الأعضاء والفروع', action: () => onNavigate('members') },
        { label: 'الأرشيف المؤسساتي', action: () => onNavigate('archive') },
      ]
    },
    {
      id: 'brand',
      label: 'الهوية الرسمية',
      items: [
        { label: 'فتح مركز الهوية البصرية (Brand Center)', action: onOpenBrandCenter },
        { label: 'معاينة الشعار والترويسة', action: onOpenBrandCenter },
        { label: 'فحص ميثاق الألوان والخطوط', action: onOpenBrandCenter },
      ]
    },
    {
      id: 'tools',
      label: 'أدوات مِداد',
      items: [
        { label: 'مساعد الذكاء الاصطناعي (اسأل مِداد)', shortcut: 'Ctrl+J', action: () => onNavigate('ai') },
        { label: 'فحص «هل نسيت شيئاً؟»', action: () => onNavigate('readiness') },
        { label: 'سجل العمليات والتدقيق (Audit Log)', action: () => onNavigate('audit') },
      ]
    },
    {
      id: 'help',
      label: 'مساعدة',
      items: [
        { label: 'عن نظام مِداد MIDAD AMDS', action: () => onNavigate('about') },
        { label: 'دليل الكاتب العام للجمعية', action: () => onNavigate('guide') },
        { label: 'الموقع الرسمي للرابطة (www.amdstetouan.com)', action: () => window.open('https://www.amdstetouan.com', '_blank') },
      ]
    }
  ];

  return (
    <header className="relative select-none bg-slate-900 border-b border-slate-800 text-slate-300 text-xs flex flex-col z-50">
      {/* Topmost Desktop System Strip */}
      <div className="flex items-center justify-between h-9 px-3 gap-2">
        {/* Right side in RTL: App Icon & Title */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-5 h-5 rounded-md bg-white border border-amber-400 shadow-[0_0_10px_rgba(212,175,55,0.4)] flex items-center justify-center p-0.5 flex-shrink-0 transition-transform duration-300 hover:scale-105">
            <img
              src={branding.logoUrl}
              alt="AMDS"
              className="w-full h-full object-contain filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.15)]"
              onError={(e) => {
                // Fallback icon if network image fails
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
          <span className="font-bold text-slate-100 text-xs tracking-tight truncate flex items-center gap-1.5">
            <span>مِداد MIDAD AMDS</span>
            <span className="text-slate-500 font-normal">|</span>
            <span className="text-emerald-400 font-medium">نظام الكتابة العامة الذكي</span>
            <span className="text-slate-500 font-normal hidden md:inline">— الرابطة المغربية للتنمية والتضامن</span>
          </span>
          <span className="hidden lg:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-slate-800 border border-slate-700 text-amber-300 font-mono">
            v1.0.0-win64
          </span>
        </div>

        {/* Center: Quick Search Trigger */}
        <button
          onClick={onOpenCommandPalette}
          className="hidden md:flex items-center gap-2 px-3 py-1 rounded bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/70 transition-colors shadow-inner"
          title="البحث الشامل في مِداد (Ctrl+K)"
        >
          <Command className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-[11px]">البحث الذكي في الأنشطة والوثائق...</span>
          <kbd className="text-[9px] bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700 text-slate-400 font-mono">Ctrl+K</kbd>
        </button>

        {/* Left side in RTL: User role badge + Windows Control Buttons */}
        <div className="flex items-center gap-2">
          {/* User profile & auth button */}
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-800/70 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-[11px] transition-colors"
            title="إدارة الحساب والصلاحيات"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <span className="font-medium text-slate-100 max-w-[120px] truncate">{currentUser.displayName}</span>
            <span className="text-[10px] text-amber-400/90 bg-amber-950/60 px-1 py-0.2 rounded border border-amber-800/40">
              {currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'SECRETARY_GENERAL' ? 'الكاتب العام' : currentUser.role}
            </span>
          </button>

          {/* Windows Window Actions */}
          <div className="flex items-center -mr-1 border-r border-slate-800 pr-1">
            <button
              onClick={handleMinimize}
              className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors rounded"
              title="تصغير"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={toggleMaximize}
              className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors rounded"
              title={isMaximized ? "استعادة" : "تكبير"}
            >
              <Square className="w-3 h-3" />
            </button>
            <button
              onClick={handleClose}
              className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-red-600 transition-colors rounded"
              title="إغلاق البرنامج"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Application Menu Bar (ملف، تحرير، الأنشطة، الهوية، أدوات، مساعدة) */}
      <div className="flex items-center px-2 py-0.5 border-t border-slate-800/80 bg-slate-950/70 gap-1 text-[11px] text-slate-400">
        {menuItems.map((menu) => (
          <div key={menu.id} className="relative">
            <button
              onClick={() => setActiveMenu(activeMenu === menu.id ? null : menu.id)}
              onMouseEnter={() => activeMenu && setActiveMenu(menu.id)}
              className={`px-2.5 py-0.5 rounded transition-colors ${
                activeMenu === menu.id
                  ? 'bg-emerald-800/40 text-emerald-300 font-semibold'
                  : 'hover:bg-slate-800/80 hover:text-slate-200'
              }`}
            >
              {menu.label}
            </button>

            {activeMenu === menu.id && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setActiveMenu(null)}
                />
                <div className="absolute right-0 top-full mt-0.5 w-64 bg-slate-900 border border-slate-700/80 shadow-2xl rounded-md py-1 z-50 text-slate-200 divide-y divide-slate-800">
                  <div className="py-0.5">
                    {menu.items.map((item, idx) =>
                      'divider' in item ? (
                        <div key={idx} className="my-1 border-t border-slate-800" />
                      ) : (
                        <button
                          key={idx}
                          onClick={() => {
                            setActiveMenu(null);
                            item.action();
                          }}
                          className="w-full flex items-center justify-between px-3 py-1.5 text-right hover:bg-emerald-900/40 hover:text-emerald-300 transition-colors text-xs"
                        >
                          <span>{item.label}</span>
                          {item.shortcut && (
                            <span className="text-[10px] text-slate-500 font-mono">{item.shortcut}</span>
                          )}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        ))}

        <div className="flex-1" />

        {/* Cloud Connection Badge */}
        <div className="flex items-center gap-1.5 px-2 text-[10px]">
          <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
          <span className={isConnected ? 'text-emerald-400' : 'text-amber-400'}>
            {isConnected ? 'متصل بقاعدة Firebase السحابية' : 'العمل في وضع الأوفلاين'}
          </span>
        </div>
      </div>
    </header>
  );
};
