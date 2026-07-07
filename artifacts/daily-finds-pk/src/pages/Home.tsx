import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { ScrollToTop } from '../components/ScrollToTop';
import { SearchBar } from '../components/SearchBar';
import { CategoryFilter } from '../components/CategoryFilter';
import { ProductGrid } from '../components/ProductGrid';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { useProducts } from '../hooks/useProducts';
import { Category, Badge, BADGE_CONFIG } from '../types/product';

interface SectionDef {
  badge: Badge;
  title: string;
  id: string;
}

const BADGE_SECTIONS: SectionDef[] = [
  { badge: 'Featured',    title: 'Featured Products',  id: 'sec-featured' },
  { badge: 'Top Pick',    title: 'Top Picks',          id: 'sec-toppick' },
  { badge: 'New Arrival', title: 'New Arrivals',       id: 'sec-new' },
  { badge: 'Sale',        title: 'Sale Deals',         id: 'sec-sale' },
];

export function Home() {
  const { products, isLoading } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category | 'All'>('All');

  const isFiltered = searchTerm.trim() !== '' || activeCategory !== 'All';

  const filteredProducts = useMemo(() => {
    if (!isFiltered) return products;
    return products.filter(p => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, activeCategory, isFiltered]);

  const badgeSections = useMemo(() =>
    BADGE_SECTIONS.map(sec => ({
      ...sec,
      products: products.filter(p => p.badge === sec.badge),
    })).filter(sec => sec.products.length > 0),
  [products]);

  const latestProducts = useMemo(() => [...products].slice(0, 12), [products]);

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Header />

      <main className="flex-1 container max-w-6xl mx-auto px-4 pt-10 pb-20">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <div className="inline-block mb-4 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold">
            Daily Curated Deals 🇵🇰
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-foreground tracking-tight mb-4 leading-tight">
            Daily Finds PK
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Best Home, Kitchen &amp; Lifestyle Deals in Pakistan
          </p>
          <button
            onClick={() => {
              document.getElementById('deals-section')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="bg-primary hover:bg-primary/90 text-primary-foreground text-base font-semibold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
          >
            Shop Today's Deals
          </button>
        </motion.div>

        {/* Search + Filter */}
        <div id="deals-section" className="scroll-mt-24 space-y-4 mb-10">
          <SearchBar value={searchTerm} onChange={setSearchTerm} />
          <CategoryFilter activeCategory={activeCategory} onSelect={setActiveCategory} />
        </div>

        {isLoading ? (
          <LoadingSkeleton />
        ) : isFiltered ? (
          /* Filtered flat grid */
          <div className="min-h-[400px]">
            <ProductGrid products={filteredProducts} />
          </div>
        ) : products.length === 0 ? (
          /* Global empty state */
          <ProductGrid products={[]} />
        ) : (
          /* Sections */
          <div className="space-y-14">
            {badgeSections.map((sec, sIdx) => {
              const cfg = BADGE_CONFIG[sec.badge as NonNullable<typeof sec.badge>];
              return (
                <section key={sec.id} id={sec.id}>
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-2xl">{cfg.emoji}</span>
                    <h2 className="text-xl font-bold text-foreground">{sec.title}</h2>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${cfg.className}`}>
                      {sec.products.length}
                    </span>
                  </div>
                  <ProductGrid products={sec.products} startIndex={sIdx * 4} />
                </section>
              );
            })}

            {/* Latest Products */}
            <section id="sec-latest">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl">🛍️</span>
                <h2 className="text-xl font-bold text-foreground">Latest Products</h2>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
                  {latestProducts.length}
                </span>
              </div>
              <ProductGrid products={latestProducts} startIndex={badgeSections.length * 4} />
            </section>
          </div>
        )}
      </main>

      <Footer />
      <ScrollToTop />
    </div>
  );
}
