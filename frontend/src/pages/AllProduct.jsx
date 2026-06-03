import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useSearchParams } from 'react-router-dom'
import {
  Search,
  Filter,
  X,
  ChevronDown,
  Plus,
  Loader2,
  PackageSearch
} from 'lucide-react'
import ToolCard from '../components/marketplace/ToolCard'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

const categories = ['All', 'Rehabilitation', 'Respiratory', 'Diagnostic Tools', 'Elder Care', 'Mother & Baby', 'Pain Relief', 'Wound Care']

export default function AllProduct() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const initialCategory = searchParams.get('category') || 'All'
  const initialSearch = searchParams.get('search') || ''

  const [tools, setTools] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState(initialCategory)
  const [searchQuery, setSearchQuery] = useState(initialSearch)
  const [loginTime, setLoginTime] = useState(null)

  useEffect(() => {
    if (user) {
      let storedTime = sessionStorage.getItem(`login_time_${user._id}`)
      if (!storedTime) {
        storedTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        sessionStorage.setItem(`login_time_${user._id}`, storedTime)
      }
      setLoginTime(storedTime)
    } else {
      setLoginTime(null)
    }
  }, [user])

  useEffect(() => {
    const category = searchParams.get('category') || 'All'
    const search = searchParams.get('search') || ''
    setActiveCategory(category)
    setSearchQuery(search)
  }, [searchParams])

  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false)
  const [priceRange, setPriceRange] = useState({ min: 0, max: 25000 })
  const [sortBy, setSortBy] = useState('-averageRating')
  const [stats, setStats] = useState({ users: 0, listings: 0 })

  const fetchTools = async () => {
    try {
      setLoading(true)
      const params = {}
      if (activeCategory !== 'All') params.category = activeCategory
      if (searchQuery) params.keyword = searchQuery
      if (priceRange.min > 0) params['price[gte]'] = priceRange.min
      if (priceRange.max < 25000) params['price[lte]'] = priceRange.max
      if (sortBy) params.sort = sortBy

      const res = await api.get('/listings', { params })
      const fetchedTools = res.data.data || []
      setTools(fetchedTools)
    } catch (err) {
      console.error('Failed to fetch tools', err)
      setTools([])
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const res = await api.get('/listings/stats')
      setStats(res.data.data)
    } catch (err) {
      console.error('Failed to fetch stats', err)
    }
  }

  // Debounced search / filter trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTools()
    }, 400)
    return () => clearTimeout(timer)
  }, [activeCategory, searchQuery, priceRange, sortBy])

  useEffect(() => {
    fetchStats()
  }, [])

  const FilterContent = () => (
    <div className="space-y-8 lg:space-y-10">
      <div className="space-y-4">
        <span className="text-[10px] font-mono font-bold text-artisan-grey uppercase tracking-[0.4em]">Category</span>
        <div className="relative">
          <button
            onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
            className="w-full flex items-center justify-between p-4 border border-artisan-light/10 text-[10px] font-bold uppercase tracking-widest hover:border-artisan-grey transition-all"
          >
            {activeCategory}
            <ChevronDown className={`w-4 h-4 transition-transform ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence>
            {isCategoryDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 w-full mt-2 bg-artisan-dark border border-artisan-light/10 z-50 overflow-hidden shadow-2xl"
              >
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => {
                      setActiveCategory(cat)
                      setIsCategoryDropdownOpen(false)
                      setIsFilterOpen(false)
                    }}
                    className="w-full text-left p-4 text-[10px] font-bold uppercase tracking-widest hover:bg-artisan-grey hover:text-artisan-dark transition-all"
                  >
                    {cat}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="space-y-4 pt-8 lg:pt-10 border-t border-artisan-light/5">
        <span className="text-[10px] font-mono font-bold text-artisan-grey uppercase tracking-[0.4em]">Price Range (₹)</span>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <span className="text-[8px] font-mono text-artisan-grey uppercase tracking-widest">Min</span>
            <input
              type="number"
              placeholder="0"
              value={priceRange.min}
              onChange={(e) => setPriceRange({ ...priceRange, min: Number(e.target.value) })}
              className="w-full bg-artisan-light/5 border border-artisan-light/10 p-3 text-xs font-bold text-artisan-light outline-none focus:border-artisan-grey transition-all"
            />
          </div>
          <div className="space-y-2">
            <span className="text-[8px] font-mono text-artisan-grey uppercase tracking-widest">Max</span>
            <input
              type="number"
              placeholder="10000"
              value={priceRange.max}
              onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
              className="w-full bg-artisan-light/5 border border-artisan-light/10 p-3 text-xs font-bold text-artisan-light outline-none focus:border-artisan-grey transition-all"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-8 lg:pt-10 border-t border-artisan-light/5">
        <span className="text-[10px] font-mono font-bold text-artisan-grey uppercase tracking-[0.4em]">Sort By</span>
        <div className="space-y-3">
          {[
            { id: '-averageRating', label: 'Rating: High to Low' },
            { id: 'averageRating', label: 'Rating: Low to High' },
            { id: '-price', label: 'Price: High to Low' },
            { id: 'price', label: 'Price: Low to High' }
          ].map(opt => (
            <label key={opt.id} className="flex items-center gap-4 cursor-pointer group">
              <div className="relative w-5 h-5 flex items-center justify-center">
                <input
                  type="radio"
                  name="sortBy"
                  className="peer hidden"
                  checked={sortBy === opt.id}
                  onChange={() => setSortBy(opt.id)}
                />
                <div className="absolute inset-0 border border-artisan-light/10 group-hover:border-artisan-grey peer-checked:border-artisan-grey peer-checked:bg-artisan-grey transition-all" />
                <div className="relative z-10 opacity-0 peer-checked:opacity-100 transition-opacity">
                  <div className="w-2 h-2 bg-artisan-dark" />
                </div>
              </div>
              <span className="text-[10px] font-mono text-artisan-light/30 group-hover:text-artisan-light peer-checked:text-artisan-light uppercase tracking-widest transition-colors">
                {opt.label}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-artisan-dark text-artisan-light font-display bg-noise relative flex flex-col pt-20 md:pt-24 lg:pt-28">

      <div className="flex flex-col lg:flex-row flex-1">

        {/* Sidebar Filters - Desktop */}
        <aside className="hidden lg:flex w-64 xl:w-72 border-r border-artisan-light/5 flex-col sticky top-28 h-[calc(100vh-112px)] p-6 xl:p-8 shrink-0">
          <FilterContent />
          <div className="mt-auto pt-8 border-t border-artisan-light/5 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[8px] font-mono text-artisan-grey uppercase tracking-widest">Available now</span>
              <span className="text-xs font-bold text-artisan-light">{tools.length}</span>
            </div>
            <div className="w-full h-0.5 bg-artisan-light/5 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((tools.length / 20) * 100, 100)}%` }}
                className="h-full bg-artisan-grey"
              />
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-8 lg:p-12 overflow-x-hidden">

          <header className="mb-8 md:mb-16">
            <div className="flex flex-col gap-6 md:gap-12">
              <div className="space-y-2">
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-[8px] md:text-[10px] font-mono font-bold text-artisan-grey uppercase tracking-[0.4em] md:tracking-[0.8em] block mb-2 md:mb-4"
                >
                  Explore Surgical Products
                </motion.span>
                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-extrabold uppercase tracking-tighter leading-none text-artisan-light break-words"
                >
                  ALL <br />
                  <span className="text-outline">PRODUCTS.</span>
                </motion.h1>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsFilterOpen(true)}
                  className="lg:hidden flex items-center gap-3 px-6 py-4 bg-artisan-grey text-artisan-dark text-[10px] font-bold uppercase tracking-widest hover:bg-artisan-light transition-all shrink-0"
                >
                  <Filter className="w-4 h-4" />
                  Filters
                </button>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex-1 relative group"
                >
                  <Search className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-4 h-4 md:w-6 md:h-6 text-artisan-light/10 group-focus-within:text-artisan-grey transition-all" />
                  <input
                    type="text"
                    placeholder="SEARCH PRODUCTS (E.G. WHEELCHAIR, NEBULIZER, STETHOSCOPE)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent border-b border-artisan-light/5 p-4 md:p-8 pl-12 md:pl-20 outline-none font-display font-bold uppercase text-base md:text-lg lg:text-xl text-artisan-light placeholder:text-artisan-light/5 focus:border-artisan-grey transition-all"
                  />
                </motion.div>
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-8 pb-12 min-h-[400px]">
            {loading ? (
              <div className="col-span-full flex flex-col items-center justify-center space-y-4 py-20">
                <Loader2 className="w-12 h-12 text-artisan-grey animate-spin" />
                <span className="text-[10px] font-mono text-artisan-light/20 uppercase tracking-widest">Scanning inventory...</span>
              </div>
            ) : tools.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center space-y-6 py-20 border border-dashed border-artisan-light/10">
                <PackageSearch className="w-16 h-16 text-artisan-light/5" />
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-display font-black uppercase text-artisan-light/40">No Products Found</h3>
                  <p className="text-[10px] font-mono text-artisan-light/20 uppercase tracking-widest">Try adjusting your filters or search terms</p>
                </div>
                <button
                  onClick={() => {
                    setActiveCategory('All')
                    setSearchQuery('')
                    setPriceRange({ min: 0, max: 25000 })
                  }}
                  className="text-[10px] font-mono font-bold text-artisan-grey hover:text-artisan-light uppercase underline tracking-widest"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {tools.map((tool, idx) => (
                  <ToolCard key={tool._id} tool={tool} idx={idx} />
                ))}
              </AnimatePresence>
            )}
          </div>

          <footer className="mt-20 border-t border-artisan-light/5 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            <div className="space-y-2">
              <span className="text-[8px] font-mono text-artisan-grey uppercase tracking-widest block">Active Login Time</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl md:text-4xl font-display font-extrabold text-artisan-light">
                  {user ? loginTime || '...' : 'GUEST'}
                </span>
                <span className="text-[8px] font-mono text-artisan-grey uppercase tracking-widest">
                  {user ? 'SESSION' : 'N/A'}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <span className="text-[8px] font-mono text-artisan-grey uppercase tracking-widest block">Products Available</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl md:text-4xl font-display font-extrabold text-artisan-light">{stats.listings.toLocaleString()}</span>
                <span className="text-[8px] font-mono text-artisan-grey uppercase tracking-widest">Verified</span>
              </div>
            </div>
            <div className="space-y-2">
              <span className="text-[8px] font-mono text-artisan-grey uppercase tracking-widest block">About</span>
              <p className="text-[8px] font-mono text-artisan-light/30 uppercase leading-relaxed tracking-wider max-w-xs">
                Your trusted partner for rehabilitation equipment, respiratory care products, and diagnostic tools. Serving hospitals and clinics across India.
              </p>
            </div>
          </footer>
        </main>
      </div>

      <AnimatePresence>
        {isFilterOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterOpen(false)}
              className="fixed inset-0 bg-artisan-dark/80 backdrop-blur-sm z-[110] lg:hidden"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 w-full bg-artisan-dark border-t border-artisan-light/10 z-[120] p-8 lg:hidden max-h-[85vh] overflow-y-auto scrollbar-hide"
            >
              <div className="flex justify-between items-center mb-8 pb-4 border-b border-artisan-light/5">
                <h2 className="text-2xl font-display font-extrabold uppercase text-artisan-light">Refine Search</h2>
                <button onClick={() => setIsFilterOpen(false)} className="p-2 text-artisan-grey hover:text-artisan-light">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <FilterContent />
              <button
                onClick={() => setIsFilterOpen(false)}
                className="w-full mt-12 py-6 bg-artisan-grey text-artisan-dark font-display font-extrabold uppercase tracking-widest"
              >
                Apply Filters
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
