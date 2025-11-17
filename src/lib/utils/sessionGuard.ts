import { firebaseAuthService } from '@/lib/services/firebaseAuthService'
import { sessionService } from '@/lib/services/sessionService'
import { toast } from '@/lib/utils/toast'

let isHandlingUnauthorized = false

export async function handleUnauthorizedSession() {
  if (isHandlingUnauthorized) {
    return
  }

  isHandlingUnauthorized = true
  try {
    sessionService.clearSessionToken()
    await firebaseAuthService.signOut()
    toast.error('Your session has expired because your account was used on another device.')
  } catch (error) {
    console.error('Error handling unauthorized session:', error)
  } finally {
    isHandlingUnauthorized = false
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
  }
}


