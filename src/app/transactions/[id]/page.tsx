'use client'

import { useRouter } from 'next/navigation'
import { FiArrowLeft, FiShoppingCart, FiSend, FiFilm, FiWatch, FiTrendingUp, FiEdit, FiMapPin, FiClock } from 'react-icons/fi'

// This is a dummy data source. In a real application, you would fetch this data based on the id.
const transactions = [
  { id: 1, name: 'Grocery Store', category: 'Grocery', amount: -45.20, date: '2025-10-17', time: '1:45 PM', location: 'SuperMart, Downtown', icon: <FiShoppingCart />, description: 'Weekly grocery shopping at the local supermarket.' },
  { id: 2, name: 'Uber Ride', category: 'Taxi', amount: -12.50, date: '2025-10-16', time: '8:30 AM', location: 'City Cabs', icon: <FiSend />, description: 'Ride to the office for a meeting.' },
  { id: 3, name: 'Netflix Subscription', category: 'Entertainment', amount: -15.99, date: '2025-10-16', time: '10:00 AM', location: 'Online', icon: <FiFilm />, description: 'Monthly subscription fee for Netflix.' },
  { id: 4, name: 'Restaurant', category: 'Food', amount: -32.80, date: '2025-10-15', time: '7:00 PM', location: 'The Grand Bistro', icon: <FiWatch />, description: 'Dinner with friends at a local restaurant.' },
  { id: 5, name: 'Salary', category: 'Income', amount: 3500.00, date: '2025-10-15', time: '9:00 AM', location: 'ABC Corp', icon: <FiTrendingUp />, description: 'Monthly salary deposit.' },
  { id: 6, name: 'Coffee Shop', category: 'Food', amount: -4.50, date: '2025-10-14', time: '9:15 AM', location: 'Brew & Bean', icon: <FiWatch />, description: 'Morning coffee and a pastry.' },
  { id: 7, name: 'Book Store', category: 'Shopping', amount: -25.00, date: '2025-10-14', time: '3:20 PM', location: 'Readers Nook', icon: <FiShoppingCart />, description: 'Bought a new novel.' },
  { id: 8, name: 'Gas Station', category: 'Transport', amount: -40.00, date: '2025-10-13', time: '5:50 PM', location: 'Fuel Up', icon: <FiSend />, description: 'Filled up the car with gas.' },
  { id: 9, name: 'Movie Theater', category: 'Entertainment', amount: -28.00, date: '2025-10-12', time: '8:00 PM', location: 'Cineplex', icon: <FiFilm />, description: 'Watched the new superhero movie.' },
  { id: 10, name: 'Client Payment', category: 'Income', amount: 1200.00, date: '2025-10-12', time: '11:00 AM', location: 'Freelance Client', icon: <FiTrendingUp />, description: 'Payment for a freelance project.' },
];

export default function TransactionDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const transaction = transactions.find(t => t.id === parseInt(params.id));

  if (!transaction) {
    return (
      <div className="min-h-screen w-full bg-[radial-gradient(ellipse_at_center,_#1a7370_0%,_#0c504a_100%)] text-white flex items-center justify-center">
        <p>Transaction not found.</p>
      </div>
    )
  }

  const isIncome = transaction.amount > 0;

  return (
    <div className="min-h-screen w-full bg-[radial-gradient(ellipse_at_center,_#1a7370_0%,_#0c504a_100%)] text-white">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 bg-transparent z-10">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => router.back()} className="text-2xl p-2 rounded-full hover:bg-white/10 transition-colors"><FiArrowLeft /></button>
          <h1 className="text-lg font-semibold truncate">{transaction.name}</h1>
          <button className="text-2xl p-2 rounded-full hover:bg-white/10 transition-colors"><FiEdit /></button>
        </div>
      </div>

      <div className="max-w-md mx-auto pt-20 px-4">
        {/* Amount and Icon */}
        <div className="flex flex-col items-center justify-center py-8">
            <div className={`text-6xl p-5 rounded-full mb-4 bg-gradient-to-tr ${isIncome ? 'from-green-400/20 to-green-500/10' : 'from-white/20 to-white/10'}`}>
                {transaction.icon}
            </div>
            <p className={`text-5xl font-bold ${isIncome ? 'text-green-300' : 'text-white'}`}>{isIncome ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}</p>
            <p className="text-white/60 text-sm mt-1">{transaction.category}</p>
        </div>
        
        {/* Details in a card */}
        <div className="bg-white/5 rounded-2xl p-6 space-y-4 border border-white/10 shadow-xl">
          <p className="text-xs text-white/50 uppercase tracking-wider">Transaction Details</p>
          <div className="flex justify-between items-center">
            <p className="text-white/70">Date</p>
            <p className="font-medium">{transaction.date}</p>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-white/70">Time</p>
            <p className="font-medium">{transaction.time}</p>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-white/70">Location</p>
            <p className="font-medium flex items-center gap-1.5"><FiMapPin/>{transaction.location}</p>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-white/70">Category</p>
            <p className="font-medium">{transaction.category}</p>
          </div>
           <div className="flex justify-between items-center">
            <p className="text-white/70">Type</p>
            <p className={`font-semibold py-1 px-3 rounded-full text-xs ${isIncome ? 'bg-green-500/20 text-green-200' : 'bg-red-500/20 text-red-200'}`}>{isIncome ? 'Income' : 'Expense'}</p>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white/5 rounded-2xl p-6 my-4 border border-white/10 shadow-xl">
            <p className="text-xs text-white/50 uppercase tracking-wider">Note</p>
            <p className="text-white/80 mt-2 leading-relaxed">{transaction.description}</p>
        </div>
      </div>
    </div>
  )
}
