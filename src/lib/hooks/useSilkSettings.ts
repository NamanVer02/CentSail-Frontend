import { useState, useEffect } from 'react'
import { appearanceService, SilkSettings } from '@/lib/services/appearanceService'

export function useSilkSettings(): SilkSettings {
  const [settings, setSettings] = useState<SilkSettings>(appearanceService.getSilkSettings())

  useEffect(() => {
    // Listen for settings changes
    const handleSettingsChange = (e: CustomEvent) => {
      setSettings(e.detail)
    }

    window.addEventListener('silkSettingsChanged', handleSettingsChange as EventListener)
    
    // Also check on mount in case settings changed while component was unmounted
    setSettings(appearanceService.getSilkSettings())

    return () => {
      window.removeEventListener('silkSettingsChanged', handleSettingsChange as EventListener)
    }
  }, [])

  return settings
}

