import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, AlertTriangle, Loader2, ArrowRight, Hammer } from 'lucide-react'
import api from '../services/api'

export default function VerifyEmail() {
  const { token } = useParams()
  const [status, setStatus] = useState('verifying') // verifying, success, error
  const [message, setMessage] = useState('')

  useEffect(() => {
    const verify = async () => {
      try {
        await api.get(`/auth/verifyemail/${token}`)
        setStatus('success')
      } catch (err) {
        setStatus('error')
        setMessage(err.response?.data?.error || 'Verification failed')
      }
    }
    verify()
  }, [token])

  return (
    <div className="h-screen bg-artisan-dark flex items-center justify-center p-6">
      <div className="w-full max-w-md text-center space-y-12">
        <div className="flex justify-center">

        </div>

        {status === 'verifying' && (
          <div className="space-y-6">
            <Loader2 className="w-12 h-12 text-artisan-grey animate-spin mx-auto" />
            <h2 className="text-2xl font-display font-extrabold uppercase text-artisan-light tracking-widest">Verifying your email...</h2>
          </div>
        )}

        {status === 'success' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8"
          >
            <CheckCircle className="w-16 h-16 text-artisan-grey mx-auto" />
            <div className="space-y-4">
              <h2 className="text-4xl font-display font-extrabold uppercase text-artisan-light tracking-tighter">Email Verified!</h2>
              <p className="text-artisan-light/40 font-mono text-[10px] uppercase tracking-[0.2em] leading-relaxed">
                Your email is now confirmed. You can now start using the platform and browsing tools.
              </p>
            </div>
            <Link to="/login" className="inline-flex items-center gap-3 px-8 py-4 bg-artisan-light text-artisan-dark font-display font-black uppercase tracking-widest text-[10px] hover:bg-artisan-grey transition-all group">
              Go to Login
              <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
            </Link>
          </motion.div>
        )}

        {status === 'error' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8"
          >
            <AlertTriangle className="w-16 h-16 text-artisan-grey mx-auto" />
            <div className="space-y-4">
              <h2 className="text-4xl font-display font-extrabold uppercase text-artisan-light tracking-tighter">Invalid Link.</h2>
              <p className="text-artisan-light/40 font-mono text-[10px] uppercase tracking-[0.2em] leading-relaxed">
                {message || 'The link is invalid or has expired.'}
              </p>
            </div>
            <Link to="/login" className="inline-flex items-center gap-3 px-8 py-4 border-2 border-artisan-light/10 text-artisan-light font-display font-black uppercase tracking-widest text-[10px] hover:bg-artisan-light/5 transition-all">
              Back to Login
            </Link>
          </motion.div>
        )}
      </div>

      {/* Home Link */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-[100]">
        <Link
          to="/"
          className="group flex items-center gap-4 text-[10px] font-mono font-bold text-artisan-light/50 hover:text-artisan-grey transition-all uppercase tracking-[0.5em] whitespace-nowrap"
        >
          <div className="w-8 h-px bg-artisan-light/10 group-hover:bg-artisan-grey transition-colors" />
          Home
          <div className="w-8 h-px bg-artisan-light/10 group-hover:bg-artisan-grey transition-colors" />
        </Link>
      </div>
    </div>
  )
}
