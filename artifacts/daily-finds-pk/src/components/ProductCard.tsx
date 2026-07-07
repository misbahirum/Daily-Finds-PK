import React from 'react';
import { Product, BADGE_CONFIG } from '../types/product';
import { ExternalLink, ImageOff } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProductCardProps {
  product: Product;
  index: number;
}

export function ProductCard({ product, index }: ProductCardProps) {
  const [imgError, setImgError] = React.useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price).replace('PKR', 'Rs.');
  };

  const handleBuyClick = () => {
    // Fire-and-forget click tracking
    fetch(`/api/products/${product.id}/click`, { method: 'POST' }).catch(() => {});
  };

  const badgeCfg = product.badge ? BADGE_CONFIG[product.badge] : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.07, 0.5) }}
      className="group flex flex-col bg-card rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
      data-testid={`card-product-${product.id}`}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        {badgeCfg && (
          <div className={`absolute top-3 left-3 z-10 px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-full shadow-sm ${badgeCfg.className}`}>
            {badgeCfg.emoji} {badgeCfg.label}
          </div>
        )}
        {imgError || !product.imageUrl ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-muted-foreground bg-muted">
            <ImageOff className="h-10 w-10 opacity-40" />
            <span className="text-xs font-medium opacity-60">No Image Available</span>
          </div>
        ) : (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4">
        <div className="text-xs font-semibold text-accent uppercase tracking-wide mb-1">
          {product.category}
        </div>
        <h3 className="text-sm font-bold text-foreground leading-tight line-clamp-2 mb-2 group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        {product.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-3 flex-1">
            {product.description}
          </p>
        )}

        <div className="mt-auto">
          <div className="text-lg font-bold text-primary mb-3">
            {formatPrice(product.price)}
          </div>

          <a
            href={product.affiliateLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleBuyClick}
            className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2.5 px-4 rounded-xl transition-colors text-sm"
            data-testid={`link-buy-${product.id}`}
          >
            <span>Buy on Daraz</span>
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>
    </motion.div>
  );
}
