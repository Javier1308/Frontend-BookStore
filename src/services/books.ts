import { apiService } from "./api"
import { API_ENDPOINTS } from "@/constants/config"
import type { Book, BookFilters, PaginatedResponse } from "@/types"

export const booksService = {
  async getBooks(filters: BookFilters = {}): Promise<PaginatedResponse<Book>> {
    const params = new URLSearchParams()

    // Add pagination - backend uses skip/limit
    const skip = ((filters.page || 1) - 1) * (filters.limit || 20)
    params.append("skip", skip.toString())
    params.append("limit", (filters.limit || 20).toString())

    // Add filters
    if (filters.category) params.append("category", filters.category)
    if (filters.author) params.append("author", filters.author)
    if (filters.min_price) params.append("min_price", filters.min_price.toString())
    if (filters.max_price) params.append("max_price", filters.max_price.toString())
    if (filters.search) params.append("search", filters.search)

    try {
      const response = await apiService.get<PaginatedResponse<Book>>(`${API_ENDPOINTS.BOOKS}?${params}`)
      return response
    } catch (error) {
      console.error("Failed to fetch books:", error)
      // Return empty response on error
      return {
        items: [],
        total: 0,
        page: filters.page || 1,
        size: filters.limit || 20,
        pages: 0,
      }
    }
  },

  async getBook(bookId: string): Promise<Book> {
    const response = await apiService.get<Book>(API_ENDPOINTS.BOOK_BY_ID(bookId))
    return response
  },

  async searchBooks(query: string): Promise<Book[]> {
    const params = new URLSearchParams()
    params.append("q", query)

    try {
      const response = await apiService.get<Book[]>(`${API_ENDPOINTS.BOOKS_SEARCH}?${params}`)
      return response
    } catch (error) {
      console.error("Search failed:", error)
      return []
    }
  },

  async getCategories(): Promise<string[]> {
    try {
      const response = await apiService.get<string[]>(API_ENDPOINTS.BOOKS_CATEGORIES)
      return response
    } catch (error) {
      console.error("Failed to fetch categories:", error)
      // Return default categories if API fails
      return ["Programming", "Fiction", "Non-Fiction", "Science", "History", "Biography"]
    }
  },

  async createBook(book: Omit<Book, "book_id" | "created_at" | "updated_at">): Promise<Book> {
    const response = await apiService.post<Book>(API_ENDPOINTS.BOOKS, book)
    return response
  },

  async updateBook(bookId: string, book: Partial<Book>): Promise<Book> {
    const response = await apiService.put<Book>(API_ENDPOINTS.BOOK_BY_ID(bookId), book)
    return response
  },

  async deleteBook(bookId: string): Promise<void> {
    await apiService.delete(API_ENDPOINTS.BOOK_BY_ID(bookId))
  },
}
