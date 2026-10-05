import React, { useState, useEffect } from 'react';
import { ShieldCheck, HardDrive, Cpu, Clock, RefreshCw, CheckCircle2 } from 'lucide-react';
import type { UserProfile } from '../types';

interface StatusBarProps {
  currentUser: UserProfile;
  isConnected: boolean;
  activityCount: number;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  currentUser,
  isConnected,
  activityCount
}) => {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('ar-MA', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <footer className="h-7 bg-slate-900 border-t border-slate-800 px-3 text-[11px] text-slate-400 flex items-center justify-between select-none z-30">
      {/* Right in RTL: Institutional Role & Secretary General */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-slate-300">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-medium text-white">{currentUser.displayName}</span>
          <span className="text-slate-500 font-mono">({currentUser.role})</span>
        </div>
        <div className="hidden sm:flex items-center gap-1 text-slate-400 border-r border-slate-800 pr-3">
          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
          <span>الأمان: ABAC Zero-Trust</span>
        </div>
      </div>

      {/* Center: Official Slogan & Activity Count */}
      <div className="hidden md:flex items-center gap-2 text-slate-400">
        <span className="text-amber-400/90 font-serif italic">«نكتب، نوثق، ننظم، ونحفظ ذاكرة الرابطة.»</span>
        <span className="text-slate-600">|</span>
        <span className="text-slate-400">الأنشطة المسجلة: <strong className="text-white font-mono">{activityCount}</strong></span>
      </div>

      {/* Left in RTL: System Metrics & Clock */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 text-slate-400 hidden lg:flex">
          <Cpu className="w-3 h-3 text-emerald-400" />
          <span className="font-mono">Tauri v2 / Edge WebView2</span>
        </div>
        <div className="flex items-center gap-1 text-slate-400 hidden xl:flex">
          <HardDrive className="w-3 h-3 text-slate-400" />
          <span className="font-mono">RAM: ~42MB</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-300 font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
          <Clock className="w-3 h-3 text-emerald-400" />
          <span>{time} GMT+1</span>
        </div>
      </div>
    </footer>
  );
};
