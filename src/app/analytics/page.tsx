'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { FiArrowLeft, FiTrendingUp, FiTrendingDown, FiDollarSign, FiPieChart, FiBarChart, FiCalendar } from 'react-icons/fi'
import { analyticsService } from '@/lib/services/analyticsService'
import { toast } from '@/lib/utils/toast'
import { useScrollActivation } from '@/lib/hooks/useScrollActivation'
import Silk from '@/components/Silk'
import { useSilkSettings } from '@/lib/hooks/useSilkSettings'

export default function AnalyticsPage() {
  const silkSettings = useSilkSettings()
  const router = useRouter()
  const scrollProgress = useScrollActivation(50)

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

  // Helper function to get color class from hex color
  const getColorClass = (hexColor: string): string => {
    // Map common hex colors to Tailwind classes
    const colorMap: Record<string, string> = {
      '#ef4444': 'bg-red-400',
      '#f97316': 'bg-orange-400',
      '#fbbf24': 'bg-yellow-400',
      '#84cc16': 'bg-lime-400',
      '#22c55e': 'bg-green-400',
      '#10b981': 'bg-emerald-400',
      '#14b8a6': 'bg-teal-400',
      '#06b6d4': 'bg-cyan-400',
      '#3b82f6': 'bg-blue-400',
      '#6366f1': 'bg-indigo-400',
      '#8b5cf6': 'bg-violet-400',
      '#a855f7': 'bg-purple-400',
      '#ec4899': 'bg-pink-400',
      '#f43f5e': 'bg-rose-400',
    }

    // Try to find exact match
    if (colorMap[hexColor.toLowerCase()]) {
      return colorMap[hexColor.toLowerCase()]
    }

    // Default fallback
    return 'bg-indigo-400'
  }

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
          <button onClick={() => router.back()} className="text-2xl p-2 rounded-full hover:bg-white/10 transition-colors mr-2"><FiArrowLeft /></button>
          <h1 className="text-lg font-semibold">Analytics</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 pt-28 pb-24 relative z-10">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-white/60">Loading analytics...</div>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
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
              
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
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

            {/* Expense Breakdown */}
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10 shadow-xl mb-6">
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
                        <div 
                          className={`w-4 h-4 rounded-full ${getColorClass(item.color)}`}
                          style={{ backgroundColor: item.color }}
                        ></div>
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
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10 shadow-xl mb-6">
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
                  {monthlyTrends.map((trend, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-white/60">{trend.month}</span>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-xs text-green-400">Income</p>
                          <p className="text-sm font-semibold">${trend.income.toFixed(2)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-red-400">Expenses</p>
                          <p className="text-sm font-semibold">${trend.expenses.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Savings Rate */}
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10 shadow-xl">
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
          </>
        )}
      </div>
    </div>
  )
}
