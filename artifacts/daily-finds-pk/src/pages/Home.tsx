import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { ScrollToTop } from '../components/ScrollToTop';
import { SearchBar } from '../components/SearchBar';
import { CategoryFilter } from '../components/CategoryFilter';
import { ProductGrid } from '../components/ProductGrid';
import { CategorySection } from '../components/CategorySection';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { useProducts } from '../hooks/useProducts';
import { Category } from '../types/product';

export function Home() {
  const { products, isLoading } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category | 'All'>('All');

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            p.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, activeCategory]);

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Header />
      
      <main className="flex-1 container max-w-6xl mx-auto px-4 pt-10 pb-20">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <div className="inline-block mb-4 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
            Daily Curated Deals 🇵🇰
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground tracking-tight mb-6 leading-tight">
            Best Home, Kitchen & Lifestyle Deals in Pakistan
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Handpicked products at affordable prices. We find the best aesthetics so you don't have to scroll for hours.
          </p>
          <button 
            onClick={() => {
              document.getElementById('deals-section')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="bg-accent hover:bg-accent/90 text-accent-foreground text-lg font-semibold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
          >
            Shop Today's Deals
          </button>
        </motion.div>

        {/* Filters and Search */}
        <div id="deals-section" className="scroll-mt-24 space-y-6 mb-8">
          <SearchBar value={searchTerm} onChange={setSearchTerm} />
          <CategoryFilter activeCategory={activeCategory} onSelect={setActiveCategory} />
        </div>

        {/* Product Grid */}
        <div className="min-h-[500px]">
          {isLoading ? (
            <LoadingSkeleton />
          ) : (
            <ProductGrid products={filteredProducts} />
          )}
        </div>

        {/* Categories Section */}
        {!isLoading && (
          <CategorySection 
            products={products} 
            onSelectCategory={(cat) => {
              setActiveCategory(cat);
              setSearchTerm('');
              document.getElementById('deals-section')?.scrollIntoView({ behavior: 'smooth' });
            }} 
          />
        )}
      </main>

      <Footer />
      <ScrollToTop />
    </div>
  );
}
