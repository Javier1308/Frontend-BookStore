import { create } from "zustand"
import type { CartItem } from "@/types"
import { cartService } from "@/services/cart"
import toast from "react-hot-toast"

interface CartState {
  items: CartItem[]
  isLoading: boolean
  total: number
  itemCount: number
  fetchCart: () => Promise<void>
  addItem: (bookId: string, quantity?: number) => Promise<void>
  updateItem: (bookId: string, quantity: number) => Promise<void>
  removeItem: (bookId: string) => Promise<void>
  clearCart: () => void
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isLoading: false,
  total: 0,
  itemCount: 0,

  fetchCart: async () => {
    set({ isLoading: true })
    try {
      const items = await cartService.getCart()
      const total = items.reduce((sum, item) => sum + item.book.price * item.quantity, 0)
      const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

      set({ items, total, itemCount, isLoading: false })
    } catch (error) {
      set({ isLoading: false })
      toast.error("Failed to fetch cart")
    }
  },

  addItem: async (bookId: string, quantity = 1) => {
    try {
      const existingItem = get().items.find((item) => item.book_id === bookId)

      if (existingItem) {
        await get().updateItem(bookId, existingItem.quantity + quantity)
      } else {
        await cartService.addToCart(bookId, quantity)
        await get().fetchCart()
      }

      toast.success("Item added to cart")
    } catch (error) {
      toast.error("Failed to add item to cart")
    }
  },

  updateItem: async (bookId: string, quantity: number) => {
    if (quantity <= 0) {
      await get().removeItem(bookId)
      return
    }

    try {
      await cartService.updateCartItem(bookId, quantity)
      await get().fetchCart()
    } catch (error) {
      toast.error("Failed to update cart item")
    }
  },

  removeItem: async (bookId: string) => {
    try {
      await cartService.removeFromCart(bookId)
      await get().fetchCart()
      toast.success("Item removed from cart")
    } catch (error) {
      toast.error("Failed to remove item from cart")
    }
  },

  clearCart: () => {
    set({ items: [], total: 0, itemCount: 0 })
  },
}))
