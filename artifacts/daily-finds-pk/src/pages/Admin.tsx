import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, Plus, Package, Tags, Sparkles, MousePointerClick, Star, TrendingUp, Clock } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import { ProductTable } from '../components/admin/ProductTable';
import { ProductForm, ProductPrefill } from '../components/admin/ProductForm';
import { ImportProductModal, ImportedProductData } from '../components/admin/ImportProductModal';
import { Product, CATEGORIES } from '../types/product';

interface Stats {
  totalProducts: number;
  totalClicks: number;
  featuredCount: number;
  categoriesCount: number;
  mostClicked: Product | null;
  latestProduct: Product | null;
}

function useStats(refreshKey: number) {
  const [stats, setStats] = useState<Stats | null>(null);
  useEffect(() => {
    fetch('/api/stats')
      .then(r => r.json())
      .then(setStats)
      .catch(() => {});
  }, [refreshKey]);
  return stats;
}

export function Admin() {
  const { products, isLoading, addProduct, updateProduct, deleteProduct, refetch } = useProducts();
  const [refreshKey, setRefreshKey] = useState(0);
  const stats = useStats(refreshKey);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [prefillData, setPrefillData] = useState<ProductPrefill | null>(null);

  const refresh = () => setRefreshKey(k => k + 1);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setPrefillData(null);
    setIsFormOpen(true);
  };

  const handleOpenImport = () => setIsImportOpen(true);

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

  const handleSave = async (data: Omit<Product, 'id' | 'createdAt' | 'clickCount'>) => {
    if (editingProduct) {
      await updateProduct(editingProduct.id, data as Partial<Product>);
    } else {
      await addProduct(data);
    }
    refresh();
  };

  const handleDelete = async (id: string) => {
    await deleteProduct(id);
    refresh();
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', minimumFractionDigits: 0, maximumFractionDigits: 0 })
      .format(price).replace('PKR', 'Rs.');

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
            <button
              onClick={handleOpenImport}
              className="flex items-center gap-2 border border-primary text-primary px-3 py-2 rounded-lg font-medium text-sm hover:bg-primary/5 transition-colors"
            >
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">Import from URL</span>
            </button>
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
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {/* Total Products */}
          <div className="bg-card border border-border p-5 rounded-2xl flex items-center gap-4 shadow-sm">
            <div className="p-3 bg-primary/10 text-primary rounded-xl flex-shrink-0">
              <Package className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground truncate">Total Products</p>
              <p className="text-2xl font-bold text-foreground">{isLoading ? '-' : products.length}</p>
            </div>
          </div>

          {/* Featured */}
          <div className="bg-card border border-border p-5 rounded-2xl flex items-center gap-4 shadow-sm">
            <div className="p-3 bg-primary/10 text-primary rounded-xl flex-shrink-0">
              <Star className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground truncate">Featured</p>
              <p className="text-2xl font-bold text-foreground">{stats?.featuredCount ?? '-'}</p>
            </div>
          </div>

          {/* Categories */}
          <div className="bg-card border border-border p-5 rounded-2xl flex items-center gap-4 shadow-sm">
            <div className="p-3 bg-accent/10 text-accent rounded-xl flex-shrink-0">
              <Tags className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground truncate">Categories</p>
              <p className="text-2xl font-bold text-foreground">
                {isLoading ? '-' : `${new Set(products.map(p => p.category)).size}/${CATEGORIES.length}`}
              </p>
            </div>
          </div>

          {/* Total Clicks */}
          <div className="bg-card border border-border p-5 rounded-2xl flex items-center gap-4 shadow-sm">
            <div className="p-3 bg-primary/10 text-primary rounded-xl flex-shrink-0">
              <MousePointerClick className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground truncate">Total Clicks</p>
              <p className="text-2xl font-bold text-foreground">{stats?.totalClicks ?? '-'}</p>
            </div>
          </div>

          {/* Most Clicked */}
          <div className="bg-card border border-border p-5 rounded-2xl flex items-center gap-4 shadow-sm">
            <div className="p-3 bg-muted text-muted-foreground rounded-xl flex-shrink-0">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground truncate">Most Clicked</p>
              {stats?.mostClicked ? (
                <div>
                  <p className="text-sm font-bold text-foreground line-clamp-1">{stats.mostClicked.name}</p>
                  <p className="text-xs text-muted-foreground">{stats.mostClicked.clickCount} clicks</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">-</p>
              )}
            </div>
          </div>

          {/* Latest Product */}
          <div className="bg-card border border-border p-5 rounded-2xl flex items-center gap-4 shadow-sm">
            <div className="p-3 bg-muted text-muted-foreground rounded-xl flex-shrink-0">
              <Clock className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground truncate">Latest Product</p>
              {stats?.latestProduct ? (
                <div>
                  <p className="text-sm font-bold text-foreground line-clamp-1">{stats.latestProduct.name}</p>
                  <p className="text-xs text-muted-foreground">{formatPrice(stats.latestProduct.price)}</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">-</p>
              )}
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
            <ProductTable products={products} onEdit={handleOpenEdit} onDelete={handleDelete} />
          )}
        </div>
      </main>

      {isImportOpen && (
        <ImportProductModal onClose={() => setIsImportOpen(false)} onImported={handleImported} />
      )}

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
