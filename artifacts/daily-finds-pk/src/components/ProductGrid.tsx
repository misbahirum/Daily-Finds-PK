import React from 'react';
import { Product } from '../types/product';
import { ProductCard } from './ProductCard';
import { PackageX } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  startIndex?: number;
}

export function ProductGrid({ products, startIndex = 0 }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-center">
        <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mb-4">
          <PackageX className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-bold text-foreground">No deals available yet.</h3>
        <p className="text-muted-foreground mt-2 max-w-sm">
          New affiliate products are coming soon.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
      {products.map((product, idx) => (
        <ProductCard key={product.id} product={product} index={startIndex + idx} />
      ))}
    </div>
  );
}
