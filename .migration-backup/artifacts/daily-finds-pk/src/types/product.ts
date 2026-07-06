export type Category = 'Home Decor' | 'Kitchen Gadgets' | 'Furniture' | 'Office Setup' | 'Beauty' | 'Electronics';
export type Badge = 'Best Seller' | 'New Arrival' | 'Hot Deal' | null;

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  category: Category;
  badge: Badge;
  affiliateLink: string;
  imageUrl: string;
  createdAt: string;
}

export const CATEGORIES: Category[] = [
  'Home Decor',
  'Kitchen Gadgets',
  'Furniture',
  'Office Setup',
  'Beauty',
  'Electronics'
];

export const BADGES: Badge[] = ['Best Seller', 'New Arrival', 'Hot Deal', null];
