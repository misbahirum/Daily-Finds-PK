import React, { useState } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, Plus, Package, Tags } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import { ProductTable } from '../components/admin/ProductTable';
import { ProductForm } from '../components/admin/ProductForm';
import { Product } from '../types/product';
import { CATEGORIES } from '../types/product';
import { ThemeProvider } from '../components/ThemeProvider';
import { Toaster } from 'sonner';

export function Admin() {
  const { products, isLoading, addProduct, updateProduct, deleteProduct } = useProducts();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleSave = (data: Omit<Product, 'id' | 'createdAt'>) => {
    if (editingProduct) {
      updateProduct(editingProduct.id, data);
    } else {
      addProduct(data);
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans flex flex-col">
      {/* Admin Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border shadow-sm">
        <div className="container max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" data-testid="link-back-home">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-xl font-bold text-foreground">Admin Panel</h1>
          </div>
          
          <button 
            onClick={handleOpenAdd}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-sm"
            data-testid="button-add-product"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Product</span>
          </button>
        </div>
      </header>

      <main className="flex-1 container max-w-6xl mx-auto px-4 py-8">
        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-card border border-border p-6 rounded-2xl flex items-center gap-4 shadow-sm">
            <div className="p-4 bg-primary/10 text-primary rounded-xl">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Products</p>
              <p className="text-2xl font-bold text-foreground">{isLoading ? '-' : products.length}</p>
            </div>
          </div>
          
          <div className="bg-card border border-border p-6 rounded-2xl flex items-center gap-4 shadow-sm">
            <div className="p-4 bg-accent/10 text-accent rounded-xl">
              <Tags className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Categories Active</p>
              <p className="text-2xl font-bold text-foreground">
                {isLoading ? '-' : new Set(products.map(p => p.category)).size} / {CATEGORIES.length}
              </p>
            </div>
          </div>
        </div>

        {/* Product List */}
        <div>
          <h2 className="text-lg font-bold text-foreground mb-4">Manage Inventory</h2>
          {isLoading ? (
            <div className="h-64 flex items-center justify-center bg-card border border-border rounded-xl">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <ProductTable 
              products={products} 
              onEdit={handleOpenEdit} 
              onDelete={deleteProduct} 
            />
          )}
        </div>
      </main>

      {/* Form Modal */}
      {isFormOpen && (
        <ProductForm 
          product={editingProduct} 
          onSave={handleSave} 
          onClose={() => setIsFormOpen(false)} 
        />
      )}
    </div>
  );
}
