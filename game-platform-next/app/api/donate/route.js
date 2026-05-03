import Razorpay from 'razorpay'

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
})

export async function POST(request) {
  const { amount } = await request.json()

  if (!amount || amount < 1)
    return Response.json({ error: 'Minimum donation is ₹1' }, { status: 400 })

  const order = await razorpay.orders.create({
    amount:   amount * 100,  // paise
    currency: 'INR',
    receipt:  `donation_${Date.now()}`,
    notes:    { type: 'donation' },
  })

  return Response.json({
    orderId:  order.id,
    amount:   order.amount,
    currency: order.currency,
    keyId:    process.env.RAZORPAY_KEY_ID,
  })
}