"use client"

import type React from "react"
import { Minus, Plus, Trash2 } from "lucide-react"
import type { CartItem as CartItemType } from "@/types"
import { Button } from "@/components/ui/Button"
import { useCartStore } from "@/stores/cart"
import { formatCurrency } from "@/utils/format"

interface CartItemProps {
  item: CartItemType
}

export const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const { updateItem, removeItem } = useCartStore()

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(item.book_id)
    } else {
      updateItem(item.book_id, newQuantity)
    }
  }

  const subtotal = item.book.price * item.quantity

  return (
    <div className="flex items-center space-x-4 py-4 border-b border-gray-200 dark:border-gray-700">
      <img
        src={item.book.cover_image_url || "/placeholder.svg?height=100&width=80"}
        alt={item.book.title}
        className="w-16 h-20 object-cover rounded"
      />

      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.book.title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">by {item.book.author}</p>
        <p className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(item.book.price)}</p>
      </div>

      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleQuantityChange(item.quantity - 1)}
          disabled={item.quantity <= 1}
        >
          <Minus className="h-3 w-3" />
        </Button>

        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>

        <Button
          variant="outline"
          size="sm"
          onClick={() => handleQuantityChange(item.quantity + 1)}
          disabled={item.quantity >= item.book.stock_quantity}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>

      <div className="text-right">
        <p className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(subtotal)}</p>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => removeItem(item.book_id)}
          className="text-red-600 hover:text-red-700"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
