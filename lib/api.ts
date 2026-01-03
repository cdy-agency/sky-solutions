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
  register: (data: {
    name: string
    phone: string
    email: string
    location: string
    password: string
    role: string
    terms_accepted: boolean
  }) => apiClient("/auth/register", { method: "POST", body: data }),

  login: (data: { email: string; password: string }) =>
    apiClient<{ token: string; user: any }>("/auth/login", { method: "POST", body: data }),

  verify: (token: string) => apiClient(`/auth/verify/${token}`),

  resendVerification: (email: string) => apiClient("/auth/resend-verification", { method: "POST", body: { email } }),

  forgotPassword: (email: string) => apiClient("/auth/forgot-password", { method: "POST", body: { email } }),

  resetPassword: (token: string, password: string) =>
    apiClient(`/auth/reset-password/${token}`, { method: "POST", body: { password } }),

  getProfile: (token: string) => apiClient("/auth/profile", { method: "GET", token }),

  updateProfile: (
    data: { name: string; phone: string; email: string; location: string; avatar_url?: string },
    token: string,
  ) => apiClient("/auth/profile", { method: "PUT", body: data, token }),

  submitDocuments: (formData: FormData, token: string) =>
    apiClient("/auth/submit-documents", { method: "POST", body: formData, token, isFormData: true }),
}

// Intake API endpoints for form submission and management
export const intakeApi = {
  getAll: (token: string) => apiClient<any[]>("/intake", { token }),

  getIntakes: (token: string) => apiClient<any[]>("/intake", { token }),

  getById: (id: string, token: string) => apiClient<any>(`/intake/${id}`, { token }),

  create: (token: string, data: Record<string, any>) => apiClient("/intake", { method: "POST", body: data, token }),

  update: (id: string, token: string, data: Record<string, any>) =>
    apiClient(`/intake/${id}`, { method: "PUT", body: data, token }),

  submit: (id: string, token: string) => apiClient(`/intake/${id}/submit`, { method: "POST", token }),

  delete: (id: string, token: string) => apiClient(`/intake/${id}`, { method: "DELETE", token }),

  submitIntake: (data: Record<string, any>, token?: string) =>
    apiClient("/intake", { method: "POST", body: data, token }),

  getMyIntake: (token: string) => apiClient<any>("/intake/me", { method: "GET", token }),

  getAllIntakes: (token: string, page = 1, limit = 10) =>
    apiClient<any>(`/intake?page=${page}&limit=${limit}`, { method: "GET", token }),

  getIntakeById: (id: string, token: string) => apiClient<any>(`/intake/${id}`, { method: "GET", token }),

  updateIntake: (id: string, data: Record<string, any>, token: string) =>
    apiClient(`/intake/${id}`, { method: "PUT", body: data, token }),

  deleteIntake: (id: string, token: string) => apiClient(`/intake/${id}`, { method: "DELETE", token }),

  approveIntake: (id: string, token: string) => apiClient(`/intake/${id}/approve`, { method: "POST", token }),

  rejectIntake: (id: string, reason: string, token: string) =>
    apiClient(`/intake/${id}/reject`, { method: "POST", body: { reason }, token }),
}
export const publicApi = {
  getBusinesses: (params?: { category?: string; search?: string; page?: number; limit?: number }) => {
    const queryString = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : ""
    return apiClient<{ businesses: any[]; pagination: any }>(`/public/businesses${queryString}`)
  },

  getBusiness: (id: string) => apiClient<any>(`/public/businesses/${id}`),

  getCategories: () => apiClient<any[]>(`/public/categories`),

  getStats: () => apiClient<any>(`/public/stats`),
}

