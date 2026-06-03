import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Check, ArrowRight, Cookie, FileText, AlertCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'

export default function ConsentModal({ onComplete }) {
  const { updateConsents, loading } = useAuth()
  const { addToast } = useToast()
  const [cookies, setCookies] = useState(false)
  const [terms, setTerms] = useState(false)

  const handleSubmit = async () => {
    if (!terms) {
      addToast('Please accept the Terms to continue', 'error')
      return
    }

    try {
      await updateConsents({
        cookiesAccepted: cookies,
        termsAccepted: terms
      })
      addToast('Preferences saved', 'success')
      onComplete()
    } catch (err) {
      addToast('Failed to save preferences', 'error')
    }
  }

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 md:p-8 bg-artisan-dark/95 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-xl bg-artisan-dark border border-artisan-light/10 p-8 md:p-12 relative overflow-hidden"
      >
        {/* Aesthetic Background Elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-artisan-grey to-transparent opacity-20" />
        <Shield className="absolute -bottom-10 -right-10 w-40 h-40 text-artisan-light/5 rotate-12" />

        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-artisan-grey flex items-center justify-center">
              <Shield className="w-6 h-6 text-artisan-dark" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-artisan-grey uppercase tracking-[0.4em] block mb-1">Terms & Privacy</span>
              <h2 className="text-3xl font-display font-black uppercase text-artisan-light leading-none">Almost There</h2>
            </div>
          </div>

          <p className="text-sm text-artisan-light/40 leading-relaxed mb-10 font-body">
            Before you start, please review and accept our rules to join the ForgeShare community. This helps keep everyone safe while sharing tools.
          </p>

          <div className="space-y-4 mb-10">
            {/* TERMS ACCEPTANCE */}
            <button
              onClick={() => setTerms(!terms)}
              className={`w-full p-6 border-2 flex items-center gap-6 transition-all duration-500 text-left ${
                terms ? 'border-artisan-grey bg-artisan-grey/[0.03]' : 'border-artisan-light/5 hover:border-artisan-light/10'
              }`}
            >
              <div className={`w-6 h-6 border-2 shrink-0 flex items-center justify-center transition-all ${
                terms ? 'border-artisan-grey bg-artisan-grey' : 'border-artisan-light/20'
              }`}>
                {terms && <Check className="w-4 h-4 text-artisan-dark" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className={`w-3 h-3 ${terms ? 'text-artisan-grey' : 'text-artisan-light/20'}`} />
                  <span className={`text-[11px] font-mono font-bold uppercase tracking-widest ${terms ? 'text-artisan-light' : 'text-artisan-light/40'}`}>Terms of Service</span>
                </div>
                <p className="text-[10px] text-artisan-light/20 leading-relaxed uppercase tracking-tighter">I agree to the rules for renting and sharing tools on ForgeShare.</p>
              </div>
            </button>

            {/* COOKIE CONSENT */}
            <button
              onClick={() => setCookies(!cookies)}
              className={`w-full p-6 border-2 flex items-center gap-6 transition-all duration-500 text-left ${
                cookies ? 'border-artisan-grey bg-artisan-grey/[0.03]' : 'border-artisan-light/5 hover:border-artisan-light/10'
              }`}
            >
              <div className={`w-6 h-6 border-2 shrink-0 flex items-center justify-center transition-all ${
                cookies ? 'border-artisan-grey bg-artisan-grey' : 'border-artisan-light/20'
              }`}>
                {cookies && <Check className="w-4 h-4 text-artisan-dark" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Cookie className={`w-3 h-3 ${cookies ? 'text-artisan-grey' : 'text-artisan-light/20'}`} />
                  <span className={`text-[11px] font-mono font-bold uppercase tracking-widest ${cookies ? 'text-artisan-light' : 'text-artisan-light/40'}`}>Cookies</span>
                </div>
                <p className="text-[10px] text-artisan-light/20 leading-relaxed uppercase tracking-tighter">Help us remember your login and preferences for a smoother experience.</p>
              </div>
            </button>
          </div>

          {!terms && (
            <div className="flex items-start gap-3 p-4 bg-red-500/5 border border-red-500/20 mb-8">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-[9px] font-mono text-red-500/80 uppercase tracking-widest leading-relaxed">
                Notice: You must accept the terms to continue to the marketplace.
              </p>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading || !terms}
            className="w-full py-5 bg-artisan-grey text-artisan-dark font-display font-extrabold uppercase tracking-[0.6em] text-[11px] hover:bg-artisan-light transition-all duration-500 flex items-center justify-center gap-4 group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="animate-pulse">Saving...</span>
            ) : (
              <>
                <span>Accept & Continue</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
