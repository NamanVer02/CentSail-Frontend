'use client'

import { useRouter } from 'next/navigation'
import { FiUser, FiEye, FiShield, FiHelpCircle, FiChevronRight, FiTag } from 'react-icons/fi'
import Silk from '@/components/Silk'
import { useSilkSettings } from '@/lib/hooks/useSilkSettings'
import Header from '@/app/components/Header'
import LiquidGlass from '@/components/LiquidGlass'

export default function SettingsPage() {
  const router = useRouter()
  const silkSettings = useSilkSettings()

  const settingsOptions = [
    {
      title: 'Account',
      icon: <FiUser className="text-xl text-white" />,
      description: 'Manage your account details',
      href: '/account'
    },
    {
      title: 'Category Management',
      icon: <FiTag className="text-xl text-white" />,
      description: 'Add, edit, and delete categories',
      href: '/settings/categories'
    },
    {
      title: 'Appearance',
      icon: <FiEye className="text-xl text-white" />,
      description: 'Change the look and feel of the app',
      href: '/settings/appearance'
    },
    {
      title: 'Privacy & Security',
      icon: <FiShield className="text-xl text-white" />,
      description: 'Control your data and security settings',
      href: '#'
    },
    {
      title: 'Help & Support',
      icon: <FiHelpCircle className="text-xl text-white" />,
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
      <Header title="Settings" />

      <div className="max-w-md mx-auto px-4 pt-28 pb-10 relative z-10">
        <div className="space-y-3">
          {settingsOptions.map((option, index) => (
            <div
              key={index}
              onClick={() => option.href !== '#' && router.push(option.href)}
              className="bg-white/5 rounded-lg border border-white/10 shadow-xl p-4 flex items-center justify-between hover:bg-white/10 transition-all cursor-pointer"
            >
              <div className="flex items-center">
                <LiquidGlass
                  displacementScale={15}
                  blurAmount={3}
                  brightness={1}
                  borderRadius={9999}
                  style={{
                    backgroundColor: 'rgba(0, 0, 0, 0)',
                    width: '3rem',
                    height: '3rem',
                    marginRight: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {option.icon}
                </LiquidGlass>
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
