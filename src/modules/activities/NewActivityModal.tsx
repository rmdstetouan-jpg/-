import React, { useState } from 'react';
import { X, Calendar, MapPin, User, Target, Layers, Sparkles, Check, AlertCircle } from 'lucide-react';
import type { Activity, ActivityStatus, UserProfile } from '../../types';

interface NewActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (activityData: Omit<Activity, 'id' | 'createdAt' | 'updatedAt' | 'version'>) => Promise<void>;
  currentUser: UserProfile;
}

export const NewActivityModal: React.FC<NewActivityModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  currentUser
}) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<Activity['type']>('ندوة فكرية');
  const [slogan, setSlogan] = useState('');
  const [description, setDescription] = useState('');
  const [objectives, setObjectives] = useState<string[]>(['']);
  const [date, setDate] = useState('2026-10-15');
  const [time, setTime] = useState('16:00');
  const [city, setCity] = useState('تطوان');
  const [location, setLocation] = useState('المركز الثقافي بتطوان');
  const [organizer, setOrganizer] = useState('الرابطة المغربية للتنمية والتضامن');
  const [responsiblePerson, setResponsiblePerson] = useState(currentUser.displayName || 'ذ. عماد المزراوي');
  const [status, setStatus] = useState<ActivityStatus>('Draft');
  const [targetAudience, setTargetAudience] = useState('المجتمع المدني والشباب والمهتمون');
  const [expectedBeneficiaries, setExpectedBeneficiaries] = useState(100);
  const [hasPoster, setHasPoster] = useState(false);
  const [hasProgram, setHasProgram] = useState(false);
  const [hasInvitations, setHasInvitations] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddObjective = () => {
    setObjectives([...objectives, '']);
  };

  const handleObjectiveChange = (index: number, val: string) => {
    const updated = [...objectives];
    updated[index] = val;
    setObjectives(updated);
  };

  const handleRemoveObjective = (index: number) => {
    setObjectives(objectives.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('يرجى إدخال عنوان النشاط');
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      const filteredObjectives = objectives.filter(o => o.trim().length > 0);
      await onSubmit({
        title,
        type,
        slogan,
        description,
        objectives: filteredObjectives.length > 0 ? filteredObjectives : ['تحقيق أهداف التضامن والتنمية والتواصل المؤسساتي'],
        date,
        time,
        city,
        location,
        organizer,
        responsiblePerson,
        status,
        targetAudience,
        expectedBeneficiaries: Number(expectedBeneficiaries) || 50,
        actualBeneficiaries: 0,
        readinessScore: 35,
        source: 'User Entered',
        hasPoster,
        hasProgram,
        hasInvitations,
        hasAttendance: false,
        hasReport: false,
        createdBy: currentUser.id,
        createdByName: currentUser.displayName,
        updatedBy: currentUser.displayName
      });
      onClose();
    } catch (err) {
      console.error(err);
      setError('تعذر تسجيل النشاط، يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-950 border border-emerald-800/80 flex items-center justify-center text-emerald-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">تسجيل نشاط مؤسساتي جديد</h2>
              <p className="text-xs text-slate-400">النشاط هو المصدر الموحد للحقيقة (Single Source of Truth) لكافة وثائق الرابطة</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-950/70 border border-red-800 text-red-200 text-xs rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                عنوان النشاط المؤسساتي <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="مثال: الندوة السنوية للتنمية والتضامن بتطوان..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">نوع النشاط</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="ندوة فكرية">ندوة فكرية</option>
                <option value="نشاط تضامني">نشاط تضامني</option>
                <option value="قافلة خيرية">قافلة خيرية</option>
                <option value="ورشة تكوينية">ورشة تكوينية</option>
                <option value="جمع عام">جمع عام</option>
                <option value="مخيم تربوي">مخيم تربوي</option>
                <option value="أخرى">أخرى</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">شعار النشاط (الفرعي)</label>
            <input
              type="text"
              value={slogan}
              onChange={(e) => setSlogan(e.target.value)}
              placeholder="مثال: العمل التضامني رافعة للتنمية المحلية المستدامة"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-amber-300 font-serif focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">تاريخ النشاط</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">التوقيت</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">المدينة</label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">المكان / القاعة</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">الجهة المنظمة</label>
              <input
                type="text"
                value={organizer}
                onChange={(e) => setOrganizer(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">المسؤول عن النشاط</label>
              <input
                type="text"
                value={responsiblePerson}
                onChange={(e) => setResponsiblePerson(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">المرحلة في دورة الحياة</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ActivityStatus)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Idea">فكرة (Idea)</option>
                <option value="Draft">مسودة (Draft)</option>
                <option value="Planned">مخطط له (Planned)</option>
                <option value="In Preparation">قيد التحضير (In Preparation)</option>
                <option value="Ready">جاهز للتنفيذ (Ready)</option>
                <option value="Completed">تم الإنجاز (Completed)</option>
                <option value="Documentation">قيد التوثيق (Documentation)</option>
                <option value="Complete">مكتمل ومؤرشف (Complete)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">الوصف العام للنشاط</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="اكتب نبذة توضيحية حول سياق النشاط وأهميته وأطره..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500 leading-relaxed"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-300">أهداف النشاط</label>
              <button
                type="button"
                onClick={handleAddObjective}
                className="text-xs text-emerald-400 hover:text-emerald-300"
              >
                + إضافة هدف
              </button>
            </div>
            <div className="space-y-2">
              {objectives.map((obj, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    type="text"
                    value={obj}
                    onChange={(e) => handleObjectiveChange(idx, e.target.value)}
                    placeholder={`الهدف رقم ${idx + 1}...`}
                    className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                  {objectives.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveObjective(idx)}
                      className="px-2 py-1 text-slate-500 hover:text-red-400 text-xs"
                    >
                      حذف
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Assets Check */}
          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
            <span className="text-xs font-semibold text-slate-400 block mb-2">الملحقات الجاهزة مبدئياً:</span>
            <div className="flex flex-wrap gap-4 text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={hasPoster}
                  onChange={(e) => setHasPoster(e.target.checked)}
                  className="rounded border-slate-700 text-emerald-600 focus:ring-0"
                />
                <span>الملصق الرسمي (Poster)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={hasProgram}
                  onChange={(e) => setHasProgram(e.target.checked)}
                  className="rounded border-slate-700 text-emerald-600 focus:ring-0"
                />
                <span>برنامج النشاط (Program)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={hasInvitations}
                  onChange={(e) => setHasInvitations(e.target.checked)}
                  className="rounded border-slate-700 text-emerald-600 focus:ring-0"
                />
                <span>بطاقات الدعوة (Invitations)</span>
              </label>
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium text-sm transition-all shadow-lg shadow-emerald-950/50 disabled:opacity-50"
            >
              {isSubmitting ? 'جارٍ الحفظ في السحابة...' : 'حفظ وتسجيل النشاط في مِداد'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
