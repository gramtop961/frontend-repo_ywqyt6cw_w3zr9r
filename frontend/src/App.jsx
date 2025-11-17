import React, { useMemo, useState } from 'react'
import Spline from '@splinetool/react-spline'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function Hero() {
  return (
    <section className="relative h-[80vh] w-full overflow-hidden bg-black text-white">
      <div className="absolute inset-0">
        <Spline scene="https://prod.spline.design/g5OaHmrKTDxRI7Ig/scene.splinecode" style={{ width: '100%', height: '100%' }} />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black pointer-events-none" />
      <div className="relative z-10 mx-auto flex h-full max-w-6xl flex-col items-center justify-center px-6 text-center">
        <p className="mb-3 text-sm uppercase tracking-[0.3em] text-sky-300">Orlando, Florida</p>
        <h1 className="text-4xl font-semibold leading-tight md:text-6xl">Personal Hover Transport</h1>
        <p className="mt-4 max-w-2xl text-slate-200">Clean, minimalist urban mobility. Reserve a private hover drone and glide above the city with confidence.</p>
        <a href="#booking" className="mt-8 rounded-full bg-sky-500/90 px-6 py-3 text-white shadow-lg backdrop-blur transition hover:bg-sky-400">Book Now</a>
      </div>
    </section>
  )
}

function Feature({ title, desc }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-sm backdrop-blur">
      <h3 className="text-lg font-medium text-white">{title}</h3>
      <p className="mt-2 text-sm text-slate-300">{desc}</p>
    </div>
  )
}

function Features() {
  return (
    <section className="bg-black py-16 text-white">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-6 md:grid-cols-3">
        <Feature title="Member Priority" desc="Instant access, preferred launch windows, and concierge routing." />
        <Feature title="Safety First" desc="Certified pilots, redundant systems, and real-time monitoring." />
        <Feature title="Eco Flight" desc="Low-noise electric system designed for clean urban air." />
      </div>
    </section>
  )
}

function usePriceCalculator() {
  return useMemo(() => {
    return (durationHours, passengers, membership) => {
      const base = 199
      const hourRate = 149
      const paxSurcharge = Math.max(0, passengers - 1) * 39
      const tier = membership === 'Pro' ? 0.85 : membership === 'Elite' ? 0.75 : 1
      const subtotal = base + hourRate * durationHours + paxSurcharge
      const total = Math.round(subtotal * tier * 100) / 100
      return total
    }
  }, [])
}

