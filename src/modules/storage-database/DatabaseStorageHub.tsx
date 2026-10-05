import React, { useState } from 'react';
import {
  Database,
  HardDrive,
  FolderTree,
  ShieldCheck,
  FileText,
  Layers,
  Users,
  Building,
  Award,
  BookOpen,
  Clock,
  Lock,
  Upload,
  CheckCircle2,
  AlertTriangle,
  FolderOpen,
  FileCheck,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { STORAGE_FOLDERS, MAX_FILE_SIZES, getActivityFolderStructure, validateStorageFile } from '../../services/storage';
import type { Activity, Branch, Member, Partner, DocumentItem, CertificateItem, InstitutionalMemoryDoc } from '../../types';

interface DatabaseStorageHubProps {
  activities: Activity[];
  branches: Branch[];
  members: Member[];
  partners: Partner[];
  documents: DocumentItem[];
  certificates: CertificateItem[];
  memoryDocs: InstitutionalMemoryDoc[];
}

export const DatabaseStorageHub: React.FC<DatabaseStorageHubProps> = ({
  activities,
  branches,
  members,
  partners,
  documents,
  certificates,
  memoryDocs
}) => {
  const [activeTab, setActiveTab] = useState<'collections' | 'storage' | 'rules'>('collections');
  const [selectedCollection, setSelectedCollection] = useState<string>('activities');
  const [selectedStorageFolder, setSelectedStorageFolder] = useState<string>('activities');

  const collectionsMeta = [
    {
      id: 'activities',
      title: 'الأنشطة المؤسساتية (activities)',
      count: activities.length,
      icon: Layers,
      color: 'text-emerald-400',
      description: 'القلب المركزي للنظام والمصدر الوحيد للحقيقة لكافة الوثائق والمراسلات.',
      fields: ['id', 'title', 'type', 'slogan', 'date', 'time', 'city', 'location', 'status', 'readinessScore', 'version', 'createdBy', 'createdAt'],
      rule: 'قراءة لجميع المسجلين، إنشاء للكاتب العام والمسؤولين، تعديل للمنشئ والمسؤول، حذف خاص بالكاتب العام.'
    },
    {
      id: 'organization',
      title: 'الهوية الرسمية (organization/amds)',
      count: 1,
      icon: ShieldCheck,
      color: 'text-amber-400',
      description: 'بيانات الرابطة المعتمدة، الشعار الرسمي SVG، ميثاق الألوان، وترويسة المراسلات.',
      fields: ['name', 'acronym', 'slogan', 'secretaryGeneral', 'logoUrl', 'primaryColor', 'secondaryColor', 'headerTemplate', 'footerTemplate'],
      rule: 'قراءة عامة، تعديل مقصور بصرامة على الكاتب العام (SUPER_ADMIN) مع منع AI من تغييره.'
    },
    {
      id: 'branches',
      title: 'فروع الرابطة (branches)',
      count: branches.length,
      icon: Building,
      color: 'text-sky-400',
      description: 'مكاتب الرابطة بمختلف المدن (تطوان، طنجة، الرباط) وإحصائياتها.',
      fields: ['name', 'city', 'managerName', 'managerEmail', 'phone', 'address', 'status', 'membersCount'],
      rule: 'قراءة لجميع الأعضاء، إدارة مقصورة على الكاتب العام.'
    },
    {
      id: 'members',
      title: 'سجل الأعضاء (members)',
      count: members.length,
      icon: Users,
      color: 'text-purple-400',
      description: 'بيانات الأعضاء مع عزل الأعضاء المقترحين من الذكاء الاصطناعي لحين اعتمادهم.',
      fields: ['name', 'email', 'phone', 'city', 'branchId', 'role', 'status (Active, Suggested_by_AI)', 'source'],
      rule: 'حماية البيانات الشخصية PII: القراءة مقصورة على المسؤولين، الأعضاء المقترحون لا يرتقون لعضو رسمي إلا بقرار الكاتب العام.'
    },
    {
      id: 'partners',
      title: 'دليل الشركاء (partners)',
      count: partners.length,
      icon: Users,
      color: 'text-indigo-400',
      description: 'المؤسسات الشريكة (جماعات محلية، جامعات، منظمات مجتمع مدني).',
      fields: ['name', 'representative', 'partnershipType', 'city', 'website', 'logoUrl', 'activitiesCount'],
      rule: 'قراءة لجميع المستخدمين المسجلين، إدارة للمحررين والكاتب العام.'
    },
    {
      id: 'documents',
      title: 'المراسلات والوثائق (documents)',
      count: documents.length,
      icon: FileText,
      color: 'text-blue-400',
      description: 'الوثائق الرسمية ذات الترقيم الموحد غير القابل للتكرار (AMDS/SG/2026/001).',
      fields: ['refNumber', 'title', 'type', 'recipient', 'subject', 'status', 'issuedDate', 'createdBy', 'approvedBy'],
      rule: 'حفظ مسودات للمحررين، ولا تصبح رسمية صادرة إلا بعد الاعتماد الصريح للكاتب العام.'
    },
    {
      id: 'certificates',
      title: 'الشهادات الرسمية (certificates)',
      count: certificates.length,
      icon: Award,
      color: 'text-yellow-400',
      description: 'شهادات المشاركة والتقدير بالترقيم الفريد المربوط برمز التحقق QR.',
      fields: ['certificateNumber', 'recipientName', 'activityTitle', 'type', 'issuedDate', 'qrCodeData'],
      rule: 'قراءة عامة ومفتوحة للتحقق من صحة الشهادة برمز QR، إصدار مقصور على الكاتب العام.'
    },
    {
      id: 'institutional_memory',
      title: 'الذاكرة المؤسسية (institutional_memory)',
      count: memoryDocs.length,
      icon: BookOpen,
      color: 'text-emerald-500',
      description: 'القانون الأساسي، النظام الداخلي، ومحاضر الجموع العامة المعتمدة كمصدر وحيد للحقيقة.',
      fields: ['title', 'category', 'year', 'content', 'isOfficial', 'fileUrl'],
      rule: 'المرجع الرسمي الملزم للذكاء الاصطناعي لمنع اختراع حقائق غير موثقة.'
    },
    {
      id: 'audit_logs',
      title: 'سجل العمليات (audit_logs)',
      count: 10,
      icon: Clock,
      color: 'text-slate-400',
      description: 'سجل غير قابل للتعديل أو المسح (Append-Only) لتوثيق كافة الإجراءات الحساسة.',
      fields: ['action', 'module', 'recordTitle', 'performedBy', 'performedByEmail', 'timestamp', 'details'],
      rule: 'إضافة فورية فقط، الحذف والتعديل ممنوع كلياً بقواعد الحماية.'
    }
  ];

  const storageFoldersMeta = [
    {
      id: 'branding',
      path: '/branding/*',
      title: 'أصول الهوية الرسمية',
      description: 'الشعار المعتمد (SVG/PNG)، العلامة المائية، الأختام الرسمية للرابطة.',
      maxSize: '10 MB',
      types: 'image/svg+xml, image/png, image/jpeg, image/webp',
      access: 'قراءة عامة، تعديل للكاتب العام فقط.'
    },
    {
      id: 'activities',
      path: '/activities/{activityId}/*',
      title: 'ملفات ومحزمات الأنشطة (Activity Packs)',
      description: 'مجلد مخصص لكل نشاط مقسم فرعياً (الملصق، الدعوات، البرنامج، الصور، التقرير، ZIP).',
      maxSize: '50 MB',
      types: 'صور، مستندات PDF/Word، حزم ZIP',
      access: 'قراءة للمسجلين، رفع للمسؤولين، حذف للكاتب العام.'
    },
    {
      id: 'branches',
      path: '/branches/{branchId}/*',
      title: 'ملفات الفروع',
      description: 'وثائق المكاتب التنفيذية المحلية وتقارير الفروع.',
      maxSize: '25 MB',
      types: 'PDF, DOCX, XLSX, Images',
      access: 'قراءة للمسجلين، إدارة لمسؤول الفرع والكاتب العام.'
    },
    {
      id: 'members',
      path: '/members/{memberId}/*',
      title: 'وثائق الأعضاء والمنتسبين',
      description: 'الصور الشخصية، السير الذاتية، بطاقات الانخراط.',
      maxSize: '15 MB',
      types: 'صور شخصية، PDF',
      access: 'معزولة ومحمية: لا يطّلع عليها إلا العضو نفسه أو الكاتب العام.'
    },
    {
      id: 'documents',
      path: '/documents/{documentId}/*',
      title: 'المراسلات والتقارير الرسمية',
      description: 'نسخ المراسلات الموقعة، البلاغات الصحفية، ومحاضر الاجتماعات.',
      maxSize: '30 MB',
      types: 'PDF, DOCX',
      access: 'محمية ومعتمدة للكاتب العام.'
    },
    {
      id: 'certificates',
      path: '/certificates/{certificateId}/*',
      title: 'ملفات الشهادات الرقمية',
      description: 'نسخ الشهادات المعتمدة بصيغة PDF و SVG عالية الدقة للطباعة.',
      maxSize: '10 MB',
      types: 'PDF, SVG',
      access: 'قراءة عامة برمز التحقق QR.'
    },
    {
      id: 'institutional_memory',
      path: '/institutional_memory/*',
      title: 'أرشيف الذاكرة المؤسسية',
      description: 'النسخ الممسوحة ضوئياً من القانون الأساسي والوصولات القضائية والمحاضر.',
      maxSize: '50 MB',
      types: 'PDF الممسوح ضوئياً، وثائق الأرشيف',
      access: 'أرشيف دائم غير قابل للمسح إلا بقرار خاص.'
    }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-slate-950 p-2 border border-slate-700/80 flex items-center justify-center text-emerald-400">
            <Database className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-tight">
                مركز إدارة البيانات والمستودع السحابي (Data & Storage Hub)
              </h1>
              <span className="px-2 py-0.5 rounded text-[11px] bg-emerald-950 text-emerald-300 border border-emerald-800 font-medium">
                Firestore Enterprise + Storage Active
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              تنظيم السجلات والمسارات السحابية وقواعد الأمان (Security & Storage Rules) المبنية على معمارية مِداد.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-950 px-3 py-2 rounded-lg border border-slate-800">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>قواعد ABAC الصارمة منشورة ومفعّلة</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 gap-2 text-sm font-medium">
        <button
          onClick={() => setActiveTab('collections')}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition-colors ${
            activeTab === 'collections'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>هيكل سجلات Firestore (Collections)</span>
        </button>

        <button
          onClick={() => setActiveTab('storage')}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition-colors ${
            activeTab === 'storage'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <HardDrive className="w-4 h-4" />
          <span>مسارات Firebase Storage المنظمة</span>
        </button>

        <button
          onClick={() => setActiveTab('rules')}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition-colors ${
            activeTab === 'rules'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>قواعد الأمان والوصول (Security & Storage Rules)</span>
        </button>
      </div>

      {/* 1. Firestore Collections Tab */}
      {activeTab === 'collections' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-2 bg-slate-900 border border-slate-800 rounded-xl p-4">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              السجلات المعتمدة في النظام ({collectionsMeta.length})
            </h2>
            <div className="space-y-1.5">
              {collectionsMeta.map((col) => {
                const Icon = col.icon;
                const isSelected = selectedCollection === col.id;
                return (
                  <button
                    key={col.id}
                    onClick={() => setSelectedCollection(col.id)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-lg text-right transition-all ${
                      isSelected
                        ? 'bg-emerald-950/60 border border-emerald-700/80 text-white'
                        : 'bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className={`w-4 h-4 flex-shrink-0 ${col.color}`} />
                      <span className="text-xs font-bold truncate">{col.title}</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 font-mono text-slate-400 border border-slate-700">
                      {col.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detailed Schema & Rules Inspector */}
          <div className="lg:col-span-2 space-y-4">
            {(() => {
              const current = collectionsMeta.find((c) => c.id === selectedCollection)!;
              const Icon = current.icon;
              return (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center border border-slate-700">
                        <Icon className={`w-5 h-5 ${current.color}`} />
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-white">{current.title}</h2>
                        <p className="text-xs text-slate-400 mt-0.5">{current.description}</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded bg-slate-950 text-xs font-mono text-emerald-400 border border-slate-800 font-bold">
                      {current.count} سجلات نشطة
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-slate-300 mb-2">حقول المخطط البنيوي (Schema Fields):</h3>
                    <div className="flex flex-wrap gap-1.5 bg-slate-950 p-3 rounded-lg border border-slate-800">
                      {current.fields.map((f, i) => (
                        <span key={i} className="px-2 py-1 bg-slate-900 border border-slate-700 text-slate-300 rounded text-xs font-mono">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-slate-300 mb-2">قاعدة الحماية المعمارية (ABAC Rule Policy):</h3>
                    <div className="p-3 bg-emerald-950/30 border border-emerald-800/50 rounded-lg text-xs text-slate-200 leading-relaxed flex items-start gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>{current.rule}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                    <span>مزامنة فورية عبر: <strong className="text-slate-200">onSnapshot</strong></span>
                    <span>الموقع السحابي: <strong className="text-emerald-400 font-mono">europe-west2</strong></span>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* 2. Firebase Storage Folders Tab */}
      {activeTab === 'storage' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {storageFoldersMeta.map((folder) => (
              <div
                key={folder.id}
                onClick={() => setSelectedStorageFolder(folder.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  selectedStorageFolder === folder.id
                    ? 'bg-slate-900 border-emerald-500 shadow-lg shadow-emerald-950/30'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <FolderOpen className="w-5 h-5 text-amber-400" />
                    <h3 className="text-sm font-bold text-white">{folder.title}</h3>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-950 border border-slate-700 text-slate-400 font-mono">
                    {folder.maxSize}
                  </span>
                </div>

                <p className="text-xs text-slate-400 mb-3 line-clamp-2">{folder.description}</p>

                <div className="bg-slate-950 p-2 rounded border border-slate-800/80 text-[11px] font-mono text-emerald-400">
                  {folder.path}
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-slate-500 flex items-center justify-between">
                  <span>الصلاحية: {folder.access.split('،')[0]}</span>
                  <span className="text-amber-400/90 font-mono">محمي</span>
                </div>
              </div>
            ))}
          </div>

          {/* Activity Structured Pack Hierarchy View */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FolderTree className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">
                  الهيكل الشجري لحزمة أرشفة النشاط (Activity Pack Hierarchy)
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">/activities/{'{activityId}'}/*</span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              عند إضافة أي نشاط مؤسساتي، ينشئ مِداد تلقائياً مجلداً شجرياً معيارياً يجمع كافة الوثائق والملصقات والدعوات تمهيداً لتصدير حزمة الأرشيف الكاملة (Activity Pack ZIP):
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-slate-300">
                📁 01-poster/
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-slate-300">
                📁 02-invitations/
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-slate-300">
                📁 03-program/
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-slate-300">
                📁 04-announcement/
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-slate-300">
                📁 05-social-media/
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-slate-300">
                📁 06-attendance/
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-slate-300">
                📁 07-certificates/
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-slate-300">
                📁 08-photos/
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-slate-300">
                📁 09-report/
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-slate-300">
                📁 10-correspondence/
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-emerald-400">
                📦 11-activity-pack.zip
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Security Rules Tab */}
      {activeTab === 'rules' && (
        <div className="space-y-5">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>ميثاق الأمان وحماية البيانات في مِداد (Zero-Trust Rules)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <h4 className="font-bold text-emerald-400 text-sm">قواعد Firestore المنشورة:</h4>
                <ul className="list-disc list-inside space-y-1.5 text-slate-400">
                  <li>عزل الهوية الرسمية: التعديل مقصور على الكاتب العام.</li>
                  <li>حماية الأنشطة: لا يتم تغيير حالة النشاط أو أرشيفه إلا بصلاحية رسمية.</li>
                  <li>عزل سجل العمليات (Audit Log): غير قابل للتعديل أو المسح بعد إنشائه.</li>
                  <li>حماية الأعضاء: عزل البيانات الشخصية (PII) ومنع الذكاء الاصطناعي من تسجيل عضو دون اعتماد الكاتب العام.</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <h4 className="font-bold text-amber-400 text-sm">قواعد Firebase Storage المنشورة:</h4>
                <ul className="list-disc list-inside space-y-1.5 text-slate-400">
                  <li>حدود الحجم الصارمة: 10MB للهوية والشهادات، 50MB للأنشطة والتقارير.</li>
                  <li>تقييد أنواع الملفات (MIME type guards): قبول الصور والـ PDF والـ DOCX والـ ZIP فقط.</li>
                  <li>عزل مسار كل نشاط وعضو: منع التداخل أو الوصول غير المصرح به للملفات الحساسة.</li>
                  <li>التحقق العام من الشهادات: السماح بقراءة الشهادات للعموم عبر مسح رمز الاستجابة السريعة QR.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
