import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  type Unsubscribe
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, recordAuditLog } from './firebase';
import type {
  Branch,
  Member,
  Partner,
  DocumentItem,
  CertificateItem,
  InstitutionalMemoryDoc,
  UserProfile
} from '../types';

// ==========================================
// 1. Branches Collection Service
// ==========================================
export const INITIAL_BRANCHES: Omit<Branch, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'المكتب المركزي — فرع تطوان',
    city: 'تطوان',
    managerName: 'ذ. عماد المزراوي',
    managerEmail: 'amdstetouan@gmail.com',
    phone: '+212 539 00 00 00',
    address: 'شارع الجيش الملكي، مجمع الأعمال، تطوان',
    status: 'Active',
    membersCount: 45,
    activitiesCount: 18
  },
  {
    name: 'فرع طنجة الكبرى',
    city: 'طنجة',
    managerName: 'ذ. محمد العلمي',
    managerEmail: 'tanger@amdstetouan.com',
    phone: '+212 539 94 00 00',
    address: 'شارع محمد الخامس، طنجة',
    status: 'Active',
    membersCount: 30,
    activitiesCount: 8
  },
  {
    name: 'فرع الرباط — العاصمة',
    city: 'الرباط',
    managerName: 'د. يوسف التازي',
    managerEmail: 'rabat@amdstetouan.com',
    phone: '+212 537 70 00 00',
    address: 'حي أكدال، الرباط',
    status: 'Active',
    membersCount: 22,
    activitiesCount: 6
  }
];

export function subscribeToBranches(callback: (branches: Branch[]) => void): Unsubscribe {
  const path = 'branches';
  try {
    const q = query(collection(db, path), orderBy('name', 'asc'));
    return onSnapshot(q, (snapshot) => {
      const branches: Branch[] = [];
      snapshot.forEach(docSnap => {
        branches.push({ ...docSnap.data(), id: docSnap.id } as Branch);
      });
      callback(branches.length > 0 ? branches : INITIAL_BRANCHES.map((b, i) => ({
        ...b,
        id: `branch_${i + 1}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })));
    }, (error) => {
      console.warn('Branches listener fallback to local:', error);
      callback(INITIAL_BRANCHES.map((b, i) => ({
        ...b,
        id: `branch_${i + 1}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })));
    });
  } catch (error) {
    console.warn('Failed to subscribe to branches:', error);
    callback([]);
    return () => {};
  }
}

// ==========================================
// 2. Members Collection Service
// ==========================================
export const INITIAL_MEMBERS: Omit<Member, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'ذ. عماد المزراوي',
    email: 'rmdstetouan@gmail.com',
    phone: '+212 600 00 00 01',
    city: 'تطوان',
    branchName: 'المكتب المركزي — تطوان',
    role: 'الكاتب العام',
    status: 'Active',
    source: 'Institutional Memory',
    joinDate: '2020-01-15'
  },
  {
    name: 'ذ. رشيد بنعبد الله',
    email: 'rachid@amdstetouan.com',
    phone: '+212 600 00 00 02',
    city: 'تطوان',
    branchName: 'المكتب المركزي — تطوان',
    role: 'نائب الكاتب العام',
    status: 'Active',
    source: 'Institutional Memory',
    joinDate: '2021-03-10'
  },
  {
    name: 'د. يوسف التازي',
    email: 'rabat@amdstetouan.com',
    phone: '+212 600 00 00 03',
    city: 'الرباط',
    branchName: 'فرع الرباط',
    role: 'منسق فرع الرباط',
    status: 'Active',
    source: 'User Entered',
    joinDate: '2022-09-01'
  },
  {
    name: 'سارة العمراني (مستخرجة من وثيقة الحضور)',
    email: 'sara.omrani@example.com',
    city: 'طنجة',
    branchName: 'فرع طنجة',
    role: 'مشاركة مقترحة',
    status: 'Suggested_by_AI',
    source: 'Extracted'
  }
];

