"use client"

import React, { useEffect } from "react"
import { useBooksStore } from "@/stores/books"
import { BookList } from "@/components/books/BookList"
import { BookFilters } from "@/components/books/BookFilters"
import { useDebounce } from "@/hooks/useDebounce"
import { Input } from "@/components/ui/Input"
import { Search } from "lucide-react"

export const BooksPage: React.FC = () => {
  const { filters, setFilters, pagination } = useBooksStore()
  const [searchQuery, setSearchQuery] = React.useState(filters.search || "")
  const debouncedSearchQuery = useDebounce(searchQuery, 500)

  useEffect(() => {
    if (debouncedSearchQuery !== filters.search) {
      setFilters({ search: debouncedSearchQuery, page: 1 })
    }
  }, [debouncedSearchQuery, filters.search, setFilters])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Browse Books</h1>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex-1 relative">
            <Input
              type="text"
              placeholder="Search books, authors, ISBN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>

          <BookFilters />
        </div>

        {/* Results Info */}
        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          {pagination.total > 0 ? (
            <>
              Showing {(pagination.page - 1) * pagination.size + 1} -{" "}
              {Math.min(pagination.page * pagination.size, pagination.total)} of {pagination.total} books
            </>
          ) : (
            "No books found"
          )}
        </div>
      </div>

      <BookList />
    </div>
  )
}
