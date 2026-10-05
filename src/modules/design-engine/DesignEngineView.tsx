import React, { useState, useRef, useEffect } from 'react';
import {
  Palette,
  Sparkles,
  Download,
  Printer,
  Layers,
  Calendar,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Eye,
  Sliders,
  Share2,
  FileCheck,
  ChevronRight,
  Maximize2,
  Zap,
  Image as ImageIcon,
  History,
  AlertTriangle,
  FolderArchive,
  Lock,
  Unlock,
  Move,
  Type,
  Plus,
  Trash2,
  Copy,
  RotateCw,
  QrCode,
  Users,
  Award,
  Check,
  X,
  FileText,
  SlidersHorizontal,
  ChevronDown,
  Info,
  LayoutTemplate,
  Bookmark,
  Wand2,
  Sparkle
} from 'lucide-react';
import type {
  Activity,
  ActivityParticipant,
  DesignAssetKind,
  DesignCanvasElement,
  DesignDerivative,
  DesignReviewReport,
  DesignTemplate,
  DesignVersionRecord,
  DesignWorkflowState,
  MasterDesign,
  OrganizationBranding,
  UserProfile,
  VisualIdentityConfig
} from '../../types';
import {
  DEFAULT_DESIGN_TEMPLATES,
  applyTemplateToMasterDesign,
  auditDesignReadiness,
  createMasterDesignFromActivity,
  detectImpactedDesigns,
  exportActivityDesignPackZip,
  generateAllDerivativesFromMaster,
  generateVisualIdentityForActivity,
  resolveTokens
} from './designEngineService';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, recordAuditLog } from '../../services/firebase';

interface DesignEngineViewProps {
  activities: Activity[];
  branding: OrganizationBranding;
  currentUser: UserProfile;
  selectedActivityId?: string;
  onActivityUpdated?: (activity: Activity) => void;
}

export type DesignEngineActiveTab =
  | 'master'
  | 'visual_identity'
  | 'templates'
  | 'derivatives'
  | 'editor'
  | 'review'
  | 'versions'
  | 'export_pack';

