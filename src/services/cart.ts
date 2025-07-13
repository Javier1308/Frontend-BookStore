import { apiService } from "./api"
import { API_ENDPOINTS } from "@/constants/config"
import type { CartItem, Purchase } from "@/types"

export const cartService = {
  async getCart(): Promise<CartItem[]> {
    const response = await apiService.get<CartItem[]>(API_ENDPOINTS.CART)
    return response
  },

  async addToCart(bookId: string, quantity = 1): Promise<CartItem> {
    const response = await apiService.post<CartItem>(API_ENDPOINTS.CART_ADD, {
      book_id: bookId,
      quantity,
    })
    return response
  },

  async updateCartItem(bookId: string, quantity: number): Promise<CartItem> {
    const response = await apiService.put<CartItem>(API_ENDPOINTS.CART_UPDATE, {
      book_id: bookId,
      quantity,
    })
    return response
  },

  async removeFromCart(bookId: string): Promise<void> {
    await apiService.delete(API_ENDPOINTS.CART_REMOVE(bookId))
  },

  async checkout(data: {
    payment_method: string
    shipping_address: Purchase["shipping_address"]
  }): Promise<Purchase> {
    const response = await apiService.post<Purchase>(API_ENDPOINTS.CHECKOUT, data)
    return response
  },
}
