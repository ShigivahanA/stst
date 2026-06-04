import { useRef, useState, useEffect } from 'react'
import { motion, useInView } from 'framer-motion'
import api from '../../services/api'

const FALLBACK_STATS = [
  { value: '500+', label: 'Trusted by Hospitals', description: 'Serving medical institutions' },
  { value: '₹', label: 'Wholesale Pricing', description: 'Best prices guaranteed' },
  { value: 'PAN', label: 'Pan-India Delivery', description: 'Fast & reliable shipping' },
  { value: '100%', label: 'Quality Assured', description: 'Certified products only' },
]

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

  return (
    <section ref={ref} className="bg-artisan-dark bg-noise border-b border-artisan-light min-h-screen flex flex-col">
      <div className="container-custom py-12 lg:py-16 flex flex-col flex-1 w-full">
        
        {/* Header */}
        <div className="mb-4 lg:mb-6">
          <span className="text-xs font-mono font-bold uppercase tracking-[0.4em] text-artisan-grey mb-2 block">Why Choose Us</span>
          <h2 className="text-3xl lg:text-4xl font-display font-extrabold uppercase tracking-tighter leading-none text-artisan-light">
            Our <br />
            <span className="text-outline">Advantage.</span>
          </h2>
        </div>

        {/* Massive Stat Rows */}
        <div className="flex flex-col border-t-2 border-artisan-light">
          {stats.map((stat, i) => (
            <motion.div
              key={stat._id || stat.label}
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: i * 0.1 }}
              className="group border-b-2 border-artisan-light py-3 lg:py-4 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center hover:bg-artisan-grey transition-colors duration-500"
            >
              {/* Value Column */}
              <div className="lg:col-span-5">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={isInView ? { scale: 1, opacity: 1 } : {}}
                  transition={{ duration: 1, delay: i * 0.1 + 0.3 }}
                  className="text-4xl md:text-5xl lg:text-6xl font-display font-extrabold leading-none text-artisan-grey group-hover:text-artisan-dark transition-colors duration-500 tracking-tighter"
                >
                  {stat.value}
                </motion.div>
              </div>

              {/* Label Column */}
              <div className="lg:col-span-4">
                <h3 className="text-lg lg:text-2xl font-display font-extrabold uppercase text-artisan-light group-hover:text-artisan-dark transition-colors duration-500 mb-1">
                  {stat.label}
                </h3>
              </div>

              {/* Description Column */}
              <div className="lg:col-span-3">
                <p className="text-sm lg:text-base font-body text-artisan-light/60 group-hover:text-artisan-dark/80 transition-colors duration-500 leading-relaxed font-medium">
                  {stat.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

