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
  Activity,
  ArrowLeft
} from 'lucide-react'
import api from '../services/api'
import SEO from '../components/SEO'

const categoriesList = [
  {
    id: '01',
    title: 'Rehabilitation',
    products: ['Wheelchairs', 'Walkers & Rollators', 'Patient Lifts', 'Support Braces', 'Commode Chairs', 'Crutches'],
    icon: Accessibility,
    href: '/allproduct?category=Rehabilitation',
    bgImage: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: '02',
    title: 'Respiratory',
    products: ['Oxygen Concentrators', 'Nebulizers', 'CPAP Machines', 'BiPAP Systems', 'Suction Machines', 'Oxygen Masks'],
    icon: Wind,
    href: '/allproduct?category=Respiratory',
    bgImage: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: '03',
    title: 'Diagnostic Tools',
    products: ['Stethoscopes', 'BP Monitors', 'Thermometers', 'Ophthalmoscopes', 'ECG Monitors', 'Pulse Oximeters', 'Glucose Meters'],
    icon: Stethoscope,
    href: '/allproduct?category=Diagnostic Tools',
    bgImage: 'https://images.unsplash.com/photo-1606206591513-adbf58b34f57?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: '04',
    title: 'Elder Care',
    products: ['Safety Rails', 'Walking Sticks', 'Mattress Protectors', 'Shower Chairs', 'Hospital Beds'],
    icon: Heart,
    href: '/allproduct?category=Elder Care',
    bgImage: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: '05',
    title: 'Mother & Baby',
    products: ['Breast Pumps', 'Bottle Sterilizers', 'Baby Scales', 'Baby Monitors', 'Infant Warmers'],
    icon: Baby,
    href: '/allproduct?category=Mother & Baby',
    bgImage: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: '06',
    title: 'Pain Relief',
    products: ['TENS Units', 'Heating Pads', 'Ice Therapy Packs', 'Orthopedic Pillows', 'Massagers'],
    icon: Zap,
    href: '/allproduct?category=Pain Relief',
    bgImage: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: '07',
    title: 'Wound Care',
    products: ['Surgical Dressings', 'Antiseptics', 'Adhesive Tapes', 'Bandages', 'Dressing Kits'],
    icon: Plus,
    href: '/allproduct?category=Wound Care',
    bgImage: 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?auto=format&fit=crop&q=80&w=800'
  }
]

const bentoGridClasses = [
  "md:col-span-2 lg:col-span-2 lg:row-span-1",
  "md:col-span-1 lg:col-span-1 lg:row-span-1",
  "md:col-span-1 lg:col-span-1 lg:row-span-1",
  "md:col-span-1 lg:col-span-1 lg:row-span-1",
  "md:col-span-1 lg:col-span-1 lg:row-span-1",
  "md:col-span-1 lg:col-span-1 lg:row-span-1",
  "md:col-span-1 lg:col-span-2 lg:row-span-1"
]

