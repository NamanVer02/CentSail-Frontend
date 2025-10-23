'use client'

import { useRouter } from 'next/navigation'
import { FiArrowLeft, FiSend, FiUser, FiDollarSign } from 'react-icons/fi'
import Button from '@/app/components/ui/Button'

export default function TransferPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen w-full bg-[radial-gradient(ellipse_at_center,_#1a7370_0%,_#0c504a_100%)] text-white">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 bg-transparent z-10">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center">
          <button onClick={() => router.back()} className="text-2xl p-2 rounded-full hover:bg-white/10 transition-colors mr-2"><FiArrowLeft /></button>
          <h1 className="text-lg font-semibold">Transfer Money</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 pt-20 pb-10">
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
