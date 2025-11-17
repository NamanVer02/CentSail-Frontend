import { sessionService } from './sessionService'

// Route through Next.js rewrite proxy to avoid CORS/proxy issues
const API_BASE_URL = '/api'

export interface SignupPayload {
  username: string
  email: string
  password?: string
  mobileNumber?: string
  uid?: string
}

export interface ApiResponse<T = unknown> {
  success: boolean
  message?: string
  data?: T
}

class AuthService {
  async signup(payload: SignupPayload): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const text = await response.text()
      const json = text ? JSON.parse(text) : {}

      if (!response.ok) {
        return {
          success: false,
          message: json.message || `HTTP ${response.status}: ${response.statusText}`,
        }
      }

      return {
        success: true,
        message: json.message || 'User created successfully',
      }
    } catch (error) {
      console.error('Signup API error:', error)
      return { success: false, message: 'Failed to sign up. Please try again.' }
    }
  }

  async deleteAccount(idToken: string): Promise<ApiResponse> {
    try {
      const sessionToken = sessionService.getSessionToken()
      const response = await fetch(`${API_BASE_URL}/auth/delete-account`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
          ...(sessionToken ? { 'X-Session-Token': sessionToken } : {}),
        },
      })

      const text = await response.text()
      const json = text ? JSON.parse(text) : {}

      if (!response.ok) {
        return {
          success: false,
          message: json.message || `HTTP ${response.status}: ${response.statusText}`,
        }
      }

      return {
        success: true,
        message: json.message || 'Account deletion initiated successfully',
      }
    } catch (error) {
      console.error('Delete account API error:', error)
      return { success: false, message: 'Failed to delete account. Please try again.' }
    }
  }

  async registerSession(sessionToken: string, idToken: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({ sessionToken }),
      })

      const text = await response.text()
      const json = text ? JSON.parse(text) : {}

      if (!response.ok) {
        return {
          success: false,
          message: json.message || `HTTP ${response.status}: ${response.statusText}`,
        }
      }

      return {
        success: true,
        message: json.message || 'Session registered successfully',
      }
    } catch (error) {
      console.error('Register session API error:', error)
      return { success: false, message: 'Failed to register session. Please try again.' }
    }
  }

  async clearSession(idToken: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/session`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
      })

      const text = await response.text()
      const json = text ? JSON.parse(text) : {}

      if (!response.ok) {
        return {
          success: false,
          message: json.message || `HTTP ${response.status}: ${response.statusText}`,
        }
      }

      return {
        success: true,
        message: json.message || 'Session cleared successfully',
      }
    } catch (error) {
      console.error('Clear session API error:', error)
      return { success: false, message: 'Failed to clear session. Please try again.' }
    }
  }
}

export const authService = new AuthService()


