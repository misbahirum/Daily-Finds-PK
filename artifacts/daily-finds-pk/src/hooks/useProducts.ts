import { useState, useEffect, useCallback } from 'react';
import { Product } from '../types/product';

const API_BASE = '/api/products';

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as any).error ?? `Request failed: ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiFetch<Product[]>(API_BASE);
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const addProduct = async (product: Omit<Product, 'id' | 'createdAt' | 'clickCount'>) => {
    const newProduct = await apiFetch<Product>(API_BASE, {
      method: 'POST',
      body: JSON.stringify(product),
    });
    setProducts((prev) => [newProduct, ...prev]);
    return newProduct;
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    const updated = await apiFetch<Product>(`${API_BASE}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
    return updated;
  };

  const deleteProduct = async (id: string) => {
    await apiFetch<void>(`${API_BASE}/${id}`, { method: 'DELETE' });
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  return {
    products,
    isLoading,
    error,
    addProduct,
    updateProduct,
    deleteProduct,
    refetch: fetchProducts,
  };
}
