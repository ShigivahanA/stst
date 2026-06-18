import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'

export default function Hero() {
  const { user } = useAuth()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  const [isHovered, setIsHovered] = useState(false)

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

  const handleNext = () => {
    if (products.length === 0) return
    setDirection(1)
    setCurrentIndex((prevIndex) => (prevIndex + 1) % products.length)
  }

  const handlePrev = () => {
    if (products.length === 0) return
    setDirection(-1)
    setCurrentIndex((prevIndex) => (prevIndex - 1 + products.length) % products.length)
  }

  // Autoplay functionality
  useEffect(() => {
    if (products.length === 0 || isHovered) return
    const interval = setInterval(() => {
      handleNext()
    }, 4000)
    return () => clearInterval(interval)
  }, [products, isHovered, currentIndex])

  const slideVariants = {
    enter: (dir) => ({
      x: dir > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.95
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.35 },
        scale: { duration: 0.35 }
      }
    },
    exit: (dir) => ({
      x: dir < 0 ? 300 : -300,
      opacity: 0,
      scale: 0.95,
      transition: {
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.25 },
        scale: { duration: 0.25 }
      }
    })
  }

  const currentProduct = products[currentIndex]

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

          {/* Right Column: Interactive Product Showcase Carousel */}
          <div className="col-span-1 lg:col-span-6 xl:col-span-7 w-full">
            <div
              className="relative w-full h-[280px] sm:h-[380px] lg:h-[500px] xl:h-[560px] flex items-center justify-center rounded-[24px] sm:rounded-[32px] border border-slate-100/80 overflow-hidden p-4 sm:p-8 group/carousel"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              {loading ? (
                <div className="flex flex-col items-center justify-center gap-4 text-slate-400">
                  <Loader2 className="w-8 h-8 animate-spin text-artisan-grey" />
                  <span className="text-xs font-mono tracking-widest uppercase">Loading Showcase...</span>
                </div>
              ) : products.length > 0 && currentProduct ? (
                <>
                  {/* Navigation Arrows */}
                  <button
                    onClick={handlePrev}
                    className="absolute left-3 sm:left-6 z-30 p-2 sm:p-3.5 rounded-full backdrop-blur-md border border-white/40 text-slate-700 shadow-md hover:bg-white/80 hover:text-artisan-grey hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer opacity-100 lg:opacity-0 lg:group-hover/carousel:opacity-100"
                    aria-label="Previous Product"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <button
                    onClick={handleNext}
                    className="absolute right-3 sm:right-6 z-30 p-2 sm:p-3.5 rounded-full bg-white/40 backdrop-blur-md border border-white/40 text-slate-700 shadow-md hover:bg-white/80 hover:text-artisan-grey hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer opacity-100 lg:opacity-0 lg:group-hover/carousel:opacity-100"
                    aria-label="Next Product"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>

                  {/* Carousel Sliding Content */}
                  <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                    <AnimatePresence initial={false} custom={direction} mode="popLayout">
                      <motion.div
                        key={currentIndex}
                        custom={direction}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        <Link
                          to={`/product/${currentProduct._id}`}
                          className="w-full h-full flex items-center justify-center p-8 sm:p-12 select-none"
                          draggable={false}
                        >
                          <motion.img
                            src={currentProduct.image || currentProduct.images?.[0]}
                            alt={currentProduct.name}
                            className="max-h-[160px] sm:max-h-[220px] lg:max-h-[280px] xl:max-h-[340px] w-auto object-contain drop-shadow-[0_15px_35px_rgba(0,26,112,0.06)]"
                            draggable={false}
                            animate={{ scale: isHovered ? 0.95 : 1 }}
                            transition={{ duration: 0.4 }}
                          />
                        </Link>
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  {/* Details Panel — Always Visible */}
                  <motion.div
                    key={`info-${currentIndex}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute bottom-3 left-3 right-3 sm:bottom-6 sm:left-6 sm:right-6 z-20 backdrop-blur-md bg-white/85 border border-white/45 shadow-[0_15px_30px_rgba(0,0,0,0.05)] rounded-xl sm:rounded-2xl p-4 sm:p-6 text-left"
                  >
                    <div className="flex justify-between items-start gap-4 mb-2">
                      <div>
                        <span className="text-[9px] font-mono font-bold tracking-widest text-artisan-grey uppercase bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100/80">
                          {currentProduct.category}
                        </span>
                        <h3 className="text-sm sm:text-base font-display font-black text-artisan-light uppercase tracking-tight mt-1 sm:mt-2 leading-tight">
                          {currentProduct.name}
                        </h3>
                      </div>
                      <span className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${currentProduct.availability?.toLowerCase().includes('in stock')
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                        : 'bg-rose-50 text-rose-700 border border-rose-100'
                        }`}>
                        {currentProduct.availability || 'Available'}
                      </span>
                    </div>
                    <p className="text-[10px] sm:text-xs text-artisan-light/65 line-clamp-2 leading-relaxed">
                      {currentProduct.desc || currentProduct.description || 'Premium surgical & medical equipment engineered for reliability.'}
                    </p>
                  </motion.div>
                </>
              ) : null}
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
