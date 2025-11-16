'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FiArrowLeft, FiPlus, FiEdit2, FiTrash2, FiX, FiTag } from 'react-icons/fi'
import { categoryService, Category } from '@/lib/services/categoryService'
import { toast } from '@/lib/utils/toast'
import { useScrollActivation } from '@/lib/hooks/useScrollActivation'
import { getCategoryIcon, getIconByName, availableIcons } from '@/lib/utils/categoryIcons'
import ConfirmDialog from '@/app/components/ConfirmDialog'
import Silk from '@/components/Silk'
import { useSilkSettings } from '@/lib/hooks/useSilkSettings'

export default function CategoriesManagementPage() {
  const silkSettings = useSilkSettings()
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({ name: '', type: 'EXPENSE', color: '#6366f1', description: '', icon: 'tag' }) // color kept for backend compatibility but not displayed
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; categoryId: string | null }>({ isOpen: false, categoryId: null })
  const scrollProgress = useScrollActivation(50)

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

    // Client-side limit guard (backend also enforces)
    const currentCount = formData.type === 'EXPENSE'
      ? categories.filter(c => c.type === 'EXPENSE').length
      : categories.filter(c => c.type === 'INCOME').length
    if (currentCount >= 10) {
      toast.error(`You can create up to 10 ${formData.type.toLowerCase()} categories.`)
      return
    }

    setIsSubmitting(true)
    try {
      const response = await categoryService.createCategory({
        name: formData.name.trim(),
        type: formData.type,
        color: formData.color,
        description: formData.description || '',
        icon: formData.icon
      })

      if (response.success) {
        toast.success('Category created successfully!')
        setShowCreateModal(false)
        setFormData({ name: '', type: 'EXPENSE', color: '#6366f1', description: '', icon: 'tag' }) // color kept for backend compatibility
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
        description: formData.description || '',
        icon: formData.icon
      })

      if (response.success) {
        toast.success('Category updated successfully!')
        setShowEditModal(false)
        setEditingCategory(null)
        setFormData({ name: '', type: 'EXPENSE', color: '#6366f1', description: '', icon: 'tag' }) // color kept for backend compatibility
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

  const handleDeleteClick = (categoryId: string) => {
    setDeleteConfirm({ isOpen: true, categoryId })
  }

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.categoryId) return

    try {
      const response = await categoryService.deleteCategory(deleteConfirm.categoryId)
      if (response.success) {
        toast.success('Category deleted successfully!')
        fetchCategories()
      } else {
        toast.error(response.message || 'Failed to delete category')
      }
    } catch (error) {
      console.error('Error deleting category:', error)
      toast.error('Failed to delete category')
    } finally {
      setDeleteConfirm({ isOpen: false, categoryId: null })
    }
  }

  const handleDeleteCancel = () => {
    setDeleteConfirm({ isOpen: false, categoryId: null })
  }

  const openEditModal = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      type: category.type,
      color: category.color || '#6366f1',
      description: category.description || '',
      icon: category.icon || 'tag'
    })
    setShowEditModal(true)
  }

  const closeModals = () => {
    setShowCreateModal(false)
    setShowEditModal(false)
    setEditingCategory(null)
    setFormData({ name: '', type: 'EXPENSE', color: '#6366f1', description: '', icon: 'tag' })
  }

  const expenseCategories = categories.filter(c => c.type === 'EXPENSE')
  const incomeCategories = categories.filter(c => c.type === 'INCOME')
  const reachedLimit = (formData.type === 'EXPENSE' ? expenseCategories.length : incomeCategories.length) >= 10

  return (
    <div className="min-h-screen w-full text-white pb-32 relative">
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
          <button 
            onClick={() => router.back()} 
            className="text-2xl p-2 rounded-full hover:bg-white/10 transition-colors mr-2"
          >
            <FiArrowLeft />
          </button>
          <h1 className="text-lg font-semibold">Category Management</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 pt-28 pb-24 relative z-10">
        {/* Limits Progress */}
        <div className="mb-6 bg-white/5 rounded-2xl border border-white/10 p-4 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center">
                <FiTag className="text-white/80" />
              </div>
              <h3 className="text-base font-semibold">Category Limits</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] px-2 py-1 rounded-full bg-red-500/20 text-red-200 border border-red-500/30">
                {expenseCategories.length}/10 Expense
              </span>
              <span className="text-[11px] px-2 py-1 rounded-full bg-green-500/20 text-green-200 border border-green-500/30">
                {incomeCategories.length}/10 Income
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-white/80">Expense Categories</span>
                <span className="text-xs text-white/60">{10 - expenseCategories.length} remaining</span>
              </div>
              <div className="h-3 bg-white/10 rounded-full overflow-hidden border border-white/10">
                <div
                  className="h-3 rounded-full bg-gradient-to-r from-red-400 to-red-300"
                  style={{ width: `${Math.min(100, (expenseCategories.length / 10) * 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-white/80">Income Categories</span>
                <span className="text-xs text-white/60">{10 - incomeCategories.length} remaining</span>
              </div>
              <div className="h-3 bg-white/10 rounded-full overflow-hidden border border-white/10">
                <div
                  className="h-3 rounded-full bg-gradient-to-r from-green-400 to-green-300"
                  style={{ width: `${Math.min(100, (incomeCategories.length / 10) * 100)}%` }}
                />
              </div>
            </div>
          </div>
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
                          className="w-10 h-10 rounded-full flex items-center justify-center border-2 border-white/20 flex-shrink-0 bg-white/10 backdrop-blur-md"
                        >
                          {getCategoryIcon(category)}
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
                          onClick={() => handleDeleteClick(category.id)}
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
                          className="w-10 h-10 rounded-full flex items-center justify-center border-2 border-white/20 flex-shrink-0 bg-white/10 backdrop-blur-md"
                        >
                          {getCategoryIcon(category)}
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
                          onClick={() => handleDeleteClick(category.id)}
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

      {/* Floating Add Button */}
      <button
        onClick={() => setShowCreateModal(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-white text-[#0c504a] shadow-xl flex items-center justify-center hover:scale-110 transition-all"
        aria-label="Add Category"
      >
        <FiPlus className="text-2xl" />
      </button>

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-black/30 backdrop-blur-md rounded-2xl p-6 w-full max-w-md border border-white/20 shadow-2xl">
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
                {reachedLimit && (
                  <p className="mt-2 text-xs text-yellow-300/80">
                    You have reached the limit of 10 {formData.type.toLowerCase()} categories.
                  </p>
                )}
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
                      onClick={() => setFormData({ ...formData, icon: icon.name })}
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                        formData.icon === icon.name
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
                  disabled={isSubmitting || !formData.name.trim() || (!showEditModal && reachedLimit)}
                  className="flex-1 py-3 px-4 bg-white text-[#0c504a] rounded-xl font-semibold hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Saving...' : showEditModal ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Delete Category"
        message="Are you sure you want to delete this category? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        variant="danger"
      />
    </div>
  )
}


