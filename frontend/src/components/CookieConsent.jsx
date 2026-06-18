import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cookie, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function CookieConsent() {
  const { user, updateConsents } = useAuth()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    let isConsentResolved = false

    if (user) {
      if (user.consents && user.consents.cookiesAccepted !== undefined) {
        isConsentResolved = true
      }
    } else {
      const localConsent = localStorage.getItem('cookies_accepted')
      if (localConsent !== null) {
        isConsentResolved = true
      }
    }

    if (!isConsentResolved) {
      const timer = setTimeout(() => {
        setVisible(true)
      }, 2000)
      return () => clearTimeout(timer)
    } else {
      setVisible(false)
    }
  }, [user])

  const handleAccept = async () => {
    if (user) {
      try {
        await updateConsents({ cookiesAccepted: true })
      } catch (err) {
        console.error('Failed to update consent:', err)
      }
    } else {
      localStorage.setItem('cookies_accepted', 'true')
    }
    setVisible(false)
  }

  const handleDecline = async () => {
    if (user) {
      try {
        await updateConsents({ cookiesAccepted: false })
      } catch (err) {
        console.error('Failed to update consent:', err)
      }
    } else {
      localStorage.setItem('cookies_accepted', 'false')
    }
    setVisible(false)
  }


  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          transition={{ type: 'spring', damping: 20, stiffness: 260 }}
          className="fixed bottom-6 left-6 z-[999] max-w-sm w-[calc(100%-3rem)] bg-[#fffcf2]/95 backdrop-blur-md border border-[#252422]/15 shadow-[0_15px_40px_rgba(0,0,0,0.25)] rounded-2xl p-6 flex flex-col gap-4 font-body pointer-events-auto"
        >
          {/* Header & Icon */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-[#eb5e28]/10 rounded-xl flex items-center justify-center text-[#eb5e28] shrink-0">
              <Cookie className="w-5 h-5 fill-[#eb5e28]/20" />
            </div>
            <div className="flex-1 min-w-0 pr-6">
              <span className="text-[9px] font-mono font-bold text-[#eb5e28] uppercase tracking-widest block mb-1">Cookie Preferences</span>
              <h3 className="text-xs font-display font-black text-[#252422] uppercase tracking-tight leading-tight">We Value Your Privacy</h3>
            </div>
            {/* Direct Close Button */}
            <button
              onClick={handleDecline}
              className="absolute top-4 right-4 text-[#252422]/40 hover:text-[#252422] p-1 transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Description */}
          <p className="text-[10px] sm:text-xs text-[#252422]/70 leading-relaxed">
            We use cookies to improve your browsing experience, deliver personalized content, and analyze our traffic. By clicking &ldquo;Accept&rdquo;, you agree to our cookie policy.
          </p>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 mt-1">
            <button
              onClick={handleAccept}
              className="flex-1 py-3 bg-[#eb5e28] hover:bg-[#252422] text-[#fffcf2] font-display font-extrabold uppercase tracking-widest text-[9px] rounded-xl shadow-[0_4px_12px_rgba(235,94,40,0.3)] hover:shadow-none hover:translate-y-[1px] transition-all duration-300"
            >
              Accept All
            </button>
            <button
              onClick={handleDecline}
              className="px-4 py-3 border border-[#252422]/15 hover:border-[#252422] text-[#252422] font-display font-bold uppercase tracking-widest text-[9px] rounded-xl hover:bg-[#252422]/5 transition-all duration-300"
            >
              Decline
            </button>
          </div>

        </motion.div>
      )}
    </AnimatePresence>
  )
}
