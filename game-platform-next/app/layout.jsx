import './globals.css'
import { Syne } from 'next/font/google'
import Navbar from '@/components/Navbar'
import SessionProvider from '@/components/SessionProvider'
import { auth } from '@/lib/auth'
import NextTopLoader from 'nextjs-toploader'

const syne = Syne({
  subsets: ['latin'],
  weight: ['700', '800'],
  variable: '--font-syne',
})

export const metadata = {
  title: 'Sign Language Learning',
  description: 'Learn Indian Sign Language through interactive games',
}

export default async function RootLayout({ children }) {
  const session = await auth()

  return (
    <html lang="en" className={syne.variable}>
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

          {/* Navbar — fixed height */}
          <div style={{ flexShrink: 0 }}>
            <Navbar />
          </div>

          {/* Content — scrollable, full remaining height */}
          <main style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
            {children}
          </main>

        </SessionProvider>
      </body>
    </html>
  )
}