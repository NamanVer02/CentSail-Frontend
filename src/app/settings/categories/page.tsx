'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FiArrowLeft, FiPlus, FiEdit2, FiTrash2, FiX, FiTag } from 'react-icons/fi'
import { categoryService, Category } from '@/lib/services/categoryService'
import { toast } from '@/lib/utils/toast'

export default function CategoriesManagementPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({ name: '', type: 'EXPENSE', color: '#6366f1', description: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const colorOptions = [
    '#ef4444', '#3b82f6', '#22c55e', '#eab308', '#a855f7',
    '#ec4899', '#6366f1', '#f97316', '#14b8a6'
  ]

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    setLoading(true)
    try {
      // Fetch both expense and income categories
      const [expenseResponse, incomeResponse] = await Promise.all([
        categoryService.fetchCategories('EXPENSE'),
        categoryService.fetchCategories('INCOME')
      ])

      const allCategories: Category[] = []
      if (expenseResponse.success && expenseResponse.data) {
        allCategories.push(...(Array.isArray(expenseResponse.data) ? expenseResponse.data : []))
      }
      if (incomeResponse.success && incomeResponse.data) {
        allCategories.push(...(Array.isArray(incomeResponse.data) ? incomeResponse.data : []))
      }

      setCategories(allCategories)
    } catch (error) {
      console.error('Error fetching categories:', error)
      toast.error('Failed to load categories')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      toast.error('Category name is required')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await categoryService.createCategory({
        name: formData.name.trim(),
        type: formData.type,
        color: formData.color,
        description: formData.description || ''
      })

      if (response.success) {
        toast.success('Category created successfully!')
        setShowCreateModal(false)
        setFormData({ name: '', type: 'EXPENSE', color: '#6366f1', description: '' })
        fetchCategories()
      } else {
        toast.error(response.message || 'Failed to create category')
      }
    } catch (error) {
      console.error('Error creating category:', error)
      toast.error('Failed to create category')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdate = async () => {
    if (!editingCategory || !formData.name.trim()) {
      toast.error('Category name is required')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await categoryService.updateCategory({
        id: editingCategory.id,
        name: formData.name.trim(),
        type: formData.type,
        color: formData.color,
        description: formData.description || ''
      })

      if (response.success) {
        toast.success('Category updated successfully!')
        setShowEditModal(false)
        setEditingCategory(null)
        setFormData({ name: '', type: 'EXPENSE', color: '#6366f1', description: '' })
        fetchCategories()
      } else {
        toast.error(response.message || 'Failed to update category')
      }
    } catch (error) {
      console.error('Error updating category:', error)
      toast.error('Failed to update category')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category?')) {
      return
    }

    try {
      const response = await categoryService.deleteCategory(categoryId)
      if (response.success) {
        toast.success('Category deleted successfully!')
        fetchCategories()
      } else {
        toast.error(response.message || 'Failed to delete category')
      }
    } catch (error) {
      console.error('Error deleting category:', error)
      toast.error('Failed to delete category')
    }
  }

  const openEditModal = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      type: category.type,
      color: category.color || '#6366f1',
      description: category.description || ''
    })
    setShowEditModal(true)
  }

  const closeModals = () => {
    setShowCreateModal(false)
    setShowEditModal(false)
    setEditingCategory(null)
    setFormData({ name: '', type: 'EXPENSE', color: '#6366f1', description: '' })
  }

  const expenseCategories = categories.filter(c => c.type === 'EXPENSE')
  const incomeCategories = categories.filter(c => c.type === 'INCOME')

  return (
    <div className="min-h-screen w-full bg-[radial-gradient(ellipse_at_center,_#1a7370_0%,_#0c504a_100%)] text-white pb-32">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 bg-transparent z-10">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center">
          <button 
            onClick={() => router.back()} 
            className="text-2xl p-2 rounded-full hover:bg-white/10 transition-colors mr-2"
          >
            <FiArrowLeft />
          </button>
          <h1 className="text-lg font-semibold">Category Management</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 pt-20 pb-8">
        <div className="mb-6 flex justify-end">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white text-[#0c504a] rounded-xl font-semibold hover:bg-white/90 transition-colors"
          >
            <FiPlus />
            <span>Add Category</span>
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-white/60">Loading categories...</div>
        ) : (
          <div className="space-y-8">
            {/* Expense Categories */}
            <div>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-red-400 rounded-full"></span>
                Expense Categories
              </h2>
              {expenseCategories.length === 0 ? (
                <p className="text-white/50 text-sm">No expense categories</p>
              ) : (
                <div className="space-y-2">
                  {expenseCategories.map((category) => (
                    <div
                      key={category.id}
                      className="bg-white/5 rounded-xl p-4 border border-white/10 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center border-2 border-white/20 flex-shrink-0"
                          style={{ backgroundColor: category.color || '#6366f1' }}
                        >
                          <FiTag className="text-white text-sm" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate">{category.name}</p>
                          {category.description && (
                            <p className="text-xs text-white/50 break-words">{category.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(category)}
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        >
                          <FiEdit2 className="text-lg" />
                        </button>
                        <button
                          onClick={() => handleDelete(category.id)}
                          className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-red-400"
                        >
                          <FiTrash2 className="text-lg" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Income Categories */}
            <div>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-green-400 rounded-full"></span>
                Income Categories
              </h2>
              {incomeCategories.length === 0 ? (
                <p className="text-white/50 text-sm">No income categories</p>
              ) : (
                <div className="space-y-2">
                  {incomeCategories.map((category) => (
                    <div
                      key={category.id}
                      className="bg-white/5 rounded-xl p-4 border border-white/10 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center border-2 border-white/20 flex-shrink-0"
                          style={{ backgroundColor: category.color || '#6366f1' }}
                        >
                          <FiTag className="text-white text-sm" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate">{category.name}</p>
                          {category.description && (
                            <p className="text-xs text-white/50 break-words">{category.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(category)}
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        >
                          <FiEdit2 className="text-lg" />
                        </button>
                        <button
                          onClick={() => handleDelete(category.id)}
                          className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-red-400"
                        >
                          <FiTrash2 className="text-lg" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0c504a] rounded-2xl p-6 w-full max-w-md border border-white/20 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">
                {showEditModal ? 'Edit Category' : 'Create Category'}
              </h2>
              <button
                onClick={closeModals}
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
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                    onClick={() => setFormData({ ...formData, type: 'EXPENSE' })}
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
                    onClick={() => setFormData({ ...formData, type: 'INCOME' })}
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

              <div>
                <label className="block text-sm font-medium text-white/70 mb-3">
                  Color
                </label>
                <div className="grid grid-cols-6 gap-3">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={`w-12 h-12 rounded-full transition-all ${
                        formData.color === color
                          ? 'ring-4 ring-white/50 scale-110'
                          : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter description"
                  rows={2}
                  className="w-full bg-white/10 border border-white/20 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/40 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModals}
                  className="flex-1 py-3 px-4 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={showEditModal ? handleUpdate : handleCreate}
                  disabled={isSubmitting || !formData.name.trim()}
                  className="flex-1 py-3 px-4 bg-white text-[#0c504a] rounded-xl font-semibold hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Saving...' : showEditModal ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


