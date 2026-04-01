import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import type { Product } from '@/contexts/CartContext';

type DbPhone = Tables<'phones'>;
type DbPhoneImage = Tables<'phone_images'>;

const IMAGE_BUCKET = 'phone-images';

const toPublicImageUrl = (storagePath: string) => {
  if (!storagePath) return '/placeholder.svg';
  if (storagePath.startsWith('http://') || storagePath.startsWith('https://')) return storagePath;
  return supabase.storage.from(IMAGE_BUCKET).getPublicUrl(storagePath).data.publicUrl || '/placeholder.svg';
};

const mapDbPhoneToProduct = (
  phone: DbPhone,
  images: Pick<DbPhoneImage, 'storage_path' | 'display_order' | 'is_primary'>[] | null | undefined
): Product => {
  const condition = phone.condition === 'new' ? 'new' : 'used';
  const sortedImages = (images || []).slice().sort((a, b) => {
    const aPrimary = a.is_primary ? 1 : 0;
    const bPrimary = b.is_primary ? 1 : 0;
    if (aPrimary !== bPrimary) return bPrimary - aPrimary;
    return (a.display_order ?? 0) - (b.display_order ?? 0);
  });
  const image = sortedImages[0]?.storage_path ? toPublicImageUrl(sortedImages[0].storage_path) : '/placeholder.svg';

  return {
    id: phone.id,
    name: phone.name,
    price: phone.price,
    image,
    brand: phone.brand,
    condition,
    storage: phone.storage,
    color: phone.color,
    description: phone.description || '',
  };
};

export const useProducts = () => {
  return useQuery<Product[], Error>({
    queryKey: ['phones'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('phones')
        .select('*, phone_images (storage_path, display_order, is_primary)')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      if (!data) {
        return [];
      }

      return (data as (DbPhone & { phone_images?: Pick<DbPhoneImage, 'storage_path' | 'display_order' | 'is_primary'>[] })[])
        .map((row) => mapDbPhoneToProduct(row, row.phone_images));
    },
  });
};

