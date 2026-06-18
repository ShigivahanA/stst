import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Accessibility,
  Wind,
  Stethoscope,
  Heart,
  Baby,
  Zap,
  Plus,
  ArrowRight,
  Activity
} from 'lucide-react'
import api from '../services/api'

const categoriesList = [
  {
    id: '01',
    title: 'Rehabilitation',
    products: ['Wheelchairs', 'Walkers & Rollators', 'Patient Lifts', 'Support Braces', 'Commode Chairs', 'Crutches'],
    icon: Accessibility,
    href: '/allproduct?category=Rehabilitation'
  },
  {
    id: '02',
    title: 'Respiratory',
    products: ['Oxygen Concentrators', 'Nebulizers', 'CPAP Machines', 'BiPAP Systems', 'Suction Machines', 'Oxygen Masks'],
    icon: Wind,
    href: '/allproduct?category=Respiratory'
  },
  {
    id: '03',
    title: 'Diagnostic Tools',
    products: ['Stethoscopes', 'BP Monitors', 'Thermometers', 'Ophthalmoscopes', 'ECG Monitors', 'Pulse Oximeters', 'Glucose Meters'],
    icon: Stethoscope,
    href: '/allproduct?category=Diagnostic Tools'
  },
  {
    id: '04',
    title: 'Elder Care',
    products: ['Safety Rails', 'Walking Sticks', 'Mattress Protectors', 'Shower Chairs', 'Hospital Beds'],
    icon: Heart,
    href: '/allproduct?category=Elder Care'
  },
  {
    id: '05',
    title: 'Mother & Baby',
    products: ['Breast Pumps', 'Bottle Sterilizers', 'Baby Scales', 'Baby Monitors', 'Infant Warmers'],
    icon: Baby,
    href: '/allproduct?category=Mother & Baby'
  },
  {
    id: '06',
    title: 'Pain Relief',
    products: ['TENS Units', 'Heating Pads', 'Ice Therapy Packs', 'Orthopedic Pillows', 'Massagers'],
    icon: Zap,
    href: '/allproduct?category=Pain Relief'
  },
  {
    id: '07',
    title: 'Wound Care',
    products: ['Surgical Dressings', 'Antiseptics', 'Adhesive Tapes', 'Bandages', 'Dressing Kits'],
    icon: Plus,
    href: '/allproduct?category=Wound Care'
  }
]

