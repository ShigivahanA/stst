import { useState, useEffect } from 'react'
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { Activity, X, ArrowUpRight, Globe, MessageCircle, Camera, Mail, MapPin, Phone, LogOut, User as UserIcon } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const { scrollY } = useScroll()
  const [isScrolled, setIsScrolled] = useState(scrollY.get() > 20)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

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
  const MENU_LINKS = user?.role === 'admin'
    ? [
      { id: '01', title: 'Manage Users', href: '/admin/users' },
      { id: '02', title: 'Content', href: '/admin/content' },
      { id: '03', title: 'Products', href: '/admin/products' },
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

  return (
    <>
      {/* --- Fixed Navigation Header --- */}
      <motion.header
        initial={{ y: 0 }}
        animate={{ y: (isVisible || isOpen) ? 0 : '-100%' }}
        transition={{ duration: 0.4, ease: [0.33, 1, 0.68, 1] }}
        className={`fixed top-0 left-0 w-full z-[100] transition-all duration-300 ${isScrolled && !isOpen ? 'h-12 bg-artisan-dark/90 backdrop-blur-md' : 'h-16'
          }`}
      >
        <div className="container-custom h-full flex items-center justify-between border-b border-artisan-light/5">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 relative z-[110]"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2"
            >
              <Activity className="w-5 h-5 text-artisan-light" />
              <span className="text-lg font-display font-bold uppercase tracking-[0.2em]">
                <span className="text-artisan-light">STAT</span>
                <span className="text-artisan-grey ml-2">Surgical Supplies</span>
              </span>
            </motion.div>
          </Link>

          {/* Menu Trigger */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="relative z-[110] flex items-center gap-4 group px-2 py-1"
          >
            <span className="text-xs font-mono uppercase tracking-[0.3em] hidden sm:block">
              {isOpen ? 'Close' : 'Menu'}
            </span>
            <div className="flex flex-col gap-1.5 items-end">
              <motion.span
                animate={isOpen ? { rotate: 45, y: 7, backgroundColor: '#B90504' } : { rotate: 0, y: 0, backgroundColor: '#000000' }}
                className="w-8 h-[1px] origin-center transition-all duration-300"
              />
              <motion.span
                animate={isOpen ? { opacity: 0, x: 20 } : { opacity: 1, x: 0 }}
                className="w-5 h-[1px] bg-artisan-light transition-all duration-300"
              />
              <motion.span
                animate={isOpen ? { rotate: -45, y: -7, backgroundColor: '#B90504' } : { rotate: 0, y: 0, backgroundColor: '#000000' }}
                className="w-8 h-[1px] origin-center transition-all duration-300"
              />
            </div>
          </button>
        </div>
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
                            ? 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl'
                            : 'text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-8xl'
                          }`}>
                          {link.title}
                        </h2>
                        <ArrowUpRight className={`text-artisan-light opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-500 ${user?.role === 'admin' ? 'w-4 h-4 md:w-6 md:h-6' : 'w-5 h-5 md:w-8 md:h-8 lg:w-10 lg:h-10'
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
                        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-8xl font-display font-bold uppercase tracking-tight group-hover:text-outline transition-all duration-500 leading-[1.1]">
                          Join Us
                        </h2>
                        <ArrowUpRight className="w-5 h-5 md:w-8 md:h-8 lg:w-10 lg:h-10 text-artisan-light opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-500" />
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
                      <span className="flex items-center gap-2 mt-2 font-mono text-artisan-light/30">
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
