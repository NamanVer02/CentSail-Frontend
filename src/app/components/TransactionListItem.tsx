'use client'

import Link from 'next/link'
import { FiTag } from 'react-icons/fi'
import { Category } from '@/lib/services/categoryService'

interface TransactionListItemProps {
  id: string
  title: string
  type: string
  amount: number
  categoryId: string
  date: any
  categoryIdToCategory: Map<string, Category>
  categoryIdToName: Map<string, string>
  parseDate: (dateValue: any) => Date | null
}

export default function TransactionListItem({
  id,
  title,
  type,
  amount,
  categoryId,
  date,
  categoryIdToCategory,
  categoryIdToName,
  parseDate,
}: TransactionListItemProps) {
  const category = categoryIdToCategory.get(categoryId)
  const categoryColor = category?.color || '#6366f1'
  const categoryName = categoryIdToName.get(categoryId) || 'Category'
  const dateObj = parseDate(date)
  const formattedDate = dateObj ? (() => {
    const day = String(dateObj.getDate()).padStart(2, '0')
    const month = String(dateObj.getMonth() + 1).padStart(2, '0')
    const year = dateObj.getFullYear()
    return `${day}/${month}/${year}`
  })() : 'Invalid Date'
  const isIncome = type === 'INCOME'

  return (
    <Link href={`/transactions/${id}`}>
      <div className="flex items-center justify-between py-3 border-b border-white/10 hover:bg-white/5 rounded-lg px-2 transition-all cursor-pointer">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-white border-2 border-white/20"
            style={{ backgroundColor: categoryColor + '40' }}
          >
            <FiTag className="text-lg" />
          </div>
          <div>
            <p className="font-medium text-sm text-white">{title}</p>
            <p className="text-white/50 text-xs">
              {categoryName} • {formattedDate}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className={`font-bold text-base ${isIncome ? 'text-green-300' : 'text-white'}`}>
            {isIncome ? '+' : ''}${Math.abs(amount).toFixed(2)}
          </p>
        </div>
      </div>
    </Link>
  )
}

