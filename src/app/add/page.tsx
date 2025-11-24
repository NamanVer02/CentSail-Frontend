'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { FiPlus, FiMinus, FiDollarSign, FiCalendar, FiEdit3, FiCheck, FiX } from 'react-icons/fi'
import { categoryService, Category } from '@/lib/services/categoryService'
import { entryService } from '@/lib/services/entryService'
import { auth } from '@/lib/config/firebase'
import { toast } from '@/lib/utils/toast'
import { getCategoryIcon, getIconByName, availableIcons } from '@/lib/utils/categoryIcons'
import Silk from '@/components/Silk'
import { useSilkSettings } from '@/lib/hooks/useSilkSettings'
import Header from '@/app/components/Header'

export default function AddTransactionPage() {
  const silkSettings = useSilkSettings()
  const router = useRouter()
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
  const [newCategory, setNewCategory] = useState({ 
    name: '', 
    type: transactionType.toUpperCase() as 'EXPENSE' | 'INCOME',
    color: '#6366f1',
    icon: 'tag',
    description: ''
  })
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

  // Update newCategory type when transaction type changes
  useEffect(() => {
    setNewCategory(prev => ({ ...prev, type: transactionType.toUpperCase() as 'EXPENSE' | 'INCOME' }))
  }, [transactionType])

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
        type: newCategory.type,
        color: newCategory.color,
        description: newCategory.description || '',
        icon: newCategory.icon
      })

      if (response.success) {
        toast.success('Category created successfully!')
        setShowCreateCategory(false)
        setNewCategory({ 
          name: '', 
          type: transactionType.toUpperCase() as 'EXPENSE' | 'INCOME',
          color: '#6366f1',
          icon: 'tag',
          description: ''
        })
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

  return (
    <div className="min-h-screen w-full text-white pb-8 relative">
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
      <Header title="Add Transaction" />

      <div className="max-w-md mx-auto px-4 pt-28 pb-8 relative z-10">
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
                  const categoryIcon = getCategoryIcon(category)
                  
                  return (
                    <button
                      key={`${category.id}-${index}`}
                      type="button"
                      onClick={() => handleCategorySelect(category.id)}
                      className="flex flex-col items-center justify-center gap-2 p-2 transition-all"
                    >
                      <div 
                        className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-xl border-2 transition-all backdrop-blur-md ${
                          isSelected 
                            ? 'bg-white/20 border-white/60 ring-4 ring-white/30 scale-110 shadow-lg' 
                            : 'bg-white/10 border-white/20 hover:bg-white/15 hover:border-white/40'
                        }`}
                      >
                        {categoryIcon}
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
            <div className="bg-black/30 backdrop-blur-md rounded-2xl p-6 w-full max-w-md border border-white/20 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Create Category</h2>
                <button
                  onClick={() => {
                    setShowCreateCategory(false)
                    setNewCategory({ 
                      name: '', 
                      type: transactionType.toUpperCase() as 'EXPENSE' | 'INCOME',
                      color: '#6366f1',
                      icon: 'tag',
                      description: ''
                    })
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
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Type
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setNewCategory({ ...newCategory, type: 'EXPENSE' })}
                      className={`py-3 px-4 rounded-xl transition-all ${
                        newCategory.type === 'EXPENSE'
                          ? 'bg-red-500/20 text-red-300 border-2 border-red-500/40'
                          : 'bg-white/5 text-white/60 border-2 border-transparent'
                      }`}
                    >
                      Expense
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewCategory({ ...newCategory, type: 'INCOME' })}
                      className={`py-3 px-4 rounded-xl transition-all ${
                        newCategory.type === 'INCOME'
                          ? 'bg-green-500/20 text-green-300 border-2 border-green-500/40'
                          : 'bg-white/5 text-white/60 border-2 border-transparent'
                      }`}
                    >
                      Income
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-3">
                    Icon
                  </label>
                  <div className="grid grid-cols-6 gap-3 max-h-64 overflow-y-auto p-2 bg-white/5 rounded-xl border border-white/10">
                    {availableIcons.map((icon) => (
                      <button
                        key={icon.name}
                        type="button"
                        onClick={() => setNewCategory({ ...newCategory, icon: icon.name })}
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                          newCategory.icon === icon.name
                            ? 'bg-white/20 border-2 border-white/50 scale-110'
                            : 'bg-white/10 border-2 border-white/20 hover:bg-white/15 hover:border-white/40 hover:scale-105'
                        }`}
                        title={icon.label}
                      >
                        <span className="text-white text-lg">
                          {getIconByName(icon.name)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Description (optional)
                  </label>
                  <textarea
                    value={newCategory.description}
                    onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                    placeholder="Enter description"
                    rows={2}
                    className="w-full bg-white/10 border border-white/20 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/40 resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateCategory(false)
                      setNewCategory({ 
                        name: '', 
                        type: transactionType.toUpperCase() as 'EXPENSE' | 'INCOME',
                        color: '#6366f1',
                        icon: 'tag',
                        description: ''
                      })
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