export default function Categories() {
  const [productsByCategory, setProductsByCategory] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const res = await api.get('/listings')
        const allProducts = res.data.data || []

        // Group products by category
        const grouped = {}
        allProducts.forEach(p => {
          const cat = p.category
          if (!grouped[cat]) {
            grouped[cat] = []
          }
          grouped[cat].push(p)
        })
        setProductsByCategory(grouped)
      } catch (err) {
        console.error('Failed to fetch products for categories page', err)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  return (
    <div className="min-h-screen bg-artisan-dark bg-noise pt-24 md:pt-32 pb-24">
      <div className="container-custom">

        {/* HERO HEADER */}
        <header className="mb-20 md:mb-28">
          <div className="max-w-4xl space-y-6">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-extrabold uppercase tracking-tighter leading-[0.85] text-artisan-light"
            >
              PRODUCT <br />
              <span className="text-outline">CATEGORIES.</span>
            </motion.h1>
            <p className="text-lg md:text-xl text-artisan-light/40 font-display font-medium uppercase tracking-widest leading-relaxed max-w-2xl">
              Browse our specialized collections of clinical-grade medical equipment and surgical supplies.
            </p>
          </div>
        </header>

        {/* CATEGORIES GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px bg-artisan-light/10 border border-artisan-light/10 mb-24 rounded-xl overflow-hidden">
          {categoriesList.map((category, idx) => {
            const actualProducts = productsByCategory[category.title] || []
            const hasActualProducts = actualProducts.length > 0

            return (
              <div
                key={idx}
                className="bg-artisan-dark p-8 md:p-10 space-y-8 group hover:bg-artisan-light/[0.02] transition-all flex flex-col justify-between"
              >
                <div className="space-y-8">
                  <div className="flex justify-between items-start">
                    <div className="w-12 h-12 bg-artisan-light/5 border border-artisan-light/10 flex items-center justify-center text-artisan-grey group-hover:bg-artisan-grey group-hover:text-artisan-dark transition-all duration-500 rounded-xl">
                      <category.icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-mono font-bold text-artisan-light/20 uppercase tracking-widest">{category.id}</span>
                  </div>
                  <div className="space-y-4">
                    <Link
                      to={category.href}
                      className="text-2xl font-display font-black text-artisan-light uppercase tracking-tight hover:text-artisan-grey transition-colors block"
                    >
                      {category.title}
                    </Link>
                    <div className="space-y-2">
                      <span className="text-[9px] font-mono font-bold text-artisan-grey uppercase tracking-widest block">Available Products:</span>

                      {loading ? (
                        <div className="space-y-2 animate-pulse py-1">
                          <div className="h-3 bg-artisan-light/5 w-3/4" />
                          <div className="h-3 bg-artisan-light/5 w-1/2" />
                          <div className="h-3 bg-artisan-light/5 w-2/3" />
                        </div>
                      ) : hasActualProducts ? (
                        <ul className="space-y-2">
                          {actualProducts.slice(0, 4).map((prod) => (
                            <li key={prod._id}>
                              <Link
                                to={`/product/${prod._id}`}
                                className="text-[10px] font-mono text-artisan-light/50 hover:text-artisan-grey uppercase tracking-wide flex items-center gap-2 transition-colors group/link"
                              >
                                <span className="w-1.5 h-1.5 bg-artisan-grey flex-shrink-0 group-hover/link:bg-artisan-light transition-colors" />
                                <span className="truncate max-w-[180px]">{prod.title || prod.name}</span>
                              </Link>
                            </li>
                          ))}
                          {actualProducts.length > 4 && (
                            <li>
                              <Link
                                to={category.href}
                                className="text-[10px] font-mono text-artisan-grey hover:text-artisan-light uppercase tracking-wide flex items-center gap-2 font-bold transition-colors group/link"
                              >
                                <span className="w-1.5 h-1.5 bg-artisan-grey flex-shrink-0 animate-pulse" />
                                <span>+ {actualProducts.length - 4} More Products</span>
                              </Link>
                            </li>
                          )}
                        </ul>
                      ) : (
                        <ul className="space-y-1.5">
                          {category.products.slice(0, 4).map((prod, i) => (
                            <li key={i} className="text-[10px] font-mono text-artisan-light/35 uppercase tracking-wide flex items-center gap-2">
                              <span className="w-1 h-1 bg-artisan-light/20 flex-shrink-0" />
                              {prod}
                            </li>
                          ))}
                          <li className="text-[9px] font-mono text-artisan-light/20 uppercase tracking-wide italic">
                            No stock currently listed
                          </li>
                        </ul>
                      )}
                    </div>
                  </div>
                </div>

                <Link
                  to={category.href}
                  className="pt-6 flex items-center gap-2 text-artisan-grey text-[10px] font-mono font-bold uppercase tracking-widest hover:text-artisan-light transition-all duration-300 w-fit"
                >
                  Explore Products
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            )
          })}
        </div>

        {/* CALL TO ACTION */}
        <section className="border border-artisan-grey/20 bg-artisan-grey/[0.02] p-12 md:p-20 text-center space-y-10 relative overflow-hidden rounded-xl">
          <div className="absolute inset-0 pointer-events-none opacity-5 flex items-center justify-center">
            <Activity className="w-64 h-64 text-artisan-grey" />
          </div>

          <div className="relative z-10 space-y-6">
            <h2 className="text-4xl md:text-5xl font-display font-extrabold uppercase tracking-tighter text-artisan-light leading-none">
              Need Help <br />
              <span className="text-outline text-artisan-grey">Finding Supplies?</span>
            </h2>
            <p className="text-xs font-mono font-bold text-artisan-light/50 uppercase tracking-[0.4em] max-w-lg mx-auto leading-relaxed">
              Connect with our certified medical representatives to secure the exact equipment you need.
            </p>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row justify-center gap-6">
            <Link
              to="/bulk-enquiry"
              className="px-12 py-6 bg-artisan-light text-artisan-dark font-display font-black uppercase tracking-widest hover:bg-artisan-grey transition-all rounded-full"
            >
              Bulk Orders ?
            </Link>
            <Link
              to="/support"
              className="px-12 py-6 border-2 border-artisan-light/10 text-artisan-light font-display font-black uppercase tracking-widest hover:bg-artisan-light/5 transition-all flex items-center justify-center gap-4 rounded-full"
            >
              Contact Support
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>

      </div>
    </div>
  )
}
