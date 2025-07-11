
import { useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

export interface FeedFilters {
  search: string;
  category: string;
  minPrice: number | null;
  maxPrice: number | null;
}

const LISTINGS_PER_PAGE = 20;

export const useFeedListings = (filters: FeedFilters) => {
  return useInfiniteQuery({
    queryKey: ['feed-listings', filters],
    queryFn: async ({ pageParam = 0 }) => {
      console.log('Fetching listings with filters:', filters, 'pageParam:', pageParam);
      
      let query = supabase
        .from('listings')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .range(pageParam * LISTINGS_PER_PAGE, (pageParam + 1) * LISTINGS_PER_PAGE - 1);

      // Apply search filter
      if (filters.search.trim()) {
        query = query.ilike('title', `%${filters.search.trim()}%`);
      }

      // Apply category filter
      if (filters.category && filters.category !== 'all') {
        query = query.eq('category', filters.category);
      }

      // Apply price filters
      if (filters.minPrice !== null) {
        query = query.gte('price', filters.minPrice * 100); // Convert to cents
      }
      if (filters.maxPrice !== null) {
        query = query.lte('price', filters.maxPrice * 100); // Convert to cents
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching listings:', error);
        throw error;
      }

      console.log('Fetched listings:', data?.length || 0);
      return data || [];
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < LISTINGS_PER_PAGE) {
        return undefined; // No more pages
      }
      return allPages.length; // Next page number
    },
    initialPageParam: 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
