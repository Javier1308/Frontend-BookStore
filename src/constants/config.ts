export const config = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || "http://3.237.98.83:9201",
  DEFAULT_TENANT: import.meta.env.VITE_DEFAULT_TENANT || "default",
  JWT_STORAGE_KEY: "bookstore_token",
  TENANT_STORAGE_KEY: "bookstore_tenant",
  USER_STORAGE_KEY: "bookstore_user",
} as const

// Updated API endpoints based on the backend repository structure
export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  PROFILE: "/auth/me",

  // Books endpoints
  BOOKS: "/books",
  BOOK_BY_ID: (id: string) => `/books/${id}`,
  BOOKS_SEARCH: "/books/search",
  BOOKS_CATEGORIES: "/books/categories",

  // Cart endpoints
  CART: "/cart",
  CART_ADD: "/cart/add",
  CART_UPDATE: "/cart/update",
  CART_REMOVE: (bookId: string) => `/cart/remove/${bookId}`,

  // Purchase endpoints
  CHECKOUT: "/purchases/checkout",
  PURCHASES: "/purchases",
  PURCHASE_BY_ID: (id: string) => `/purchases/${id}`,
} as const

export const BOOK_CATEGORIES = [
  "Programming",
  "Fiction",
  "Non-Fiction",
  "Science",
  "History",
  "Biography",
  "Self-Help",
  "Business",
  "Art",
  "Travel",
] as const

export const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
] as const
