import type { Metadata } from 'next'
import { Geist, Geist_Mono, Space_Mono, Syne } from 'next/font/google'

import './globals.css'

const _geist = Geist({ subsets: ['latin'] })
const _geistMono = Geist_Mono({ subsets: ['latin'] })
const _spaceMono = Space_Mono({ subsets: ['latin'], weight: ['400', '700'] })
const _syne = Syne({ subsets: ['latin'], weight: ['400', '500', '600', '700'] })

export const metadata: Metadata = {
  title: 'PlasticConnect - Turn Plastic Waste Into Value',
  description: 'Collectors: Sell plastic waste and earn money. Buyers: Source quality plastic at competitive prices. A sustainable marketplace for plastic waste.',
  generator: 'v0.app',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    themeColor: '#0A0E14',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
