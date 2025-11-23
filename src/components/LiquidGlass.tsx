'use client'

import React, { ReactNode, useRef, useEffect, useState } from 'react'
import styles from './LiquidGlass.module.css'

interface LiquidGlassProps {
  children: ReactNode
  className?: string
  style?: React.CSSProperties
  displacementScale?: number
  blurAmount?: number
  brightness?: number
  borderRadius?: number
  onMouseMove?: (e: React.MouseEvent<HTMLDivElement>) => void
}

export default function LiquidGlass({
  children,
  className = '',
  style = {},
  displacementScale = 10,
  blurAmount = 2,
  brightness = 1.0,
  borderRadius = 28,
  onMouseMove,
}: LiquidGlassProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [filterId] = useState(() => `displacementFilter-${Math.random().toString(36).substring(2, 11)}`)
  const beforeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Update turbulence based on mouse position for interactive effect
    const handleMouseMove = (e: MouseEvent) => {
      if (!cardRef.current) return
      
      const rect = cardRef.current.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100
      
      // Update SVG filter turbulence
      const filter = document.getElementById(filterId)
      if (filter) {
        const turbulence = filter.querySelector('feTurbulence')
        if (turbulence) {
          // Create subtle animation based on mouse position
          const baseFreq = 0.01 + (x / 10000) + (y / 10000)
          turbulence.setAttribute('baseFrequency', `${baseFreq}`)
        }
      }
    }

    const card = cardRef.current
    if (card) {
      card.addEventListener('mousemove', handleMouseMove)
      return () => {
        card.removeEventListener('mousemove', handleMouseMove)
      }
    }
  }, [filterId])

  // Update border radius on before element
  useEffect(() => {
    if (beforeRef.current) {
      beforeRef.current.style.borderRadius = `${borderRadius}px`
    }
  }, [borderRadius])

  return (
    <>
      <div
        ref={cardRef}
        className={`${styles.liquidGlassCard} ${className}`}
        style={{
          ...style,
          borderRadius: `${borderRadius}px`,
          backdropFilter: `brightness(${brightness}) blur(${blurAmount}px) url(#${filterId})`,
          WebkitBackdropFilter: `brightness(${brightness}) blur(${blurAmount}px) url(#${filterId})`,
        }}
        onMouseMove={onMouseMove}
      >
        <div
          ref={beforeRef}
          className={styles.liquidGlassCardBefore}
          style={{
            borderRadius: `${borderRadius}px`,
          }}
        />
        <div className={styles.liquidGlassCardContent}>
          {children}
        </div>
      </div>

      <svg style={{ display: 'none', position: 'absolute' }}>
        <defs>
          <filter id={filterId}>
            <feTurbulence
              type="turbulence"
              baseFrequency="0.01"
              numOctaves="2"
              result="turbulence"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="turbulence"
              scale={displacementScale}
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>
    </>
  )
}

