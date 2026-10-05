import JSZip from 'jszip';
import type {
  Activity,
  ActivityParticipant,
  DesignAssetKind,
  DesignCanvasElement,
  DesignDerivative,
  DesignReviewFinding,
  DesignReviewReport,
  DesignTemplate,
  DesignWorkflowState,
  MasterDesign,
  OrganizationBranding,
  VisualIdentityConfig
} from '../../types';

// ============================================================================
// 1. Dynamic Token Engine (Separation of Data from Design)
// ============================================================================

export const resolveTokens = (
  text: string,
  activity: Activity,
  branding: OrganizationBranding
): string => {
  if (!text) return '';

  const speakersList = (activity.participants || [])
    .map((p) => `${p.name} (${p.roleInActivity})`)
    .join(' — ');

  return text
    .replace(/\{\{activity\.title\}\}/g, activity.title || 'عنوان النشاط غير محدد')
    .replace(/\{\{activity\.slogan\}\}/g, activity.slogan || branding.slogan || '')
    .replace(/\{\{activity\.type\}\}/g, activity.type || 'نشاط جمعوي')
    .replace(/\{\{activity\.date\}\}/g, activity.date || '2026-10-24')
    .replace(/\{\{activity\.time\}\}/g, activity.time || '16:00')
    .replace(/\{\{activity\.location\}\}/g, activity.location || 'المركز الثقافي')
    .replace(/\{\{activity\.city\}\}/g, activity.city || 'تطوان')
    .replace(/\{\{activity\.organizer\}\}/g, activity.organizer || branding.name)
    .replace(/\{\{activity\.responsiblePerson\}\}/g, activity.responsiblePerson || 'الكاتب العام')
    .replace(/\{\{activity\.speakers\}\}/g, speakersList || 'نخبة من الأساتذة والخبراء')
    .replace(/\{\{activity\.id\}\}/g, activity.id || 'AMDS-ACT-001')
    .replace(/\{\{branding\.name\}\}/g, branding.name)
    .replace(/\{\{branding\.acronym\}\}/g, branding.acronym)
    .replace(/\{\{branding\.website\}\}/g, branding.website)
    .replace(/\{\{branding\.secretaryGeneral\}\}/g, branding.secretaryGeneral || 'الكاتب العام');
};

// ============================================================================
// 2. Visual Identity Factory
// ============================================================================

export const generateVisualIdentityForActivity = (
  activity: Activity,
  branding: OrganizationBranding
): VisualIdentityConfig => {
  const actType = activity.type;

  if (actType === 'قافلة خيرية' || actType === 'نشاط تضامني') {
    return {
      id: `vi_${activity.id || Date.now()}`,
      palette: {
        primary: '#C1272D', // Moroccan Flag Red
        secondary: '#7F1D1D',
        accent: '#F59E0B', // Warm Terracotta Gold
        background: '#451A03',
        surface: 'rgba(15, 23, 42, 0.94)',
        text: '#FFFFFF',
        mutedText: '#FDE68A'
      },
      typography: {
        titleFont: 'Cairo, sans-serif',
        bodyFont: 'Cairo, sans-serif',
        sloganFont: 'Amiri, serif',
        fontSizeScale: 1
      },
      backgroundPattern: 'atlas_mountains',
      decorations: {
        showGoldFrame: true,
        showWatermark: true,
        logoPosition: 'center_top',
        archDecorations: false,
        badgeStyle: 'royal'
      },
      customNotes: 'هوية التضامن المجتمعي وجبال الأطلس والريف المشرقة بشمس العطاء.',
      updatedAt: new Date().toISOString()
    };
  }

  if (actType === 'جمع عام') {
    return {
      id: `vi_${activity.id || Date.now()}`,
      palette: {
        primary: '#0F172A', // Dignified Midnight Slate
        secondary: '#1E293B',
        accent: '#D4AF37', // Gold
        background: '#091326',
        surface: 'rgba(15, 23, 42, 0.96)',
        text: '#FFFFFF',
        mutedText: '#94A3B8'
      },
      typography: {
        titleFont: 'Cairo, sans-serif',
        bodyFont: 'Cairo, sans-serif',
        sloganFont: 'Amiri, serif',
        fontSizeScale: 1
      },
      backgroundPattern: 'institutional_arch',
      decorations: {
        showGoldFrame: true,
        showWatermark: true,
        logoPosition: 'center_top',
        archDecorations: true,
        badgeStyle: 'royal'
      },
      customNotes: 'هوية مؤسساتية وقورة للجمع العام والمجلس الإداري مع الأختام المعتمدة.',
      updatedAt: new Date().toISOString()
    };
  }

  if (actType === 'ورشة تكوينية') {
    return {
      id: `vi_${activity.id || Date.now()}`,
      palette: {
        primary: '#064E3B', // Tech Emerald
        secondary: '#0F172A',
        accent: '#38BDF8', // Knowledge Cyan
        background: '#042F2E',
        surface: 'rgba(15, 23, 42, 0.92)',
        text: '#FFFFFF',
        mutedText: '#7DD3FC'
      },
      typography: {
        titleFont: 'Cairo, sans-serif',
        bodyFont: 'Cairo, sans-serif',
        sloganFont: 'Amiri, serif',
        fontSizeScale: 1
      },
      backgroundPattern: 'tech_nodes',
      decorations: {
        showGoldFrame: true,
        showWatermark: false,
        logoPosition: 'center_top',
        archDecorations: false,
        badgeStyle: 'modern'
      },
      customNotes: 'هوية الابتكار والتكوين والشباب مع شبكات المعرفة الرقمية.',
      updatedAt: new Date().toISOString()
    };
  }

  if (actType === 'مخيم تربوي') {
    return {
      id: `vi_${activity.id || Date.now()}`,
      palette: {
        primary: '#14532D', // Cedar Forest Green
        secondary: '#1C1917',
        accent: '#FBBF24', // Camp Gold
        background: '#052E16',
        surface: 'rgba(28, 25, 23, 0.94)',
        text: '#FFFFFF',
        mutedText: '#FEF08A'
      },
      typography: {
        titleFont: 'Cairo, sans-serif',
        bodyFont: 'Cairo, sans-serif',
        sloganFont: 'Amiri, serif',
        fontSizeScale: 1
      },
      backgroundPattern: 'cedar_forest',
      decorations: {
        showGoldFrame: true,
        showWatermark: true,
        logoPosition: 'center_top',
        archDecorations: false,
        badgeStyle: 'modern'
      },
      customNotes: 'هوية الأنشطة الميدانية والبيئية وغابات الأرز المغربية.',
      updatedAt: new Date().toISOString()
    };
  }

  // Default: ندوة فكرية / Royal Moroccan
  return {
    id: `vi_${activity.id || Date.now()}`,
    palette: {
      primary: branding.secondaryColor || '#006233', // Royal Moroccan Green
      secondary: '#022C22',
      accent: branding.accentColor || '#D4AF37', // Gold
      background: '#0F172A',
      surface: 'rgba(15, 23, 42, 0.95)',
      text: '#FFFFFF',
      mutedText: '#FDE68A'
    },
    typography: {
      titleFont: 'Cairo, sans-serif',
      bodyFont: 'Cairo, sans-serif',
      sloganFont: 'Amiri, serif',
      fontSizeScale: 1
    },
    backgroundPattern: 'zellige_moroccan',
    decorations: {
      showGoldFrame: true,
      showWatermark: true,
      logoPosition: 'center_top',
      archDecorations: true,
      badgeStyle: 'royal'
    },
    customNotes: 'الهوية الملكية المغربية الرسمية بزخارف الزليج والأقواس الأندلسية والخط الكلاسيكي.',
    updatedAt: new Date().toISOString()
  };
};

// ============================================================================
// 3. Master Design Creator
// ============================================================================

export const createMasterDesignFromActivity = (
  activity: Activity,
  branding: OrganizationBranding,
  customIdentity?: VisualIdentityConfig
): MasterDesign => {
  const visualIdentity = customIdentity || generateVisualIdentityForActivity(activity, branding);

  const elements: DesignCanvasElement[] = [
    // 1. Kingdom Ribbon
    {
      id: 'el_kingdom_banner',
      type: 'text',
      x: 50,
      y: 4,
      width: 80,
      height: 4,
      zIndex: 10,
      text: '—  المملكة المغربية  —',
      fontSize: 13,
      fontWeight: 'bold',
      fontFamily: 'Cairo, sans-serif',
      color: '#FFFFFF',
      align: 'center'
    },

    // 2. Centered Logo Badge (With White Background & Golden Glow)
    {
      id: 'el_logo_centered',
      type: 'logo',
      x: 50,
      y: 9.5,
      width: 16,
      height: 12,
      zIndex: 20,
      imageUrl: branding.logoUrl,
      imageShape: 'rounded',
      borderWidth: 2,
      borderColor: visualIdentity.palette.accent,
      shadow: '0 0 25px rgba(212,175,55,0.45)'
    },

    // 3. Institution Name
    {
      id: 'el_org_name',
      type: 'text',
      x: 50,
      y: 22.5,
      width: 90,
      height: 4.5,
      zIndex: 10,
      tokenBinding: '{{branding.name}}',
      text: branding.name,
      fontSize: 16,
      fontWeight: 'bold',
      fontFamily: 'Cairo, sans-serif',
      color: visualIdentity.palette.accent,
      align: 'center'
    },

    // 4. Secretary General Subtitle
    {
      id: 'el_sg_subtitle',
      type: 'text',
      x: 50,
      y: 26.5,
      width: 80,
      height: 3,
      zIndex: 10,
      tokenBinding: '{{branding.acronym}} — الكتابة العامة',
      text: `${branding.acronym} — الكتابة العامة`,
      fontSize: 11,
      fontWeight: 'normal',
      fontFamily: 'Cairo, sans-serif',
      color: '#CBD5E1',
      align: 'center'
    },

    // 5. Official Slogan
    {
      id: 'el_slogan',
      type: 'text',
      x: 50,
      y: 29.8,
      width: 90,
      height: 4,
      zIndex: 10,
      tokenBinding: '«{{activity.slogan}}»',
      text: `«${activity.slogan || branding.slogan}»`,
      fontSize: 12.5,
      fontStyle: 'italic',
      fontFamily: 'Amiri, serif',
      color: visualIdentity.palette.mutedText,
      align: 'center'
    },

    // 6. Activity Type Badge
    {
      id: 'el_type_badge',
      type: 'shape',
      x: 50,
      y: 35.5,
      width: 50,
      height: 4.5,
      zIndex: 12,
      tokenBinding: '{{activity.organizer}} تنظم: {{activity.type}}',
      text: `${activity.organizer || branding.name} تنظم: ${activity.type}`,
      fontSize: 11.5,
      fontWeight: 'bold',
      fontFamily: 'Cairo, sans-serif',
      color: '#FFFFFF',
      align: 'center',
      borderWidth: 1.5,
      borderColor: visualIdentity.palette.accent
    },

    // 7. Activity Title (Master Headline)
    {
      id: 'el_title',
      type: 'text',
      x: 50,
      y: 43.5,
      width: 90,
      height: 12,
      zIndex: 15,
      tokenBinding: '{{activity.title}}',
      text: activity.title,
      fontSize: 22,
      fontWeight: 'bold',
      fontFamily: 'Cairo, sans-serif',
      color: '#FFFFFF',
      align: 'center'
    },

    // 8. Speakers & Participants Showcase Grid
    {
      id: 'el_speakers_grid',
      type: 'speakers_grid',
      x: 50,
      y: 60,
      width: 92,
      height: 18,
      zIndex: 15,
      text: 'المتدخلون والمشاركون في أشغال النشاط'
    },

    // 9. Details Box (Date, Time, Venue, City)
    {
      id: 'el_practical_box',
      type: 'shape',
      x: 50,
      y: 82,
      width: 92,
      height: 12,
      zIndex: 18,
      borderWidth: 2,
      borderColor: visualIdentity.palette.accent
    },

    // 10. Dynamic QR Code
    {
      id: 'el_qrcode',
      type: 'qrcode',
      x: 12,
      y: 82,
      width: 10,
      height: 10,
      zIndex: 25,
      qrTargetUrl: branding.website || 'https://amds.ma/activity/'
    },

    // 11. Footer Credits
    {
      id: 'el_footer_strip',
      type: 'text',
      x: 50,
      y: 95.5,
      width: 92,
      height: 3,
      zIndex: 10,
      tokenBinding: '{{branding.website}} | الدعوة عامة | AMDS-ACT-{{activity.id}}',
      text: `${branding.website} | الدعوة عامة | AMDS-ACT-${activity.id?.slice(0, 6) || '2026'}`,
      fontSize: 9.5,
      fontFamily: 'Cairo, sans-serif',
      color: '#94A3B8',
      align: 'center'
    }
  ];

  return {
    id: `master_${activity.id || Date.now()}`,
    activityId: activity.id,
    title: `التصميم الرئيسي: ${activity.title}`,
    workflowState: 'AI Generated',
    visualIdentity,
    aspectRatio: 'A4',
    width: 1240,
    height: 1754,
    elements,
    version: 1,
    readinessScore: 88,
    isLocked: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: activity.createdBy || 'sec_gen',
    updatedBy: activity.updatedBy || 'sec_gen'
  };
};

