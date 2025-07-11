
import { useParams } from "react-router-dom";
import { ArrowLeft, Heart, Share2, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { VideoPlayer } from "@/components/feed/VideoPlayer";
import { useListingDetail } from "@/hooks/useListingDetail";
import { useListingLikes } from "@/hooks/useListingLikes";
import { useStripeCheckout } from "@/hooks/useStripeCheckout";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";

const ListingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(true);

  const { data: listing, isLoading, error } = useListingDetail(id!);
  const { isLiked, likesCount, toggleLike, isToggling } = useListingLikes(id!);
  const stripeCheckout = useStripeCheckout();

  if (!id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Invalid listing ID</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#715AFF]"></div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Listing not found</h2>
          <p className="text-gray-600 mb-4">This listing may have been removed or doesn't exist.</p>
          <Button onClick={() => navigate('/feed')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Feed
          </Button>
        </div>
      </div>
    );
  }

  const formatPrice = (priceInCents: number) => {
    return `€${(priceInCents / 100).toFixed(2)}`;
  };

  const handleBuyNow = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to purchase items",
        variant: "destructive"
      });
      return;
    }

    if (listing.user_id === user.id) {
      toast({
        title: "Cannot purchase",
        description: "You cannot buy your own listing",
        variant: "destructive"
      });
      return;
    }

    stripeCheckout.mutate({
      listingId: listing.id,
      amount: listing.price,
      title: listing.title,
    });
  };

  const handleShare = async () => {
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: listing.title,
          text: `Check out this ${listing.category} for ${formatPrice(listing.price)}`,
          url: url,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(url);
        toast({
          title: "Link copied!",
          description: "The listing link has been copied to your clipboard",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to copy link",
          variant: "destructive"
        });
      }
    }
  };

  const isOwner = user?.id === listing.user_id;
  const isSold = listing.status === 'sold';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b px-4 py-3">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/feed')}
            className="p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-semibold text-lg">Item Details</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="p-2"
          >
            <Share2 className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Video Section */}
        <Card className="overflow-hidden">
          <div className="relative aspect-[3/4] bg-black">
            <VideoPlayer
              src={listing.video_url}
              thumbnail={listing.thumb_url}
              isVisible={isVisible}
              className="w-full h-full"
            />
            
            {/* Status Badge */}
            {isSold && (
              <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                SOLD
              </div>
            )}

            {/* Like Button */}
            <Button
              size="sm"
              variant="ghost"
              className={`absolute top-4 right-4 p-2 rounded-full bg-white/80 hover:bg-white/90 ${
                isLiked ? 'text-red-500' : 'text-gray-600'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                toggleLike();
              }}
              disabled={isToggling}
            >
              <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
            </Button>

            {/* Likes Count */}
            {likesCount > 0 && (
              <div className="absolute bottom-4 left-4 bg-black/60 text-white text-sm px-2 py-1 rounded-full">
                {likesCount} {likesCount === 1 ? 'like' : 'likes'}
              </div>
            )}
          </div>
        </Card>

        {/* Item Details */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">{listing.title}</h2>
              <div className="text-3xl font-bold text-[#715AFF] mb-4">
                {formatPrice(listing.price)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Category:</span>
                <p className="font-medium">{listing.category}</p>
              </div>
              <div>
                <span className="text-gray-500">Size:</span>
                <p className="font-medium">{listing.size}</p>
              </div>
            </div>

            {/* Seller Info */}
            <div className="border-t pt-4">
              <div className="flex items-center space-x-3 mb-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="" />
                  <AvatarFallback>
                    <User className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">
                    {listing.profiles?.email?.split('@')[0] || 'Anonymous'}
                  </p>
                  <p className="text-sm text-gray-500">Seller</p>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="border-t pt-4">
              {isOwner ? (
                <Button disabled className="w-full" variant="outline">
                  Your Listing
                </Button>
              ) : (
                <Button
                  onClick={handleBuyNow}
                  disabled={isSold || stripeCheckout.isPending}
                  className="w-full bg-[#715AFF] hover:bg-[#715AFF]/90 text-white"
                  size="lg"
                >
                  {stripeCheckout.isPending ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Processing...</span>
                    </div>
                  ) : isSold ? (
                    'Sold Out'
                  ) : (
                    `Buy Now - ${formatPrice(listing.price)}`
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ListingDetail;
