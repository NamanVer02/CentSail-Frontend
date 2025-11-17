import { auth } from '@/lib/config/firebase'
import { sessionService } from './sessionService'
import { handleUnauthorizedSession } from '@/lib/utils/sessionGuard'

const API_BASE_URL = '/api'

export interface ChatHistoryTurn {
  role: 'USER' | 'ASSISTANT'
  content: string
}

export interface ChatRequest {
  question: string
  startDate?: string
  endDate?: string
  type?: string
  categoryId?: string
  history?: ChatHistoryTurn[]
}

export interface ChatResponse {
  success: boolean
  answer?: string
  message?: string
}

class ChatService {
  private async getAuthHeaders(): Promise<HeadersInit> {
    const token = await this.getFirebaseIdToken()
    const sessionToken = sessionService.getSessionToken()
    if (!sessionToken) {
      throw new Error('Session expired. Please log in again.')
    }
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'X-Session-Token': sessionToken
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

  async query(req: ChatRequest): Promise<ChatResponse> {
    try {
      const headers = await this.getAuthHeaders()
      const response = await fetch(`${API_BASE_URL}/chat/query`, {
        method: 'POST',
        headers,
        body: JSON.stringify(req)
      })
      if (response.status === 401) {
        await handleUnauthorizedSession()
        return { success: false, message: 'Session expired. Please log in again.' }
      }
      if (!response.ok) {
        const text = await response.text().catch(() => '')
        try {
          const data = JSON.parse(text) as ChatResponse
          return { success: false, message: data.message || 'Unable to process request.' }
        } catch {
          return { success: false, message: 'Unable to process request.' }
        }
      }
      const data = await response.json()
      return data as ChatResponse
    } catch (error) {
      console.error('Error querying chat:', error)
      return { success: false, message: error instanceof Error ? error.message : 'Unable to process request.' }
    }
  }
}

export const chatService = new ChatService()


