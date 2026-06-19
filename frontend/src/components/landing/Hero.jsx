import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Loader2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'

// Sub-component for individual marquee cards to keep code clean and modular
const MarqueeCard = ({ product }) => {
  const displayImage = product.image || product.images?.[0]
  return (
    <Link 
      to={`/product/${product._id}`}
      className="block w-full"
    >
      <div className="w-full bg-artisan-dark border border-artisan-light/10 hover:border-artisan-grey hover:shadow-[0_15px_30px_rgba(37,36,34,0.06)] rounded-2xl p-4 sm:p-5 flex flex-col justify-between items-center text-center transition-all duration-500 relative group/card cursor-pointer">
        <div className="w-full flex justify-between items-center text-[8px] font-mono text-artisan-light/35 uppercase tracking-wider mb-2">
          <span>{product.category}</span>
          <span>REF: {product._id?.slice(-4).toUpperCase()}</span>
        </div>
        
        {/* Image Display */}
        <div className="h-[90px] sm:h-[120px] md:h-[140px] w-full flex items-center justify-center overflow-hidden mb-3 select-none">
          <img
            src={displayImage}
            alt={product.name}
            className="max-h-full max-w-full object-contain drop-shadow-[0_8px_16px_rgba(37,36,34,0.05)] group-hover/card:scale-105 transition-transform duration-500"
            draggable={false}
          />
        </div>

        {/* Title and price */}
        <div className="w-full">
          <h3 className="text-[10px] sm:text-xs font-display font-black text-artisan-light uppercase tracking-tight truncate leading-tight">
            {product.name}
          </h3>
          <span className="text-[9px] font-mono text-artisan-grey font-bold block mt-1">
            ₹{(product.price !== undefined ? product.price : product.pricePerDay)?.toLocaleString()}
          </span>
        </div>
      </div>
    </Link>
  )
}

