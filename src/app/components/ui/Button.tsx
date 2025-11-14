import { ReactNode } from 'react'

interface ButtonProps {
  type?: 'button' | 'submit' | 'reset'
  onClick?: () => void
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'outline'
  className?: string
  disabled?: boolean
}

export default function Button({
  type = 'button',
  onClick,
  children,
  variant = 'primary',
  className = '',
  disabled = false
}: ButtonProps) {
  const baseStyles = 'w-full py-4 px-4 font-semibold rounded-lg focus:outline-none transition-all'
  
  const variantStyles = {
    primary: 'bg-white/90 text-[#0c504a] hover:bg-white focus:ring-2 focus:ring-white/50 shadow-lg',
    secondary: 'text-white/80 hover:text-white',
    outline: 'bg-transparent border-2 border-white/30 text-white hover:border-white/50 hover:bg-white/10'
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles[variant]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  )
}
