import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import './globals.css'
import BottomNav from './components/BottomNav'
import Toast from './components/ui/Toast'

const poppins = Poppins({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-poppins',
  weight: ['400', '500', '600', '700']
})

export const metadata: Metadata = {
  title: 'CentSail',
  description: 'Your Financial Voyage',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={poppins.variable}>
      <body>
        {children}
        <BottomNav />
        <Toast />
      </body>
    </html>
  )
}
