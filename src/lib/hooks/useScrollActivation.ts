'use client'

import { useEffect, useState } from 'react'

export function useScrollActivation(maxOpacityDistance: number = 50): number {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY
      const clamped = Math.max(0, Math.min(maxOpacityDistance, y))
      setProgress(clamped / maxOpacityDistance)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [maxOpacityDistance])

  return progress
}

