'use client'

import { useState, ChangeEvent, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Input from '@/app/components/ui/Input'
import Button from '@/app/components/ui/Button'
import { useAuth } from '@/lib/hooks/useAuth'
import { toast } from '@/lib/utils/toast'

export default function SignupPage() {
  const router = useRouter()
  const { signUp, isLoading, error, clearError } = useAuth()
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  })

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }))
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }))
    }
    
    // Clear API error when user starts typing
    if (error) {
      clearError()
    }
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}
    
    if (!formData.fullName.trim()) {
      errors.fullName = 'Full name is required'
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid'
    }
    
    if (!formData.password) {
      errors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters'
    }
    
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords don't match"
    }
    
    if (!formData.agreeToTerms) {
      errors.agreeToTerms = 'Please agree to terms and conditions'
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    try {
      const success = await signUp({
        email: formData.email.trim(),
        password: formData.password,
        displayName: formData.fullName.trim(),
      })
      
      if (success) {
        toast.success('Account created successfully! Redirecting...')
        
        // Redirect to dashboard
        setTimeout(() => {
          router.push('/dashboard')
        }, 1000)
      }
    } catch (err) {
      console.error('Signup error:', err)
    }
  }

  return (
    <div className="min-h-screen w-full bg-[radial-gradient(ellipse_at_center,_#1a7370_0%,_#0c504a_100%)] flex items-center justify-center p-6 md:p-8 relative overflow-hidden">
      {/* Decorative dots pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-full h-48 bg-[radial-gradient(circle,_rgba(255,255,255,0.3)_1px,_transparent_1px)] bg-[size:20px_20px]"></div>
      </div>

      <div className="w-full max-w-md space-y-8 relative z-10 px-4">
        {/* Logo and App Name */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-20 h-20 flex items-center justify-center">
              {/* Sailboat Logo */}
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
            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-wide">
              CentSail
            </h1>
            <p className="text-white/70 text-sm mt-2">Your Financial Voyage</p>
          </div>
        </div>

        {/* Welcome Text */}
        <div className="text-center pt-4">
          <h2 className="text-2xl font-semibold text-white">Create Account</h2>
        </div>

        {/* Signup Form Container */}
        <div className="space-y-6 pt-2">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name Input */}
            <div>
              <Input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Full name"
                required
              />
              {validationErrors.fullName && (
                <p className="text-red-400 text-xs mt-1 px-1">{validationErrors.fullName}</p>
              )}
            </div>

            {/* Email Input */}
            <div>
              <Input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email address"
                required
              />
              {validationErrors.email && (
                <p className="text-red-400 text-xs mt-1 px-1">{validationErrors.email}</p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <Input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                required
              />
              {validationErrors.password && (
                <p className="text-red-400 text-xs mt-1 px-1">{validationErrors.password}</p>
              )}
            </div>

            {/* Confirm Password Input */}
            <div>
              <Input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm password"
                required
              />
              {validationErrors.confirmPassword && (
                <p className="text-red-400 text-xs mt-1 px-1">{validationErrors.confirmPassword}</p>
              )}
            </div>

            {/* Terms & Conditions */}
            <div className="flex items-start text-sm px-1">
              <label className="flex items-start space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                  className="w-4 h-4 mt-0.5 rounded border-2 border-white/40 bg-transparent checked:bg-white checked:border-white focus:ring-0 focus:ring-offset-0 cursor-pointer accent-white"
                  required
                />
                <span className="text-white/80">
                  I agree to the{' '}
                  <button type="button" className="text-white hover:underline">
                    Terms and Conditions
                  </button>
                </span>
              </label>
              {validationErrors.agreeToTerms && (
                <p className="text-red-400 text-xs mt-1 px-1">{validationErrors.agreeToTerms}</p>
              )}
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          {/* Login Link */}
          <div className="text-center text-sm text-white/70 pb-4">
            Already have an account?{' '}
            <a href="/login" className="text-white font-medium hover:underline">
              Sign in
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
