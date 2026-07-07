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
  'Featured':    { label: 'Featured',    emoji: '❤️', className: 'bg-primary text-primary-foreground' },
  'Top Pick':    { label: 'Top Pick',    emoji: '⭐', className: 'bg-accent text-accent-foreground' },
  'New Arrival': { label: 'New Arrival', emoji: '🆕', className: 'bg-secondary text-secondary-foreground border border-border' },
  'Sale':        { label: 'Sale',        emoji: '🔥', className: 'bg-destructive text-destructive-foreground' },
};
