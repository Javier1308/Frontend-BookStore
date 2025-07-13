import { create } from "zustand"
import type { User, Tenant } from "@/types"
import { storage } from "@/utils/storage"
import { config } from "@/constants/config"

interface AuthState {
  user: User | null
  token: string | null
  tenant: Tenant | null
  isAuthenticated: boolean
  isLoading: boolean
  setAuth: (user: User, token: string) => void
  setTenant: (tenant: Tenant) => void
  updateUser: (user: Partial<User>) => void
  logout: () => void
  initialize: () => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  tenant: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: (user: User, token: string) => {
    storage.set(config.JWT_STORAGE_KEY, token)
    storage.set(config.USER_STORAGE_KEY, user)

    set({
      user,
      token,
      isAuthenticated: true,
      isLoading: false,
    })
  },

  setTenant: (tenant: Tenant) => {
    storage.set(config.TENANT_STORAGE_KEY, tenant.tenant_id)
    set({ tenant })
  },

  updateUser: (userData: Partial<User>) => {
    const currentUser = get().user
    if (currentUser) {
      const updatedUser = { ...currentUser, ...userData }
      storage.set(config.USER_STORAGE_KEY, updatedUser)
      set({ user: updatedUser })
    }
  },

  logout: () => {
    storage.remove(config.JWT_STORAGE_KEY)
    storage.remove(config.USER_STORAGE_KEY)
    storage.remove(config.TENANT_STORAGE_KEY)

    set({
      user: null,
      token: null,
      tenant: null,
      isAuthenticated: false,
      isLoading: false,
    })
  },

  initialize: () => {
    const token = storage.get<string>(config.JWT_STORAGE_KEY)
    const user = storage.get<User>(config.USER_STORAGE_KEY)
    const tenantId = storage.get<string>(config.TENANT_STORAGE_KEY) || config.DEFAULT_TENANT

    if (token && user) {
      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      })
    } else {
      set({ isLoading: false })
    }

    // Set default tenant
    set({
      tenant: {
        tenant_id: tenantId,
        name: tenantId,
        domain: "",
        is_active: true,
      },
    })
  },
}))
