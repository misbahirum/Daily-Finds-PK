import React, { useState } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, Plus, Package, Tags, Sparkles } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import { ProductTable } from '../components/admin/ProductTable';
import { ProductForm, ProductPrefill } from '../components/admin/ProductForm';
import { ImportProductModal, ImportedProductData } from '../components/admin/ImportProductModal';
import { Product } from '../types/product';
import { CATEGORIES } from '../types/product';

export function Admin() {
  const { products, isLoading, addProduct, updateProduct, deleteProduct } = useProducts();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [prefillData, setPrefillData] = useState<ProductPrefill | null>(null);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setPrefillData(null);
    setIsFormOpen(true);
  };

  const handleOpenImport = () => {
    setIsImportOpen(true);
  };

  const handleImported = (data: ImportedProductData) => {
    setIsImportOpen(false);
    setEditingProduct(null);
    setPrefillData({
      name: data.name,
      price: data.price,
      description: data.description,
      imageUrl: data.imageUrl,
      category: data.category,
      affiliateLink: data.affiliateLink,
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setPrefillData(null);
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
        <div className="container max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="p-2 -ml-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-xl font-bold text-foreground">Admin Panel</h1>
          </div>

          <div className="flex items-center gap-2">
            {/* Import Button */}
            <button
              onClick={handleOpenImport}
              className="flex items-center gap-2 border border-primary text-primary px-3 py-2 rounded-lg font-medium text-sm hover:bg-primary/5 transition-colors"
            >
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">Import from URL</span>
            </button>

            {/* Add Product Button */}
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors shadow-sm"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Product</span>
            </button>
          </div>
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
                {isLoading ? '-' : new Set(products.map((p) => p.category)).size} / {CATEGORIES.length}
              </p>
            </div>
          </div>
        </div>

        {/* Smart Import Banner */}
        <div
          onClick={handleOpenImport}
          className="mb-6 cursor-pointer group bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20 hover:border-primary/40 rounded-2xl p-5 flex items-center gap-4 transition-all hover:shadow-sm"
        >
          <div className="p-3 bg-primary/10 text-primary rounded-xl flex-shrink-0">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground text-sm">Smart Product Import</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Paste a Daraz or affiliate link — title, price, image, and category are extracted automatically.
            </p>
          </div>
          <span className="text-xs font-medium text-primary bg-primary/10 px-3 py-1.5 rounded-full flex-shrink-0 group-hover:bg-primary/20 transition-colors">
            Try it
          </span>
        </div>

        {/* Product List */}
        <div>
          <h2 className="text-lg font-bold text-foreground mb-4">Manage Inventory</h2>
          {isLoading ? (
            <div className="h-64 flex items-center justify-center bg-card border border-border rounded-xl">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <ProductTable products={products} onEdit={handleOpenEdit} onDelete={deleteProduct} />
          )}
        </div>
      </main>

      {/* Import Modal */}
      {isImportOpen && (
        <ImportProductModal onClose={() => setIsImportOpen(false)} onImported={handleImported} />
      )}

      {/* Add / Edit Form Modal */}
      {isFormOpen && (
        <ProductForm
          product={editingProduct}
          prefill={!editingProduct ? prefillData : null}
          onSave={handleSave}
          onClose={() => {
            setIsFormOpen(false);
            setEditingProduct(null);
            setPrefillData(null);
          }}
        />
      )}
    </div>
  );
}
