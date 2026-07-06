import React from 'react';
import { Product } from '../types/product';
import { ProductCard } from './ProductCard';
import { PackageX } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProductGridProps {
  products: Product[];
}

export function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-center">
        <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mb-4">
          <PackageX className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-bold text-foreground">No products found</h3>
        <p className="text-muted-foreground mt-2 max-w-sm">
          We couldn't find any deals matching your criteria right now. Check back later!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
      {products.map((product, idx) => (
        <ProductCard key={product.id} product={product} index={idx} />
      ))}
    </div>
  );
}
