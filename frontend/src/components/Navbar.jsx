import { useState, useEffect } from 'react'
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Activity, X, ArrowUpRight, Globe, MessageCircle, Camera, Mail, MapPin, Phone, LogOut, User as UserIcon, Search, Heart, ShoppingBag } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import logo from '../assets/logo.webp'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const { scrollY } = useScroll()
  const [isScrolled, setIsScrolled] = useState(scrollY.get() > 20)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const location = useLocation()
  const isAllProductsPage = location.pathname === '/allproduct'

  const [searchQuery, setSearchQuery] = useState('')
  const [showMobileSearch, setShowMobileSearch] = useState(false)
  const [recommendations, setRecommendations] = useState([])
  const [placeholderText, setPlaceholderText] = useState('Search products...')
  const [typewriterWords, setTypewriterWords] = useState([
    "Search Stethoscope...",
    "Search Nebulizer...",
    "Search Wheelchair...",
    "Search Oxygen Concentrator...",
    "Search Nitrile Gloves...",
    "Search Heating Pad...",
    "Search TENS Stimulator..."
  ])

  // Load product names from backend for typewriter effect
  useEffect(() => {
    const fetchProductNames = async () => {
      try {
        const res = await api.get('/listings')
        if (res.data && res.data.data && res.data.data.length > 0) {
          const names = res.data.data.map(p => `Search ${p.name}...`)
          setTypewriterWords(names)
        }
      } catch (err) {
        console.error('Failed to fetch product names for typewriter:', err)
      }
    }
    fetchProductNames()
  }, [])

  // Fetch search recommendations based on search input seamlessly
  useEffect(() => {
    if (!searchQuery.trim()) {
      setRecommendations([])
      return
    }

    const delayDebounce = setTimeout(async () => {
      try {
        const res = await api.get(`/listings?keyword=${encodeURIComponent(searchQuery.trim())}`)
        setRecommendations(res.data.data || [])
      } catch (err) {
        console.error('Error fetching search recommendations:', err)
      }
    }, 200)

    return () => clearTimeout(delayDebounce)
  }, [searchQuery])

  // Click outside listener to dismiss recommendations dropdown
  useEffect(() => {
    const handleOutsideClick = (e) => {
      const desktopForm = document.getElementById('navbar-desktop-search')
      const mobileForm = document.getElementById('navbar-mobile-search')
      const clickedDesktop = desktopForm && desktopForm.contains(e.target)
      const clickedMobile = mobileForm && mobileForm.contains(e.target)
      if (!clickedDesktop && !clickedMobile) {
        setRecommendations([])
      }
    }
    document.addEventListener('click', handleOutsideClick)
    return () => document.removeEventListener('click', handleOutsideClick)
  }, [])

  // Typewriter effect cycling through clinical products inside placeholder
  useEffect(() => {
    const words = typewriterWords
    let wordIndex = 0
    let charIndex = 0
    let isDeleting = false
    let typingSpeed = 100
    let timer

    const type = () => {
      const currentWord = words[wordIndex]
      if (!currentWord) return

      if (isDeleting) {
        setPlaceholderText(currentWord.substring(0, charIndex - 1))
        charIndex--
        typingSpeed = 50
      } else {
        setPlaceholderText(currentWord.substring(0, charIndex + 1))
        charIndex++
        typingSpeed = 100
      }

      if (!isDeleting && charIndex === currentWord.length) {
        isDeleting = true
        typingSpeed = 1500
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false
        wordIndex = (wordIndex + 1) % words.length
        typingSpeed = 500
      }

      timer = setTimeout(type, typingSpeed)
    }

    timer = setTimeout(type, typingSpeed)
    return () => clearTimeout(timer)
  }, [typewriterWords])

  useEffect(() => {
    if (isOpen) {
      setShowMobileSearch(false)
    }
  }, [isOpen])

  const [sessionDuration, setSessionDuration] = useState('00:00:00')

  useEffect(() => {
    if (!user) {
      setSessionDuration('00:00:00')
      return
    }

    const storageKey = `login_timestamp_${user._id}`
    let loginTimestamp = sessionStorage.getItem(storageKey)
    if (!loginTimestamp) {
      loginTimestamp = Date.now().toString()
      sessionStorage.setItem(storageKey, loginTimestamp)
    }

    const updateClock = () => {
      const elapsedMs = Date.now() - parseInt(loginTimestamp)
      const totalSecs = Math.floor(elapsedMs / 1000)
      const hrs = Math.floor(totalSecs / 3600).toString().padStart(2, '0')
      const mins = Math.floor((totalSecs % 3600) / 60).toString().padStart(2, '0')
      const secs = (totalSecs % 60).toString().padStart(2, '0')
      setSessionDuration(`${hrs}:${mins}:${secs}`)
    }

    updateClock()
    const interval = setInterval(updateClock, 1000)

    return () => clearInterval(interval)
  }, [user])

  const cartCount = user?.cart?.reduce((acc, curr) => acc + curr.quantity, 0) || 0
  const wishlistCount = user?.wishlist?.length || 0
  const MENU_LINKS = user?.role === 'admin'
    ? [
      { id: '01', title: 'Manage Users', href: '/admin/users' },
      { id: '02', title: 'Content', href: '/admin/content' },
      { id: '03', title: 'Promos & Enquiries', href: '/admin/marketing' },
      { id: '04', title: 'Products', href: '/admin/products' },
    ]
    : [
      { id: '01', title: 'Products', href: '/allproduct' },
      { id: '02', title: 'Categories', href: '/categories' },
      ...(user ? [
        { id: '03', title: 'My Wishlist', href: '/wishlist' },
        { id: '04', title: `My Cart${cartCount > 0 ? ` (${cartCount})` : ''}`, href: '/cart' },
      ] : [])
    ]

  // Track scroll direction to hide/show navbar
  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 20)
    const previous = scrollY.getPrevious()
    if (latest > previous && latest > 150) {
      setIsVisible(false)
    } else {
      setIsVisible(true)
    }
  })

  useEffect(() => {
    // Toggle body scroll
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }

    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [isOpen])

  const handleLogout = async () => {
    try {
      await logout()
    } catch (err) {
      console.error('Logout handler error:', err)
    }
    setIsOpen(false)
    navigate('/')
  }

  // Animation variants for the overlay
  const overlayVariants = {
    closed: {
      clipPath: 'circle(0% at calc(100% - 3rem) 3rem)',
      transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] }
    },
    opened: {
      clipPath: 'circle(150% at calc(100% - 3rem) 3rem)',
      transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] }
    }
  }

  const listVariants = {
    opened: {
      transition: { staggerChildren: 0.1, delayChildren: 0.3 }
    },
    closed: {
      transition: { staggerChildren: 0.05, staggerDirection: -1 }
    }
  }

  const linkVariants = {
    opened: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.8, ease: [0.33, 1, 0.68, 1] }
    },
    closed: {
      y: 100,
      opacity: 0,
      transition: { duration: 0.4, ease: 'easeIn' }
    }
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/allproduct?search=${encodeURIComponent(searchQuery.trim())}`)
      setShowMobileSearch(false)
    }
  }

  return (
    <>
      {/* --- Fixed Navigation Header --- */}
      <motion.header
        initial={{ y: 0 }}
        animate={{ y: (isVisible || isOpen) ? 0 : '-100%' }}
        transition={{ duration: 0.4, ease: [0.33, 1, 0.68, 1] }}
        className={`fixed top-0 left-0 w-full z-[100] transition-all duration-300 ${isScrolled && !isOpen ? 'h-14 bg-artisan-dark/90 backdrop-blur-md' : 'h-16'
          }`}
      >
        <div className="container-custom h-full flex items-center justify-between border-b border-artisan-light/5">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 relative z-[110] group/logo "
            onClick={() => {
              setIsOpen(false)
              setShowMobileSearch(false)
            }}
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2"
            >
              <img src={logo} alt="STAT Logo" className="w-9 h-9 md:w-10.5 md:h-10.5 object-contain bg-gray-400 p-0.5 rounded-full transition-all duration-300 group-hover/logo:scale-110 group-hover/logo:shadow-[0_0_10px_#eb5e28]" />
              <span className="text-xs min-[375px]:text-[13px] min-[410px]:text-sm sm:text-base md:text-lg lg:text-xl font-display font-bold uppercase tracking-[0.06em] min-[375px]:tracking-[0.08em] sm:tracking-[0.12em] md:tracking-[0.15em] whitespace-nowrap">
                <span className="text-artisan-light">STAT</span>
                <span className="text-artisan-grey ml-1.5 sm:ml-2">Surgical Supplies</span>
              </span>
            </motion.div>
          </Link>

          {/* Desktop/Tablet Centered Search Bar */}
          {!isAllProductsPage && (
            <form
              onSubmit={handleSearchSubmit}
              id="navbar-desktop-search"
              className="hidden md:flex items-center relative z-[110] mx-4"
            >
              <div className="relative flex items-center border border-artisan-light/10 focus-within:border-artisan-grey transition-all duration-300 bg-white/40 backdrop-blur-sm px-3 py-2 rounded-full">
                <Search className="w-4 h-4 text-artisan-grey/60" />
                <input
                  type="text"
                  placeholder={placeholderText}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-40 lg:w-66 focus:w-52 lg:focus:w-72 transition-all duration-300 bg-transparent rounded-full pl-2 outline-none font-mono text-[10px] uppercase tracking-widest text-artisan-light placeholder:text-artisan-light/50"
                />
              </div>

              {/* Recommendations Dropdown */}
              <AnimatePresence>
                {recommendations.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute left-0 top-[110%] w-64 lg:w-80 bg-artisan-dark/95 border border-artisan-light/10 shadow-2xl z-[120] rounded-sm py-2 max-h-80 overflow-y-auto backdrop-blur-md"
                  >
                    <p className="px-3 py-1 text-[7px] font-mono text-artisan-grey uppercase tracking-widest border-b border-artisan-light/5 pb-2">Recommendations</p>
                    {recommendations.slice(0, 5).map((prod) => (
                      <button
                        key={prod._id}
                        type="button"
                        onClick={() => {
                          setSearchQuery('')
                          setRecommendations([])
                          navigate(`/product/${prod._id}`)
                        }}
                        className="w-full text-left px-3 py-2.5 hover:bg-artisan-light/[0.05] transition-colors border-b border-artisan-light/5 last:border-0 flex items-center gap-3"
                      >
                        {prod.images && prod.images[0] && (
                          <img
                            src={prod.images[0].url}
                            alt={prod.name}
                            className="w-6 h-6 object-cover border border-artisan-light/10"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-artisan-light truncate">{prod.name}</p>
                          <div className="flex items-center gap-1.5 text-[8px] font-mono text-artisan-grey uppercase tracking-widest truncate">
                            <span>{prod.category} •</span>
                            {prod.mrp !== undefined && prod.mrp > (prod.sellingPrice !== undefined ? prod.sellingPrice : prod.price) && (
                              <span className="line-through text-artisan-light/20">₹{prod.mrp}</span>
                            )}
                            <span className="text-artisan-light/60">₹{prod.sellingPrice !== undefined ? prod.sellingPrice : prod.price}</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          )}

          {/* Header Action Controls */}
          <div className="flex items-center gap-3 relative z-[110]">
            {/* Mobile Search Toggle */}
            {!isAllProductsPage && (
              <button
                onClick={() => setShowMobileSearch(!showMobileSearch)}
                className="md:hidden p-2 text-artisan-light hover:text-artisan-grey transition-colors"
                aria-label="Toggle search"
              >
                {showMobileSearch ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
              </button>
            )}

            {/* Wishlist Link (if logged in and not admin) */}
            {user && user.role !== 'admin' && (
              <Link
                to="/wishlist"
                className="relative p-2 text-artisan-light hover:text-artisan-grey transition-colors flex items-center justify-center"
                aria-label="Wishlist"
              >
                <Heart className="w-4.5 h-4.5" />
                {wishlistCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                )}
              </Link>
            )}

            {/* Cart Link (if logged in and not admin) */}
            {user && user.role !== 'admin' && (
              <Link
                to="/cart"
                className="relative p-2 text-artisan-light hover:text-artisan-grey transition-colors flex items-center justify-center mr-1"
                aria-label="Cart"
              >
                <ShoppingBag className="w-4.5 h-4.5" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] flex items-center justify-center bg-artisan-grey text-artisan-dark text-[8px] font-mono font-bold rounded-full px-1">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}

            {/* Menu Trigger */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-4 group px-2 py-1"
            >
              <span className="text-xs font-mono uppercase tracking-[0.3em] hidden sm:block">
                {isOpen ? 'Close' : 'Menu'}
              </span>
              <div className="flex flex-col gap-1.5 items-end">
                <motion.span
                  animate={isOpen ? { rotate: 45, y: 7, backgroundColor: '#eb5e28' } : { rotate: 0, y: 0, backgroundColor: '#252422' }}
                  className="w-8 h-[1px] origin-center transition-all duration-300"
                />
                <motion.span
                  animate={isOpen ? { opacity: 0, x: 20 } : { opacity: 1, x: 0 }}
                  className="w-5 h-[1px] bg-artisan-light transition-all duration-300"
                />
                <motion.span
                  animate={isOpen ? { rotate: -45, y: -7, backgroundColor: '#eb5e28' } : { rotate: 0, y: 0, backgroundColor: '#252422' }}
                  className="w-8 h-[1px] origin-center transition-all duration-300"
                />
              </div>
            </button>
          </div>
        </div>

        {/* --- Mobile Search Panel --- */}
        <AnimatePresence>
          {showMobileSearch && !isOpen && !isAllProductsPage && (
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.33, 1, 0.68, 1] }}
              className="absolute top-full left-0 w-full bg-artisan-dark/95 backdrop-blur-md border-b border-artisan-light/5 p-4 z-[99]"
            >
              <form onSubmit={handleSearchSubmit} className="w-full relative" id="navbar-mobile-search">
                <div className="relative flex items-center border border-artisan-light/15 bg-white px-4 py-3 shadow-inner">
                  <Search className="w-4 h-4 text-artisan-grey/60 mr-2" />
                  <input
                    type="text"
                    placeholder={placeholderText}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent outline-none font-mono text-[10px] uppercase tracking-widest text-artisan-light placeholder:text-artisan-light/50"
                  />
                  <button
                    type="submit"
                    className="ml-2 px-3 py-1.5 bg-artisan-grey text-white font-display font-extrabold uppercase tracking-widest text-[8px]"
                  >
                    Go
                  </button>
                </div>

                {/* Mobile Recommendations Dropdown */}
                <AnimatePresence>
                  {recommendations.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute left-0 top-[110%] w-full bg-artisan-dark/95 border border-artisan-light/10 shadow-2xl z-[120] rounded-sm py-2 max-h-60 overflow-y-auto backdrop-blur-md"
                    >
                      <p className="px-3 py-1 text-[7px] font-mono text-artisan-grey uppercase tracking-widest border-b border-artisan-light/5 pb-2">Recommendations</p>
                      {recommendations.slice(0, 5).map((prod) => (
                        <button
                          key={prod._id}
                          type="button"
                          onClick={() => {
                            setSearchQuery('')
                            setRecommendations([])
                            setShowMobileSearch(false)
                            navigate(`/product/${prod._id}`)
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-artisan-light/[0.05] transition-colors border-b border-artisan-light/5 last:border-0 flex items-center gap-3"
                        >
                          {prod.images && prod.images[0] && (
                            <img
                              src={prod.images[0].url}
                              alt={prod.name}
                              className="w-6 h-6 object-cover border border-artisan-light/10"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-artisan-light truncate">{prod.name}</p>
                            <div className="flex items-center gap-1.5 text-[8px] font-mono text-artisan-grey uppercase tracking-widest truncate">
                              <span>{prod.category} •</span>
                              {prod.mrp !== undefined && prod.mrp > (prod.sellingPrice !== undefined ? prod.sellingPrice : prod.price) && (
                                <span className="line-through text-artisan-light/20">₹{prod.mrp}</span>
                              )}
                              <span className="text-artisan-light/60">₹{prod.sellingPrice !== undefined ? prod.sellingPrice : prod.price}</span>
                            </div>
                          </div>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* --- Full-Screen Menu Overlay --- */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={overlayVariants}
            initial="closed"
            animate="opened"
            exit="closed"
            className="fixed inset-0 z-[90] bg-artisan-dark bg-noise overflow-y-auto pt-32 pb-12 lg:pt-0 lg:pb-0 lg:flex lg:flex-col lg:justify-center"
          >
            <div className="container-custom w-full grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-12 items-start lg:items-center">

              {/* Navigation Links (Left side on Desktop) */}
              <motion.nav
                variants={listVariants}
                className="lg:col-span-7 xl:col-span-8 flex flex-col gap-4 md:gap-6 lg:gap-8"
              >
                {MENU_LINKS.map((link) => (
                  <div key={link.id} className="overflow-hidden">
                    <Link
                      to={link.href}
                      onClick={() => setIsOpen(false)}
                      className="group flex items-baseline gap-4 md:gap-6 hover:translate-x-2 md:hover:translate-x-4 transition-transform duration-500"
                    >
                      <motion.div variants={linkVariants} className="flex items-baseline gap-4 md:gap-6">
                        <span className="text-[10px] md:text-xs font-mono text-artisan-grey">{link.id}</span>
                        <h2 className={`font-display font-bold uppercase tracking-tight group-hover:text-outline transition-all duration-500 leading-[1.1] ${user?.role === 'admin'
                          ? 'text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl'
                          : 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl'
                          }`}>
                          {link.title}
                        </h2>
                        <ArrowUpRight className={`text-artisan-light opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-500 ${user?.role === 'admin' ? 'w-3.5 h-3.5 md:w-5 md:h-5' : 'w-4 h-4 md:w-6 md:h-6 lg:w-8 lg:h-8'
                          }`} />
                      </motion.div>
                    </Link>
                  </div>
                ))}

                {!user && (
                  <div className="overflow-hidden lg:hidden">
                    <Link
                      to="/login"
                      onClick={() => setIsOpen(false)}
                      className="group flex items-baseline gap-4 md:gap-6 hover:translate-x-2 md:hover:translate-x-4 transition-transform duration-500"
                    >
                      <motion.div variants={linkVariants} className="flex items-baseline gap-4 md:gap-6">
                        <span className="text-[10px] md:text-xs font-mono text-artisan-grey">04</span>
                        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-display font-bold uppercase tracking-tight group-hover:text-outline transition-all duration-500 leading-[1.1]">
                          Join Us
                        </h2>
                        <ArrowUpRight className="w-4 h-4 md:w-6 md:h-6 lg:w-8 lg:h-8 text-artisan-light opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-500" />
                      </motion.div>
                    </Link>
                  </div>
                )}
              </motion.nav>

              {/* Right side Metadata / Socials */}
              <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-8 md:gap-12 lg:pl-12 lg:border-l border-artisan-light/5">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                  className="space-y-4"
                >
                  <p className="text-xs font-mono uppercase tracking-[0.2em] text-artisan-grey">
                    {user
                      ? (user.role === 'admin' ? 'Admin Console' : 'Customer Portal')
                      : 'Connections'
                    }
                  </p>
                  <div className="flex flex-col gap-3">
                    {user ? (
                      <>
                        {user.role !== 'admin' ? (
                          <Link
                            to="/profile"
                            onClick={() => setIsOpen(false)}
                            className="w-full py-4 px-6 border border-artisan-light text-sm font-bold uppercase tracking-widest hover:bg-artisan-light hover:text-artisan-dark transition-all duration-300 text-center flex items-center justify-center gap-4"
                          >
                            <UserIcon className="w-4 h-4" />
                            View Profile
                          </Link>
                        ) : (
                          <Link
                            to="/admin"
                            onClick={() => setIsOpen(false)}
                            className="w-full py-4 px-6 border border-artisan-light text-sm font-bold uppercase tracking-widest hover:bg-artisan-light hover:text-artisan-dark transition-all duration-300 text-center flex items-center justify-center gap-4"
                          >
                            <Activity className="w-4 h-4" />
                            Admin Hub
                          </Link>
                        )}
                        <button
                          onClick={handleLogout}
                          className="w-full py-4 px-6 bg-artisan-grey text-artisan-dark text-sm font-bold uppercase tracking-widest hover:opacity-90 transition-all duration-300 text-center flex items-center justify-center gap-4"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          to="/login"
                          onClick={() => setIsOpen(false)}
                          className="w-full py-4 px-6 border border-artisan-light text-sm font-bold uppercase tracking-widest hover:bg-artisan-light hover:text-artisan-dark transition-all duration-300 text-center"
                        >
                          Sign In
                        </Link>
                        <Link
                          to="/signup"
                          onClick={() => setIsOpen(false)}
                          className="w-full py-4 px-6 bg-artisan-grey text-artisan-dark text-sm font-bold uppercase tracking-widest hover:opacity-90 transition-all duration-300 text-center"
                        >
                          Join Us
                        </Link>
                      </>
                    )}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="pt-8 border-t border-artisan-light/5"
                >
                  <div className="text-xs md:text-sm font-mono text-artisan-light/60 uppercase tracking-[0.2em] leading-relaxed">
                    STAT Surgical Supplies<br />
                    {user ? (
                      <span className="flex items-center gap-2 mt-2 font-mono font-bold text-artisan-grey">
                        Session: {sessionDuration}
                      </span>
                    ) : (
                      <span className="flex items-center gap-2 mt-2 font-mono text-artisan-light/50">
                        Guest Mode
                      </span>
                    )}
                  </div>
                </motion.div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
