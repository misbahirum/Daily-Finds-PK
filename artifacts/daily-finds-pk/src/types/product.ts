export type Category = 'Home Decor' | 'Kitchen Gadgets' | 'Furniture' | 'Office Setup' | 'Beauty' | 'Electronics';
export type Badge = 'Featured' | 'Top Pick' | 'New Arrival' | 'Sale' | null;

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  category: Category;
  badge: Badge;
  affiliateLink: string;
  imageUrl: string;
  clickCount: number;
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

export const BADGES: Badge[] = ['Featured', 'Top Pick', 'New Arrival', 'Sale', null];

export const BADGE_CONFIG: Record<NonNullable<Badge>, { label: string; emoji: string; className: string }> = {
  'Featured':    { label: 'Featured',    emoji: '❤️', className: 'bg-green-500 text-white' },
  'Top Pick':    { label: 'Top Pick',    emoji: '⭐', className: 'bg-amber-400 text-white' },
  'New Arrival': { label: 'New Arrival', emoji: '🆕', className: 'bg-blue-500 text-white' },
  'Sale':        { label: 'Sale',        emoji: '🔥', className: 'bg-red-500 text-white' },
};