export function subscribeToMembers(callback: (members: Member[]) => void): Unsubscribe {
  const path = 'members';
  try {
    const q = query(collection(db, path), orderBy('name', 'asc'));
    return onSnapshot(q, (snapshot) => {
      const members: Member[] = [];
      snapshot.forEach(docSnap => {
        members.push({ ...docSnap.data(), id: docSnap.id } as Member);
      });
      callback(members.length > 0 ? members : INITIAL_MEMBERS.map((m, i) => ({
        ...m,
        id: `mem_${i + 1}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })));
    }, (error) => {
      console.warn('Members listener fallback to local:', error);
      callback(INITIAL_MEMBERS.map((m, i) => ({
        ...m,
        id: `mem_${i + 1}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })));
    });
  } catch (error) {
    console.warn('Failed to subscribe to members:', error);
    callback([]);
    return () => {};
  }
}

// ==========================================
// 3. Partners Collection Service
// ==========================================
export const INITIAL_PARTNERS: Omit<Partner, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'جماعة تطوان الحضرية',
    representative: 'رئيس المجلس الجماعي',
    city: 'تطوان',
    partnershipType: 'مؤسساتي عمومي',
    website: 'https://tetouan.ma',
    activitiesCount: 6
  },
  {
    name: 'جامعة عبد المالك السعدي',
    representative: 'عميد كلية الآداب والعلوم الإنسانية',
    city: 'تطوان / طنجة',
    partnershipType: 'أكاديمي وبحث علمي',
    website: 'https://uae.ac.ma',
    activitiesCount: 4
  },
  {
    name: 'المرصد الوطني لحقوق المجتمع المدني',
    representative: 'المنسق الجهوي',
    city: 'طنجة',
    partnershipType: 'جمعوي وحقوقي',
    activitiesCount: 3
  }
];

export function subscribeToPartners(callback: (partners: Partner[]) => void): Unsubscribe {
  const path = 'partners';
  try {
    const q = query(collection(db, path), orderBy('name', 'asc'));
    return onSnapshot(q, (snapshot) => {
      const partners: Partner[] = [];
      snapshot.forEach(docSnap => {
        partners.push({ ...docSnap.data(), id: docSnap.id } as Partner);
      });
      callback(partners.length > 0 ? partners : INITIAL_PARTNERS.map((p, i) => ({
        ...p,
        id: `partner_${i + 1}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })));
    }, (error) => {
      console.warn('Partners listener fallback to local:', error);
      callback(INITIAL_PARTNERS.map((p, i) => ({
        ...p,
        id: `partner_${i + 1}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })));
    });
  } catch (error) {
    console.warn('Failed to subscribe to partners:', error);
    callback([]);
    return () => {};
  }
}

// ==========================================
// 4. Documents & Sequential Numbering Service
// ==========================================
export function generateReferenceNumber(type: 'SG' | 'REP' | 'CERT' | 'ACT' | 'LET', count: number): string {
  const year = new Date().getFullYear();
  const seq = String(count).padStart(3, '0');
  return `AMDS/${type}/${year}/${seq}`;
}

export const INITIAL_DOCUMENTS: Omit<DocumentItem, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    refNumber: 'AMDS/SG/2026/001',
    title: 'طلب حجز قاعة المحاضرات الكبرى بالمركز الثقافي بتطوان',
    type: 'Correspondence',
    recipient: 'السيد مدير المركز الثقافي لتطوان',
    subject: 'طلب حجز القاعة الكبرى لتنظيم الندوة السنوية',
    content: 'يشرفنا بصفتنا الكاتب العام للرابطة المغربية للتنمية والتضامن أن نلتمس من جنابكم التفضل بالموافقة على حجز القاعة الكبرى...',
    status: 'Approved',
    issuedDate: '2026-10-02',
    createdBy: 'ذ. عماد المزراوي',
    approvedBy: 'ذ. عماد المزراوي'
  },
  {
    refNumber: 'AMDS/REP/2026/001',
    title: 'التقرير الأدبي لأنشطة الثلث الثالث من السنة',
    type: 'Report',
    subject: 'حصيلة البرامج التضامنية والتنموية للرابطة',
    content: 'يستعرض هذا التقرير التفصيلي مجموع الفعاليات المنجزة ومخرجات المبادرات الميدانية في فروع تطوان وطنجة...',
    status: 'Pending_Approval',
    issuedDate: '2026-10-03',
    createdBy: 'ذ. عماد المزراوي'
  }
];

