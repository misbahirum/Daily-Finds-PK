import React from 'react';
import { Product } from '../types/product';
import { ExternalLink, Copy, Check, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface ProductCardProps {
  product: Product;
  index: number;
}

export function ProductCard({ product, index }: ProductCardProps) {
  const [copied, setCopied] = React.useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price).replace('PKR', 'Rs.');
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(product.affiliateLink);
    setCopied(true);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const text = `Check out this deal on Daily Finds PK: ${product.name} for ${formatPrice(product.price)}! ${product.affiliateLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const getBadgeColor = (badge: string | null) => {
    switch (badge) {
      case 'Best Seller': return 'bg-accent text-accent-foreground';
      case 'Hot Deal': return 'bg-destructive text-destructive-foreground';
      case 'New Arrival': return 'bg-primary text-primary-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="group flex flex-col bg-card rounded-2xl overflow-hidden border border-border hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
      data-testid={`card-product-${product.id}`}
    >
      <div className="relative aspect-4/3 overflow-hidden bg-muted">
        {product.badge && (
          <div className={`absolute top-3 left-3 z-10 px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-full shadow-sm ${getBadgeColor(product.badge)}`}>
            {product.badge}
          </div>
        )}
        <img 
          src={product.imageUrl} 
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
      </div>
      
      <div className="flex flex-col flex-1 p-5">
        <div className="text-xs font-medium text-muted-foreground mb-1">{product.category}</div>
        <h3 className="text-base font-bold text-foreground leading-tight line-clamp-2 mb-2 group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
          {product.description}
        </p>
        
        <div className="flex items-center justify-between mb-5 mt-auto">
          <span className="text-xl font-bold text-primary">
            {formatPrice(product.price)}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <a
            href={product.affiliateLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2.5 px-4 rounded-xl transition-colors"
            data-testid={`link-shop-${product.id}`}
          >
            <span>Shop Now</span>
            <ExternalLink className="h-4 w-4" />
          </a>
          
          <button
            onClick={handleWhatsApp}
            className="flex-shrink-0 p-2.5 bg-green-500/10 text-green-600 hover:bg-green-500/20 dark:bg-green-500/20 dark:text-green-400 dark:hover:bg-green-500/30 rounded-xl transition-colors"
            aria-label="Share on WhatsApp"
            data-testid={`button-share-${product.id}`}
          >
            <MessageCircle className="h-5 w-5" />
          </button>
          
          <button
            onClick={handleCopy}
            className="flex-shrink-0 p-2.5 bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded-xl transition-colors"
            aria-label="Copy link"
            data-testid={`button-copy-${product.id}`}
          >
            {copied ? <Check className="h-5 w-5 text-primary" /> : <Copy className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