// Entrepreneur APIs
export const entrepreneurApi = {
  getBusinesses: (token: string) => apiClient<any[]>("/entrepreneur/business", { token }),

  getBusiness: (id: string, token: string) => apiClient<any>(`/entrepreneur/business/${id}`, { token }),

  createBusiness: (data: FormData, token: string) =>
    apiClient("/entrepreneur/business", { method: "POST", body: data, token, isFormData: true }),

  updateBusiness: (id: string, data: FormData, token: string) =>
    apiClient(`/entrepreneur/business/${id}`, { method: "PUT", body: data, token, isFormData: true }),

  saveDraft: (data: FormData, token: string, businessId?: string) =>
    apiClient("/entrepreneur/business/draft", {
      method: "POST",
      body: { ...data, business_id: businessId },
      token,
      isFormData: true,
    }),

  submitDraft: (id: string, token: string) =>
    apiClient(`/entrepreneur/business/${id}/submit`, { method: "POST", token }),
}

// Investor APIs
export const investorApi = {
  getBusinesses: (
    token: string,
    params?: {
      category?: string
      search?: string
      min_funding?: number
      max_funding?: number
      min_equity?: number
      max_equity?: number
      min_shares?: number
      max_shares?: number
      sort_by?: string
      page?: number
      limit?: number
    },
  ) => {
    const queryString = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : ""
    return apiClient<any>(`/investor/businesses${queryString}`, { token })
  },

  getBusiness: (id: string, token: string) => apiClient<any>(`/investor/businesses/${id}`, { token }),

  invest: (id: string, amount: number, token: string) =>
    apiClient(`/investor/businesses/${id}/invest`, { method: "POST", body: { amount }, token }),

  requestShares: (id: string, data: { requested_shares: number }, token: string) =>
    apiClient(`/investor/businesses/${id}/request-shares`, { method: "POST", body: data, token }),

  getInvestments: (token: string) => apiClient<any[]>("/investor/investments", { token }),

  getRecommendations: (token: string, limit?: number) =>
    apiClient<any>(`/recommendations/businesses?limit=${limit || 10}`, { token }),

  getSimilarBusinesses: (id: string, token: string) =>
    apiClient<any>(`/recommendations/businesses/${id}/similar`, { token }),
}

// Admin APIs
export const adminApi = {
  getStats: (token: string) => apiClient<any>("/admin/stats", { token }),

  getBusinesses: (token: string, params?: { status?: string; category?: string; page?: number; limit?: number }) => {
    const queryString = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : ""
    return apiClient<any[]>(`/admin/businesses${queryString}`, { token })
  },

  updateBusiness: (id: string, data: FormData, token: string) =>
    apiClient(`/admin/businesses/${id}`, { method: "PUT", body: data, token, isFormData: true }),

  deleteBusiness: (id: string, token: string) => apiClient(`/admin/businesses/${id}`, { method: "DELETE", token }),

  getUsers: (token: string, params?: { role?: string; is_active?: string; page?: number; limit?: number }) => {
    const queryString = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : ""
    return apiClient<any[]>(`/admin/users${queryString}`, { token })
  },

  deleteUser: (id: string, token: string) => apiClient(`/admin/users/${id}`, { method: "DELETE", token }),

  updateUserStatus: (id: string, is_active: boolean, token: string) =>
    apiClient(`/admin/users/${id}/status`, { method: "PATCH", body: { is_active }, token }),

  getInvestments: (token: string) => apiClient<any[]>("/admin/investments", { token }),

  updateInvestmentStatus: (id: string, status: string, token: string) =>
    apiClient(`/admin/investments/${id}/status`, { method: "PATCH", body: { status }, token }),

  getCategories: (token: string) => apiClient<any[]>("/admin/categories", { token }),

  createCategory: (data: { name: string; registration_fee: number }, token: string) =>
    apiClient("/admin/categories", { method: "POST", body: data, token }),

  updateCategory: (id: string, data: { name: string; registration_fee: number }, token: string) =>
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

  getPublicBusinesses: (token: string, params?: { page?: number; limit?: number }) => {
    const queryString = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : ""
    return apiClient<any>(`/admin/businesses/public${queryString}`, { token })
  },

  sendEmail: (data: { user_id: string; subject: string; message: string }, token: string) =>
    apiClient("/admin/email/send", { method: "POST", body: data, token }),

  getUserProfile: (userId: string, token: string) => apiClient<any>(`/admin/users/${userId}/profile`, { token }),

  sendEmailToUsers: (data: { user_ids: string[]; subject: string; message: string }, token: string) =>
    apiClient("/admin/send-email", { method: "POST", body: data, token }),

  getReviewQueue: (
    token: string,
    params?: { type?: string; status?: string; assigned_to?: string; priority?: string; page?: number; limit?: number },
  ) => {
    const queryString = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : ""
    return apiClient<any>(`/admin/review/queue${queryString}`, { token })
  },

  assignReview: (data: { item_id: string; item_type: string; assigned_to: string }, token: string) =>
    apiClient("/admin/review/assign", { method: "POST", body: data, token }),

  setPriority: (data: { item_id: string; item_type: string; priority: string }, token: string) =>
    apiClient("/admin/review/priority", { method: "POST", body: data, token }),

  getReviewStats: (token: string) => apiClient<any>("/admin/review/stats", { token }),

  getAnalytics: (token: string, params?: { startDate?: string; endDate?: string }) => {
    const queryString = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : ""
    return apiClient<any>(`/analytics/dashboard${queryString}`, { token })
  },

  getBusinessAnalytics: (token: string) => apiClient<any>("/analytics/businesses", { token }),

  getInvestmentAnalytics: (token: string) => apiClient<any>("/analytics/investments", { token }),

  // Intake submission management
  getIntakes: (
    token: string,
    params?: { form_type?: string; status?: string; user_id?: string; page?: number; limit?: number },
  ) => {
    const queryString = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : ""
    return apiClient<any>(`/admin/intakes${queryString}`, { token })
  },

  getIntakeById: (id: string, token: string) => apiClient<any>(`/admin/intakes/${id}`, { token }),

  updateIntakeStatus: (id: string, data: { status: string; rejection_reason?: string }, token: string) =>
    apiClient(`/admin/intakes/${id}/status`, { method: "PATCH", body: data, token }),
}