export function subscribeToDocuments(callback: (docs: DocumentItem[]) => void): Unsubscribe {
  const path = 'documents';
  try {
    const q = query(collection(db, path), orderBy('issuedDate', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const docs: DocumentItem[] = [];
      snapshot.forEach(docSnap => {
        docs.push({ ...docSnap.data(), id: docSnap.id } as DocumentItem);
      });
      callback(docs.length > 0 ? docs : INITIAL_DOCUMENTS.map((d, i) => ({
        ...d,
        id: `doc_${i + 1}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })));
    }, (error) => {
      console.warn('Documents listener fallback to local:', error);
      callback(INITIAL_DOCUMENTS.map((d, i) => ({
        ...d,
        id: `doc_${i + 1}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })));
    });
  } catch (error) {
    console.warn('Failed to subscribe to documents:', error);
    callback([]);
    return () => {};
  }
}

// ==========================================
// 5. Certificates Collection Service
// ==========================================
export const INITIAL_CERTIFICATES: Omit<CertificateItem, 'id' | 'createdAt'>[] = [
  {
    certificateNumber: 'AMDS-CERT-2026-001',
    recipientName: 'ذ. أحمد المرابط',
    activityTitle: 'الندوة الوطنية حول التنمية المستدامة والتضامن الاجتماعي',
    type: 'تقدير',
    issuedDate: '2026-10-04',
    qrCodeData: 'https://amdstetouan.com/verify?cert=AMDS-CERT-2026-001'
  }
];

export function subscribeToCertificates(callback: (certs: CertificateItem[]) => void): Unsubscribe {
  const path = 'certificates';
  try {
    const q = query(collection(db, path), orderBy('issuedDate', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const certs: CertificateItem[] = [];
      snapshot.forEach(docSnap => {
        certs.push({ ...docSnap.data(), id: docSnap.id } as CertificateItem);
      });
      callback(certs.length > 0 ? certs : INITIAL_CERTIFICATES.map((c, i) => ({
        ...c,
        id: `cert_${i + 1}`,
        createdAt: new Date().toISOString()
      })));
    }, (error) => {
      console.warn('Certificates listener fallback to local:', error);
      callback(INITIAL_CERTIFICATES.map((c, i) => ({
        ...c,
        id: `cert_${i + 1}`,
        createdAt: new Date().toISOString()
      })));
    });
  } catch (error) {
    console.warn('Failed to subscribe to certificates:', error);
    callback([]);
    return () => {};
  }
}

// ==========================================
// 6. Institutional Memory Service
// ==========================================
export const INITIAL_MEMORY: Omit<InstitutionalMemoryDoc, 'id' | 'createdAt'>[] = [
  {
    title: 'القانون الأساسي للرابطة المغربية للتنمية والتضامن (AMDS)',
    category: 'قانون أساسي',
    year: '2020',
    content: 'الباب الأول: التأسيس والتسمية والمقر والأهداف. تأسست الرابطة المغربية للتنمية والتضامن كجمعية وطنية مستقلة تعنى بتشجيع التضامن الاجتماعي وتنمية المجتمع المحلي...',
    isOfficial: true
  },
  {
    title: 'النظام الداخلي وميثاق العمل المؤسساتي',
    category: 'نظام داخلي',
    year: '2021',
    content: 'المادة 12: مهام الكاتب العام: يسهر الكاتب العام على ضبط مراسلات الجمعية، تحرير المحاضر والتقارير، حفظ الأرشيف وسجلات العضوية، وتوثيق الأنشطة والقرارات...',
    isOfficial: true
  }
];

export function subscribeToInstitutionalMemory(callback: (items: InstitutionalMemoryDoc[]) => void): Unsubscribe {
  const path = 'institutional_memory';
  try {
    const q = query(collection(db, path), orderBy('year', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const items: InstitutionalMemoryDoc[] = [];
      snapshot.forEach(docSnap => {
        items.push({ ...docSnap.data(), id: docSnap.id } as InstitutionalMemoryDoc);
      });
      callback(items.length > 0 ? items : INITIAL_MEMORY.map((m, i) => ({
        ...m,
        id: `mem_${i + 1}`,
        createdAt: new Date().toISOString()
      })));
    }, (error) => {
      console.warn('Institutional memory listener fallback:', error);
      callback(INITIAL_MEMORY.map((m, i) => ({
        ...m,
        id: `mem_${i + 1}`,
        createdAt: new Date().toISOString()
      })));
    });
  } catch (error) {
    console.warn('Failed to subscribe to institutional memory:', error);
    callback([]);
    return () => {};
  }
}
