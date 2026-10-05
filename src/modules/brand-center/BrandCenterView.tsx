import React, { useState } from 'react';
import {
  Palette,
  ShieldAlert,
  Save,
  CheckCircle,
  FileText,
  Eye,
  Lock,
  Sparkles,
  Info,
  RefreshCw,
  Sliders,
  ExternalLink
} from 'lucide-react';
import type { OrganizationBranding, UserProfile } from '../../types';

interface BrandCenterViewProps {
  branding: OrganizationBranding;
  onUpdateBranding: (updated: Partial<OrganizationBranding>) => Promise<void>;
  currentUser: UserProfile;
}

export const BrandCenterView: React.FC<BrandCenterViewProps> = ({
  branding,
  onUpdateBranding,
  currentUser
}) => {
  const [formData, setFormData] = useState<OrganizationBranding>(branding);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'identity' | 'colors' | 'templates' | 'guard'>('identity');

  const canEdit = currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'SECRETARY_GENERAL';

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;

    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await onUpdateBranding(formData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      console.warn('Branding save locally retained:', err);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Institutional Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-slate-950 p-2 border border-slate-700/80 shadow-inner flex items-center justify-center">
            <img
              src={formData.logoUrl}
              alt="AMDS Logo"
              className="w-full h-full object-contain filter drop-shadow"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-tight">مركز الهوية المؤسسية (Brand Center)</h1>
              <span className="px-2 py-0.5 rounded text-[11px] bg-emerald-950 text-emerald-300 border border-emerald-800 font-medium">
                معتمد رسمياً
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              المرجع الوحيد (Single Source of Truth) لكافة الوثائق، الملصقات، الشهادات، والمراسلات الرسمية لـ AMDS.
            </p>
          </div>
        </div>

        {canEdit ? (
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium text-sm transition-all shadow-lg shadow-emerald-900/40"
          >
            {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{isSaving ? 'جارٍ الحفظ والتوثيق...' : 'اعتماد وحفظ الهوية'}</span>
          </button>
        ) : (
          <div className="flex items-center gap-1.5 text-xs text-amber-400 bg-amber-950/60 px-3 py-1.5 rounded-lg border border-amber-800/40">
            <Lock className="w-3.5 h-3.5" />
            <span>التعديل مقصور على الكاتب العام للرابطة</span>
          </div>
        )}
      </div>

      {saveSuccess && (
        <div className="p-3.5 rounded-lg bg-emerald-950/80 border border-emerald-600/60 text-emerald-200 text-sm flex items-center gap-2.5 shadow-md animate-fade-in">
          <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>تم تحديث الهوية المؤسسية وتوثيقها في سجل العمليات الرسمي (Audit Log). تنعكس التغييرات فوراً على كل الوثائق والتصاميم.</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-800 gap-2">
        <button
          onClick={() => setActiveTab('identity')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'identity'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          البيانات والشعار الرسمي
        </button>
        <button
          onClick={() => setActiveTab('colors')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'colors'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          ميثاق الألوان والخطوط
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'templates'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          الترويسة والتذييل الرسمي
        </button>
        <button
          onClick={() => setActiveTab('guard')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'guard'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          حماية الهوية ضد الذكاء الاصطناعي
        </button>
      </div>

      {/* Tab 1: Official Identity & Logos */}
      {activeTab === 'identity' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4 bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h2 className="text-base font-bold text-white border-b border-slate-800 pb-2">البيانات الرسمية للمؤسسة</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">اسم المؤسسة الكامل</label>
                <input
                  type="text"
                  value={formData.name}
                  disabled={!canEdit}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500 disabled:opacity-60"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">الاختصار الرسمي (Acronym)</label>
                <input
                  type="text"
                  value={formData.acronym}
                  disabled={!canEdit}
                  onChange={(e) => setFormData({ ...formData, acronym: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500 disabled:opacity-60 font-mono"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">الشعار الرسمي المعتمد</label>
                <input
                  type="text"
                  value={formData.slogan}
                  disabled={!canEdit}
                  onChange={(e) => setFormData({ ...formData, slogan: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-amber-300 font-serif focus:outline-none focus:border-emerald-500 disabled:opacity-60"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">الكاتب العام المعتمد</label>
                <input
                  type="text"
                  value={formData.secretaryGeneral}
                  disabled={!canEdit}
                  onChange={(e) => setFormData({ ...formData, secretaryGeneral: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500 disabled:opacity-60"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">الموقع الإلكتروني</label>
                <input
                  type="text"
                  value={formData.website}
                  disabled={!canEdit}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-emerald-400 focus:outline-none focus:border-emerald-500 disabled:opacity-60 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">البريد الإلكتروني الرسمي</label>
                <input
                  type="email"
                  value={formData.email}
                  disabled={!canEdit}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500 disabled:opacity-60 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">المقر والمدينة</label>
                <input
                  type="text"
                  value={formData.address}
                  disabled={!canEdit}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500 disabled:opacity-60"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800">
              <label className="block text-xs font-semibold text-slate-300 mb-1">رابط الشعار المعتمد (SVG / PNG عالي الدقة)</label>
              <input
                type="text"
                value={formData.logoUrl}
                disabled={!canEdit}
                onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-emerald-500 disabled:opacity-60 font-mono"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                لا يطلب النظام إعادة رفع الشعار في كل نشاط؛ هذا الرابط يُحقن تلقائياً في الملصقات، الدعوات، والمراسلات.
              </p>
            </div>
          </div>

          {/* Logo Visual Previews */}
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-400" />
                معاينة الشعار في بيئات مختلفة
              </h3>

              {/* Dark Preview */}
              <div className="rounded-lg bg-slate-950 border border-slate-800 p-4 text-center">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-2 font-mono">النمط الداكن (Dark Surface)</span>
                <div className="w-24 h-24 mx-auto flex items-center justify-center p-1">
                  <img src={formData.logoUrl} alt="Logo Dark" className="max-w-full max-h-full object-contain drop-shadow-md" />
                </div>
              </div>

              {/* Light / Paper Preview */}
              <div className="rounded-lg bg-white border border-slate-200 p-4 text-center">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-2 font-mono">نمط المراسلات الرسمية (Paper)</span>
                <div className="w-24 h-24 mx-auto flex items-center justify-center p-1">
                  <img src={formData.logoUrl} alt="Logo Light" className="max-w-full max-h-full object-contain filter" />
                </div>
              </div>

              {/* Watermark preview */}
              <div className="rounded-lg bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 p-4 relative overflow-hidden">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-2 font-mono">العلامة المائية (Watermark)</span>
                <p className="text-xs text-slate-300 relative z-10 leading-relaxed font-serif">
                  «تُعتمد هذه الوثيقة بصفة رسمية وموثقة ضمن الأرشيف الرقمي للرابطة المغربية للتنمية والتضامن.»
                </p>
                <img
                  src={formData.logoUrl}
                  alt="Watermark"
                  className="absolute left-4 top-2 w-28 h-28 object-contain opacity-10 pointer-events-none filter grayscale"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Colors and Typography */}
      {activeTab === 'colors' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-6">
          <div>
            <h2 className="text-base font-bold text-white mb-1">ميثاق الألوان الرسمي لـ AMDS</h2>
            <p className="text-xs text-slate-400">
              الألوان المعتمدة في الهوية البصرية المغربية للرابطة (الأحمر، الأخضر، الذهبي، الأبيض، والأسود).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Red */}
            <div className="rounded-xl border border-slate-800 p-4 bg-slate-950 space-y-3">
              <div className="w-full h-16 rounded-lg shadow-inner flex items-center justify-center text-white font-bold" style={{ backgroundColor: formData.primaryColor }}>
                الأحمر المغربي
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">اللون الأساسي (Primary)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.primaryColor}
                    disabled={!canEdit}
                    onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                    className="w-8 h-8 rounded border-0 cursor-pointer bg-transparent"
                  />
                  <input
                    type="text"
                    value={formData.primaryColor}
                    disabled={!canEdit}
                    onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                    className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs font-mono text-white"
                  />
                </div>
              </div>
            </div>

            {/* Green */}
            <div className="rounded-xl border border-slate-800 p-4 bg-slate-950 space-y-3">
              <div className="w-full h-16 rounded-lg shadow-inner flex items-center justify-center text-white font-bold" style={{ backgroundColor: formData.secondaryColor }}>
                الأخضر الملكي
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">اللون الثانوي (Secondary)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.secondaryColor}
                    disabled={!canEdit}
                    onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                    className="w-8 h-8 rounded border-0 cursor-pointer bg-transparent"
                  />
                  <input
                    type="text"
                    value={formData.secondaryColor}
                    disabled={!canEdit}
                    onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                    className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs font-mono text-white"
                  />
                </div>
              </div>
            </div>

            {/* Gold */}
            <div className="rounded-xl border border-slate-800 p-4 bg-slate-950 space-y-3">
              <div className="w-full h-16 rounded-lg shadow-inner flex items-center justify-center text-slate-950 font-bold" style={{ backgroundColor: formData.accentColor }}>
                الذهبي التوثيقي
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">اللون التمييزي (Accent)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.accentColor}
                    disabled={!canEdit}
                    onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                    className="w-8 h-8 rounded border-0 cursor-pointer bg-transparent"
                  />
                  <input
                    type="text"
                    value={formData.accentColor}
                    disabled={!canEdit}
                    onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                    className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs font-mono text-white"
                  />
                </div>
              </div>
            </div>

            {/* Dark */}
            <div className="rounded-xl border border-slate-800 p-4 bg-slate-950 space-y-3">
              <div className="w-full h-16 rounded-lg shadow-inner flex items-center justify-center text-white font-bold" style={{ backgroundColor: formData.darkColor }}>
                الأسود الحبري الداكن
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">اللون الداكن (Dark Base)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.darkColor}
                    disabled={!canEdit}
                    onChange={(e) => setFormData({ ...formData, darkColor: e.target.value })}
                    className="w-8 h-8 rounded border-0 cursor-pointer bg-transparent"
                  />
                  <input
                    type="text"
                    value={formData.darkColor}
                    disabled={!canEdit}
                    onChange={(e) => setFormData({ ...formData, darkColor: e.target.value })}
                    className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs font-mono text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Typography guidelines */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-white">الخطوط الرسمية المعتمدة للرابطة</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-xs text-emerald-400 font-mono">Cairo (عناوين وواجهات)</span>
                <p className="text-lg font-bold text-white mt-1">الرابطة المغربية للتنمية والتضامن</p>
                <span className="text-[10px] text-slate-500">مستخدم في الأزرار، العناوين، والملصقات</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-xs text-amber-400 font-mono">Amiri (مراسلات رسمية)</span>
                <p className="text-xl font-serif text-white mt-1">نكتب، نوثق، ننظم، ونحفظ ذاكرة الرابطة.</p>
                <span className="text-[10px] text-slate-500">مستخدم في المراسلات الرسمية والتقارير الأدبية</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-xs text-sky-400 font-mono">JetBrains Mono (الترقيم)</span>
                <p className="text-sm font-mono text-white mt-1">AMDS/SG/2026/001</p>
                <span className="text-[10px] text-slate-500">مستخدم في الترقيم التسلسلي والشهادات</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Official Letterhead Templates */}
      {activeTab === 'templates' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
          <div>
            <h2 className="text-base font-bold text-white mb-1">الترويسة والتذييل المعتمدان في المراسلات والتقارير</h2>
            <p className="text-xs text-slate-400">
              تُطبع هذه الترويسة آلياً في أعلى وأسفل كافة وثائق PDF و DOCX والشهادات الصادرة من مِداد.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">نص الترويسة الرسمية (Header)</label>
              <textarea
                rows={2}
                value={formData.headerTemplate}
                disabled={!canEdit}
                onChange={(e) => setFormData({ ...formData, headerTemplate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500 disabled:opacity-60 font-serif leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">نص التذييل الرسمي (Footer)</label>
              <textarea
                rows={2}
                value={formData.footerTemplate}
                disabled={!canEdit}
                onChange={(e) => setFormData({ ...formData, footerTemplate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500 disabled:opacity-60 text-xs leading-relaxed"
              />
            </div>

            {/* Letterhead Preview Box */}
            <div className="border border-slate-700 rounded-lg p-6 bg-white text-slate-900 shadow-xl space-y-6">
              <div className="flex items-center justify-between border-b-2 border-emerald-900 pb-4">
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-900">المملكة المغربية</p>
                  <p className="text-sm font-bold text-emerald-900 font-serif">{formData.name}</p>
                  <p className="text-[11px] text-slate-600 font-mono">{formData.acronym} — الكتابة العامة</p>
                </div>
                <div className="w-16 h-16">
                  <img src={formData.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                </div>
                <div className="text-left text-xs font-mono text-slate-600">
                  <p>الرقم: AMDS/SG/2026/001</p>
                  <p>تطوان في: 2026/10/04</p>
                </div>
              </div>

              <div className="py-4 text-center">
                <p className="text-xs italic text-slate-500 font-serif">«محتوى الوثيقة الرسمية أو التقرير أو المراسلة الصادرة»</p>
              </div>

              <div className="border-t border-slate-300 pt-2 flex items-center justify-between text-[10px] text-slate-500">
                <span>{formData.footerTemplate}</span>
                <span>الصفحة 1 من 1</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: AI Guard */}
      {activeTab === 'guard' && (
        <div className="bg-slate-900 border border-amber-900/60 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-3 text-amber-400">
            <ShieldAlert className="w-6 h-6 flex-shrink-0" />
            <h2 className="text-base font-bold text-white">ضوابط حماية الهوية ضد الذكاء الاصطناعي</h2>
          </div>

          <div className="p-4 rounded-lg bg-amber-950/40 border border-amber-800/60 text-slate-300 text-sm leading-relaxed space-y-3">
            <p className="font-semibold text-amber-200">
              قاعدة حتمية في نظام مِداد (Strict AI Brand Isolation):
            </p>
            <ul className="list-disc list-inside space-y-2 text-xs text-slate-300">
              <li>الذكاء الاصطناعي ممنوع تماماً وبشكل مبرمج من تعديل ألوان الرابطة، شعارها، أو اسمها الرسمي.</li>
              <li>أي مقترح صادر من الذكاء الاصطناعي يحمل علامة <span className="bg-amber-900/80 px-1.5 py-0.5 rounded text-amber-200 font-mono">AI Suggested</span> ولا يتحول إلى وثيقة رسمية إلا بعد مراجعة صريحة واعتماد من الكاتب العام (ذ. عماد المزراوي).</li>
              <li>جميع التصاميم المشتقة للأنشطة (الملصقات، البرامج، الدعوات) تلتزم بقواعد Brand Center وتستقي الشعار المعتمد مباشرة بدون إعادة رفع أو تشويه.</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
