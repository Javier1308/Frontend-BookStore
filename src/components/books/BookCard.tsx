"use client"

import type React from "react"
import { Link } from "react-router-dom"
import { Heart, ShoppingCart, Star } from "lucide-react"
import type { Book } from "@/types"
import { Button } from "@/components/ui/Button"
import { useCartStore } from "@/stores/cart"
import { formatCurrency } from "@/utils/format"
import toast from "react-hot-toast"

interface BookCardProps {
  book: Book
  onToggleFavorite?: (bookId: string) => void
  isFavorite?: boolean
}

export const BookCard: React.FC<BookCardProps> = ({ book, onToggleFavorite, isFavorite = false }) => {
  const { addItem } = useCartStore()

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (book.stock_quantity <= 0) {
      toast.error("Book is out of stock")
      return
    }

    try {
      await addItem(book.book_id)
    } catch (error) {
      console.error("Failed to add to cart:", error)
    }
  }

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onToggleFavorite?.(book.book_id)
  }

  return (
    <Link to={`/books/${book.book_id}`} className="group">
      <div className="card p-4 hover:shadow-lg transition-shadow duration-200">
        <div className="relative">
          <img
            src={book.cover_image_url || "/placeholder.svg?height=300&width=200"}
            alt={book.title}
            className="w-full h-48 object-cover rounded-lg mb-4"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.src = "/placeholder.svg?height=300&width=200"
            }}
          />

          {onToggleFavorite && (
            <button
              onClick={handleToggleFavorite}
              className={`absolute top-2 right-2 p-2 rounded-full ${
                isFavorite ? "bg-red-500 text-white" : "bg-white text-gray-400 hover:text-red-500"
              } shadow-md transition-colors duration-200`}
            >
              <Heart className="h-4 w-4" fill={isFavorite ? "currentColor" : "none"} />
            </button>
          )}

          {book.stock_quantity <= 0 && (
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
              <span className="text-white font-semibold">Out of Stock</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors duration-200 line-clamp-2">
            {book.title}
          </h3>

          <p className="text-sm text-gray-600 dark:text-gray-400">by {book.author}</p>

          <div className="flex items-center space-x-1">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star
                key={index}
                className={`h-4 w-4 ${
                  index < Math.floor(book.rating) ? "text-yellow-400 fill-current" : "text-gray-300"
                }`}
              />
            ))}
            <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">({book.rating.toFixed(1)})</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(book.price)}</span>

            <Button
              size="sm"
              onClick={handleAddToCart}
              disabled={book.stock_quantity <= 0}
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            >
              <ShoppingCart className="h-4 w-4 mr-1" />
              Add to Cart
            </Button>
          </div>

          <div className="text-xs text-gray-500 dark:text-gray-400">
            {book.category} • {book.publication_year}
          </div>
        </div>
      </div>
    </Link>
  )
}