// Share request APIs
export const shareApi = {
  requestShares: (businessId: string, data: { requested_shares: number }, token: string) =>
    apiClient(`/shares/${businessId}/request`, { method: "POST", body: data, token }),

  getPendingRequests: (token: string, page = 1, limit = 10) =>
    apiClient<any>(`/shares/pending?page=${page}&limit=${limit}`, { method: "GET", token }),

  approveRequest: (shareRequestId: string, data: { approved_shares: number }, token: string) =>
    apiClient(`/shares/${shareRequestId}/approve`, { method: "PUT", body: data, token }),

  rejectRequest: (shareRequestId: string, data: { rejection_reason: string }, token: string) =>
    apiClient(`/shares/${shareRequestId}/reject`, { method: "PUT", body: data, token }),

  getMyRequests: (token: string, page = 1, limit = 10) =>
    apiClient<any>(`/shares/my-requests?page=${page}&limit=${limit}`, { method: "GET", token }),
}

// Library and document management APIs
export const libraryApi = {
  createFolder: (data: { name: string; description?: string; parent_id?: string }, token: string) =>
    apiClient("/library/folders", { method: "POST", body: data, token }),

  getFolders: (token: string, query?: string) =>
    apiClient<any[]>(`/library/folders${query || ""}`, { method: "GET", token }),

  getFolder: (folderId: string, token: string) =>
    apiClient<any>(`/library/folders/${folderId}`, { method: "GET", token }),

  renameFolder: (folderId: string, name: string, token: string) =>
    apiClient(`/library/folders/${folderId}/rename`, { method: "PATCH", body: { name }, token }),

  moveFolder: (folderId: string, parent_id: string | null, token: string) =>
    apiClient(`/library/folders/${folderId}/move`, { method: "PATCH", body: { parent_id }, token }),

  deleteFolder: (folderId: string, token: string) =>
    apiClient(`/library/folders/${folderId}`, { method: "DELETE", token }),

  uploadDocument: (formData: FormData, token: string) =>
    apiClient("/library/upload", { method: "POST", body: formData, token, isFormData: true }),

  getDocuments: (folderId: string, token: string, page = 1, limit = 10, sort = "date") =>
    apiClient<any>(`/library/documents/${folderId}?page=${page}&limit=${limit}&sort=${sort}`, { method: "GET", token }),

  getDocument: (documentId: string, token: string) =>
    apiClient<any>(`/library/documents/${documentId}`, { method: "GET", token }),

  renameDocument: (documentId: string, file_name: string, token: string) =>
    apiClient(`/library/documents/${documentId}/rename`, { method: "PATCH", body: { file_name }, token }),

  moveDocument: (documentId: string, folder_id: string, token: string) =>
    apiClient(`/library/documents/${documentId}/move`, { method: "PATCH", body: { folder_id }, token }),

  downloadDocument: (documentId: string, token: string) =>
    apiClient<any>(`/library/documents/${documentId}/download`, { method: "GET", token }),

  deleteDocument: (documentId: string, token: string) =>
    apiClient(`/library/documents/${documentId}`, { method: "DELETE", token }),
}

