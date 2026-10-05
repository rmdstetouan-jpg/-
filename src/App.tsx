/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { TitleBar } from './desktop/TitleBar';
import { StatusBar } from './desktop/StatusBar';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardView } from './modules/dashboard/DashboardView';
import { BrandCenterView } from './modules/brand-center/BrandCenterView';
import { ActivitiesView } from './modules/activities/ActivitiesView';
import { NewActivityModal } from './modules/activities/NewActivityModal';
import { AuditLogView } from './modules/audit-log/AuditLogView';
import { DatabaseStorageHub } from './modules/storage-database/DatabaseStorageHub';
import { DesignEngineView } from './modules/design-engine/DesignEngineView';
import { ActivityRoomView } from './modules/activity-room/ActivityRoomView';
import { AuthModal } from './components/AuthModal';
import { CommandPalette } from './components/CommandPalette';
import { PhasePlaceholderView } from './components/PhasePlaceholderView';
import {
  DEFAULT_AMDS_BRANDING,
  getOrganizationBranding,
  updateOrganizationBranding,
  subscribeToActivities,
  subscribeToAuditLogs,
  createActivity,
  testConnection,
  INITIAL_DEMO_ACTIVITIES,
  recordAuditLog
} from './services/firebase';
import {
  subscribeToBranches,
  subscribeToMembers,
  subscribeToPartners,
  subscribeToDocuments,
  subscribeToCertificates,
  subscribeToInstitutionalMemory
} from './services/db';
import type {
  Activity,
  AuditLogItem,
  OrganizationBranding,
  UserProfile,
  Branch,
  Member,
  Partner,
  DocumentItem,
  CertificateItem,
  InstitutionalMemoryDoc
} from './types';

