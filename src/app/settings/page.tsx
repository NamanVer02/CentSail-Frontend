'use client'

import { useRouter } from 'next/navigation'
import { FiArrowLeft, FiUser, FiBell, FiEye, FiShield, FiHelpCircle, FiChevronRight, FiTag } from 'react-icons/fi'

export default function SettingsPage() {
  const router = useRouter()

  const settingsOptions = [
    {
      title: 'Account',
      icon: <FiUser className="text-xl text-white/60" />,
      description: 'Manage your account details',
      href: '#'
    },
    {
      title: 'Category Management',
      icon: <FiTag className="text-xl text-white/60" />,
      description: 'Add, edit, and delete categories',
      href: '/settings/categories'
    },
    {
      title: 'Notifications',
      icon: <FiBell className="text-xl text-white/60" />,
      description: 'Customize your notification preferences',
      href: '#'
    },
    {
      title: 'Appearance',
      icon: <FiEye className="text-xl text-white/60" />,
      description: 'Change the look and feel of the app',
      href: '#'
    },
    {
      title: 'Privacy & Security',
      icon: <FiShield className="text-xl text-white/60" />,
      description: 'Control your data and security settings',
      href: '#'
    },
    {
      title: 'Help & Support',
      icon: <FiHelpCircle className="text-xl text-white/60" />,
      description: 'Get help and find answers',
      href: '#'
    },
  ]

  return (
    <div className="min-h-screen w-full bg-[radial-gradient(ellipse_at_center,_#1a7370_0%,_#0c504a_100%)] text-white">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 bg-transparent z-10">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center">
          <button onClick={() => router.back()} className="text-2xl p-2 rounded-full hover:bg-white/10 transition-colors mr-2"><FiArrowLeft /></button>
          <h1 className="text-lg font-semibold">Settings</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 pt-20 pb-10">
        <div className="space-y-3">
          {settingsOptions.map((option, index) => (
            <div
              key={index}
              onClick={() => option.href !== '#' && router.push(option.href)}
              className="bg-white/5 rounded-lg border border-white/10 shadow-xl p-4 flex items-center justify-between hover:bg-white/10 transition-all cursor-pointer"
            >
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-white/10 mr-4">
                  {option.icon}
                </div>
                <div>
                  <p className="font-semibold">{option.title}</p>
                  <p className="text-xs text-white/60">{option.description}</p>
                </div>
              </div>
              <FiChevronRight className="text-xl text-white/60" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
