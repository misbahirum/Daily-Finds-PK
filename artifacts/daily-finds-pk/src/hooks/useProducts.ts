import { useState, useEffect } from 'react';
import { Product } from '../types/product';

// v2: bumped to clear any legacy mock/seed data from v1
const STORAGE_KEY = 'daily-finds-pk-products-v2';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setProducts(parsed);
        } else {
          // Corrupt data — start fresh
          localStorage.removeItem(STORAGE_KEY);
        }
      } catch {
        // Invalid JSON — start fresh
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const addProduct = (product: Omit<Product, 'id' | 'createdAt'>) => {
    const newProduct: Product = {
      ...product,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    const updated = [newProduct, ...products];
    setProducts(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    const updated = products.map(p => (p.id === id ? { ...p, ...updates } : p));
    setProducts(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const deleteProduct = (id: string) => {
    const updated = products.filter(p => p.id !== id);
    setProducts(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  return {
    products,
    isLoading,
    addProduct,
    updateProduct,
    deleteProduct,
  };
}