// ============================================================================
// 4. Derivatives Engine (All Assets Derived from Same Master Design)
// ============================================================================

export const deriveAssetElements = (
  masterDesign: MasterDesign,
  kind: DesignAssetKind,
  ratio: 'A4' | '1:1' | '9:16' | '16:9' | '4:5',
  activity: Activity,
  branding: OrganizationBranding
): DesignCanvasElement[] => {
  const accent = masterDesign.visualIdentity.palette.accent;
  const mutedText = masterDesign.visualIdentity.palette.mutedText;
  const firstSpeaker = (activity.participants && activity.participants[0]) || {
    name: 'المشارك المعتمد',
    roleInActivity: 'متدخل رئيسي',
    professionalTitle: 'أستاذ باحث وفاعل جمعوي',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
  };

  // 1. Poster: Full Master Poster layout
  if (kind === 'poster') {
    return masterDesign.elements.map((el) => ({ ...el, id: `${el.id}_poster` }));
  }

  // 2. Official Invitation Card (A4 / A5 Letter)
  if (kind === 'invitation') {
    return [
      {
        id: 'inv_kingdom',
        type: 'text',
        x: 50,
        y: 5,
        width: 80,
        height: 3,
        zIndex: 10,
        text: '—  المملكة المغربية  —',
        fontSize: 12,
        fontWeight: 'bold',
        fontFamily: 'Cairo, sans-serif',
        color: '#FFFFFF',
        align: 'center'
      },
      {
        id: 'inv_logo',
        type: 'logo',
        x: 50,
        y: 11,
        width: 14,
        height: 10,
        zIndex: 20,
        imageUrl: branding.logoUrl,
        imageShape: 'rounded',
        borderWidth: 2,
        borderColor: accent,
        shadow: '0 0 20px rgba(212,175,55,0.4)'
      },
      {
        id: 'inv_org',
        type: 'text',
        x: 50,
        y: 22,
        width: 90,
        height: 4,
        zIndex: 10,
        tokenBinding: '{{branding.name}}',
        text: branding.name,
        fontSize: 15,
        fontWeight: 'bold',
        fontFamily: 'Cairo, sans-serif',
        color: accent,
        align: 'center'
      },
      {
        id: 'inv_calligraphy_title',
        type: 'text',
        x: 50,
        y: 28,
        width: 60,
        height: 5,
        zIndex: 15,
        text: '« دَعْــــوَةٌ رَسْـمِـيَّـــةٌ »',
        fontSize: 20,
        fontWeight: 'bold',
        fontFamily: 'Amiri, serif',
        color: '#FFFFFF',
        align: 'center'
      },
      {
        id: 'inv_intro',
        type: 'text',
        x: 50,
        y: 35,
        width: 86,
        height: 6,
        zIndex: 10,
        tokenBinding: 'يتشرف المكتب المركزي لـ {{branding.name}} بدعوة سيادتكم الكريمة لحضور والمشاركة في فعاليات {{activity.type}}:',
        text: `يتشرف المكتب المركزي لـ ${branding.name} بدعوة سيادتكم الكريمة لحضور والمشاركة في فعاليات ${activity.type}:`,
        fontSize: 12.5,
        fontStyle: 'italic',
        fontFamily: 'Cairo, sans-serif',
        color: '#E2E8F0',
        align: 'center'
      },
      {
        id: 'inv_title',
        type: 'text',
        x: 50,
        y: 43,
        width: 90,
        height: 9,
        zIndex: 15,
        tokenBinding: '{{activity.title}}',
        text: activity.title,
        fontSize: 21,
        fontWeight: 'bold',
        fontFamily: 'Cairo, sans-serif',
        color: '#FFFFFF',
        align: 'center'
      },
      {
        id: 'inv_slogan',
        type: 'text',
        x: 50,
        y: 52,
        width: 85,
        height: 3.5,
        zIndex: 10,
        tokenBinding: '«{{activity.slogan}}»',
        text: `«${activity.slogan || branding.slogan}»`,
        fontSize: 12,
        fontStyle: 'italic',
        fontFamily: 'Amiri, serif',
        color: mutedText,
        align: 'center'
      },
      {
        id: 'inv_speakers',
        type: 'text',
        x: 50,
        y: 58,
        width: 88,
        height: 6,
        zIndex: 12,
        tokenBinding: 'بمشاركة السادة الأساتذة والخبراء: {{activity.speakers}}',
        text: `بمشاركة السادة الأساتذة والخبراء: ${(activity.participants || []).map((p) => p.name).join('، ')}`,
        fontSize: 11.5,
        fontWeight: 'normal',
        fontFamily: 'Cairo, sans-serif',
        color: '#CBD5E1',
        align: 'center'
      },
      {
        id: 'inv_details_box',
        type: 'shape',
        x: 50,
        y: 71,
        width: 90,
        height: 13,
        zIndex: 15,
        borderWidth: 2,
        borderColor: accent
      },
      {
        id: 'inv_signature',
        type: 'text',
        x: 50,
        y: 86,
        width: 80,
        height: 4,
        zIndex: 12,
        tokenBinding: 'عن المكتب المركزي — الكاتب العام للرابطة: {{activity.responsiblePerson}}',
        text: `عن المكتب المركزي — الكاتب العام للرابطة: ${activity.responsiblePerson || branding.secretaryGeneral}`,
        fontSize: 12,
        fontWeight: 'bold',
        fontFamily: 'Cairo, sans-serif',
        color: accent,
        align: 'center'
      },
      {
        id: 'inv_footer',
        type: 'text',
        x: 50,
        y: 94,
        width: 90,
        height: 3,
        zIndex: 10,
        text: '«حضوركم تشريف لنا ودعم للعمل المدني والتنموي بالمملكة المغربية»',
        fontSize: 10,
        fontFamily: 'Amiri, serif',
        color: '#94A3B8',
        align: 'center'
      }
    ];
  }

  // 3. Social Media Square Post (1:1 Instagram / Facebook)
  if (kind === 'social_post') {
    return [
      {
        id: 'soc_logo',
        type: 'logo',
        x: 18,
        y: 10,
        width: 14,
        height: 12,
        zIndex: 20,
        imageUrl: branding.logoUrl,
        imageShape: 'rounded',
        borderWidth: 2,
        borderColor: accent,
        shadow: '0 0 15px rgba(212,175,55,0.4)'
      },
      {
        id: 'soc_header_badge',
        type: 'text',
        x: 65,
        y: 10,
        width: 60,
        height: 4,
        zIndex: 10,
        tokenBinding: '{{branding.acronym}} | {{activity.type}}',
        text: `${branding.acronym} | ${activity.type}`,
        fontSize: 13,
        fontWeight: 'bold',
        fontFamily: 'Cairo, sans-serif',
        color: accent,
        align: 'right'
      },
      {
        id: 'soc_title',
        type: 'text',
        x: 50,
        y: 28,
        width: 92,
        height: 16,
        zIndex: 15,
        tokenBinding: '{{activity.title}}',
        text: activity.title,
        fontSize: 22,
        fontWeight: 'bold',
        fontFamily: 'Cairo, sans-serif',
        color: '#FFFFFF',
        align: 'center'
      },
      {
        id: 'soc_slogan',
        type: 'text',
        x: 50,
        y: 46,
        width: 90,
        height: 4,
        zIndex: 10,
        tokenBinding: '«{{activity.slogan}}»',
        text: `«${activity.slogan || branding.slogan}»`,
        fontSize: 13,
        fontStyle: 'italic',
        fontFamily: 'Amiri, serif',
        color: mutedText,
        align: 'center'
      },
      {
        id: 'soc_speakers',
        type: 'speakers_grid',
        x: 50,
        y: 62,
        width: 92,
        height: 18,
        zIndex: 15,
        text: 'أبرز المتدخلين'
      },
      {
        id: 'soc_details_pill',
        type: 'shape',
        x: 50,
        y: 84,
        width: 92,
        height: 9,
        zIndex: 18,
        borderWidth: 2,
        borderColor: accent
      },
      {
        id: 'soc_footer',
        type: 'text',
        x: 50,
        y: 95,
        width: 90,
        height: 3,
        zIndex: 10,
        tokenBinding: '{{branding.website}} | التسجيل مفتوح',
        text: `${branding.website} | التسجيل مفتوح`,
        fontSize: 10.5,
        fontFamily: 'Cairo, sans-serif',
        color: '#CBD5E1',
        align: 'center'
      }
    ];
  }

  // 4. Smartphone Story & WhatsApp Status (9:16 Vertical)
  if (kind === 'story' || kind === 'whatsapp_status') {
    return [
      {
        id: 'story_kingdom',
        type: 'text',
        x: 50,
        y: 5,
        width: 80,
        height: 3,
        zIndex: 10,
        text: 'المملكة المغربية',
        fontSize: 11,
        fontWeight: 'bold',
        fontFamily: 'Cairo, sans-serif',
        color: '#CBD5E1',
        align: 'center'
      },
      {
        id: 'story_logo',
        type: 'logo',
        x: 50,
        y: 11,
        width: 18,
        height: 10,
        zIndex: 20,
        imageUrl: branding.logoUrl,
        imageShape: 'rounded',
        borderWidth: 2,
        borderColor: accent,
        shadow: '0 0 25px rgba(212,175,55,0.5)'
      },
      {
        id: 'story_org',
        type: 'text',
        x: 50,
        y: 20,
        width: 90,
        height: 4,
        zIndex: 10,
        tokenBinding: '{{branding.name}}',
        text: branding.name,
        fontSize: 14,
        fontWeight: 'bold',
        fontFamily: 'Cairo, sans-serif',
        color: accent,
        align: 'center'
      },
      {
        id: 'story_type_badge',
        type: 'shape',
        x: 50,
        y: 26,
        width: 60,
        height: 3.5,
        zIndex: 12,
        tokenBinding: '{{activity.type}}',
        text: activity.type,
        fontSize: 12,
        fontWeight: 'bold',
        fontFamily: 'Cairo, sans-serif',
        color: '#FFFFFF',
        align: 'center',
        borderWidth: 1.5,
        borderColor: accent
      },
      {
        id: 'story_title',
        type: 'text',
        x: 50,
        y: 35,
        width: 90,
        height: 14,
        zIndex: 15,
        tokenBinding: '{{activity.title}}',
        text: activity.title,
        fontSize: 23,
        fontWeight: 'bold',
        fontFamily: 'Cairo, sans-serif',
        color: '#FFFFFF',
        align: 'center'
      },
      {
        id: 'story_slogan',
        type: 'text',
        x: 50,
        y: 48,
        width: 88,
        height: 4,
        zIndex: 10,
        tokenBinding: '«{{activity.slogan}}»',
        text: `«${activity.slogan || branding.slogan}»`,
        fontSize: 12.5,
        fontStyle: 'italic',
        fontFamily: 'Amiri, serif',
        color: mutedText,
        align: 'center'
      },
      {
        id: 'story_speakers',
        type: 'speakers_grid',
        x: 50,
        y: 60,
        width: 92,
        height: 18,
        zIndex: 15,
        text: 'المتدخلون'
      },
      {
        id: 'story_details_box',
        type: 'shape',
        x: 50,
        y: 79,
        width: 90,
        height: 11,
        zIndex: 18,
        borderWidth: 2,
        borderColor: accent
      },
      {
        id: 'story_cta',
        type: 'text',
        x: 50,
        y: 92,
        width: 90,
        height: 4,
        zIndex: 15,
        text: '📱 اسحب لأعلى أو امسح الرمز لتأكيد الحضور',
        fontSize: 11,
        fontWeight: 'bold',
        fontFamily: 'Cairo, sans-serif',
        color: '#FDE68A',
        align: 'center'
      }
    ];
  }

  // 5. Official Certificate of Appreciation (A4)
  if (kind === 'certificate') {
    return [
      {
        id: 'cert_kingdom',
        type: 'text',
        x: 50,
        y: 6,
        width: 80,
        height: 3,
        zIndex: 10,
        text: '—  المملكة المغربية  —',
        fontSize: 13,
        fontWeight: 'bold',
        fontFamily: 'Cairo, sans-serif',
        color: '#FFFFFF',
        align: 'center'
      },
      {
        id: 'cert_logo',
        type: 'logo',
        x: 50,
        y: 12,
        width: 14,
        height: 10,
        zIndex: 20,
        imageUrl: branding.logoUrl,
        imageShape: 'rounded',
        borderWidth: 2,
        borderColor: accent,
        shadow: '0 0 25px rgba(212,175,55,0.45)'
      },
      {
        id: 'cert_org',
        type: 'text',
        x: 50,
        y: 22,
        width: 90,
        height: 4,
        zIndex: 10,
        tokenBinding: '{{branding.name}}',
        text: branding.name,
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: 'Cairo, sans-serif',
        color: accent,
        align: 'center'
      },
      {
        id: 'cert_main_title',
        type: 'text',
        x: 50,
        y: 29,
        width: 80,
        height: 6,
        zIndex: 15,
        text: 'شَـــهَادَةُ شُـكْـــرٍ وَتَـقْـــدِيـرٍ وَمُـشَـــارَكَـةٍ',
        fontSize: 22,
        fontWeight: 'bold',
        fontFamily: 'Amiri, serif',
        color: '#FFFFFF',
        align: 'center'
      },
      {
        id: 'cert_body_1',
        type: 'text',
        x: 50,
        y: 37,
        width: 85,
        height: 3.5,
        zIndex: 10,
        tokenBinding: 'يشهد المكتب المركزي لـ {{branding.name}} بأن السيد(ة):',
        text: `يشهد المكتب المركزي لـ ${branding.name} بأن السيد(ة):`,
        fontSize: 12.5,
        fontFamily: 'Cairo, sans-serif',
        color: '#CBD5E1',
        align: 'center'
      },
      {
        id: 'cert_recipient',
        type: 'text',
        x: 50,
        y: 44,
        width: 80,
        height: 5,
        zIndex: 15,
        tokenBinding: '{{participant.name}}',
        text: firstSpeaker.name,
        fontSize: 23,
        fontWeight: 'bold',
        fontFamily: 'Cairo, sans-serif',
        color: accent,
        align: 'center'
      },
      {
        id: 'cert_role',
        type: 'text',
        x: 50,
        y: 50,
        width: 80,
        height: 3,
        zIndex: 10,
        tokenBinding: 'بصفته(ا): {{participant.roleInActivity}}',
        text: `بصفته(ا): ${firstSpeaker.roleInActivity}`,
        fontSize: 12,
        fontWeight: 'bold',
        fontFamily: 'Cairo, sans-serif',
        color: '#FFFFFF',
        align: 'center'
      },
      {
        id: 'cert_body_2',
        type: 'text',
        x: 50,
        y: 58,
        width: 88,
        height: 10,
        zIndex: 12,
        tokenBinding: 'قد شارك(ت) بفعالية وتفانٍ في تأطير وإنجاح أشغال {{activity.type}}: «{{activity.title}}» المنظمة بمدينة {{activity.city}} بتاريخ {{activity.date}} م، تقديراً لجهوده المتميزة وعطائه المستمر في خدمة المجتمع المدني.',
        text: `قد شارك(ت) بفعالية وتفانٍ في تأطير وإنجاح أشغال ${activity.type}: «${activity.title}» المنظمة بمدينة ${activity.city} بتاريخ ${activity.date} م، تقديراً لجهوده المتميزة وعطائه المستمر في خدمة المجتمع المدني.`,
        fontSize: 12,
        fontStyle: 'italic',
        fontFamily: 'Cairo, sans-serif',
        color: '#E2E8F0',
        align: 'center'
      },
      {
        id: 'cert_serial',
        type: 'text',
        x: 25,
        y: 74,
        width: 45,
        height: 3,
        zIndex: 10,
        tokenBinding: 'الرقم التسلسلي: AMDS-CERT-{{activity.date}}-001',
        text: `الرقم التسلسلي: AMDS-CERT-${activity.date.replace(/-/g, '')}-001`,
        fontSize: 10,
        fontFamily: 'Cairo, sans-serif',
        color: '#94A3B8',
        align: 'right'
      },
      {
        id: 'cert_qr',
        type: 'qrcode',
        x: 82,
        y: 74,
        width: 8,
        height: 8,
        zIndex: 20,
        qrTargetUrl: branding.website || 'https://amds.ma/verify/cert'
      },
      {
        id: 'cert_signatures',
        type: 'text',
        x: 50,
        y: 86,
        width: 90,
        height: 5,
        zIndex: 15,
        tokenBinding: 'خاتم الرابطة الرسمي المعتمد               توقيع الكاتب العام: {{activity.responsiblePerson}}',
        text: `خاتم الرابطة الرسمي المعتمد               توقيع الكاتب العام: ${activity.responsiblePerson || branding.secretaryGeneral}`,
        fontSize: 12,
        fontWeight: 'bold',
        fontFamily: 'Cairo, sans-serif',
        color: accent,
        align: 'center'
      }
    ];
  }

  // 6. Detailed Program Schedule (A4)
  if (kind === 'program') {
    return [
      {
        id: 'prog_logo',
        type: 'logo',
        x: 50,
        y: 7,
        width: 12,
        height: 9,
        zIndex: 20,
        imageUrl: branding.logoUrl,
        imageShape: 'rounded',
        borderWidth: 1.5,
        borderColor: accent
      },
      {
        id: 'prog_title',
        type: 'text',
        x: 50,
        y: 18,
        width: 90,
        height: 4,
        zIndex: 10,
        text: 'البرنامج العام والمفصل لأشغال النشاط',
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: 'Cairo, sans-serif',
        color: accent,
        align: 'center'
      },
      {
        id: 'prog_act_title',
        type: 'text',
        x: 50,
        y: 23,
        width: 90,
        height: 6,
        zIndex: 15,
        tokenBinding: '{{activity.title}}',
        text: activity.title,
        fontSize: 17,
        fontWeight: 'bold',
        fontFamily: 'Cairo, sans-serif',
        color: '#FFFFFF',
        align: 'center'
      },
      {
        id: 'prog_s1',
        type: 'shape',
        x: 50,
        y: 33,
        width: 90,
        height: 8,
        zIndex: 12,
        text: '15:30 — 16:00: استقبال المشاركين وتسجيل الحضور وتوزيع الملفات والبادجات'
      },
      {
        id: 'prog_s2',
        type: 'shape',
        x: 50,
        y: 43,
        width: 90,
        height: 8,
        zIndex: 12,
        tokenBinding: '16:00 — 16:30: الجلسة الافتتاحية والكلمة الرسمية للرابطة (الكاتب العام: {{activity.responsiblePerson}})',
        text: `16:00 — 16:30: الجلسة الافتتاحية والكلمة الرسمية للرابطة (الكاتب العام: ${activity.responsiblePerson || branding.secretaryGeneral})`
      },
      {
        id: 'prog_s3',
        type: 'shape',
        x: 50,
        y: 53,
        width: 90,
        height: 10,
        zIndex: 12,
        tokenBinding: '16:30 — 17:30: المداخلات الرسمية لجلسة العمل بمشاركة: {{activity.speakers}}',
        text: `16:30 — 17:30: المداخلات الرسمية لجلسة العمل بمشاركة: ${(activity.participants || []).map((p) => `${p.name} (${p.roleInActivity})`).join('، ')}`
      },
      {
        id: 'prog_s4',
        type: 'shape',
        x: 50,
        y: 65,
        width: 90,
        height: 8,
        zIndex: 12,
        text: '17:30 — 18:15: جلسة النقاش المفتوح وتفاعل الحضور مع المتدخلين'
      },
      {
        id: 'prog_s5',
        type: 'shape',
        x: 50,
        y: 75,
        width: 90,
        height: 8,
        zIndex: 12,
        text: '18:15 — 19:00: صياغة التوصيات، تسليم الشواهد التقديرية واختتام أشغال النشاط'
      },
      {
        id: 'prog_footer',
        type: 'text',
        x: 50,
        y: 91,
        width: 90,
        height: 4,
        zIndex: 10,
        tokenBinding: '{{activity.organizer}} | لجنة التنظيم والتنسيق | {{activity.date}}',
        text: `${activity.organizer || branding.name} | لجنة التنظيم والتنسيق | ${activity.date}`,
        fontSize: 11,
        fontFamily: 'Cairo, sans-serif',
        color: '#94A3B8',
        align: 'center'
      }
    ];
  }

  // 7. Speaker Card Spotlight (1:1 Square)
  if (kind === 'speaker_card') {
    return [
      {
        id: 'spk_logo',
        type: 'logo',
        x: 16,
        y: 10,
        width: 12,
        height: 10,
        zIndex: 20,
        imageUrl: branding.logoUrl,
        imageShape: 'rounded',
        borderWidth: 1.5,
        borderColor: accent
      },
      {
        id: 'spk_header',
        type: 'text',
        x: 65,
        y: 10,
        width: 60,
        height: 4,
        zIndex: 10,
        tokenBinding: '{{branding.acronym}} | بطاقة متدخل رسمي',
        text: `${branding.acronym} | بطاقة متدخل رسمي`,
        fontSize: 12.5,
        fontWeight: 'bold',
        fontFamily: 'Cairo, sans-serif',
        color: accent,
        align: 'right'
      },
      {
        id: 'spk_photo',
        type: 'image',
        x: 50,
        y: 28,
        width: 24,
        height: 24,
        zIndex: 18,
        imageUrl: firstSpeaker.photoUrl,
        imageShape: 'circle',
        borderWidth: 3,
        borderColor: accent,
        shadow: '0 0 20px rgba(212,175,55,0.45)'
      },
      {
        id: 'spk_name',
        type: 'text',
        x: 50,
        y: 47,
        width: 85,
        height: 6,
        zIndex: 15,
        tokenBinding: '{{participant.name}}',
        text: firstSpeaker.name,
        fontSize: 22,
        fontWeight: 'bold',
        fontFamily: 'Cairo, sans-serif',
        color: '#FFFFFF',
        align: 'center'
      },
      {
        id: 'spk_role',
        type: 'shape',
        x: 50,
        y: 54,
        width: 50,
        height: 4,
        zIndex: 12,
        tokenBinding: '{{participant.roleInActivity}}',
        text: firstSpeaker.roleInActivity,
        fontSize: 11.5,
        fontWeight: 'bold',
        fontFamily: 'Cairo, sans-serif',
        color: accent,
        align: 'center',
        borderWidth: 1,
        borderColor: accent
      },
      {
        id: 'spk_bio',
        type: 'text',
        x: 50,
        y: 62,
        width: 88,
        height: 6,
        zIndex: 10,
        tokenBinding: '{{participant.professionalTitle}}',
        text: firstSpeaker.professionalTitle,
        fontSize: 11.5,
        fontFamily: 'Cairo, sans-serif',
        color: '#CBD5E1',
        align: 'center'
      },
      {
        id: 'spk_event_banner',
        type: 'shape',
        x: 50,
        y: 77,
        width: 90,
        height: 12,
        zIndex: 15,
        borderWidth: 1.5,
        borderColor: accent
      },
      {
        id: 'spk_footer',
        type: 'text',
        x: 50,
        y: 94,
        width: 90,
        height: 3,
        zIndex: 10,
        tokenBinding: '{{branding.website}}',
        text: branding.website,
        fontSize: 10,
        fontFamily: 'Cairo, sans-serif',
        color: '#94A3B8',
        align: 'center'
      }
    ];
  }

  // 8. Report Cover (A4)
  if (kind === 'report_cover') {
    return [
      {
        id: 'rep_kingdom',
        type: 'text',
        x: 50,
        y: 6,
        width: 80,
        height: 3,
        zIndex: 10,
        text: '—  المملكة المغربية  —',
        fontSize: 13,
        fontWeight: 'bold',
        fontFamily: 'Cairo, sans-serif',
        color: '#FFFFFF',
        align: 'center'
      },
      {
        id: 'rep_logo',
        type: 'logo',
        x: 50,
        y: 13,
        width: 16,
        height: 12,
        zIndex: 20,
        imageUrl: branding.logoUrl,
        imageShape: 'rounded',
        borderWidth: 2,
        borderColor: accent
      },
      {
        id: 'rep_org',
        type: 'text',
        x: 50,
        y: 25,
        width: 90,
        height: 4,
        zIndex: 10,
        tokenBinding: '{{branding.name}}',
        text: branding.name,
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: 'Cairo, sans-serif',
        color: accent,
        align: 'center'
      },
      {
        id: 'rep_file_num',
        type: 'shape',
        x: 50,
        y: 32,
        width: 60,
        height: 4,
        zIndex: 12,
        tokenBinding: 'ملف التوثيق الرقمي: AMDS-REP-{{activity.id}}',
        text: `ملف التوثيق الرقمي: AMDS-REP-${activity.id?.slice(0, 6) || '2026'}`,
        fontSize: 11,
        fontFamily: 'Cairo, sans-serif',
        color: accent,
        borderWidth: 1,
        borderColor: accent
      },
      {
        id: 'rep_main_heading',
        type: 'text',
        x: 50,
        y: 42,
        width: 85,
        height: 6,
        zIndex: 15,
        text: 'التـقـريـر الأدبـي والـتـوثـيـقـي الـشـامـل',
        fontSize: 22,
        fontWeight: 'bold',
        fontFamily: 'Amiri, serif',
        color: '#FFFFFF',
        align: 'center'
      },
      {
        id: 'rep_act_title',
        type: 'text',
        x: 50,
        y: 52,
        width: 90,
        height: 11,
        zIndex: 15,
        tokenBinding: 'حول فعاليات {{activity.type}}: {{activity.title}}',
        text: `حول فعاليات ${activity.type}: ${activity.title}`,
        fontSize: 20,
        fontWeight: 'bold',
        fontFamily: 'Cairo, sans-serif',
        color: accent,
        align: 'center'
      },
      {
        id: 'rep_slogan',
        type: 'text',
        x: 50,
        y: 63,
        width: 85,
        height: 4,
        zIndex: 10,
        tokenBinding: '«{{activity.slogan}}»',
        text: `«${activity.slogan || branding.slogan}»`,
        fontSize: 13,
        fontStyle: 'italic',
        fontFamily: 'Amiri, serif',
        color: mutedText,
        align: 'center'
      },
      {
        id: 'rep_meta_table',
        type: 'shape',
        x: 50,
        y: 77,
        width: 90,
        height: 13,
        zIndex: 15,
        borderWidth: 2,
        borderColor: accent
      },
      {
        id: 'rep_seal',
        type: 'text',
        x: 50,
        y: 93,
        width: 90,
        height: 4,
        zIndex: 10,
        tokenBinding: 'الكتابة العامة المركزية — نظام مِداد AMDS للأرشفة والتوثيق',
        text: 'الكتابة العامة المركزية — نظام مِداد AMDS للأرشفة والتوثيق',
        fontSize: 10.5,
        fontFamily: 'Cairo, sans-serif',
        color: '#94A3B8',
        align: 'center'
      }
    ];
  }

  // 9. Organizer Card (1:1 Square)
  if (kind === 'organizer_card') {
    return [
      {
        id: 'org_c_logo',
        type: 'logo',
        x: 50,
        y: 12,
        width: 14,
        height: 14,
        zIndex: 20,
        imageUrl: branding.logoUrl,
        imageShape: 'rounded',
        borderWidth: 2,
        borderColor: accent
      },
      {
        id: 'org_c_badge',
        type: 'text',
        x: 50,
        y: 24,
        width: 80,
        height: 4,
        zIndex: 15,
        text: 'بِطَاقَةُ اللَّجْنَةِ التَّنْظِيمِيَّةِ وَالتَّأْطِيرِ',
        fontSize: 13,
        fontWeight: 'bold',
        fontFamily: 'Cairo, sans-serif',
        color: accent,
        align: 'center'
      },
      {
        id: 'org_c_avatar',
        type: 'image',
        x: 50,
        y: 42,
        width: 28,
        height: 28,
        zIndex: 15,
        imageUrl: firstSpeaker.photoUrl,
        imageShape: 'circle',
        borderWidth: 3,
        borderColor: accent
      },
      {
        id: 'org_c_name',
        type: 'text',
        x: 50,
        y: 60,
        width: 85,
        height: 5,
        zIndex: 15,
        tokenBinding: '{{activity.responsiblePerson}}',
        text: activity.responsiblePerson || currentUserFullName(branding),
        fontSize: 20,
        fontWeight: 'bold',
        fontFamily: 'Cairo, sans-serif',
        color: '#FFFFFF',
        align: 'center'
      },
      {
        id: 'org_c_role',
        type: 'shape',
        x: 50,
        y: 67,
        width: 60,
        height: 4,
        zIndex: 12,
        text: 'المشرف العام ومنسق النشاط',
        fontSize: 11.5,
        fontWeight: 'bold',
        fontFamily: 'Cairo, sans-serif',
        color: accent,
        borderWidth: 1,
        borderColor: accent
      },
      {
        id: 'org_c_event',
        type: 'text',
        x: 50,
        y: 77,
        width: 88,
        height: 6,
        zIndex: 10,
        tokenBinding: '{{activity.title}}',
        text: activity.title,
        fontSize: 12,
        fontFamily: 'Cairo, sans-serif',
        color: '#CBD5E1',
        align: 'center'
      },
      {
        id: 'org_c_footer',
        type: 'text',
        x: 50,
        y: 93,
        width: 90,
        height: 3,
        zIndex: 10,
        text: `${branding.name} — ${branding.acronym}`,
        fontSize: 10,
        fontFamily: 'Cairo, sans-serif',
        color: '#94A3B8',
        align: 'center'
      }
    ];
  }

  // 10. Attendance Badge Card (4:5 Ratio)
  if (kind === 'attendance_card') {
    return [
      {
        id: 'att_top_flag',
        type: 'text',
        x: 50,
        y: 4,
        width: 80,
        height: 3,
        zIndex: 10,
        text: '— المملكة المغربية —',
        fontSize: 10,
        fontWeight: 'bold',
        fontFamily: 'Cairo, sans-serif',
        color: '#FFFFFF',
        align: 'center'
      },
      {
        id: 'att_logo',
        type: 'logo',
        x: 50,
        y: 11,
        width: 14,
        height: 12,
        zIndex: 20,
        imageUrl: branding.logoUrl,
        imageShape: 'rounded',
        borderWidth: 2,
        borderColor: accent
      },
      {
        id: 'att_org',
        type: 'text',
        x: 50,
        y: 20,
        width: 90,
        height: 3.5,
        zIndex: 10,
        text: branding.name,
        fontSize: 12,
        fontWeight: 'bold',
        fontFamily: 'Cairo, sans-serif',
        color: accent,
        align: 'center'
      },
      {
        id: 'att_title_badge',
        type: 'shape',
        x: 50,
        y: 26,
        width: 70,
        height: 4,
        zIndex: 12,
        text: 'شَـــارَةُ الـحُـــضُـورِ وَالـمُـشَـــارَكَـةِ',
        fontSize: 11,
        fontWeight: 'bold',
        fontFamily: 'Cairo, sans-serif',
        color: '#FFFFFF',
        borderWidth: 1,
        borderColor: accent
      },
      {
        id: 'att_photo',
        type: 'image',
        x: 50,
        y: 44,
        width: 28,
        height: 26,
        zIndex: 15,
        imageUrl: firstSpeaker.photoUrl,
        imageShape: 'rounded',
        borderWidth: 2.5,
        borderColor: accent
      },
      {
        id: 'att_name',
        type: 'text',
        x: 50,
        y: 60,
        width: 85,
        height: 4.5,
        zIndex: 15,
        tokenBinding: '{{participant.name}}',
        text: firstSpeaker.name,
        fontSize: 18,
        fontWeight: 'bold',
        fontFamily: 'Cairo, sans-serif',
        color: '#FFFFFF',
        align: 'center'
      },
      {
        id: 'att_role',
        type: 'text',
        x: 50,
        y: 66,
        width: 80,
        height: 3.5,
        zIndex: 10,
        tokenBinding: '{{participant.roleInActivity}}',
        text: firstSpeaker.roleInActivity,
        fontSize: 12,
        fontWeight: 'bold',
        fontFamily: 'Cairo, sans-serif',
        color: accent,
        align: 'center'
      },
      {
        id: 'att_act',
        type: 'text',
        x: 50,
        y: 74,
        width: 88,
        height: 5,
        zIndex: 10,
        tokenBinding: '{{activity.title}}',
        text: activity.title,
        fontSize: 10.5,
        fontFamily: 'Cairo, sans-serif',
        color: '#CBD5E1',
        align: 'center'
      },
      {
        id: 'att_qr',
        type: 'qrcode',
        x: 50,
        y: 84,
        width: 11,
        height: 11,
        zIndex: 20,
        qrTargetUrl: branding.website || 'https://amds.ma/badge/verify'
      },
      {
        id: 'att_serial',
        type: 'text',
        x: 50,
        y: 95,
        width: 80,
        height: 2.5,
        zIndex: 10,
        text: `AMDS-BADGE-${activity.date?.replace(/-/g, '') || '2026'}-001`,
        fontSize: 9,
        fontFamily: 'Cairo, sans-serif',
        color: '#94A3B8',
        align: 'center'
      }
    ];
  }

  // 11. News Graphic (16:9 Landscape)
  if (kind === 'news_graphic') {
    return [
      {
        id: 'news_header_ribbon',
        type: 'shape',
        x: 50,
        y: 6,
        width: 96,
        height: 8,
        zIndex: 10,
        borderWidth: 1.5,
        borderColor: accent
      },
      {
        id: 'news_title_badge',
        type: 'text',
        x: 75,
        y: 6,
        width: 40,
        height: 6,
        zIndex: 15,
        text: 'تَغْطِيَةٌ إِخْبَارِيَّةٌ شَامِلَةٌ',
        fontSize: 15,
        fontWeight: 'bold',
        fontFamily: 'Cairo, sans-serif',
        color: accent,
        align: 'right'
      },
      {
        id: 'news_logo',
        type: 'logo',
        x: 15,
        y: 6,
        width: 8,
        height: 7,
        zIndex: 20,
        imageUrl: branding.logoUrl,
        imageShape: 'rounded',
        borderWidth: 1.5,
        borderColor: accent
      },
      {
        id: 'news_act_title',
        type: 'text',
        x: 50,
        y: 28,
        width: 92,
        height: 16,
        zIndex: 15,
        tokenBinding: '{{activity.title}}',
        text: activity.title,
        fontSize: 26,
        fontWeight: 'bold',
        fontFamily: 'Cairo, sans-serif',
        color: '#FFFFFF',
        align: 'center'
      },
      {
        id: 'news_slogan',
        type: 'text',
        x: 50,
        y: 48,
        width: 90,
        height: 8,
        zIndex: 12,
        tokenBinding: '«{{activity.slogan}}»',
        text: `«${activity.slogan || branding.slogan}»`,
        fontSize: 16,
        fontStyle: 'italic',
        fontFamily: 'Amiri, serif',
        color: mutedText,
        align: 'center'
      },
      {
        id: 'news_bar',
        type: 'shape',
        x: 50,
        y: 72,
        width: 92,
        height: 16,
        zIndex: 15,
        borderWidth: 2,
        borderColor: accent
      },
      {
        id: 'news_footer',
        type: 'text',
        x: 50,
        y: 93,
        width: 92,
        height: 4,
        zIndex: 10,
        text: `${branding.name} — منصة الإعلام والتواصل المؤسساتي | ${branding.website}`,
        fontSize: 11,
        fontFamily: 'Cairo, sans-serif',
        color: '#94A3B8',
        align: 'center'
      }
    ];
  }

  // 12. Thank You Card (A4)
  if (kind === 'thank_you_card') {
    return [
      {
        id: 'ty_kingdom',
        type: 'text',
        x: 50,
        y: 6,
        width: 80,
        height: 3,
        zIndex: 10,
        text: '— المملكة المغربية —',
        fontSize: 12,
        fontWeight: 'bold',
        fontFamily: 'Cairo, sans-serif',
        color: '#FFFFFF',
        align: 'center'
      },
      {
        id: 'ty_logo',
        type: 'logo',
        x: 50,
        y: 13,
        width: 14,
        height: 10,
        zIndex: 20,
        imageUrl: branding.logoUrl,
        imageShape: 'rounded',
        borderWidth: 2,
        borderColor: accent
      },
      {
        id: 'ty_org',
        type: 'text',
        x: 50,
        y: 24,
        width: 90,
        height: 4,
        zIndex: 10,
        text: branding.name,
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: 'Cairo, sans-serif',
        color: accent,
        align: 'center'
      },
      {
        id: 'ty_title',
        type: 'text',
        x: 50,
        y: 34,
        width: 85,
        height: 6,
        zIndex: 15,
        text: 'رِسَـــالَـةُ شُـكْـــرٍ وَعِــرْفَـــانٍ',
        fontSize: 24,
        fontWeight: 'bold',
        fontFamily: 'Amiri, serif',
        color: '#FFFFFF',
        align: 'center'
      },
      {
        id: 'ty_body',
        type: 'text',
        x: 50,
        y: 52,
        width: 88,
        height: 16,
        zIndex: 12,
        tokenBinding: 'يتقدم المكتب المركزي لـ {{branding.name}} بأسمى عبارات الشكر والامتنان لكافة المتدخلين والمؤطرين والشركاء الكرام على مساهمتهم القيمة والمتميزة في إنجاح فعاليات {{activity.type}}: «{{activity.title}}» المنظمة بتاريخ {{activity.date}} م.',
        text: `يتقدم المكتب المركزي لـ ${branding.name} بأسمى عبارات الشكر والامتنان لكافة المتدخلين والمؤطرين والشركاء الكرام على مساهمتهم القيمة والمتميزة في إنجاح فعاليات ${activity.type}: «${activity.title}» المنظمة بتاريخ ${activity.date} م.`,
        fontSize: 14,
        fontFamily: 'Cairo, sans-serif',
        color: '#E2E8F0',
        align: 'center'
      },
      {
        id: 'ty_sign',
        type: 'text',
        x: 50,
        y: 80,
        width: 90,
        height: 6,
        zIndex: 15,
        text: `عن المكتب المركزي — الكاتب العام للرابطة (${activity.responsiblePerson || currentUserFullName(branding)})`,
        fontSize: 13,
        fontWeight: 'bold',
        fontFamily: 'Cairo, sans-serif',
        color: accent,
        align: 'center'
      }
    ];
  }

  // 13. Media Coverage Template (16:9 Landscape)
  if (kind === 'media_template') {
    return [
      {
        id: 'med_banner',
        type: 'shape',
        x: 50,
        y: 6,
        width: 96,
        height: 8,
        zIndex: 10,
        borderWidth: 1.5,
        borderColor: accent
      },
      {
        id: 'med_title_badge',
        type: 'text',
        x: 70,
        y: 6,
        width: 45,
        height: 6,
        zIndex: 15,
        text: 'مَلَفُّ التَّغْطِيَةِ الصَّحَفِيَّةِ وَالإِعْلَامِيَّةِ',
        fontSize: 14,
        fontWeight: 'bold',
        fontFamily: 'Cairo, sans-serif',
        color: accent,
        align: 'right'
      },
      {
        id: 'med_logo',
        type: 'logo',
        x: 12,
        y: 6,
        width: 8,
        height: 7,
        zIndex: 20,
        imageUrl: branding.logoUrl,
        imageShape: 'rounded',
        borderWidth: 1.5,
        borderColor: accent
      },
      {
        id: 'med_heading',
        type: 'text',
        x: 50,
        y: 28,
        width: 92,
        height: 14,
        zIndex: 15,
        tokenBinding: '{{activity.title}}',
        text: activity.title,
        fontSize: 24,
        fontWeight: 'bold',
        fontFamily: 'Cairo, sans-serif',
        color: '#FFFFFF',
        align: 'center'
      },
      {
        id: 'med_details_box',
        type: 'shape',
        x: 50,
        y: 62,
        width: 92,
        height: 22,
        zIndex: 15,
        borderWidth: 2,
        borderColor: accent
      },
      {
        id: 'med_footer',
        type: 'text',
        x: 50,
        y: 93,
        width: 92,
        height: 4,
        zIndex: 10,
        text: `خلية الإعلام والتواصل الصحفي — ${branding.name} | ${branding.website}`,
        fontSize: 11,
        fontFamily: 'Cairo, sans-serif',
        color: '#94A3B8',
        align: 'center'
      }
    ];
  }

  // 14. WhatsApp Status (9:16 Vertical)
  if (kind === 'whatsapp_status') {
    return [
      {
        id: 'wa_logo',
        type: 'logo',
        x: 50,
        y: 8,
        width: 18,
        height: 12,
        zIndex: 20,
        imageUrl: branding.logoUrl,
        imageShape: 'rounded',
        borderWidth: 2,
        borderColor: accent
      },
      {
        id: 'wa_org',
        type: 'text',
        x: 50,
        y: 19,
        width: 90,
        height: 4,
        zIndex: 10,
        text: branding.name,
        fontSize: 14,
        fontWeight: 'bold',
        fontFamily: 'Cairo, sans-serif',
        color: accent,
        align: 'center'
      },
      {
        id: 'wa_type',
        type: 'shape',
        x: 50,
        y: 25,
        width: 60,
        height: 4,
        zIndex: 12,
        text: `إعلان موعد: ${activity.type}`,
        fontSize: 12,
        fontWeight: 'bold',
        fontFamily: 'Cairo, sans-serif',
        color: '#FFFFFF',
        borderWidth: 1.5,
        borderColor: accent
      },
      {
        id: 'wa_title',
        type: 'text',
        x: 50,
        y: 40,
        width: 90,
        height: 14,
        zIndex: 15,
        tokenBinding: '{{activity.title}}',
        text: activity.title,
        fontSize: 22,
        fontWeight: 'bold',
        fontFamily: 'Cairo, sans-serif',
        color: '#FFFFFF',
        align: 'center'
      },
      {
        id: 'wa_box',
        type: 'shape',
        x: 50,
        y: 70,
        width: 90,
        height: 22,
        zIndex: 15,
        borderWidth: 2,
        borderColor: accent
      },
      {
        id: 'wa_footer',
        type: 'text',
        x: 50,
        y: 95,
        width: 90,
        height: 3,
        zIndex: 10,
        text: 'انقر للرابط والمزيد من التفاصيل 🔗',
        fontSize: 11,
        fontFamily: 'Cairo, sans-serif',
        color: accent,
        align: 'center'
      }
    ];
  }

  // Default fallback for other derivatives
  return masterDesign.elements.map((el) => ({ ...el, id: `${el.id}_${kind}` }));
};

