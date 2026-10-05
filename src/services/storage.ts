import { getStorage, ref, uploadBytesResumable, getDownloadURL, listAll } from 'firebase/storage';
import { app } from './firebase';
import type { StorageAsset } from '../types';

export const storage = getStorage(app);

export const STORAGE_FOLDERS = {
  BRANDING: 'branding',
  ACTIVITIES: 'activities',
  BRANCHES: 'branches',
  MEMBERS: 'members',
  DOCUMENTS: 'documents',
  CERTIFICATES: 'certificates',
  REPORTS: 'reports',
  INSTITUTIONAL_MEMORY: 'institutional_memory'
} as const;

export const MAX_FILE_SIZES: Record<string, number> = {
  branding: 10 * 1024 * 1024, // 10MB
  activities: 50 * 1024 * 1024, // 50MB
  branches: 25 * 1024 * 1024, // 25MB
  members: 15 * 1024 * 1024, // 15MB
  documents: 30 * 1024 * 1024, // 30MB
  certificates: 10 * 1024 * 1024, // 10MB
  reports: 50 * 1024 * 1024, // 50MB
  institutional_memory: 50 * 1024 * 1024 // 50MB
};

// Activity Structured Pack Folders
export function getActivityFolderStructure(activityId: string) {
  return {
    root: `activities/${activityId}`,
    poster: `activities/${activityId}/01-poster`,
    invitations: `activities/${activityId}/02-invitations`,
    program: `activities/${activityId}/03-program`,
    announcement: `activities/${activityId}/04-announcement`,
    socialMedia: `activities/${activityId}/05-social-media`,
    attendance: `activities/${activityId}/06-attendance`,
    certificates: `activities/${activityId}/07-certificates`,
    photos: `activities/${activityId}/08-photos`,
    report: `activities/${activityId}/09-report`,
    correspondence: `activities/${activityId}/10-correspondence`,
    pack: `activities/${activityId}/11-activity-pack`
  };
}

export function validateStorageFile(file: File, category: keyof typeof MAX_FILE_SIZES): { valid: boolean; error?: string } {
  const maxSize = MAX_FILE_SIZES[category] || 25 * 1024 * 1024;
  if (file.size > maxSize) {
    const maxMb = Math.round(maxSize / (1024 * 1024));
    return {
      valid: false,
      error: `حجم الملف (${(file.size / (1024 * 1024)).toFixed(1)}MB) يتجاوز الحد الأقصى المسموح به (${maxMb}MB) لقسم ${category}.`
    };
  }

  // Branding must be image
  if (category === 'branding' && !file.type.startsWith('image/')) {
    return {
      valid: false,
      error: 'يجب أن يكون ملف الهوية البصرية صورة (SVG, PNG, JPG, WebP).'
    };
  }

  return { valid: true };
}

export async function uploadStorageFile(
  file: File,
  storagePath: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  const storageRef = ref(storage, storagePath);
  const uploadTask = uploadBytesResumable(storageRef, file, {
    contentType: file.type,
    customMetadata: {
      originalName: file.name,
      uploadedAt: new Date().toISOString()
    }
  });

  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (onProgress) onProgress(progress);
      },
      (error) => {
        console.error('Storage upload error:', error);
        reject(error);
      },
      async () => {
        try {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadUrl);
        } catch (urlErr) {
          reject(urlErr);
        }
      }
    );
  });
}
