"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Filter, X } from "lucide-react"
import { useBooksStore } from "@/stores/books"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { BOOK_CATEGORIES } from "@/constants/config"

export const BookFilters: React.FC = () => {
  const { filters, setFilters, categories, fetchCategories } = useBooksStore()
  const [isOpen, setIsOpen] = useState(false)
  const [localFilters, setLocalFilters] = useState({
    category: filters.category || "",
    author: filters.author || "",
    min_price: filters.min_price || "",
    max_price: filters.max_price || "",
  })

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const handleApplyFilters = () => {
    const cleanFilters = Object.fromEntries(Object.entries(localFilters).filter(([_, value]) => value !== ""))
    setFilters(cleanFilters)
    setIsOpen(false)
  }

  const handleClearFilters = () => {
    const clearedFilters = {
      category: "",
      author: "",
      min_price: "",
      max_price: "",
    }
    setLocalFilters(clearedFilters)
    setFilters({ page: 1 })
  }

  const activeFilterCount = Object.values(localFilters).filter((value) => value !== "").length

  return (
    <div className="relative">
      <Button variant="outline" onClick={() => setIsOpen(!isOpen)} className="relative">
        <Filter className="h-4 w-4 mr-2" />
        Filters
        {activeFilterCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {activeFilterCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6 z-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h3>
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
              <select
                value={localFilters.category}
                onChange={(e) => setLocalFilters({ ...localFilters, category: e.target.value })}
                className="input-field"
              >
                <option value="">All Categories</option>
                {(categories.length > 0 ? categories : BOOK_CATEGORIES).map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Author Filter */}
            <Input
              label="Author"
              type="text"
              value={localFilters.author}
              onChange={(e) => setLocalFilters({ ...localFilters, author: e.target.value })}
              placeholder="Search by author"
            />

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Price Range</label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  value={localFilters.min_price}
                  onChange={(e) => setLocalFilters({ ...localFilters, min_price: e.target.value })}
                  placeholder="Min price"
                  min="0"
                  step="0.01"
                />
                <Input
                  type="number"
                  value={localFilters.max_price}
                  onChange={(e) => setLocalFilters({ ...localFilters, max_price: e.target.value })}
                  placeholder="Max price"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button variant="ghost" onClick={handleClearFilters}>
              Clear All
            </Button>
            <Button onClick={handleApplyFilters}>Apply Filters</Button>
          </div>
        </div>
      )}
    </div>
  )
}
