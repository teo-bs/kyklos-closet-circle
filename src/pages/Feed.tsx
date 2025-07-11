
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFeedListings } from '@/hooks/useFeedListings';
import { useDebounce } from '@/hooks/useDebounce';
import { FeedFilters, type FilterValues } from '@/components/feed/FeedFilters';
import { ListingCard } from '@/components/feed/ListingCard';
import { InfiniteScroll } from '@/components/feed/InfiniteScroll';
import { VisibilityTracker } from '@/components/feed/VisibilityTracker';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const Feed = () => {
  const navigate = useNavigate();
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  // Filter state
  const [filterValues, setFilterValues] = useState<FilterValues>({
    search: '',
    category: 'all',
    minPrice: '',
    maxPrice: '',
  });

  // Debounced search to avoid too many API calls
  const debouncedSearch = useDebounce(filterValues.search, 300);

  // Convert filter values to the format expected by the query
  const processedFilters = useMemo(() => ({
    search: debouncedSearch,
    category: filterValues.category,
    minPrice: filterValues.minPrice ? parseFloat(filterValues.minPrice) : null,
    maxPrice: filterValues.maxPrice ? parseFloat(filterValues.maxPrice) : null,
  }), [debouncedSearch, filterValues.category, filterValues.minPrice, filterValues.maxPrice]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useFeedListings(processedFilters);

  const handleCardClick = (listingId: string) => {
    navigate(`/listing/${listingId}`);
  };

  // Flatten all pages into a single array
  const allListings = useMemo(() => {
    return data?.pages.flat() || [];
  }, [data]);

  console.log('Feed render - Total listings:', allListings.length);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2 text-gray-600">
          <Loader2 className="h-6 w-6 animate-spin" />
          Loading feed...
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen p-4">
        <Alert variant="destructive" className="max-w-md mx-auto mt-8">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error instanceof Error ? error.message : 'Failed to load listings'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-4">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Discover Style</h1>
          <p className="text-gray-600">Find pre-loved fashion from your campus</p>
        </div>

        {/* Filters */}
        <FeedFilters
          filters={filterValues}
          onFiltersChange={setFilterValues}
          showAdvanced={showAdvancedFilters}
          onToggleAdvanced={() => setShowAdvancedFilters(!showAdvancedFilters)}
        />

        {/* Results */}
        {allListings.length === 0 && !isLoading ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-2">No items found</div>
            <p className="text-gray-400">Try adjusting your search or filters</p>
          </div>
        ) : (
          <InfiniteScroll
            hasNextPage={hasNextPage || false}
            isFetchingNextPage={isFetchingNextPage}
            fetchNextPage={fetchNextPage}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {allListings.map((listing) => (
                <VisibilityTracker key={listing.id} threshold={0.3}>
                  {(isVisible) => (
                    <ListingCard
                      listing={listing}
                      isVisible={isVisible}
                      onCardClick={() => handleCardClick(listing.id)}
                    />
                  )}
                </VisibilityTracker>
              ))}
            </div>
          </InfiniteScroll>
        )}
      </div>
    </div>
  );
};

export default Feed;
