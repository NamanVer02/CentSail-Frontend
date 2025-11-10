'use client'

import { useRouter } from 'next/navigation'
import { FiArrowLeft, FiTarget, FiDollarSign } from 'react-icons/fi'
import Button from '@/app/components/ui/Button'
import { useScrollActivation } from '@/lib/hooks/useScrollActivation'

export default function BudgetPage() {
  const router = useRouter()
  const scrollProgress = useScrollActivation(50)

  return (
    <div className="min-h-screen w-full bg-[radial-gradient(ellipse_at_center,_#1a7370_0%,_#0c504a_100%)] text-white">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-10 flex justify-center pointer-events-none">
        <div
          className="pointer-events-auto w-full max-w-md mx-4 mt-3 px-4 py-3 flex items-center rounded-full border border-white/10 backdrop-blur-lg transition-all duration-200"
          style={{
            backgroundColor: `rgba(12, 80, 74, ${0.4 + scrollProgress * 0.4})`,
            boxShadow: scrollProgress > 0 ? '0 10px 30px rgba(0,0,0,0.25)' : 'none',
            borderColor: `rgba(255, 255, 255, ${0.1 * scrollProgress})`
          }}
        >
          <button onClick={() => router.back()} className="text-2xl p-2 rounded-full hover:bg-white/10 transition-colors mr-2"><FiArrowLeft /></button>
          <h1 className="text-lg font-semibold">Budget</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 pt-28 pb-10">
        <div className="text-center py-12">
          <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
            <FiTarget className="text-3xl text-white/60" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Budget Feature</h2>
          <p className="text-white/60 text-sm mb-6">This feature is coming soon!</p>
          <Button onClick={() => router.back()}>
            Go Back
          </Button>
        </div>
      </div>
    </div>
  )
}
