export const API_CONFIG = {
  // Replace these URLs with your actual API Gateway endpoints from `sls info --stage dev`
  USERS_API_URL: process.env.NEXT_PUBLIC_USERS_API_URL || "https://tf6775wga9.execute-api.us-east-1.amazonaws.com/dev",
  BOOKS_API_URL: process.env.NEXT_PUBLIC_BOOKS_API_URL || "https://4f2enpqk9i.execute-api.us-east-1.amazonaws.com/dev",
  PURCHASES_API_URL:
    process.env.NEXT_PUBLIC_PURCHASES_API_URL || "https://fikf4a274g.execute-api.us-east-1.amazonaws.com/dev",
  IMAGES_API_URL:
    process.env.NEXT_PUBLIC_IMAGES_API_URL || "https://tn43twlsd7.execute-api.us-east-1.amazonaws.com/dev",

  // API endpoints
  ENDPOINTS: {
    // Users API
    HEALTH_CHECK_USER: "/",
    REGISTER: "/api/v1/register?tenant_id={tenant_id}",
    LOGIN: "/api/v1/login?tenant_id={tenant_id}",
    TOKEN_VALIDATION: "/api/v1/validate-token?tenant_id={tenant_id}",
    PROFILE: "/api/v1/profile?tenant_id={tenant_id}",
    UPDATE_PROFILE: "/api/v1/profile?tenant_id={tenant_id}",
    CHANGE_PASSWORD: "/api/v1/change-password?tenant_id={tenant_id}",
    FAVORITES: "/api/v1/favorites?tenant_id={tenant_id}",
    ADD_FAVORITES: "/api/v1/favorites?tenant_id={tenant_id}",
    WISHLIST: "/api/v1/wishlist?tenant_id={tenant_id}",
    ADD_WISHLIST: "/api/v1/wishlist?tenant_id={tenant_id}",
    GET_USERS: "/api/v1/users?tenant_id={tenant_id}",

    // Books API
    HEALTH_CHECK_BOOKS: "/",
    BOOKS_PAGINATED: "/api/v1/books?tenant_id={tenant_id}&page={page}&limit={limit}",
    BOOK_ADD: "/api/v1/books?tenant_id={tenant_id}",
    BOOK_SEARCH_BY_ID: "/api/v1/books/{book_id}?tenant_id={tenant_id}",
    BOOK_SEARCH_BY_ISBN: "/api/v1/books/by-isbn/{isbn}?tenant_id={tenant_id}",
    BOOK_SEARCH_BY_TEXT: "/api/v1/books/search?tenant_id={tenant_id}&q={query}",
    BOOK_CATEGORIES: "/api/v1/books/categories?tenant_id={tenant_id}",
    BOOK_AUTHORS: "/api/v1/books/authors?tenant_id={tenant_id}&page={page}&limit={limit}",
    BOOK_RECOMMENDATIONS: "/api/v1/books/recommendations?tenant_id={tenant_id}&limit={limit}",
    BOOK_UPDATE: "/api/v1/books/{book_id}?tenant_id={tenant_id}",
    BOOK_IMAGE_UPDATE: "/api/v1/books/{book_id}/image?tenant_id={tenant_id}",
    BOOK_DELETE: "/api/v1/books/{book_id}?tenant_id={tenant_id}",
    BOOK_FILTER_BY_CATEGORY: "/api/v1/books?tenant_id={tenant_id}&category={category}&page={page}&limit={limit}",

    // Purchases API
    HEALTH_CHECK_PURCHASES: "/",
    CART: "/api/v1/cart?user_id={user_id}&tenant_id={tenant_id}",
    CART_ADD: "/api/v1/cart",
    CART_CLEAR: "/api/v1/cart/clear",
    CART_CHECKOUT: "/api/v1/cart/update",
    CART_GET_ORDERS: "/api/v1/orders?user_id={user_id}&tenant_id={tenant_id}",
    PURCHASE_ANALYTICS: "/api/v1/analytics/purchases?user_id={user_id}&tenant_id={tenant_id}",

    // Images API
    HEALTH_CHECK_IMAGES: "/",
    UPLOAD_BOOK_COVER: "/api/v1/books/image",
    UPLOAD_USER_PROFILE: "/api/v1/users/profile/image",
    PRESIGNED_URL: "/api/v1/images/presigned-url",
    DELETE_IMAGE: "/api/v1/images/{tenant}/{type}/{id}/{filename}",
  },

  // Default tenant (you can make this dynamic later)
  DEFAULT_TENANT: "tenant1",

  // Request timeout
  TIMEOUT: 30000,
}

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

// Additional configuration for the frontend
export const APP_CONFIG = {
  APP_NAME: "BookStore Pro",
  ITEMS_PER_PAGE: 12,
  MAX_CART_ITEMS: 99,
  CURRENCY: "USD",
  CURRENCY_SYMBOL: "$",
  DEFAULT_LANGUAGE: "en",
  SUPPORTED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/webp"],
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  ADMIN_ROLES: ["admin", "super_admin"],
  ORDER_STATUSES: ["pending", "processing", "shipped", "delivered", "cancelled"],
} as const
