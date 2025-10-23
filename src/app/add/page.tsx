'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FiArrowLeft, FiPlus, FiMinus, FiDollarSign, FiTag, FiCalendar, FiCreditCard, FiWallet } from 'react-icons/fi'
import Button from '@/app/components/ui/Button'

export default function AddTransactionPage() {
  const router = useRouter()
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('expense')
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
  })

  const categories = [
    { name: 'Food & Dining', icon: <FiTag /> },
    { name: 'Transportation', icon: <FiCreditCard /> },
    { name: 'Entertainment', icon: <FiTag /> },
    { name: 'Shopping', icon: <FiTag /> },
    { name: 'Utilities', icon: <FiTag /> },
    { name: 'Healthcare', icon: <FiTag /> },
    { name: 'Education', icon: <FiTag /> },
    { name: 'Travel', icon: <FiTag /> },
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log('Transaction data:', { ...formData, type: transactionType })
    router.back()
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <div className="min-h-screen w-full bg-[radial-gradient(ellipse_at_center,_#1a7370_0%,_#0c504a_100%)] text-white">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 bg-transparent z-10">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center">
          <button onClick={() => router.back()} className="text-2xl p-2 rounded-full hover:bg-white/10 transition-colors mr-2"><FiArrowLeft /></button>
          <h1 className="text-lg font-semibold">Add Transaction</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 pt-20 pb-10">
        {/* Transaction Type Toggle */}
        <div className="bg-white/5 rounded-2xl p-6 border border-white/10 shadow-xl mb-6">
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setTransactionType('expense')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg transition-all ${
                transactionType === 'expense' 
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                  : 'bg-white/10 text-white/60'
              }`}
            >
              <FiMinus />
              <span>Expense</span>
            </button>
            <button
              onClick={() => setTransactionType('income')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg transition-all ${
                transactionType === 'income' 
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                  : 'bg-white/10 text-white/60'
              }`}
            >
              <FiPlus />
              <span>Income</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Amount */}
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10 shadow-xl">
            <label className="block text-sm text-white/60 mb-3">Amount</label>
            <div className="relative">
              <FiDollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60" />
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="0.00"
                className="w-full bg-white/10 border border-white/20 rounded-lg py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-white/50"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10 shadow-xl">
            <label className="block text-sm text-white/60 mb-3">Description</label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="What was this for?"
              className="w-full bg-white/10 border border-white/20 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-white/50"
              required
            />
          </div>

          {/* Category */}
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10 shadow-xl">
            <label className="block text-sm text-white/60 mb-3">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full bg-white/10 border border-white/20 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-white/50"
              required
            >
              <option value="">Select a category</option>
              {categories.map((category, index) => (
                <option key={index} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10 shadow-xl">
            <label className="block text-sm text-white/60 mb-3">Date</label>
            <div className="relative">
              <FiCalendar className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60" />
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full bg-white/10 border border-white/20 rounded-lg py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-white/50"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <Button type="submit">
            Add {transactionType === 'income' ? 'Income' : 'Expense'}
          </Button>
        </form>
      </div>
    </div>
  )
}
