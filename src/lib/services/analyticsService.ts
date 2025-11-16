import { auth } from '@/lib/config/firebase'
import { cacheService } from './cacheService'

const API_BASE_URL = '/api'

export interface CategoryExpenseData {
  categoryId: string
  categoryName: string
  amount: number
}

export interface DashboardAnalyticsResponse {
  categories: CategoryExpenseData[]
  totalExpenses: number
  totalIncome: number
  totalBalance: number
}

export interface ExpenseBreakdownCategory {
  categoryId: string
  categoryName: string
  amount: number
  percentage: number
  color: string
}

export interface ExpenseBreakdownResponse {
  categories: ExpenseBreakdownCategory[]
  totalExpenses: number
}

export interface MonthlyTrend {
  month: string
  monthFull: string
  income: number
  expenses: number
}

export interface MonthlyTrendsResponse {
  trends: MonthlyTrend[]
}

export interface SummaryResponse {
  totalIncome: number
  totalExpenses: number
  incomeChange: number
  expensesChange: number
}

export interface SavingsRateResponse {
  savingsRate: number
  savingsAmount: number
  totalIncome: number
  totalExpenses: number
}

export interface ApiResponse<T = unknown> {
  success: boolean
  message?: string
  data?: T
}

export interface AnalyticsRequestDTO {
  months?: number
}

class AnalyticsService {
  private async getAuthHeaders(): Promise<HeadersInit> {
    const token = await this.getFirebaseIdToken()
    
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }

