import React from 'react';
import { CATEGORIES, Category } from '../types/product';
import { motion } from 'framer-motion';

interface CategoryFilterProps {
  activeCategory: Category | 'All';
  onSelect: (cat: Category | 'All') => void;
}

export function CategoryFilter({ activeCategory, onSelect }: CategoryFilterProps) {
  return (
    <div className="w-full overflow-x-auto pb-4 mb-6 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
      <div className="flex sm:flex-wrap gap-2 min-w-max sm:min-w-0 justify-start sm:justify-center">
        <FilterButton 
          active={activeCategory === 'All'} 
          onClick={() => onSelect('All')}
        >
          All Finds
        </FilterButton>
        {CATEGORIES.map((cat) => (
          <FilterButton 
            key={cat} 
            active={activeCategory === cat} 
            onClick={() => onSelect(cat)}
          >
            {cat}
          </FilterButton>
        ))}
      </div>
    </div>
  );
}

function FilterButton({ active, onClick, children }: { active: boolean, onClick: () => void, children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`relative px-4 py-2 text-sm font-medium rounded-full transition-colors whitespace-nowrap ${
        active 
          ? 'text-primary-foreground' 
          : 'text-muted-foreground bg-card hover:bg-muted hover:text-foreground border border-border'
      }`}
      data-testid={`filter-${children?.toString().replace(/\s+/g, '-').toLowerCase()}`}
    >
      {active && (
        <motion.div
          layoutId="activeFilterBubble"
          className="absolute inset-0 bg-primary rounded-full -z-10"
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
      {children}
    </button>
  );
}
