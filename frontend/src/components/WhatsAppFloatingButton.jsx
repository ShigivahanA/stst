import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X } from 'lucide-react'

export default function WhatsAppFloatingButton() {
  const [showTooltip, setShowTooltip] = useState(false)
  const location = useLocation()

  // 1. Scroll tracking on Home page
  useEffect(() => {
    const handleScroll = () => {
      if (location.pathname === '/') {
        if (window.scrollY > 200) {
          sessionStorage.setItem('wa_scrolled_home', 'true')
        }
      }
    }

    if (location.pathname === '/') {
      window.addEventListener('scroll', handleScroll)
    }

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [location.pathname])

  // 2. Navigation trigger state updates
  useEffect(() => {
    const scrolledHome = sessionStorage.getItem('wa_scrolled_home') === 'true'
    const visitedProducts = sessionStorage.getItem('wa_visited_products') === 'true'

    if (scrolledHome) {
      if (location.pathname === '/allproduct' || location.pathname === '/categories') {
        sessionStorage.setItem('wa_visited_products', 'true')
      }
    }

    if (scrolledHome && visitedProducts) {
      const isProductDetail = location.pathname.startsWith('/product/') || location.pathname.startsWith('/tool/')
      if (isProductDetail) {
        sessionStorage.setItem('wa_visited_product_detail', 'true')
      }
    }
  }, [location.pathname])

  // 3. Tooltip auto-show on product details page after delay
  useEffect(() => {
    const isProductDetail = location.pathname.startsWith('/product/') || location.pathname.startsWith('/tool/')
    if (!isProductDetail) {
      return
    }

    const scrolledHome = sessionStorage.getItem('wa_scrolled_home') === 'true'
    const visitedProducts = sessionStorage.getItem('wa_visited_products') === 'true'
    const visitedProductDetail = sessionStorage.getItem('wa_visited_product_detail') === 'true'
    const conversionHappened = sessionStorage.getItem('wa_conversion_happened') === 'true' || localStorage.getItem('wa_conversion_happened') === 'true'

    if (scrolledHome && visitedProducts && visitedProductDetail && !conversionHappened) {
      const timer = setTimeout(() => {
        setShowTooltip(true)
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [location.pathname])

  const whatsappNumber = '918608678828'
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hello STAT Surgical Supplies, I have an enquiry.')}`

  return (
    <div className="fixed bottom-6 right-6 z-[999] flex flex-col items-end gap-2 pointer-events-none">
      
      {/* Interactive Tooltip Chat Prompt */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300, delay: 1 }}
            className="pointer-events-auto bg-[#fffcf2] text-[#252422] border border-[#252422]/10 shadow-[0_10px_30px_rgba(0,0,0,0.15)] rounded-2xl p-4 max-w-[260px] relative font-body select-none"
          >
            {/* Close Button */}
            <button
              onClick={() => setShowTooltip(false)}
              className="absolute top-2 right-2 text-[#252422]/40 hover:text-[#252422] transition-colors p-1"
              aria-label="Dismiss tooltip"
            >
              <X className="w-3 h-3" />
            </button>
            
            <div className="pr-3">
              <span className="text-[9px] font-mono font-bold text-[#eb5e28] uppercase tracking-wider block mb-1">Online Support</span>
              <p className="text-xs font-bold leading-relaxed mb-0 text-[#252422]">
                Need help? Chat with our team on WhatsApp!
              </p>
            </div>
            {/* Tooltip Corner Arrow */}
            <div className="absolute right-6 -bottom-1.5 w-3 h-3 bg-[#fffcf2] border-r border-b border-[#252422]/10 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <div className="relative pointer-events-auto">
        {/* Pulsing ring indicator */}
        <span className="absolute -inset-1 rounded-full bg-[#25D366]/30 animate-ping pointer-events-none" />

        <motion.a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          onMouseEnter={() => setShowTooltip(true)}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center justify-center w-14 h-14 bg-[#25D366] text-[#fffcf2] rounded-full shadow-[0_6px_25px_rgba(37,211,102,0.4)] hover:bg-[#20ba56] transition-colors cursor-pointer"
          aria-label="Chat on WhatsApp"
        >
          <MessageCircle className="w-7 h-7 fill-[#fffcf2]" />
        </motion.a>
      </div>

    </div>
  )
}
