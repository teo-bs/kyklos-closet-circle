
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export const useListingLikes = (listingId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Query to check if current user liked this listing
  const { data: isLiked = false } = useQuery({
    queryKey: ['listing-like', listingId, user?.id],
    queryFn: async () => {
      if (!user) return false;
      
      const { data, error } = await supabase
        .from('likes')
        .select('id')
        .eq('listing_id', listingId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error checking like status:', error);
        return false;
      }

      return !!data;
    },
    enabled: !!user,
  });

  // Query to get total likes count for this listing
  const { data: likesCount = 0 } = useQuery({
    queryKey: ['listing-likes-count', listingId],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('listing_id', listingId);

      if (error) {
        console.error('Error fetching likes count:', error);
        return 0;
      }

      return count || 0;
    },
  });

  // Mutation to toggle like
  const toggleLikeMutation = useMutation({
    mutationFn: async () => {
      if (!user) {
        throw new Error('Must be logged in to like items');
      }

      if (isLiked) {
        // Unlike
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('listing_id', listingId)
          .eq('user_id', user.id);

        if (error) throw error;
        return false;
      } else {
        // Like
        const { error } = await supabase
          .from('likes')
          .insert({
            listing_id: listingId,
            user_id: user.id,
          });

        if (error) throw error;
        return true;
      }
    },
    onSuccess: (newLikeStatus) => {
      // Update the like status query
      queryClient.setQueryData(['listing-like', listingId, user?.id], newLikeStatus);
      
      // Update the likes count
      queryClient.setQueryData(['listing-likes-count', listingId], (oldCount: number) => 
        newLikeStatus ? oldCount + 1 : Math.max(0, oldCount - 1)
      );

      console.log(`${newLikeStatus ? 'Liked' : 'Unliked'} listing ${listingId}`);
    },
    onError: (error) => {
      console.error('Error toggling like:', error);
      toast({
        title: "Error",
        description: "Failed to update like status",
        variant: "destructive"
      });
    },
  });

  return {
    isLiked,
    likesCount,
    toggleLike: toggleLikeMutation.mutate,
    isToggling: toggleLikeMutation.isPending,
  };
};