// Notification APIs
export const notificationApi = {
  getNotifications: (token: string, page = 1, limit = 20) =>
    apiClient<any>(`/notifications?page=${page}&limit=${limit}`, { method: "GET", token }),

  markAsRead: (notificationId: string, token: string) =>
    apiClient(`/notifications/${notificationId}/read`, { method: "PUT", token }),

  markAllAsRead: (token: string) => apiClient("/notifications/mark-all-read", { method: "PUT", token }),

  getPreferences: (token: string) => apiClient<any>("/notifications/preferences", { method: "GET", token }),

  updatePreferences: (
    data: {
      email_notifications?: boolean
      sms_notifications?: boolean
      push_notifications?: boolean
      notification_types?: any
      quiet_hours_start?: string
      quiet_hours_end?: string
    },
    token: string,
  ) => apiClient("/notifications/preferences", { method: "PUT", body: data, token }),
}

// Expense, Employee, and Payroll APIs
export const expenseApi = {
  getExpenses: (businessId: string, filters: any, token: string) =>
    apiClient(`/expenses/${businessId}`, { token, method: "GET" }),
  createExpense: (businessId: string, data: FormData, token: string) =>
    apiClient(`/expenses/${businessId}`, { token, method: "POST", body: data, isFormData: true }),
  getAnalytics: (businessId: string, token: string) =>
    apiClient(`/expenses/${businessId}/analytics/summary`, { token, method: "GET" }),
}

export const employeeApi = {
  getEmployees: (businessId: string, filters: any, token: string) =>
    apiClient(`/employees/${businessId}`, { token, method: "GET" }),
  createEmployee: (businessId: string, data: any, token: string) =>
    apiClient(`/employees/${businessId}`, { token, method: "POST", body: data }),
  getAttendance: (businessId: string, employeeId: string, token: string) =>
    apiClient(`/employees/${businessId}/attendance/${employeeId}`, { token, method: "GET" }),
  getPerformance: (businessId: string, employeeId: string, token: string) =>
    apiClient(`/employees/${businessId}/performance/${employeeId}`, { token, method: "GET" }),
}

export const payrollApi = {
  getPayrolls: (businessId: string, filters: any, token: string) =>
    apiClient(`/payroll/${businessId}`, { token, method: "GET" }),
  generatePayslip: (businessId: string, data: any, token: string) =>
    apiClient(`/payroll/${businessId}`, { token, method: "POST", body: data }),
  getInvoices: (businessId: string, filters: any, token: string) =>
    apiClient(`/payroll/${businessId}/invoices`, { token, method: "GET" }),
  createInvoice: (businessId: string, data: any, token: string) =>
    apiClient(`/payroll/${businessId}/invoices`, { token, method: "POST", body: data }),
  updateInvoice: (businessId: string, invoiceId: string, data: any, token: string) =>
    apiClient(`/payroll/${businessId}/invoices/${invoiceId}`, { token, method: "PUT", body: data }),
}

// Reports APIs
export const reportsApi = {
  generateReport: (
    data: {
      report_type: string
      start_date?: string
      end_date?: string
      business_id?: string
      category?: string
      format?: string
      currency?: string
    },
    token: string,
  ) => apiClient("/reports/generate", { method: "POST", body: data, token }),

  getReportTypes: (token: string) => apiClient<any>("/reports/types", { method: "GET", token }),
}
