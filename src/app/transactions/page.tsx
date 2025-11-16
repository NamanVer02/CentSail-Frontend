'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FiArrowLeft, FiSearch, FiChevronDown } from 'react-icons/fi'
import { entryService } from '@/lib/services/entryService'
import { categoryService, Category } from '@/lib/services/categoryService'
import { auth } from '@/lib/config/firebase'
import TransactionListItem from '@/app/components/TransactionListItem'
import { useScrollActivation } from '@/lib/hooks/useScrollActivation'
import Silk from '@/components/Silk'
import { useSilkSettings } from '@/lib/hooks/useSilkSettings'

type EntryItem = {
  id: string
  title: string
  type: string
  amount: number
  categoryId: string
  date: string
}

export default function TransactionsPage() {
  const silkSettings = useSilkSettings()
  const router = useRouter()
  const scrollProgress = useScrollActivation(50)
  const [entries, setEntries] = useState<EntryItem[]>([])
  const [page, setPage] = useState(1)
  const pageSize = 20
  const [hasNext, setHasNext] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [isInitial, setIsInitial] = useState(true)

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

  // filters
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [type, setType] = useState<string>('') // EXPENSE | INCOME | ''
  const [categoryId, setCategoryId] = useState<string>('')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')

  // categories for filters
  const [categories, setCategories] = useState<Category[]>([])

  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const fetchingRef = useRef(false)

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 400)
    return () => clearTimeout(t)
  }, [searchTerm])

  // load categories for filter dropdown
  useEffect(() => {
    let mounted = true
    ;(async () => {
      const [exp, inc] = await Promise.all([
        categoryService.fetchCategories('EXPENSE'),
        categoryService.fetchCategories('INCOME'),
      ])
      if (!mounted) return
      const arr: Category[] = []
      if (exp.success && exp.data) arr.push(...(Array.isArray(exp.data) ? exp.data : []))
      if (inc.success && inc.data) arr.push(...(Array.isArray(inc.data) ? inc.data : []))
      setCategories(arr)
    })()
    return () => {
      mounted = false
    }
  }, [])

  const categoryIdToName = useMemo(() => {
    const m = new Map<string, string>()
    categories.forEach(c => m.set(c.id, c.name))
    return m
  }, [categories])

  const categoryIdToCategory = useMemo(() => {
    const m = new Map<string, Category>()
    categories.forEach(c => m.set(c.id, c))
    return m
  }, [categories])

  // Filter categories based on selected type for the dropdown
  const filteredCategories = useMemo(() => {
    if (!type) return categories
    return categories.filter(c => c.type === type)
  }, [categories, type])

  // If current selected category does not match the selected type, clear it
  useEffect(() => {
    if (!categoryId) return
    const selected = categories.find(c => c.id === categoryId)
    if (!selected) return
    if (type && selected.type !== type) {
      setCategoryId('')
    }
  }, [type, categoryId, categories])

  // Wait for Firebase auth to initialize and return a UID
  const waitForAuthUid = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        unsubscribe()
        if (user?.uid) resolve(user.uid)
        else reject(new Error('User not authenticated'))
      })
    })
  }

  // Deduplicate entries by id
  const dedupeEntries = (items: EntryItem[]): EntryItem[] => {
    const seen = new Map<string, EntryItem>()
    items.forEach(item => {
      if (item && item.id && !seen.has(item.id)) {
        seen.set(item.id, item)
      }
    })
    return Array.from(seen.values())
  }

  // fetch entries
  const fetchPage = async (reset = false) => {
    if (isLoading || fetchingRef.current) return
    fetchingRef.current = true
    setIsLoading(true)
    try {
      // Ensure we have a UID (auth.currentUser is null on first load after refresh)
      let uid = auth.currentUser?.uid
      if (!uid) {
        try {
          uid = await waitForAuthUid()
        } catch {
          setIsLoading(false)
          fetchingRef.current = false
          return
        }
      }

      const req: any = {
        userId: uid,
        page: reset ? 1 : page,
        pageSize,
        sortBy: 'date',
        sortOrder: 'desc',
      }
      if (debouncedSearch) req.searchTerm = debouncedSearch
      if (type) req.type = type
      if (categoryId) req.categoryId = categoryId
      if (startDate) req.startDate = new Date(startDate + 'T00:00:00.000Z').toISOString()
      if (endDate) req.endDate = new Date(endDate + 'T23:59:59.999Z').toISOString()

      const res = await entryService.getEntries(req)
      // backend returns { success, data: { entries, pagination } }
      const payload: any = res.data || {}
      const newItems: EntryItem[] = Array.isArray(payload.entries) ? payload.entries : []
      const pagination: any = payload.pagination || {}
      setHasNext(!!pagination.hasNext)

      // Deduplicate before setting state
      if (reset) {
        setEntries(dedupeEntries(newItems))
      } else {
        setEntries(prev => dedupeEntries([...prev, ...newItems]))
      }
      setPage(prev => (reset ? 2 : prev + 1))
      setIsInitial(false)
    } catch (e) {
      // swallow; optionally add toast
    } finally {
      setIsLoading(false)
      fetchingRef.current = false
    }
  }

  // reset and refetch when filters change
  useEffect(() => {
    setEntries([])
    setPage(1)
    setHasNext(true)
    fetchPage(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, type, categoryId, startDate, endDate])

  // infinite scroll observer
  useEffect(() => {
    if (!sentinelRef.current) return
    const el = sentinelRef.current
    const io = new IntersectionObserver((entriesObs) => {
      const first = entriesObs[0]
      if (first.isIntersecting && hasNext && !isLoading && !fetchingRef.current) {
        fetchPage()
      }
    }, { rootMargin: '200px' })
    io.observe(el)
    return () => io.unobserve(el)
  }, [hasNext, isLoading, page])

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
      <div className="max-w-6xl mx-auto px-6 py-6 pb-24 relative z-10">
        {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-20 flex justify-center pointer-events-none">
        <div
          className="pointer-events-auto w-full max-w-6xl mx-4 mt-3 px-6 py-4 flex items-center rounded-full border border-white/10 backdrop-blur-lg transition-all duration-200"
          style={{
            backgroundColor: `rgba(0, 0, 0, ${0.2 + scrollProgress * 0.3})`,
            boxShadow: scrollProgress > 0 ? '0 10px 30px rgba(0,0,0,0.25)' : 'none',
            borderColor: `rgba(255, 255, 255, ${0.1 * scrollProgress})`
          }}
        >
          <button onClick={() => router.back()} className="text-2xl mr-4"><FiArrowLeft /></button>
          <h1 className="text-2xl font-bold">All Transactions</h1>
        </div>
      </div>

      <div className="pt-24">
        {/* Search and Filters */}
        <div className="mb-6">
          <div className="relative mb-4">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/10 rounded-full py-3 pl-12 pr-4 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              <option value="">All Types</option>
              <option value="EXPENSE">Expense</option>
              <option value="INCOME">Income</option>
            </select>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              <option value="">All Categories</option>
              {filteredCategories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
            />
          </div>
        </div>
      </div>

        {/* Transaction List */}
        <div className="space-y-3">
          {useMemo(() => dedupeEntries(entries), [entries]).map((entry) => (
            <TransactionListItem
              key={entry.id}
              id={entry.id}
              title={entry.title}
              type={entry.type}
              amount={entry.amount}
              categoryId={entry.categoryId}
              date={entry.date}
              categoryIdToCategory={categoryIdToCategory}
              categoryIdToName={categoryIdToName}
              parseDate={parseDate}
            />
          ))}
          {/* Loading / Sentinel */}
          <div ref={sentinelRef} className="h-8" />
          {isLoading && (
            <div className="flex justify-center py-4 text-white/70 text-sm">Loading...</div>
          )}
          {!isLoading && !hasNext && entries.length === 0 && !isInitial && (
            <div className="flex justify-center py-4 text-white/60 text-sm">No transactions found</div>
          )}
        </div>
      </div>
    </div>
  )
}
