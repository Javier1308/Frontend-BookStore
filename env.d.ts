/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_BASE_URL: string
    readonly VITE_USERS_API_URL: string
    readonly VITE_BOOKS_API_URL: string
    readonly VITE_PURCHASES_API_URL: string
    readonly VITE_DEFAULT_TENANT: string
    readonly VITE_NODE_ENV: string
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv
  }
  