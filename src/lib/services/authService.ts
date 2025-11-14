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
}

export const authService = new AuthService()


