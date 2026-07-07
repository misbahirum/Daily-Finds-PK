import React, { useState } from 'react';
import { Product, Category, Badge, CATEGORIES, BADGES, BADGE_CONFIG } from '../../types/product';
import { X, Sparkles, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';

const productSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  price: z.coerce.number().min(1, "Price must be greater than 0"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.enum(CATEGORIES as [string, ...string[]]),
  badge: z.enum(BADGES.filter(Boolean) as [string, ...string[]]).nullable().optional(),
  affiliateLink: z.string().url("Must be a valid URL"),
  imageUrl: z.string().url("Must be a valid URL"),
});

type FormValues = z.infer<typeof productSchema>;

export type ProductPrefill = {
  name?: string | null;
  price?: number | null;
  description?: string | null;
  imageUrl?: string | null;
  category?: string | null;
  affiliateLink?: string | null;
};

interface ProductFormProps {
  product?: Product | null;
  prefill?: ProductPrefill | null;
  onSave: (data: Omit<Product, 'id' | 'createdAt' | 'clickCount'>) => Promise<void>;
  onClose: () => void;
}

export function ProductForm({ product, prefill, onSave, onClose }: ProductFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [imgError, setImgError] = useState(false);
  const isImported = !product && !!prefill;

  const normalizeCategory = (cat?: string | null): Category => {
    if (!cat) return 'Home Decor';
    return (CATEGORIES as string[]).includes(cat) ? (cat as Category) : 'Home Decor';
  };

  const { register, handleSubmit, formState: { errors }, watch } = useForm<FormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: product
      ? {
          name: product.name,
          price: product.price,
          description: product.description,
          category: product.category,
          badge: product.badge,
          affiliateLink: product.affiliateLink,
          imageUrl: product.imageUrl,
        }
      : prefill
      ? {
          name: prefill.name ?? '',
          price: prefill.price ?? 0,
          description: prefill.description ?? '',
          category: normalizeCategory(prefill.category),
          badge: null,
          affiliateLink: prefill.affiliateLink ?? '',
          imageUrl: prefill.imageUrl ?? '',
        }
      : {
          name: '',
          price: 0,
          description: '',
          category: 'Home Decor',
          badge: null,
          affiliateLink: '',
          imageUrl: '',
        },
  });

  const previewImageUrl = watch('imageUrl');

  const onSubmit = async (data: FormValues) => {
    setIsSaving(true);
    try {
      await onSave(data as Omit<Product, 'id' | 'createdAt' | 'clickCount'>);
      toast.success(product ? 'Product updated successfully' : 'Product added successfully');
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save product. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-card w-full max-w-2xl rounded-2xl shadow-xl border border-border flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-bold text-foreground">{product ? 'Edit Product' : 'Add New Product'}</h2>
            {isImported && (
              <div className="flex items-center gap-1.5 mt-1">
                <Sparkles className="h-3 w-3 text-primary" />
                <span className="text-xs text-primary font-medium">Pre-filled from import — review and save</span>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground disabled:opacity-40"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 overflow-y-auto flex-1 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Title</label>
              <input
                {...register('name')}
                disabled={isSaving}
                className="w-full p-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all disabled:opacity-50"
                placeholder="e.g. Fluted Glass Set"
              />
              {errors.name && <p className="text-destructive text-xs">{errors.name.message}</p>}
            </div>

            {/* Price */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Price (PKR)</label>
              <input
                type="number"
                {...register('price')}
                disabled={isSaving}
                className="w-full p-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all disabled:opacity-50"
                placeholder="e.g. 1500"
              />
              {errors.price && <p className="text-destructive text-xs">{errors.price.message}</p>}
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Category</label>
              <select
                {...register('category')}
                disabled={isSaving}
                className="w-full p-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all disabled:opacity-50"
              >
                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              {errors.category && <p className="text-destructive text-xs">{errors.category.message}</p>}
            </div>

            {/* Badge */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Badge</label>
              <select
                {...register('badge')}
                disabled={isSaving}
                className="w-full p-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all disabled:opacity-50"
              >
                <option value="">None</option>
                {(BADGES.filter(Boolean) as NonNullable<Badge>[]).map(badge => (
                  <option key={badge} value={badge}>
                    {BADGE_CONFIG[badge].emoji} {badge}
                  </option>
                ))}
              </select>
            </div>

            {/* Affiliate Link */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-foreground">Affiliate Link</label>
              <input
                {...register('affiliateLink')}
                disabled={isSaving}
                className="w-full p-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all disabled:opacity-50"
                placeholder="https://daraz.pk/..."
              />
              {errors.affiliateLink && <p className="text-destructive text-xs">{errors.affiliateLink.message}</p>}
            </div>

            {/* Image URL */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-foreground">Image URL</label>
              <input
                {...register('imageUrl')}
                disabled={isSaving}
                className="w-full p-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all disabled:opacity-50"
                placeholder="https://..."
              />
              {errors.imageUrl && <p className="text-destructive text-xs">{errors.imageUrl.message}</p>}
              {previewImageUrl && !errors.imageUrl && (
                <div className="mt-2 h-32 w-32 rounded-xl overflow-hidden border border-border bg-muted flex items-center justify-center">
                  {imgError ? (
                    <span className="text-xs text-muted-foreground text-center px-2">No Image Available</span>
                  ) : (
                    <img
                      src={previewImageUrl}
                      alt="Preview"
                      className="h-full w-full object-cover"
                      onError={() => setImgError(true)}
                      onLoad={() => setImgError(false)}
                    />
                  )}
                </div>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-foreground">Description</label>
              <textarea
                {...register('description')}
                disabled={isSaving}
                rows={3}
                className="w-full p-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none disabled:opacity-50"
                placeholder="Product details..."
              />
              {errors.description && <p className="text-destructive text-xs">{errors.description.message}</p>}
            </div>
          </div>

          <div className="flex gap-4 justify-end pt-4 border-t border-border mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl font-medium text-muted-foreground hover:bg-muted transition-colors disabled:opacity-40"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                product ? 'Save Changes' : 'Add Product'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
