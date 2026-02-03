export interface Product {
  id: string;
  name: string;
  price: number;
  currency: string;
  images: string[];
  sizes: Size[];
  category: string;
  collection?: string;
  description?: string;
  details?: string[];
  isNew?: boolean;
  isBestseller?: boolean;
  onSale?: boolean;
  salePrice?: number;
  /** If false, product page does not show size selector; add-to-cart uses "One Size" */
  hasSizes?: boolean;
}

export interface Size {
  label: string;
  available: boolean;
}

export interface CartItem {
  product: Product;
  size: string;
  quantity: number;
}

export interface WishlistItem {
  product: Product;
}

export type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'bestseller';

export interface Currency {
  code: string;
  symbol: string;
  name: string;
}

export interface Country {
  code: string;
  name: string;
}
