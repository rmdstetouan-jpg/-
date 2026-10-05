import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  type Unsubscribe
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import type { Activity, AuditLogItem, OrganizationBranding, UserProfile, UserRole } from '../types';

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId); /* CRITICAL: The app will break without this line */
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test Connection on boot
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("MIDAD AMDS: Client is currently operating in offline mode.");
      return false;
    }
    // Non-fatal if test collection isn't seeded yet
    return true;
  }
}

// Official AMDS Default Branding
export const DEFAULT_AMDS_BRANDING: OrganizationBranding = {
  id: 'amds',
  name: 'الرابطة المغربية للتنمية والتضامن',
  acronym: 'AMDS',
  slogan: 'نكتب، نوثق، ننظم، ونحفظ ذاكرة الرابطة.',
  secretaryGeneral: 'ذ. عماد المزراوي',
  email: 'amdstetouan@gmail.com',
  website: 'www.amdstetouan.com',
  phone: '+212 539 00 00 00',
  address: 'تطوان، المملكة المغربية',
  primaryColor: '#C1272D', // الأحمر المغربي
  secondaryColor: '#006233', // الأخضر الملكي
  accentColor: '#D4AF37', // الذهبي التوثيقي
  darkColor: '#0F172A', // الأسود الحبري / الكحلي الداكن
  logoUrl: 'https://www.amdstetouan.com/web/image/1395-042c4fa6/Screenshot_20250810-013959-removebg-preview.svg',
  logoDarkUrl: 'https://www.amdstetouan.com/web/image/1395-042c4fa6/Screenshot_20250810-013959-removebg-preview.svg',
  watermarkUrl: 'https://www.amdstetouan.com/web/image/1395-042c4fa6/Screenshot_20250810-013959-removebg-preview.svg',
  headerTemplate: 'المملكة المغربية — الرابطة المغربية للتنمية والتضامن (AMDS) — الكتابة العامة',
  footerTemplate: 'المقر المركزي: تطوان | هاتف: amdstetouan@gmail.com | الموقع الرسمي: www.amdstetouan.com',
  updatedAt: new Date().toISOString(),
  updatedBy: 'ذ. عماد المزراوي'
};

