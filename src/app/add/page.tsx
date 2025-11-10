'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { FiArrowLeft, FiPlus, FiMinus, FiDollarSign, FiCalendar, FiTag, FiEdit3, FiCheck, FiX } from 'react-icons/fi'
import { categoryService, Category } from '@/lib/services/categoryService'
import { entryService } from '@/lib/services/entryService'
import { auth } from '@/lib/config/firebase'
import { toast } from '@/lib/utils/toast'
import { useScrollActivation } from '@/lib/hooks/useScrollActivation'

export default function AddTransactionPage() {
  const router = useRouter()
  const scrollProgress = useScrollActivation(50)
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('expense')
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  })
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingCategories, setLoadingCategories] = useState(false)
  const [categoryError, setCategoryError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCreateCategory, setShowCreateCategory] = useState(false)
  const [newCategory, setNewCategory] = useState({ name: '', color: '#6366f1' })
  const [creatingCategory, setCreatingCategory] = useState(false)

  const dedupeCategories = (items: Category[]): Category[] => {
    const map = new Map<string, Category>()
    items.forEach(c => {
      if (c && c.id) {
        map.set(c.id, c)
      }
    })
    return Array.from(map.values())
  }

  const dedupedCategories = useMemo(() => dedupeCategories(categories), [categories])

  // Fetch categories when component mounts and when transaction type changes
  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true)
      setCategoryError(null)
      // Reset category selection when transaction type changes
      setFormData(prev => ({ ...prev, category: '' }))
      try {
        const response = await categoryService.fetchCategories(transactionType)
        if (response.success && response.data) {
          const list = Array.isArray(response.data) ? response.data : []
          setCategories(dedupeCategories(list))
        } else {
          setCategoryError(response.message || 'Failed to load categories')
          setCategories([])
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
        setCategoryError('Failed to load categories')
        setCategories([])
      } finally {
        setLoadingCategories(false)
      }
    }

    fetchCategories()
  }, [transactionType])

  const handleSubmit = async () => {
    // Get current user
    const user = auth.currentUser
    if (!user) {
      toast.error('You must be logged in to create a transaction')
      return
    }

    // Validate form data
    if (!formData.amount || !formData.description || !formData.category || !formData.date) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)

    try {
      // Format date for backend (needs to be in RFC3339/ISO 8601 format for Timestamp.parseTimestamp)
      // The date input gives us YYYY-MM-DD, we need to convert to ISO 8601 with time
      const dateStr = formData.date // Format: YYYY-MM-DD
      // Create a date object at midnight UTC and convert to ISO string
      const dateObj = new Date(dateStr + 'T00:00:00.000Z')
      const formattedDate = dateObj.toISOString() // Format: YYYY-MM-DDTHH:mm:ss.sssZ

      // Prepare entry data
      const entryData = {
        userId: user.uid,
        title: formData.description,
        type: transactionType.toUpperCase(), // EXPENSE or INCOME
        amount: parseFloat(formData.amount),
        categoryId: formData.category,
        date: formattedDate,
        notes: formData.notes || '' // Include notes
      }

      console.log('Creating entry:', entryData)

      // Call API to create entry
      const response = await entryService.createEntry(entryData)

      if (response.success) {
        toast.success(`Transaction added successfully!`)
        // Reset form
        setFormData({
          amount: '',
          description: '',
          category: '',
          date: new Date().toISOString().split('T')[0],
          notes: '',
        })
        // Navigate back after a short delay to show success message
        setTimeout(() => {
          router.back()
        }, 1000)
      } else {
        toast.error(response.message || 'Failed to create transaction')
      }
    } catch (error) {
      console.error('Error creating transaction:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create transaction')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleCategorySelect = (categoryId: string) => {
    setFormData(prev => ({ ...prev, category: categoryId }))
  }

  const handleCreateCategory = async () => {
    if (!newCategory.name.trim()) {
      toast.error('Category name is required')
      return
    }

    setCreatingCategory(true)
    try {
      const response = await categoryService.createCategory({
        name: newCategory.name.trim(),
        type: transactionType.toUpperCase(),
        color: newCategory.color,
        description: ''
      })

      if (response.success) {
        toast.success('Category created successfully!')
        setShowCreateCategory(false)
        setNewCategory({ name: '', color: '#6366f1' })
        // Refresh categories
        const categoriesResponse = await categoryService.fetchCategories(transactionType)
        if (categoriesResponse.success && categoriesResponse.data) {
          const list = Array.isArray(categoriesResponse.data) ? categoriesResponse.data : []
          setCategories(dedupeCategories(list))
        }
      } else {
        toast.error(response.message || 'Failed to create category')
      }
    } catch (error) {
      console.error('Error creating category:', error)
      toast.error('Failed to create category')
    } finally {
      setCreatingCategory(false)
    }
  }

  const colorOptions = [
    '#ef4444', // red
    '#3b82f6', // blue
    '#22c55e', // green
    '#eab308', // yellow
    '#a855f7', // purple
    '#ec4899', // pink
    '#6366f1', // indigo
    '#f97316', // orange
    '#14b8a6', // teal
  ]

  // Helper function to get category color or default
  const getCategoryColor = (color?: string) => {
    if (!color) return '#6366f1' // Default indigo
    // If color is a hex code, return it; otherwise try to parse it
    if (color.startsWith('#')) return color
    // If it's a Tailwind color class, convert common ones
    const colorMap: Record<string, string> = {
      'red': '#ef4444',
      'blue': '#3b82f6',
      'green': '#22c55e',
      'yellow': '#eab308',
      'purple': '#a855f7',
      'pink': '#ec4899',
      'indigo': '#6366f1',
      'orange': '#f97316',
      'teal': '#14b8a6',
    }
    return colorMap[color.toLowerCase()] || color
  }

  return (
    <div className="min-h-screen w-full bg-[radial-gradient(ellipse_at_center,_#1a7370_0%,_#0c504a_100%)] text-white pb-8">
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
          <button 
            onClick={() => router.back()} 
            className="text-2xl p-2 rounded-full hover:bg-white/10 transition-colors mr-2"
          >
            <FiArrowLeft />
          </button>
          <h1 className="text-lg font-semibold">Add Transaction</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 pt-28 pb-8">
        {/* Transaction Type Toggle */}
        <div className="mb-8">
          <div className="flex gap-3 p-1 bg-white/5 rounded-2xl border border-white/10">
            <button
              type="button"
              onClick={() => setTransactionType('expense')}
              className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl transition-all ${
                transactionType === 'expense' 
                  ? 'bg-gradient-to-r from-red-500/30 to-red-600/20 text-red-200 shadow-lg' 
                  : 'text-white/50 hover:text-white/70'
              }`}
            >
              <FiMinus className="text-xl" />
              <span className="font-semibold">Expense</span>
            </button>
            <button
              type="button"
              onClick={() => setTransactionType('income')}
              className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl transition-all ${
                transactionType === 'income' 
                  ? 'bg-gradient-to-r from-green-500/30 to-green-600/20 text-green-200 shadow-lg' 
                  : 'text-white/50 hover:text-white/70'
              }`}
            >
              <FiPlus className="text-xl" />
              <span className="font-semibold">Income</span>
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Amount - Large, prominent */}
          <div>
            <label className="block text-xs font-medium text-white/50 mb-2 uppercase tracking-wider">
              Amount
            </label>
            <div className="relative">
              <div className="absolute left-0 top-0 bottom-0 flex items-center pl-5">
                <FiDollarSign className="text-3xl text-white/40" />
              </div>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="w-full bg-gradient-to-r from-white/15 to-white/5 border-l-4 border-white/30 rounded-2xl py-6 pl-16 pr-6 text-3xl font-bold placeholder:text-white/20 focus:outline-none focus:border-l-4 focus:border-white/60 focus:bg-white/20 transition-all"
                required
              />
            </div>
          </div>

          {/* Description - Clean, minimal */}
          <div>
            <label className="block text-sm font-medium text-white/60 mb-2">
              Description
            </label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="What was this for?"
              className="w-full bg-transparent border-b-2 border-white/20 rounded-none py-4 px-2 text-lg focus:outline-none focus:border-b-2 focus:border-white/50 transition-all placeholder:text-white/30"
              required
            />
          </div>

          {/* Date - Compact, inline style */}
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-white/60 mb-2">
                Date
              </label>
              <div className="relative">
                <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-white/30 focus:bg-white/10 transition-all"
                  required
                />
              </div>
            </div>
          </div>

          {/* Category Grid */}
          <div>
            <label className="block text-sm font-medium text-white/60 mb-4">Category</label>
            {loadingCategories ? (
              <div className="text-center py-12 text-white/60">Loading categories...</div>
            ) : categoryError ? (
              <div className="text-center py-12 text-red-400 text-sm">{categoryError}</div>
            ) : categories.length === 0 ? (
              <div className="text-center py-12 text-white/60 text-sm">No categories available</div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {dedupedCategories.map((category: Category, index: number) => {
                  const isSelected = formData.category === category.id
                  
                  return (
                    <button
                      key={`${category.id}-${index}`}
                      type="button"
                      onClick={() => handleCategorySelect(category.id)}
                      className="flex flex-col items-center justify-center gap-2 p-2 transition-all"
                    >
                      <div 
                        className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-xl border-2 transition-all ${
                          isSelected 
                            ? 'bg-white/20 border-white/60 ring-4 ring-white/30 scale-110 shadow-lg' 
                            : 'bg-transparent border-white/20 hover:border-white/40'
                        }`}
                      >
                        <FiTag />
                      </div>
                      <span className={`text-xs font-medium text-center leading-tight mt-1 ${
                        isSelected ? 'text-white font-semibold' : 'text-white/70'
                      }`}>
                        {category.name}
                      </span>
                    </button>
                  )
                })}
                {/* Create Category Button */}
                <button
                  type="button"
                  onClick={() => setShowCreateCategory(true)}
                  className="flex flex-col items-center justify-center gap-2 p-2 transition-all"
                >
                  <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl border-2 border-dashed border-white/30 hover:border-white/50 bg-transparent transition-all">
                    <FiPlus />
                  </div>
                  <span className="text-xs font-medium text-center leading-tight mt-1 text-white/70">
                    New
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Notes - Different style, more subtle */}
          <div className="relative">
            <label className="flex items-center gap-2 text-sm font-medium text-white/60 mb-3">
              <FiEdit3 className="text-base" />
              <span>Notes</span>
              <span className="text-white/40 text-xs font-normal">(optional)</span>
            </label>
            <div className="relative">
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Add any additional notes..."
                rows={3}
                className="w-full bg-white/5 backdrop-blur-sm border border-dashed border-white/20 rounded-xl py-4 px-4 text-base focus:outline-none focus:border-solid focus:border-white/40 focus:bg-white/10 transition-all placeholder:text-white/30 resize-none"
              />
              <div className="absolute bottom-2 right-2 text-xs text-white/30">
                {formData.notes.length} characters
              </div>
            </div>
          </div>
        </div>

        {/* Floating Save Button */}
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="fixed bottom-6 right-6 w-16 h-16 bg-white rounded-full shadow-2xl flex items-center justify-center text-[#0c504a] hover:scale-110 active:scale-95 transition-all z-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <div className="w-6 h-6 border-2 border-[#0c504a] border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <FiCheck className="text-2xl" />
          )}
        </button>

        {/* Create Category Modal */}
        {showCreateCategory && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="bg-[#0c504a] rounded-2xl p-6 w-full max-w-md border border-white/20 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Create Category</h2>
                <button
                  onClick={() => {
                    setShowCreateCategory(false)
                    setNewCategory({ name: '', color: '#6366f1' })
                  }}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <FiX className="text-xl" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Category Name
                  </label>
                  <input
                    type="text"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                    placeholder="Enter category name"
                    className="w-full bg-white/10 border border-white/20 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/40"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-3">
                    Color
                  </label>
                  <div className="grid grid-cols-6 gap-3">
                    {colorOptions.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setNewCategory({ ...newCategory, color })}
                        className={`w-12 h-12 rounded-full transition-all ${
                          newCategory.color === color
                            ? 'ring-4 ring-white/50 scale-110'
                            : 'hover:scale-105'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateCategory(false)
                      setNewCategory({ name: '', color: '#6366f1' })
                    }}
                    className="flex-1 py-3 px-4 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateCategory}
                    disabled={creatingCategory || !newCategory.name.trim()}
                    className="flex-1 py-3 px-4 bg-white text-[#0c504a] rounded-xl font-semibold hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {creatingCategory ? 'Creating...' : 'Create'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}