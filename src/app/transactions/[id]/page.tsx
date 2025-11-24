'use client'

import { use, useEffect, useMemo, useState } from 'react'
import { FiEdit, FiX, FiCalendar, FiDollarSign } from 'react-icons/fi'
import { entryService, type Entry } from '@/lib/services/entryService'
import { categoryService, Category } from '@/lib/services/categoryService'
import { auth } from '@/lib/config/firebase'
import { toast } from '@/lib/utils/toast'
import Silk from '@/components/Silk'
import { useSilkSettings } from '@/lib/hooks/useSilkSettings'
import { getCategoryIconById } from '@/lib/utils/categoryIcons'
import Header from '@/app/components/Header'
import LiquidGlass from '@/components/LiquidGlass'
import { parseDateValue } from '@/lib/utils/date'

export default function TransactionDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const silkSettings = useSilkSettings()
  const { id } = use(params)
  const [entry, setEntry] = useState<Entry | null>(null)
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<Category[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    type: 'EXPENSE',
    categoryId: '',
    date: '',
    notes: '',
  })

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await entryService.getEntry(id)
        if (res.success && res.data && mounted) setEntry(res.data)
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

  // Map category ID to category object
  const categoryMap = useMemo(() => {
    const m = new Map<string, Category>()
    categories.forEach(c => m.set(c.id, c))
    return m
  }, [categories])

  // Fetch categories when editing and type changes
  useEffect(() => {
    if (!isEditing) return
    const fetchCategories = async () => {
      try {
        const response = await categoryService.fetchCategories(formData.type)
        if (response.success && response.data) {
          const list = Array.isArray(response.data) ? response.data : []
          setCategories(list)
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
      }
    }
    fetchCategories()
  }, [isEditing, formData.type])

  const startEdit = () => {
    if (!entry) return
    // Format date from ISO string or Timestamp object to YYYY-MM-DD for input
    let formattedDate = new Date().toISOString().split('T')[0] // Default to today
    
    const dateObj = parseDateValue(entry.date)
    if (dateObj) {
      formattedDate = dateObj.toISOString().split('T')[0]
    }
    
    setFormData({
      title: entry.title || '',
      amount: entry.amount?.toString() || '',
      type: entry.type || 'EXPENSE',
      categoryId: entry.categoryId || '',
      date: formattedDate,
      notes: entry.notes || '',
    })
    setIsEditing(true)
  }

  const cancelEdit = () => {
    setIsEditing(false)
  }

  const handleSave = async () => {
    const user = auth.currentUser
    if (!user || !entry) {
      toast.error('You must be logged in to update a transaction')
      return
    }

    // Validate form data
    if (!formData.title || !formData.amount || !formData.categoryId || !formData.date) {
      toast.error('Please fill in all required fields')
      return
    }

    setSaving(true)

    try {
      // Format date for backend (needs to be in RFC3339/ISO 8601 format)
      const dateStr = formData.date // Format: YYYY-MM-DD
      const dateObj = new Date(dateStr + 'T00:00:00.000Z')
      const formattedDate = dateObj.toISOString()

      const updateData = {
        id: entry.id,
        userId: entry.userId,
        title: formData.title.trim(),
        type: formData.type,
        amount: parseFloat(formData.amount),
        categoryId: formData.categoryId,
        date: formattedDate,
        notes: formData.notes?.trim() || '',
      }

      const response = await entryService.updateEntry(updateData)
      
      if (response.success) {
        toast.success('Transaction updated successfully!')
        // Refresh the entry data
        const res = await entryService.getEntry(id)
        if (res.success && res.data) {
          setEntry(res.data)
        }
        setIsEditing(false)
      } else {
        toast.error(response.message || 'Failed to update transaction')
      }
    } catch (error) {
      console.error('Error updating transaction:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update transaction')
    } finally {
      setSaving(false)
    }
  }

  const filteredCategories = useMemo(() => {
    return categories.filter(c => c.type === formData.type)
  }, [categories, formData.type])

  const categoryName = useMemo(() => {
    if (!entry) return ''
    const found = categories.find(c => c.id === entry.categoryId)
    return found?.name || 'Category'
  }, [categories, entry])

  if (loading) {
    return (
      <div className="min-h-screen w-full text-white flex items-center justify-center relative">
        {/* Silk Background */}
        <div className="fixed inset-0 z-0 w-full h-full pointer-events-none">
          <Silk
            speed={5}
            scale={0.9}
            color="#575459"
            noiseIntensity={1.3}
            rotation={0}
          />
        </div>
        <p className="relative z-10">Loading...</p>
      </div>
    )
  }

  if (!entry) {
    return (
      <div className="min-h-screen w-full text-white flex items-center justify-center relative">
        {/* Silk Background */}
        <div className="fixed inset-0 z-0 w-full h-full pointer-events-none">
          <Silk
            speed={5}
            scale={0.9}
            color="#575459"
            noiseIntensity={1.3}
            rotation={0}
          />
        </div>
        <p className="relative z-10">Transaction not found.</p>
      </div>
    )
  }

  const isIncome = entry.type === 'INCOME'

  return (
    <div className="min-h-screen w-full text-white relative">
      {/* Silk Background */}
      <div className="fixed inset-0 z-0 w-full h-full">
        <Silk
          speed={silkSettings.speed}
          scale={silkSettings.scale}
          color={silkSettings.color}
          noiseIntensity={silkSettings.noiseIntensity}
          rotation={silkSettings.rotation}
        />
      </div>
      <Header
        title=""
        rightAction={
          !isEditing ? (
            <button onClick={startEdit} className="text-2xl p-2 rounded-full hover:bg-white/10 transition-colors">
              <FiEdit />
            </button>
          ) : (
            <span className="w-10" />
          )
        }
      />

      <div className="max-w-md mx-auto pt-32 px-4 relative z-10">
        {/* Amount */}
        <div className="flex flex-col items-center justify-center py-8">
            <LiquidGlass
              displacementScale={15}
              blurAmount={3}
              brightness={1}
              borderRadius={9999}
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.1)',
                width: '5rem',
                height: '5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
              }}
            >
              <div className="text-4xl text-white">
                {getCategoryIconById(entry.categoryId, categoryMap)}
              </div>
            </LiquidGlass>
            <p className="text-5xl font-bold text-white">{entry.title}</p>
            <p className={`text-white/60 text-sm mt-1 ${isIncome ? 'text-green-300' : 'text-white'}`}>{isIncome ? '+' : ''}${Math.abs(entry.amount).toFixed(2)}</p>
        </div>
        
        {/* Details in a card */}
        <div className="bg-white/10 rounded-2xl p-6 space-y-4 border border-white/20 backdrop-blur-lg">
          <p className="text-xs text-white/50 uppercase tracking-wider">Transaction Details</p>
          <div className="flex justify-between items-center">
            <p className="text-white/70">Date</p>
            <p className="font-medium">{
              (() => {
                const dateObj = parseDateValue(entry.date)
                return dateObj ? dateObj.toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                }) : 'Invalid Date'
              })()
            }</p>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-white/70">Time</p>
            <p className="font-medium">{
              (() => {
                const dateObj = parseDateValue(entry.date)
                return dateObj ? dateObj.toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  hour12: true
                }) : 'Invalid Time'
              })()
            }</p>
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
        <div className="bg-white/10 rounded-2xl p-6 my-4 border border-white/20 backdrop-blur-lg">
            <p className="text-xs text-white/50 uppercase tracking-wider">Note</p>
            <p className="text-white/80 mt-2 leading-relaxed">{entry.notes || '—'}</p>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end justify-center md:p-4">
          <div className="w-full bg-black/30 backdrop-blur-md text-white rounded-t-2xl md:rounded-2xl md:max-w-md border-t border-x md:border border-white/10 shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Edit Transaction</h2>
              <button
                onClick={cancelEdit}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                aria-label="Close"
              >
                <FiX className="text-xl" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Transaction Type */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, type: 'EXPENSE', categoryId: '' })
                    }}
                    className={`py-3 px-4 rounded-xl transition-all ${
                      formData.type === 'EXPENSE'
                        ? 'bg-red-500/20 text-red-300 border-2 border-red-500/40'
                        : 'bg-white/5 text-white/60 border-2 border-transparent'
                    }`}
                  >
                    Expense
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, type: 'INCOME', categoryId: '' })
                    }}
                    className={`py-3 px-4 rounded-xl transition-all ${
                      formData.type === 'INCOME'
                        ? 'bg-green-500/20 text-green-300 border-2 border-green-500/40'
                        : 'bg-white/5 text-white/60 border-2 border-transparent'
                    }`}
                  >
                    Income
                  </button>
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Amount
                </label>
                <div className="relative">
                  <div className="absolute left-0 top-0 bottom-0 flex items-center pl-4">
                    <FiDollarSign className="text-xl text-white/50" />
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0.00"
                    className="w-full bg-white/10 border border-white/20 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/40 text-white placeholder-white/60"
                    required
                  />
                </div>
              </div>

              {/* Title/Description */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="What was this for?"
                  className="w-full bg-white/10 border border-white/20 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/40 text-white placeholder-white/60"
                  required
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Date
                </label>
                <div className="relative">
                  <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/40 text-white"
                    required
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Category
                </label>
                {filteredCategories.length === 0 ? (
                  <div className="text-center py-4 text-white/50 text-sm">No categories available</div>
                ) : (
                  <div className="grid grid-cols-3 gap-3">
                    {filteredCategories.map((category) => {
                      const isSelected = formData.categoryId === category.id
                      return (
                        <button
                          key={category.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, categoryId: category.id })}
                          className="flex flex-col items-center justify-center gap-2 p-2 transition-all"
                        >
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-lg border-2 transition-all ${
                              isSelected
                                ? 'bg-white/20 border-white/60 ring-2 ring-white/30 scale-110'
                                : 'bg-transparent border-white/20 hover:border-white/40'
                            }`}
                            style={{ backgroundColor: isSelected ? category.color + '40' : 'transparent' }}
                          >
                            {getCategoryIconById(category.id, categoryMap)}
                          </div>
                          <span className={`text-xs font-medium text-center leading-tight ${
                            isSelected ? 'text-white font-semibold' : 'text-white/70'
                          }`}>
                            {category.name}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Notes (optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Add any additional notes..."
                  rows={3}
                  className="w-full bg-white/10 border border-white/20 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/40 text-white placeholder-white/60 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                disabled={saving}
                onClick={cancelEdit}
                className="flex-1 py-3 px-4 bg-white/10 rounded-xl hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={handleSave}
                className="flex-1 py-3 px-4 bg-white text-[#0c504a] rounded-xl font-semibold hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
