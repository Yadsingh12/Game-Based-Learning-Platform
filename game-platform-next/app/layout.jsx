import './globals.css'
import { Syne } from 'next/font/google'
import Navbar from '@/components/Navbar'
import SessionProvider from '@/components/SessionProvider'
import PWAInstallPrompt from '@/components/PWAInstallPrompt'  // ← add this
import { auth } from '@/lib/auth'
import NextTopLoader from 'nextjs-toploader'

const syne = Syne({
  subsets: ['latin'],
  weight:  ['700', '800'],
  variable: '--font-syne',
})

export const metadata = {
  title:       'SignLearn - Indian Sign Language',
  description: 'Learn Indian Sign Language through interactive games',
  manifest:    '/manifest.json',
  appleWebApp: {
    capable:        true,
    statusBarStyle: 'default',
    title:          'SignLearn',
  },
  icons: {
    icon:  [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/icon-152x152.png', sizes: '152x152', type: 'image/png' },
    ],
  },
}

// ← move themeColor here
export const viewport = {
  themeColor: '#7c3aed',
}

export default async function RootLayout({ children }) {
  const session = await auth()

  return (
    <html lang="en" className={syne.variable}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="SignLearn" />
        <link rel="apple-touch-icon" href="/icons/icon-152x152.png" />
        <script src="https://checkout.razorpay.com/v1/checkout.js" />
      </head>
      <body style={{
        height: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
        WebkitFontSmoothing: 'antialiased',
        margin: 0,
        padding: 0,
      }}>
        <NextTopLoader color="#7c3aed" showSpinner={false} />
        <SessionProvider session={session}>
          <div style={{ flexShrink: 0 }}>
            <Navbar />
          </div>
          <main style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
            {children}
          </main>
          <PWAInstallPrompt />
        </SessionProvider>
      </body>
    </html>
  )
}