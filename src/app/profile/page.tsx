'use client'

import { useRouter } from 'next/navigation'
import { FiUser, FiMail, FiPhone, FiLogOut, FiArrowLeft, FiEdit, FiShield, FiBarChart2, FiBell, FiCreditCard } from 'react-icons/fi'

export default function ProfilePage() {
  const router = useRouter()

  return (
    <div className="min-h-screen w-full bg-[radial-gradient(ellipse_at_center,_#1a7370_0%,_#0c504a_100%)] text-white">
       {/* Header */}
      <div className="fixed top-0 left-0 right-0 bg-transparent z-10">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => router.back()} className="text-2xl p-2 rounded-full hover:bg-white/10 transition-colors"><FiArrowLeft /></button>
          <h1 className="text-lg font-semibold">Profile</h1>
          <button className="text-2xl p-2 rounded-full hover:bg-white/10 transition-colors"><FiEdit /></button>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 pt-20 pb-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center mb-4 border-2 border-white/30">
            <FiUser className="text-5xl text-white" />
          </div>
          <h2 className="text-2xl font-bold">John Doe</h2>
          <p className="text-white/60">john.doe@example.com</p>
        </div>

        {/* Personal Info */}
        <div className="bg-white/5 rounded-2xl p-6 space-y-4 border border-white/10 shadow-xl mb-6">
          <p className="text-xs text-white/50 uppercase tracking-wider">Personal Information</p>
          <div className="flex items-center">
            <FiMail className="text-xl text-white/60 mr-4" />
            <p>john.doe@example.com</p>
          </div>
          <div className="flex items-center">
            <FiPhone className="text-xl text-white/60 mr-4" />
            <p>+1 (555) 123-4567</p>
          </div>
        </div>

        {/* Membership Status */}
        <div className="bg-white/5 rounded-2xl p-6 space-y-4 border border-white/10 shadow-xl mb-6">
          <p className="text-xs text-white/50 uppercase tracking-wider">Membership</p>
          <div className="flex items-center justify-between">
             <div className="flex items-center">
                <FiShield className="text-xl text-green-300 mr-4" />
                <p className="font-semibold text-green-300">Premium</p>
            </div>
            <button className="text-xs bg-white/10 py-1 px-3 rounded-full hover:bg-white/20">Upgrade</button>
          </div>
        </div>

        {/* Account Limits */}
        <div className="bg-white/5 rounded-2xl p-6 space-y-4 border border-white/10 shadow-xl mb-6">
          <p className="text-xs text-white/50 uppercase tracking-wider">Account Limits</p>
          <div className="space-y-3">
            <div >
                <div className="flex justify-between items-center text-sm mb-1">
                    <p>Daily Transfer</p>
                    <p>$4,500 / $5,000</p>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                    <div className="bg-blue-400 h-2 rounded-full" style={{width: '90%'}}></div>
                </div>
            </div>
             <div >
                <div className="flex justify-between items-center text-sm mb-1">
                    <p>Monthly Spending</p>
                    <p>$1,867 / $10,000</p>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                    <div className="bg-purple-400 h-2 rounded-full" style={{width: '18.67%'}}></div>
                </div>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white/5 rounded-2xl p-6 space-y-4 border border-white/10 shadow-xl mb-8">
          <p className="text-xs text-white/50 uppercase tracking-wider">Notifications</p>
          <div className="flex items-center justify-between">
            <p>Push Notifications</p>
            <label className="switch"><input type="checkbox" defaultChecked /><span className="slider round"></span></label>
          </div>
           <div className="flex items-center justify-between">
            <p>Email Alerts</p>
            <label className="switch"><input type="checkbox" /><span className="slider round"></span></label>
          </div>
        </div>

        <button 
          onClick={() => {
            // Add logout functionality here
            console.log('Logout clicked')
          }}
          className="w-full bg-red-500/80 hover:bg-red-500 text-white font-semibold py-3 rounded-lg flex items-center justify-center transition-colors"
        >
          <FiLogOut className="mr-2" />
          Logout
        </button>
      </div>
    </div>
  )
}
