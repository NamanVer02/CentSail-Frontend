import { ChangeEvent } from 'react'

interface InputProps {
  type: 'email' | 'password' | 'text'
  id: string
  name: string
  value: string
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
  placeholder: string
  required?: boolean
  className?: string
}

export default function Input({
  type,
  id,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  className = ''
}: InputProps) {
  return (
    <input
      type={type}
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className={`w-full px-5 py-4 rounded-lg bg-transparent backdrop-blur-sm border-2 border-white/40 text-white placeholder-white/60 focus:outline-none focus:border-white/70 transition-all ${className}`}
    />
  )
}
