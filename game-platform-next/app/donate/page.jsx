'use client'
import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'

const PRESET_AMOUNTS = [100, 250, 500, 1000, 2500]

function DonateContent() {
  const searchParams   = useSearchParams()
  const success        = searchParams.get('success')
  const { data: session } = useSession()

  const [amount,    setAmount]    = useState(500)
  const [custom,    setCustom]    = useState('')
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState('')
  const [paid,      setPaid]      = useState(!!success)

  const finalAmount = custom ? parseInt(custom) : amount

  const handleDonate = async () => {
    setError('')
    if (!finalAmount || finalAmount < 1) {
      setError('Please enter a valid amount')
      return
    }

    setLoading(true)

    try {
      // 1. Create order on server
      const res  = await fetch('/api/donate', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ amount: finalAmount }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); setLoading(false); return }

      // 2. Open Razorpay checkout
      const options = {
        key:         data.keyId,
        amount:      data.amount,
        currency:    data.currency,
        name:        'SignLearn',
        description: 'Donation to support free ISL education',
        order_id:    data.orderId,
        prefill: {
          name:  session?.user?.name  ?? '',
          email: session?.user?.email ?? '',
        },
        theme: { color: '#7c3aed' },
        handler: (response) => {
          // Payment successful
          setPaid(true)
          setLoading(false)
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', (response) => {
        setError(`Payment failed: ${response.error.description}`)
        setLoading(false)
      })
      rzp.open()

    } catch (err) {
      setError('Failed to connect to payment service')
      setLoading(false)
    }
  }

  // Success state
  if (paid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600
                      flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center">
          <div className="text-7xl mb-4">🎉</div>
          <h1 className="text-2xl font-black text-gray-800 mb-3">
            Thank you so much!
          </h1>
          <p className="text-gray-500 mb-8">
            Your donation helps us keep SignLearn free and accessible for everyone
            learning Indian Sign Language.
          </p>
          <a href="/"
            className="inline-block px-8 py-3 bg-gradient-to-r from-violet-600 to-blue-600
                       text-white font-bold rounded-xl hover:opacity-90 transition-all">
            Back to Learning
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 p-6">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10 pt-6">
          <div className="text-6xl mb-4">🤟</div>
          <h1 className="text-4xl font-black text-white mb-3">Support SignLearn</h1>
          <p className="text-white/80 text-lg max-w-lg mx-auto">
            Help us keep Indian Sign Language education free and accessible for everyone.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8">

          {/* Impact cards */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { amount: '₹100', label: 'Covers server costs for a day' },
              { amount: '₹500', label: 'Funds new sign video content' },
              { amount: '₹1000', label: 'Supports a month of development' },
            ].map(item => (
              <div key={item.amount}
                className="bg-purple-50 rounded-2xl p-4 text-center border border-purple-100">
                <div className="text-xl font-black text-purple-600 mb-1">{item.amount}</div>
                <div className="text-xs text-gray-500 leading-tight">{item.label}</div>
              </div>
            ))}
          </div>

          {/* Amount selector */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-3">
              Select Amount (₹)
            </label>
            <div className="grid grid-cols-5 gap-2 mb-4">
              {PRESET_AMOUNTS.map(a => (
                <button key={a}
                  onClick={() => { setAmount(a); setCustom('') }}
                  className={`py-2.5 rounded-xl text-sm font-bold transition-all
                    ${!custom && amount === a
                      ? 'bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                  ₹{a}
                </button>
              ))}
            </div>

            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2
                               font-bold text-gray-400 text-lg">₹</span>
              <input
                type="number"
                placeholder="Custom amount"
                value={custom}
                onChange={e => setCustom(e.target.value)}
                min="1"
                className="w-full pl-9 pr-4 py-3 border-2 border-gray-200 rounded-xl
                           text-gray-800 font-semibold placeholder-gray-400
                           focus:outline-none focus:border-violet-400 transition-all"
              />
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gray-50 rounded-2xl p-4 mb-6
                          flex items-center justify-between">
            <span className="text-gray-600 font-medium">Donation amount</span>
            <span className="text-2xl font-black text-violet-600">
              ₹{finalAmount || 0}
            </span>
          </div>

          {error && (
            <p className="text-red-500 text-sm font-medium mb-4 text-center">{error}</p>
          )}

          <button
            onClick={handleDonate}
            disabled={loading || !finalAmount}
            className="w-full py-4 rounded-2xl font-black text-lg text-white
                       bg-gradient-to-r from-violet-600 to-blue-600
                       hover:opacity-90 active:scale-95 transition-all
                       shadow-lg shadow-violet-200
                       disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-5 h-5 border-2 border-white border-t-transparent
                                 rounded-full animate-spin" />
                Opening payment...
              </span>
            ) : (
              `Donate ₹${finalAmount || 0}`
            )}
          </button>

          <p className="text-center text-xs text-gray-400 mt-4">
            🔒 Secure payment via Razorpay · UPI, Cards, Netbanking & Wallets accepted
          </p>
        </div>

        {/* Where money goes */}
        <div className="mt-8 bg-white/10 rounded-2xl p-6 text-white">
          <h3 className="font-black text-lg mb-4">Where your money goes</h3>
          <div className="space-y-3">
            {[
              ['🎥', 'Recording new sign language video content'],
              ['🖥️', 'Server and infrastructure costs'],
              ['🎮', 'Building new interactive learning games'],
              ['♿', 'Making the platform more accessible'],
            ].map(([icon, text]) => (
              <div key={text} className="flex items-center gap-3">
                <span className="text-2xl">{icon}</span>
                <span className="text-white/80 text-sm">{text}</span>
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
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600
                      flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-white border-t-transparent
                        rounded-full animate-spin" />
      </div>
    }>
      <DonateContent />
    </Suspense>
  )
}