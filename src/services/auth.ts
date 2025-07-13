import { apiService } from "./api"
import { API_ENDPOINTS } from "@/constants/config"
import type { User, AuthResponse, LoginRequest, RegisterRequest } from "@/types"

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const formData = new FormData()
    formData.append("username", credentials.email)
    formData.append("password", credentials.password)
    formData.append("tenant_id", credentials.tenant_id)

    const response = await apiService.post<AuthResponse>(API_ENDPOINTS.LOGIN, formData, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })
    return response
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponse>(API_ENDPOINTS.REGISTER, data)
    return response
  },

  async getProfile(): Promise<User> {
    const response = await apiService.get<User>(API_ENDPOINTS.PROFILE)
    return response
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await apiService.put<User>(API_ENDPOINTS.PROFILE, data)
    return response
  },

  async logout(): Promise<void> {
    // Just clear local storage since backend doesn't have logout endpoint
    return Promise.resolve()
  },
}
