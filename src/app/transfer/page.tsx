'use client'

import { useRouter } from 'next/navigation'
import { FiSend, FiUser, FiDollarSign } from 'react-icons/fi'
import Button from '@/app/components/ui/Button'
import Silk from '@/components/Silk'
import { useSilkSettings } from '@/lib/hooks/useSilkSettings'
import Header from '@/app/components/Header'

export default function TransferPage() {
  const silkSettings = useSilkSettings()
  const router = useRouter()

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
      <Header title="Transfer Money" />

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
