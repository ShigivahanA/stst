import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useSearchParams } from 'react-router-dom'
import {
  Search,
  Filter,
  X,
  ChevronDown,
  Plus,
  Loader2,
  PackageSearch,
  Package,
  PackageX
} from 'lucide-react'
import ToolCard from '../components/marketplace/ToolCard'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import SEO from '../components/SEO'

const categories = ['All', 'Rehabilitation', 'Respiratory', 'Diagnostic Tools', 'Elder Care', 'Mother & Baby', 'Pain Relief', 'Wound Care']

function FilterContent({
  activeCategory,
  setActiveCategory,
  isCategoryDropdownOpen,
  setIsCategoryDropdownOpen,
  setIsFilterOpen,
  minInput,
  setMinInput,
  maxInput,
  setMaxInput,
  priceRange,
  setPriceRange,
  availability,
  setAvailability,
  sortBy,
  setSortBy
}) {
  const handleMinBlur = () => {
    const val = minInput === '' ? 0 : Number(minInput)
    if (val !== priceRange.min) {
      setPriceRange(prev => ({ ...prev, min: val }))
    }
  }

  const handleMinKeyDown = (e) => {
    if (e.key === 'Enter') {
      const val = minInput === '' ? 0 : Number(minInput)
      if (val !== priceRange.min) {
        setPriceRange(prev => ({ ...prev, min: val }))
      }
    }
  }

  const handleMaxBlur = () => {
    const val = maxInput === '' ? 100000 : Number(maxInput)
    if (val !== priceRange.max) {
      setPriceRange(prev => ({ ...prev, max: val }))
    }
  }

  const handleMaxKeyDown = (e) => {
    if (e.key === 'Enter') {
      const val = maxInput === '' ? 100000 : Number(maxInput)
      if (val !== priceRange.max) {
        setPriceRange(prev => ({ ...prev, max: val }))
      }
    }
  }

  return (
    <div className="flex flex-col gap-0">
      {/* Category */}
      <div className="space-y-3 pb-6">
        <span className="text-[10px] font-mono font-bold text-artisan-grey uppercase tracking-[0.4em]">Category</span>
        <div className="relative">
          <button
            onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
            className="w-full flex items-center justify-between p-4 border border-artisan-light/10 text-[10px] font-bold uppercase tracking-widest hover:border-artisan-grey rounded-xl transition-all"
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

      {/* Price Range */}
      <div className="space-y-3 py-6 border-t border-artisan-light/5">
        <span className="text-[10px] font-mono font-bold text-artisan-grey uppercase tracking-[0.4em]">Price Range (₹)</span>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <span className="text-[8px] font-mono text-artisan-grey uppercase tracking-widest">Min</span>
            <input
              type="number"
              placeholder="0"
              value={minInput}
              onChange={(e) => setMinInput(e.target.value)}
              onBlur={handleMinBlur}
              onKeyDown={handleMinKeyDown}
              className="w-full bg-artisan-light/5 border border-artisan-light/10 rounded-xl p-3 text-xs font-bold text-artisan-light outline-none focus:border-artisan-grey transition-all"
            />
          </div>
          <div className="space-y-2">
            <span className="text-[8px] font-mono text-artisan-grey uppercase tracking-widest">Max</span>
            <input
              type="number"
              placeholder="100000"
              value={maxInput}
              onChange={(e) => setMaxInput(e.target.value)}
              onBlur={handleMaxBlur}
              onKeyDown={handleMaxKeyDown}
              className="w-full bg-artisan-light/5 border border-artisan-light/10 rounded-xl p-3 text-xs font-bold text-artisan-light outline-none focus:border-artisan-grey transition-all"
            />
          </div>
        </div>
      </div>

      {/* Availability */}
      <div className="space-y-3 py-6 border-t border-artisan-light/5">
        <span className="text-[10px] font-mono font-bold text-artisan-grey uppercase tracking-[0.4em]">Availability</span>
        <div className="space-y-3">
          {[
            { id: 'all', label: 'All Products' },
            { id: 'inStock', label: 'In Stock' },
            { id: 'outOfStock', label: 'Out of Stock' }
          ].map(opt => (
            <label key={opt.id} className="flex items-center gap-4 cursor-pointer group">
              <div className="relative w-5 h-5 flex items-center justify-center">
                <input
                  type="radio"
                  name="availability"
                  className="peer hidden"
                  checked={availability === opt.id}
                  onChange={() => setAvailability(opt.id)}
                />
                <div className="absolute inset-0 border rounded-full border-artisan-light/10 group-hover:border-artisan-grey peer-checked:border-artisan-grey peer-checked:bg-artisan-grey transition-all" />
                <div className="relative z-10 opacity-0 peer-checked:opacity-100 transition-opacity">
                  <div className="w-2 h-2 bg-artisan-dark rounded-full" />
                </div>
              </div>
              <span className="text-[10px] font-mono text-artisan-light/50 group-hover:text-artisan-light peer-checked:text-artisan-light uppercase tracking-widest transition-colors flex items-center gap-2">
                {opt.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Sort By */}
      <div className="space-y-3 py-6 border-t border-artisan-light/5">
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
                <div className="absolute inset-0 border rounded-full border-artisan-light/10 group-hover:border-artisan-grey peer-checked:border-artisan-grey peer-checked:bg-artisan-grey transition-all" />
                <div className="relative z-10 opacity-0 peer-checked:opacity-100 transition-opacity">
                  <div className="w-2 h-2 bg-artisan-dark rounded-full" />
                </div>
              </div>
              <span className="text-[10px] font-mono text-artisan-light/50 group-hover:text-artisan-light peer-checked:text-artisan-light uppercase tracking-widest transition-colors">
                {opt.label}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}

// Sub-component for individual tool card skeleton loading state
const ToolCardSkeleton = () => {
  return (
    <div className="flex flex-col bg-artisan-dark/40 backdrop-blur-sm border border-artisan-light/15 h-full rounded-2xl overflow-hidden relative animate-strong-pulse">
      {/* Image Area Placeholder */}
      <div className="relative aspect-video w-full bg-artisan-light/10 shrink-0">
        {/* Top Overlay Badge Placeholder */}
        <div className="absolute top-3 left-3 flex items-start">
          <div className="h-5 bg-artisan-light/15 rounded w-16" />
        </div>
        {/* Top Overlay Action Placeholder */}
        <div className="absolute top-3 right-3 flex items-start">
          <div className="w-7 h-7 bg-artisan-light/15 rounded-full" />
        </div>
      </div>

      {/* Content Area Placeholder */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between bg-gradient-to-b from-transparent to-artisan-dark/40">
        <div className="mb-4 space-y-2">
          {/* Title lines */}
          <div className="h-4 bg-artisan-light/15 rounded w-5/6" />
          <div className="h-4 bg-artisan-light/15 rounded w-2/3" />
          {/* Description line */}
          <div className="h-3 bg-artisan-light/10 rounded w-full mt-2" />
        </div>

        <div className="pt-3 border-t border-artisan-light/5 flex items-center justify-between mt-auto">
          {/* Price */}
          <div className="flex flex-col gap-1">
            <div className="h-2.5 bg-artisan-light/10 rounded w-8" />
            <div className="h-5 bg-artisan-light/15 rounded w-20" />
          </div>
          {/* Rating */}
          <div className="flex items-center gap-1">
            <div className="w-3.5 h-3.5 bg-artisan-light/15 rounded" />
            <div className="h-3.5 bg-artisan-light/15 rounded w-6" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AllProduct() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const initialCategory = searchParams.get('category') || 'All'
  const initialSearch = searchParams.get('search') || ''
  const initialPage = Number(searchParams.get('page')) || 1

  const [tools, setTools] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState(initialCategory)
  const [searchQuery, setSearchQuery] = useState(initialSearch)
  const [loginTime, setLoginTime] = useState(null)

  const containerRef = useRef(null)
  const [containerHeight, setContainerHeight] = useState('auto')

  const startLoading = () => {
    if (containerRef.current) {
      setContainerHeight(`${containerRef.current.offsetHeight}px`)
    }
    setLoading(true)
  }

  // Paging Navigation States
  const [navPage, setNavPage] = useState(initialPage)
  const [totalFiltered, setTotalFiltered] = useState(0)
  const isInitialMount = useRef(true)

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
    const page = Number(searchParams.get('page')) || 1
    setActiveCategory(category)
    setSearchQuery(search)
    setNavPage(page)
  }, [searchParams])

  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false)
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100000 })
  const [sortBy, setSortBy] = useState('-averageRating')
  const [availability, setAvailability] = useState('all')
  const [stats, setStats] = useState({ users: 0, listings: 0 })

  const [minInput, setMinInput] = useState(priceRange.min === 0 ? '' : priceRange.min.toString())
  const [maxInput, setMaxInput] = useState(priceRange.max === 100000 ? '' : priceRange.max.toString())

  useEffect(() => {
    setMinInput(priceRange.min === 0 ? '' : priceRange.min.toString())
    setMaxInput(priceRange.max === 100000 ? '' : priceRange.max.toString())
  }, [priceRange])

  const fetchTools = async (pageNum = 1) => {
    try {
      startLoading()

      const params = {
        page: pageNum,
        limit: 20
      }
      if (activeCategory !== 'All') params.category = activeCategory
      if (searchQuery) params.keyword = searchQuery
      if (priceRange.min > 0) {
        params.minPrice = priceRange.min
        params['price[gte]'] = priceRange.min
      }
      if (priceRange.max > 0) {
        params.maxPrice = priceRange.max
        params['price[lte]'] = priceRange.max
      }
      if (sortBy) params.sort = sortBy
      if (availability !== 'all') params.availability = availability

      const res = await api.get('/listings', { params })
      const fetchedTools = res.data.data || []

      const totalCount = parseInt(res.headers['x-total-count']) || fetchedTools.length
      setTotalFiltered(totalCount)
      setTools(fetchedTools)
    } catch (err) {
      console.error('Failed to fetch tools', err)
      setTools([])
    } finally {
      setLoading(false)
      setContainerHeight('auto')
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
    startLoading()
    const timer = setTimeout(() => {
      const newParams = new URLSearchParams(searchParams)
      newParams.set('category', activeCategory)
      if (searchQuery) {
        newParams.set('search', searchQuery)
      } else {
        newParams.delete('search')
      }

      if (isInitialMount.current) {
        isInitialMount.current = false
        fetchTools(navPage)
      } else {
        setNavPage(1)
        newParams.set('page', '1')
        fetchTools(1)
      }

      setSearchParams(newParams)
    }, 400)
    return () => clearTimeout(timer)
  }, [activeCategory, searchQuery, priceRange, sortBy, availability])

  const handlePageChange = (pageNum) => {
    setNavPage(pageNum)
    fetchTools(pageNum)

    const newParams = new URLSearchParams(searchParams)
    newParams.set('page', pageNum.toString())
    setSearchParams(newParams)

    window.scrollTo({ top: 250, behavior: 'smooth' })
  }

  useEffect(() => {
    fetchStats()
  }, [])

  const filterProps = {
    activeCategory,
    setActiveCategory,
    isCategoryDropdownOpen,
    setIsCategoryDropdownOpen,
    setIsFilterOpen,
    minInput,
    setMinInput,
    maxInput,
    setMaxInput,
    priceRange,
    setPriceRange,
    availability,
    setAvailability,
    sortBy,
    setSortBy
  }

  return (
    <div className="min-h-screen bg-artisan-dark text-artisan-light font-display bg-noise relative flex flex-col pt-16 md:pt-20 lg:pt-20">
      <SEO
        title={activeCategory !== 'All' ? `${activeCategory} Products` : 'Surgical Supplies & Medical Catalog'}
        description={`Browse our premium selection of ${activeCategory !== 'All' ? activeCategory.toLowerCase() : 'surgical supplies, diagnostic equipment, and medical'} tools. Secure checkout and reliable delivery across India.`}
        keywords={[activeCategory.toLowerCase(), 'surgical supplies catalog', 'buy medical tools online', 'medical equipment vendor']}
        canonicalPath={activeCategory !== 'All' ? `/allproduct?category=${encodeURIComponent(activeCategory)}` : '/allproduct'}
      />

      <div className="flex flex-col lg:flex-row flex-1">

        {/* Sidebar Filters - Desktop */}
        <aside className="hidden lg:flex w-64 xl:w-72 border-r border-artisan-light/5 flex-col sticky top-24 lg:top-28 self-start p-6 xl:p-8 shrink-0">
          <FilterContent {...filterProps} />
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-8 lg:px-12 lg:py-8 overflow-x-hidden">

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
                  className="lg:hidden flex items-center gap-3 px-6 py-4 bg-artisan-grey rounded-full text-artisan-dark text-[10px] font-bold uppercase tracking-widest hover:bg-artisan-light transition-all shrink-0"
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
                    placeholder="SEARCH BY NAME, SKU, OR BRAND..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent border-b border-artisan-light/5 p-4 md:p-8 pl-12 md:pl-20 outline-none font-display font-bold uppercase text-sm md:text-lg lg:text-xl text-artisan-light placeholder:text-artisan-light/5 focus:border-artisan-grey transition-all"
                  />
                </motion.div>
              </div>
            </div>
          </header>

          <div
            ref={containerRef}
            style={{ minHeight: containerHeight }}
            className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-8 pb-12 min-h-[400px]"
          >
            {loading ? (
              Array.from({ length: 8 }).map((_, idx) => (
                <ToolCardSkeleton key={`skeleton-${idx}`} />
              ))
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
                    setPriceRange({ min: 0, max: 100000 })
                    setAvailability('all')
                  }}
                  className="text-[10px] font-mono font-bold text-artisan-grey hover:text-artisan-light uppercase underline tracking-widest"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              tools.map((tool, idx) => (
                <ToolCard key={tool._id} tool={tool} idx={idx} />
              ))
            )}
          </div>

          {/* PAGINATION PROGRESS BAR & STATUS */}
          {tools.length > 0 && (
            <div className="border-t border-artisan-light/5 mt-16 pt-12 pb-8 flex flex-col items-center gap-6">

              {/* Progress metrics */}
              <div className="flex flex-col sm:flex-row items-center justify-between w-full max-w-4xl text-[10px] font-mono uppercase tracking-[0.2em] text-artisan-light/40">
                <div>
                  Showing <span className="text-artisan-grey font-bold">{tools.length}</span> of <span className="text-artisan-light font-bold">{totalFiltered}</span> Products
                </div>
                <div className="mt-2 sm:mt-0">
                  Page <span className="text-artisan-grey font-bold">{navPage}</span> of <span className="text-artisan-light font-bold">{Math.ceil(totalFiltered / 20) || 1}</span>
                </div>
              </div>

              {/* Progress line indicator */}
              <div className="w-full max-w-4xl h-[2px] bg-artisan-light/5 relative overflow-hidden">
                <motion.div
                  className="absolute left-0 top-0 h-full bg-artisan-grey"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (tools.length / (totalFiltered || 1)) * 100)}%` }}
                  transition={{ duration: 0.4 }}
                  layout
                />
              </div>

              {/* Status details */}
              <div className="h-8 flex items-center justify-center">
                {loading ? (
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-4 h-4 text-artisan-grey animate-spin" />
                    <span className="text-[10px] font-mono text-artisan-light/50 uppercase tracking-widest">Loading page...</span>
                  </div>
                ) : (
                  <span className="text-[10px] font-mono text-artisan-grey uppercase tracking-[0.2em] font-bold">
                    Page results loaded
                  </span>
                )}
              </div>

              {/* Paging Navigation Buttons */}
              <div className="flex items-center justify-center gap-2 mt-4">
                {/* Previous Button */}
                <button
                  disabled={navPage === 1 || loading}
                  onClick={() => handlePageChange(navPage - 1)}
                  className="px-4 py-2.5 border rounded-xl border-artisan-light/10 text-[9px] font-mono font-bold uppercase tracking-widest transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:border-artisan-grey hover:text-artisan-grey text-artisan-light"
                >
                  PREV
                </button>

                {/* Page Number Loop */}
                {Array.from({ length: Math.ceil(totalFiltered / 20) || 1 }).map((_, idx) => {
                  const pNum = idx + 1;
                  const isActive = navPage === pNum;
                  return (
                    <button
                      key={pNum}
                      disabled={loading}
                      onClick={() => handlePageChange(pNum)}
                      className={`w-10 h-10 border text-[9px] font-mono font-bold transition-all rounded-full ${isActive
                        ? 'bg-artisan-grey border-artisan-grey text-artisan-dark'
                        : 'border-artisan-light/10 text-artisan-light hover:border-artisan-grey hover:text-artisan-grey'
                        }`}
                    >
                      {String(pNum).padStart(2, '0')}
                    </button>
                  );
                })}

                {/* Next Button */}
                <button
                  disabled={navPage === (Math.ceil(totalFiltered / 20) || 1) || loading}
                  onClick={() => handlePageChange(navPage + 1)}
                  className="px-4 py-2.5 border rounded-xl border-artisan-light/10 text-[9px] font-mono font-bold uppercase tracking-widest transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:border-artisan-grey hover:text-artisan-grey text-artisan-light"
                >
                  NEXT
                </button>
              </div>

            </div>
          )}

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
              <p className="text-[8px] font-mono text-artisan-light/50 uppercase leading-relaxed tracking-wider max-w-xs">
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
              <FilterContent {...filterProps} />
              <button
                onClick={() => setIsFilterOpen(false)}
                className="w-full mt-12 py-6 bg-artisan-grey text-artisan-dark font-display font-extrabold uppercase tracking-widest rounded-full hover:cursor-pointer hover:scale-105 transition-all duration-300"
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
