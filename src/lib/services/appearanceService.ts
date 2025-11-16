export interface SilkSettings {
  speed: number
  scale: number
  color: string
  noiseIntensity: number
  rotation: number
}

const DEFAULT_SETTINGS: SilkSettings = {
  speed: 5,
  scale: 0.9,
  color: '#575459',
  noiseIntensity: 1.3,
  rotation: 0
}

const STORAGE_KEY = 'silk_background_settings'

class AppearanceService {
  getSilkSettings(): SilkSettings {
    if (typeof window === 'undefined') {
      return DEFAULT_SETTINGS
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        // Merge with defaults to ensure all properties exist
        return { ...DEFAULT_SETTINGS, ...parsed }
      }
    } catch (error) {
      console.error('Error loading Silk settings:', error)
    }

    return DEFAULT_SETTINGS
  }

  saveSilkSettings(settings: Partial<SilkSettings>): void {
    if (typeof window === 'undefined') {
      return
    }

    try {
      const current = this.getSilkSettings()
      const updated = { ...current, ...settings }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      
      // Dispatch event to notify all pages of the change
      window.dispatchEvent(new CustomEvent('silkSettingsChanged', { detail: updated }))
    } catch (error) {
      console.error('Error saving Silk settings:', error)
    }
  }

  resetSilkSettings(): void {
    if (typeof window === 'undefined') {
      return
    }

    try {
      localStorage.removeItem(STORAGE_KEY)
      window.dispatchEvent(new CustomEvent('silkSettingsChanged', { detail: DEFAULT_SETTINGS }))
    } catch (error) {
      console.error('Error resetting Silk settings:', error)
    }
  }
}

export const appearanceService = new AppearanceService()

