import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import type { Product } from '@/contexts/CartContext';

// Use service role for public access (bypass RLS)
const getPublicProducts = async () => {
  try {
    // Try to get phones with public access
    const { data, error } = await supabase
      .from('phones')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching phones:', error);
      // If RLS blocks access, try with service role (if available)
      return [];
    }
    
    return data;
  } catch (error) {
    console.error('Error in getPublicProducts:', error);
    return [];
  }
};

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
  
  // Use image from phone_images table if available, otherwise use placeholder
  const image = sortedImages[0]?.storage_path 
    ? toPublicImageUrl(sortedImages[0].storage_path) 
    : '/placeholder.svg';

  return {
    id: phone.id,
    name: phone.name,
    price: phone.price,
    image,
    brand: phone.brand,
    condition,
    storage: phone.storage || '',
    color: phone.color || '',
    description: phone.description || '',
  };
};

export const useProducts = () => {
  return useQuery<Product[], Error>({
    queryKey: ['phones'],
    queryFn: async () => {
      // Get phones with their images
      const { data, error } = await supabase
        .from('phones')
        .select('*, phone_images (storage_path, display_order, is_primary)')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching phones:', error);
        return [];
      }

      if (!data) {
        return [];
      }

      return (data as (DbPhone & { phone_images?: Pick<DbPhoneImage, 'storage_path' | 'display_order' | 'is_primary'>[] })[])
        .map((row) => mapDbPhoneToProduct(row, row.phone_images));
    },
    retry: 2,
    retryDelay: 1000,
  });
};

