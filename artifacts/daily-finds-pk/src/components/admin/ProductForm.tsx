import React from 'react';
import { Product, Category, Badge, CATEGORIES, BADGES } from '../../types/product';
import { X, Sparkles } from 'lucide-react';
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
  onSave: (data: Omit<Product, 'id' | 'createdAt'>) => void;
  onClose: () => void;
}

export function ProductForm({ product, prefill, onSave, onClose }: ProductFormProps) {
  const isImported = !product && !!prefill;

  // Map category string from import to valid Category, fallback to 'Home Decor'
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

  const onSubmit = (data: FormValues) => {
    onSave(data as Omit<Product, 'id' | 'createdAt'>);
    toast.success(product ? 'Product updated successfully' : 'Product added successfully');
    onClose();
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
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 overflow-y-auto flex-1 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Product Name</label>
              <input
                {...register('name')}
                className="w-full p-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                placeholder="e.g. Fluted Glass Set"
              />
              {errors.name && <p className="text-destructive text-xs">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Price (PKR)</label>
              <input
                type="number"
                {...register('price')}
                className="w-full p-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                placeholder="e.g. 1500"
              />
              {errors.price && <p className="text-destructive text-xs">{errors.price.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Category</label>
              <select
                {...register('category')}
                className="w-full p-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              >
                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              {errors.category && <p className="text-destructive text-xs">{errors.category.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Badge</label>
              <select
                {...register('badge')}
                className="w-full p-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              >
                <option value="">None</option>
                {BADGES.filter(Boolean).map(badge => <option key={badge} value={badge!}>{badge}</option>)}
              </select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-foreground">Affiliate Link URL</label>
              <input
                {...register('affiliateLink')}
                className="w-full p-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                placeholder="https://daraz.pk/..."
              />
              {errors.affiliateLink && <p className="text-destructive text-xs">{errors.affiliateLink.message}</p>}
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-foreground">Image URL</label>
              <input
                {...register('imageUrl')}
                className="w-full p-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                placeholder="https://images.unsplash.com/..."
              />
              {errors.imageUrl && <p className="text-destructive text-xs">{errors.imageUrl.message}</p>}
              
              {previewImageUrl && !errors.imageUrl && (
                <div className="mt-2 h-32 w-32 rounded-xl overflow-hidden border border-border bg-muted">
                  <img src={previewImageUrl} alt="Preview" className="h-full w-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                </div>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-foreground">Description</label>
              <textarea
                {...register('description')}
                rows={3}
                className="w-full p-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none"
                placeholder="Product details..."
              />
              {errors.description && <p className="text-destructive text-xs">{errors.description.message}</p>}
            </div>
          </div>
          
          <div className="flex gap-4 justify-end pt-4 border-t border-border mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl font-medium text-muted-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              {product ? 'Save Changes' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
