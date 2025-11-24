'use client'

import { useState, useRef, useEffect } from 'react'
import { FiFilter } from 'react-icons/fi'
import { createPortal } from 'react-dom'

interface CustomDatePickerProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export default function CustomDatePicker({
  value,
  onChange,
  placeholder = 'Select date',
  className = '',
}: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [localValue, setLocalValue] = useState(value)
  const pickerRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setLocalValue(value)
  }, [value])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
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
    if (isOpen && pickerRef.current && menuRef.current) {
      const rect = pickerRef.current.getBoundingClientRect()
      menuRef.current.style.position = 'fixed'
      menuRef.current.style.top = `${rect.bottom + window.scrollY + 8}px`
      menuRef.current.style.left = `${rect.left + window.scrollX}px`
      menuRef.current.style.width = `${rect.width}px`
    }
  }, [isOpen])

  const handleDateChange = (newValue: string) => {
    setLocalValue(newValue)
    onChange(newValue)
    setIsOpen(false)
  }

  const datePickerMenu = isOpen && (
    <div
      ref={menuRef}
      className="fixed bg-black/80 backdrop-blur-xl rounded-2xl border border-white/30 shadow-2xl z-[99999] p-4"
    >
      <input
        type="date"
        value={localValue}
        onChange={(e) => handleDateChange(e.target.value)}
        className="w-full bg-transparent text-white text-sm focus:outline-none [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:cursor-pointer"
        autoFocus
      />
    </div>
  )

  return (
    <>
      <div ref={pickerRef} className={`relative ${className}`}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full bg-transparent text-white text-sm focus:outline-none flex items-center justify-between cursor-pointer hover:text-white/90 transition-colors"
        >
          <span className={value ? '' : 'text-white/60'}>
            {value ? new Date(value + 'T00:00:00').toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric', 
              year: 'numeric' 
            }) : placeholder}
          </span>
          <FiFilter className="text-white/60 text-sm" />
        </button>
      </div>
      {typeof window !== 'undefined' && createPortal(datePickerMenu, document.body)}
    </>
  )
}

