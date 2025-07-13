// Updated types based on the backend API structure
export interface User {
  user_id: string
  tenant_id: string
  email: string
  first_name: string
  last_name: string
  is_active: boolean
  role?: "user" | "admin"
  preferences?: {
    categories: string[]
    language: string
  }
  created_at: string
  updated_at: string
}

export interface AuthResponse {
  access_token: string
  token_type: string
  user: User
}

export interface LoginRequest {
  email: string
  password: string
  tenant_id: string
}

export interface RegisterRequest {
  email: string
  password: string
  first_name: string
  last_name: string
  tenant_id: string
}

export interface Book {
  book_id: string
  tenant_id: string
  isbn: string
  title: string
  author: string
  editorial: string
  category: string
  price: number
  description: string
  cover_image_url?: string
  stock_quantity: number
  publication_year: number
  language: string
  pages: number
  rating: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface BookFilters {
  category?: string
  author?: string
  min_price?: number
  max_price?: number
  search?: string
  page?: number
  limit?: number
  tenant_id?: string
}

export interface CartItem {
  book_id: string
  book: Book
  quantity: number
  added_at: string
  updated_at: string
}

export interface Purchase {
  purchase_id: string
  tenant_id: string
  user_id: string
  total_amount: number
  status: "pending" | "completed" | "cancelled"
  payment_method: string
  shipping_address: {
    street: string
    city: string
    state: string
    zip_code: string
    country: string
  }
  created_at: string
  updated_at: string
  items: PurchaseItem[]
}

export interface PurchaseItem {
  book_id: string
  quantity: number
  unit_price: number
  subtotal: number
}

export interface Tenant {
  tenant_id: string
  name: string
  domain: string
  is_active: boolean
}

export interface ApiResponse<T> {
  data?: T
  message?: string
  detail?: string
  success?: boolean
}

// Fixed pagination response to match backend
export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  size: number
  pages: number
}

// Fixed pagination state to match the response
export interface PaginationState {
  page: number
  size: number
  total: number
  pages: number
}
