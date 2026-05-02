import './globals.css'
import { Syne } from 'next/font/google'
import Navbar from '@/components/Navbar'
import SessionProvider from '@/components/SessionProvider'
import { auth } from '@/lib/auth'

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
      <body className="h-dvh w-full flex flex-col overflow-hidden">
        <SessionProvider session={session}>
          <div className="flex-none">
            <Navbar />
          </div>
          {/* flex-1 + overflow-y-auto = scrollable content region */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden">
            {children}
          </main>
        </SessionProvider>
      </body>
    </html>
  )
}