// Organization Service
export async function getOrganizationBranding(): Promise<OrganizationBranding> {
  const path = 'organization/amds';
  try {
    const docRef = doc(db, 'organization', 'amds');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as OrganizationBranding;
    } else {
      // Seed initial AMDS default branding into Firestore
      try {
        await setDoc(docRef, {
          ...DEFAULT_AMDS_BRANDING,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      } catch {
        // Fallback if unauthenticated yet
      }
      return DEFAULT_AMDS_BRANDING;
    }
  } catch (error) {
    console.warn('Using local fallback branding:', error);
    return DEFAULT_AMDS_BRANDING;
  }
}

export async function updateOrganizationBranding(
  branding: Partial<OrganizationBranding>,
  user: UserProfile
): Promise<void> {
  const path = 'organization/amds';
  try {
    const docRef = doc(db, 'organization', 'amds');
    await setDoc(docRef, {
      ...branding,
      updatedAt: serverTimestamp(),
      updatedBy: user.displayName || user.email
    }, { merge: true });

    // Record audit log
    await recordAuditLog({
      action: 'BRAND_UPDATE',
      module: 'BRAND_CENTER',
      recordId: 'amds',
      recordTitle: 'تحديث الهوية الرسمية للرابطة',
      performedBy: user.displayName,
      performedByEmail: user.email,
      details: 'تم تحديث عناصر الهوية البصرية الرسمية للرابطة المغربية للتنمية والتضامن'
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// Audit Log Service
export async function recordAuditLog(log: Omit<AuditLogItem, 'id' | 'timestamp'>): Promise<void> {
  const path = 'audit_logs';
  try {
    const logId = `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const docRef = doc(db, 'audit_logs', logId);
    await setDoc(docRef, {
      ...log,
      id: logId,
      timestamp: new Date().toISOString(),
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.warn('Audit log write deferred or offline:', error);
  }
}

export function subscribeToAuditLogs(callback: (logs: AuditLogItem[]) => void): Unsubscribe {
  const path = 'audit_logs';
  try {
    const q = query(collection(db, 'audit_logs'), orderBy('timestamp', 'desc'), limit(15));
    return onSnapshot(q, (snapshot) => {
      const logs: AuditLogItem[] = [];
      snapshot.forEach(docSnap => {
        logs.push(docSnap.data() as AuditLogItem);
      });
      callback(logs);
    }, (error) => {
      console.warn('Audit logs listener fallback:', error);
      callback([]);
    });
  } catch (error) {
    console.warn('Failed to subscribe to audit logs:', error);
    callback([]);
    return () => {};
  }
}

// Activity Service (Core Entity)
export function subscribeToActivities(callback: (activities: Activity[]) => void): Unsubscribe {
  const path = 'activities';
  try {
    const q = query(collection(db, 'activities'), orderBy('createdAt', 'desc'), limit(50));
    return onSnapshot(q, (snapshot) => {
      const activities: Activity[] = [];
      snapshot.forEach(docSnap => {
        activities.push({ ...docSnap.data(), id: docSnap.id } as Activity);
      });
      callback(activities);
    }, (error) => {
      console.warn('Activities listener fallback to local/empty:', error);
      callback([]);
    });
  } catch (error) {
    console.warn('Activities subscription error:', error);
    callback([]);
    return () => {};
  }
}

export async function createActivity(activity: Omit<Activity, 'id' | 'createdAt' | 'updatedAt' | 'version'>, user: UserProfile): Promise<string> {
  const path = 'activities';
  try {
    const activityId = `act_${Date.now()}`;
    const docRef = doc(db, 'activities', activityId);

    // Calculate initial readiness score
    const readinessScore = calculateActivityReadiness(activity);

    const payload = {
      ...activity,
      id: activityId,
      version: 1,
      readinessScore,
      createdBy: user.id || auth.currentUser?.uid || 'system',
      createdByName: user.displayName,
      updatedBy: user.displayName,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    await setDoc(docRef, payload);

    await recordAuditLog({
      action: 'CREATE',
      module: 'ACTIVITIES',
      recordId: activityId,
      recordTitle: activity.title,
      performedBy: user.displayName,
      performedByEmail: user.email,
      details: `إنشاء نشاط جديد: "${activity.title}" بتاريخ ${activity.date}`
    });

    return activityId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export function calculateActivityReadiness(activity: Partial<Activity>): number {
  let score = 20; // Base: Data input
  if (activity.description && activity.description.length > 30) score += 10;
  if (activity.objectives && activity.objectives.length > 0) score += 10;
  if (activity.hasPoster) score += 15;
  if (activity.hasProgram) score += 15;
  if (activity.hasInvitations) score += 10;
  if (activity.hasAttendance) score += 10;
  if (activity.hasReport) score += 10;
  return Math.min(100, score);
}

// Initial Sample Activities if collection is newly created
export const INITIAL_DEMO_ACTIVITIES: Omit<Activity, 'id' | 'createdAt' | 'updatedAt' | 'version'>[] = [
  {
    title: 'الندوة الوطنية السنوية حول التنمية المستدامة والتضامن الاجتماعي',
    type: 'ندوة فكرية',
    slogan: 'العمل الجمعوي رافعة للعدالة الاجتماعية والمجالية',
    description: 'تنظيم الندوة العلمية السنوية للرابطة بمشاركة باحثين وممثلي المجتمع المدني لمناقشة آليات التضامن المبتكرة.',
    objectives: [
      'تعزيز التعاون بين الفاعلين الجمعويين والأكاديميين',
      'صياغة توصيات عملية موجهة للمؤسسات المنتخبة',
      'إطلاق المبادرة التضامنية الشتوية لعام 2026'
    ],
    date: '2026-10-24',
    time: '16:00',
    location: 'قاعة المحاضرات الكبرى، المركز الثقافي',
    city: 'تطوان',
    organizer: 'المكتب المركزي — الرابطة المغربية للتنمية والتضامن',
    responsiblePerson: 'ذ. عماد المزراوي',
    status: 'In Preparation',
    targetAudience: 'الفاعلون الجمعويون، الباحثون، والمهتمون بالشأن التنموي',
    expectedBeneficiaries: 150,
    actualBeneficiaries: 0,
    readinessScore: 65,
    source: 'User Entered',
    hasPoster: true,
    hasProgram: true,
    hasInvitations: true,
    hasAttendance: false,
    hasReport: false,
    createdBy: 'default_admin',
    createdByName: 'ذ. عماد المزراوي',
    updatedBy: 'ذ. عماد المزراوي'
  },
  {
    title: 'القافلة التضامنية الطبية والاجتماعية بالمناطق القروية',
    type: 'قافلة خيرية',
    slogan: 'دفء وتضامن في أعالي جبال الريف',
    description: 'قافلة طبية واجتماعية شاملة لتوزيع الملابس والأغطية وتقديم فحوصات طبية للمواطنين بالمناطق الجبلية.',
    objectives: [
      'تقديم فحوصات طبية وتوزيع الأدوية مجاناً',
      'توزيع 500 طرد شتوي للأسر المعوزة',
      'تنظيم أنشطة ترفيهية وتربوية لأطفال المدارس الفرعية'
    ],
    date: '2026-11-12',
    time: '08:30',
    location: 'جماعة بني حسان القروية',
    city: 'إقليم تطوان',
    organizer: 'فرع تطوان بشراكة مع جمعية الأطباء المتطوعين',
    responsiblePerson: 'ذ. عماد المزراوي',
    status: 'Planned',
    targetAudience: 'الأسر القروية والفئات الهشة',
    expectedBeneficiaries: 500,
    actualBeneficiaries: 0,
    readinessScore: 45,
    source: 'Approved',
    hasPoster: true,
    hasProgram: false,
    hasInvitations: false,
    hasAttendance: false,
    hasReport: false,
    createdBy: 'default_admin',
    createdByName: 'ذ. عماد المزراوي',
    updatedBy: 'ذ. عماد المزراوي'
  }
];
