import React from 'react';
import { Home, Coffee, Armchair, Monitor, Sparkles, Smartphone } from 'lucide-react';
import { Category, Product } from '../types/product';

interface CategorySectionProps {
  products: Product[];
  onSelectCategory: (cat: Category) => void;
}

export function CategorySection({ products, onSelectCategory }: CategorySectionProps) {
  const getIcon = (cat: Category) => {
    switch (cat) {
      case 'Home Decor': return <Home className="h-6 w-6" />;
      case 'Kitchen Gadgets': return <Coffee className="h-6 w-6" />;
      case 'Furniture': return <Armchair className="h-6 w-6" />;
      case 'Office Setup': return <Monitor className="h-6 w-6" />;
      case 'Beauty': return <Sparkles className="h-6 w-6" />;
      case 'Electronics': return <Smartphone className="h-6 w-6" />;
    }
  };

  const categories: { name: Category; count: number }[] = [
    'Home Decor',
    'Kitchen Gadgets',
    'Furniture',
    'Office Setup',
    'Beauty',
    'Electronics'
  ].map(name => ({
    name: name as Category,
    count: products.filter(p => p.category === name).length
  }));

  return (
    <section className="py-12 mt-8 border-t border-border">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-foreground">Shop by Category</h2>
        <p className="text-muted-foreground mt-2">Find exactly what you're looking for</p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {categories.map(cat => (
          <button
            key={cat.name}
            onClick={() => onSelectCategory(cat.name)}
            className="flex flex-col items-center justify-center p-6 bg-card border border-border rounded-2xl hover:border-primary hover:shadow-md transition-all group"
            data-testid={`cat-card-${cat.name.replace(/\s+/g, '-').toLowerCase()}`}
          >
            <div className="p-4 bg-muted rounded-full text-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors mb-3">
              {getIcon(cat.name)}
            </div>
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors text-center">{cat.name}</h3>
            <span className="text-xs text-muted-foreground mt-1">{cat.count} {cat.count === 1 ? 'deal' : 'deals'}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