const currentUserFullName = (branding: OrganizationBranding): string => {
  return branding.secretaryGeneral || 'الكاتب العام';
};

// ============================================================================
// 4. Derivatives Engine (All 15 Assets Derived from Same Master Design)
// ============================================================================

export const generateAllDerivativesFromMaster = (
  masterDesign: MasterDesign,
  activity: Activity,
  branding: OrganizationBranding
): DesignDerivative[] => {
  const kinds: { kind: DesignAssetKind; title: string; ratio: 'A4' | '1:1' | '9:16' | '16:9' | '4:5' }[] = [
    { kind: 'poster', title: '1. الملصق الرسمي المعتمد (Poster)', ratio: 'A4' },
    { kind: 'invitation', title: '2. بطاقة الدعوة الرسمية (Invitation)', ratio: 'A4' },
    { kind: 'program', title: '3. البرنامج العام والمفصل (Program)', ratio: 'A4' },
    { kind: 'announcement', title: '4. بلاغ إخباري وإعلان رسمي (Announcement)', ratio: 'A4' },
    { kind: 'social_post', title: '5. منشور التواصل الاجتماعي (Social 1:1)', ratio: '1:1' },
    { kind: 'story', title: '6. ستوري انستغرام وفيسبوك (Story 9:16)', ratio: '9:16' },
    { kind: 'whatsapp_status', title: '7. حالة واتساب الرسمية (WhatsApp Status)', ratio: '9:16' },
    { kind: 'speaker_card', title: '8. بطاقة تقديم المتدخل (Speaker Highlight)', ratio: '1:1' },
    { kind: 'organizer_card', title: '9. بطاقة المنظم واللجنة (Organizer Card)', ratio: '1:1' },
    { kind: 'certificate', title: '10. شهادة المشاركة والتقدير (Certificate)', ratio: 'A4' },
    { kind: 'attendance_card', title: '11. شارة الحضور والبادج (Badge 4:5)', ratio: '4:5' },
    { kind: 'report_cover', title: '12. غلاف التقرير التوثيقي (Report Cover)', ratio: 'A4' },
    { kind: 'news_graphic', title: '13. جرافيك إخباري عريض (News Graphic 16:9)', ratio: '16:9' },
    { kind: 'thank_you_card', title: '14. بطاقة شكر وعرفان (Thank You Card)', ratio: 'A4' },
    { kind: 'media_template', title: '15. قالب التغطية الصحفية (Media Template 16:9)', ratio: '16:9' }
  ];

  return kinds.map((item) => ({
    id: `deriv_${masterDesign.activityId}_${item.kind}`,
    activityId: masterDesign.activityId,
    masterDesignId: masterDesign.id,
    kind: item.kind,
    title: item.title,
    aspectRatio: item.ratio,
    workflowState: masterDesign.workflowState,
    elements: deriveAssetElements(masterDesign, item.kind, item.ratio, activity, branding),
    isCustomized: false,
    version: masterDesign.version,
    updatedAt: new Date().toISOString()
  }));
};

