const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

interface ApiOptions {
  method?: string
  body?: any
  token?: string
  isFormData?: boolean
}

export async function apiClient<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { method = "GET", body, token, isFormData = false } = options

  const headers: HeadersInit = {}

  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  if (!isFormData) {
    headers["Content-Type"] = "application/json"
  }

  const config: RequestInit = {
    method,
    headers,
  }

  if (body) {
    config.body = isFormData ? body : JSON.stringify(body)
  }

  const response = await fetch(`${API_URL}${endpoint}`, config)
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong")
  }

  return data
}

// Auth APIs
export const authApi = {
  register: (data: { name: string; phone: string; email: string; location: string; password: string; role: string }) =>
    apiClient("/auth/register", { method: "POST", body: data }),

  login: (data: { email: string; password: string }) =>
    apiClient<{ token: string; user: any }>("/auth/login", { method: "POST", body: data }),

  verify: (token: string) => apiClient(`/auth/verify/${token}`),
}

// Entrepreneur APIs
export const entrepreneurApi = {
  getBusinesses: (token: string) => apiClient<any[]>("/entrepreneur/business", { token }),

  getBusiness: (id: string, token: string) => apiClient<any>(`/entrepreneur/business/${id}`, { token }),

  createBusiness: (data: FormData, token: string) =>
    apiClient("/entrepreneur/business", { method: "POST", body: data, token, isFormData: true }),

  updateBusiness: (id: string, data: FormData, token: string) =>
    apiClient(`/entrepreneur/business/${id}`, { method: "PUT", body: data, token, isFormData: true }),
}

// Investor APIs
export const investorApi = {
  getBusinesses: (token: string, params?: { category?: string; search?: string }) => {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : ""
    return apiClient<any[]>(`/investor/businesses${queryString}`, { token })
  },

  getBusiness: (id: string, token: string) => apiClient<any>(`/investor/businesses/${id}`, { token }),

  invest: (id: string, amount: number, token: string) =>
    apiClient(`/investor/businesses/${id}/invest`, { method: "POST", body: { amount }, token }),

  getInvestments: (token: string) => apiClient<any[]>("/investor/investments", { token }),
}

// Admin APIs
export const adminApi = {
  getStats: (token: string) => apiClient<any>("/admin/stats", { token }),

  getBusinesses: (token: string, params?: { status?: string; category?: string }) => {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : ""
    return apiClient<any[]>(`/admin/businesses${queryString}`, { token })
  },

  updateBusiness: (id: string, data: FormData, token: string) =>
    apiClient(`/admin/businesses/${id}`, { method: "PUT", body: data, token, isFormData: true }),

  deleteBusiness: (id: string, token: string) => apiClient(`/admin/businesses/${id}`, { method: "DELETE", token }),

  getUsers: (token: string, params?: { role?: string; is_active?: string }) => {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : ""
    return apiClient<any[]>(`/admin/users${queryString}`, { token })
  },

  deleteUser: (id: string, token: string) => apiClient(`/admin/users/${id}`, { method: "DELETE", token }),

  updateUserStatus: (id: string, is_active: boolean, token: string) =>
    apiClient(`/admin/users/${id}/status`, { method: "PATCH", body: { is_active }, token }),

  getInvestments: (token: string) => apiClient<any[]>("/admin/investments", { token }),

  updateInvestmentStatus: (id: string, status: string, token: string) =>
    apiClient(`/admin/investments/${id}/status`, { method: "PATCH", body: { status }, token }),

  getCategories: (token: string) => apiClient<any[]>("/admin/categories", { token }),

  createCategory: (data: { name: string; fee: number }, token: string) =>
    apiClient("/admin/categories", { method: "POST", body: data, token }),

  updateCategory: (id: string, data: { name: string; fee: number }, token: string) =>
    apiClient(`/admin/categories/${id}`, { method: "PUT", body: data, token }),

  deleteCategory: (id: string, token: string) => apiClient(`/admin/categories/${id}`, { method: "DELETE", token }),

  approveBusiness: (id: string, data: FormData, token: string) =>
    apiClient(`/admin/businesses/${id}/approve`, { method: "POST", body: data, token, isFormData: true }),

  rejectBusiness: (id: string, reason: string, token: string) =>
    apiClient(`/admin/businesses/${id}/reject`, { method: "POST", body: { reason }, token }),

  createPublicBusiness: (data: FormData, token: string) =>
    apiClient("/admin/businesses/public", { method: "POST", body: data, token, isFormData: true }),

  updatePublicBusiness: (id: string, data: FormData, token: string) =>
    apiClient(`/admin/businesses/public/${id}`, { method: "PUT", body: data, token, isFormData: true }),

  getPublicBusinesses: (token: string) => apiClient<any[]>("/admin/businesses?type=public", { token }),
}
