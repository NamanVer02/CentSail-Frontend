'use client'

import { use, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FiArrowLeft, FiEdit, FiMapPin } from 'react-icons/fi'
import { entryService } from '@/lib/services/entryService'
import { categoryService, Category } from '@/lib/services/categoryService'

export default function TransactionDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { id } = use(params)
  const [entry, setEntry] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await entryService.getEntry(id)
        // backend returns { success, data: entry }
        if (res.success && res.data && mounted) setEntry(res.data as any)
      } finally {
        setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [id])

  // categories map for name
  useEffect(() => {
    ;(async () => {
      const [exp, inc] = await Promise.all([
        categoryService.fetchCategories('EXPENSE'),
        categoryService.fetchCategories('INCOME')
      ])
      const arr: Category[] = []
      if (exp.success && exp.data) arr.push(...(Array.isArray(exp.data) ? exp.data : []))
      if (inc.success && inc.data) arr.push(...(Array.isArray(inc.data) ? inc.data : []))
      setCategories(arr)
    })()
  }, [])

  const categoryName = useMemo(() => {
    if (!entry) return ''
    const found = categories.find(c => c.id === entry.categoryId)
    return found?.name || 'Category'
  }, [categories, entry])

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-[radial-gradient(ellipse_at_center,_#1a7370_0%,_#0c504a_100%)] text-white flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  if (!entry) {
    return (
      <div className="min-h-screen w-full bg-[radial-gradient(ellipse_at_center,_#1a7370_0%,_#0c504a_100%)] text-white flex items-center justify-center">
        <p>Transaction not found.</p>
      </div>
    )
  }

  const isIncome = entry.type === 'INCOME'

  return (
    <div className="min-h-screen w-full bg-[radial-gradient(ellipse_at_center,_#1a7370_0%,_#0c504a_100%)] text-white">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 bg-transparent z-10">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => router.back()} className="text-2xl p-2 rounded-full hover:bg-white/10 transition-colors"><FiArrowLeft /></button>
          <h1 className="text-lg font-semibold truncate">{entry.title}</h1>
          <button className="text-2xl p-2 rounded-full hover:bg-white/10 transition-colors"><FiEdit /></button>
        </div>
      </div>

      <div className="max-w-md mx-auto pt-20 px-4">
        {/* Amount */}
        <div className="flex flex-col items-center justify-center py-8">
            <div className={`text-6xl p-5 rounded-full mb-4 bg-gradient-to-tr ${isIncome ? 'from-green-400/20 to-green-500/10' : 'from-white/20 to-white/10'}`}>💸</div>
            <p className={`text-5xl font-bold ${isIncome ? 'text-green-300' : 'text-white'}`}>{isIncome ? '+' : '-'}${Math.abs(entry.amount).toFixed(2)}</p>
            <p className="text-white/60 text-sm mt-1">{categoryName}</p>
        </div>
        
        {/* Details in a card */}
        <div className="bg-white/5 rounded-2xl p-6 space-y-4 border border-white/10 shadow-xl">
          <p className="text-xs text-white/50 uppercase tracking-wider">Transaction Details</p>
          <div className="flex justify-between items-center">
            <p className="text-white/70">Date</p>
            <p className="font-medium">{new Date(entry.date).toLocaleString()}</p>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-white/70">Category</p>
            <p className="font-medium">{categoryName}</p>
          </div>
           <div className="flex justify-between items-center">
            <p className="text-white/70">Type</p>
            <p className={`font-semibold py-1 px-3 rounded-full text-xs ${isIncome ? 'bg-green-500/20 text-green-200' : 'bg-red-500/20 text-red-200'}`}>{isIncome ? 'INCOME' : 'EXPENSE'}</p>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white/5 rounded-2xl p-6 my-4 border border-white/10 shadow-xl">
            <p className="text-xs text-white/50 uppercase tracking-wider">Note</p>
            <p className="text-white/80 mt-2 leading-relaxed">{entry.notes || '—'}</p>
        </div>
      </div>
    </div>
  )
}