export default function App() {
  const [branding, setBranding] = useState<OrganizationBranding>(DEFAULT_AMDS_BRANDING);
  const [currentUser, setCurrentUser] = useState<UserProfile>({
    id: 'sec_gen_01',
    email: 'rmdstetouan@gmail.com',
    displayName: 'ذ. عماد المزراوي',
    role: 'SUPER_ADMIN',
    title: 'الكاتب العام للرابطة المغربية للتنمية والتضامن',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  const [activities, setActivities] = useState<Activity[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [certificates, setCertificates] = useState<CertificateItem[]>([]);
  const [memoryDocs, setMemoryDocs] = useState<InstitutionalMemoryDoc[]>([]);

  const [currentModule, setCurrentModule] = useState<string>('dashboard');
  const [selectedPosterActivityId, setSelectedPosterActivityId] = useState<string | undefined>(undefined);
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modals
  const [isNewActivityOpen, setIsNewActivityOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Initialize data and listeners on boot
  useEffect(() => {
    let unsubscribeActivities: () => void = () => {};
    let unsubscribeAudit: () => void = () => {};
    let unsubscribeBranches: () => void = () => {};
    let unsubscribeMembers: () => void = () => {};
    let unsubscribePartners: () => void = () => {};
    let unsubscribeDocs: () => void = () => {};
    let unsubscribeCerts: () => void = () => {};
    let unsubscribeMem: () => void = () => {};

    async function initializeSystem() {
      try {
        const connected = await testConnection();
        setIsConnected(connected);

        // Fetch Branding
        const brand = await getOrganizationBranding();
        setBranding(brand);

        // Subscribe to real-time Activities
        unsubscribeActivities = subscribeToActivities((fetched) => {
          if (fetched.length === 0 && activities.length === 0) {
            setActivities(
              INITIAL_DEMO_ACTIVITIES.map((act, index) => ({
                ...act,
                id: `demo_${index + 1}`,
                version: 1,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              }))
            );
          } else {
            setActivities(fetched);
          }
          setIsLoading(false);
        });

        // Subscribe to domain collections
        unsubscribeBranches = subscribeToBranches((data) => setBranches(data));
        unsubscribeMembers = subscribeToMembers((data) => setMembers(data));
        unsubscribePartners = subscribeToPartners((data) => setPartners(data));
        unsubscribeDocs = subscribeToDocuments((data) => setDocuments(data));
        unsubscribeCerts = subscribeToCertificates((data) => setCertificates(data));
        unsubscribeMem = subscribeToInstitutionalMemory((data) => setMemoryDocs(data));

        // Subscribe to real-time Audit logs
        unsubscribeAudit = subscribeToAuditLogs((logs) => {
          if (logs.length === 0 && auditLogs.length === 0) {
            setAuditLogs([
              {
                id: 'log_boot_1',
                action: 'LOGIN',
                module: 'AUTH',
                recordId: 'sec_gen_01',
                recordTitle: 'بدء تشغيل مِداد MIDAD AMDS Desktop',
                performedBy: 'ذ. عماد المزراوي',
                performedByEmail: 'rmdstetouan@gmail.com',
                timestamp: new Date().toISOString(),
                details: 'تشغيل نظام الكتابة العامة والاتصال بسحابة Firebase بنجاح.'
              },
              {
                id: 'log_boot_2',
                action: 'BRAND_UPDATE',
                module: 'BRAND_CENTER',
                recordId: 'amds',
                recordTitle: 'تأكيد الهوية الرسمية للرابطة',
                performedBy: 'النظام',
                performedByEmail: 'system@amdstetouan.com',
                timestamp: new Date().toISOString(),
                details: 'مزامنة الشعار وميثاق الألوان المعتمد لـ AMDS.'
              }
            ]);
          } else {
            setAuditLogs(logs);
          }
        });
      } catch (err) {
        console.error('Initialization error:', err);
        setIsLoading(false);
      }
    }

    initializeSystem();

    return () => {
      unsubscribeActivities();
      unsubscribeAudit();
      unsubscribeBranches();
      unsubscribeMembers();
      unsubscribePartners();
      unsubscribeDocs();
      unsubscribeCerts();
      unsubscribeMem();
    };
  }, []);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setIsNewActivityOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleUpdateBranding = async (updated: Partial<OrganizationBranding>) => {
    try {
      await updateOrganizationBranding(updated, currentUser);
      setBranding((prev) => ({ ...prev, ...updated }));
    } catch (err) {
      console.warn('Update branding local sync:', err);
      setBranding((prev) => ({ ...prev, ...updated }));
    }
  };

  const handleCreateActivity = async (
    activityData: Omit<Activity, 'id' | 'createdAt' | 'updatedAt' | 'version'>
  ) => {
    try {
      const newId = await createActivity(activityData, currentUser);
      const newActivity: Activity = {
        ...activityData,
        id: newId,
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setActivities((prev) => [newActivity, ...prev]);
    } catch (err) {
      console.warn('Activity creation fallback:', err);
      const newActivity: Activity = {
        ...activityData,
        id: `act_${Date.now()}`,
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setActivities((prev) => [newActivity, ...prev]);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-slate-950 font-['Cairo',sans-serif] selection:bg-emerald-600 selection:text-white">
      {/* 1. Desktop Window Titlebar & Menu */}
      <TitleBar
        branding={branding}
        currentUser={currentUser}
        isConnected={isConnected}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenBrandCenter={() => setCurrentModule('brand')}
        onOpenAuth={() => setIsAuthOpen(true)}
        onNavigate={(mod) => {
          if (mod === 'activities-new') {
            setIsNewActivityOpen(true);
          } else {
            setCurrentModule(mod);
          }
        }}
      />

      {/* 2. Main Workspace Layout */}
      <AppLayout
        currentModule={currentModule}
        onNavigate={setCurrentModule}
        branding={branding}
        currentUser={currentUser}
        activityCount={activities.length}
      >
        {currentModule === 'dashboard' && (
          <DashboardView
            branding={branding}
            activities={activities}
            auditLogs={auditLogs}
            currentUser={currentUser}
            onOpenNewActivity={() => setIsNewActivityOpen(true)}
            onOpenBrandCenter={() => setCurrentModule('brand')}
            onNavigate={setCurrentModule}
          />
        )}

        {currentModule === 'activity-room' && (
          <ActivityRoomView
            branding={branding}
            currentUser={currentUser}
            onActivityCreated={(newAct) => {
              setActivities((prev) => [newAct, ...prev]);
              setSelectedPosterActivityId(newAct.id);
            }}
            onNavigateToPoster={(actId) => {
              setSelectedPosterActivityId(actId);
              setCurrentModule('design-engine');
            }}
          />
        )}

        {currentModule === 'activities' && (
          <ActivitiesView
            activities={activities}
            onOpenNewActivity={() => setIsNewActivityOpen(true)}
            currentUser={currentUser}
            onOpenActivityRoom={() => setCurrentModule('activity-room')}
            onDesignPoster={(act) => {
              setSelectedPosterActivityId(act.id);
              setCurrentModule('design-engine');
            }}
          />
        )}

        {currentModule === 'brand' && (
          <BrandCenterView
            branding={branding}
            onUpdateBranding={handleUpdateBranding}
            currentUser={currentUser}
          />
        )}

        {currentModule === 'data-hub' && (
          <DatabaseStorageHub
            activities={activities}
            branches={branches}
            members={members}
            partners={partners}
            documents={documents}
            certificates={certificates}
            memoryDocs={memoryDocs}
          />
        )}

        {currentModule === 'design-engine' && (
          <DesignEngineView
            activities={activities}
            branding={branding}
            currentUser={currentUser}
            selectedActivityId={selectedPosterActivityId}
            onActivityUpdated={(updatedAct) => {
              setActivities((prev) => prev.map((a) => (a.id === updatedAct.id ? updatedAct : a)));
            }}
          />
        )}

        {currentModule === 'audit' && <AuditLogView logs={auditLogs} />}

        {/* Phase 2+ Module Previews mapped to Architecture */}
        {currentModule === 'documents' && (
          <PhasePlaceholderView
            moduleName="محرك الوثائق والمراسلات الرسمية (Document Engine)"
            targetPhase={2}
            description="نظام المراسلات الرسمية والترقيم التلقائي الموحد (AMDS/SG/2026/001) وإعداد البلاغات والدعوات والمحاضر."
            features={[
              'ترقيم تسلسلي ذكي غير قابل للتكرار لكل نوع وثيقة',
              'توليد المراسلات والردود والطلبات الرسمية برأس وتذييل AMDS',
              'محاضر الجموع العامة واجتماعات المكتب المركزي',
              'تكامل أحادي المصدر: جلب التواريخ والأسماء مباشرة من بيانات النشاط'
            ]}
            onBackToDashboard={() => setCurrentModule('dashboard')}
          />
        )}

        {currentModule === 'file-manager' && (
          <PhasePlaceholderView
            moduleName="مدير الملفات والمستندات (Local & Cloud File Manager)"
            targetPhase={3}
            description="إدارة ملفات الأنشطة محلياً وسحابياً عبر Firebase Storage مع السحب والإفلات وتجميع Activity Pack (ZIP)."
            features={[
              'تنظيم المجلدات شجرياً: السنة / الفرع / النشاط / نوع الوثيقة',
              'معاينة ملفات PDF, Word, Excel, PowerPoint داخل البرنامج بدون مغادرته',
              'تصدير حزمة النشاط الكاملة (Activity Pack) بضغطة زر بصيغة ZIP',
              'فحص سلامة الملفات وسجل النسخ المتتالية (Version Control)'
            ]}
            onBackToDashboard={() => setCurrentModule('dashboard')}
          />
        )}

        {currentModule === 'ai' && (
          <PhasePlaceholderView
            moduleName="مركز الذكاء الاصطناعي المؤسسي «اسأل مِداد»"
            targetPhase={4}
            description="المساعد الرقمي الملتزم بقاعدة الصفر-هلوسة: استخراج البيانات من الملفات والمسح الضوئي (OCR) وفحص التناقضات."
            features={[
              'استخراج أسماء المشاركين والتواريخ من مستندات PDF الممسوحة ضوئياً (OCR)',
              'فحص التناقضات: مقارنة أرقام التقرير الأدبي مع لوائح الحضور الفعلية',
              'البحث الدلالي في الذاكرة المؤسسية (القانون الأساسي والنظام الداخلي)',
              'ممنوع من اختراع المعلومات: توثيق مصدر كل معلومة بصرامة'
            ]}
            onBackToDashboard={() => setCurrentModule('dashboard')}
          />
        )}

        {currentModule === 'members' && (
          <PhasePlaceholderView
            moduleName="سجل الأعضاء والفروع والشركاء المؤسساتيين"
            targetPhase={7}
            description="إدارة قاعدة بيانات أعضاء الرابطة، فروع تطوان وطنجة والرباط، والشركاء مع التمييز بين المعتمد والمقترح."
            features={[
              'سجل العضويات وتتبع الأدوار والوثائق الرسمية',
              'إدارة الفروع المستقلة ومكاتبها التنفيذية ومراسلاتها',
              'دليل الشركاء واتفاقيات الشراكة والأنشطة المشتركة',
              'حماية البيانات الشخصية: الأعضاء المستخرجون من الذكاء الاصطناعي يظلون مقترحين حتى يعتمدوا'
            ]}
            onBackToDashboard={() => setCurrentModule('dashboard')}
          />
        )}

        {currentModule === 'archive' && (
          <PhasePlaceholderView
            moduleName="الأرشيف الذكي والذاكرة المؤسسية"
            targetPhase={4}
            description="حفظ وتوثيق كافة محطات الرابطة عبر السنوات بنظام وسوم وربط رقمي محكم يمنع ضياع أي وثيقة."
            features={[
              'أرشفة هرمية ودلالية متعددة الأبعاد (سنة / فرع / نشاط / وسم)',
              'حفظ القانون الأساسي والنظم الداخلية كمصدر وحيد لحقائق الرابطة',
              'إمكانية الاسترجاع والبحث الفوري حتى بعد مرور سنوات',
              'منع الحذف النهائي دون تأكيد مزدوج وصلاحيات خاصة'
            ]}
            onBackToDashboard={() => setCurrentModule('dashboard')}
          />
        )}
      </AppLayout>

      {/* 3. Desktop Statusbar */}
      <StatusBar
        currentUser={currentUser}
        isConnected={isConnected}
        activityCount={activities.length}
      />

      {/* Modals */}
      <NewActivityModal
        isOpen={isNewActivityOpen}
        onClose={() => setIsNewActivityOpen(false)}
        onSubmit={handleCreateActivity}
        currentUser={currentUser}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={currentUser}
        onUpdateCurrentUser={setCurrentUser}
      />

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        activities={activities}
        onNavigate={setCurrentModule}
        onOpenNewActivity={() => setIsNewActivityOpen(true)}
      />
    </div>
  );
}
