import { useState, useEffect } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import LoginForm from '../components/auth/LoginForm'
import SignupForm from '../components/auth/SignupForm'

export default function Auth() {
  const location = useLocation()
  const navigate = useNavigate()
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024)

  // Track which side is expanded
  const [expandedSide, setExpandedSide] = useState(location.pathname === '/login' ? 'login' : 'signup')

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    setExpandedSide(location.pathname === '/login' ? 'login' : 'signup')
  }, [location.pathname])

  const handleToggle = (side) => {
    setExpandedSide(side)
    navigate(side === 'login' ? '/login' : '/signup')
  }

  return (
    <div className="h-screen w-full bg-artisan-dark overflow-hidden flex flex-col lg:flex-row fixed inset-0">

      {/* LOGIN PANEL (Accordion Pane 01) */}
      <motion.div
        animate={isMobile ? {
          height: expandedSide === 'login' ? '85%' : '15%',
          width: '100%'
        } : {
          width: expandedSide === 'login' ? '85%' : '15%',
          height: '100%'
        }}
        transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
        onClick={() => handleToggle('login')}
        className={`relative cursor-pointer overflow-hidden border-b lg:border-b-0 lg:border-r border-artisan-light/5 transition-colors duration-700 ${expandedSide === 'login' ? 'bg-artisan-dark' : 'bg-artisan-grey hover:bg-artisan-grey/90'
          }`}
      >
        {/* Title (When Collapsed) */}
        <AnimatePresence>
          {expandedSide !== 'login' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center p-4"
            >
              <h2 className={`font-display font-extrabold uppercase text-artisan-dark tracking-tighter text-center transition-all duration-500 ${isMobile ? 'text-2xl' : 'text-5xl xl:text-7xl [writing-mode:vertical-lr] rotate-180'
                }`}>
                {isMobile ? 'Welcome Back' : 'Welcome'}
              </h2>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form Content (When Expanded) */}
        <div className={`h-full w-full flex flex-col items-center justify-center p-6 md:p-12 lg:p-24 transition-all duration-700 ${expandedSide === 'login' ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-95 pointer-events-none'
          }`}>
          <div className="w-full max-w-lg">
            <LoginForm />
          </div>
        </div>
      </motion.div>

      {/* SIGNUP PANEL (Accordion Pane 02) */}
      <motion.div
        animate={isMobile ? {
          height: expandedSide === 'signup' ? '85%' : '15%',
          width: '100%'
        } : {
          width: expandedSide === 'signup' ? '85%' : '15%',
          height: '100%'
        }}
        transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
        onClick={() => handleToggle('signup')}
        className={`relative cursor-pointer overflow-hidden transition-colors duration-700 ${expandedSide === 'signup' ? 'bg-artisan-dark' : 'bg-artisan-grey hover:bg-artisan-grey/90'
          }`}
      >
        {/* Title (When Collapsed) */}
        <AnimatePresence>
          {expandedSide !== 'signup' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center p-4"
            >
              <h2 className={`font-display font-extrabold uppercase text-artisan-dark tracking-tighter text-center transition-all duration-500 ${isMobile ? 'text-2xl' : 'text-5xl xl:text-7xl [writing-mode:vertical-lr] rotate-180'
                }`}>
                {isMobile ? 'Join Us' : 'Register'}
              </h2>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form Content (When Expanded) */}
        <div className={`h-full w-full flex flex-col items-center justify-center p-6 md:p-12 lg:p-24 transition-all duration-700 ${expandedSide === 'signup' ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-95 pointer-events-none'
          }`}>
          <div className="w-full max-w-lg">
            <SignupForm />
          </div>
        </div>
      </motion.div>

      {/* Global Home Link (Dynamic Position) */}
      <motion.div
        animate={{
          top: (isMobile && expandedSide === 'signup') ? 'auto' : 32,
          bottom: (isMobile && expandedSide === 'signup') ? 32 : 'auto',
          left: isMobile ? '50%' : (expandedSide === 'login' ? 32 : 'auto'),
          right: isMobile ? 'auto' : (expandedSide === 'signup' ? 32 : 'auto'),
          x: isMobile ? '-50%' : 0
        }}
        transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
        className="absolute z-[100]"
      >
        <Link
          to="/"
          className="group flex items-center gap-4 text-[10px] font-mono font-bold text-artisan-light/50 hover:text-artisan-grey transition-all uppercase tracking-[0.5em] whitespace-nowrap"
        >
          <div className="w-8 h-px bg-artisan-light/10 group-hover:bg-artisan-grey transition-colors" />
          Home
          <div className="w-8 h-px bg-artisan-light/10 group-hover:bg-artisan-grey transition-colors" />
        </Link>
      </motion.div>

    </div>
  )
}