// ============================================================================
// 5. Data Drift & Impact Detection (Detect Activity Changes & Impacted Materials)
// ============================================================================

export interface ChangeImpactReport {
  hasChanged: boolean;
  fieldChanges: {
    field: string;
    fieldLabel: string;
    oldValue: string;
    newValue: string;
  }[];
  impactedDerivatives: {
    kind: DesignAssetKind;
    title: string;
    reason: string;
  }[];
}

export const detectImpactedDesigns = (
  oldActivity: Activity,
  newActivity: Activity,
  derivatives: DesignDerivative[]
): ChangeImpactReport => {
  const fieldChanges: ChangeImpactReport['fieldChanges'] = [];

  if (oldActivity.title !== newActivity.title) {
    fieldChanges.push({
      field: 'title',
      fieldLabel: 'عنوان النشاط',
      oldValue: oldActivity.title,
      newValue: newActivity.title
    });
  }

  if (oldActivity.date !== newActivity.date) {
    fieldChanges.push({
      field: 'date',
      fieldLabel: 'تاريخ النشاط',
      oldValue: oldActivity.date,
      newValue: newActivity.date
    });
  }

  if (oldActivity.time !== newActivity.time) {
    fieldChanges.push({
      field: 'time',
      fieldLabel: 'توقيت النشاط',
      oldValue: oldActivity.time || '',
      newValue: newActivity.time || ''
    });
  }

  if (oldActivity.location !== newActivity.location || oldActivity.city !== newActivity.city) {
    fieldChanges.push({
      field: 'location',
      fieldLabel: 'المكان والمدينة',
      oldValue: `${oldActivity.location} — ${oldActivity.city}`,
      newValue: `${newActivity.location} — ${newActivity.city}`
    });
  }

  if (oldActivity.slogan !== newActivity.slogan) {
    fieldChanges.push({
      field: 'slogan',
      fieldLabel: 'الشعار الفرعي',
      oldValue: oldActivity.slogan || '',
      newValue: newActivity.slogan || ''
    });
  }

  if (oldActivity.organizer !== newActivity.organizer) {
    fieldChanges.push({
      field: 'organizer',
      fieldLabel: 'الجهة المنظمة',
      oldValue: oldActivity.organizer || '',
      newValue: newActivity.organizer || ''
    });
  }

  const oldSpeakers = (oldActivity.participants || []).map((p) => p.name).join(', ');
  const newSpeakers = (newActivity.participants || []).map((p) => p.name).join(', ');
  if (oldSpeakers !== newSpeakers) {
    fieldChanges.push({
      field: 'participants',
      fieldLabel: 'لائحة المتدخلين',
      oldValue: oldSpeakers || 'لا يوجد',
      newValue: newSpeakers || 'لا يوجد'
    });
  }

  if (fieldChanges.length === 0) {
    return {
      hasChanged: false,
      fieldChanges: [],
      impactedDerivatives: []
    };
  }

  // Determine affected design items
  const impactedDerivatives = derivatives.map((deriv) => {
    let reason = 'تحديث تلقائي للمعلومات المرتبطة بالتصميم الأساسي';
    if (fieldChanges.some((f) => f.field === 'date' || f.field === 'time')) {
      reason = 'تعديل موعد النشاط يتطلب تحديث توقيت المادة وتاريخها';
    } else if (fieldChanges.some((f) => f.field === 'location')) {
      reason = 'تغيير المكان يتطلب تحديث صندوق الإرشادات الجغرافية';
    } else if (fieldChanges.some((f) => f.field === 'participants')) {
      reason = 'تعديل المتدخلين يؤثر على بطاقات المحاضرين وجدول الجلسات';
    }

    return {
      kind: deriv.kind,
      title: deriv.title,
      reason
    };
  });

  return {
    hasChanged: true,
    fieldChanges,
    impactedDerivatives
  };
};