export const DesignEngineView: React.FC<DesignEngineViewProps> = ({
  activities,
  branding,
  currentUser,
  selectedActivityId,
  onActivityUpdated
}) => {
  // 1. Current Selected Activity
  const initialActivity =
    activities.find((a) => a.id === selectedActivityId) ||
    activities[0] || {
      id: 'demo_act',
      title: 'الندوة الوطنية السنوية حول التنمية المستدامة والتضامن الاجتماعي',
      type: 'ندوة فكرية',
      slogan: 'العمل الجمعوي رافعة أساسية للتنمية المجالية المستدامة',
      description: 'تنظيم ندوة علمية وطنية تناقش دور المجتمع المدني في بلورة السياسات التضامنية والتنموية بالمغرب.',
      objectives: ['تعزيز التنمية والتضامن'],
      date: '2026-10-24',
      time: '16:00',
      location: 'قاعة المحاضرات الكبرى، المركز الثقافي',
      city: 'تطوان',
      organizer: branding.name,
      responsiblePerson: currentUser.displayName,
      status: 'Ready',
      targetAudience: 'المجتمع المدني والمهتمون',
      expectedBeneficiaries: 150,
      readinessScore: 90,
      version: 1,
      source: 'User Entered',
      participants: [
        {
          id: 'p1',
          name: 'د. يوسف التازي',
          roleInActivity: 'مُسير الندوة',
          professionalTitle: 'أستاذ التعليم العالي بجامعة عبد المالك السعدي',
          photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
        },
        {
          id: 'p2',
          name: 'د. فاطمة الزهراء بنعلي',
          roleInActivity: 'متدخلة رئيسية',
          professionalTitle: 'خبيرة في الاقتصاد الاجتماعي والتضامني',
          photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80'
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'sec_gen',
      updatedBy: 'sec_gen'
    };

  const [currentActivity, setCurrentActivity] = useState<Activity>(initialActivity);
  const [activeTab, setActiveTab] = useState<DesignEngineActiveTab>('master');

  // 2. Master Design & Derivatives State
  const [masterDesign, setMasterDesign] = useState<MasterDesign>(() => {
    if (initialActivity.masterDesign) {
      return initialActivity.masterDesign;
    }
    return createMasterDesignFromActivity(initialActivity, branding);
  });

  const [derivatives, setDerivatives] = useState<DesignDerivative[]>(() => {
    if (initialActivity.derivatives && initialActivity.derivatives.length > 0) {
      return initialActivity.derivatives;
    }
    const initialMaster = createMasterDesignFromActivity(initialActivity, branding);
    return generateAllDerivativesFromMaster(initialMaster, initialActivity, branding);
  });

  // 3. Versions History
  const [versions, setVersions] = useState<DesignVersionRecord[]>(() => {
    if (initialActivity.designVersions && initialActivity.designVersions.length > 0) {
      return initialActivity.designVersions;
    }
    return [
      {
        id: `ver_1`,
        designId: masterDesign.id,
        activityId: initialActivity.id,
        versionNumber: 1,
        workflowState: 'AI Generated',
        snapshot: masterDesign,
        changeSummary: 'النسخة الأولى: التوليد التأسيسي من بيانات النشاط ومركز الهوية الرسمية',
        changedBy: currentUser.displayName,
        changedAt: new Date().toISOString()
      }
    ];
  });

  // Selected Derivative for preview / editing
  const [selectedDerivativeKind, setSelectedDerivativeKind] = useState<DesignAssetKind>('poster');

  // 4. Interactive Canvas Editor Selection & Tools
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [canvasZoom, setCanvasZoom] = useState<number>(100);
  const [showGrid, setShowGrid] = useState<boolean>(false);
  const [aspectRatio, setAspectRatio] = useState<'A4' | '1:1' | '9:16'>('A4');

  // 5. Data Drift & Impact Tracking
  const previousActivityRef = useRef<Activity>(initialActivity);
  const [impactNotice, setImpactNotice] = useState<{
    show: boolean;
    summary: string;
    impactedCount: number;
    impactedList: { title: string; reason: string }[];
  } | null>(null);

  // 6. Design Readiness Review
  const [reviewReport, setReviewReport] = useState<DesignReviewReport>(() =>
    auditDesignReadiness(masterDesign, currentActivity)
  );

  // 7. Operations state
  const [isExportingZip, setIsExportingZip] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'info' | 'warning' } | null>(null);

  // 8. Template Library state
  const [templates, setTemplates] = useState<DesignTemplate[]>(() => DEFAULT_DESIGN_TEMPLATES);
  const [selectedTemplateCategory, setSelectedTemplateCategory] = useState<string>('all');
  const [isNewTemplateModalOpen, setIsNewTemplateModalOpen] = useState<boolean>(false);
  const [newTemplateName, setNewTemplateName] = useState<string>('');
  const [newTemplateCategory, setNewTemplateCategory] = useState<Activity['type']>('ندوة فكرية');
  const [newTemplateDesc, setNewTemplateDesc] = useState<string>('');

  // 9. AI Design Assistant Modal state
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState<boolean>(false);

  const previewCardRef = useRef<HTMLDivElement>(null);

  const notify = (text: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 4500);
  };

  // Template Actions
  const handleApplyTemplate = (template: DesignTemplate) => {
    const updatedMaster = applyTemplateToMasterDesign(template, currentActivity, branding);
    const updatedDerivatives = generateAllDerivativesFromMaster(updatedMaster, currentActivity, branding);
    const nextVer = masterDesign.version + 1;
    const newVerRecord: DesignVersionRecord = {
      id: `ver_${Date.now()}`,
      designId: updatedMaster.id,
      activityId: currentActivity.id,
      versionNumber: nextVer,
      workflowState: 'Edited',
      snapshot: { ...updatedMaster, version: nextVer },
      changeSummary: `تطبيق قالب معتمد: ${template.name}`,
      changedBy: currentUser.displayName,
      changedAt: new Date().toISOString()
    };

    setMasterDesign({ ...updatedMaster, version: nextVer, workflowState: 'Edited' });
    setDerivatives(updatedDerivatives);
    setVersions((prev) => [newVerRecord, ...prev]);
    setReviewReport(auditDesignReadiness(updatedMaster, currentActivity));
    notify(`تم تطبيق القالب «${template.name}» وتحديث كافة الملحقات الـ 15 بنجاح!`, 'success');
  };

  const handleSetDefaultTemplate = (templateId: string, category: Activity['type']) => {
    setTemplates((prev) =>
      prev.map((t) => {
        if (t.category === category) {
          return { ...t, isDefault: t.id === templateId };
        }
        return t;
      })
    );
    notify('تم تعيين القالب كافتراضي لهذا الصنف بنجاح!', 'success');
  };

  const handleDuplicateTemplate = (tmpl: DesignTemplate) => {
    const clone: DesignTemplate = {
      ...tmpl,
      id: `tmpl_copy_${Date.now()}`,
      name: `نسخة من ${tmpl.name}`,
      isDefault: false,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setTemplates((prev) => [clone, ...prev]);
    notify(`تم استنساخ القالب «${clone.name}» بنجاح!`, 'success');
  };

  const handleDeleteTemplate = (templateId: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== templateId));
    notify('تم حذف القالب من المكتبة بنجاح.', 'info');
  };

  const handleSaveCurrentAsTemplate = () => {
    if (!newTemplateName.trim()) return;
    const newTmpl: DesignTemplate = {
      id: `tmpl_custom_${Date.now()}`,
      name: newTemplateName.trim(),
      category: newTemplateCategory,
      description: newTemplateDesc.trim() || 'قالب مخصص تم إنشاؤه من محرك التصاميم.',
      defaultAspectRatio: aspectRatio,
      visualIdentity: masterDesign.visualIdentity,
      defaultElements: masterDesign.elements,
      isDefault: false,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setTemplates((prev) => [newTmpl, ...prev]);
    setIsNewTemplateModalOpen(false);
    setNewTemplateName('');
    setNewTemplateDesc('');
    notify(`تمت إضافة القالب «${newTmpl.name}» إلى مكتبة القوالب بنجاح!`, 'success');
  };

  // AI Assistant Handlers
  const handleAiGenerateComplete = () => {
    const newMaster = createMasterDesignFromActivity(currentActivity, branding);
    const newDerivatives = generateAllDerivativesFromMaster(newMaster, currentActivity, branding);
    const nextVer = masterDesign.version + 1;
    const newVerRecord: DesignVersionRecord = {
      id: `ver_${Date.now()}`,
      designId: newMaster.id,
      activityId: currentActivity.id,
      versionNumber: nextVer,
      workflowState: 'AI Generated',
      snapshot: { ...newMaster, version: nextVer },
      changeSummary: 'توليد ذكي متكامل للملصق والملحقات الـ 15 استناداً إلى بيانات النشاط',
      changedBy: currentUser.displayName,
      changedAt: new Date().toISOString()
    };
    setMasterDesign({ ...newMaster, version: nextVer, workflowState: 'AI Generated' });
    setDerivatives(newDerivatives);
    setVersions((prev) => [newVerRecord, ...prev]);
    setReviewReport(auditDesignReadiness(newMaster, currentActivity));
    setIsAiAssistantOpen(false);
    notify('تم توليد هوية وتصميم متكامل للملصق وكافة الملحقات الـ 15 بالذكاء الاصطناعي!', 'success');
  };

  const handleAiRedesignAcademic = () => {
    handleApplyPalette('institutional_arch');
    setIsAiAssistantOpen(false);
    notify('تمت إعادة التصميم بالنمط المؤسساتي الأكاديمي الوقور!', 'success');
  };

  const handleAiImproveLayout = () => {
    setMasterDesign((prev) => ({
      ...prev,
      workflowState: 'Edited',
      elements: prev.elements.map((el) => {
        if (el.type === 'text') return { ...el, align: 'center' };
        if (el.type === 'speakers_grid') return { ...el, y: 58, height: 20 };
        if (el.id === 'el_practical_box') return { ...el, y: 81, height: 13 };
        return el;
      })
    }));
    setIsAiAssistantOpen(false);
    notify('تم تحسين التوزيع البصري والهرمية ومحاذاة الطبقات تلقائياً!', 'success');
  };

  const handleAiAdaptSize = (ratio: 'A4' | '1:1' | '9:16' | '16:9' | '4:5') => {
    setAspectRatio(ratio as any);
    setIsAiAssistantOpen(false);
    notify(`تم تكييف التصميم تلقائياً مع مقاس ${ratio}!`, 'info');
  };

  // Re-generate master design & derivatives if user selects a different activity
  const handleSelectActivity = (actId: string) => {
    const act = activities.find((a) => a.id === actId);
    if (!act) return;

    setCurrentActivity(act);
    const newMaster = act.masterDesign || createMasterDesignFromActivity(act, branding);
    setMasterDesign(newMaster);
    const newDerivatives =
      act.derivatives && act.derivatives.length > 0
        ? act.derivatives
        : generateAllDerivativesFromMaster(newMaster, act, branding);
    setDerivatives(newDerivatives);
    setReviewReport(auditDesignReadiness(newMaster, act));
    previousActivityRef.current = act;
    setSelectedElementId(null);
  };

  // Check Data Drift when activity changes
  useEffect(() => {
    if (previousActivityRef.current && previousActivityRef.current.id === currentActivity.id) {
      const impact = detectImpactedDesigns(previousActivityRef.current, currentActivity, derivatives);
      if (impact.hasChanged) {
        setImpactNotice({
          show: true,
          summary: `تم رصد تغييرات في ملف النشاط (${impact.fieldChanges.map((f) => f.fieldLabel).join('، ')})`,
          impactedCount: impact.impactedDerivatives.length,
          impactedList: impact.impactedDerivatives
        });
      }
    }
  }, [currentActivity, derivatives]);

  // Handle Drift Confirmation
  const handleApplyDriftUpdate = async () => {
    if (!impactNotice) return;

    // Create a new version record
    const nextVerNumber = masterDesign.version + 1;
    const updatedMaster: MasterDesign = {
      ...masterDesign,
      version: nextVerNumber,
      workflowState: 'Edited',
      elements: masterDesign.elements.map((el) => {
        if (el.tokenBinding) {
          return {
            ...el,
            text: resolveTokens(el.tokenBinding, currentActivity, branding)
          };
        }
        return el;
      }),
      updatedAt: new Date().toISOString(),
      updatedBy: currentUser.displayName
    };

    const updatedDerivatives = generateAllDerivativesFromMaster(updatedMaster, currentActivity, branding);

    const newVersionRecord: DesignVersionRecord = {
      id: `ver_${Date.now()}`,
      designId: updatedMaster.id,
      activityId: currentActivity.id,
      versionNumber: nextVerNumber,
      workflowState: 'Edited',
      snapshot: updatedMaster,
      changeSummary: `تحديث تلقائي لانعكاس معطيات النشاط: ${impactNotice.summary}`,
      changedBy: currentUser.displayName,
      changedAt: new Date().toISOString()
    };

    setMasterDesign(updatedMaster);
    setDerivatives(updatedDerivatives);
    setVersions((prev) => [newVersionRecord, ...prev]);
    setReviewReport(auditDesignReadiness(updatedMaster, currentActivity));
    previousActivityRef.current = currentActivity;
    setImpactNotice(null);

    notify(`تم تحديث كافة التصميمات المتأثرة وإنشاء الإصدار V${nextVerNumber} بنجاح!`, 'success');
  };

  const handleDismissDrift = () => {
    previousActivityRef.current = currentActivity;
    setImpactNotice(null);
  };

  // Approve Master Design
  const handleApproveDesign = async () => {
    const updatedMaster: MasterDesign = {
      ...masterDesign,
      workflowState: 'Approved',
      isLocked: true,
      approvedBy: currentUser.displayName,
      approvedAt: new Date().toISOString(),
      readinessScore: 98,
      updatedAt: new Date().toISOString(),
      updatedBy: currentUser.displayName
    };

    const newVersionRecord: DesignVersionRecord = {
      id: `ver_${Date.now()}`,
      designId: updatedMaster.id,
      activityId: currentActivity.id,
      versionNumber: masterDesign.version + 1,
      workflowState: 'Approved',
      snapshot: updatedMaster,
      changeSummary: 'اعتماد رسمي: تم اعتماد التصميم الرئيسي وملحقاته بصفة نهائية من طرف الكاتب العام',
      changedBy: currentUser.displayName,
      changedAt: new Date().toISOString()
    };

    setMasterDesign(updatedMaster);
    setVersions((prev) => [newVersionRecord, ...prev]);
    setReviewReport(auditDesignReadiness(updatedMaster, currentActivity));

    // Save to Firestore
    try {
      if (currentActivity.id) {
        const actRef = doc(db, 'activities', currentActivity.id);
        await updateDoc(actRef, {
          hasPoster: true,
          hasProgram: true,
          hasInvitations: true,
          readinessScore: 98,
          updatedAt: serverTimestamp()
        });
      }

      await recordAuditLog({
        action: 'APPROVE',
        module: 'ACTIVITIES',
        recordId: currentActivity.id,
        recordTitle: `اعتماد الهوية والتصميم: ${currentActivity.title}`,
        performedBy: currentUser.displayName,
        performedByEmail: currentUser.email,
        details: `تم اعتماد Master Design و${derivatives.length} ملحقات مشتقة برقم الإصدار V${updatedMaster.version}.`
      });

      notify('تم اعتماد التصميم والملحقات رسمياً وقفل النسخة وأرشفة التوثيق في سجل العمليات!', 'success');
    } catch {
      notify('تم اعتماد التصميم محلياً بنجاح!', 'success');
    }
  };

  // Save State to Cloud
  const handleSaveToCloud = async () => {
    setIsSaving(true);
    try {
      if (currentActivity.id) {
        const actRef = doc(db, 'activities', currentActivity.id);
        await updateDoc(actRef, {
          hasPoster: true,
          updatedAt: serverTimestamp()
        });

        await recordAuditLog({
          action: 'UPDATE',
          module: 'ACTIVITIES',
          recordId: currentActivity.id,
          recordTitle: `حفظ التصميم والملحقات: ${currentActivity.title}`,
          performedBy: currentUser.displayName,
          performedByEmail: currentUser.email,
          details: `حفظ Master Design (الإصدار V${masterDesign.version}) وحزمة ${derivatives.length} مشتقات.`
        });
      }

      if (onActivityUpdated) {
        onActivityUpdated({
          ...currentActivity,
          hasPoster: true,
          masterDesign,
          derivatives,
          designVersions: versions
        });
      }

      notify('تم حفظ التصميمات والملحقات في قاعدة بيانات MIDAD بنجاح!', 'success');
    } catch {
      notify('تم الحفظ في الذاكرة المحلية للنظام!', 'info');
    } finally {
      setIsSaving(false);
    }
  };

  // Export Full Design Pack ZIP
  const handleExportZip = async () => {
    setIsExportingZip(true);
    try {
      const { blob, fileName } = await exportActivityDesignPackZip(
        currentActivity,
        masterDesign,
        derivatives,
        branding
      );

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);

      await recordAuditLog({
        action: 'CREATE',
        module: 'ACTIVITIES',
        recordId: currentActivity.id,
        recordTitle: `تصدير حزمة التصاميم ZIP: ${currentActivity.title}`,
        performedBy: currentUser.displayName,
        performedByEmail: currentUser.email,
        details: `تم تنزيل حزمة Activity Design Pack كاملة (${fileName}) تحوي كافة الملحقات والبيانات.`
      });

      notify(`تم تصدير حزمة التصاميم الشاملة (${fileName}) بنجاح!`, 'success');
    } catch (err) {
      console.warn('ZIP export error:', err);
      notify('تعذر استخراج حزمة ZIP، يرجى المحاولة ثانية', 'warning');
    } finally {
      setIsExportingZip(false);
    }
  };

  // Export Single PNG
  const handleDownloadSinglePNG = () => {
    if (!previewCardRef.current) return;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 1240;
    canvas.height = 1754;

    // Fill primary
    ctx.fillStyle = masterDesign.visualIdentity.palette.primary;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Outer frame
    ctx.strokeStyle = masterDesign.visualIdentity.palette.accent;
    ctx.lineWidth = 14;
    ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);

    // Title & details
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 44px Cairo, sans-serif';
    ctx.textAlign = 'center';
    ctx.direction = 'rtl';
    ctx.fillText(currentActivity.title, canvas.width / 2, canvas.height / 2);

    const link = document.createElement('a');
    link.download = `AMDS_${currentActivity.id}_Poster_V${masterDesign.version}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();

    notify('تم تصدير الملصق عالي الدقة (PNG) بنجاح!', 'success');
  };

  // Visual Identity Theme Selector
  const handleApplyPalette = (pattern: VisualIdentityConfig['backgroundPattern']) => {
    const newIdentity: VisualIdentityConfig = {
      ...masterDesign.visualIdentity,
      backgroundPattern: pattern,
      palette:
        pattern === 'atlas_mountains'
          ? {
              primary: '#C1272D',
              secondary: '#7F1D1D',
              accent: '#F59E0B',
              background: '#451A03',
              surface: 'rgba(15, 23, 42, 0.94)',
              text: '#FFFFFF',
              mutedText: '#FDE68A'
            }
          : pattern === 'institutional_arch'
          ? {
              primary: '#0F172A',
              secondary: '#1E293B',
              accent: '#D4AF37',
              background: '#091326',
              surface: 'rgba(15, 23, 42, 0.96)',
              text: '#FFFFFF',
              mutedText: '#94A3B8'
            }
          : pattern === 'tech_nodes'
          ? {
              primary: '#064E3B',
              secondary: '#0F172A',
              accent: '#38BDF8',
              background: '#042F2E',
              surface: 'rgba(15, 23, 42, 0.92)',
              text: '#FFFFFF',
              mutedText: '#7DD3FC'
            }
          : pattern === 'cedar_forest'
          ? {
              primary: '#14532D',
              secondary: '#1C1917',
              accent: '#FBBF24',
              background: '#052E16',
              surface: 'rgba(28, 25, 23, 0.94)',
              text: '#FFFFFF',
              mutedText: '#FEF08A'
            }
          : {
              primary: '#006233',
              secondary: '#022C22',
              accent: '#D4AF37',
              background: '#0F172A',
              surface: 'rgba(15, 23, 42, 0.95)',
              text: '#FFFFFF',
              mutedText: '#FDE68A'
            },
      updatedAt: new Date().toISOString()
    };

    setMasterDesign((prev) => ({
      ...prev,
      visualIdentity: newIdentity
    }));
    notify('تم تحديث الهوية البصرية ونمط الألوان والقالب تلقائياً!', 'info');
  };

  // Canvas Editor Layer Adjustments
  const selectedElement = masterDesign.elements.find((el) => el.id === selectedElementId);

  const handleUpdateSelectedElement = (updates: Partial<DesignCanvasElement>) => {
    if (!selectedElementId) return;
    setMasterDesign((prev) => ({
      ...prev,
      elements: prev.elements.map((el) => (el.id === selectedElementId ? { ...el, ...updates } : el))
    }));
  };

  const handleMoveLayer = (direction: 'up' | 'down') => {
    if (!selectedElementId) return;
    const index = masterDesign.elements.findIndex((el) => el.id === selectedElementId);
    if (index < 0) return;
    const newElements = [...masterDesign.elements];
    const targetIndex = direction === 'up' ? Math.max(0, index - 1) : Math.min(newElements.length - 1, index + 1);
    const temp = newElements[index];
    newElements[index] = newElements[targetIndex];
    newElements[targetIndex] = temp;
    setMasterDesign((prev) => ({ ...prev, elements: newElements }));
  };

  const handleToggleLock = () => {
    if (!selectedElement) return;
    handleUpdateSelectedElement({ locked: !selectedElement.locked });
  };

  const handleToggleVisibility = () => {
    if (!selectedElement) return;
    handleUpdateSelectedElement({ visible: selectedElement.visible === false ? true : false });
  };

  // Render Background SVG
  const renderBackgroundOverlay = () => {
    const pattern = masterDesign.visualIdentity.backgroundPattern;
    if (pattern === 'atlas_mountains') {
      return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-25">
          <svg className="absolute bottom-0 w-full h-44 text-amber-950" viewBox="0 0 1000 300" preserveAspectRatio="none">
            <path d="M0,300 L0,200 L150,110 L320,190 L500,70 L700,210 L880,120 L1000,220 L1000,300 Z" fill="currentColor" />
          </svg>
          <div className="absolute top-0 right-1/2 translate-x-1/2 w-80 h-80 bg-amber-500/20 rounded-full blur-3xl" />
        </div>
      );
    }
    if (pattern === 'institutional_arch') {
      return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-25">
          <div className="absolute inset-4 border border-white/20 rounded-xl" />
          <div className="absolute top-0 w-full h-32 bg-sky-500/10 blur-2xl" />
        </div>
      );
    }
    if (pattern === 'tech_nodes') {
      return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50%" cy="25%" r="140" fill="none" stroke="#38BDF8" strokeWidth="1.5" strokeDasharray="6 6" />
            <circle cx="50%" cy="25%" r="220" fill="none" stroke="#38BDF8" strokeWidth="1" strokeDasharray="3 3" />
          </svg>
        </div>
      );
    }
    if (pattern === 'cedar_forest') {
      return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
          <svg className="absolute bottom-0 right-0 w-64 h-64 text-emerald-900" viewBox="0 0 100 100">
            <polygon points="50,10 20,60 80,60" fill="currentColor" />
            <polygon points="50,30 15,85 85,85" fill="currentColor" />
          </svg>
        </div>
      );
    }
    // Default Moroccan Zellige
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-25">
        <svg className="absolute top-0 left-0 w-full h-36 text-amber-400" viewBox="0 0 400 120" preserveAspectRatio="none">
          <path d="M0,0 L400,0 L400,50 Q200,120 0,50 Z" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
        <div className="absolute top-16 left-6 w-14 h-14 border border-amber-400/30 rotate-45" />
        <div className="absolute top-16 right-6 w-14 h-14 border border-amber-400/30 rotate-12" />
        <div className="absolute top-0 right-1/2 translate-x-1/2 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl" />
      </div>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* 1. Header & Institutional Status */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white p-2.5 border-2 border-amber-400 shadow-[0_0_30px_rgba(212,175,55,0.45)] flex items-center justify-center flex-shrink-0 transition-transform hover:scale-105">
            <img src={branding.logoUrl} alt="AMDS Logo" className="w-full h-full object-contain filter drop-shadow-sm" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
                محرك التصاميم والملصقات الوظيفي (Design Engine)
              </h1>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                masterDesign.workflowState === 'Approved'
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                  : 'bg-amber-950 text-amber-300 border-amber-800'
              }`}>
                {masterDesign.workflowState === 'Approved' ? '✓ معتمد رسمياً' : `حالة العمل: ${masterDesign.workflowState}`}
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800 text-[10px] font-mono">
                الإصدار: V{masterDesign.version}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              منظومة وظيفية متكاملة لربط بيانات النشاط بالهوية البصرية، توليد التصميم الرئيسي، واشتقاق كافة الملحقات وتصدير حزمة ZIP المعتمدة.
            </p>
          </div>
        </div>

        {/* Global Action Bar */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleApproveDesign}
            disabled={masterDesign.workflowState === 'Approved'}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-950/50 disabled:opacity-50"
            title="اعتماد رسمي للتصميم والملحقات"
          >
            <ShieldCheck className="w-4 h-4 text-amber-300" />
            <span>اعتماد التصميم رسمياً</span>
          </button>

          <button
            onClick={handleExportZip}
            disabled={isExportingZip}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold border border-slate-700 transition-all shadow-md disabled:opacity-50"
            title="تصدير حزمة النشاط الشاملة ZIP"
          >
            {isExportingZip ? <RefreshCw className="w-4 h-4 animate-spin text-amber-400" /> : <FolderArchive className="w-4 h-4 text-amber-400" />}
            <span>حزمة التصاميم ZIP</span>
          </button>

          <button
            onClick={handleSaveToCloud}
            disabled={isSaving}
            className="p-2.5 bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-800 transition-colors"
            title="حفظ التعديلات في السحابة"
          >
            {isSaving ? <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" /> : <FileCheck className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* Notifications */}
      {notification && (
        <div className={`p-3.5 rounded-xl border text-xs flex items-center gap-2.5 shadow-md animate-fade-in ${
          notification.type === 'success'
            ? 'bg-emerald-950/80 border-emerald-700 text-emerald-200'
            : notification.type === 'warning'
            ? 'bg-amber-950/80 border-amber-700 text-amber-200'
            : 'bg-sky-950/80 border-sky-700 text-sky-200'
        }`}>
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span className="font-medium">{notification.text}</span>
        </div>
      )}

      {/* 2. Data Drift & Impact Alert Banner */}
      {impactNotice && (
        <div className="bg-amber-950/90 border-2 border-amber-600 rounded-xl p-4 shadow-xl text-xs text-amber-200 space-y-3 animate-fade-in">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5 animate-bounce" />
              <div>
                <h4 className="font-black text-amber-300 text-sm">
                  رصد تحديث في بيانات النشاط (Data Drift Detected)
                </h4>
                <p className="text-amber-200/90 mt-0.5">
                  {impactNotice.summary}. لقد تأثرت **{impactNotice.impactedCount} مادة بصرية** مشتقة من هذا التعديل.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleApplyDriftUpdate}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg transition-all shadow"
              >
                تحديث كافة التصميمات المتأثرة وإنشاء V{masterDesign.version + 1}
              </button>
              <button
                onClick={handleDismissDrift}
                className="px-2.5 py-1.5 bg-slate-900/80 hover:bg-slate-900 text-amber-300 rounded-lg border border-amber-700"
              >
                تجاهل مؤقتاً
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-amber-800/80 text-[11px]">
            {impactNotice.impactedList.slice(0, 4).map((item, idx) => (
              <div key={idx} className="bg-slate-950/80 p-2 rounded border border-amber-800">
                <span className="font-bold text-white block">{item.title}</span>
                <span className="text-amber-300/80 text-[10px]">{item.reason}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Activity Selector Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <span className="text-slate-400 font-bold flex items-center gap-1.5 flex-shrink-0">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>النشاط النشط:</span>
          </span>
          <select
            value={currentActivity.id}
            onChange={(e) => handleSelectActivity(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-medium max-w-md truncate"
          >
            {activities.map((act) => (
              <option key={act.id} value={act.id}>
                {act.title} ({act.date}) [{act.type}]
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 text-slate-400 text-[11px]">
          <span>المتدخلون: <strong className="text-white">{currentActivity.participants?.length || 0}</strong></span>
          <span>•</span>
          <span>الملحقات المعتمدة: <strong className="text-amber-300">{derivatives.length}</strong></span>
          <span>•</span>
          <span>الجاهزية: <strong className="text-emerald-400">{reviewReport.score}%</strong></span>
        </div>
      </div>

      {/* 4. Deep Navigation Pipeline Tabs */}
      <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1.5 rounded-xl text-xs overflow-x-auto">
        {[
          { id: 'master', label: '1. الملصق والتصميم الرئيسي', icon: Eye },
          { id: 'visual_identity', label: '2. الهوية البصرية للنشاط', icon: Palette },
          { id: 'derivatives', label: `3. الملحقات المشتقة (${derivatives.length})`, icon: Copy },
          { id: 'editor', label: '4. المحرر البصري للطبقات', icon: SlidersHorizontal },
          { id: 'review', label: `5. فحص ومراجعة التصميم (${reviewReport.score}%)`, icon: CheckCircle2 },
          { id: 'versions', label: `6. سجل الإصدارات (V${masterDesign.version})`, icon: History },
          { id: 'export_pack', label: '7. التصدير وحزمة ZIP', icon: FolderArchive },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as DesignEngineActiveTab)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-bold transition-all text-xs flex-shrink-0 ${
                activeTab === tab.id
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 5. TAB CONTENTS */}

      {/* TAB 1 & 4: Master Poster & Visual Canvas */}
      {(activeTab === 'master' || activeTab === 'editor') && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls & Layers Drawer (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Quick Dimension & Zoom Controls */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1">
                <span className="text-slate-400 font-semibold ml-1">المقاس:</span>
                {[
                  { id: 'A4', label: 'A4 مطبوع' },
                  { id: '1:1', label: '1:1 مربع' },
                  { id: '9:16', label: '9:16 ستوري' },
                ].map((ratio) => (
                  <button
                    key={ratio.id}
                    onClick={() => setAspectRatio(ratio.id as any)}
                    className={`px-2 py-1 rounded text-[11px] font-mono transition-colors ${
                      aspectRatio === ratio.id
                        ? 'bg-amber-950 text-amber-300 border border-amber-700'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {ratio.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowGrid(!showGrid)}
                  className={`p-1.5 rounded border text-[11px] ${
                    showGrid ? 'bg-emerald-950 border-emerald-600 text-emerald-300' : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                  title="إظهار شبكة المحاذاة (Grid)"
                >
                  الشبكة #
                </button>
              </div>
            </div>

            {/* Canvas Layers Manager */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="font-bold text-white flex items-center gap-1.5">
                  <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
                  <span>طبقات التصميم وعناصر المحتوى ({masterDesign.elements.length})</span>
                </h3>
                <span className="text-[10px] text-slate-400 font-mono">ربط ديناميكي Tokens</span>
              </div>

              {/* Elements List */}
              <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                {masterDesign.elements.map((el) => {
                  const isSelected = selectedElementId === el.id;
                  return (
                    <div
                      key={el.id}
                      onClick={() => setSelectedElementId(el.id)}
                      className={`p-2.5 rounded-lg border cursor-pointer transition-all flex items-center justify-between gap-2 ${
                        isSelected
                          ? 'bg-emerald-950/80 border-emerald-500 text-white shadow-md'
                          : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-[10px] font-mono text-slate-500 w-5">
                          {el.type === 'logo' ? '👑' : el.type === 'text' ? 'T' : el.type === 'qrcode' ? 'QR' : '⏹'}
                        </span>
                        <div className="min-w-0">
                          <p className="font-bold text-xs truncate">
                            {el.text || el.tokenBinding || (el.type === 'logo' ? 'الشعار الموسط الرسمي' : el.type)}
                          </p>
                          {el.tokenBinding && (
                            <span className="text-[9px] text-emerald-400 font-mono block">
                              {el.tokenBinding}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 flex-shrink-0">
                        {el.locked && <Lock className="w-3 h-3 text-amber-400" />}
                        {el.visible === false && <Eye className="w-3 h-3 text-slate-500 line-through" />}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Layer Modification Panel (When an element is selected) */}
              {selectedElement && (
                <div className="p-3 bg-slate-950 rounded-xl border border-emerald-800/70 space-y-3 pt-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-bold text-emerald-300 text-[11px]">
                      تعديل العنصر: {selectedElement.type}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={handleToggleLock}
                        className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                        title={selectedElement.locked ? 'إلغاء القفل' : 'قفل العنصر'}
                      >
                        {selectedElement.locked ? <Lock className="w-3.5 h-3.5 text-amber-400" /> : <Unlock className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={handleToggleVisibility}
                        className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                        title="إخفاء / إظهار"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMoveLayer('up')}
                        className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                        title="تقديم للأمام"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => handleMoveLayer('down')}
                        className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                        title="تأخير للخلف"
                      >
                        ↓
                      </button>
                    </div>
                  </div>

                  {/* Text Edit */}
                  {selectedElement.type === 'text' && (
                    <div className="space-y-2">
                      <label className="block text-[10px] text-slate-400">النص أو الرمز الديناميكي</label>
                      <textarea
                        rows={2}
                        value={selectedElement.text || ''}
                        onChange={(e) => handleUpdateSelectedElement({ text: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                      />

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] text-slate-400 mb-1">حجم الخط</label>
                          <input
                            type="number"
                            value={selectedElement.fontSize || 14}
                            onChange={(e) => handleUpdateSelectedElement({ fontSize: Number(e.target.value) })}
                            className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-400 mb-1">اللون</label>
                          <input
                            type="color"
                            value={selectedElement.color || '#FFFFFF'}
                            onChange={(e) => handleUpdateSelectedElement({ color: e.target.value })}
                            className="w-full h-7 bg-slate-900 border border-slate-700 rounded cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Position Sliders */}
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div>
                      <span className="text-slate-400 block mb-1">الموقع العمودي Y: {selectedElement.y}%</span>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={selectedElement.y}
                        onChange={(e) => handleUpdateSelectedElement({ y: Number(e.target.value) })}
                        className="w-full accent-emerald-500"
                      />
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-1">الموقع الأفقي X: {selectedElement.x}%</span>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={selectedElement.x}
                        onChange={(e) => handleUpdateSelectedElement({ x: Number(e.target.value) })}
                        className="w-full accent-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Canvas Live Preview (7 cols) */}
          <div className="lg:col-span-7 flex flex-col items-center justify-start space-y-3 w-full">
            {/* Derivative Asset Switcher Bar */}
            <div className="w-full flex items-center justify-between bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-xs overflow-x-auto gap-2">
              <span className="text-slate-400 font-bold flex items-center gap-1.5 flex-shrink-0 text-[11px]">
                <Copy className="w-3.5 h-3.5 text-amber-400" />
                <span>المادة البصرية المعروضة:</span>
              </span>

              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  { id: 'poster', label: 'الملصق الرئيسي (A4)', ratio: 'A4' },
                  { id: 'invitation', label: 'بطاقة الدعوة (A4)', ratio: 'A4' },
                  { id: 'social_post', label: 'منشور التواصل (1:1)', ratio: '1:1' },
                  { id: 'story', label: 'ستوري الهاتف (9:16)', ratio: '9:16' },
                  { id: 'certificate', label: 'شهادة المشاركة (A4)', ratio: 'A4' },
                  { id: 'program', label: 'البرنامج المفصل (A4)', ratio: 'A4' },
                  { id: 'speaker_card', label: 'بطاقة المتدخل (1:1)', ratio: '1:1' },
                  { id: 'report_cover', label: 'غلاف التقرير (A4)', ratio: 'A4' },
                ].map((asset) => (
                  <button
                    key={asset.id}
                    onClick={() => {
                      setSelectedDerivativeKind(asset.id as any);
                      setAspectRatio(asset.ratio as any);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex-shrink-0 ${
                      selectedDerivativeKind === asset.id
                        ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                        : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800'
                    }`}
                  >
                    {asset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Canvas Toolbar */}
            <div className="w-full flex items-center justify-between text-xs text-slate-400 px-2">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping inline-block" />
                <span className="text-white font-bold text-xs">
                  معاينة مشتقة: {selectedDerivativeKind.toUpperCase()} ({aspectRatio})
                </span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadSinglePNG}
                  className="flex items-center gap-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>تصدير PNG</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1 px-3 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-700 text-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>طباعة</span>
                </button>
              </div>
            </div>

            {/* Poster / Derivative Frame Document */}
            <div
              ref={previewCardRef}
              className={`w-full max-w-[540px] shadow-2xl rounded-2xl border-4 relative overflow-hidden transition-all duration-500 flex flex-col justify-between p-6 sm:p-7 select-none text-right ${
                aspectRatio === '1:1'
                  ? 'aspect-square'
                  : aspectRatio === '9:16'
                  ? 'aspect-[9/16]'
                  : 'aspect-[1/1.414]' // A4
              }`}
              style={{
                backgroundColor: masterDesign.visualIdentity.palette.primary,
                borderColor: masterDesign.visualIdentity.palette.accent,
                backgroundImage: `radial-gradient(circle at 50% 0%, ${masterDesign.visualIdentity.palette.secondary} 0%, ${masterDesign.visualIdentity.palette.background} 90%)`
              }}
            >
              {/* Thematic Background SVG */}
              {renderBackgroundOverlay()}

              {/* Grid Lines if active */}
              {showGrid && (
                <div
                  className="absolute inset-0 pointer-events-none opacity-20"
                  style={{
                    backgroundImage: 'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
                    backgroundSize: '20px 20px'
                  }}
                />
              )}

              {/* Watermark */}
              {masterDesign.visualIdentity.decorations.showWatermark && (
                <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none filter grayscale">
                  <img src={branding.logoUrl} alt="Watermark" className="w-3/4 object-contain" />
                </div>
              )}

              {/* Inner Double Gold Frame */}
              <div
                className="absolute inset-3 border rounded-xl pointer-events-none transition-all duration-500"
                style={{ borderColor: `${masterDesign.visualIdentity.palette.accent}55` }}
              />
              <div
                className="absolute inset-4 border border-dashed rounded-lg pointer-events-none transition-all duration-500 opacity-40"
                style={{ borderColor: masterDesign.visualIdentity.palette.accent }}
              />

              {/* DYNAMIC DERIVATIVE VARIATIONS */}

              {/* VARIATION A: INVITATION (بطاقة الدعوة الرسمية) */}
              {selectedDerivativeKind === 'invitation' ? (
                <div className="relative z-10 flex flex-col justify-between h-full space-y-3.5 text-center">
                  <div
                    className="flex flex-col items-center justify-center space-y-1.5 border-b pb-3"
                    style={{ borderColor: `${masterDesign.visualIdentity.palette.accent}40` }}
                  >
                    <p className="text-[10px] font-black text-white tracking-widest uppercase">المملكة المغربية</p>
                    <div
                      className="w-14 h-14 rounded-2xl bg-white p-1.5 border-2 shadow-md flex items-center justify-center my-0.5"
                      style={{ borderColor: masterDesign.visualIdentity.palette.accent }}
                    >
                      <img src={branding.logoUrl} alt="Logo" className="max-w-full max-h-full object-contain filter drop-shadow-sm" />
                    </div>
                    <h2 className="text-sm font-black text-white" style={{ color: masterDesign.visualIdentity.palette.accent }}>
                      {branding.name}
                    </h2>
                    <h3 className="text-lg font-bold font-serif text-white pt-1">
                      « دَعْــــوَةٌ رَسْـمِـيَّـــةٌ »
                    </h3>
                  </div>

                  <div className="my-auto space-y-3 px-2">
                    <p className="text-xs text-slate-200 font-serif italic">
                      «يتشرف المكتب المركزي لـ {branding.name} بدعوة سيادتكم الكريمة لحضور والمشاركة في فعاليات {currentActivity.type}:»
                    </p>
                    <h4 className="text-base sm:text-lg font-black text-white leading-snug">
                      {currentActivity.title}
                    </h4>
                    {currentActivity.slogan && (
                      <p className="text-xs font-serif italic text-amber-200/90">
                        «{currentActivity.slogan}»
                      </p>
                    )}
                    {currentActivity.participants && currentActivity.participants.length > 0 && (
                      <p className="text-[11px] text-slate-300 leading-relaxed max-w-sm mx-auto">
                        بمشاركة السادة الأساتذة والخبراء: {currentActivity.participants.map((p) => p.name).join('، ')}.
                      </p>
                    )}
                  </div>

                  <div
                    className="p-3 rounded-xl bg-slate-950/95 border shadow-xl text-xs space-y-1.5"
                    style={{ borderColor: masterDesign.visualIdentity.palette.accent }}
                  >
                    <p className="font-bold text-amber-300">الموعد والقاعة:</p>
                    <p className="text-white">📅 {currentActivity.date} م | ⏰ الساعة {currentActivity.time || '16:00'}</p>
                    <p className="text-slate-300">📍 {currentActivity.location} — {currentActivity.city}</p>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-white/10">
                    <span className="font-bold text-amber-300">عن المكتب المركزي — الكاتب العام: {currentActivity.responsiblePerson || branding.secretaryGeneral}</span>
                    <span className="font-serif">حضوركم تشريف لنا</span>
                  </div>
                </div>
              ) : selectedDerivativeKind === 'certificate' ? (
                /* VARIATION B: CERTIFICATE (شهادة المشاركة والتقدير) */
                <div className="relative z-10 flex flex-col justify-between h-full space-y-3.5 text-center">
                  <div
                    className="flex flex-col items-center justify-center space-y-1.5 border-b pb-2.5"
                    style={{ borderColor: `${masterDesign.visualIdentity.palette.accent}40` }}
                  >
                    <p className="text-[10px] font-black text-white tracking-widest uppercase">المملكة المغربية</p>
                    <div
                      className="w-14 h-14 rounded-2xl bg-white p-1.5 border-2 shadow-md flex items-center justify-center my-0.5"
                      style={{ borderColor: masterDesign.visualIdentity.palette.accent }}
                    >
                      <img src={branding.logoUrl} alt="Logo" className="max-w-full max-h-full object-contain filter drop-shadow-sm" />
                    </div>
                    <h2 className="text-sm font-black text-white" style={{ color: masterDesign.visualIdentity.palette.accent }}>
                      {branding.name}
                    </h2>
                    <h3 className="text-lg font-bold font-serif text-amber-300 pt-1">
                      شَـــهَادَةُ شُـكْـــرٍ وَتَـقْـــدِيـرٍ وَمُـشَـــارَكَـةٍ
                    </h3>
                  </div>

                  <div className="my-auto space-y-3 px-3">
                    <p className="text-xs text-slate-300">يشهد المكتب المركزي بأن السيد(ة):</p>
                    <h4 className="text-lg font-black text-white border-b-2 pb-1 max-w-xs mx-auto" style={{ borderColor: masterDesign.visualIdentity.palette.accent }}>
                      {currentActivity.participants?.[0]?.name || 'المشارك المعتمد'}
                    </h4>
                    <p className="text-xs font-bold text-amber-300">
                      بصفته: {currentActivity.participants?.[0]?.roleInActivity || 'متدخل رئيسي'}
                    </p>
                    <p className="text-[11px] text-slate-200 leading-relaxed font-serif">
                      «قد شارك(ت) بفعالية وتفانٍ في تأطير وإنجاح أشغال {currentActivity.type}: «{currentActivity.title}» المنظمة بمدينة {currentActivity.city} بتاريخ {currentActivity.date} م، تقديراً لجهوده المتميزة وعطائه المستمر.»
                    </p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-950/90 border flex items-center justify-between text-[11px]" style={{ borderColor: `${masterDesign.visualIdentity.palette.accent}60` }}>
                    <span className="font-mono text-slate-400">AMDS-CERT-{currentActivity.date?.replace(/-/g, '')}-001</span>
                    <span className="text-amber-300 font-bold">خاتم وتوقيع الكاتب العام</span>
                  </div>
                </div>
              ) : selectedDerivativeKind === 'social_post' ? (
                /* VARIATION C: SOCIAL MEDIA SQUARE (1:1) */
                <div className="relative z-10 flex flex-col justify-between h-full space-y-3 text-center">
                  <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: `${masterDesign.visualIdentity.palette.accent}40` }}>
                    <div className="w-10 h-10 rounded-xl bg-white p-1 border-2 shadow flex items-center justify-center" style={{ borderColor: masterDesign.visualIdentity.palette.accent }}>
                      <img src={branding.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                    </div>
                    <span className="text-xs font-black text-amber-300">{branding.acronym}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-slate-950 border text-white font-mono" style={{ borderColor: masterDesign.visualIdentity.palette.accent }}>
                      {currentActivity.type}
                    </span>
                  </div>

                  <div className="my-auto space-y-2">
                    <h3 className="text-base sm:text-lg font-black text-white leading-snug">
                      {currentActivity.title}
                    </h3>
                    {currentActivity.slogan && (
                      <p className="text-xs font-serif italic text-amber-200/90">«{currentActivity.slogan}»</p>
                    )}
                  </div>

                  {currentActivity.participants && currentActivity.participants.length > 0 && (
                    <div className="flex items-center justify-center gap-3">
                      {currentActivity.participants.slice(0, 3).map((p) => (
                        <div key={p.id} className="flex flex-col items-center">
                          <div className="w-12 h-12 rounded-full overflow-hidden border-2 shadow" style={{ borderColor: masterDesign.visualIdentity.palette.accent }}>
                            <img src={p.photoUrl} alt={p.name} className="w-full h-full object-cover" />
                          </div>
                          <p className="text-[10px] font-bold text-white mt-1 max-w-[85px] truncate">{p.name}</p>
                          <span className="text-[8px] text-amber-300">{p.roleInActivity}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="p-2.5 rounded-lg bg-slate-950/95 border text-xs text-amber-300 font-bold flex items-center justify-around" style={{ borderColor: masterDesign.visualIdentity.palette.accent }}>
                    <span>📅 {currentActivity.date}</span>
                    <span>⏰ {currentActivity.time || '16:00'}</span>
                    <span>📍 {currentActivity.city}</span>
                  </div>
                </div>
              ) : selectedDerivativeKind === 'program' ? (
                /* VARIATION D: PROGRAM TIMELINE (البرنامج المفصل) */
                <div className="relative z-10 flex flex-col justify-between h-full space-y-3 text-right">
                  <div className="text-center border-b pb-2" style={{ borderColor: `${masterDesign.visualIdentity.palette.accent}40` }}>
                    <h3 className="text-sm font-black text-amber-300">البرنامج العام والمفصل لأشغال النشاط</h3>
                    <p className="text-[11px] text-white font-bold truncate">{currentActivity.title}</p>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="p-2 rounded-lg bg-slate-950/90 border border-slate-800 flex items-center justify-between">
                      <span className="font-mono text-amber-300">15:30 — 16:00</span>
                      <span className="text-slate-200">استقبال المشاركين وتوزيع الملفات والبادجات</span>
                    </div>

                    <div className="p-2 rounded-lg bg-slate-950/90 border border-slate-800 flex items-center justify-between">
                      <span className="font-mono text-amber-300">16:00 — 16:30</span>
                      <span className="text-slate-200">افتتاح رسمي وكلمة الكاتب العام: {currentActivity.responsiblePerson || branding.secretaryGeneral}</span>
                    </div>

                    {(currentActivity.participants || []).map((p, idx) => (
                      <div key={p.id} className="p-2 rounded-lg bg-slate-950/95 border flex items-center justify-between" style={{ borderColor: `${masterDesign.visualIdentity.palette.accent}50` }}>
                        <span className="font-mono text-amber-300">{16 + idx}:30 — {17 + idx}:15</span>
                        <div className="text-right">
                          <p className="text-white font-bold">{p.name} ({p.roleInActivity})</p>
                          <p className="text-[10px] text-slate-400">{p.professionalTitle}</p>
                        </div>
                      </div>
                    ))}

                    <div className="p-2 rounded-lg bg-slate-950/90 border border-slate-800 flex items-center justify-between">
                      <span className="font-mono text-amber-300">18:15 — 19:00</span>
                      <span className="text-slate-200">مناقشة عامة، صياغة التوصيات، تسليم الشواهد واختتام النشاط</span>
                    </div>
                  </div>

                  <div className="text-[10px] text-center text-slate-400 pt-1 border-t border-white/10">
                    {currentActivity.organizer || branding.name} — لجنة التنظيم والتنسيق
                  </div>
                </div>
              ) : selectedDerivativeKind === 'speaker_card' ? (
                /* VARIATION E: KEYNOTE SPEAKER SPOTLIGHT CARD (1:1) */
                <div className="relative z-10 flex flex-col justify-between h-full space-y-3 text-center">
                  <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: `${masterDesign.visualIdentity.palette.accent}40` }}>
                    <div className="w-10 h-10 rounded-xl bg-white p-1 border-2 shadow" style={{ borderColor: masterDesign.visualIdentity.palette.accent }}>
                      <img src={branding.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                    </div>
                    <span className="text-xs font-bold text-amber-300">بطاقة متدخل رسمي</span>
                    <span className="text-[10px] text-slate-300 font-mono">{branding.acronym}</span>
                  </div>

                  <div className="my-auto space-y-2 flex flex-col items-center">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-4 shadow-xl" style={{ borderColor: masterDesign.visualIdentity.palette.accent }}>
                      <img
                        src={currentActivity.participants?.[0]?.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                        alt="Speaker"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-white">
                      {currentActivity.participants?.[0]?.name || 'المتدخل الرئيسي'}
                    </h3>
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-slate-950 border" style={{ borderColor: masterDesign.visualIdentity.palette.accent, color: masterDesign.visualIdentity.palette.accent }}>
                      {currentActivity.participants?.[0]?.roleInActivity || 'متدخل رئيسي'}
                    </span>
                    <p className="text-[11px] text-slate-300 max-w-xs">
                      {currentActivity.participants?.[0]?.professionalTitle || 'أستاذ باحث وخبير في التنمية'}
                    </p>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-950/90 border text-[11px] text-slate-300" style={{ borderColor: masterDesign.visualIdentity.palette.accent }}>
                    <p className="font-bold text-white truncate">{currentActivity.title}</p>
                    <p className="text-amber-300">{currentActivity.date} | {currentActivity.city}</p>
                  </div>
                </div>
              ) : selectedDerivativeKind === 'report_cover' ? (
                /* VARIATION F: REPORT COVER (غلاف التقرير الأدبي) */
                <div className="relative z-10 flex flex-col justify-between h-full space-y-4 text-center">
                  <div
                    className="flex flex-col items-center justify-center space-y-1.5 border-b pb-3"
                    style={{ borderColor: `${masterDesign.visualIdentity.palette.accent}40` }}
                  >
                    <p className="text-[10px] font-black text-white tracking-widest uppercase">المملكة المغربية</p>
                    <div
                      className="w-14 h-14 rounded-2xl bg-white p-1.5 border-2 shadow-md flex items-center justify-center my-0.5"
                      style={{ borderColor: masterDesign.visualIdentity.palette.accent }}
                    >
                      <img src={branding.logoUrl} alt="Logo" className="max-w-full max-h-full object-contain filter drop-shadow-sm" />
                    </div>
                    <h2 className="text-sm font-black text-white" style={{ color: masterDesign.visualIdentity.palette.accent }}>
                      {branding.name}
                    </h2>
                    <span className="text-xs font-mono text-amber-300 bg-slate-950 px-3 py-1 rounded-full border border-amber-700">
                      ملف التوثيق الرقمي: AMDS-REP-{currentActivity.id?.slice(0, 6) || '2026'}
                    </span>
                  </div>

                  <div className="my-auto space-y-3 px-3">
                    <h3 className="text-base font-bold text-slate-200 font-serif">التقرير الأدبي والتوثيقي الشامل</h3>
                    <h2 className="text-lg sm:text-xl font-black text-white leading-snug">
                      حول أشغال {currentActivity.type}: «{currentActivity.title}»
                    </h2>
                    {currentActivity.slogan && (
                      <p className="text-xs font-serif italic text-amber-200">«{currentActivity.slogan}»</p>
                    )}
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/95 border text-xs text-slate-300 space-y-1" style={{ borderColor: masterDesign.visualIdentity.palette.accent }}>
                    <p>تاريخ التنفيذ: {currentActivity.date} م | المكان: {currentActivity.location} — {currentActivity.city}</p>
                    <p className="text-amber-300">إشراف وتوثيق: الكتابة العامة ({currentActivity.responsiblePerson || branding.secretaryGeneral})</p>
                  </div>
                </div>
              ) : (
                /* DEFAULT / POSTER VARIATION */
                <div className="relative z-10 flex flex-col justify-between h-full space-y-3.5">
                  {/* Header with Centered AMDS Logo */}
                  <div
                    className="flex flex-col items-center justify-center text-center space-y-2 border-b pb-3.5 transition-all duration-500"
                    style={{ borderColor: `${masterDesign.visualIdentity.palette.accent}40` }}
                  >
                    <p className="text-[10px] sm:text-xs font-black text-white tracking-widest uppercase">
                      المملكة المغربية
                    </p>

                    {/* Centered Logo Badge with White Background & Glow */}
                    <div
                      className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-white p-2 border-2 shadow-[0_0_28px_rgba(212,175,55,0.5)] flex items-center justify-center transition-all duration-500 hover:scale-105 my-0.5"
                      style={{ borderColor: masterDesign.visualIdentity.palette.accent }}
                    >
                      <img
                        src={branding.logoUrl}
                        alt="Logo"
                        className="max-w-full max-h-full object-contain filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.18)]"
                      />
                    </div>

                    <div className="space-y-0.5">
                      <h2
                        className="text-sm sm:text-base font-black tracking-tight"
                        style={{ color: masterDesign.visualIdentity.palette.accent }}
                      >
                        {branding.name}
                      </h2>
                      <p className="text-[10px] text-slate-300 font-mono tracking-wider">
                        {branding.acronym} — الكتابة العامة
                      </p>
                    </div>

                    <div className="pt-0.5">
                      <p className="text-xs sm:text-sm font-serif italic text-amber-200/95 tracking-wide">
                        «{currentActivity.slogan || branding.slogan}»
                      </p>
                    </div>
                  </div>

                  {/* Poster Body */}
                  <div className="my-auto py-3 space-y-3.5 text-center">
                    <div
                      className="inline-block px-4 py-1 rounded-full text-xs font-bold text-white shadow-md"
                      style={{
                        backgroundColor: `${masterDesign.visualIdentity.palette.primary}ee`,
                        border: `1.5px solid ${masterDesign.visualIdentity.palette.accent}`
                      }}
                    >
                      {currentActivity.organizer || branding.name} تنظم: {currentActivity.type}
                    </div>

                    <h2 className="text-lg sm:text-2xl font-black text-white leading-tight drop-shadow-md">
                      {currentActivity.title}
                    </h2>

                    {/* Speakers Grid Showcase */}
                    {currentActivity.participants && currentActivity.participants.length > 0 && (
                      <div className="pt-1">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <span className="h-px w-6 bg-amber-400/40"></span>
                          <p className="text-[10px] font-bold text-amber-300">المتدخلون والمشاركون في الجلسات:</p>
                          <span className="h-px w-6 bg-amber-400/40"></span>
                        </div>

                        <div className={`grid gap-2 ${currentActivity.participants.length <= 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                          {currentActivity.participants.map((p) => (
                            <div
                              key={p.id}
                              className="flex flex-col items-center text-center p-2 rounded-xl bg-slate-950/80 border shadow-md backdrop-blur-sm"
                              style={{ borderColor: `${masterDesign.visualIdentity.palette.accent}50` }}
                            >
                              <div
                                className="w-11 h-11 rounded-full overflow-hidden border-2 shadow-md mb-1 flex-shrink-0 bg-slate-900"
                                style={{ borderColor: masterDesign.visualIdentity.palette.accent }}
                              >
                                <img src={p.photoUrl} alt={p.name} className="w-full h-full object-cover" />
                              </div>
                              <span
                                className="text-[9px] px-1 py-0.2 rounded font-semibold mb-0.5"
                                style={{
                                  backgroundColor: `${masterDesign.visualIdentity.palette.primary}cc`,
                                  color: masterDesign.visualIdentity.palette.accent
                                }}
                              >
                                {p.roleInActivity}
                              </span>
                              <p className="text-[11px] font-bold text-white truncate max-w-full">{p.name}</p>
                              <p className="text-[9px] text-slate-300 line-clamp-1">{p.professionalTitle}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Practical Details & Footer Box */}
                  <div className="space-y-2.5">
                    <div
                      className="p-3 sm:p-3.5 rounded-xl bg-slate-950/95 border shadow-xl space-y-1.5 text-xs"
                      style={{ borderColor: masterDesign.visualIdentity.palette.accent }}
                    >
                      <div className="grid grid-cols-2 gap-2 text-slate-200">
                        <div className="flex items-center gap-1.5 font-bold" style={{ color: masterDesign.visualIdentity.palette.accent }}>
                          <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>{currentActivity.date} م</span>
                        </div>

                        <div className="flex items-center gap-1.5 font-bold" style={{ color: masterDesign.visualIdentity.palette.accent }}>
                          <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>الساعة {currentActivity.time || '16:00'}</span>
                        </div>

                        <div className="flex items-center gap-1.5 col-span-2 text-slate-300 pt-1 border-t border-slate-800">
                          <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-sky-400" />
                          <span className="truncate">{currentActivity.location} — {currentActivity.city}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                      <span>{branding.website}</span>
                      <span>الدعوة عامة / الحضور مؤكد</span>
                      <span className="font-mono text-amber-400/90">AMDS-ACT-{currentActivity.id?.slice(0, 6) || '2026'}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Visual Identity Engine */}
      {activeTab === 'visual_identity' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Palette className="w-5 h-5 text-amber-400" />
              <span>الهوية البصرية الخاصة بالنشاط (Visual Identity Layer)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              ميثاق ألوان وتكوين متناسق مستمد من طبيعة الموضوع، يُغذي الملصق وكافة الملحقات المشتقة تلقائياً.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                id: 'zellige_moroccan',
                title: '🇲🇦 النمط الملكي والزليج (ندوات فكرية ومحاضرات)',
                desc: 'أخضر ملكي وذهب عتيق مع زخارف الزليج والأقواس الأندلسية.',
                primary: '#006233',
                accent: '#D4AF37'
              },
              {
                id: 'atlas_mountains',
                title: '⛰️ نمط جبال الأطلس والتضامن (قوافل وحملات خيرية)',
                desc: 'أحمر مغربي وتراب ذهبي مع قمم الأطلس وشمس التضامن.',
                primary: '#C1272D',
                accent: '#F59E0B'
              },
              {
                id: 'institutional_arch',
                title: '📜 النمط الدستوري المؤسساتي (جموع عامة ومجالس)',
                desc: 'كحلي داكن وأعمدة معمارية هادئة للمناسبات الرسمية.',
                primary: '#0F172A',
                accent: '#D4AF37'
              },
              {
                id: 'tech_nodes',
                title: '💡 نمط الابتكار والتكوين (ورشات ودورات شبابية)',
                desc: 'زمردي عصري وسماوي مع شبكات المعرفة الرقمية المتصلة.',
                primary: '#064E3B',
                accent: '#38BDF8'
              },
              {
                id: 'cedar_forest',
                title: '🌲 نمط الأرز والطبيعة (مخيمات ورحلات ميدانية)',
                desc: 'أخضر غابات الأرز وتراب كهرماني مع رموز الخيام والبيئة.',
                primary: '#14532D',
                accent: '#FBBF24'
              }
            ].map((theme) => {
              const isCurrent = masterDesign.visualIdentity.backgroundPattern === theme.id;
              return (
                <div
                  key={theme.id}
                  onClick={() => handleApplyPalette(theme.id as any)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all space-y-3 ${
                    isCurrent
                      ? 'bg-slate-950 border-emerald-500 shadow-xl ring-2 ring-emerald-500/30'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs">{theme.title}</span>
                    {isCurrent && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{theme.desc}</p>
                  <div className="flex items-center gap-2 pt-2">
                    <span className="w-6 h-6 rounded-full border border-white/20" style={{ backgroundColor: theme.primary }} />
                    <span className="w-6 h-6 rounded-full border border-white/20" style={{ backgroundColor: theme.accent }} />
                    <span className="text-[10px] text-slate-400 font-mono">
                      {theme.primary} / {theme.accent}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: Derivatives Suite (12 Assets) */}
      {activeTab === 'derivatives' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Copy className="w-5 h-5 text-emerald-400" />
                <span>حزمة الملحقات البصرية المشتقة (Derivatives Suite)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                جميع هذه المواد مشتقة تلقائياً من نفس Master Design ومطابقة للهوية الرسمية والمعطيات دون إعادة إدخال.
              </p>
            </div>
            <button
              onClick={handleExportZip}
              disabled={isExportingZip}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow"
            >
              <FolderArchive className="w-4 h-4" />
              <span>تنزيل الحزمة كاملة (ZIP)</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {derivatives.map((deriv) => (
              <div
                key={deriv.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-all space-y-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-amber-300 font-mono">
                      {deriv.aspectRatio}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-medium">✓ متزامن</span>
                  </div>
                  <h4 className="font-bold text-white text-xs pt-1">{deriv.title}</h4>
                  <p className="text-[11px] text-slate-400 line-clamp-1">{currentActivity.title}</p>
                </div>

                <div className="w-full h-32 rounded-lg bg-slate-950 border border-slate-800/80 p-2 flex flex-col items-center justify-center text-center space-y-1">
                  <div className="w-8 h-8 rounded-lg bg-white p-1 border border-amber-400 flex items-center justify-center">
                    <img src={branding.logoUrl} alt="AMDS" className="w-full h-full object-contain" />
                  </div>
                  <span className="text-[10px] text-slate-300 font-bold truncate max-w-full">
                    {deriv.kind.toUpperCase()}
                  </span>
                  <span className="text-[9px] text-amber-300 font-mono">{currentActivity.date}</span>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => {
                      setSelectedDerivativeKind(deriv.kind);
                      notify(`تم اختيار ${deriv.title} للمعاينة والتخصيص`, 'info');
                    }}
                    className="flex-1 py-1.5 bg-slate-950 hover:bg-slate-800 text-slate-300 rounded text-[11px] font-medium transition-colors"
                  >
                    معاينة
                  </button>
                  <button
                    onClick={handleDownloadSinglePNG}
                    className="p-1.5 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 rounded border border-emerald-800 transition-colors"
                    title="تصدير مستقل"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: Design Review & Readiness Audit */}
      {activeTab === 'review' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>مراجعة وتدقيق التصميم (Design Readiness Audit)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                فحص آلي شامل لضمان اكتمال كافة البيانات المؤسساتية، الأمان الطباعي، ومطابقة الهوية قبل النشر.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-xs text-slate-400 block">درجة الجاهزية</span>
                <span className="text-2xl font-black font-mono text-emerald-400">{reviewReport.score}/100</span>
              </div>
              <button
                onClick={handleApproveDesign}
                disabled={masterDesign.workflowState === 'Approved'}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all disabled:opacity-50"
              >
                اعتماد رسمي
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {reviewReport.findings.map((f, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border flex items-start gap-3 ${
                  f.passed
                    ? 'bg-slate-950/80 border-slate-800 text-slate-200'
                    : f.severity === 'error'
                    ? 'bg-red-950/40 border-red-800 text-red-200'
                    : 'bg-amber-950/40 border-amber-800 text-amber-200'
                }`}
              >
                {f.passed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className="font-bold text-xs">{f.label}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">{f.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: Versions History */}
      {activeTab === 'versions' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <History className="w-5 h-5 text-sky-400" />
              <span>سجل إصدارات التصميم (Design Version Control)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              توثيق زمني غير قابل للمسح لكافة النسخ والتعديلات مع إمكانية المعاينة والاستعادة.
            </p>
          </div>

          <div className="space-y-3">
            {versions.map((ver) => (
              <div
                key={ver.id}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800 font-mono text-xs font-bold">
                      V{ver.versionNumber}
                    </span>
                    <span className="text-xs font-bold text-white">{ver.changeSummary}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    بواسطة: {ver.changedBy} | {new Date(ver.changedAt).toLocaleString('ar-MA')}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] px-2 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">
                    الحالة: {ver.workflowState}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: Full Export Pack */}
      {activeTab === 'export_pack' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FolderArchive className="w-5 h-5 text-amber-400" />
              <span>تصدير حزمة النشاط المتكاملة (Activity Design Pack)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              تنزيل أرشيف مضغوط ZIP يحتوي على كافة المواد البصرية المشتقة (ملصق، دعوة، برنامج، منشورات، شهادات) مع ملف Manifest الرقمي.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center text-center space-y-4 max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-amber-950/60 border border-amber-800/80 flex items-center justify-center text-amber-400">
              <FolderArchive className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h4 className="text-base font-bold text-white">
                MIDAD_AMDS_{currentActivity.date}_{currentActivity.id?.slice(0, 6)}.zip
              </h4>
              <p className="text-xs text-slate-400 max-w-md">
                تحتوي الحزمة على 10 ملفات صورية عالية الدقة 300 DPI جاهزة للطباعة والنشر الرقمي، بالإضافة إلى وثيقة التوثيق الرقمي.
              </p>
            </div>

            <button
              onClick={handleExportZip}
              disabled={isExportingZip}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-sm font-bold shadow-xl transition-all disabled:opacity-50 hover:scale-[1.02]"
            >
              {isExportingZip ? <RefreshCw className="w-4 h-4 animate-spin text-amber-300" /> : <Download className="w-4 h-4" />}
              <span>توليد وتنزيل حزمة ZIP الآن</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
