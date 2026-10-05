import React, { useState } from 'react';
import { X, Shield, User, LogIn, CheckCircle2, Lock, KeyRound } from 'lucide-react';
import { signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../services/firebase';
import type { UserProfile, UserRole } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onUpdateCurrentUser: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateCurrentUser
}) => {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const isAdmin =
        user.email === 'rmdstetouan@gmail.com' ||
        user.email === 'amdstetouan@gmail.com';

      const updatedProfile: UserProfile = {
        id: user.uid,
        email: user.email || 'amdstetouan@gmail.com',
        displayName: user.displayName || 'ذ. عماد المزراوي',
        role: isAdmin ? 'SUPER_ADMIN' : 'EDITOR',
        avatarUrl: user.photoURL || undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      onUpdateCurrentUser(updatedProfile);
      onClose();
    } catch (err: any) {
      console.warn('Google Sign In popup error or cancelled:', err);
      setError('تعذر تسجيل الدخول بـ Google، يمكنك استخدام الملف التجريبي السريع أدناه لاختبار الصلاحيات.');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSelectRole = (role: UserRole, displayName: string, email: string) => {
    onUpdateCurrentUser({
      id: `usr_${role.toLowerCase()}`,
      email,
      displayName,
      role,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-800/80 flex items-center justify-center text-emerald-400">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">إدارة الحساب والصلاحيات (RBAC)</h2>
              <p className="text-[11px] text-slate-400">التحقق من الهوية وصلاحيات الكاتب العام والأعضاء</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Current User Card */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-900/60 border border-emerald-500/40 flex items-center justify-center text-emerald-300 font-bold">
                {currentUser.displayName.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-bold text-white">{currentUser.displayName}</p>
                <p className="text-xs text-slate-400 font-mono">{currentUser.email}</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-amber-950 text-amber-300 border border-amber-800/60 font-mono">
              {currentUser.role}
            </span>
          </div>

          {error && (
            <p className="text-xs text-amber-300 bg-amber-950/50 p-2.5 rounded-lg border border-amber-800/60">
              {error}
            </p>
          )}

          {/* Google Sign In Button */}
          <div>
            <button
              onClick={handleGoogleSignIn}
              disabled={isSigningIn}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 flex items-center justify-center gap-2 transition-all shadow-md"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isSigningIn ? 'جارٍ الاتصال بـ Google...' : 'تسجيل الدخول عبر حساب Google الرسمي'}</span>
            </button>
          </div>

          {/* Quick Role Switcher for Testing AMDS Permissions */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 block">
              التبديل السريع للأدوار المؤسساتية لاختبار الصلاحيات (RBAC Simulator):
            </span>

            <div className="space-y-1.5">
              <button
                onClick={() =>
                  handleSelectRole('SUPER_ADMIN', 'ذ. عماد المزراوي (الكاتب العام)', 'rmdstetouan@gmail.com')
                }
                className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-950 hover:bg-emerald-950/40 border border-slate-800 hover:border-emerald-700 text-right transition-colors"
              >
                <div>
                  <div className="font-bold text-white text-xs">ذ. عماد المزراوي (الكاتب العام)</div>
                  <div className="text-[10px] text-slate-400 font-mono">rmdstetouan@gmail.com</div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                  SUPER_ADMIN
                </span>
              </button>

              <button
                onClick={() =>
                  handleSelectRole('BRANCH_MANAGER', 'ذ. محمد العلمي (مدير فرع طنجة)', 'tanger@amdstetouan.com')
                }
                className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-right transition-colors"
              >
                <div>
                  <div className="font-bold text-white text-xs">ذ. محمد العلمي (مسؤول فرع)</div>
                  <div className="text-[10px] text-slate-400 font-mono">tanger@amdstetouan.com</div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800 font-bold">
                  BRANCH_MANAGER
                </span>
              </button>

              <button
                onClick={() =>
                  handleSelectRole('VIEWER', 'ملاحظ جمعوي (عضو زائر)', 'guest@amdstetouan.com')
                }
                className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-right transition-colors"
              >
                <div>
                  <div className="font-bold text-white text-xs">ملاحظ / زائر</div>
                  <div className="text-[10px] text-slate-400 font-mono">guest@amdstetouan.com</div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 font-bold">
                  VIEWER
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
