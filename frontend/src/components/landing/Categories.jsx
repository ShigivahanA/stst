import { useRef, useState, useEffect } from 'react'
import { motion, useInView } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'

const STATIC_CATEGORIES = [
  { name: 'Rehabilitation', code: 'RH-01', size: 'lg:col-span-5', desc: 'Walking aids, supports, braces & more' },
  { name: 'Respiratory', code: 'RS-02', size: 'lg:col-span-4', desc: 'Oxygen supplies, nebulizers & respiratory care' },
  { name: 'Diagnostic Tools', code: 'DT-03', size: 'lg:col-span-3', desc: 'Stethoscopes, BP monitors & equipment' },
  { name: 'Elder Care', code: 'EC-04', size: 'lg:col-span-4', desc: 'Mobility aids, daily living aids & safety' },
  { name: 'Mother & Baby', code: 'MB-05', size: 'lg:col-span-4', desc: 'Maternity essentials & infant care' },
  { name: 'Pain Relief', code: 'PR-06', size: 'lg:col-span-4', desc: 'Sprays, gels, hot/cold packs & supports' },
  { name: 'Wound Care', code: 'WC-07', size: 'lg:col-span-8', desc: 'Bandages, dressings & surgical tapes' },
]

export default function Categories() {
  const ref = useRef(null)
  const navigate = useNavigate()
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const [counts, setCounts] = useState({})

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const res = await api.get('/listings/categories')
        const countsMap = res.data.data.reduce((acc, curr) => {
          acc[curr._id] = curr.count
          return acc
        }, {})
        setCounts(countsMap)
      } catch (err) {
        console.error('Failed to fetch category counts', err)
      }
    }
    fetchCounts()
  }, [])

  const handleCategoryClick = (categoryName) => {
    navigate(`/rent?category=${categoryName}`)
  }

  return (
    <section id="categories" className="bg-artisan-dark bg-noise border-b-2 border-artisan-light min-h-screen flex flex-col">
      <div className="container-custom py-12 lg:py-16 flex flex-col flex-1">

        {/* Header */}
        <div className="mb-4 lg:mb-6 flex flex-col md:flex-row md:items-end justify-between gap-3">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="max-w-4xl"
          >
            <span className="text-xs font-mono font-bold uppercase tracking-[0.4em] text-artisan-grey mb-6 block">Product Range</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-extrabold uppercase tracking-tighter leading-[0.85] text-artisan-light">
              Our <br />
              <span className="text-outline">Categories.</span>
            </h2>
          </motion.div>
          <p className="md:max-w-xs text-artisan-light/40 font-mono text-xs uppercase tracking-[0.2em] leading-loose">
            Explore our comprehensive range of medical supplies. Select your category.
          </p>
        </div>

        {/* Asymmetric Category Grid */}
        <div ref={ref} className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-4 lg:gap-6">
          {STATIC_CATEGORIES.map((cat, i) => (
            <motion.button
              key={cat.name}
              onClick={() => handleCategoryClick(cat.name)}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              whileHover={{ y: -6, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: i * 0.05 }}
              className={`group relative p-6 md:p-8 bg-white border border-artisan-light/10 rounded-2xl md:rounded-3xl flex flex-col items-start text-left overflow-hidden transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-xl hover:bg-artisan-light col-span-1 md:col-span-3 ${cat.size}`}
            >
              <div className="w-full flex justify-between items-start mb-4 relative z-10">
                <span className="text-[10px] font-mono font-bold text-artisan-grey uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded border border-slate-100 group-hover:bg-white/10 group-hover:border-white/10 group-hover:text-white transition-all duration-300">
                  Available — {counts[cat.name] || 0}
                </span>
                <ArrowUpRight className="w-5 h-5 md:w-6 md:h-6 text-artisan-light group-hover:text-artisan-dark group-hover:translate-x-1 group-hover:-translate-y-1 transition-[color,transform] duration-500" />
              </div>

              <div className="relative z-10 w-full mt-2">
                <h3 className="text-base sm:text-lg lg:text-xl font-display font-extrabold uppercase text-artisan-light group-hover:text-artisan-dark transition-colors duration-500 mb-1.5 leading-tight break-keep hyphens-none">
                  {cat.name}
                </h3>
                <p className="text-[10px] font-mono font-bold text-artisan-light/45 group-hover:text-artisan-dark/60 uppercase tracking-widest transition-colors duration-500">
                  {cat.desc}
                </p>
              </div>

              {/* Hover Graphic Reveal (Scaled for mobile) */}
              <div className="absolute -bottom-6 -right-6 md:-bottom-10 md:-right-10 text-8xl md:text-[10rem] font-display font-extrabold text-artisan-light/[0.02] group-hover:text-artisan-dark/[0.05] pointer-events-none transition-colors duration-500 uppercase">
                {cat.name.substring(0, 3)}
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  )
}