export default function Hero() {
  const { user } = useAuth()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch products for the showcase
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const res = await api.get('/listings', { params: { sort: '-averageRating' } })
        const data = res.data.data || []
        const withImages = data.filter(p => p.image || (p.images && p.images.length > 0))
        setProducts(withImages)
      } catch (err) {
        console.error('Failed to fetch hero products', err)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  // Auto-refresh the page when screen size changes to rebuild marquee layouts dynamically
  useEffect(() => {
    let timeoutId
    const handleResize = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        window.location.reload()
      }, 400)
    }
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      clearTimeout(timeoutId)
    }
  }, [])

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center overflow-hidden bg-artisan-dark bg-noise pt-20 pb-8 lg:pt-24 lg:pb-0"
    >
      {/* Background glow behind product */}
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-artisan-grey/5 blur-[150px] pointer-events-none" />

      <div className="container-custom relative z-10 w-full">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-center">

          {/* Left Column: Text content */}
          <div className="lg:col-span-6 xl:col-span-5 flex flex-col items-start text-left">

            {/* Status Badge */}
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 bg-white border border-artisan-light/10 rounded-full shadow-sm backdrop-blur-sm"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#65A90D] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#65A90D]"></span>
              </span>
              <span className="text-[9px] font-mono uppercase tracking-[0.3em] font-bold text-artisan-grey">
                Trusted by Healthcare Professionals
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
              className="text-3xl sm:text-5xl md:text-6xl lg:text-[72px] font-display font-black uppercase tracking-tighter leading-[0.92] mb-4 text-artisan-light"
            >
              Surgical <br />
              <span className="text-artisan-grey">Supplies</span>
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15 }}
              className="text-xs sm:text-base text-artisan-light/60 max-w-lg mb-6 leading-relaxed font-normal"
            >
              Engineered for reliability. Certified for safety. Serving hospitals and clinics across India with precision surgical tools.
            </motion.p>

            {/* Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.25 }}
              className="flex flex-row items-center gap-3 w-full sm:w-auto"
            >
              <Link to="/allproduct" className="flex-1 sm:flex-initial">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto px-6 py-3.5 sm:px-8 sm:py-4 bg-artisan-grey text-white font-display font-bold uppercase tracking-widest text-[10px] hover:bg-artisan-light transition-all duration-300 relative group overflow-hidden rounded-xl"
                >
                  <span className="relative z-10">Browse Products</span>
                  <div className="absolute inset-0 bg-artisan-light translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                </motion.button>
              </Link>

              <Link
                to={user ? (user.role === 'admin' ? '/admin' : '/profile') : '/signup'}
                className="flex-1 sm:flex-initial"
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto px-6 py-3.5 sm:px-8 sm:py-4 border border-artisan-light text-artisan-light font-display font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-artisan-light hover:text-white transition-all duration-300 rounded-full"
                >
                  {user ? (user.role === 'admin' ? 'Admin Hub' : 'Profile') : 'Join Us'}
                  <ArrowRight className="w-3.5 h-3.5" />
                </motion.button>
              </Link>
            </motion.div>

          </div>

          {/* Right Column: Interactive Product Showcase Marquee */}
          <div className="col-span-1 lg:col-span-6 xl:col-span-7 w-full mt-6 sm:mt-8 lg:mt-0">
            <div className="relative w-full h-[260px] sm:h-[300px] lg:h-[480px] xl:h-[560px] flex items-center justify-center rounded-[24px] sm:rounded-[32px] overflow-hidden p-1 group/marquee">
              {loading ? (
                <div className="flex flex-col items-center justify-center gap-4 text-slate-400">
                  <Loader2 className="w-8 h-8 animate-spin text-artisan-grey" />
                  <span className="text-xs font-mono tracking-widest uppercase">Loading Catalog...</span>
                </div>
              ) : products.length > 0 ? (
                <>
                  {/* Mobile & Tablet Layout: Single Horizontal Row Scrolling (when stacked vertically: below lg) */}
                  <div className="flex lg:hidden overflow-hidden w-full h-full items-center relative">
                    {/* Horizontal Fading Overlays */}
                    <div className="absolute top-0 bottom-0 left-0 w-12 sm:w-20 bg-gradient-to-r from-[#fffcf2] to-transparent z-10 pointer-events-none" />
                    <div className="absolute top-0 bottom-0 right-0 w-12 sm:w-20 bg-gradient-to-l from-[#fffcf2] to-transparent z-10 pointer-events-none" />

                    <div className="flex flex-row gap-3 animate-marquee-left hover:[animation-play-state:paused] w-max py-4">
                      {[...products, ...products].map((product, idx) => (
                        <div key={`horiz-${product._id}-${idx}`} className="w-[220px] shrink-0">
                          <MarqueeCard product={product} />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Desktop Layout: Opposing Dual-Track Vertical Marquee (when side-by-side with text: lg and up) */}
                  <div className="hidden lg:grid grid-cols-2 gap-3 sm:gap-4 h-full w-full relative">
                    {/* Vertical Fading Overlays */}
                    <div className="absolute top-0 left-0 right-0 h-16 sm:h-24 bg-gradient-to-b from-[#fffcf2] to-transparent z-10 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-24 bg-gradient-to-t from-[#fffcf2] to-transparent z-10 pointer-events-none" />

                    {/* Left Track (Scroll Up) */}
                    <div className="relative h-full overflow-hidden flex flex-col group/track-up">
                      <div className="flex flex-col gap-3 sm:gap-4 animate-marquee-up hover:[animation-play-state:paused] cursor-pointer">
                        {[...products, ...products].map((product, idx) => (
                          <div key={`left-${product._id}-${idx}`} className="w-full shrink-0">
                            <MarqueeCard product={product} />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right Track (Scroll Down) */}
                    <div className="relative h-full overflow-hidden flex flex-col group/track-down">
                      <div className="flex flex-col gap-3 sm:gap-4 animate-marquee-down hover:[animation-play-state:paused] cursor-pointer">
                        {[...products].reverse().concat([...products].reverse()).map((product, idx) => (
                          <div key={`right-${product._id}-${idx}`} className="w-full shrink-0">
                            <MarqueeCard product={product} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center gap-4 text-slate-400">
                  <span className="text-xs font-mono tracking-widest uppercase">No Products Available</span>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
