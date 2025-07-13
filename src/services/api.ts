import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from "axios"
import { config } from "@/constants/config"
import { storage } from "@/utils/storage"
import toast from "react-hot-toast"

class ApiService {
  private api: AxiosInstance

  constructor() {
    this.api = axios.create({
      baseURL: config.API_BASE_URL,
      timeout: 15000,
      headers: {
        "Content-Type": "application/json",
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.api.interceptors.request.use(
      (requestConfig) => {
        const token = storage.get<string>(config.JWT_STORAGE_KEY)
        const tenantId = storage.get<string>(config.TENANT_STORAGE_KEY) || config.DEFAULT_TENANT

        if (token) {
          requestConfig.headers.Authorization = `Bearer ${token}`
        }

        // Add tenant_id as query parameter for all requests
        if (tenantId) {
          if (!requestConfig.params) {
            requestConfig.params = {}
          }
          requestConfig.params.tenant_id = tenantId
        }

        return requestConfig
      },
      (error) => {
        return Promise.reject(error)
      },
    )

    // Response interceptor
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true

          // Clear auth data and redirect to login
          storage.remove(config.JWT_STORAGE_KEY)
          storage.remove(config.USER_STORAGE_KEY)

          if (window.location.pathname !== "/login") {
            window.location.href = "/login"
          }

          return Promise.reject(error)
        }

        // Show error toast for other errors (but not for 401s)
        if (error.response?.status !== 401 && !originalRequest.skipErrorToast) {
          const message =
            error.response?.data?.detail || error.response?.data?.message || error.message || "An error occurred"

          toast.error(message)
        }

        return Promise.reject(error)
      },
    )
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.api.get(url, config)
    return response.data
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.api.post(url, data, config)
    return response.data
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.api.put(url, data, config)
    return response.data
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.api.delete(url, config)
    return response.data
  }
}

export const apiService = new ApiService()
