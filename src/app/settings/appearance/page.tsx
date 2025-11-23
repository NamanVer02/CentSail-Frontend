'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { FiRotateCw } from 'react-icons/fi'
import { useDebounce } from '@/lib/hooks/useDebounce'
import { appearanceService, SilkSettings } from '@/lib/services/appearanceService'
import { useSilkSettings } from '@/lib/hooks/useSilkSettings'
import Silk from '@/components/Silk'
import ColorPicker from '@/app/components/ui/ColorPicker'
import Header from '@/app/components/Header'

export default function AppearancePage() {
  const router = useRouter()
  // Use saved settings for the actual background (from localStorage)
  const savedSettings = useSilkSettings()
  // Use local state for preview only
  const [previewSettings, setPreviewSettings] = useState<SilkSettings>(savedSettings)
  const [hasChanges, setHasChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Debounce preview updates to prevent freezing
  const debouncedPreviewSettings = useDebounce(previewSettings, 150)

  // Update preview settings when saved settings change (from other tabs/windows)
  useEffect(() => {
    setPreviewSettings(savedSettings)
    setHasChanges(false)
    setIsSaving(false)
  }, [savedSettings])

  // Check if preview differs from saved settings
  useEffect(() => {
    const hasDiff = 
      previewSettings.speed !== savedSettings.speed ||
      previewSettings.scale !== savedSettings.scale ||
      previewSettings.color !== savedSettings.color ||
      previewSettings.noiseIntensity !== savedSettings.noiseIntensity ||
      previewSettings.rotation !== savedSettings.rotation
    
    if (!hasDiff && hasChanges) {
      setHasChanges(false)
    }
  }, [previewSettings, savedSettings, hasChanges])

  const handleChange = useCallback((key: keyof SilkSettings, value: number | string) => {
    setPreviewSettings(prev => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }, [])

  const handleSave = useCallback(async () => {
    if (isSaving || !hasChanges) return
    
    setIsSaving(true)
    try {
      // Save settings
      appearanceService.saveSilkSettings(previewSettings)
      
      // Navigate back after saving to avoid background freeze
      await new Promise(resolve => setTimeout(resolve, 300))
      router.back()
    } catch (error) {
      console.error('Error saving settings:', error)
      setIsSaving(false)
    }
  }, [previewSettings, isSaving, hasChanges, router])

  const handleReset = useCallback(() => {
    const defaultSettings = {
      speed: 5,
      scale: 0.9,
      color: '#575459',
      noiseIntensity: 1.3,
      rotation: 0
    }
    setPreviewSettings(defaultSettings)
    appearanceService.saveSilkSettings(defaultSettings)
    setHasChanges(false)
  }, [])

  return (
    <div className="min-h-screen w-full text-white relative">
      {/* Silk Background - Use saved settings, not preview */}
      <div className="fixed inset-0 z-0 w-full h-full pointer-events-none">
        <Silk
          speed={savedSettings.speed}
          scale={savedSettings.scale}
          color={savedSettings.color}
          noiseIntensity={savedSettings.noiseIntensity}
          rotation={savedSettings.rotation}
        />
      </div>
      
      <Header title="Appearance" />

      <div className="max-w-md mx-auto px-4 pt-28 pb-10 relative z-10">
        <div className="space-y-6">
          {/* Preview Section */}
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10 shadow-xl">
            <h2 className="text-lg font-semibold mb-4">Background Preview</h2>
            <div className="h-32 rounded-xl overflow-hidden border border-white/10">
              <Silk
                key={`preview-${debouncedPreviewSettings.color}-${debouncedPreviewSettings.speed}-${debouncedPreviewSettings.scale}-${debouncedPreviewSettings.noiseIntensity}-${debouncedPreviewSettings.rotation}`}
                speed={debouncedPreviewSettings.speed}
                scale={debouncedPreviewSettings.scale}
                color={debouncedPreviewSettings.color}
                noiseIntensity={debouncedPreviewSettings.noiseIntensity}
                rotation={debouncedPreviewSettings.rotation}
              />
            </div>
          </div>

          {/* Speed Control */}
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold">Animation Speed</h3>
                <p className="text-xs text-white/60">Control how fast the background animates</p>
              </div>
              <span className="text-lg font-mono text-white/80">{previewSettings.speed.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="20"
              step="0.1"
              value={previewSettings.speed}
              onChange={(e) => handleChange('speed', parseFloat(e.target.value))}
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white/80"
            />
            <div className="flex justify-between text-xs text-white/50 mt-1">
              <span>Slow</span>
              <span>Fast</span>
            </div>
          </div>

          {/* Scale Control */}
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold">Pattern Scale</h3>
                <p className="text-xs text-white/60">Adjust the size of the pattern</p>
              </div>
              <span className="text-lg font-mono text-white/80">{previewSettings.scale.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="2"
              step="0.01"
              value={previewSettings.scale}
              onChange={(e) => handleChange('scale', parseFloat(e.target.value))}
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white/80"
            />
            <div className="flex justify-between text-xs text-white/50 mt-1">
              <span>Small</span>
              <span>Large</span>
            </div>
          </div>

          {/* Color Control */}
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10 shadow-xl">
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Background Color</h3>
              <p className="text-xs text-white/60">Choose the base color of the background</p>
            </div>
            <div className="flex items-center gap-4 mb-4">
              <ColorPicker
                value={previewSettings.color}
                onChange={(color) => handleChange('color', color)}
              />
              <div className="flex-1">
                <input
                  type="text"
                  value={previewSettings.color}
                  onChange={(e) => {
                    const hex = e.target.value
                    if (hex.match(/^#[0-9A-F]{0,6}$/i)) {
                      handleChange('color', hex)
                    }
                  }}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-white/40"
                  placeholder="#575459"
                />
              </div>
            </div>
            {/* Preset Colors */}
            <div className="flex gap-2 flex-wrap">
              {['#575459', '#4A5568', '#2D3748', '#1A202C', '#0F172A', '#7B7481', '#5B5563'].map((color) => (
                <button
                  key={color}
                  onClick={() => handleChange('color', color)}
                  className="w-10 h-10 rounded-lg border-2 border-white/20 hover:border-white/40 transition-colors"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>

          {/* Noise Intensity Control */}
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold">Noise Intensity</h3>
                <p className="text-xs text-white/60">Control the texture detail</p>
              </div>
              <span className="text-lg font-mono text-white/80">{previewSettings.noiseIntensity.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="3"
              step="0.01"
              value={previewSettings.noiseIntensity}
              onChange={(e) => handleChange('noiseIntensity', parseFloat(e.target.value))}
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white/80"
            />
            <div className="flex justify-between text-xs text-white/50 mt-1">
              <span>Smooth</span>
              <span>Textured</span>
            </div>
          </div>

          {/* Rotation Control */}
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold">Rotation</h3>
                <p className="text-xs text-white/60">Rotate the pattern</p>
              </div>
              <span className="text-lg font-mono text-white/80">{previewSettings.rotation.toFixed(1)}°</span>
            </div>
            <input
              type="range"
              min="0"
              max="360"
              step="1"
              value={previewSettings.rotation}
              onChange={(e) => handleChange('rotation', parseFloat(e.target.value))}
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white/80"
            />
            <div className="flex justify-between text-xs text-white/50 mt-1">
              <span>0°</span>
              <span>360°</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleReset}
              className="flex-1 py-3 px-4 bg-white/10 rounded-xl hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
            >
              <FiRotateCw />
              <span>Reset</span>
            </button>
            <button
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              className="flex-1 py-3 px-4 bg-white/90 text-[#0c504a] rounded-xl font-semibold hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving...' : hasChanges ? 'Save Changes' : 'Saved'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

