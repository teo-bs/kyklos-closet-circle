
import React from 'react';
import { Heart } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';
import { VideoPlayer } from './VideoPlayer';
import { useListingLikes } from '@/hooks/useListingLikes';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface ListingCardProps {
  listing: Tables<'listings'>;
  isVisible: boolean;
  onCardClick: () => void;
}

export const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  isVisible,
  onCardClick,
}) => {
  const { isLiked, likesCount, toggleLike, isToggling } = useListingLikes(listing.id);

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    toggleLike();
  };

  const formatPrice = (priceInCents: number) => {
    return `€${(priceInCents / 100).toFixed(2)}`;
  };

  return (
    <Card 
      className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
      onClick={onCardClick}
    >
      <div className="relative aspect-[3/4]">
        <VideoPlayer
          src={listing.video_url}
          thumbnail={listing.thumb_url}
          isVisible={isVisible}
          className="w-full h-full"
        />
        
        {/* Like button overlay */}
        <Button
          size="sm"
          variant="ghost"
          className={`absolute top-2 right-2 p-2 rounded-full bg-white/80 hover:bg-white/90 ${
            isLiked ? 'text-red-500' : 'text-gray-600'
          }`}
          onClick={handleLikeClick}
          disabled={isToggling}
        >
          <Heart 
            className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`}
          />
        </Button>

        {/* Likes count overlay */}
        {likesCount > 0 && (
          <div className="absolute top-2 left-2 bg-black/60 text-white text-sm px-2 py-1 rounded-full">
            {likesCount} {likesCount === 1 ? 'like' : 'likes'}
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <div className="space-y-2">
          <h3 className="font-semibold text-lg line-clamp-2">{listing.title}</h3>
          <div className="flex justify-between items-center">
            <span className="text-2xl font-bold text-[#715AFF]">
              {formatPrice(listing.price)}
            </span>
            <div className="text-sm text-gray-500 space-y-1">
              <div>{listing.category}</div>
              <div>Size {listing.size}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
