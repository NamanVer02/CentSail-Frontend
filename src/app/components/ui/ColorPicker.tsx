'use client'

import { useState, useRef, useEffect } from 'react'

interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
}

export default function ColorPicker({ value, onChange }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [hue, setHue] = useState(0)
  const [saturation, setSaturation] = useState(0)
  const [lightness, setLightness] = useState(0)
  const pickerRef = useRef<HTMLDivElement>(null)

  // Convert hex to HSL
  const hexToHsl = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255
    const g = parseInt(hex.slice(3, 5), 16) / 255
    const b = parseInt(hex.slice(5, 7), 16) / 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h = 0
    let s = 0
    const l = (max + min) / 2

    if (max !== min) {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
        case g: h = ((b - r) / d + 2) / 6; break
        case b: h = ((r - g) / d + 4) / 6; break
      }
    }

    return { h: h * 360, s: s * 100, l: l * 100 }
  }

  // Convert HSL to hex
  const hslToHex = (h: number, s: number, l: number) => {
    l /= 100
    const a = (s * Math.min(l, 1 - l)) / 100
    const f = (n: number) => {
      const k = (n + h / 30) % 12
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
      return Math.round(255 * color).toString(16).padStart(2, '0')
    }
    return `#${f(0)}${f(8)}${f(4)}`
  }

  // Initialize HSL from hex value
  useEffect(() => {
    if (value && value.match(/^#[0-9A-F]{6}$/i)) {
      const hsl = hexToHsl(value)
      setHue(hsl.h)
      setSaturation(hsl.s)
      setLightness(hsl.l)
    }
  }, [value])

  // Update hex when HSL changes
  useEffect(() => {
    if (isOpen) {
      const hex = hslToHex(hue, saturation, lightness)
      if (hex !== value) {
        onChange(hex)
      }
    }
  }, [hue, saturation, lightness, isOpen])

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
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

  const handleSaturationLightnessClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    setSaturation((x / rect.width) * 100)
    setLightness(100 - (y / rect.height) * 100)
  }

  const handleHueClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    setHue((x / rect.width) * 360)
  }

  return (
    <div className="relative" ref={pickerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 rounded-xl border-2 border-white/20 cursor-pointer transition-all hover:border-white/40"
        style={{ backgroundColor: value }}
        title="Open color picker"
      />
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-black/30 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl p-4 z-50">
          {/* Saturation/Lightness square */}
          <div
            className="w-64 h-64 rounded-lg mb-3 cursor-crosshair relative overflow-hidden"
            style={{
              background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, hsl(${hue}, 100%, 50%))`
            }}
            onMouseDown={(e) => {
              handleSaturationLightnessClick(e)
              const handleMove = (moveEvent: MouseEvent) => {
                const rect = e.currentTarget.getBoundingClientRect()
                const x = moveEvent.clientX - rect.left
                const y = moveEvent.clientY - rect.top
                setSaturation(Math.max(0, Math.min(100, (x / rect.width) * 100)))
                setLightness(Math.max(0, Math.min(100, 100 - (y / rect.height) * 100)))
              }
              const handleUp = () => {
                document.removeEventListener('mousemove', handleMove)
                document.removeEventListener('mouseup', handleUp)
              }
              document.addEventListener('mousemove', handleMove)
              document.addEventListener('mouseup', handleUp)
            }}
          >
            {/* Indicator */}
            <div
              className="absolute w-4 h-4 border-2 border-white rounded-full shadow-lg pointer-events-none"
              style={{
                left: `${saturation}%`,
                top: `${100 - lightness}%`,
                transform: 'translate(-50%, -50%)'
              }}
            />
          </div>

          {/* Hue slider */}
          <div
            className="w-full h-6 rounded-lg mb-3 cursor-pointer relative"
            style={{
              background: 'linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)'
            }}
            onMouseDown={(e) => {
              handleHueClick(e)
              const handleMove = (moveEvent: MouseEvent) => {
                const rect = e.currentTarget.getBoundingClientRect()
                const x = moveEvent.clientX - rect.left
                setHue(Math.max(0, Math.min(360, (x / rect.width) * 360)))
              }
              const handleUp = () => {
                document.removeEventListener('mousemove', handleMove)
                document.removeEventListener('mouseup', handleUp)
              }
              document.addEventListener('mousemove', handleMove)
              document.addEventListener('mouseup', handleUp)
            }}
          >
            {/* Indicator */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-1 h-full bg-white border border-black/20 rounded pointer-events-none shadow-lg"
              style={{
                left: `${(hue / 360) * 100}%`,
                transform: 'translateX(-50%)'
              }}
            />
          </div>

          {/* Hex input */}
          <input
            type="text"
            value={value}
            onChange={(e) => {
              const hex = e.target.value
              if (hex.match(/^#[0-9A-F]{6}$/i)) {
                onChange(hex)
                const hsl = hexToHsl(hex)
                setHue(hsl.h)
                setSaturation(hsl.s)
                setLightness(hsl.l)
              }
            }}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-white/40"
            placeholder="#575459"
          />
        </div>
      )}
    </div>
  )
}