const MotionLink = motion.create ? motion.create(Link) : motion(Link)

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
      <SEO
        title="Product Categories"
        description="Browse Stat Surgicals product categories: Rehabilitation, Respiratory, Diagnostic Tools, Elder Care, Mother & Baby, Pain Relief, and Wound Care."
        keywords={['medical product categories', 'surgical supply collections', 'rehabilitation equipment', 'respiratory devices']}
        canonicalPath="/categories"
      />
      <div className="container-custom">

        {/* BACK LINK */}
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-3 group"
          >
            <div className="w-8 h-8 border border-artisan-light/10 flex items-center justify-center group-hover:bg-artisan-light group-hover:text-artisan-dark transition-all rounded-full">
              <ArrowLeft className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-mono font-bold text-artisan-light/40 uppercase tracking-[0.4em] group-hover:text-artisan-light transition-colors">
              Back to Home
            </span>
          </Link>
        </div>

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
            <p className="text-lg md:text-xl text-artisan-light font-display font-medium tracking-widest leading-relaxed max-w-2xl">
              Browse our specialized collections of clinical-grade medical equipment and surgical supplies.
            </p>
          </div>
        </header>

        {/* CATEGORIES BENTO GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
          {categoriesList.map((category, idx) => {
            const actualProducts = productsByCategory[category.title] || []
            const hasActualProducts = actualProducts.length > 0

            return (
              <div
                key={idx}
                className={`${bentoGridClasses[idx] || ''} bg-artisan-dark p-6 md:p-8 group border border-artisan-light/10 hover:border-artisan-grey/30 hover:shadow-[0_12px_40px_rgba(37,36,34,0.04)] transition-all duration-500 rounded-2xl flex flex-col justify-between relative overflow-hidden min-h-[280px]`}
              >
                {/* Subtle Background Image Overlay */}
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-[0.3] group-hover:opacity-[0.05] group-hover:scale-105 transition-all duration-700 pointer-events-none filter grayscale mix-blend-multiply"
                  style={{ backgroundImage: `url(${(hasActualProducts && (actualProducts[0]?.image || actualProducts[0]?.images?.[0])) || category.bgImage})` }}
                />

                {/* Large watermark category ID */}
                <span className="absolute -bottom-6 -right-4 text-9xl font-display font-black text-artisan-light/[0.02] select-none pointer-events-none group-hover:text-artisan-light/[0.04] group-hover:scale-105 transition-all duration-700">
                  {category.id}
                </span>

                <div className="space-y-6 relative z-10">
                  <div className="flex justify-between items-start">
                    <div className="w-12 h-12 bg-artisan-light/5 border border-artisan-light/10 flex items-center justify-center text-artisan-grey group-hover:bg-artisan-grey group-hover:text-artisan-dark transition-all duration-500 rounded-xl">
                      <category.icon className="w-6 h-6 group-hover:scale-110 transition-transform duration-500" />
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
                                className="text-[10px] font-mono text-artisan-light hover:text-artisan-grey uppercase tracking-wide flex items-center gap-2 transition-all duration-300 hover:translate-x-1 group/link"
                              >
                                <span className="w-1.5 h-1.5 bg-artisan-grey rounded-full flex-shrink-0 group-hover/link:bg-artisan-light transition-colors" />
                                <span className="truncate max-w-[200px] text-artisan-blue group-hover/link:text-artisan-grey transition-colors">{prod.title || prod.name}</span>
                              </Link>
                            </li>
                          ))}
                          {actualProducts.length > 4 && (
                            <li>
                              <Link
                                to={category.href}
                                className="text-[10px] font-mono text-artisan-grey hover:text-artisan-light uppercase tracking-wide flex items-center gap-2 font-bold transition-all duration-300 hover:translate-x-1 group/link"
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
                  className="flex items-center gap-2 text-artisan-grey text-[10px] font-mono font-bold uppercase tracking-widest hover:text-artisan-light transition-all duration-300 w-fit relative z-10 pt-6"
                >
                  Explore Products
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300" />
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
            <p className="text-xs font-mono font-bold text-artisan-light/50 tracking-[0.4em] max-w-lg mx-auto leading-relaxed">
              Connect with our certified medical representatives to secure the exact equipment you need.
            </p>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row justify-center gap-6">
            <MotionLink
              to="/bulk-enquiry"
              className="px-12 py-6 bg-artisan-light text-artisan-dark font-display font-black uppercase tracking-widest rounded-full border border-black cursor-pointer flex items-center justify-center relative overflow-hidden group"
              initial={{ y: 0, boxShadow: "0 6px 0 0 #000000" }}
              whileHover={{
                y: -2,
                boxShadow: "0 8px 0 0 #000000"
              }}
              whileTap={{
                y: 6,
                boxShadow: "0 0px 0 0 #000000"
              }}
              transition={{ type: "spring", stiffness: 600, damping: 18 }}
            >
              <span className="relative z-10">Bulk Orders ?</span>
            </MotionLink>
            <MotionLink
              to="/support"
              className="px-12 py-6 border-2 border-artisan-light text-artisan-light font-display font-black uppercase tracking-widest flex items-center justify-center gap-4 rounded-full cursor-pointer group"
              initial={{ y: 0, boxShadow: "0 6px 0 0 #252422" }}
              whileHover={{
                y: -2,
                boxShadow: "0 8px 0 0 #252422",
                backgroundColor: "rgba(37, 36, 34, 0.04)"
              }}
              whileTap={{
                y: 6,
                boxShadow: "0 0px 0 0 #252422"
              }}
              transition={{ type: "spring", stiffness: 600, damping: 18 }}
            >
              <span>Contact Support</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform duration-300 ease-out" />
            </MotionLink>
          </div>
        </section>

      </div>
    </div>
  )
}
