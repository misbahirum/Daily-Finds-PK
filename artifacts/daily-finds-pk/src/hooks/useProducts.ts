import { useState, useEffect } from 'react';
import { Product } from '../types/product';

const STORAGE_KEY = 'daily-finds-pk-products';

const SEED_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Aesthetic Fluted Glass Cups Set',
    price: 1850,
    description: 'Set of 2 beautiful fluted glasses with bamboo lids and glass straws. Perfect for iced coffee.',
    category: 'Kitchen Gadgets',
    badge: 'Best Seller',
    affiliateLink: 'https://example.com/affiliate/1',
    imageUrl: 'https://images.unsplash.com/photo-1514178255089-603d3a35b24a?auto=format&fit=crop&q=80&w=800',
    createdAt: new Date(Date.now() - 10000).toISOString()
  },
  {
    id: '2',
    name: 'Minimalist Wooden Desk Organizer',
    price: 2400,
    description: 'Keep your workspace tidy with this elegant bamboo desk organizer.',
    category: 'Office Setup',
    badge: 'New Arrival',
    affiliateLink: 'https://example.com/affiliate/2',
    imageUrl: 'https://images.unsplash.com/photo-1592659762303-90081d34b277?auto=format&fit=crop&q=80&w=800',
    createdAt: new Date(Date.now() - 20000).toISOString()
  },
  {
    id: '3',
    name: 'Nordic Style Ceramic Vase',
    price: 3200,
    description: 'Matte white ceramic vase for pampas grass or fresh flowers. A beautiful centerpiece.',
    category: 'Home Decor',
    badge: 'Hot Deal',
    affiliateLink: 'https://example.com/affiliate/3',
    imageUrl: 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?auto=format&fit=crop&q=80&w=800',
    createdAt: new Date(Date.now() - 30000).toISOString()
  },
  {
    id: '4',
    name: 'Rechargeable Motion Sensor Light',
    price: 1499,
    description: 'Magnetic LED light bar for kitchen cabinets or wardrobes. No wiring required.',
    category: 'Home Decor',
    badge: 'Best Seller',
    affiliateLink: 'https://example.com/affiliate/4',
    imageUrl: 'https://images.unsplash.com/photo-1595859702816-628d08cb580c?auto=format&fit=crop&q=80&w=800',
    createdAt: new Date(Date.now() - 40000).toISOString()
  },
  {
    id: '5',
    name: 'Electric Milk Frother',
    price: 1100,
    description: 'Handheld battery-operated foam maker for lattes, matcha, and hot chocolate.',
    category: 'Kitchen Gadgets',
    badge: null,
    affiliateLink: 'https://example.com/affiliate/5',
    imageUrl: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&q=80&w=800',
    createdAt: new Date(Date.now() - 50000).toISOString()
  },
  {
    id: '6',
    name: 'Ergonomic Laptop Stand',
    price: 2850,
    description: 'Adjustable aluminum stand to improve your posture while working.',
    category: 'Office Setup',
    badge: 'Hot Deal',
    affiliateLink: 'https://example.com/affiliate/6',
    imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&q=80&w=800',
    createdAt: new Date(Date.now() - 60000).toISOString()
  },
  {
    id: '7',
    name: 'Ice Roller for Face & Eye Puffiness',
    price: 850,
    description: 'Silicone ice roller for morning skincare routine. Reduces swelling and wakes up skin.',
    category: 'Beauty',
    badge: 'New Arrival',
    affiliateLink: 'https://example.com/affiliate/7',
    imageUrl: 'https://images.unsplash.com/photo-1615397323145-66236b2b64d9?auto=format&fit=crop&q=80&w=800',
    createdAt: new Date(Date.now() - 70000).toISOString()
  },
  {
    id: '8',
    name: 'Modern Accent Chair',
    price: 14500,
    description: 'Comfortable plush single sofa chair for living room or bedroom corners.',
    category: 'Furniture',
    badge: null,
    affiliateLink: 'https://example.com/affiliate/8',
    imageUrl: 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?auto=format&fit=crop&q=80&w=800',
    createdAt: new Date(Date.now() - 80000).toISOString()
  },
  {
    id: '9',
    name: 'Wireless Bluetooth Earbuds',
    price: 4500,
    description: 'High-quality sound with noise cancellation and 24h battery life.',
    category: 'Electronics',
    badge: 'Best Seller',
    affiliateLink: 'https://example.com/affiliate/9',
    imageUrl: 'https://images.unsplash.com/photo-1572569533941-86fcab8a93ff?auto=format&fit=crop&q=80&w=800',
    createdAt: new Date(Date.now() - 90000).toISOString()
  },
];

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate network delay for realistic loading skeleton
    const timer = setTimeout(() => {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setProducts(parsed);
          } else {
            throw new Error('Invalid shape');
          }
        } catch {
          // Corrupt or legacy data — reset to seed
          localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_PRODUCTS));
          setProducts(SEED_PRODUCTS);
        }
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_PRODUCTS));
        setProducts(SEED_PRODUCTS);
      }
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const addProduct = (product: Omit<Product, 'id' | 'createdAt'>) => {
    const newProduct: Product = {
      ...product,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString()
    };
    const updated = [newProduct, ...products];
    setProducts(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    const updated = products.map(p => p.id === id ? { ...p, ...updates } : p);
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
    deleteProduct
  };
}