  private async waitForAuth(): Promise<void> {
    return new Promise((resolve, reject) => {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        unsubscribe()
        if (user) {
          resolve()
        } else {
          reject(new Error('User not authenticated'))
        }
      })
    })
  }

  private async getFirebaseIdToken(): Promise<string> {
    // Wait for authentication if user is not immediately available
    if (!auth.currentUser) {
      await this.waitForAuth()
    }
    
    const user = auth.currentUser
    if (!user) {
      throw new Error('User not authenticated')
    }
    
    try {
      const token = await user.getIdToken()
      return token
    } catch (error) {
      console.error('Error getting Firebase ID token:', error)
      throw new Error('Failed to get authentication token')
    }
  }

  async getDashboardAnalytics(): Promise<ApiResponse<DashboardAnalyticsResponse>> {
    try {
      const userId = auth.currentUser?.uid
      
      if (!userId) {
        // If no userId, proceed without cache
      } else {
        const cacheKey = `dashboard-analytics-${userId}`
        
        // Check cache first
        const cached = cacheService.getDashboard(cacheKey)
        if (cached) {
          return {
            success: true,
            message: 'Dashboard analytics retrieved from cache',
            data: cached
          }
        }
      }
      
      const headers = await this.getAuthHeaders()
      
      const response = await fetch(`${API_BASE_URL}/analytics/dashboard`, {
        method: 'POST',
        headers,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        return {
          success: false,
          message: errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        }
      }

      const data = await response.json()
      
      // Cache the result (reuse userId from above)
      if (data.success && data.data && userId) {
        const cacheKey = `dashboard-analytics-${userId}`
        cacheService.setDashboard(cacheKey, data.data)
      }
      
      return data
    } catch (error) {
      console.error('Error fetching dashboard analytics:', error)
      if (error instanceof Error && error.message.includes('not authenticated')) {
        return {
          success: false,
          message: 'User not authenticated. Please log in again.',
        }
      }
      return {
        success: false,
        message: 'Failed to fetch dashboard analytics',
      }
    }
  }

  async getSummary(): Promise<ApiResponse<SummaryResponse>> {
    try {
      const userId = auth.currentUser?.uid
      const cacheKey = `summary-${userId}`
      
      // Check cache first
      const cached = cacheService.getAnalytics(cacheKey)
      if (cached) {
        return {
          success: true,
          message: 'Summary retrieved from cache',
          data: cached
        }
      }
      
      const headers = await this.getAuthHeaders()
      
      const response = await fetch(`${API_BASE_URL}/analytics/summary`, {
        method: 'POST',
        headers,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        return {
          success: false,
          message: errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        }
      }

      const data = await response.json()
      
      // Cache the result
      if (data.success && data.data) {
        cacheService.setAnalytics(cacheKey, data.data)
      }
      
      return data
    } catch (error) {
      console.error('Error fetching summary:', error)
      if (error instanceof Error && error.message.includes('not authenticated')) {
        return {
          success: false,
          message: 'User not authenticated. Please log in again.',
        }
      }
      return {
        success: false,
        message: 'Failed to fetch summary',
      }
    }
  }

  async getExpenseBreakdown(): Promise<ApiResponse<ExpenseBreakdownResponse>> {
    try {
      const userId = auth.currentUser?.uid
      const cacheKey = `expense-breakdown-${userId}`
      
      // Check cache first
      const cached = cacheService.getAnalytics(cacheKey)
      if (cached) {
        return {
          success: true,
          message: 'Expense breakdown retrieved from cache',
          data: cached
        }
      }
      
      const headers = await this.getAuthHeaders()
      
      const response = await fetch(`${API_BASE_URL}/analytics/expense-breakdown`, {
        method: 'POST',
        headers,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        return {
          success: false,
          message: errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        }
      }

      const data = await response.json()
      
      // Cache the result
      if (data.success && data.data) {
        cacheService.setAnalytics(cacheKey, data.data)
      }
      
      return data
    } catch (error) {
      console.error('Error fetching expense breakdown:', error)
      if (error instanceof Error && error.message.includes('not authenticated')) {
        return {
          success: false,
          message: 'User not authenticated. Please log in again.',
        }
      }
      return {
        success: false,
        message: 'Failed to fetch expense breakdown',
      }
    }
  }

  async getMonthlyTrends(months: number = 6): Promise<ApiResponse<MonthlyTrendsResponse>> {
    try {
      const userId = auth.currentUser?.uid
      const cacheKey = `monthly-trends-${months}-${userId}`
      
      // Check cache first
      const cached = cacheService.getAnalytics(cacheKey)
      if (cached) {
        return {
          success: true,
          message: 'Monthly trends retrieved from cache',
          data: cached
        }
      }
      
      const headers = await this.getAuthHeaders()
      
      const response = await fetch(`${API_BASE_URL}/analytics/monthly-trends`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ months }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        return {
          success: false,
          message: errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        }
      }

      const data = await response.json()
      
      // Cache the result
      if (data.success && data.data) {
        cacheService.setAnalytics(cacheKey, data.data)
      }
      
      return data
    } catch (error) {
      console.error('Error fetching monthly trends:', error)
      if (error instanceof Error && error.message.includes('not authenticated')) {
        return {
          success: false,
          message: 'User not authenticated. Please log in again.',
        }
      }
      return {
        success: false,
        message: 'Failed to fetch monthly trends',
      }
    }
  }

  async getSavingsRate(): Promise<ApiResponse<SavingsRateResponse>> {
    try {
      const userId = auth.currentUser?.uid
      const cacheKey = `savings-rate-${userId}`
      
      // Check cache first
      const cached = cacheService.getAnalytics(cacheKey)
      if (cached) {
        return {
          success: true,
          message: 'Savings rate retrieved from cache',
          data: cached
        }
      }
      
      const headers = await this.getAuthHeaders()
      
      const response = await fetch(`${API_BASE_URL}/analytics/savings-rate`, {
        method: 'POST',
        headers,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        return {
          success: false,
          message: errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        }
      }

      const data = await response.json()
      
      // Cache the result
      if (data.success && data.data) {
        cacheService.setAnalytics(cacheKey, data.data)
      }
      
      return data
    } catch (error) {
      console.error('Error fetching savings rate:', error)
      if (error instanceof Error && error.message.includes('not authenticated')) {
        return {
          success: false,
          message: 'User not authenticated. Please log in again.',
        }
      }
      return {
        success: false,
        message: 'Failed to fetch savings rate',
      }
    }
  }
}

export const analyticsService = new AnalyticsService()

