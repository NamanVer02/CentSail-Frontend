'use client'

import { useRouter } from 'next/navigation'
import { ReactNode } from 'react'
import { FiArrowLeft } from 'react-icons/fi'
import LiquidGlass from '@/components/LiquidGlass'

interface HeaderProps {
  title: string
  showBackButton?: boolean
  rightAction?: ReactNode
  maxWidth?: 'md' | 'lg' | 'xl' | '6xl'
  className?: string
}

export default function Header({
  title,
  showBackButton = true,
  rightAction,
  maxWidth = 'md',
  className = '',
}: HeaderProps) {
  const router = useRouter()
  
  const maxWidthClasses = {
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '6xl': 'max-w-6xl',
  }

  return (
    <div className={`fixed top-0 left-0 right-0 z-20 flex justify-center pointer-events-none ${className}`}>
      <LiquidGlass
        displacementScale={15}
        blurAmount={3}
        brightness={1}
        borderRadius={9999}
        className={`pointer-events-auto w-full ${maxWidthClasses[maxWidth]} mx-4 mt-3`}
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          padding: '0.75rem 1rem',
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center flex-1 min-w-0">
            {showBackButton && (
              <button
                onClick={() => router.back()}
                className="text-2xl p-2 rounded-full hover:bg-white/10 transition-colors mr-2 flex-shrink-0"
              >
                <FiArrowLeft />
              </button>
            )}
            <h1 className="text-lg font-semibold truncate">{title}</h1>
          </div>
          {rightAction && (
            <div className="flex-shrink-0 ml-2">
              {rightAction}
            </div>
          )}
        </div>
      </LiquidGlass>
    </div>
  )
}

