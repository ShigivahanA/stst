import { useRef, useState, useEffect } from 'react'
import { motion, useInView } from 'framer-motion'
import { Building2, IndianRupee, Truck, ShieldCheck } from 'lucide-react'
import api from '../../services/api'

const FALLBACK_STATS = [
  { value: '500+', label: 'Trusted by Hospitals', description: 'Serving medical institutions' },
  { value: '₹', label: 'Wholesale Pricing', description: 'Best prices guaranteed' },
  { value: 'PAN', label: 'Pan-India Delivery', description: 'Fast & reliable shipping' },
  { value: '100%', label: 'Quality Assured', description: 'Certified products only' },
]

function DigitSpinner({ digit, isInView, delay }) {
  const num = parseInt(digit, 10)

  return (
    <span className="inline-block overflow-hidden h-[1em] relative leading-none">
      <motion.span
        initial={{ y: "0%" }}
        animate={isInView ? { y: `-${num * 10}%` } : { y: "0%" }}
        transition={{
          duration: 1.5,
          ease: [0.16, 1, 0.3, 1],
          delay: delay
        }}
        className="flex flex-col text-left"
      >
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <span key={n} className="h-[1em] leading-none flex items-center justify-center">
            {n}
          </span>
        ))}
      </motion.span>
    </span>
  )
}

function StatSpinner({ value, isInView }) {
  const hasDigits = /\d/.test(value)
  if (!hasDigits) {
    return <span>{value}</span>
  }

  const chars = value.split('')
  let digitIndex = 0

  return (
    <span className="inline-flex items-baseline select-none">
      {chars.map((char, index) => {
        if (/\d/.test(char)) {
          const delay = digitIndex * 0.08
          digitIndex++
          return (
            <DigitSpinner
              key={index}
              digit={char}
              isInView={isInView}
              delay={delay}
            />
          )
        }
        return (
          <span key={index} className="inline-block">
            {char}
          </span>
        )
      })}
    </span>
  )
}

function StatCard({ stat, index, isInView, icon: IconComponent, idBadge }) {
  return (
    <div
      className="group relative p-6 bg-white border border-artisan-light/10 rounded-2xl md:rounded-3xl flex flex-col justify-between overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.01)] hover:shadow-xl hover:bg-artisan-light hover:-translate-y-1.5 hover:scale-[1.01] transition-all duration-300 min-h-[220px]"
    >
      {/* Blueprint grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(235,94,40,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(235,94,40,0.02)_1px,transparent_1px)] bg-[size:12px_12px] opacity-20 pointer-events-none group-hover:opacity-40 transition-opacity duration-500" />

      {/* HUD-like corner accent */}
      <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-artisan-grey/25 group-hover:border-artisan-grey transition-colors duration-500 pointer-events-none rounded-xs" />
      <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-artisan-grey/25 group-hover:border-artisan-grey transition-colors duration-500 pointer-events-none rounded-xs" />

      {/* Top row */}
      <div className="flex justify-between items-start w-full relative z-10">
        <div className="w-10 h-10 bg-artisan-light/5 border border-artisan-light/10 flex items-center justify-center text-artisan-grey rounded-xl group-hover:bg-artisan-grey/10 group-hover:border-artisan-grey/30 group-hover:text-artisan-grey transition-all duration-500">
          <IconComponent className="w-5 h-5" />
        </div>
        <span className="text-[8px] font-mono font-bold text-artisan-light/30 uppercase tracking-[0.2em] group-hover:text-artisan-dark/40 transition-colors duration-500">
          {idBadge}
        </span>
      </div>

      {/* Value */}
      <div className="relative z-10 mt-6 mb-4">
        <h3 className="text-4xl md:text-5xl font-display font-extrabold text-artisan-light group-hover:text-artisan-dark transition-colors duration-500 tracking-tighter">
          <StatSpinner value={stat.value} isInView={isInView} />
        </h3>
      </div>

      {/* Label and description */}
      <div className="relative z-10 space-y-1">
        <h4 className="text-xs font-display font-extrabold uppercase text-artisan-grey group-hover:text-artisan-dark transition-colors duration-500">
          {stat.label}
        </h4>
        <p className="text-[10px] font-mono font-bold text-artisan-light/45 group-hover:text-artisan-dark/60 uppercase tracking-widest transition-colors duration-500">
          {stat.description}
        </p>
      </div>
    </div>
  )
}

