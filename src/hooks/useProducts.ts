import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Product } from '@/types/product';

export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Map database fields to Product type if necessary
      // e.g., is_new -> isNew
      return data.map((item: any) => ({
        ...item,
        isNew: item.is_new,
        isBestseller: item.is_bestseller,
        onSale: item.on_sale,
        salePrice: item.sale_price,
      })) as Product[];
    },
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return {
        ...data,
        isNew: data.is_new,
        isBestseller: data.is_bestseller,
        onSale: data.on_sale,
        salePrice: data.sale_price,
      } as Product;
    },
    enabled: !!id,
  });
};
