'use client'
import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'

const PRESET_AMOUNTS = [100, 250, 500, 1000, 2500]

function DonateContent() {
  const searchParams      = useSearchParams()
  const { data: session } = useSession()
  const [amount,   setAmount]  = useState(500)
  const [custom,   setCustom]  = useState('')
  const [loading,  setLoading] = useState(false)
  const [error,    setError]   = useState('')
  const [paid,     setPaid]    = useState(!!searchParams.get('success'))

  const finalAmount = custom ? parseInt(custom) : amount

  const handleDonate = async () => {
    setError('')
    if (!finalAmount || finalAmount < 1) { setError('Please enter a valid amount'); return }
    setLoading(true)
    try {
      const res  = await fetch('/api/donate', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ amount: finalAmount }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); setLoading(false); return }
      const options = {
        key:         data.keyId,
        amount:      data.amount,
        currency:    data.currency,
        name:        'SignLearn',
        description: 'Donation to support free ISL education',
        order_id:    data.orderId,
        prefill:     { name: session?.user?.name ?? '', email: session?.user?.email ?? '' },
        theme:       { color: '#7c3aed' },
        handler:     () => { setPaid(true); setLoading(false) },
        modal:       { ondismiss: () => setLoading(false) },
      }
      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', r => { setError(`Payment failed: ${r.error.description}`); setLoading(false) })
      rzp.open()
    } catch {
      setError('Failed to connect to payment service')
      setLoading(false)
    }
  }

  if (paid) return (
    <div className="min-h-screen bg-[#0f0a1e] flex items-center justify-center p-6">
      <div className="bg-white/5 border border-white/10 rounded-3xl p-12 max-w-md
                      w-full text-center backdrop-blur-xl">
        <div className="text-7xl mb-6 animate-float inline-block">🎉</div>
        <h1 className="text-3xl font-black text-white mb-3">Thank you!</h1>
        <p className="text-white/50 mb-8">
          Your donation helps keep SignLearn free and accessible for everyone.
        </p>
        <a href="/"
          className="inline-block px-8 py-3 bg-gradient-to-r from-violet-600 to-blue-600
                     text-white font-bold rounded-2xl hover:opacity-90 transition-all
                     shadow-lg shadow-violet-500/25">
          Back to Learning
        </a>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0f0a1e] relative overflow-hidden">

      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px]
                      bg-violet-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-[-10%] w-[400px] h-[400px]
                      bg-blue-600/15 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-2xl mx-auto px-6 py-12">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="text-6xl mb-4 inline-block animate-float">🤟</div>
          <h1 className="text-4xl font-black text-white mb-3">Support SignLearn</h1>
          <p className="text-white/40 max-w-lg mx-auto">
            Help keep Indian Sign Language education free and accessible for everyone.
          </p>
        </div>

        {/* Impact cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { amount: '₹100', label: 'Server costs for a day' },
            { amount: '₹500', label: 'New sign video content' },
            { amount: '₹1000', label: 'A month of development' },
          ].map(item => (
            <div key={item.amount}
              className="bg-violet-500/10 border border-violet-500/20 rounded-2xl
                         p-4 text-center">
              <div className="text-lg font-black text-violet-400 mb-1">{item.amount}</div>
              <div className="text-white/30 text-xs leading-tight">{item.label}</div>
            </div>
          ))}
        </div>

        {/* Amount selector */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 mb-4">
          <p className="text-white/50 text-sm font-bold uppercase tracking-wider mb-4">
            Select Amount
          </p>
          <div className="grid grid-cols-5 gap-2 mb-4">
            {PRESET_AMOUNTS.map(a => (
              <button key={a}
                onClick={() => { setAmount(a); setCustom('') }}
                className={`py-2.5 rounded-xl text-sm font-bold transition-all
                  ${!custom && amount === a
                    ? 'bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-lg shadow-violet-500/25'
                    : 'bg-white/5 text-white/50 border border-white/10 hover:bg-white/10 hover:text-white'}`}>
                ₹{a}
              </button>
            ))}
          </div>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2
                             font-bold text-white/30 text-lg">₹</span>
            <input
              type="number"
              placeholder="Custom amount"
              value={custom}
              onChange={e => setCustom(e.target.value)}
              min="1"
              className="w-full pl-9 pr-4 py-3 bg-white/5 border-2 border-white/10 rounded-xl
                         text-white placeholder-white/20 font-semibold
                         focus:outline-none focus:border-violet-500/50 transition-all"
            />
          </div>

          {/* Summary */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
            <span className="text-white/40 font-medium">Total</span>
            <span className="text-3xl font-black text-white">₹{finalAmount || 0}</span>
          </div>
        </div>

        {error && (
          <p className="text-red-400 text-sm font-medium mb-4 text-center">{error}</p>
        )}

        <button
          onClick={handleDonate}
          disabled={loading || !finalAmount}
          className="w-full py-4 rounded-2xl font-black text-lg text-white
                     bg-gradient-to-r from-violet-600 to-blue-600
                     hover:opacity-90 active:scale-95 transition-all
                     shadow-xl shadow-violet-500/25
                     disabled:opacity-50 disabled:cursor-not-allowed mb-4">
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-5 h-5 border-2 border-white border-t-transparent
                               rounded-full animate-spin" />
              Opening payment...
            </span>
          ) : `Donate ₹${finalAmount || 0}`}
        </button>

        <p className="text-center text-white/20 text-xs mb-10">
          🔒 Secure via Razorpay · UPI, Cards, Netbanking & Wallets
        </p>

        {/* Where it goes */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="text-white font-black mb-4">Where your money goes</h3>
          <div className="space-y-3">
            {[
              ['🎥', 'Recording new sign language videos'],
              ['🖥️', 'Server and infrastructure costs'],
              ['🎮', 'Building new interactive games'],
              ['♿', 'Improving platform accessibility'],
            ].map(([icon, text]) => (
              <div key={text} className="flex items-center gap-3">
                <span className="text-xl">{icon}</span>
                <span className="text-white/40 text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}

export default function DonatePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0f0a1e] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent
                        rounded-full animate-spin" />
      </div>
    }>
      <DonateContent />
    </Suspense>
  )
}