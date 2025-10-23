'use client'

import { useState } from 'react'
import Link from 'next/link'
import RadarChart from '@/app/components/ui/RadarChart'
import { FiGlobe, FiShoppingCart, FiSend, FiWatch, FiAward, FiAlertTriangle, FiFilm, FiShoppingBag, FiTrendingUp, FiPlus, FiRepeat, FiBarChart2, FiTarget, FiUser, FiBell, FiArrowUp, FiArrowDown } from 'react-icons/fi'

export default function DashboardPage() {
  const [greeting] = useState(() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 18) return 'Good Afternoon'
    return 'Good Evening'
  })

  // Dummy data for radar chart
  const expenseData = [
    { label: 'Internet', value: 9, icon: <FiGlobe /> },
    { label: 'Grocery', value: 24, icon: <FiShoppingCart /> },
    { label: 'Taxi', value: 14, icon: <FiSend /> },
    { label: 'Restaurants', value: 9, icon: <FiWatch /> },
    { label: 'Sport', value: 13, icon: <FiAward /> },
    { label: 'Alcohol', value: 3, icon: <FiAlertTriangle /> },
    { label: 'Entertainment', value: 24, icon: <FiFilm /> },
    { label: 'Clothes', value: 4, icon: <FiShoppingBag /> },
  ]

  // Dummy recent transactions
  const recentTransactions = [
    { id: 1, name: 'Grocery Store', category: 'Grocery', amount: -45.20, date: '2025-10-17', icon: <FiShoppingCart /> },
    { id: 2, name: 'Uber Ride', category: 'Taxi', amount: -12.50, date: '2025-10-16', icon: <FiSend /> },
    { id: 3, name: 'Netflix Subscription', category: 'Entertainment', amount: -15.99, date: '2025-10-16', icon: <FiFilm /> },
    { id: 4, name: 'Restaurant', category: 'Food', amount: -32.80, date: '2025-10-15', icon: <FiWatch /> },
    { id: 5, name: 'Salary', category: 'Income', amount: 3500.00, date: '2025-10-15', icon: <FiTrendingUp /> },
  ]

  const quickActions = [
    { icon: <FiPlus />, label: 'Add', description: 'Transaction', href: '/add' },
    { icon: <FiRepeat />, label: 'Transfer', description: 'Money', href: '/transfer' },
    { icon: <FiBarChart2 />, label: 'Reports', description: 'View', href: '/analytics' },
    { icon: <FiTarget />, label: 'Budget', description: 'Set', href: '/budget' },
  ]

  return (
    <div className="min-h-screen w-full bg-[radial-gradient(ellipse_at_center,_#1a7370_0%,_#0c504a_100%)] relative overflow-hidden">
      {/* Decorative background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-64 bg-[radial-gradient(circle,_rgba(255,255,255,0.3)_1px,_transparent_1px)] bg-[size:20px_20px]"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 px-6 py-6 pb-24 max-w-6xl mx-auto">
        {/* Top Section - Header (Settings button removed) */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center overflow-hidden">
              <Link href="/profile" className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/30 flex items-center justify-center hover:bg-white/20 transition-all">
                <span className="text-2xl text-white"><FiUser /></span>
              </Link>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{greeting}</h1>
              <p className="text-white/70 text-sm">Welcome back!</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/30 flex items-center justify-center hover:bg-white/20 transition-all">
              <span className="text-white text-xl"><FiBell /></span>
            </button>
          </div>
        </div>

        {/* Compact Balance Section */}
        <div className="mb-6">
          <div className="flex items-end justify-between mb-3">
            <div>
              <p className="text-white/60 text-xs mb-1">Total Balance</p>
              <h2 className="text-4xl font-bold text-white">$1,632.82</h2>
            </div>
            <div className="text-right mb-1">
              <p className="text-green-300 text-sm font-semibold">+13%</p>
              <p className="text-white/50 text-xs">this month</p>
            </div>
          </div>
          
          <div className="flex gap-6 mt-3">
            <div className="flex items-center gap-2">
              <span className="text-green-300 text-xl"><FiArrowUp /></span>
              <div>
                <p className="text-white/50 text-[10px] uppercase tracking-wide">Income</p>
                <p className="text-white font-semibold text-lg">$3,500.00</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-red-300 text-xl"><FiArrowDown /></span>
              <div>
                <p className="text-white/50 text-[10px] uppercase tracking-wide">Expenses</p>
                <p className="text-white font-semibold text-lg">$1,867.18</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions - Circular Buttons */}
        <div className="mb-6">
          <div className="flex justify-around items-center gap-3 px-2">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                href={action.href}
                className="flex flex-col items-center gap-2 group"
              >
                <div className="w-16 h-16 rounded-full bg-white/15 backdrop-blur-sm border border-white/30 flex items-center justify-center hover:bg-white/25 hover:scale-110 transition-all shadow-lg">
                  <span className="text-3xl text-white">{action.icon}</span>
                </div>
                <div className="text-center">
                  <p className="text-white text-xs font-medium">{action.label}</p>
                  <p className="text-white/50 text-[10px]">{action.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Quick Analytics */}
        <div className="backdrop-blur-2xl bg-white/10 rounded-3xl p-6 shadow-2xl border border-white/20 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-white">Expense Analytics</h3>
            <button className="text-white/70 text-sm hover:text-white transition-colors">
              Details →
            </button>
          </div>
          
          <RadarChart data={expenseData} />
          
          <div className="mt-4 text-center">
            <p className="text-white/60 text-xs mb-1">Total spent this month</p>
            <p className="text-white text-3xl font-bold">$841.90</p>
          </div>
        </div>

        {/* Recent Transactions */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-white">Recent Transactions</h3>
            <Link href="/transactions" className="text-white/70 text-sm hover:text-white transition-colors">
              View all →
            </Link>
          </div>
          
          <div className="space-y-3">
            {recentTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between py-3 border-b border-white/10 hover:bg-white/5 rounded-lg px-2 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-2xl text-white">
                    {transaction.icon}
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">{transaction.name}</p>
                    <p className="text-white/50 text-xs">{transaction.category} • {transaction.date}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className={`font-bold text-base ${transaction.amount > 0 ? 'text-green-300' : 'text-white'}`}>
                    {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