export default function Stats() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const [stats, setStats] = useState(FALLBACK_STATS)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/content/stats')
        if (res.data.data?.length > 0) {
          setStats(res.data.data)
        }
      } catch (err) {
        console.error('Failed to fetch platform stats', err)
      }
    }
    fetchStats()
  }, [])

  const statConfig = [
    { icon: Building2, badge: 'ADV-01' },
    { icon: IndianRupee, badge: 'ADV-02' },
    { icon: Truck, badge: 'ADV-03' },
    { icon: ShieldCheck, badge: 'ADV-04' },
  ]

  return (
    <section ref={ref} className="bg-artisan-dark bg-noise border-b border-artisan-light/10 py-16 md:py-24 relative overflow-hidden flex flex-col justify-center">
      {/* Background Decorative Accent Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(to_right,rgba(37,36,34,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(37,36,34,0.1)_1px,transparent_1px)] bg-[size:40px_40px]" />

      <div className="container-custom relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

          {/* Left Column: Title and clinical detail card */}
          <div className="lg:col-span-4 xl:col-span-5 flex flex-col space-y-8">
            <div className="space-y-3">
              <span className="text-xs font-mono font-bold uppercase tracking-[0.4em] text-artisan-grey block">Why Choose Us</span>
              <h2 className="text-4xl md:text-5xl font-display font-extrabold uppercase tracking-tighter leading-none text-artisan-light">
                Our <br />
                <span className="text-outline">Advantage.</span>
              </h2>
            </div>

            <p className="text-xs font-mono text-artisan-light/50 uppercase tracking-[0.2em] leading-relaxed">
              STAT Surgical Supplies delivers top-tier clinical machinery, diagnostic tools, and surgical consumables to hospitals, healthcare centers, and medical practitioners across India.
            </p>
            {/* Premium Heartbeat/ECG Visual Component */}
            <div className="ecg-container p-6 border border-artisan-light/15 bg-white/20 backdrop-blur-sm rounded-2xl md:rounded-3xl relative overflow-hidden">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(235,94,40,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(235,94,40,0.01)_1px,transparent_1px)] bg-[size:10px_10px]" />
              <div className="relative z-10 w-full h-14 bg-artisan-light/5 border border-artisan-light/5 flex items-center justify-center rounded-xl p-2 overflow-hidden">
                <style>{`
                  @keyframes ecg-sweep {
                    0% { stroke-dashoffset: 500; }
                    100% { stroke-dashoffset: 0; }
                  }
                  .ecg-container svg {
                    transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                  }
                  .ecg-container:hover svg {
                    transform: scale(1.08);
                  }
                  .ecg-pulse-line {
                    stroke-dasharray: 60, 440;
                    stroke-dashoffset: 500;
                    animation: ecg-sweep 2.5s linear infinite;
                    transition: stroke-width 0.3s ease, filter 0.3s ease;
                  }
                  .ecg-container:hover .ecg-pulse-line {
                    animation-duration: 1.1s; /* Energized heartbeat rate on hover */
                    stroke-width: 2.5;
                    filter: drop-shadow(0 0 3px #eb5e28) drop-shadow(0 0 8px #eb5e28);
                  }
                  .ecg-bg-line {
                    transition: stroke 0.3s ease, stroke-width 0.3s ease, opacity 0.3s ease;
                  }
                  .ecg-container:hover .ecg-bg-line {
                    stroke: rgba(235, 94, 40, 0.25);
                    stroke-width: 2;
                  }
                `}</style>
                <svg className="w-full h-full" viewBox="0 0 200 40" preserveAspectRatio="none">
                  {/* Faint static background line */}
                  <path
                    d="M 0,20 L 40,20 L 50,20 L 55,5 L 60,35 L 65,20 L 70,20 L 80,20 L 90,20 L 95,0 L 100,40 L 105,20 L 110,20 L 120,20 L 160,20 L 170,20 L 175,5 L 180,35 L 185,20 L 200,20"
                    fill="none"
                    stroke="currentColor"
                    className="text-artisan-grey/10 ecg-bg-line"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Bright sweeping pulse line */}
                  <path
                    d="M 0,20 L 40,20 L 50,20 L 55,5 L 60,35 L 65,20 L 70,20 L 80,20 L 90,20 L 95,0 L 100,40 L 105,20 L 110,20 L 120,20 L 160,20 L 170,20 L 175,5 L 180,35 L 185,20 L 200,20"
                    fill="none"
                    stroke="currentColor"
                    className="text-artisan-grey ecg-pulse-line"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Right Column: 2x2 grid of modern stats cards */}
          <div className="lg:col-span-8 xl:col-span-7">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
              {stats.map((stat, i) => {
                const config = statConfig[i % statConfig.length]
                return (
                  <StatCard
                    key={stat._id || stat.label}
                    stat={stat}
                    index={i}
                    isInView={isInView}
                    icon={config.icon}
                    idBadge={config.badge}
                  />
                )
              })}
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
