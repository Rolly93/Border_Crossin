import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios'

export const getBaseUrl = () => import.meta.env.VITE_API_URL || ''

// Create a single axios instance with interceptors
const apiClient = axios.create({
  baseURL: getBaseUrl(),
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000, // 15 second timeout
})

// Track if we're already handling a 401 to avoid redirect loops
let isHandling401 = false

// Request interceptor - attach JWT token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('jwt_token')
    if (token && token !== 'undefined' && token !== 'null' && token.trim() !== '') {
      config.headers.Authorization = `Bearer ${token}`
    } else {
      delete config.headers.Authorization
    }
    return config
  },
  (error: AxiosError) => Promise.reject(error)
)

// Response interceptor - handle 401 (token expired) and retries
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { 
      _retry?: boolean
      _retryCount?: number
    }

    // Handle 401 - token expired or invalid
    if (error.response?.status === 401 && !isHandling401) {
      isHandling401 = true
      try {
        // Clear token
        localStorage.removeItem('jwt_token')
        // Redirect to login if not already there
        if (window.location.pathname !== '/login' && window.location.pathname !== '/onetime') {
          window.location.href = '/login'
        }
      } finally {
        isHandling401 = false
      }
      return Promise.reject(error)
    }

    // Retry logic for network errors and 5xx (up to 3 retries with exponential backoff)
    const shouldRetry = 
      !originalRequest._retry &&
      (!error.response || (error.response.status >= 500 && error.response.status < 600)) &&
      (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK' || !error.response)

    if (shouldRetry) {
      originalRequest._retry = true
      originalRequest._retryCount = (originalRequest._retryCount || 0) + 1
      const delay = Math.min(1000 * Math.pow(2, (originalRequest._retryCount || 0)), 10000)
      await new Promise(resolve => setTimeout(resolve, delay))
      return apiClient(originalRequest)
    }

    return Promise.reject(error)
  }
)

export const createApiClient = (): AxiosInstance => {
  return apiClient
}

// Create EventSource for SSE with token in Authorization header (via cookie or custom implementation)
export const createEventSource = (endpoint: string): EventSource => {
  const token = localStorage.getItem('jwt_token')
  const baseUrl = getBaseUrl()
  
  // For SSE, we pass token as query param since EventSource doesn't support custom headers
  // Note: This is a security consideration - token is visible in URL
  const tokenQuery = token ? `?token=${encodeURIComponent(token)}` : ''
  const fullUrl = `${baseUrl}${endpoint}${tokenQuery}`
  return new EventSource(fullUrl)
}

// Export for testing
export { apiClient }