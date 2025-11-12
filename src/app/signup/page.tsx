'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { FiMail, FiPhone, FiUser, FiArrowLeft } from 'react-icons/fi'
import { firebaseAuthService } from '@/lib/services/firebaseAuthService'
import { authService } from '@/lib/services/authService'
import { toast } from '@/lib/utils/toast'
import { RecaptchaVerifier, ConfirmationResult } from 'firebase/auth'
import Input from '@/app/components/ui/Input'
import Button from '@/app/components/ui/Button'

type AuthMethod = 'phone' | 'email' | 'google' | null
type SignupStep = 1 | 2 | 3

export default function SignupPage() {
  const router = useRouter()
  const [step, setStep] = useState<SignupStep>(1)
  const [authMethod, setAuthMethod] = useState<AuthMethod>(null)
  const [countryCode, setCountryCode] = useState('+1')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [storedPassword, setStoredPassword] = useState('') // Store password for backend signup
  const [otp, setOtp] = useState('')
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null)
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null)
  const recaptchaContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    return () => {
      // Cleanup reCAPTCHA on unmount
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear()
        } catch (e) {
          console.log('Error clearing reCAPTCHA:', e)
        }
        recaptchaVerifierRef.current = null
      }
    }
  }, [])

  const handleMethodSelect = (method: AuthMethod) => {
    setAuthMethod(method)
    setError('')
    
    if (method === 'google') {
      handleGoogleSignup()
    }
  }

  const handleGoogleSignup = async () => {
    setIsLoading(true)
    setError('')
    
    try {
      const user = await firebaseAuthService.signInWithGoogle()
      
      // Create user in backend
      if (user.email) {
        await authService.signup({
          username: user.displayName || user.email.split('@')[0],
          email: user.email,
          password: '', // Google OAuth doesn't need password
        })
      }
      
      toast.success('Account created successfully!')
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Failed to sign up with Google')
      setIsLoading(false)
    }
  }

  const countryOptions = [
    { code: '+1', label: 'US/Canada (+1)' },
    { code: '+44', label: 'UK (+44)' },
    { code: '+91', label: 'India (+91)' },
    { code: '+61', label: 'Australia (+61)' },
    { code: '+81', label: 'Japan (+81)' },
    { code: '+49', label: 'Germany (+49)' },
    { code: '+33', label: 'France (+33)' },
  ]

  const handlePhoneSubmit = async () => {
    if (!phoneNumber.trim()) {
      setError('Please enter a valid phone number')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      // Clear existing verifier if any
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear()
        } catch (e) {
          console.log('Error clearing old reCAPTCHA:', e)
        }
        recaptchaVerifierRef.current = null
      }

      // Wait a bit for DOM to be ready
      await new Promise(resolve => setTimeout(resolve, 100))

      // Create new verifier with visible widget
      if (!recaptchaContainerRef.current) {
        throw new Error('reCAPTCHA container not found. Please refresh the page.')
      }
      
      recaptchaVerifierRef.current = firebaseAuthService.createRecaptchaVerifier('recaptcha-container', 'normal')
      await recaptchaVerifierRef.current.render()

      const digitsOnly = phoneNumber.replace(/\D/g, '')
      if (!digitsOnly) {
        setError('Please enter a valid phone number')
        setIsLoading(false)
        return
      }

      const formattedPhone = `${countryCode}${digitsOnly}`
      const confirmation = await firebaseAuthService.signUpWithPhone(formattedPhone, recaptchaVerifierRef.current)
      setConfirmationResult(confirmation)
      
      // Clear reCAPTCHA after successful send
      if (recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current.clear()
        recaptchaVerifierRef.current = null
      }
      
      setStep(2)
      toast.success('OTP sent to your phone!')
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP. Please try again.')
      // Clear verifier on error
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear()
        } catch (e) {
          console.log('Error clearing reCAPTCHA on error:', e)
        }
        recaptchaVerifierRef.current = null
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmailSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please enter email and password')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      // Store password for backend signup later
      setStoredPassword(password)
      
      // Create user with email/password
      await firebaseAuthService.signUp(email, password)
      
      // For email signup, skip OTP and go directly to name step
      setStep(3)
      toast.success('Account created! Please enter your name')
    } catch (err: any) {
      setError(err.message || 'Failed to create account')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOTPSubmit = async () => {
    if (!otp.trim() || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      if (authMethod === 'phone' && confirmationResult) {
        // For phone, verify OTP and then go to name step
        await firebaseAuthService.verifyPhoneOTP(confirmationResult, otp)
        setStep(3)
        toast.success('Phone verified!')
      }
    } catch (err: any) {
      setError(err.message || 'Invalid OTP')
    } finally {
      setIsLoading(false)
    }
  }

  const handleNameSubmit = async () => {
    if (!name.trim()) {
      setError('Please enter your name')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const user = firebaseAuthService.getCurrentUser()
      if (user) {
        // Update profile with name
        const { updateProfile } = await import('firebase/auth')
        const { auth } = await import('@/lib/config/firebase')
        if (auth.currentUser) {
          await updateProfile(auth.currentUser, { displayName: name })
        }
        
        // Create user in backend if not exists
        if (user.email) {
          try {
            await authService.signup({
              username: name,
              email: user.email,
              password: storedPassword || '', // Use stored password if available
            })
          } catch (backendErr) {
            // User might already exist in backend, that's okay
            console.log('Backend signup:', backendErr)
          }
        }
      }

      toast.success('Account created successfully!')
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Failed to complete signup')
      setIsLoading(false)
    }
  }

  const isProgressStep = step > 1
  const getProgressInfo = () => {
    if (!isProgressStep) return { current: 0, total: 0, percent: 0 }

    if (authMethod === 'phone') {
      const total = 2 // OTP, Name
      const current = step === 2 ? 1 : 2
      const percent = (current / total) * 100
      return { current, total, percent }
    }

    if (authMethod === 'email') {
      const total = 1 // Name only
      const current = 1
      const percent = 100
      return { current, total, percent }
    }

    return { current: 0, total: 0, percent: 0 }
  }

  const { current: progressCurrent, total: progressTotal, percent: progressPercent } = getProgressInfo()

  return (
    <div className="min-h-screen w-full bg-[radial-gradient(ellipse_at_center,_#1a7370_0%,_#0c504a_100%)] flex items-center justify-center p-6 md:p-8 relative overflow-hidden">
      {/* Decorative dots pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-full h-48 bg-[radial-gradient(circle,_rgba(255,255,255,0.3)_1px,_transparent_1px)] bg-[size:20px_20px]"></div>
      </div>

      <div className="w-full max-w-md space-y-6 relative z-10 px-4">
        {/* Logo and App Name */}
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

        {/* Progress Bar */}
        {isProgressStep && progressTotal > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-white/60 mb-1">
              <span>Step {progressCurrent} of {progressTotal}</span>
              <span>{Math.round(progressPercent)}%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-white h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Step Content */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-white text-center">Create Account</h2>
              <p className="text-white/70 text-sm text-center">Choose how you'd like to sign up</p>

              <div className="space-y-3">
                <button
                  onClick={() => handleMethodSelect('phone')}
                  className="w-full flex items-center gap-3 p-4 bg-white/10 hover:bg-white/20 rounded-xl transition-colors border border-white/20"
                >
                  <FiPhone className="text-2xl text-white" />
                  <span className="text-white font-medium">Continue with Phone</span>
                </button>

                <button
                  onClick={() => handleMethodSelect('email')}
                  className="w-full flex items-center gap-3 p-4 bg-white/10 hover:bg-white/20 rounded-xl transition-colors border border-white/20"
                >
                  <FiMail className="text-2xl text-white" />
                  <span className="text-white font-medium">Continue with Email</span>
                </button>

                <button
                  onClick={() => handleMethodSelect('google')}
                  disabled={isLoading}
                  className="w-full flex items-center gap-3 p-4 bg-white/10 hover:bg-white/20 rounded-xl transition-colors border border-white/20 disabled:opacity-50"
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="text-white font-medium">Continue with Google</span>
                </button>
              </div>

              {authMethod === 'phone' && (
                <div className="space-y-4 pt-4">
                  <div className="flex gap-2">
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="bg-white/10 border border-white/20 text-white rounded-xl px-3 py-3 focus:outline-none focus:ring-2 focus:ring-white/40"
                    >
                      {countryOptions.map((option) => (
                        <option key={option.code} value={option.code} className="bg-[#0c504a] text-white">
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <Input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="Enter phone number"
                      required
                      className="flex-1"
                    />
                  </div>
                  <Button onClick={handlePhoneSubmit} disabled={isLoading} className="w-full">
                    {isLoading ? 'Sending...' : 'Send OTP'}
                  </Button>
                </div>
              )}

              {authMethod === 'email' && (
                <div className="space-y-4 pt-4">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email address"
                    required
                  />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create password"
                    required
                  />
                  <Button onClick={handleEmailSubmit} disabled={isLoading} className="w-full">
                    {isLoading ? 'Creating...' : 'Continue'}
                  </Button>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <button
                onClick={() => setStep(1)}
                className="text-white/70 hover:text-white transition-colors"
              >
                <FiArrowLeft className="inline mr-2" />
                Back
              </button>
              <h2 className="text-2xl font-semibold text-white text-center">Enter OTP</h2>
              <p className="text-white/70 text-sm text-center">
                {authMethod === 'phone' 
                  ? 'We sent a code to your phone' 
                  : 'We sent a code to your email'}
              </p>

              <div className="space-y-4">
                <Input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                  required
                  className="text-center text-2xl tracking-widest"
                />
                <Button onClick={handleOTPSubmit} disabled={isLoading} className="w-full">
                  {isLoading ? 'Verifying...' : 'Verify OTP'}
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <button
                onClick={() => setStep(2)}
                className="text-white/70 hover:text-white transition-colors"
              >
                <FiArrowLeft className="inline mr-2" />
                Back
              </button>
              <h2 className="text-2xl font-semibold text-white text-center">What's your name?</h2>
              <p className="text-white/70 text-sm text-center">This is how we'll address you</p>

              <div className="space-y-4">
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
                <Button onClick={handleNameSubmit} disabled={isLoading} className="w-full">
                  {isLoading ? 'Creating Account...' : 'Complete Signup'}
                </Button>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm mt-4">
              {error}
            </div>
          )}
        </div>

        {/* reCAPTCHA container */}
        <div id="recaptcha-container" ref={recaptchaContainerRef}></div>

        {/* Login Link */}
        <div className="text-center text-sm text-white/70">
          Already have an account?{' '}
          <a href="/login" className="text-white font-medium hover:underline">
            Sign in
          </a>
        </div>
      </div>
    </div>
  )
}