function BookingForm() {
  const calc = usePriceCalculator()
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const payload = {
      full_name: form.get('full_name'),
      email: form.get('email'),
      phone: form.get('phone'),
      pickup_location: form.get('pickup_location'),
      dropoff_location: form.get('dropoff_location') || null,
      date: form.get('date'),
      time: form.get('time'),
      duration_hours: parseInt(form.get('duration_hours')),
      passengers: parseInt(form.get('passengers')),
      package: form.get('package'),
      notes: form.get('notes') || null,
      price_total: parseFloat(form.get('price_total')),
      payment_method: form.get('payment_method'),
    }

    setLoading(true)
    setDone(null)
    try {
      const res = await fetch(`${BACKEND_URL}/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Checkout failed')
      setDone({ ok: true, code: data.confirmation_code })
      e.currentTarget.reset()
    } catch (err) {
      setDone({ ok: false, message: err.message })
    } finally {
      setLoading(false)
    }
  }

  const onChange = (e) => {
    const form = e.currentTarget.form || e.currentTarget
    const duration = parseInt(form.duration_hours?.value || 1)
    const pax = parseInt(form.passengers?.value || 1)
    const tier = form.package?.value || 'Standard'
    const total = calc(duration, pax, tier)
    if (form.price_total) form.price_total.value = total
  }

  return (
    <section id="booking" className="bg-gradient-to-b from-black to-slate-900 py-16 text-white">
      <div className="mx-auto max-w-3xl px-6">
        <h2 className="text-3xl font-semibold">Reserve Your Hover Drone</h2>
        <p className="mt-2 text-slate-300">Book a private flight window in Orlando. Choose your membership tier for exclusive rates.</p>

        <form onSubmit={handleSubmit} onChange={onChange} className="mt-8 grid grid-cols-1 gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <input name="full_name" required placeholder="Full name" className="w-full rounded-md bg-black/40 px-4 py-3 outline-none ring-1 ring-white/10 focus:ring-sky-400" />
            <input name="email" type="email" required placeholder="Email" className="w-full rounded-md bg-black/40 px-4 py-3 outline-none ring-1 ring-white/10 focus:ring-sky-400" />
            <input name="phone" required placeholder="Phone" className="w-full rounded-md bg-black/40 px-4 py-3 outline-none ring-1 ring-white/10 focus:ring-sky-400" />
            <input name="pickup_location" required placeholder="Pickup location" className="w-full rounded-md bg-black/40 px-4 py-3 outline-none ring-1 ring-white/10 focus:ring-sky-400" />
            <input name="dropoff_location" placeholder="Dropoff location (optional)" className="w-full rounded-md bg-black/40 px-4 py-3 outline-none ring-1 ring-white/10 focus:ring-sky-400 md:col-span-2" />
            <input name="date" type="date" required className="w-full rounded-md bg-black/40 px-4 py-3 outline-none ring-1 ring-white/10 focus:ring-sky-400" />
            <input name="time" type="time" required className="w-full rounded-md bg-black/40 px-4 py-3 outline-none ring-1 ring-white/10 focus:ring-sky-400" />
            <select name="duration_hours" defaultValue="1" className="w-full rounded-md bg-black/40 px-4 py-3 outline-none ring-1 ring-white/10 focus:ring-sky-400">
              {[1,2,3,4,5,6,7,8,9,10,11,12].map(n => <option key={n} value={n}>{n} hour{n>1?'s':''}</option>)}
            </select>
            <select name="passengers" defaultValue="1" className="w-full rounded-md bg-black/40 px-4 py-3 outline-none ring-1 ring-white/10 focus:ring-sky-400">
              {[1,2,3,4].map(n => <option key={n} value={n}>{n} passenger{n>1?'s':''}</option>)}
            </select>
            <select name="package" defaultValue="Standard" className="w-full rounded-md bg-black/40 px-4 py-3 outline-none ring-1 ring-white/10 focus:ring-sky-400 md:col-span-2">
              {['Standard','Pro','Elite'].map(t => <option key={t} value={t}>{t} Membership</option>)}
            </select>
            <textarea name="notes" placeholder="Notes for pilot (optional)" className="w-full rounded-md bg-black/40 px-4 py-3 outline-none ring-1 ring-white/10 focus:ring-sky-400 md:col-span-2" />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <select name="payment_method" defaultValue="card" className="w-full rounded-md bg-black/40 px-4 py-3 outline-none ring-1 ring-white/10 focus:ring-sky-400">
              <option value="card">Card</option>
              <option value="wallet">Wallet</option>
            </select>
            <input name="price_total" readOnly className="w-full rounded-md bg-black/60 px-4 py-3 text-sky-300 outline-none ring-1 ring-white/10" />
            <button disabled={loading} className="rounded-md bg-sky-500 px-4 py-3 font-medium text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60">
              {loading ? 'Processing...' : 'Confirm & Checkout'}
            </button>
          </div>

          {done && done.ok && (
            <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-300">
              Booking confirmed. Code: <span className="font-mono">{done.code}</span>
            </div>
          )}
          {done && !done.ok && (
            <div className="rounded-md border border-rose-500/30 bg-rose-500/10 p-4 text-rose-300">
              {done.message}
            </div>
          )}
        </form>
      </div>
    </section>
  )
}

function Footer(){
  return (
    <footer className="bg-black py-10 text-center text-slate-400">
      <p>© {new Date().getFullYear()} Hover Orlando. All rights reserved.</p>
    </footer>
  )
}

export default function App(){
  return (
    <div className="min-h-screen bg-black font-[Inter]">
      <Hero />
      <Features />
      <BookingForm />
      <Footer />
    </div>
  )
}
