export type UserRole =
  | 'SUPER_ADMIN'
  | 'SECRETARY_GENERAL'
  | 'BRANCH_MANAGER'
  | 'EDITOR'
  | 'CONTRIBUTOR'
  | 'VIEWER';

export type ActivityStatus =
  | 'Idea'
  | 'Draft'
  | 'Planned'
  | 'In Preparation'
  | 'Ready'
  | 'Completed'
  | 'Documentation'
  | 'Complete'
  | 'Archived';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  branchId?: string;
  branchName?: string;
  avatarUrl?: string;
  phone?: string;
  title?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationBranding {
  id: string;
  name: string;
  acronym: string;
  slogan: string;
  secretaryGeneral: string;
  email: string;
  website: string;
  phone: string;
  address: string;
  primaryColor: string; // Moroccan Red
  secondaryColor: string; // Royal Green
  accentColor: string; // Gold
  darkColor: string; // Deep Slate
  logoUrl: string;
  logoDarkUrl?: string;
  watermarkUrl: string;
  stampUrl?: string;
  headerTemplate: string;
  footerTemplate: string;
  updatedAt: string;
  updatedBy: string;
}

export interface ActivityParticipant {
  id: string;
  name: string;
  roleInActivity: string; // e.g. "مُسير الندوة" | "متدخل رئيسي" | "مؤطر الورشة" | "منسق القافلة" | "ضيف شرف"
  professionalTitle: string; // e.g. "أستاذ باحث بكلية الحقوق - جامعة عبد المالك السعدي"
  photoUrl?: string; // photo base64 data URL or external URL
  organization?: string;
}

export interface Activity {
  id: string;
  title: string;
  type: 'ندوة فكرية' | 'نشاط تضامني' | 'قافلة خيرية' | 'ورشة تكوينية' | 'جمع عام' | 'مخيم تربوي' | 'أخرى';
  slogan?: string;
  description: string;
  objectives: string[];
  date: string;
  time: string;
  location: string;
  city: string;
  organizer: string;
  responsiblePerson: string;
  status: ActivityStatus;
  targetAudience: string;
  expectedBeneficiaries: number;
  actualBeneficiaries?: number;
  readinessScore: number; // 0 - 100%
  version: number;
  source: 'User Entered' | 'Extracted' | 'Institutional Memory' | 'AI Suggested' | 'Approved';
  participants?: ActivityParticipant[];
  hasPoster?: boolean;
  hasProgram?: boolean;
  hasInvitations?: boolean;
  hasAttendance?: boolean;
  hasReport?: boolean;
  hasCertificates?: boolean;
  hasPhotos?: boolean;
  masterDesign?: MasterDesign;
  derivatives?: DesignDerivative[];
  designVersions?: DesignVersionRecord[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  createdByName?: string;
  updatedBy: string;
  isArchived?: boolean;
}

export type DesignWorkflowState =
  | 'Draft'
  | 'AI Generated'
  | 'Edited'
  | 'Ready for Review'
  | 'Approved'
  | 'Published'
  | 'Archived';

export type DesignAssetKind =
  | 'poster'
  | 'invitation'
  | 'program'
  | 'announcement'
  | 'social_post'
  | 'story'
  | 'whatsapp_status'
  | 'speaker_card'
  | 'organizer_card'
  | 'certificate'
  | 'attendance_card'
  | 'report_cover'
  | 'news_graphic'
  | 'thank_you_card'
  | 'media_template';

export interface VisualIdentityConfig {
  id: string;
  palette: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    mutedText: string;
  };
  typography: {
    titleFont: string;
    bodyFont: string;
    sloganFont: string;
    fontSizeScale: number;
  };
  backgroundPattern: 'zellige_moroccan' | 'atlas_mountains' | 'institutional_arch' | 'tech_nodes' | 'cedar_forest' | 'minimal_gradient';
  decorations: {
    showGoldFrame: boolean;
    showWatermark: boolean;
    logoPosition: 'center_top' | 'right_top' | 'left_top';
    archDecorations: boolean;
    badgeStyle: 'royal' | 'minimal' | 'modern';
  };
  customNotes?: string;
  updatedAt: string;
}

export interface DesignCanvasElement {
  id: string;
  type: 'text' | 'image' | 'shape' | 'logo' | 'qrcode' | 'speakers_grid';
  x: number; // percentage (0 - 100) or pixel
  y: number; // percentage (0 - 100)
  width: number;
  height: number;
  rotation?: number;
  zIndex: number;
  locked?: boolean;
  visible?: boolean;
  // Content & Dynamic Binding
  tokenBinding?: string; // e.g., '{{activity.title}}', '{{activity.date}}', '{{activity.location}}'
  text?: string;
  fontSize?: number;
  fontWeight?: string;
  fontFamily?: string;
  fontStyle?: string;
  color?: string;
  align?: 'right' | 'center' | 'left';
  // Image properties
  imageUrl?: string;
  imageShape?: 'rect' | 'circle' | 'rounded';
  borderWidth?: number;
  borderColor?: string;
  shadow?: string;
  // QR properties
  qrTargetUrl?: string;
}

