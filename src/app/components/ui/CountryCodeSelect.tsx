'use client'

import { useState, useRef, useEffect } from 'react'
import { FiChevronDown } from 'react-icons/fi'

interface CountryOption {
  code: string
  name: string
}

interface CountryCodeSelectProps {
  value: string
  onChange: (code: string) => void
  options: CountryOption[]
  className?: string
}

export default function CountryCodeSelect({
  value,
  onChange,
  options,
  className = ''
}: CountryCodeSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const selectedOption = options.find(opt => opt.code === value) || options[0]

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  return (
    <div ref={dropdownRef} className={`relative flex ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-28 bg-white/10 border border-white/20 text-white rounded-xl px-2 py-4 focus:outline-none focus:ring-2 focus:ring-white/40 text-sm flex items-center justify-between"
      >
        <span>{selectedOption.code}</span>
        <FiChevronDown className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-[#0c504a] border border-white/20 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto">
          {options.map((option) => (
            <button
              key={option.code}
              type="button"
              onClick={() => {
                onChange(option.code)
                setIsOpen(false)
              }}
              className={`w-full text-left px-4 py-2 text-white hover:bg-white/10 transition-colors ${
                value === option.code ? 'bg-white/20' : ''
              }`}
            >
              <span className="font-medium">{option.name}</span>
              <span className="ml-2 text-white/70">{option.code}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

