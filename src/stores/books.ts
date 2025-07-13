import { create } from "zustand"
import type { Book, BookFilters, PaginatedResponse, PaginationState } from "@/types"
import { booksService } from "@/services/books"

interface BooksState {
  books: Book[]
  currentBook: Book | null
  filters: BookFilters
  pagination: PaginationState
  isLoading: boolean
  error: string | null
  searchQuery: string
  categories: string[]
  setFilters: (filters: Partial<BookFilters>) => void
  fetchBooks: () => Promise<void>
  fetchBook: (bookId: string) => Promise<void>
  searchBooks: (query: string) => Promise<Book[]>
  fetchCategories: () => Promise<void>
  clearCurrentBook: () => void
  clearError: () => void
}

export const useBooksStore = create<BooksState>((set, get) => ({
  books: [],
  currentBook: null,
  filters: {
    page: 1,
    limit: 20,
  },
  pagination: {
    page: 1,
    size: 20,
    total: 0,
    pages: 0,
  },
  isLoading: false,
  error: null,
  searchQuery: "",
  categories: [],

  setFilters: (newFilters: Partial<BookFilters>) => {
    const currentFilters = get().filters
    const updatedFilters = { ...currentFilters, ...newFilters }

    // Reset page when filters change (except when changing page)
    if (!newFilters.page) {
      updatedFilters.page = 1
    }

    set({ filters: updatedFilters, error: null })
  },

  fetchBooks: async () => {
    set({ isLoading: true, error: null })
    try {
      const response: PaginatedResponse<Book> = await booksService.getBooks(get().filters)
      set({
        books: response.items || [],
        pagination: {
          page: response.page,
          size: response.size,
          total: response.total,
          pages: response.pages,
        },
        isLoading: false,
        error: null,
      })
    } catch (error: any) {
      console.error("Failed to fetch books:", error)
      set({
        isLoading: false,
        error: error.message || "Failed to fetch books",
        books: [],
        pagination: {
          page: 1,
          size: 20,
          total: 0,
          pages: 0,
        },
      })
    }
  },

  fetchBook: async (bookId: string) => {
    set({ isLoading: true, error: null })
    try {
      const book = await booksService.getBook(bookId)
      set({ currentBook: book, isLoading: false, error: null })
    } catch (error: any) {
      console.error("Failed to fetch book:", error)
      set({
        isLoading: false,
        error: error.message || "Failed to fetch book details",
        currentBook: null,
      })
    }
  },

  searchBooks: async (query: string) => {
    set({ searchQuery: query, error: null })
    if (!query.trim()) return []

    try {
      const results = await booksService.searchBooks(query)
      return results
    } catch (error: any) {
      console.error("Search failed:", error)
      set({ error: error.message || "Search failed" })
      return []
    }
  },

  fetchCategories: async () => {
    try {
      const categories = await booksService.getCategories()
      set({ categories, error: null })
    } catch (error: any) {
      console.error("Failed to fetch categories:", error)
      set({ error: error.message || "Failed to fetch categories" })
    }
  },

  clearCurrentBook: () => {
    set({ currentBook: null, error: null })
  },

  clearError: () => {
    set({ error: null })
  },
}))