export interface MasterDesign {
  id: string;
  activityId: string;
  title: string;
  workflowState: DesignWorkflowState;
  visualIdentity: VisualIdentityConfig;
  aspectRatio: 'A4' | '1:1' | '9:16' | '16:9' | '4:5';
  width: number;
  height: number;
  elements: DesignCanvasElement[];
  version: number;
  readinessScore: number;
  isLocked: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  approvedBy?: string;
  approvedAt?: string;
}

export interface DesignDerivative {
  id: string;
  activityId: string;
  masterDesignId: string;
  kind: DesignAssetKind;
  title: string;
  aspectRatio: 'A4' | '1:1' | '9:16' | '16:9' | '4:5';
  workflowState: DesignWorkflowState;
  elements: DesignCanvasElement[];
  thumbnailUrl?: string;
  isCustomized: boolean;
  version: number;
  updatedAt: string;
}

export interface DesignVersionRecord {
  id: string;
  designId: string;
  activityId: string;
  versionNumber: number;
  workflowState: DesignWorkflowState;
  snapshot: MasterDesign;
  changeSummary: string;
  changedBy: string;
  changedAt: string;
  reason?: string;
}

export interface DesignReviewFinding {
  code: string;
  label: string;
  passed: boolean;
  severity: 'error' | 'warning' | 'info';
  message: string;
  autoFixAvailable?: boolean;
}

export interface DesignReviewReport {
  score: number; // 0 - 100
  passed: boolean;
  findings: DesignReviewFinding[];
  auditedAt: string;
}

export interface DesignTemplate {
  id: string;
  name: string;
  category: Activity['type'];
  description: string;
  defaultAspectRatio: 'A4' | '1:1' | '9:16';
  visualIdentity: VisualIdentityConfig;
  defaultElements: DesignCanvasElement[];
  isDefault: boolean;
  previewUrl?: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLogItem {
  id: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'APPROVE' | 'ARCHIVE' | 'LOGIN' | 'BRAND_UPDATE';
  module: 'ACTIVITIES' | 'BRAND_CENTER' | 'DOCUMENTS' | 'MEMBERS' | 'AUTH' | 'SETTINGS';
  recordId: string;
  recordTitle: string;
  performedBy: string;
  performedByEmail: string;
  timestamp: string;
  details: string;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'alert';
  timestamp: string;
  read: boolean;
  link?: string;
}

export interface Branch {
  id: string;
  name: string;
  city: string;
  managerName: string;
  managerEmail: string;
  phone: string;
  address: string;
  status: 'Active' | 'Inactive';
  membersCount?: number;
  activitiesCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Member {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  city?: string;
  branchId?: string;
  branchName?: string;
  role: string;
  status: 'Active' | 'Inactive' | 'Suggested_by_AI' | 'Archived';
  source?: 'User Entered' | 'Extracted' | 'Institutional Memory';
  joinDate?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Partner {
  id: string;
  name: string;
  representative?: string;
  phone?: string;
  email?: string;
  website?: string;
  city?: string;
  partnershipType: string; // مؤسساتي، جمعوي، أكاديمي، قطاع خاص
  logoUrl?: string;
  activitiesCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentItem {
  id: string;
  refNumber: string; // e.g. AMDS/SG/2026/001
  title: string;
  type: 'Correspondence' | 'Report' | 'Announcement' | 'Invitation' | 'Minutes' | 'Statement';
  activityId?: string;
  activityTitle?: string;
  branchId?: string;
  recipient?: string;
  subject?: string;
  content: string;
  status: 'Draft' | 'Pending_Approval' | 'Approved' | 'Sent' | 'Archived';
  fileUrl?: string;
  issuedDate: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  approvedBy?: string;
}

export interface CertificateItem {
  id: string;
  certificateNumber: string; // e.g. AMDS-CERT-2026-001
  recipientName: string;
  activityId?: string;
  activityTitle?: string;
  type: 'مشاركة' | 'تقدير' | 'تدريب' | 'تكريم' | 'تطوع';
  issuedDate: string;
  qrCodeData?: string;
  createdAt: string;
}

export interface InstitutionalMemoryDoc {
  id: string;
  title: string;
  category: 'قانون أساسي' | 'نظام داخلي' | 'محضر جمع عام' | 'مراسلة تاريخية' | 'دليل مساطر';
  year: string;
  content: string;
  fileUrl?: string;
  isOfficial: boolean;
  createdAt: string;
}

export interface StorageAsset {
  id: string;
  name: string;
  path: string;
  size: number;
  contentType: string;
  category: 'branding' | 'activities' | 'branches' | 'members' | 'documents' | 'certificates' | 'reports' | 'institutional_memory';
  url: string;
  createdAt: string;
  uploadedBy: string;
}

