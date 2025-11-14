import { auth } from '@/lib/config/firebase'
import { cacheService } from './cacheService'

// Route through Next.js rewrite proxy to avoid CORS/proxy issues
const API_BASE_URL = '/api'

export interface Category {
  id: string
  name: string
  type: string
  color: string
  description?: string
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data?: T
}

class CategoryService {
  private async getAuthHeaders(): Promise<HeadersInit> {
    const token = await this.getFirebaseIdToken()
    
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }

  private async getFirebaseIdToken(): Promise<string> {
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

  async fetchCategories(type?: string): Promise<ApiResponse<Category[]>> {
    try {
      // Wait for authentication if user is not immediately available
      if (!auth.currentUser) {
        await this.waitForAuth()
      }
      
      const userId = auth.currentUser?.uid
      
      // Normalize type to uppercase for consistent caching
      const normalizedType = type ? type.toUpperCase() : undefined
      
      // Check cache first
      const cached = cacheService.getCategories(normalizedType, userId)
      if (cached) {
        return {
          success: true,
          message: 'Categories retrieved from cache',
          data: cached
        }
      }
      
      // Get the token explicitly to ensure it's available
      const token = await this.getFirebaseIdToken()
      
      // Convert type to uppercase (EXPENSE/INCOME) as backend expects
      const requestBody = normalizedType ? { type: normalizedType } : {}
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
      
      const response = await fetch(`${API_BASE_URL}/category/list`, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        const errorText = await response.text()
        let errorData
        try {
          errorData = JSON.parse(errorText)
        } catch {
          errorData = { message: errorText || `HTTP ${response.status}: ${response.statusText}` }
        }
        return {
          success: false,
          message: errorData.message || `HTTP ${response.status}: ${response.statusText}`,
          data: []
        }
      }

      const data = await response.json()
      
      // Backend returns { success, message, data: { categories: [...] } }
      // Transform to { success, message, data: [...] }
      const categories = data.data?.categories || (Array.isArray(data.data) ? data.data : [])
      
      // Cache the result
      if (data.success === true || data.success === "true") {
        cacheService.setCategories(categories, normalizedType, userId)
      }
      
      return {
        success: data.success === true || data.success === "true",
        message: data.message || '',
        data: Array.isArray(categories) ? categories : []
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('not authenticated')) {
        return {
          success: false,
          message: 'User not authenticated. Please log in again.',
          data: []
        }
      }
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch categories',
        data: []
      }
    }
  }

  async createCategory(categoryData: {
    name: string
    type: string
    color: string
    description?: string
  }): Promise<ApiResponse<Category>> {
    try {
      // Wait for authentication if user is not immediately available
      if (!auth.currentUser) {
        await this.waitForAuth()
      }
      
      const headers = await this.getAuthHeaders()
      
      const response = await fetch(`${API_BASE_URL}/category/create`, {
        method: 'POST',
        headers,
        body: JSON.stringify(categoryData)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        return {
          success: false,
          message: errorData.message || `HTTP ${response.status}: ${response.statusText}`
        }
      }

      const data = await response.json()
      
      // Invalidate categories cache on create
      if (data.success) {
        const userId = auth.currentUser?.uid
        cacheService.invalidateCategories(userId)
      }
      
      return data
    } catch (error) {
      if (error instanceof Error && error.message.includes('not authenticated')) {
        return {
          success: false,
          message: 'User not authenticated. Please log in again.'
        }
      }
      return {
        success: false,
        message: 'Failed to create category'
      }
    }
  }

  async updateCategory(categoryData: {
    id: string
    name: string
    type: string
    color: string
    description?: string
  }): Promise<ApiResponse<Category>> {
    try {
      // Wait for authentication if user is not immediately available
      if (!auth.currentUser) {
        await this.waitForAuth()
      }
      
      const headers = await this.getAuthHeaders()
      
      const response = await fetch(`${API_BASE_URL}/category/update`, {
        method: 'POST',
        headers,
        body: JSON.stringify(categoryData)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        return {
          success: false,
          message: errorData.message || `HTTP ${response.status}: ${response.statusText}`
        }
      }

      const data = await response.json()
      
      // Invalidate categories cache on update
      if (data.success) {
        const userId = auth.currentUser?.uid
        cacheService.invalidateCategories(userId)
      }
      
      return data
    } catch (error) {
      if (error instanceof Error && error.message.includes('not authenticated')) {
        return {
          success: false,
          message: 'User not authenticated. Please log in again.'
        }
      }
      return {
        success: false,
        message: 'Failed to update category'
      }
    }
  }

  async deleteCategory(categoryId: string): Promise<ApiResponse<any>> {
    try {
      // Wait for authentication if user is not immediately available
      if (!auth.currentUser) {
        await this.waitForAuth()
      }
      
      const headers = await this.getAuthHeaders()
      
      const response = await fetch(`${API_BASE_URL}/category/delete`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ id: categoryId })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        return {
          success: false,
          message: errorData.message || `HTTP ${response.status}: ${response.statusText}`
        }
      }

      const data = await response.json()
      
      // Invalidate categories cache on delete
      if (data.success) {
        const userId = auth.currentUser?.uid
        cacheService.invalidateCategories(userId)
      }
      
      return data
    } catch (error) {
      if (error instanceof Error && error.message.includes('not authenticated')) {
        return {
          success: false,
          message: 'User not authenticated. Please log in again.'
        }
      }
      return {
        success: false,
        message: 'Failed to delete category'
      }
    }
  }
}

export const categoryService = new CategoryService()

