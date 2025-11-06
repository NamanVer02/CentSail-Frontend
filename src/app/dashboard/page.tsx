'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import RadarChart from '@/app/components/ui/RadarChart'
import { FiGlobe, FiShoppingCart, FiSend, FiWatch, FiAward, FiAlertTriangle, FiFilm, FiShoppingBag, FiTrendingUp, FiPlus, FiRepeat, FiBarChart2, FiTarget, FiUser, FiBell, FiArrowUp, FiArrowDown } from 'react-icons/fi'
import { entryService } from '@/lib/services/entryService'
import { categoryService, Category } from '@/lib/services/categoryService'
import { analyticsService, CategoryExpenseData } from '@/lib/services/analyticsService'
import { auth } from '@/lib/config/firebase'
import TransactionListItem from '@/app/components/TransactionListItem'

export default function DashboardPage() {
  const [greeting] = useState(() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 18) return 'Good Afternoon'
    return 'Good Evening'
  })

  // Helper function to convert Firestore Timestamp or ISO string to Date
  const parseDate = (dateValue: any): Date | null => {
    if (!dateValue) return null
    
    try {
      // If it's a Firestore Timestamp object (has seconds and nanos)
      if (typeof dateValue === 'object' && dateValue.seconds !== undefined) {
        // Convert seconds to milliseconds and add nanos converted to milliseconds
        // nanos are in nanoseconds (1e9), so divide by 1e6 to get milliseconds
        const milliseconds = dateValue.seconds * 1000 + Math.floor((dateValue.nanos || 0) / 1000000)
        return new Date(milliseconds)
      }
      
      // If it's already a string (ISO format)
      if (typeof dateValue === 'string') {
        const date = new Date(dateValue)
        if (!isNaN(date.getTime())) {
          return date
        }
      }
    } catch (error) {
      console.error('Error parsing date:', error)
    }
    
    return null
  }

  // Analytics data for radar chart
  const [analyticsData, setAnalyticsData] = useState<CategoryExpenseData[]>([])
  const [totalExpenses, setTotalExpenses] = useState<number>(0)
  const [totalIncome, setTotalIncome] = useState<number>(0)
  const [totalBalance, setTotalBalance] = useState<number>(0)
  const [loadingAnalytics, setLoadingAnalytics] = useState(false)

  // Icon mapping for categories
  const getCategoryIcon = (categoryName: string) => {
    const name = categoryName.toLowerCase()
    if (name.includes('food') || name.includes('grocery') || name.includes('restaurant')) return <FiShoppingCart />
    if (name.includes('transport') || name.includes('taxi') || name.includes('uber')) return <FiSend />
    if (name.includes('entertainment') || name.includes('movie') || name.includes('game')) return <FiFilm />
    if (name.includes('shopping') || name.includes('clothes') || name.includes('fashion')) return <FiShoppingBag />
    if (name.includes('internet') || name.includes('wifi') || name.includes('network')) return <FiGlobe />
    if (name.includes('sport') || name.includes('fitness') || name.includes('gym')) return <FiAward />
    if (name.includes('alcohol') || name.includes('drink') || name.includes('bar')) return <FiAlertTriangle />
    if (name.includes('watch') || name.includes('time')) return <FiWatch />
    return <FiShoppingCart /> // default icon
  }

  // Transform analytics data for radar chart
  const expenseData = useMemo(() => {
    if (analyticsData.length === 0 || totalExpenses === 0) {
      return []
    }
    
    // Calculate percentage for each category
    return analyticsData.map(item => ({
      label: item.categoryName,
      value: totalExpenses > 0 ? Math.round((item.amount / totalExpenses) * 100) : 0,
      icon: getCategoryIcon(item.categoryName),
      amount: item.amount
    }))
  }, [analyticsData, totalExpenses])

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
  const [categories, setCategories] = useState<Category[]>([])

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

  // Load categories for transaction list items
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

  // Fetch analytics data for radar chart
  useEffect(() => {
    let mounted = true
    ;(async () => {
      setLoadingAnalytics(true)
      try {
        const response = await analyticsService.getDashboardAnalytics()
        if (mounted && response.success && response.data) {
          setAnalyticsData(response.data.categories || [])
          setTotalExpenses(response.data.totalExpenses || 0)
          setTotalIncome(response.data.totalIncome || 0)
          setTotalBalance(response.data.totalBalance || 0)
        }
      } catch (error) {
        console.error('Error fetching analytics:', error)
      } finally {
        if (mounted) setLoadingAnalytics(false)
      }
    })()
    return () => { mounted = false }
  }, [])

  const categoryIdToCategory = useMemo(() => {
    const m = new Map<string, Category>()
    categories.forEach(c => m.set(c.id, c))
    return m
  }, [categories])

  const categoryIdToName = useMemo(() => {
    const m = new Map<string, string>()
    categories.forEach(c => m.set(c.id, c.name))
    return m
  }, [categories])

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
              <h2 className={`text-4xl font-bold ${totalBalance >= 0 ? 'text-white' : 'text-red-300'}`}>
                ${totalBalance.toFixed(2)}
              </h2>
            </div>
            {totalIncome > 0 && (
              <div className="text-right mb-1">
                <p className={`text-sm font-semibold ${totalBalance >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                  {((totalBalance / totalIncome) * 100).toFixed(0)}%
                </p>
                <p className="text-white/50 text-xs">savings rate</p>
              </div>
            )}
          </div>
          
          <div className="flex gap-6 mt-3">
            <div className="flex items-center gap-2">
              <span className="text-green-300 text-xl"><FiArrowUp /></span>
              <div>
                <p className="text-white/50 text-[10px] uppercase tracking-wide">Income</p>
                <p className="text-white font-semibold text-lg">${totalIncome.toFixed(2)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-red-300 text-xl"><FiArrowDown /></span>
              <div>
                <p className="text-white/50 text-[10px] uppercase tracking-wide">Expenses</p>
                <p className="text-white font-semibold text-lg">${totalExpenses.toFixed(2)}</p>
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
            <Link href="/analytics" className="text-white/70 text-sm hover:text-white transition-colors">
              Details →
            </Link>
          </div>
          
          {loadingAnalytics ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-white/60 text-sm">Loading analytics...</div>
            </div>
          ) : expenseData.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-white/60 text-sm">No expense data available</div>
            </div>
          ) : (
            <RadarChart data={expenseData} />
          )}
          
          <div className="mt-4 text-center">
            <p className="text-white/60 text-xs mb-1">Total spent</p>
            <p className="text-white text-3xl font-bold">${totalExpenses.toFixed(2)}</p>
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
              <TransactionListItem
                key={t.id}
                id={t.id}
                title={t.title}
                type={t.type}
                amount={t.amount}
                categoryId={t.categoryId}
                date={t.date}
                categoryIdToCategory={categoryIdToCategory}
                categoryIdToName={categoryIdToName}
                parseDate={parseDate}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
