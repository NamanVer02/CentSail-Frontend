import { auth } from '@/lib/config/firebase'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

export interface Entry {
  id: string
  userId: string
  title: string
  type: string
  amount: number
  categoryId: string
  date: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface EntryRequest {
  userId: string
  title: string
  type: string // EXPENSE or INCOME
  amount: number
  categoryId: string
  date: string
  notes?: string
}

export interface ListRequest {
  userId: string
  startDate?: string
  endDate?: string
  type?: string
  categoryId?: string
  limit?: number
  offset?: number
}

export interface UpdateRequest {
  id: string
  userId: string
  title: string
  type: string
  amount: number
  categoryId: string
  date: string
  notes?: string
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data?: T
}

class EntryService {
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

  async createEntry(entryData: EntryRequest): Promise<ApiResponse<Entry>> {
    try {
      const headers = await this.getAuthHeaders()
      
      const response = await fetch(`${API_BASE_URL}/entry/create`, {
        method: 'POST',
        headers,
        body: JSON.stringify(entryData)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        return {
          success: false,
          message: errorData.message || `HTTP ${response.status}: ${response.statusText}`
        }
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error creating entry:', error)
      if (error instanceof Error && error.message.includes('not authenticated')) {
        return {
          success: false,
          message: 'User not authenticated. Please log in again.'
        }
      }
      return {
        success: false,
        message: 'Failed to create entry'
      }
    }
  }

  async getEntries(listRequest: ListRequest): Promise<ApiResponse<Entry[]>> {
    try {
      const headers = await this.getAuthHeaders()
      
      const response = await fetch(`${API_BASE_URL}/entry/list`, {
        method: 'POST',
        headers,
        body: JSON.stringify(listRequest)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        return {
          success: false,
          message: errorData.message || `HTTP ${response.status}: ${response.statusText}`,
          data: []
        }
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error fetching entries:', error)
      if (error instanceof Error && error.message.includes('not authenticated')) {
        return {
          success: false,
          message: 'User not authenticated. Please log in again.',
          data: []
        }
      }
      return {
        success: false,
        message: 'Failed to fetch entries',
        data: []
      }
    }
  }

  async getEntry(entryId: string): Promise<ApiResponse<Entry>> {
    try {
      const headers = await this.getAuthHeaders()
      
      const response = await fetch(`${API_BASE_URL}/entry/get`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ id: entryId })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        return {
          success: false,
          message: errorData.message || `HTTP ${response.status}: ${response.statusText}`
        }
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error fetching entry:', error)
      if (error instanceof Error && error.message.includes('not authenticated')) {
        return {
          success: false,
          message: 'User not authenticated. Please log in again.'
        }
      }
      return {
        success: false,
        message: 'Failed to fetch entry'
      }
    }
  }

  async updateEntry(updateData: UpdateRequest): Promise<ApiResponse<Entry>> {
    try {
      const headers = await this.getAuthHeaders()
      
      const response = await fetch(`${API_BASE_URL}/entry/update`, {
        method: 'POST',
        headers,
        body: JSON.stringify(updateData)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        return {
          success: false,
          message: errorData.message || `HTTP ${response.status}: ${response.statusText}`
        }
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error updating entry:', error)
      if (error instanceof Error && error.message.includes('not authenticated')) {
        return {
          success: false,
          message: 'User not authenticated. Please log in again.'
        }
      }
      return {
        success: false,
        message: 'Failed to update entry'
      }
    }
  }

  async deleteEntry(entryId: string): Promise<ApiResponse<any>> {
    try {
      const headers = await this.getAuthHeaders()
      
      const response = await fetch(`${API_BASE_URL}/entry/delete`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ id: entryId })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        return {
          success: false,
          message: errorData.message || `HTTP ${response.status}: ${response.statusText}`
        }
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error deleting entry:', error)
      if (error instanceof Error && error.message.includes('not authenticated')) {
        return {
          success: false,
          message: 'User not authenticated. Please log in again.'
        }
      }
      return {
        success: false,
        message: 'Failed to delete entry'
      }
    }
  }
}

export const entryService = new EntryService()

