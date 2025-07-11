
import React from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export interface FilterValues {
  search: string;
  category: string;
  minPrice: string;
  maxPrice: string;
}

interface FeedFiltersProps {
  filters: FilterValues;
  onFiltersChange: (filters: FilterValues) => void;
  showAdvanced: boolean;
  onToggleAdvanced: () => void;
}

const CATEGORIES = [
  { value: 'all', label: 'All Categories' },
  { value: 'Tops', label: 'Tops' },
  { value: 'Bottoms', label: 'Bottoms' },
  { value: 'Dresses', label: 'Dresses' },
  { value: 'Outerwear', label: 'Outerwear' },
  { value: 'Activewear', label: 'Activewear' },
  { value: 'Shoes', label: 'Shoes' },
  { value: 'Accessories', label: 'Accessories' },
];

export const FeedFilters: React.FC<FeedFiltersProps> = ({
  filters,
  onFiltersChange,
  showAdvanced,
  onToggleAdvanced,
}) => {
  const handleFilterChange = (key: keyof FilterValues, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-4 space-y-4">
        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search items..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Advanced filters toggle */}
        <div className="flex justify-between items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleAdvanced}
            className="gap-2"
          >
            <SlidersHorizontal className="h-4 w-4" />
            {showAdvanced ? 'Hide Filters' : 'Show Filters'}
          </Button>
        </div>

        {/* Advanced filters */}
        {showAdvanced && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
            {/* Category filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select
                value={filters.category}
                onValueChange={(value) => handleFilterChange('category', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Min price filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Min Price (€)</label>
              <Input
                type="number"
                placeholder="0"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                min="0"
                step="0.01"
              />
            </div>

            {/* Max price filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Max Price (€)</label>
              <Input
                type="number"
                placeholder="1000"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                min="0"
                step="0.01"
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
