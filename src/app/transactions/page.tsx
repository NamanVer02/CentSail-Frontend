'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FiArrowLeft, FiSearch, FiFilter, FiChevronDown, FiShoppingCart, FiSend, FiFilm, FiWatch, FiTrendingUp } from 'react-icons/fi'

const transactions = [
  { id: 1, name: 'Grocery Store', category: 'Grocery', amount: -45.20, date: '2025-10-17', icon: <FiShoppingCart /> },
  { id: 2, name: 'Uber Ride', category: 'Taxi', amount: -12.50, date: '2025-10-16', icon: <FiSend /> },
  { id: 3, name: 'Netflix Subscription', category: 'Entertainment', amount: -15.99, date: '2025-10-16', icon: <FiFilm /> },
  { id: 4, name: 'Restaurant', category: 'Food', amount: -32.80, date: '2025-10-15', icon: <FiWatch /> },
  { id: 5, name: 'Salary', category: 'Income', amount: 3500.00, date: '2025-10-15', icon: <FiTrendingUp /> },
  { id: 6, name: 'Coffee Shop', category: 'Food', amount: -4.50, date: '2025-10-14', icon: <FiWatch /> },
  { id: 7, name: 'Book Store', category: 'Shopping', amount: -25.00, date: '2025-10-14', icon: <FiShoppingCart /> },
  { id: 8, name: 'Gas Station', category: 'Transport', amount: -40.00, date: '2025-10-13', icon: <FiSend /> },
  { id: 9, name: 'Movie Theater', category: 'Entertainment', amount: -28.00, date: '2025-10-12', icon: <FiFilm /> },
  { id: 10, name: 'Client Payment', category: 'Income', amount: 1200.00, date: '2025-10-12', icon: <FiTrendingUp /> },
];

export default function TransactionsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen w-full bg-[radial-gradient(ellipse_at_center,_#1a7370_0%,_#0c504a_100%)] text-white">
      <div className="max-w-6xl mx-auto px-6 py-6 pb-24">
        {/* Header */}
        <div className="flex items-center mb-6">
          <button onClick={() => router.back()} className="text-2xl mr-4"><FiArrowLeft /></button>
          <h1 className="text-2xl font-bold">All Transactions</h1>
        </div>

        {/* Search and Filters */}
        <div className="mb-6">
          <div className="relative mb-4">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
            <input type="text" placeholder="Search transactions..." className="w-full bg-white/10 rounded-full py-3 pl-12 pr-4 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/50" />
          </div>
          <div className="flex gap-4">
            <button className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-sm hover:bg-white/20 transition-colors">
              <FiFilter />
              <span>Filter</span>
              <FiChevronDown />
            </button>
            <button className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-sm hover:bg-white/20 transition-colors">
              <span>Sort by: Date</span>
              <FiChevronDown />
            </button>
          </div>
        </div>

        {/* Transaction List */}
        <div className="space-y-3">
          {transactions.map((transaction) => (
            <Link href={`/transactions/${transaction.id}`} key={transaction.id}>
              <div className="flex items-center justify-between py-3 border-b border-white/10 hover:bg-white/5 rounded-lg px-2 transition-all cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-2xl">
                    {transaction.icon}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{transaction.name}</p>
                    <p className="text-white/50 text-xs">{transaction.category} • {transaction.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold text-base ${transaction.amount > 0 ? 'text-green-300' : 'text-white'}`}>
                    {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
