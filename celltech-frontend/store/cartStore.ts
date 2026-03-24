import { create } from 'zustand';

export interface CartItem {
  sku: string;
  name: string;
  price: number;
  quantity: number;
  moq: number;
  image: string;
}

export interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (sku: string) => void;
  updateQuantity: (sku: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

export const useCartStore = create<CartState>((set: any, get: any) => ({
  items: [],
  
  addItem: (item: CartItem) => set((state: CartState) => {
    const existingItem = state.items.find((i: CartItem) => i.sku === item.sku);
    if (existingItem) {
      return {
        items: state.items.map((i: CartItem) =>
          i.sku === item.sku
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        )
      };
    }
    return { items: [...state.items, item] };
  }),

  removeItem: (sku: string) => set((state: CartState) => ({
    items: state.items.filter((i: CartItem) => i.sku !== sku)
  })),

  updateQuantity: (sku: string, quantity: number) => set((state: CartState) => ({
    items: state.items.map((i: CartItem) =>
      i.sku === sku ? { ...i, quantity } : i
    ).filter((i: CartItem) => i.quantity > 0)
  })),

  clearCart: () => set({ items: [] }),

  getTotalPrice: () => {
    const state = get();
    return state.items.reduce((total: number, item: CartItem) => total + (item.price * item.quantity), 0);
  },

  getTotalItems: () => {
    const state = get();
    return state.items.reduce((total: number, item: CartItem) => total + item.quantity, 0);
  }
}));
