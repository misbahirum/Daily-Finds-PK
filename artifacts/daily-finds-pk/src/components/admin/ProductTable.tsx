import React, { useState } from 'react';
import { Product } from '../../types/product';
import { Edit2, Trash2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

export function ProductTable({ products, onEdit, onDelete }: ProductTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const confirmDelete = (id: string) => {
    onDelete(id);
    setDeleteId(null);
    toast.success('Product deleted');
  };

  if (products.length === 0) {
    return (
      <div className="text-center py-12 bg-card rounded-xl border border-border">
        <p className="text-muted-foreground">No products found. Add some products to get started.</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="bg-muted text-muted-foreground text-xs uppercase font-semibold">
          <tr>
            <th className="px-6 py-4">Product</th>
            <th className="px-6 py-4 hidden md:table-cell">Category</th>
            <th className="px-6 py-4">Price</th>
            <th className="px-6 py-4 hidden sm:table-cell">Badge</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {products.map((product) => (
            <tr key={product.id} className="hover:bg-muted/50 transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                  </div>
                  <div>
                    <div className="font-medium text-foreground line-clamp-1">{product.name}</div>
                    <a 
                      href={product.affiliateLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-primary flex items-center gap-1 hover:underline mt-1"
                    >
                      Link <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 hidden md:table-cell text-muted-foreground">
                {product.category}
              </td>
              <td className="px-6 py-4 font-medium text-foreground">
                Rs. {product.price.toLocaleString()}
              </td>
              <td className="px-6 py-4 hidden sm:table-cell">
                {product.badge ? (
                  <span className="inline-block px-2 py-1 bg-muted text-muted-foreground text-[10px] rounded uppercase font-bold tracking-wider">
                    {product.badge}
                  </span>
                ) : (
                  <span className="text-muted-foreground/50">-</span>
                )}
              </td>
              <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                {deleteId === product.id ? (
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      onClick={() => confirmDelete(product.id)}
                      className="text-xs bg-destructive text-destructive-foreground px-3 py-1.5 rounded-md hover:bg-destructive/90"
                    >
                      Sure?
                    </button>
                    <button 
                      onClick={() => setDeleteId(null)}
                      className="text-xs bg-muted text-muted-foreground px-3 py-1.5 rounded-md hover:bg-muted/80"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <button 
                      onClick={() => onEdit(product)}
                      className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors inline-flex"
                      aria-label="Edit"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => setDeleteId(product.id)}
                      className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors inline-flex"
                      aria-label="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
