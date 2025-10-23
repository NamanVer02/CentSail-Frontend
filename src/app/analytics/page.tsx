'use client'

import { useRouter } from 'next/navigation'
import { FiArrowLeft, FiTrendingUp, FiTrendingDown, FiDollarSign, FiPieChart, FiBarChart3, FiCalendar } from 'react-icons/fi'

export default function AnalyticsPage() {
  const router = useRouter()

  const analyticsData = [
    { label: 'Food & Dining', amount: 450.50, percentage: 35, color: 'bg-red-400' },
    { label: 'Transportation', amount: 280.75, percentage: 22, color: 'bg-blue-400' },
    { label: 'Entertainment', amount: 180.25, percentage: 14, color: 'bg-purple-400' },
    { label: 'Shopping', amount: 200.00, percentage: 16, color: 'bg-green-400' },
    { label: 'Utilities', amount: 150.00, percentage: 12, color: 'bg-yellow-400' },
  ]

  const monthlyTrends = [
    { month: 'Jan', income: 3500, expenses: 2800 },
    { month: 'Feb', income: 3500, expenses: 3200 },
    { month: 'Mar', income: 3500, expenses: 2900 },
    { month: 'Apr', income: 3500, expenses: 3100 },
    { month: 'May', income: 3500, expenses: 2800 },
    { month: 'Jun', income: 3500, expenses: 3000 },
  ]

  return (
    <div className="min-h-screen w-full bg-[radial-gradient(ellipse_at_center,_#1a7370_0%,_#0c504a_100%)] text-white">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 bg-transparent z-10">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center">
          <button onClick={() => router.back()} className="text-2xl p-2 rounded-full hover:bg-white/10 transition-colors mr-2"><FiArrowLeft /></button>
          <h1 className="text-lg font-semibold">Analytics</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 pt-20 pb-10">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <FiTrendingUp className="text-green-400" />
              <span className="text-xs text-white/60">Total Income</span>
            </div>
            <p className="text-2xl font-bold">$3,500</p>
            <p className="text-xs text-green-400">+5.2% from last month</p>
          </div>
          
          <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <FiTrendingDown className="text-red-400" />
              <span className="text-xs text-white/60">Total Expenses</span>
            </div>
            <p className="text-2xl font-bold">$2,800</p>
            <p className="text-xs text-red-400">+2.1% from last month</p>
          </div>
        </div>

        {/* Expense Breakdown */}
        <div className="bg-white/5 rounded-2xl p-6 border border-white/10 shadow-xl mb-6">
          <div className="flex items-center gap-2 mb-4">
            <FiPieChart className="text-xl" />
            <h3 className="text-lg font-semibold">Expense Breakdown</h3>
          </div>
          
          <div className="space-y-4">
            {analyticsData.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full ${item.color}`}></div>
                  <span className="text-sm">{item.label}</span>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${item.amount}</p>
                  <p className="text-xs text-white/60">{item.percentage}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Trends */}
        <div className="bg-white/5 rounded-2xl p-6 border border-white/10 shadow-xl mb-6">
          <div className="flex items-center gap-2 mb-4">
            <FiBarChart3 className="text-xl" />
            <h3 className="text-lg font-semibold">Monthly Trends</h3>
          </div>
          
          <div className="space-y-3">
            {monthlyTrends.map((trend, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-white/60">{trend.month}</span>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs text-green-400">Income</p>
                    <p className="text-sm font-semibold">${trend.income}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-red-400">Expenses</p>
                    <p className="text-sm font-semibold">${trend.expenses}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Savings Rate */}
        <div className="bg-white/5 rounded-2xl p-6 border border-white/10 shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <FiDollarSign className="text-xl" />
            <h3 className="text-lg font-semibold">Savings Rate</h3>
          </div>
          
          <div className="text-center">
            <p className="text-4xl font-bold text-green-400 mb-2">20%</p>
            <p className="text-sm text-white/60 mb-4">You're saving $700 per month</p>
            
            <div className="w-full bg-white/10 rounded-full h-3">
              <div className="bg-green-400 h-3 rounded-full" style={{width: '20%'}}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