// ============================================================================
// 6. Design Review & Readiness Audit
// ============================================================================

export const auditDesignReadiness = (
  design: MasterDesign,
  activity: Activity
): DesignReviewReport => {
  const findings: DesignReviewFinding[] = [];

  // Check 1: Title presence
  const hasTitle = Boolean(activity.title && activity.title.trim().length > 5);
  findings.push({
    code: 'TITLE_CHECK',
    label: 'عنوان النشاط واضح ومحدد',
    passed: hasTitle,
    severity: hasTitle ? 'info' : 'error',
    message: hasTitle ? 'عنوان النشاط مسجل ومطابق لقاعدة البيانات' : 'عنوان النشاط مفقود أو قصير جداً'
  });

  // Check 2: Date & Time Presence
  const hasDate = Boolean(activity.date && activity.date.includes('-'));
  const hasTime = Boolean(activity.time && activity.time.includes(':'));
  findings.push({
    code: 'DATETIME_CHECK',
    label: 'التاريخ والتوقيت الرسمي',
    passed: hasDate && hasTime,
    severity: hasDate && hasTime ? 'info' : 'error',
    message:
      hasDate && hasTime
        ? `الموعد محدد بدقة (${activity.date} الساعة ${activity.time})`
        : 'التاريخ أو التوقيت غير مكتمل في ملف النشاط'
  });

  // Check 3: Venue & City
  const hasVenue = Boolean(activity.location && activity.city);
  findings.push({
    code: 'VENUE_CHECK',
    label: 'القاعة والمدينة الجغرافية',
    passed: hasVenue,
    severity: hasVenue ? 'info' : 'warning',
    message: hasVenue ? `المكان معتمد: ${activity.location} (${activity.city})` : 'يرجى تحديد القاعة والمدينة لضمان وضوح الملصق'
  });

  // Check 4: Official Centered Logo
  const hasLogo = Boolean(design.elements.some((el) => el.type === 'logo'));
  findings.push({
    code: 'LOGO_CHECK',
    label: 'الشعار الرسمي موسط ومؤطر بالهالة',
    passed: hasLogo,
    severity: hasLogo ? 'info' : 'error',
    message: hasLogo ? 'الشعار الرسمي المعتمد متواجد بالمركز مع خلفيته البيضاء' : 'لم يتم العثور على شعار الرابطة في التصميم'
  });

  // Check 5: Speakers Check
  const participantsCount = (activity.participants || []).length;
  findings.push({
    code: 'SPEAKERS_CHECK',
    label: 'بيانات المتدخلين والصور',
    passed: participantsCount > 0,
    severity: participantsCount > 0 ? 'info' : 'warning',
    message:
      participantsCount > 0
        ? `تم تسجيل ${participantsCount} متدخلين مع أسمائهم وصفاتهم بالنشاط`
        : 'لا يوجد متدخلون مسجلون في النشاط حتى الآن'
  });

  // Check 6: QR Code validity
  const hasQR = Boolean(design.elements.some((el) => el.type === 'qrcode'));
  findings.push({
    code: 'QR_CHECK',
    label: 'الرمز الديناميكي السريع (QR Code)',
    passed: hasQR,
    severity: 'info',
    message: hasQR ? 'الرمز التفاعلي مدرج وموجه إلى المنصة الرسمية' : 'يمكن إدراج رمز QR لتسهيل التسجيل'
  });

  // Check 7: Workflow Lock Check
  const isApproved = design.workflowState === 'Approved';
  findings.push({
    code: 'APPROVAL_CHECK',
    label: 'حالة الاعتماد المؤسساتي',
    passed: isApproved,
    severity: isApproved ? 'info' : 'warning',
    message: isApproved ? 'التصميم معتمد رسمياً من طرف الكاتب العام' : 'التصميم في مرحلة المسودة ويتطلب الاعتماد النهائي قبل النشر'
  });

  const passedCount = findings.filter((f) => f.passed).length;
  const score = Math.round((passedCount / findings.length) * 100);

  return {
    score,
    passed: score >= 80,
    findings,
    auditedAt: new Date().toISOString()
  };
};

