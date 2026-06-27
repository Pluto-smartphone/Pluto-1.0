import { supabase } from '@/integrations/supabase/client';

const IMAGE_BUCKET = 'phone-images';
const PLACEHOLDER = '/placeholder.svg';

/** Normalize storage_path from DB (handles legacy bucket prefixes and full URLs). */
export function normalizePhoneStoragePath(storagePath: string): string {
  if (!storagePath?.trim()) return '';
  const trimmed = storagePath.trim();

  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    if (trimmed.startsWith(`${IMAGE_BUCKET}/`)) {
      return trimmed.slice(IMAGE_BUCKET.length + 1);
    }
    if (trimmed.startsWith('product-images/')) {
      return trimmed.slice('product-images/'.length);
    }
    return trimmed;
  }

  try {
    const url = new URL(trimmed);
    const match = url.pathname.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/);
    if (match) {
      return decodeURIComponent(match[2]);
    }
  } catch {
    /* ignore malformed URL */
  }

  return trimmed;
}

export function toPublicPhoneImageUrl(storagePath: string): string {
  if (!storagePath?.trim()) return PLACEHOLDER;
  if (storagePath.startsWith('http://') || storagePath.startsWith('https://')) {
    return storagePath;
  }

  const key = normalizePhoneStoragePath(storagePath);
  if (!key) return PLACEHOLDER;

  const { data } = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(key);
  return data.publicUrl || PLACEHOLDER;
}

export { PLACEHOLDER as PHONE_IMAGE_PLACEHOLDER };
