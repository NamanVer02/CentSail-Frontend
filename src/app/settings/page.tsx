'use client'

import { useRouter } from 'next/navigation'
import { FiArrowLeft, FiUser, FiEye, FiShield, FiHelpCircle, FiChevronRight, FiTag } from 'react-icons/fi'
import { useScrollActivation } from '@/lib/hooks/useScrollActivation'
import Silk from '@/components/Silk'
import { useSilkSettings } from '@/lib/hooks/useSilkSettings'

export default function SettingsPage() {
  const router = useRouter()
  const scrollProgress = useScrollActivation(50)
  const silkSettings = useSilkSettings()

  const settingsOptions = [
    {
      title: 'Account',
      icon: <FiUser className="text-xl text-white/60" />,
      description: 'Manage your account details',
      href: '/account'
    },
    {
      title: 'Category Management',
      icon: <FiTag className="text-xl text-white/60" />,
      description: 'Add, edit, and delete categories',
      href: '/settings/categories'
    },
    {
      title: 'Appearance',
      icon: <FiEye className="text-xl text-white/60" />,
      description: 'Change the look and feel of the app',
      href: '/settings/appearance'
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
          <h1 className="text-lg font-semibold">Settings</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 pt-28 pb-10 relative z-10">
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