// ============================================================================
// 7. Activity Design Pack ZIP Exporter (Generates Full Activity Pack ZIP)
// ============================================================================

export const exportActivityDesignPackZip = async (
  activity: Activity,
  masterDesign: MasterDesign,
  derivatives: DesignDerivative[],
  branding: OrganizationBranding
): Promise<{ blob: Blob; fileName: string }> => {
  const zip = new JSZip();
  const folderName = `MIDAD_AMDS_${activity.date || '2026'}_ACT_${activity.id?.slice(0, 6) || '001'}`;
  const root = zip.folder(folderName) || zip;

  // 1. Generate Metadata Manifest JSON
  const manifest = {
    organization: branding.name,
    acronym: branding.acronym,
    system: 'MIDAD AMDS – نظام الكتابة العامة الذكي',
    activityId: activity.id,
    activityTitle: activity.title,
    activityDate: activity.date,
    activityTime: activity.time,
    activityLocation: `${activity.location} — ${activity.city}`,
    masterDesignId: masterDesign.id,
    masterDesignVersion: masterDesign.version,
    workflowState: masterDesign.workflowState,
    generatedAt: new Date().toISOString(),
    derivativesCount: derivatives.length,
    derivativesList: derivatives.map((d) => ({
      kind: d.kind,
      title: d.title,
      aspectRatio: d.aspectRatio
    }))
  };

  root.file('00_MANIFEST_DESIGN_PACK.json', JSON.stringify(manifest, null, 2));

  // 2. Render Canvas Images for each derivative
  const renderAssetCanvas = async (title: string, kind: string, ratio: string): Promise<string> => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    const width = ratio === '1:1' ? 1200 : ratio === '9:16' ? 1080 : 1240;
    const height = ratio === '1:1' ? 1200 : ratio === '9:16' ? 1920 : 1754;

    canvas.width = width;
    canvas.height = height;

    // Background Fill
    ctx.fillStyle = masterDesign.visualIdentity.palette.primary;
    ctx.fillRect(0, 0, width, height);

    // Gradient Overlay
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, masterDesign.visualIdentity.palette.secondary);
    grad.addColorStop(1, masterDesign.visualIdentity.palette.background);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Gold Outer Frame
    ctx.strokeStyle = masterDesign.visualIdentity.palette.accent;
    ctx.lineWidth = 12;
    ctx.strokeRect(30, 30, width - 60, height - 60);

    // Header Text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 24px Cairo, sans-serif';
    ctx.textAlign = 'center';
    ctx.direction = 'rtl';
    ctx.fillText('—  المملكة المغربية  —', width / 2, 85);

    // Centered White Box for Logo
    const logoY = 110;
    const logoSize = 100;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(width / 2 - logoSize / 2, logoY, logoSize, logoSize);
    ctx.strokeStyle = masterDesign.visualIdentity.palette.accent;
    ctx.lineWidth = 3;
    ctx.strokeRect(width / 2 - logoSize / 2, logoY, logoSize, logoSize);

    // Institution Name
    ctx.fillStyle = masterDesign.visualIdentity.palette.accent;
    ctx.font = 'bold 36px Cairo, sans-serif';
    ctx.fillText(branding.name, width / 2, logoY + logoSize + 45);

    ctx.fillStyle = '#CBD5E1';
    ctx.font = '22px Cairo, sans-serif';
    ctx.fillText(`${branding.acronym} — الكتابة العامة`, width / 2, logoY + logoSize + 80);

    // Kind Badge
    ctx.fillStyle = 'rgba(212, 175, 55, 0.2)';
    ctx.fillRect(width / 2 - 200, logoY + logoSize + 110, 400, 45);
    ctx.strokeStyle = masterDesign.visualIdentity.palette.accent;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(width / 2 - 200, logoY + logoSize + 110, 400, 45);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 20px Cairo, sans-serif';
    ctx.fillText(title, width / 2, logoY + logoSize + 140);

    // Main Activity Title
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 44px Cairo, sans-serif';
    ctx.fillText(activity.title, width / 2, height / 2 - 50);

    // Slogan
    if (activity.slogan) {
      ctx.fillStyle = masterDesign.visualIdentity.palette.mutedText;
      ctx.font = 'italic 26px Amiri, serif';
      ctx.fillText(`«${activity.slogan}»`, width / 2, height / 2 + 30);
    }

    // Practical Info Box
    const boxY = height - 320;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
    ctx.fillRect(80, boxY, width - 160, 160);
    ctx.strokeStyle = masterDesign.visualIdentity.palette.accent;
    ctx.lineWidth = 2.5;
    ctx.strokeRect(80, boxY, width - 160, 160);

    ctx.fillStyle = masterDesign.visualIdentity.palette.accent;
    ctx.font = 'bold 26px Cairo, sans-serif';
    ctx.fillText(`📅 ${activity.date} م | ⏰ ${activity.time || '16:00'}`, width / 2, boxY + 60);

    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(`📍 ${activity.location} — ${activity.city}`, width / 2, boxY + 115);

    // Footer
    ctx.fillStyle = '#94A3B8';
    ctx.font = '20px Cairo, sans-serif';
    ctx.fillText(branding.website, width / 2, height - 70);

    return canvas.toDataURL('image/png').split(',')[1];
  };

  // 3. Add each derivative PNG into ZIP (All 15 Official Derivatives)
  const items = [
    { name: '01_الملصق_الرسمي_Poster.png', title: 'الملصق الرسمي (Poster)', kind: 'poster', ratio: 'A4' },
    { name: '02_بطاقة_الدعوة_Invitation.png', title: 'بطاقة الدعوة الرسمية (Invitation)', kind: 'invitation', ratio: 'A4' },
    { name: '03_البرنامج_المفصل_Program.png', title: 'البرنامج العام والمفصل (Program)', kind: 'program', ratio: 'A4' },
    { name: '04_البلاغ_الإخباري_Announcement.png', title: 'بلاغ إخباري وإعلان رسمي (Announcement)', kind: 'announcement', ratio: 'A4' },
    { name: '05_منشور_التواصل_Social_Post.png', title: 'منشور التواصل الاجتماعي (Social 1:1)', kind: 'social_post', ratio: '1:1' },
    { name: '06_ستوري_انستغرام_Story.png', title: 'ستوري انستغرام وفيسبوك (Story 9:16)', kind: 'story', ratio: '9:16' },
    { name: '07_حالة_واتساب_WhatsApp_Status.png', title: 'حالة واتساب الرسمية (WhatsApp Status)', kind: 'whatsapp_status', ratio: '9:16' },
    { name: '08_بطاقة_المتدخل_Speaker_Card.png', title: 'بطاقة تقديم المتدخل (Speaker Highlight)', kind: 'speaker_card', ratio: '1:1' },
    { name: '09_بطاقة_المنظم_Organizer_Card.png', title: 'بطاقة المنظم واللجنة (Organizer Card)', kind: 'organizer_card', ratio: '1:1' },
    { name: '10_شهادة_المشاركة_Certificate.png', title: 'شهادة المشاركة والتقدير (Certificate)', kind: 'certificate', ratio: 'A4' },
    { name: '11_شارة_الحضور_Attendance_Badge.png', title: 'شارة الحضور والبادج (Attendance Badge)', kind: 'attendance_card', ratio: '4:5' },
    { name: '12_غلاف_التقرير_Report_Cover.png', title: 'غلاف التقرير الأدبي والتوثيقي (Report Cover)', kind: 'report_cover', ratio: 'A4' },
    { name: '13_جرافيك_إخباري_News_Graphic.png', title: 'جرافيك إخباري عريض (News Graphic 16:9)', kind: 'news_graphic', ratio: '16:9' },
    { name: '14_بطاقة_الشكر_Thank_You_Card.png', title: 'بطاقة الشكر والامتنان (Thank You)', kind: 'thank_you_card', ratio: 'A4' },
    { name: '15_تغطية_صحفية_Media_Coverage.png', title: 'قالب التغطية الصحفية والإعلامية (Media Coverage)', kind: 'media_template', ratio: '16:9' }
  ];

  for (const item of items) {
    try {
      const base64Data = await renderAssetCanvas(item.title, item.kind, item.ratio);
      if (base64Data) {
        root.file(item.name, base64Data, { base64: true });
      }
    } catch (err) {
      console.warn(`Could not render asset for zip: ${item.name}`, err);
    }
  }

  const blob = await zip.generateAsync({ type: 'blob' });
  const fileName = `${folderName}.zip`;

  return { blob, fileName };
};

