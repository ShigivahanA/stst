import { useRef, useState, useEffect } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { ArrowUpRight, Star, MapPin, Wrench, Loader2 } from 'lucide-react'
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
            {CATEGORIES.map((cat) => (
              <motion.button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-4 py-2 border text-[10px] font-mono font-bold uppercase tracking-widest transition-colors duration-300 rounded-full ${activeCategory === cat
                  ? 'bg-artisan-grey text-artisan-dark border-artisan-grey'
                  : 'border-artisan-light/10 bg-artisan-dark/40 backdrop-blur-sm text-artisan-light hover:bg-artisan-grey hover:text-artisan-dark hover:border-artisan-grey'
                  }`}
              >
                {cat}
              </motion.button>
            ))}
          </motion.div>
        </div>

        {/* Tools Catalog Grid */}
        <div ref={ref} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 flex-1">
          {loading ? (
            <div className="col-span-full flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-artisan-grey animate-spin" />
            </div>
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
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-10 py-4 bg-artisan-light text-artisan-dark font-display font-extrabold uppercase tracking-widest text-[10px] hover:bg-artisan-grey hover:text-artisan-dark transition-all duration-500 rounded-full"
            >
              View All Products
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
