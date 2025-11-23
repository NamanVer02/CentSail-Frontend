'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { FiChevronDown } from 'react-icons/fi'

interface Option {
  value: string
  label: string
}

interface CustomSelectProps {
  value: string
  onChange: (value: string) => void
  options: Option[]
  placeholder?: string
  className?: string
}

export default function CustomSelect({
  value,
  onChange,
  options,
  placeholder = 'Select...',
  className = '',
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const selectRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const selectedOption = options.find(opt => opt.value === value)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
          setIsOpen(false)
        }
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Calculate position for portal
  useEffect(() => {
    if (isOpen && selectRef.current && menuRef.current) {
      const rect = selectRef.current.getBoundingClientRect()
      menuRef.current.style.position = 'fixed'
      menuRef.current.style.top = `${rect.bottom + window.scrollY + 8}px`
      menuRef.current.style.left = `${rect.left + window.scrollX}px`
      menuRef.current.style.width = `${rect.width}px`
    }
  }, [isOpen])

  const dropdownMenu = isOpen && (
    <div
      ref={menuRef}
      className="fixed bg-black/80 backdrop-blur-xl rounded-2xl border border-white/30 shadow-2xl z-[99999] max-h-60 overflow-y-auto"
    >
      <div className="p-2">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => {
              onChange(option.value)
              setIsOpen(false)
            }}
            className={`w-full text-left px-4 py-2 rounded-xl text-sm transition-all ${
              value === option.value
                ? 'bg-white/30 text-white font-medium'
                : 'text-white/90 hover:bg-white/20 hover:text-white'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )

  return (
    <>
      <div ref={selectRef} className={`relative ${className}`}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full bg-transparent text-white text-sm focus:outline-none flex items-center justify-between cursor-pointer hover:text-white/90 transition-colors"
        >
          <span>{selectedOption ? selectedOption.label : placeholder}</span>
          <FiChevronDown 
            className={`text-white/60 text-sm transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          />
        </button>
      </div>
      {typeof window !== 'undefined' && createPortal(dropdownMenu, document.body)}
    </>
  )
}

