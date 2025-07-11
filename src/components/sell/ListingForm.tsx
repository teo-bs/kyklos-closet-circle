
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Euro } from 'lucide-react';

const listingSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title too long'),
  price: z.number().min(1, 'Price must be at least €1').max(1000, 'Price too high'),
  category: z.string().min(1, 'Please select a category'),
  size: z.string().min(1, 'Please select a size'),
});

export type ListingFormData = z.infer<typeof listingSchema>;

interface ListingFormProps {
  onSubmit: (data: ListingFormData) => Promise<void>;
  isSubmitting?: boolean;
}

const categories = [
  'Tops & T-Shirts',
  'Dresses',
  'Jeans & Trousers',
  'Skirts & Shorts',
  'Jackets & Coats',
  'Shoes',
  'Bags & Accessories',
  'Activewear',
  'Lingerie & Sleepwear',
  'Other'
];

const sizes = [
  'XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL',
  '34', '36', '38', '40', '42', '44', '46', '48',
  'One Size'
];

export const ListingForm: React.FC<ListingFormProps> = ({ onSubmit, isSubmitting = false }) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid }
  } = useForm<ListingFormData>({
    resolver: zodResolver(listingSchema),
    mode: 'onChange'
  });

  const watchedCategory = watch('category');
  const watchedSize = watch('size');

  const handleFormSubmit = async (data: ListingFormData) => {
    await onSubmit(data);
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Item Details</h2>
      
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        {/* Title */}
        <div>
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            {...register('title')}
            placeholder="e.g., Vintage Denim Jacket"
            className={errors.title ? 'border-red-500' : ''}
          />
          {errors.title && (
            <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
          )}
        </div>

        {/* Price */}
        <div>
          <Label htmlFor="price">Price (€) *</Label>
          <div className="relative">
            <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="price"
              type="number"
              step="0.01"
              min="1"
              max="1000"
              {...register('price', { valueAsNumber: true })}
              placeholder="25.00"
              className={`pl-10 ${errors.price ? 'border-red-500' : ''}`}
            />
          </div>
          {errors.price && (
            <p className="text-sm text-red-500 mt-1">{errors.price.message}</p>
          )}
        </div>

        {/* Category */}
        <div>
          <Label htmlFor="category">Category *</Label>
          <Select
            onValueChange={(value) => setValue('category', value, { shouldValidate: true })}
            value={watchedCategory}
          >
            <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category && (
            <p className="text-sm text-red-500 mt-1">{errors.category.message}</p>
          )}
        </div>

        {/* Size */}
        <div>
          <Label htmlFor="size">Size *</Label>
          <Select
            onValueChange={(value) => setValue('size', value, { shouldValidate: true })}
            value={watchedSize}
          >
            <SelectTrigger className={errors.size ? 'border-red-500' : ''}>
              <SelectValue placeholder="Select size" />
            </SelectTrigger>
            <SelectContent>
              {sizes.map((size) => (
                <SelectItem key={size} value={size}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.size && (
            <p className="text-sm text-red-500 mt-1">{errors.size.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={!isValid || isSubmitting}
          className="w-full bg-[#715AFF] hover:bg-[#715AFF]/90 text-white mt-6"
          size="lg"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating Listing...
            </>
          ) : (
            'Create Listing'
          )}
        </Button>
      </form>
    </div>
  );
};
