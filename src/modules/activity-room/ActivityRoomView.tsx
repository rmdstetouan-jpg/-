import React, { useState, useRef } from 'react';
import {
  Sparkles,
  ClipboardPaste,
  FileText,
  Users,
  Upload,
  UserPlus,
  Trash2,
  Palette,
  Download,
  Printer,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  Layers,
  Share2,
  FileCheck,
  Award,
  RefreshCw,
  Eye,
  Camera,
  ArrowRight,
  ShieldCheck,
  Check,
  Zap
} from 'lucide-react';
import type {
  Activity,
  ActivityParticipant,
  OrganizationBranding,
  UserProfile
} from '../../types';
import { db, createActivity, recordAuditLog } from '../../services/firebase';

interface ActivityRoomViewProps {
  branding: OrganizationBranding;
  currentUser: UserProfile;
  onActivityCreated: (activity: Activity) => void;
  onNavigateToPoster?: (activityId: string) => void;
}

export type RoomAssetTab = 'poster' | 'invitation' | 'program' | 'social' | 'certificate' | 'report_cover';

export const ActivityRoomView: React.FC<ActivityRoomViewProps> = ({
  branding,
  currentUser,
  onActivityCreated,
  onNavigateToPoster
}) => {
  // Input method mode: 'paste' (Raw Text Parsing) or 'manual' (Structured Form)
  const [inputMode, setInputMode] = useState<'paste' | 'manual'>('paste');
  const [rawText, setRawText] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  // Activity Core Form state
  const [title, setTitle] = useState<string>('الندوة الوطنية السنوية حول التنمية المستدامة والتضامن الاجتماعي');
  const [type, setType] = useState<Activity['type']>('ندوة فكرية');
  const [slogan, setSlogan] = useState<string>('العمل الجمعوي رافعة أساسية للتنمية المجالية المستدامة');
  const [description, setDescription] = useState<string>('تنظيم ندوة علمية وطنية تناقش دور المجتمع المدني في بلورة السياسات التضامنية والتنموية بالمغرب.');
  const [date, setDate] = useState<string>('2026-10-24');
  const [time, setTime] = useState<string>('16:00');
  const [city, setCity] = useState<string>('تطوان');
  const [location, setLocation] = useState<string>('قاعة المحاضرات الكبرى، المركز الثقافي الفنيدق');
  const [organizer, setOrganizer] = useState<string>(branding.name);
  const [responsiblePerson, setResponsiblePerson] = useState<string>(currentUser.displayName);
  const [targetAudience, setTargetAudience] = useState<string>('الباحثون الأكاديميون، الفاعلون الجمعويون، وعموم المهتمين');

  // Participants & Speakers state
  const [participants, setParticipants] = useState<ActivityParticipant[]>([
    {
      id: 'p_1',
      name: 'د. يوسف التازي',
      roleInActivity: 'مُسير الندوة',
      professionalTitle: 'أستاذ التعليم العالي بجامعة عبد المالك السعدي',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      organization: 'جامعة عبد المالك السعدي'
    },
    {
      id: 'p_2',
      name: 'د. فاطمة الزهراء بنعلي',
      roleInActivity: 'متدخلة رئيسية',
      professionalTitle: 'خبيرة في الاقتصاد الاجتماعي والتضامني والتنمية المجالية',
      photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
      organization: 'المرصد الوطني للتنمية'
    },
    {
      id: 'p_3',
      name: 'ذ. عبد الرحيم الشنتوف',
      roleInActivity: 'متدخل رئيسي',
      professionalTitle: 'محام بهيئة تطوان وباحث في التشريع الجمعوي وحقوق الإنسان',
      photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      organization: 'هيئة المحامين'
    }
  ]);

  // New Participant form inputs
  const [newParticipantName, setNewParticipantName] = useState<string>('');
  const [newParticipantRole, setNewParticipantRole] = useState<string>('متدخل رئيسي');
  const [newParticipantTitle, setNewParticipantTitle] = useState<string>('');
  const [newParticipantPhoto, setNewParticipantPhoto] = useState<string>('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Active Asset Tab in the live generated suite
  const [activeAssetTab, setActiveAssetTab] = useState<RoomAssetTab>('poster');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<string | null>(null);
  const [createdActivityId, setCreatedActivityId] = useState<string>('demo_act');

  // Handle Photo Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setNewParticipantPhoto(result);
        setPhotoPreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Add Participant
  const handleAddParticipant = () => {
    if (!newParticipantName.trim()) return;

    const newPart: ActivityParticipant = {
      id: `part_${Date.now()}`,
      name: newParticipantName.trim(),
      roleInActivity: newParticipantRole.trim() || 'متدخل',
      professionalTitle: newParticipantTitle.trim() || 'فاعل مؤسساتي',
      photoUrl: newParticipantPhoto || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80'
    };

    setParticipants((prev) => [...prev, newPart]);
    setNewParticipantName('');
    setNewParticipantRole('متدخل رئيسي');
    setNewParticipantTitle('');
    setNewParticipantPhoto('');
    setPhotoPreview(null);
  };

  // Remove Participant
  const handleRemoveParticipant = (id: string) => {
    setParticipants((prev) => prev.filter((p) => p.id !== id));
  };

  // Smart Raw Text Extractor
  const handleSmartTextParse = () => {
    if (!rawText.trim()) return;
    setIsAnalyzing(true);

    setTimeout(() => {
      const text = rawText;

      // Extract Title
      const titleMatch = text.match(/(?:تنظم|تحت عنوان|ندوة|لقاء|قافلة|ورشة|أمسية)[:\s«"]+([^»"\n.]+)/i);
      if (titleMatch && titleMatch[1]) {
        setTitle(titleMatch[1].trim());
      } else if (text.split('\n')[0]) {
        setTitle(text.split('\n')[0].replace(/[«»*#]/g, '').trim());
      }

      // Detect Type
      if (text.includes('قافلة') || text.includes('تضامن') || text.includes('خيري')) {
        setType('قافلة خيرية');
      } else if (text.includes('ورشة') || text.includes('تكوين') || text.includes('تدريب')) {
        setType('ورشة تكوينية');
      } else if (text.includes('جمع عام') || text.includes('انتخاب') || text.includes('مكتب')) {
        setType('جمع عام');
      } else if (text.includes('مخيم') || text.includes('رحلة')) {
        setType('مخيم تربوي');
      } else {
        setType('ندوة فكرية');
      }

      // Detect Date (YYYY-MM-DD or DD/MM/YYYY or text format)
      const dateMatch = text.match(/(\d{4}[-/.]\d{1,2}[-/.]\d{1,2})|(\d{1,2}[-/.]\d{1,2}[-/.]\d{4})/);
      if (dateMatch) {
        setDate(dateMatch[0].replace(/\//g, '-'));
      }

      // Detect Time
      const timeMatch = text.match(/(?:الساعة|ابتداء من|على الساعة)[:\s]*(\d{1,2}[:.]\d{2}|\d{1,2})/);
      if (timeMatch && timeMatch[1]) {
        setTime(timeMatch[1].replace('.', ':'));
      }

      // Detect City
      const cities = ['تطوان', 'طنجة', 'الرباط', 'الفنيدق', 'المضيق', 'مرتيل', 'شفشاون', 'الدار البيضاء', 'فاس'];
      for (const c of cities) {
        if (text.includes(c)) {
          setCity(c);
          break;
        }
      }

      // Detect Venue / Location
      const locationMatch = text.match(/(?:بـ|في|بمكان|بقاعة|بفضاء|بمركب)[:\s]+([^,\n.]+)/);
      if (locationMatch && locationMatch[1]) {
        setLocation(locationMatch[1].trim());
      }

      // Extract Slogan if quoted
      const sloganMatch = text.match(/«([^»]+)»|"([^"]+)"/);
      if (sloganMatch) {
        setSlogan(sloganMatch[1] || sloganMatch[2]);
      }

      // Extract Potential Speakers
      const speakerRegex = /(?:د\.|دكتور|الأستاذ|ذ\.|الدكتورة|الأستاذة)\s+([^\n,؛]+)/g;
      const detectedSpeakers: string[] = [];
      let match;
      while ((match = speakerRegex.exec(text)) !== null) {
        if (match[1] && !detectedSpeakers.includes(match[1].trim())) {
          detectedSpeakers.push(match[1].trim());
        }
      }

      if (detectedSpeakers.length > 0) {
        const newExtractedParticipants: ActivityParticipant[] = detectedSpeakers.map((name, idx) => ({
          id: `ext_${Date.now()}_${idx}`,
          name: name.split(' - ')[0].trim(),
          roleInActivity: idx === 0 ? 'مُسير الجلسة' : 'متدخل رئيسي',
          professionalTitle: name.includes(' - ') ? name.split(' - ')[1].trim() : 'باحث وفاعل مؤسساتي',
          photoUrl: idx === 0
            ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
            : idx === 1
            ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80'
            : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80'
        }));
        setParticipants(newExtractedParticipants);
      }

      setIsAnalyzing(false);
      setSaveSuccessNotice('تم استخراج معطيات النشاط والمتدخلين بنجاح وتوليد الهوية البصرية تلقائياً!');
      setTimeout(() => setSaveSuccessNotice(null), 4000);
    }, 600);
  };

  // Sample Text Loader for quick demonstration
  const handleLoadSampleText = () => {
    setRawText(`بلاغ إخباري ودعوة رسمية:
تعتزم الرابطة المغربية للتنمية والتضامن (AMDS) — المكتب المركزي تنظيم ندوة وطنية فكرية كبرى تحت شعار: «العمل الجمعوي رافعة أساسية للتنمية المجالية المستدامة والعدالة الاجتماعية».
وذلك يوم السبت 24 أكتوبر 2026 ابتداءً من الساعة 16:00 بـ قاعة المحاضرات الكبرى بالمركز الثقافي بمدينة تطوان.
بمشاركة نخبة من الأساتذة والباحثين:
- د. يوسف التازي - أستاذ التعليم العالي بجامعة عبد المالك السعدي (تسيير الندوة)
- د. فاطمة الزهراء بنعلي - خبيرة في الاقتصاد الاجتماعي والتضامني (متدخلة رئيسية)
- ذ. عبد الرحيم الشنتوف - محام بهيئة تطوان وباحث في التشريع الجمعوي (متدخل رئيسي)
الدعوة عامة لجميع المهتمين والفاعلين المدنيين.`);
  };

  // Final Save to Cloud & Local State
  const handleSaveActivityRoom = async () => {
    setIsSaving(true);
    setSaveSuccessNotice(null);

    const activityPayload: Omit<Activity, 'id' | 'createdAt' | 'updatedAt' | 'version'> = {
      title,
      type,
      slogan,
      description,
      objectives: ['تعزيز التنمية والتضامن', 'تأطير المجتمع المدني'],
      date,
      time,
      city,
      location,
      organizer,
      responsiblePerson,
      status: 'Ready',
      targetAudience,
      expectedBeneficiaries: 150,
      readinessScore: 95, // High readiness because poster, program, and speakers are fully generated
      source: 'User Entered',
      participants,
      hasPoster: true,
      hasProgram: true,
      hasInvitations: true,
      hasReport: false,
      hasAttendance: false,
      hasCertificates: true,
      createdBy: currentUser.id,
      createdByName: currentUser.displayName,
      updatedBy: currentUser.displayName
    };

    try {
      const newId = await createActivity(activityPayload, currentUser);
      const fullActivity: Activity = {
        ...activityPayload,
        id: newId,
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setCreatedActivityId(newId);
      onActivityCreated(fullActivity);

      setSaveSuccessNotice('تم اعتماد وحفظ غرفة النشاط بنجاح في السحابة وإنشاء الحزمة البصرية الكاملة!');
      setTimeout(() => setSaveSuccessNotice(null), 6000);
    } catch (err) {
      console.warn('Activity room save fallback:', err);
      const fallbackId = `act_${Date.now()}`;
      const fallbackActivity: Activity = {
        ...activityPayload,
        id: fallbackId,
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setCreatedActivityId(fallbackId);
      onActivityCreated(fallbackActivity);
      setSaveSuccessNotice('تم حفظ النشاط محلياً وتجهيز الحزمة البصرية!');
      setTimeout(() => setSaveSuccessNotice(null), 6000);
    } finally {
      setIsSaving(false);
    }
  };

  // Printable Canvas Ref
  const exportCanvasRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="absolute top-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-white p-2.5 border-2 border-amber-400 shadow-[0_0_30px_rgba(212,175,55,0.45)] flex items-center justify-center flex-shrink-0 transition-transform hover:scale-105">
            <img src={branding.logoUrl} alt="Logo" className="w-full h-full object-contain filter drop-shadow-sm" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
                غرفة إنشاء النشاط وتوليد الهوية المتكاملة
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-300" />
                المحرك الذكي الشامل
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              أدخل المعطيات الخام عبر **لصق النص** أو **الإدخال اليدوي**، وارفع صور وصفات المتدخلين لتوليد **الملصق الرسمي، الدعوة، البرنامج، منشور التواصل، والشهادات** في قالب موحد فائق الدقة.
            </p>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-2.5 flex-wrap">
          {onNavigateToPoster && (
            <button
              onClick={() => {
                handleSaveActivityRoom();
                setTimeout(() => onNavigateToPoster(createdActivityId || 'demo_act'), 400);
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500/20 to-amber-600/20 hover:from-amber-500/30 hover:to-amber-600/30 text-amber-300 border border-amber-500/60 rounded-xl text-xs font-bold transition-all shadow-lg hover:scale-[1.02] active:scale-[0.98]"
              title="الانتقال إلى محرك التصاميم الشامل لتعديل الطبقات والملحقات الـ 15"
            >
              <Palette className="w-4 h-4 text-amber-400" />
              <span>المحرر البصري والملحقات الشاملة «</span>
            </button>
          )}

          <button
            onClick={handleSaveActivityRoom}
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold transition-all shadow-xl shadow-emerald-950/60 disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
          >
            {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4 text-amber-300" />}
            <span>حفظ واعتماد غرفة النشاط</span>
          </button>
        </div>
      </div>

      {saveSuccessNotice && (
        <div className="p-4 bg-emerald-950/90 border border-emerald-600 text-emerald-200 text-xs rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xl animate-fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span className="font-bold">{saveSuccessNotice}</span>
          </div>
          {onNavigateToPoster && (
            <button
              onClick={() => onNavigateToPoster(createdActivityId)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs shadow transition-all flex-shrink-0"
            >
              <Palette className="w-3.5 h-3.5 text-amber-300" />
              <span>فتح في محرك التصميم المتقدم (Design Engine)</span>
            </button>
          )}
        </div>
      )}

      {/* 2. Main Two-Column Layout: Raw Data Ingestion (Left/5 cols) vs Unified Live Template Assets (Right/7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Data Ingestion & Participants Studio (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Step 1: Input Mode Switcher */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-900/80 border border-emerald-500 text-emerald-300 flex items-center justify-center text-[11px] font-mono">1</span>
                <span>طريقة إدخال معطيات النشاط:</span>
              </span>

              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                <button
                  onClick={() => setInputMode('paste')}
                  className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                    inputMode === 'paste'
                      ? 'bg-emerald-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  📋 لصق نص
                </button>
                <button
                  onClick={() => setInputMode('manual')}
                  className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                    inputMode === 'manual'
                      ? 'bg-emerald-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  ✍️ إدخال يدوي
                </button>
              </div>
            </div>

            {/* Mode A: Paste Raw Text */}
            {inputMode === 'paste' ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] text-slate-300 font-medium">
                    الصق نص البلاغ، رسالة واتساب، أو مسودة النشاط:
                  </label>
                  <button
                    onClick={handleLoadSampleText}
                    className="text-[10px] text-amber-400 hover:text-amber-300 underline font-mono"
                  >
                    تجربة نص نموذجي لندوة
                  </button>
                </div>

                <textarea
                  rows={6}
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder="مثال: تنظم الرابطة المغربية للتنمية والتضامن ندوة وطنية حول التنمية المستدامة يوم السبت 24 أكتوبر 2026 بالمركز الثقافي بتطوان بمشاركة د. يوسف التازي ود. فاطمة الزهراء بنعلي..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-sans leading-relaxed transition-all"
                />

                <button
                  onClick={handleSmartTextParse}
                  disabled={isAnalyzing || !rawText.trim()}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50"
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
                      <span>جاري استخراج المعطيات والمتدخلين...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>تحليل واستخراج معطيات النشاط بالذكاء الاصطناعي 🪄</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              /* Mode B: Manual Structured Fields */
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">عنوان النشاط</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">نوع النشاط</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value as Activity['type'])}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
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

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">الشعار الفرعي (Slogan)</label>
                    <input
                      type="text"
                      value={slogan}
                      onChange={(e) => setSlogan(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-amber-300 font-serif focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">التاريخ</label>
                    <input
                      type="text"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">التوقيت</label>
                    <input
                      type="text"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">المدينة</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">المكان / القاعة</label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Step 2: Speakers & Participants Studio (رفع الصور وتحديد الصفات) */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-900/80 border border-emerald-500 text-emerald-300 flex items-center justify-center text-[11px] font-mono">2</span>
                <Users className="w-4 h-4 text-amber-400" />
                <span>المشاركون والمتدخلون (الصور والصفات):</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300 font-mono">
                {participants.length} مسجلين
              </span>
            </div>

            {/* List of currently added participants */}
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {participants.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-amber-400 shadow-md flex-shrink-0 bg-slate-800">
                      <img src={p.photoUrl} alt={p.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-white truncate">{p.name}</p>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-950/80 text-amber-300 border border-amber-800/80 flex-shrink-0 font-medium">
                          {p.roleInActivity}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">{p.professionalTitle}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemoveParticipant(p.id)}
                    className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-900 transition-colors"
                    title="حذف المشارك"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add New Participant Form */}
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3 text-xs">
              <span className="font-bold text-slate-200 block text-[11px]">
                ➕ إضافة متدخل / مشارك جديد مع رفع الصورة:
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 text-[10px] mb-1">الاسم الكامل للمشارك</label>
                  <input
                    type="text"
                    value={newParticipantName}
                    onChange={(e) => setNewParticipantName(e.target.value)}
                    placeholder="مثال: د. كمال الوهابي"
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-[10px] mb-1">الصفة داخل النشاط</label>
                  <select
                    value={newParticipantRole}
                    onChange={(e) => setNewParticipantRole(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  >
                    <option value="مُسير الندوة">مُسير الندوة</option>
                    <option value="متدخل رئيسي">متدخل رئيسي</option>
                    <option value="مؤطر الورشة">مؤطر الورشة</option>
                    <option value="ضيف شرف">ضيف شرف</option>
                    <option value="منسق القافلة">منسق القافلة</option>
                    <option value="مقرر الجلسة">مقرر الجلسة</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 text-[10px] mb-1">الصفة المهنية / الأكاديمية</label>
                <input
                  type="text"
                  value={newParticipantTitle}
                  onChange={(e) => setNewParticipantTitle(e.target.value)}
                  placeholder="مثال: أستاذ باحث، خبير في التنمية المستدامة"
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>

              {/* Photo Upload & Preview */}
              <div className="flex items-center gap-3 pt-1">
                <label className="flex-1 cursor-pointer">
                  <div className="flex items-center justify-center gap-2 px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-dashed border-slate-600 rounded-lg text-slate-300 text-xs transition-colors">
                    <Camera className="w-4 h-4 text-amber-400" />
                    <span>{photoPreview ? 'تغيير الصورة المرفوعة' : 'رفع صورة المشارك من الجهاز'}</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>

                {photoPreview && (
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-emerald-400 flex-shrink-0 shadow">
                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <button
                onClick={handleAddParticipant}
                disabled={!newParticipantName.trim()}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-40 flex items-center justify-center gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5 text-emerald-400" />
                <span>إدراج المتدخل في قائمة النشاط</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Unified Multi-Asset Live Studio (7 cols) */}
        <div className="lg:col-span-7 flex flex-col items-center justify-start space-y-4">
          {/* Asset Tabs */}
          <div className="w-full flex items-center justify-between bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-xs overflow-x-auto gap-2">
            <span className="text-slate-400 font-semibold flex items-center gap-1.5 flex-shrink-0 text-[11px]">
              <Palette className="w-3.5 h-3.5 text-emerald-400" />
              <span>القالب الموحد:</span>
            </span>

            <div className="flex items-center gap-1.5">
              {[
                { id: 'poster', label: 'الملصق الرسمي (Poster)' },
                { id: 'invitation', label: 'بطاقة الدعوة (Invitation)' },
                { id: 'program', label: 'البرنامج المفصل (Program)' },
                { id: 'social', label: 'منشور التواصل (Social)' },
                { id: 'certificate', label: 'شهادة المشاركة (Cert)' },
                { id: 'report_cover', label: 'غلاف التقرير (Cover)' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveAssetTab(tab.id as RoomAssetTab)}
                  className={`px-2.5 py-1.5 rounded-lg font-medium transition-all text-xs flex-shrink-0 ${
                    activeAssetTab === tab.id
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="w-full flex items-center justify-between text-xs text-slate-400 px-2">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping inline-block" />
              <span className="text-white font-bold text-[11px]">توليد مباشر وفوري من معطيات الغرفة</span>
            </span>

            <div className="flex items-center gap-2">
              {onNavigateToPoster && (
                <button
                  onClick={() => onNavigateToPoster(createdActivityId)}
                  className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300 rounded-lg text-xs font-bold transition-all shadow"
                  title="تعديل هذا التصميم في المحرر البصري التفاعلي للطبقات"
                >
                  <Palette className="w-3.5 h-3.5 text-amber-400" />
                  <span>المحرر التفاعلي</span>
                </button>
              )}
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-lg text-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>طباعة</span>
              </button>
            </div>
          </div>

          {/* LIVE ASSET PREVIEW CONTAINER */}
          <div
            ref={exportCanvasRef}
            className="w-full max-w-[540px] shadow-2xl rounded-2xl border-4 border-amber-400/90 relative overflow-hidden transition-all duration-500 flex flex-col justify-between p-6 sm:p-7 select-none text-right bg-[#006233]"
            style={{
              backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(2,44,34,0.92) 0%, rgba(15,23,42,0.98) 85%)'
            }}
          >
            {/* Thematic Background Geometry */}
            <div className="absolute inset-0 pointer-events-none opacity-20">
              <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50%" cy="15%" r="180" fill="none" stroke="#D4AF37" strokeWidth="1.5" strokeDasharray="6 6" />
                <circle cx="50%" cy="15%" r="240" fill="none" stroke="#D4AF37" strokeWidth="1" strokeDasharray="3 3" />
              </svg>
            </div>

            {/* Inner Double Gold Frame */}
            <div className="absolute inset-3 border border-amber-400/40 rounded-xl pointer-events-none" />
            <div className="absolute inset-4 border border-dashed border-amber-400/30 rounded-lg pointer-events-none" />

            {/* ASSET VARIATION 1: OFFICIAL POSTER WITH SPEAKERS SHOWCASE */}
            {activeAssetTab === 'poster' && (
              <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
                {/* Header with Prominent Centered Logo */}
                <div className="flex flex-col items-center justify-center text-center space-y-1.5 border-b border-amber-400/30 pb-3">
                  <p className="text-[10px] font-black text-slate-200 tracking-widest uppercase">المملكة المغربية</p>
                  
                  {/* Centered Logo Badge with White Background & Glow */}
                  <div className="w-16 h-16 rounded-2xl bg-white p-2 border-2 border-amber-400 shadow-[0_0_25px_rgba(212,175,55,0.5)] flex items-center justify-center my-0.5">
                    <img src={branding.logoUrl} alt="Logo" className="w-full h-full object-contain filter drop-shadow-sm" />
                  </div>

                  <h2 className="text-sm sm:text-base font-black text-amber-300 tracking-tight">{branding.name}</h2>
                  <p className="text-[10px] text-slate-300 font-mono">{branding.acronym} — الكتابة العامة</p>
                  <p className="text-xs font-serif italic text-amber-200/90 pt-0.5">«{slogan}»</p>
                </div>

                {/* Activity Headline */}
                <div className="text-center space-y-2 my-auto py-2">
                  <div className="inline-block px-3 py-0.5 rounded-full text-xs font-bold text-white bg-emerald-900/80 border border-amber-400/80 shadow">
                    {organizer} تنظم: {type}
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-white leading-tight drop-shadow-md">
                    {title}
                  </h3>
                </div>

                {/* Keynote Speakers & Participants Showcase (صور المتدخلين وصفاتهم) */}
                {participants.length > 0 && (
                  <div className="space-y-2 py-2">
                    <div className="flex items-center justify-center gap-2">
                      <span className="h-px w-8 bg-amber-400/40"></span>
                      <p className="text-[11px] font-bold text-amber-300 text-center">المتدخلون والمشاركون في أشغال النشاط:</p>
                      <span className="h-px w-8 bg-amber-400/40"></span>
                    </div>

                    <div className={`grid gap-2 ${participants.length <= 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                      {participants.map((p) => (
                        <div
                          key={p.id}
                          className="flex flex-col items-center text-center p-2 rounded-xl bg-slate-950/80 border border-amber-400/40 shadow-md backdrop-blur-sm"
                        >
                          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-amber-400 shadow-md mb-1.5 flex-shrink-0 bg-slate-900">
                            <img src={p.photoUrl} alt={p.name} className="w-full h-full object-cover" />
                          </div>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-700/70 font-semibold mb-0.5">
                            {p.roleInActivity}
                          </span>
                          <p className="text-[11px] font-bold text-white truncate max-w-full">{p.name}</p>
                          <p className="text-[9px] text-slate-300 line-clamp-1 leading-tight">{p.professionalTitle}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Practical Details Box */}
                <div className="p-3 rounded-xl bg-slate-950/95 border border-amber-400/80 shadow-xl space-y-1.5 text-xs">
                  <div className="grid grid-cols-2 gap-2 text-slate-200">
                    <div className="flex items-center gap-1.5 font-bold text-amber-300">
                      <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{date} م</span>
                    </div>

                    <div className="flex items-center gap-1.5 font-bold text-amber-300">
                      <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>الساعة {time}</span>
                    </div>

                    <div className="flex items-center gap-1.5 col-span-2 text-slate-300 pt-1 border-t border-slate-800">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-sky-400" />
                      <span className="truncate">{location} — {city}</span>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-white/10">
                  <span>{branding.website}</span>
                  <span>الدعوة عامة / الحضور مؤكد</span>
                  <span className="font-mono text-amber-400/90">AMDS-ROOM-2026</span>
                </div>
              </div>
            )}

            {/* ASSET VARIATION 2: OFFICIAL INVITATION CARD */}
            {activeAssetTab === 'invitation' && (
              <div className="relative z-10 flex flex-col justify-between h-full space-y-4 text-center">
                <div className="flex flex-col items-center space-y-1 border-b border-amber-400/30 pb-3">
                  <div className="w-14 h-14 rounded-2xl bg-white p-1.5 border-2 border-amber-400 shadow-md">
                    <img src={branding.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                  </div>
                  <h3 className="text-sm font-black text-amber-300">{branding.name}</h3>
                  <p className="text-[10px] text-slate-300">دعوة رسمية لحضور أشغال النشاط</p>
                </div>

                <div className="my-auto space-y-3 px-2">
                  <p className="text-xs text-amber-200 font-serif italic">«يتشرف المكتب المركزي بدعوتكم الكريمة لحضور»</p>
                  <h4 className="text-base font-black text-white">{title}</h4>
                  <p className="text-[11px] text-slate-300 leading-relaxed max-w-sm mx-auto">
                    بمشاركة السادة الأساتذة والخبراء: {participants.map((p) => p.name).join('، ')}.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/90 border border-amber-400/70 text-xs text-slate-200 space-y-1">
                  <p className="font-bold text-amber-300">الموعد والمكان:</p>
                  <p>{date} م على الساعة {time}</p>
                  <p className="text-slate-400">{location} — {city}</p>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-white/10">
                  <span>توقيع الكاتب العام: {responsiblePerson}</span>
                  <span className="font-serif">حضوركم شرف لنا</span>
                </div>
              </div>
            )}

            {/* ASSET VARIATION 3: DETAILED PROGRAM SCHEDULE */}
            {activeAssetTab === 'program' && (
              <div className="relative z-10 flex flex-col justify-between h-full space-y-3">
                <div className="text-center border-b border-amber-400/30 pb-2">
                  <h3 className="text-sm font-black text-amber-300">البرنامج العام والمفصل لأشغال النشاط</h3>
                  <p className="text-[11px] text-white font-bold truncate">{title}</p>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                    <span className="font-mono text-amber-300">15:30 — 16:00</span>
                    <span className="text-slate-200 font-medium">استقبال المشاركين وتوزيع ملفات النشاط</span>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                    <span className="font-mono text-amber-300">16:00 — 16:20</span>
                    <span className="text-slate-200 font-medium">افتتاح رسمي وكلمة الكاتب العام للرابطة</span>
                  </div>

                  {participants.map((p, idx) => (
                    <div key={p.id} className="p-2 rounded-lg bg-slate-950/90 border border-amber-400/40 flex items-center justify-between">
                      <span className="font-mono text-amber-300">{16 + idx}:20 — {16 + idx}:50</span>
                      <div className="text-right">
                        <p className="text-white font-bold">{p.name} ({p.roleInActivity})</p>
                        <p className="text-[10px] text-slate-400">{p.professionalTitle}</p>
                      </div>
                    </div>
                  ))}

                  <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                    <span className="font-mono text-amber-300">18:30 — 19:00</span>
                    <span className="text-slate-200 font-medium">مناقشة عامة وتوصيات واختتام النشاط</span>
                  </div>
                </div>

                <div className="text-[10px] text-center text-slate-400 pt-2 border-t border-white/10">
                  {organizer} — لجنة التنظيم والتنسيق
                </div>
              </div>
            )}

            {/* ASSET VARIATION 4: SOCIAL MEDIA SQUARE (1:1) */}
            {activeAssetTab === 'social' && (
              <div className="relative z-10 flex flex-col justify-between h-full space-y-3 text-center">
                <div className="flex items-center justify-between border-b border-amber-400/30 pb-2">
                  <div className="w-10 h-10 rounded-xl bg-white p-1 border border-amber-400">
                    <img src={branding.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                  </div>
                  <span className="text-xs font-bold text-amber-300">{branding.acronym}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-900 border border-emerald-700 text-white font-mono">
                    Social Card 1:1
                  </span>
                </div>

                <div className="my-auto space-y-2">
                  <span className="text-[11px] text-amber-200 font-bold uppercase">{type}</span>
                  <h4 className="text-base sm:text-lg font-black text-white leading-snug">{title}</h4>
                </div>

                {participants.length > 0 && (
                  <div className="flex items-center justify-center gap-3">
                    {participants.slice(0, 3).map((p) => (
                      <div key={p.id} className="flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-amber-400 shadow">
                          <img src={p.photoUrl} alt={p.name} className="w-full h-full object-cover" />
                        </div>
                        <p className="text-[10px] font-bold text-white mt-1 max-w-[80px] truncate">{p.name}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="p-2 rounded-lg bg-slate-950/90 border border-amber-400/60 text-[11px] text-amber-300 font-bold flex items-center justify-around">
                  <span>📅 {date}</span>
                  <span>⏰ {time}</span>
                  <span>📍 {city}</span>
                </div>
              </div>
            )}

            {/* ASSET VARIATION 5: CERTIFICATE OF APPRECIATION */}
            {activeAssetTab === 'certificate' && (
              <div className="relative z-10 flex flex-col justify-between h-full space-y-3 text-center">
                <div className="border-b border-amber-400/40 pb-2">
                  <p className="text-[10px] font-bold text-slate-300">المملكة المغربية</p>
                  <h3 className="text-sm font-black text-amber-300">{branding.name}</h3>
                  <p className="text-xs font-serif text-amber-200 mt-1">شهادة شكر وتقدير ومشاركة</p>
                </div>

                <div className="my-auto space-y-2 px-3">
                  <p className="text-xs text-slate-300">يشهد المكتب المركزي بأن السيد(ة):</p>
                  <h4 className="text-base font-black text-white border-b-2 border-amber-400/80 pb-1 max-w-xs mx-auto">
                    {participants[0]?.name || 'المشارك المعتمد'}
                  </h4>
                  <p className="text-[11px] text-amber-300 font-medium">
                    بصفته: {participants[0]?.roleInActivity || 'متدخل رئيسي'}
                  </p>
                  <p className="text-[10px] text-slate-300 leading-relaxed">
                    قد شارك(ت) بفعالية في تأطير وإنجاح أشغال «{title}» المنظمة بمدينة {city} بتاريخ {date}.
                  </p>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-white/10">
                  <span>الرقم التسلسلي: AMDS-CERT-2026-001</span>
                  <span>خاتم وتوقيع الكاتب العام</span>
                </div>
              </div>
            )}

            {/* ASSET VARIATION 6: REPORT COVER */}
            {activeAssetTab === 'report_cover' && (
              <div className="relative z-10 flex flex-col justify-between h-full space-y-4 text-center">
                <div className="flex flex-col items-center space-y-1 border-b border-amber-400/30 pb-3">
                  <div className="w-14 h-14 rounded-2xl bg-white p-1.5 border-2 border-amber-400 shadow-md">
                    <img src={branding.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                  </div>
                  <h3 className="text-sm font-black text-amber-300">{branding.name}</h3>
                  <p className="text-[10px] text-slate-300 font-mono">التقرير الأدبي والتوثيقي الشامل</p>
                </div>

                <div className="my-auto space-y-3">
                  <span className="text-xs font-bold text-amber-400 bg-slate-950 px-3 py-1 rounded-full border border-amber-700">
                    ملف توثيق النشاط رقم: {date.replace(/-/g, '')}-01
                  </span>
                  <h4 className="text-base sm:text-lg font-black text-white leading-snug">{title}</h4>
                  <p className="text-xs font-serif italic text-amber-200">«{slogan}»</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 text-xs text-slate-300 space-y-1">
                  <p>تاريخ التنفيذ: {date} م | المكان: {location} — {city}</p>
                  <p className="text-amber-300">إشراف وتوثيق: الكتابة العامة ({responsiblePerson})</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
