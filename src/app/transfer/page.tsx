'use client'

import { useRouter } from 'next/navigation'
import { FiArrowLeft, FiSend, FiUser, FiDollarSign } from 'react-icons/fi'
import Button from '@/app/components/ui/Button'
import { useScrollActivation } from '@/lib/hooks/useScrollActivation'
import Silk from '@/components/Silk'
import { useSilkSettings } from '@/lib/hooks/useSilkSettings'

export default function TransferPage() {
  const silkSettings = useSilkSettings()
  const router = useRouter()
  const scrollProgress = useScrollActivation(50)

  return (
    <div className="min-h-screen w-full text-white relative">
      {/* Silk Background */}
      <div className="fixed inset-0 z-0 w-full h-full pointer-events-none">
        <Silk
          speed={silkSettings.speed}
          scale={silkSettings.scale}
          color={silkSettings.color}
          noiseIntensity={silkSettings.noiseIntensity}
          rotation={silkSettings.rotation}
        />
      </div>
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-20 flex justify-center pointer-events-none">
        <div
          className="pointer-events-auto w-full max-w-md mx-4 mt-3 px-4 py-3 flex items-center rounded-full border border-white/10 backdrop-blur-lg transition-all duration-200"
          style={{
            backgroundColor: `rgba(0, 0, 0, ${0.2 + scrollProgress * 0.3})`,
            boxShadow: scrollProgress > 0 ? '0 10px 30px rgba(0,0,0,0.25)' : 'none',
            borderColor: `rgba(255, 255, 255, ${0.1 * scrollProgress})`
          }}
        >
          <button onClick={() => router.back()} className="text-2xl p-2 rounded-full hover:bg-white/10 transition-colors mr-2"><FiArrowLeft /></button>
          <h1 className="text-lg font-semibold">Transfer Money</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 pt-28 pb-10 relative z-10">
        <div className="text-center py-12">
          <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
            <FiSend className="text-3xl text-white/60" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Transfer Feature</h2>
          <p className="text-white/60 text-sm mb-6">This feature is coming soon!</p>
          <Button onClick={() => router.back()}>
            Go Back
          </Button>
        </div>
      </div>
    </div>
  )
}
