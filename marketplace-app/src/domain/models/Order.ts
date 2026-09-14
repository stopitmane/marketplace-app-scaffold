export interface CartItem {
  id: string;
  listingId: string;
  title: string;
  priceCents: number;
  currency: string;
  quantity: number;
  lineTotalCents: number;
}

export interface Cart {
  items: CartItem[];
  totalCents: number;
}

export interface OrderItem {
  listingId: string;
  quantity: number;
  unitPriceCents: number;
}

export interface Order {
  id: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  totalCents: number;
  currency: string;
  items: OrderItem[];
  createdAt: string;
}
