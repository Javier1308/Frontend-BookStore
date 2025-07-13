"use client"

import { useEffect } from "react"
import { useAuthStore } from "@/stores/auth"
import { authService } from "@/services/auth"
import type { LoginRequest, RegisterRequest, User } from "@/types"

export const useAuth = () => {
  const { user, token, tenant, isAuthenticated, isLoading, setAuth, setTenant, updateUser, logout, initialize } =
    useAuthStore()

  useEffect(() => {
    initialize()
  }, [initialize])

  const login = async (email: string, password: string, tenantId: string) => {
    try {
      const credentials: LoginRequest = { email, password, tenant_id: tenantId }
      const response = await authService.login(credentials)
      setAuth(response.user, response.access_token)
      return response
    } catch (error) {
      throw error
    }
  }

  const register = async (data: RegisterRequest) => {
    try {
      const response = await authService.register(data)
      setAuth(response.user, response.access_token)
      return response
    } catch (error) {
      throw error
    }
  }

  const updateProfile = async (data: Partial<User>) => {
    try {
      const updatedUser = await authService.updateProfile(data)
      updateUser(updatedUser)
      return updatedUser
    } catch (error) {
      throw error
    }
  }

  const handleLogout = async () => {
    try {
      await authService.logout()
    } catch (error) {
      // Continue with logout even if API call fails
    } finally {
      logout()
    }
  }

  return {
    user,
    token,
    tenant,
    isAuthenticated,
    isLoading,
    login,
    register,
    updateProfile,
    logout: handleLogout,
    setTenant,
  }
}
