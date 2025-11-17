"use client"

import { FormEvent, useState } from "react"
import { useRouter } from "next/navigation"
import { firebaseAuthService } from "@/lib/services/firebaseAuthService"
import { authService } from "@/lib/services/authService"
import { sessionService } from "@/lib/services/sessionService"
import { toast } from "@/lib/utils/toast"
import Input from "@/app/components/ui/Input"
import Button from "@/app/components/ui/Button"
import Silk from '@/components/Silk'
import { useSilkSettings } from '@/lib/hooks/useSilkSettings'

export default function LoginPage() {
  const silkSettings = useSilkSettings()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleEmailLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      await firebaseAuthService.signIn(email.trim(), password)
      try {
        await sessionService.registerSession()
      } catch (sessionError: any) {
        await firebaseAuthService.signOut()
        throw new Error(sessionError?.message || 'Failed to start session. Please try again.')
      }
      toast.success("Login successful!")
      router.push("/dashboard")
    } catch (err: any) {
      setError(err.message || "Failed to sign in")
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    setError("")

    try {
      const result = await firebaseAuthService.signInWithGoogle()
      const { user, isNewUser } = result

      // Always call backend signup to ensure user exists in backend and has default categories
      // The backend's ensureDefaultCategories is idempotent, so it's safe to call multiple times
      if (user.email) {
        try {
          const signupResponse = await authService.signup({
            username: user.displayName || user.email.split("@")[0],
            email: user.email,
            password: "",
            uid: user.uid,
          })

          if (!signupResponse.success) {
            console.error("Backend signup failed:", signupResponse.message)
            // Continue anyway - user is authenticated in Firebase
          }
        } catch (backendErr) {
          console.error("Backend signup error:", backendErr)
          // Continue anyway - user is authenticated in Firebase
        }
      }

      try {
        await sessionService.registerSession()
      } catch (sessionError: any) {
        await firebaseAuthService.signOut()
        throw new Error(sessionError?.message || 'Failed to start session. Please try again.')
      }

      toast.success(isNewUser ? "Account created successfully!" : "Login successful!")
      router.push("/dashboard")
    } catch (err: any) {
      setError(err.message || "Failed to sign in with Google")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 md:p-8 relative overflow-hidden">
      {/* Silk Background */}
      <div className="fixed inset-0 z-0 w-full h-full pointer-events-none">
        <Silk
          speed={silkSettings.speed}
          scale={silkSettings.scale}
          color={silkSettings.color}
          noiseIntensity={silkSettings.noiseIntensity}
          rotation={silkSettings.rotation}
        />
      </div>

      <div className="w-full max-w-md space-y-6 relative z-10 px-4">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-20 h-20 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-full h-full text-white">
                <path d="M 50 20 L 50 60 L 75 60 Z" fill="currentColor" />
                <ellipse cx="50" cy="70" rx="20" ry="4" fill="currentColor" />
                <path d="M 30 70 Q 40 65, 50 65 T 70 70" fill="none" stroke="currentColor" strokeWidth="2" />
                <path d="M 20 75 Q 25 73, 30 75 T 40 75 T 50 75 T 60 75 T 70 75 T 80 75" fill="none" stroke="currentColor" strokeWidth="1.5" />
                <path d="M 15 80 Q 20 78, 25 80 T 35 80 T 45 80 T 55 80 T 65 80 T 75 80 T 85 80" fill="none" stroke="currentColor" strokeWidth="1.5" />
                <line x1="50" y1="20" x2="50" y2="65" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>
          </div>

          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-wide">CentSail</h1>
            <p className="text-white/70 text-sm mt-2">Your Financial Voyage</p>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-white text-center">Welcome Back</h2>
            <p className="text-white/70 text-sm text-center">Sign in to continue</p>
          </div>

          <form onSubmit={handleEmailLogin} className="space-y-4">
            <Input
              type="email"
              id="login-email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              required
            />
            <Input
              type="password"
              id="login-password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
            />
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <span className="w-full border-t border-white/20" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-[rgba(0,0,0,0.2)] px-3 text-white/70">or continue with</span>
            </div>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 p-4 bg-white/10 hover:bg-white/20 rounded-xl transition-colors border border-white/20 disabled:opacity-50"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="text-white font-medium">Continue with Google</span>
          </button>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm">
              {error}
            </div>
          )}
        </div>

        <div className="text-center text-sm text-white/70">
          Don't have an account?{' '}
          <a href="/signup" className="text-white font-medium hover:underline">
            Sign up
          </a>
        </div>
      </div>
    </div>
  )
}

