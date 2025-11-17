import { auth } from '@/lib/config/firebase'
import { authService } from '@/lib/services/authService'

const SESSION_STORAGE_KEY = 'centsail_session_token'

class SessionService {
  private generateToken(): string {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID()
    }
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`
  }

  getSessionToken(): string | null {
    if (typeof window === 'undefined') return null
    return window.localStorage.getItem(SESSION_STORAGE_KEY)
  }

  setSessionToken(token: string) {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(SESSION_STORAGE_KEY, token)
  }

  clearSessionToken() {
    if (typeof window === 'undefined') return
    window.localStorage.removeItem(SESSION_STORAGE_KEY)
  }

  requireSessionToken(): string {
    const token = this.getSessionToken()
    if (!token) {
      throw new Error('Session token not found. Please log in again.')
    }
    return token
  }

  async registerSession(): Promise<void> {
    const user = auth.currentUser
    if (!user) {
      throw new Error('User not authenticated')
    }

    this.clearSessionToken()
    const sessionToken = this.generateToken()
    const idToken = await user.getIdToken()

    const response = await authService.registerSession(sessionToken, idToken)
    if (!response.success) {
      throw new Error(response.message || 'Failed to register session')
    }

    this.setSessionToken(sessionToken)
  }

  async clearSessionOnServer(): Promise<void> {
    const user = auth.currentUser
    if (!user) {
      this.clearSessionToken()
      return
    }

    try {
      const storedToken = this.getSessionToken()
      if (!storedToken) {
        return
      }
      const idToken = await user.getIdToken()
      await authService.clearSession(idToken)
    } catch (error) {
      console.error('Failed to clear session on server:', error)
    } finally {
      this.clearSessionToken()
    }
  }
}

export const sessionService = new SessionService()


