"use client"

import type React from "react"
import { useEffect } from "react"
import { useBooksStore } from "@/stores/books"
import { BookCard } from "./BookCard"
import { BookCardSkeleton } from "@/components/ui/LoadingSkeleton"
import { Button } from "@/components/ui/Button"

export const BookList: React.FC = () => {
  const { books, pagination, isLoading, filters, setFilters, fetchBooks } = useBooksStore()

  useEffect(() => {
    fetchBooks()
  }, [filters, fetchBooks])

  const handlePageChange = (page: number) => {
    setFilters({ page })
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  if (isLoading && books.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <BookCardSkeleton key={index} />
        ))}
      </div>
    )
  }

  if (books.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No books found</h3>
        <p className="text-gray-600 dark:text-gray-400">Try adjusting your search criteria or browse our categories.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {books.map((book) => (
          <BookCard key={book.book_id} book={book} />
        ))}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
          >
            Previous
          </Button>

          <div className="flex items-center space-x-1">
            {Array.from({ length: Math.min(5, pagination.pages) }).map((_, index) => {
              const page = Math.max(1, pagination.page - 2) + index
              if (page > pagination.pages) return null

              return (
                <Button
                  key={page}
                  variant={page === pagination.page ? "primary" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </Button>
              )
            })}
          </div>

          <Button
            variant="outline"
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.pages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
