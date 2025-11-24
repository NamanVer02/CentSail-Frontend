  'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect, useMemo } from 'react'
import { FiTrendingUp, FiTrendingDown, FiDollarSign, FiPieChart, FiBarChart, FiCalendar } from 'react-icons/fi'
import { analyticsService } from '@/lib/services/analyticsService'
import { toast } from '@/lib/utils/toast'
import { categoryService, Category } from '@/lib/services/categoryService'
import { getCategoryIconById } from '@/lib/utils/categoryIcons'
import Silk from '@/components/Silk'
import { useSilkSettings } from '@/lib/hooks/useSilkSettings'
import Header from '@/app/components/Header'

export default function AnalyticsPage() {
  const silkSettings = useSilkSettings()
  const router = useRouter()

  const [summaryData, setSummaryData] = useState<{
    totalIncome: number
    totalExpenses: number
    incomeChange: number
    expensesChange: number
  } | null>(null)

  const [expenseBreakdown, setExpenseBreakdown] = useState<Array<{
    categoryId: string
    categoryName: string
    amount: number
    percentage: number
    color: string
  }>>([])

  const [monthlyTrends, setMonthlyTrends] = useState<Array<{
    month: string
    monthFull: string
    income: number
    expenses: number
  }>>([])

  const [savingsRate, setSavingsRate] = useState<{
    savingsRate: number
    savingsAmount: number
  } | null>(null)

  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true)

        // Fetch all analytics data in parallel
        const [summaryRes, breakdownRes, trendsRes, savingsRes] = await Promise.all([
          analyticsService.getSummary(),
          analyticsService.getExpenseBreakdown(),
          analyticsService.getMonthlyTrends(6),
          analyticsService.getSavingsRate(),
        ])

        // Handle summary data
        if (summaryRes.success && summaryRes.data) {
          setSummaryData(summaryRes.data)
        } else {
          console.error('Failed to fetch summary:', summaryRes.message)
          toast.error('Failed to load summary data')
        }

        // Handle expense breakdown
        if (breakdownRes.success && breakdownRes.data) {
          setExpenseBreakdown(breakdownRes.data.categories || [])
        } else {
          console.error('Failed to fetch expense breakdown:', breakdownRes.message)
          toast.error('Failed to load expense breakdown')
        }

        // Handle monthly trends
        if (trendsRes.success && trendsRes.data) {
          setMonthlyTrends(trendsRes.data.trends || [])
        } else {
          console.error('Failed to fetch monthly trends:', trendsRes.message)
          toast.error('Failed to load monthly trends')
        }

        // Handle savings rate
        if (savingsRes.success && savingsRes.data) {
          setSavingsRate({
            savingsRate: savingsRes.data.savingsRate,
            savingsAmount: savingsRes.data.savingsAmount,
          })
        } else {
          console.error('Failed to fetch savings rate:', savingsRes.message)
          toast.error('Failed to load savings rate')
        }
      } catch (error) {
        console.error('Error fetching analytics data:', error)
        toast.error('Failed to load analytics data')
      } finally {
        setLoading(false)
      }
    }

    fetchAnalyticsData()
  }, [])

  // Fetch categories for icons
  useEffect(() => {
    ;(async () => {
      try {
        const [exp, inc] = await Promise.all([
          categoryService.fetchCategories('EXPENSE'),
          categoryService.fetchCategories('INCOME')
        ])
        const arr: Category[] = []
        if (exp.success && exp.data) arr.push(...(Array.isArray(exp.data) ? exp.data : []))
        if (inc.success && inc.data) arr.push(...(Array.isArray(inc.data) ? inc.data : []))
        setCategories(arr)
      } catch (error) {
        console.error('Error fetching categories:', error)
      }
    })()
  }, [])

  // Map category ID to category object
  const categoryMap = useMemo(() => {
    const m = new Map<string, Category>()
    categories.forEach(c => m.set(c.id, c))
    return m
  }, [categories])


  // Format percentage change with sign
  const formatChange = (change: number): string => {
    const sign = change >= 0 ? '+' : ''
    return `${sign}${change.toFixed(1)}%`
  }

  return (
    <div className="min-h-screen w-full text-white relative">
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
      <Header title="Analytics" />

      <div className="max-w-md mx-auto px-4 pt-28 pb-24 relative z-10">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-white/60">Loading analytics...</div>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white/10 rounded-2xl p-4 border border-white/20 backdrop-blur-lg">
                <div className="flex items-center gap-2 mb-2">
                  <FiTrendingUp className="text-green-400" />
                  <span className="text-xs text-white/60">Total Income</span>
                </div>
                <p className="text-2xl font-bold">
                  ${summaryData?.totalIncome.toFixed(2) || '0.00'}
                </p>
                {summaryData && summaryData.incomeChange !== undefined && (
                  <p className="text-xs text-white/75">
                    {formatChange(summaryData.incomeChange)} from last month
                  </p>
                )}
              </div>
              
              <div className="bg-white/10 rounded-2xl p-4 border border-white/20 backdrop-blur-lg">
                <div className="flex items-center gap-2 mb-2">
                  <FiTrendingDown className="text-red-400" />
                  <span className="text-xs text-white/60">Total Expenses</span>
                </div>
                <p className="text-2xl font-bold">
                  ${summaryData?.totalExpenses.toFixed(2) || '0.00'}
                </p>
                {summaryData && summaryData.expensesChange !== undefined && (
                  <p className="text-xs text-white/75">
                    {formatChange(summaryData.expensesChange)} from last month
                  </p>
                )}
              </div>
            </div>

            {/* Savings Rate */}
            <div className="bg-white/10 rounded-2xl p-6 border border-white/20 backdrop-blur-lg mb-6">
              <div className="flex items-center gap-2 mb-4">
                <FiDollarSign className="text-xl" />
                <h3 className="text-lg font-semibold">Savings Rate</h3>
              </div>
              
              {savingsRate ? (
                <div className="text-center">
                  <p className={`text-4xl font-bold mb-2 ${savingsRate.savingsRate >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {savingsRate.savingsRate.toFixed(1)}%
                  </p>
                  <p className="text-sm text-white/60 mb-4">
                    You're saving ${Math.abs(savingsRate.savingsAmount).toFixed(2)} {savingsRate.savingsAmount >= 0 ? 'per month' : 'in debt'}
                  </p>
                  
                  <div className="w-full bg-white/10 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full ${savingsRate.savingsRate >= 0 ? 'bg-green-400' : 'bg-red-400'}`}
                      style={{ width: `${Math.min(Math.abs(savingsRate.savingsRate), 100)}%` }}
                    ></div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-white/60">
                  <p>No savings data available</p>
                </div>
              )}
            </div>

            {/* Expense Breakdown */}
            <div className="bg-white/10 rounded-2xl p-6 border border-white/20 backdrop-blur-lg mb-6">
              <div className="flex items-center gap-2 mb-4">
                <FiPieChart className="text-xl" />
                <h3 className="text-lg font-semibold">Expense Breakdown</h3>
              </div>
              
              {expenseBreakdown.length === 0 ? (
                <div className="text-center py-8 text-white/60">
                  <p>No expense data available</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {expenseBreakdown.map((item) => (
                    <div key={item.categoryId} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-white text-sm">
                          {getCategoryIconById(item.categoryId, categoryMap)}
                        </div>
                        <span className="text-sm">{item.categoryName}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${item.amount.toFixed(2)}</p>
                        <p className="text-xs text-white/60">{item.percentage.toFixed(1)}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Monthly Trends */}
            <div className="bg-white/10 rounded-2xl p-6 border border-white/20 backdrop-blur-lg">
              <div className="flex items-center gap-2 mb-4">
                <FiBarChart className="text-xl" />
                <h3 className="text-lg font-semibold">Monthly Trends</h3>
              </div>
              
              {monthlyTrends.length === 0 ? (
                <div className="text-center py-8 text-white/60">
                  <p>No trend data available</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Header Row */}
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <span className="text-sm text-white/60 font-medium">Month</span>
                    <div className="flex items-center gap-4">
                      <div className="text-right w-20">
                        <p className="text-xs text-green-400 font-medium">Income</p>
                      </div>
                      <div className="text-right w-20">
                        <p className="text-xs text-red-400 font-medium">Expenses</p>
                      </div>
                    </div>
                  </div>
                  {/* Data Rows */}
                  {monthlyTrends.map((trend, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-white/60">{trend.month}</span>
                      <div className="flex items-center gap-4">
                        <div className="text-right w-20">
                          <p className="text-sm font-semibold">${trend.income.toFixed(2)}</p>
                        </div>
                        <div className="text-right w-20">
                          <p className="text-sm font-semibold">${trend.expenses.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
