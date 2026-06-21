import { useRef, useState, useEffect } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { ArrowUpRight, Star, MapPin, Wrench } from 'lucide-react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import ToolCard from '../marketplace/ToolCard'

const CATEGORIES = ['All', 'Rehabilitation', 'Respiratory', 'Diagnostic Tools', 'Elder Care', 'Wound Care']


export default function FeaturedTools() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const [activeCategory, setActiveCategory] = useState('All')
  const [tools, setTools] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFeaturedTools = async () => {
      try {
        setLoading(true)
        const params = {
          limit: 4,
          sort: '-averageRating',
          status: 'approved',
          isActive: true
        }
        if (activeCategory !== 'All') {
          params.category = activeCategory
        }

        const res = await api.get('/listings', { params })
        const fetchedTools = res.data.data || []
        setTools(fetchedTools.slice(0, 4))
      } catch (err) {
        console.error('Failed to fetch featured products', err)
        setTools([])
      } finally {
        setLoading(false)
      }
    }
    fetchFeaturedTools()
  }, [activeCategory])

  return (
    <section
      id="featured-tools"
      className="bg-transparent bg-noise border-b-2 border-artisan-light min-h-screen py-20 lg:py-28 flex flex-col justify-center relative overflow-hidden"
    >
      <div className="container-custom w-full relative z-10">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6 lg:mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="max-w-4xl"
          >
            <span className="text-xs font-mono font-bold uppercase tracking-[0.4em] text-artisan-grey mb-2 block">Product Catalogue</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-extrabold uppercase tracking-tighter leading-[0.85] text-artisan-light">
              Featured <br />
              <span className="text-outline">Products.</span>
            </h2>
          </motion.div>

          {/* Categories Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-wrap gap-2 justify-start md:justify-end max-w-xl"
          >
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <motion.button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`relative overflow-hidden group px-4 py-2 border text-[10px] font-mono font-bold uppercase tracking-widest transition-all duration-300 rounded-full cursor-pointer ${
                    isActive
                      ? 'bg-artisan-grey text-artisan-dark border-artisan-grey'
                      : 'border-artisan-light/10 text-artisan-light hover:text-artisan-dark hover:border-artisan-grey'
                  }`}
                >
                  {!isActive && (
                    <div className="absolute inset-0 bg-artisan-dark/40 backdrop-blur-sm" />
                  )}
                  {!isActive && (
                    <div className="absolute inset-y-0 left-0 w-0 bg-artisan-grey transition-all duration-300 ease-out group-hover:w-full" />
                  )}
                  <span className="relative z-10">{cat}</span>
                </motion.button>
              );
            })}
          </motion.div>
        </div>

        {/* Tools Catalog Grid */}
        <div ref={ref} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 flex-1">
          {loading ? (
            <>
              {[1, 2, 3, 4].map((i) => (
                <div key={`skeleton-${i}`} className="flex flex-col bg-artisan-dark/40 backdrop-blur-sm border border-artisan-light/10 h-full rounded-2xl overflow-hidden animate-pulse">
                  {/* Image Area Skeleton */}
                  <div className="relative aspect-video w-full bg-artisan-light/5 shrink-0">
                    <div className="absolute top-3 left-3">
                      <div className="h-4 w-16 bg-artisan-light/10 rounded-md" />
                    </div>
                    <div className="absolute top-3 right-3">
                      <div className="w-7 h-7 bg-artisan-light/5 rounded-full" />
                    </div>
                  </div>

                  {/* Content Area Skeleton */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between bg-gradient-to-b from-transparent to-artisan-dark/40">
                    <div className="mb-4 space-y-2">
                      {/* Title lines */}
                      <div className="h-4 bg-artisan-light/10 rounded w-5/6" />
                      <div className="h-3.5 bg-artisan-light/8 rounded w-3/5" />
                      {/* Description line */}
                      <div className="h-2.5 bg-artisan-light/5 rounded w-4/5 mt-1" />
                    </div>

                    {/* Price & Rating footer */}
                    <div className="pt-3 border-t border-artisan-light/5 flex items-center justify-between mt-auto">
                      <div className="flex flex-col gap-1.5">
                        <div className="h-2 bg-artisan-light/5 rounded w-8" />
                        <div className="h-5 bg-artisan-light/10 rounded w-20" />
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-artisan-light/10 rounded-full" />
                        <div className="h-3 bg-artisan-light/10 rounded w-6" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <AnimatePresence mode="wait">
              {tools.length > 0 ? (
                tools.slice(0, 4).map((tool, i) => (
                  <ToolCard key={tool._id} tool={tool} idx={i} />
                ))
              ) : (
                <div className="col-span-full py-12 text-center border border-artisan-light/10 bg-artisan-light/[0.01]">
                  <p className="text-xs font-mono text-artisan-light/20 uppercase tracking-[0.4em]">No products found in this category yet.</p>
                </div>
              )}
            </AnimatePresence>
          )}
        </div>

        {/* Catalog Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.8 }}
          className="mt-6 flex justify-center"
        >
          <Link to="/allproduct">
            <motion.button
              className="px-10 py-4 bg-artisan-grey text-artisan-dark font-display font-black uppercase tracking-widest text-[10px] border border-artisan-light rounded-full cursor-pointer flex items-center justify-center"
              initial={{ y: 0, boxShadow: "0 6px 0 0 #252422", backgroundColor: "#eb5e28", color: "#fffcf2", borderColor: "#252422" }}
              animate={{ y: 0, boxShadow: "0 6px 0 0 #252422", backgroundColor: "#eb5e28", color: "#fffcf2", borderColor: "#252422" }}
              whileHover={{ 
                 y: -2,
                 boxShadow: "0 8px 0 0 #252422",
                 backgroundColor: "#fffcf2",
                 color: "#252422",
                 borderColor: "#252422"
              }}
              whileTap={{ 
                 y: 6,
                 boxShadow: "0 0px 0 0 #252422"
              }}
              transition={{ type: "spring", stiffness: 600, damping: 18 }}
            >
              View All Products
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
