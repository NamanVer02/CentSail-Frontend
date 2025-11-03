'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { FiHome, FiBarChart2, FiPlus, FiMessageSquare, FiSettings } from 'react-icons/fi'

export default function BottomNav() {
  const pathname = usePathname()
  
  // Hide bottom nav on login, signup, chat, and add pages
  if (pathname === '/login' || pathname === '/signup' || pathname === '/chat' || pathname === '/add') {
    return null
  }

  const navItems = [
    { href: '/dashboard', icon: <FiHome />, label: 'Home' },
    { href: '/analytics', icon: <FiBarChart2 />, label: 'Analytics' },
    { href: '/add', icon: <FiPlus />, label: 'Add', isHighlighted: true },
    { href: '/chat', icon: <FiMessageSquare />, label: 'Chat' },
    { href: '/settings', icon: <FiSettings />, label: 'Settings' },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#0c504a]/95 backdrop-blur-xl border-t border-white/10 z-50">
      <div className="max-w-6xl mx-auto px-6 py-3">
        <div className="flex justify-around items-center relative">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            
            if (item.isHighlighted) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="absolute left-1/2 -translate-x-1/2 -top-8"
                >
                  <div className="w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center hover:scale-110 transition-all">
                    <span className="text-3xl text-[#0c504a]">{item.icon}</span>
                  </div>
                </Link>
              )
            }
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 transition-colors ${
                  isActive ? 'text-white' : 'text-white/60 hover:text-white'
                }`}
              >
                <span className="text-2xl">{item.icon}</span>
                <span className="text-xs">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
