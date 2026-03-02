"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { generateCartItemId, getProductName, getProductPrice } from "@/lib/utils";
import type { CartItem, CartItemConfig } from "@/types";

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (config: CartItemConfig) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,

      addItem: (config) => {
        const id = generateCartItemId(config);
        const unitPrice = getProductPrice(config);
        const name = getProductName(config);

        set((state) => {
          const existing = state.items.find((i) => i.id === id);
          if (existing) {
            return {
              items: state.items.map((i) => (i.id === id ? { ...i, quantity: i.quantity + 1 } : i)),
              isOpen: true,
            };
          }
          return {
            items: [...state.items, { id, config, quantity: 1, unitPrice, name }],
            isOpen: true,
          };
        });
      },

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        })),

      updateQuantity: (id, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => i.id !== id)
              : state.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
        })),

      clearCart: () => set({ items: [] }),

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
    }),
    {
      name: "rz-room-cart",
    }
  )
);
