import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import type { Product } from '@/contexts/CartContext';

type DbProduct = Tables<'products'>;

const mapDbProductToProduct = (product: DbProduct): Product => {
  const condition = product.condition === 'new' ? 'new' : 'used';

  return {
    id: product.id,
    name: product.name,
    price: product.price,
    image: product.image_url || '/placeholder.svg',
    brand: product.brand,
    condition,
    storage: 'N/A',
    color: 'N/A',
    description: product.description || '',
  };
};

export const useProducts = () => {
  return useQuery<Product[], Error>({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'available')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      if (!data) {
        return [];
      }

      return data.map(mapDbProductToProduct);
    },
  });
};

