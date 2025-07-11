
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

export const useListingDetail = (listingId: string) => {
  return useQuery({
    queryKey: ['listing-detail', listingId],
    queryFn: async () => {
      console.log('Fetching listing details for ID:', listingId);
      
      const { data, error } = await supabase
        .from('listings')
        .select(`
          *,
          profiles!listings_user_id_fkey (
            email
          )
        `)
        .eq('id', listingId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching listing details:', error);
        throw error;
      }

      if (!data) {
        throw new Error('Listing not found');
      }

      console.log('Listing details fetched:', data);
      return data;
    },
    enabled: !!listingId,
  });
};