// ============================================================================
// 8. Template Library (نظام Templates حقيقي وقوالب مخصصة لكل صنف نشاط)
// ============================================================================

export const DEFAULT_DESIGN_TEMPLATES: DesignTemplate[] = [
  {
    id: 'tmpl_royal_conference',
    name: 'الندوة الوطنية الكبرى (النمط الملكي الأندلسي)',
    category: 'ندوة فكرية',
    description: 'قالب رسمي وقور للمؤتمرات والندوات الفكرية الكبرى مع زخارف الزليج المغربي والإطار المذهب وشارات الشرف.',
    defaultAspectRatio: 'A4',
    visualIdentity: {
      id: 'vi_royal_conf',
      palette: {
        primary: '#006233',
        secondary: '#022C22',
        accent: '#D4AF37',
        background: '#0F172A',
        surface: 'rgba(15, 23, 42, 0.95)',
        text: '#FFFFFF',
        mutedText: '#FDE68A'
      },
      typography: {
        titleFont: 'Cairo, sans-serif',
        bodyFont: 'Cairo, sans-serif',
        sloganFont: 'Amiri, serif',
        fontSizeScale: 1
      },
      backgroundPattern: 'zellige_moroccan',
      decorations: {
        showGoldFrame: true,
        showWatermark: true,
        logoPosition: 'center_top',
        archDecorations: true,
        badgeStyle: 'royal'
      },
      updatedAt: '2026-10-01T00:00:00.000Z'
    },
    defaultElements: [],
    isDefault: true,
    version: 1,
    createdAt: '2026-10-01T00:00:00.000Z',
    updatedAt: '2026-10-01T00:00:00.000Z'
  },
  {
    id: 'tmpl_solidarity_convoy',
    name: 'قافلة التضامن والمجتمع (نمط الأطلس الدافئ)',
    category: 'قافلة خيرية',
    description: 'قالب إنساني يعكس دفء العمل الجمعوي والتضامني بالأطلس والريف مع ألوان التضامن والشهامة.',
    defaultAspectRatio: 'A4',
    visualIdentity: {
      id: 'vi_solidarity',
      palette: {
        primary: '#C1272D',
        secondary: '#7F1D1D',
        accent: '#F59E0B',
        background: '#451A03',
        surface: 'rgba(15, 23, 42, 0.94)',
        text: '#FFFFFF',
        mutedText: '#FDE68A'
      },
      typography: {
        titleFont: 'Cairo, sans-serif',
        bodyFont: 'Cairo, sans-serif',
        sloganFont: 'Amiri, serif',
        fontSizeScale: 1
      },
      backgroundPattern: 'atlas_mountains',
      decorations: {
        showGoldFrame: true,
        showWatermark: true,
        logoPosition: 'center_top',
        archDecorations: false,
        badgeStyle: 'royal'
      },
      updatedAt: '2026-10-01T00:00:00.000Z'
    },
    defaultElements: [],
    isDefault: true,
    version: 1,
    createdAt: '2026-10-01T00:00:00.000Z',
    updatedAt: '2026-10-01T00:00:00.000Z'
  },
  {
    id: 'tmpl_training_workshop',
    name: 'الورشة التكوينية وحاضنة المهارات (النمط التكنولوجي)',
    category: 'ورشة تكوينية',
    description: 'قالب عصري للتدريب وبناء القدرات الرقمية والشبابية مع خطوط تكنولوجية متناسقة وتباين فائق.',
    defaultAspectRatio: 'A4',
    visualIdentity: {
      id: 'vi_training',
      palette: {
        primary: '#064E3B',
        secondary: '#0F172A',
        accent: '#38BDF8',
        background: '#042F2E',
        surface: 'rgba(15, 23, 42, 0.92)',
        text: '#FFFFFF',
        mutedText: '#7DD3FC'
      },
      typography: {
        titleFont: 'Cairo, sans-serif',
        bodyFont: 'Cairo, sans-serif',
        sloganFont: 'Amiri, serif',
        fontSizeScale: 1
      },
      backgroundPattern: 'tech_nodes',
      decorations: {
        showGoldFrame: true,
        showWatermark: false,
        logoPosition: 'center_top',
        archDecorations: false,
        badgeStyle: 'modern'
      },
      updatedAt: '2026-10-01T00:00:00.000Z'
    },
    defaultElements: [],
    isDefault: true,
    version: 1,
    createdAt: '2026-10-01T00:00:00.000Z',
    updatedAt: '2026-10-01T00:00:00.000Z'
  },
  {
    id: 'tmpl_general_assembly',
    name: 'الجمع العام والمجلس المركزي (النمط المؤسساتي الوقور)',
    category: 'جمع عام',
    description: 'قالب بروتوكولي رفيع للجموع العامة، المحطات الانتخابية، والتقارير الأدبية والمالية مع الأختام الرسمية.',
    defaultAspectRatio: 'A4',
    visualIdentity: {
      id: 'vi_assembly',
      palette: {
        primary: '#0F172A',
        secondary: '#1E293B',
        accent: '#D4AF37',
        background: '#091326',
        surface: 'rgba(15, 23, 42, 0.96)',
        text: '#FFFFFF',
        mutedText: '#94A3B8'
      },
      typography: {
        titleFont: 'Cairo, sans-serif',
        bodyFont: 'Cairo, sans-serif',
        sloganFont: 'Amiri, serif',
        fontSizeScale: 1
      },
      backgroundPattern: 'institutional_arch',
      decorations: {
        showGoldFrame: true,
        showWatermark: true,
        logoPosition: 'center_top',
        archDecorations: true,
        badgeStyle: 'royal'
      },
      updatedAt: '2026-10-01T00:00:00.000Z'
    },
    defaultElements: [],
    isDefault: true,
    version: 1,
    createdAt: '2026-10-01T00:00:00.000Z',
    updatedAt: '2026-10-01T00:00:00.000Z'
  },
  {
    id: 'tmpl_educational_camp',
    name: 'المخيم التربوي والبيئي (نمط غابات الأرز المغربية)',
    category: 'مخيم تربوي',
    description: 'قالب خاص بالأنشطة الخارجية، المخيمات الصيفية والتربوية، والمبادرات البيئية المستدامة.',
    defaultAspectRatio: 'A4',
    visualIdentity: {
      id: 'vi_camp',
      palette: {
        primary: '#14532D',
        secondary: '#1C1917',
        accent: '#FBBF24',
        background: '#052E16',
        surface: 'rgba(28, 25, 23, 0.94)',
        text: '#FFFFFF',
        mutedText: '#FEF08A'
      },
      typography: {
        titleFont: 'Cairo, sans-serif',
        bodyFont: 'Cairo, sans-serif',
        sloganFont: 'Amiri, serif',
        fontSizeScale: 1
      },
      backgroundPattern: 'cedar_forest',
      decorations: {
        showGoldFrame: true,
        showWatermark: true,
        logoPosition: 'center_top',
        archDecorations: false,
        badgeStyle: 'modern'
      },
      updatedAt: '2026-10-01T00:00:00.000Z'
    },
    defaultElements: [],
    isDefault: true,
    version: 1,
    createdAt: '2026-10-01T00:00:00.000Z',
    updatedAt: '2026-10-01T00:00:00.000Z'
  },
  {
    id: 'tmpl_solidarity_act',
    name: 'النشاط التضامني والإنساني (نمط العطاء المجتمعي)',
    category: 'نشاط تضامني',
    description: 'قالب اجتماعي دافئ يبرز قيم التكافل والتآزر مع معالجة راقية لصور المستفيدين والشركاء.',
    defaultAspectRatio: 'A4',
    visualIdentity: {
      id: 'vi_solidarity_act',
      palette: {
        primary: '#991B1B',
        secondary: '#450A0A',
        accent: '#F59E0B',
        background: '#1C1917',
        surface: 'rgba(15, 23, 42, 0.95)',
        text: '#FFFFFF',
        mutedText: '#FED7AA'
      },
      typography: {
        titleFont: 'Cairo, sans-serif',
        bodyFont: 'Cairo, sans-serif',
        sloganFont: 'Amiri, serif',
        fontSizeScale: 1
      },
      backgroundPattern: 'atlas_mountains',
      decorations: {
        showGoldFrame: true,
        showWatermark: true,
        logoPosition: 'center_top',
        archDecorations: false,
        badgeStyle: 'royal'
      },
      updatedAt: '2026-10-01T00:00:00.000Z'
    },
    defaultElements: [],
    isDefault: true,
    version: 1,
    createdAt: '2026-10-01T00:00:00.000Z',
    updatedAt: '2026-10-01T00:00:00.000Z'
  },
  {
    id: 'tmpl_cultural_evening',
    name: 'الأمسية الأدبية والفنية (نمط الخط المغربي الأصيل)',
    category: 'أخرى',
    description: 'قالب شعري وثقافي يحتفي بالأدب والفكر والخط المغربي الأندلسي واللقاءات التكريمية.',
    defaultAspectRatio: 'A4',
    visualIdentity: {
      id: 'vi_cultural',
      palette: {
        primary: '#1E1B4B',
        secondary: '#0F172A',
        accent: '#F59E0B',
        background: '#030712',
        surface: 'rgba(15, 23, 42, 0.94)',
        text: '#FFFFFF',
        mutedText: '#FDE68A'
      },
      typography: {
        titleFont: 'Cairo, sans-serif',
        bodyFont: 'Cairo, sans-serif',
        sloganFont: 'Amiri, serif',
        fontSizeScale: 1
      },
      backgroundPattern: 'zellige_moroccan',
      decorations: {
        showGoldFrame: true,
        showWatermark: true,
        logoPosition: 'center_top',
        archDecorations: true,
        badgeStyle: 'royal'
      },
      updatedAt: '2026-10-01T00:00:00.000Z'
    },
    defaultElements: [],
    isDefault: false,
    version: 1,
    createdAt: '2026-10-01T00:00:00.000Z',
    updatedAt: '2026-10-01T00:00:00.000Z'
  }
];

export const applyTemplateToMasterDesign = (
  template: DesignTemplate,
  activity: Activity,
  branding: OrganizationBranding
): MasterDesign => {
  return createMasterDesignFromActivity(activity, branding, template.visualIdentity);
};

