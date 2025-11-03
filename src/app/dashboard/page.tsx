'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import RadarChart from '@/app/components/ui/RadarChart'
import { FiGlobe, FiShoppingCart, FiSend, FiWatch, FiAward, FiAlertTriangle, FiFilm, FiShoppingBag, FiTrendingUp, FiPlus, FiRepeat, FiBarChart2, FiTarget, FiUser, FiBell, FiArrowUp, FiArrowDown } from 'react-icons/fi'
import { entryService } from '@/lib/services/entryService'
import { auth } from '@/lib/config/firebase'

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

  // Recent transactions from backend
  type RecentEntry = {
    id: string
    title: string
    type: string
    amount: number
    categoryId: string
    date: string
  }
  const [recentTransactions, setRecentTransactions] = useState<RecentEntry[]>([])
  const [loadingRecent, setLoadingRecent] = useState(false)

  const waitForAuthUid = (): Promise<string> => new Promise((resolve, reject) => {
    const unsub = auth.onAuthStateChanged((user) => {
      unsub()
      if (user?.uid) resolve(user.uid)
      else reject(new Error('not authenticated'))
    })
  })

  useEffect(() => {
    let mounted = true
    ;(async () => {
      setLoadingRecent(true)
      try {
        let uid = auth.currentUser?.uid
        if (!uid) {
          try { uid = await waitForAuthUid() } catch { return }
        }
        const res = await entryService.getEntries({
          userId: uid,
          page: 1,
          pageSize: 10,
          sortBy: 'date',
          sortOrder: 'desc'
        } as any)
        const payload: any = res.data || {}
        const items: RecentEntry[] = Array.isArray(payload.entries) ? payload.entries : []
        if (mounted) setRecentTransactions(items)
      } finally {
        setLoadingRecent(false)
      }
    })()
    return () => { mounted = false }
  }, [])

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
            {loadingRecent && (
              <div className="text-white/70 text-sm">Loading...</div>
            )}
            {!loadingRecent && recentTransactions.length === 0 && (
              <div className="text-white/60 text-sm">No recent transactions</div>
            )}
            {!loadingRecent && recentTransactions.map((t) => (
              <Link href={`/transactions/${t.id}`} key={t.id}>
                <div className="flex items-center justify-between py-3 border-b border-white/10 hover:bg-white/5 rounded-lg px-2 transition-all cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-xs text-white">
                      {t.type === 'INCOME' ? 'IN' : 'OUT'}
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">{t.title}</p>
                      <p className="text-white/50 text-xs">{new Date(t.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-base ${t.type === 'INCOME' ? 'text-green-300' : 'text-white'}`}>
                      {t.type === 'INCOME' ? '+' : '-'}${Math.abs(t.amount).toFixed(2)}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
