import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Mail, Hammer, Loader2, CheckCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { Link } from 'react-router-dom'

export default function ForgotForm() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const { forgotPassword, loading, error } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await forgotPassword(email)
      setSubmitted(true)
    } catch (err) {
      console.error(err)
    }
  }

  if (submitted) {
    return (
      <div className="w-full max-w-md text-center space-y-8">
        <div className="w-20 h-20 bg-artisan-grey flex items-center justify-center mx-auto rounded-full">
          <CheckCircle className="w-10 h-10 text-artisan-dark" />
        </div>
        <div className="space-y-4">
          <h2 className="text-4xl font-display font-extrabold uppercase text-artisan-light tracking-tighter">Transmission Sent.</h2>
          <p className="text-artisan-light/40 font-mono text-[10px] uppercase tracking-[0.2em] leading-relaxed">
            If an account exists for {email}, a recovery link has been dispatched to your terminal.
          </p>
        </div>
        <Link to="/login" className="inline-flex items-center gap-2 text-xs font-display font-extrabold uppercase text-artisan-grey hover:text-artisan-light transition-colors tracking-widest pt-8 border-t border-artisan-light/5 w-full justify-center">
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </Link>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <div className="w-12 h-12 bg-artisan-grey flex items-center justify-center mb-8">
          <Hammer className="w-6 h-6 text-artisan-dark" />
        </div>
        <h1 className="text-5xl lg:text-6xl font-display font-extrabold uppercase tracking-tighter leading-none text-artisan-light mb-4">
          Reset <br />
          <span className="text-artisan-grey">Access.</span>
        </h1>
        <p className="text-artisan-light/40 font-mono text-[10px] uppercase tracking-[0.2em]">
          Lost your key? Provide your email to restore connectivity.
        </p>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-artisan-grey/10 border-l-2 border-artisan-grey text-[10px] font-mono text-artisan-grey uppercase tracking-widest mb-4">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label className="text-[10px] font-mono font-bold text-artisan-light/40 uppercase tracking-[0.2em]">Email Address</label>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-artisan-light/20 group-focus-within:text-artisan-grey transition-colors">
              <Mail className="w-4 h-4" />
            </div>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="name@craft.com"
              className="w-full bg-transparent border-2 border-artisan-light/10 focus:border-artisan-grey p-4 pl-12 outline-none text-artisan-light font-body transition-all placeholder:text-artisan-light/10"
            />
          </div>
        </div>

        <motion.button
          type="submit"
          disabled={loading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-5 bg-artisan-light text-artisan-dark font-display font-extrabold uppercase tracking-widest text-xs hover:bg-artisan-grey hover:text-artisan-dark transition-all duration-300 flex items-center justify-center gap-3 mt-8 disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Reset Link'}
        </motion.button>
      </form>

      <div className="mt-12 pt-8 border-t border-artisan-light/5 flex flex-col items-center gap-4">
        <Link to="/login" className="flex items-center gap-2 text-xs font-display font-extrabold uppercase text-artisan-light hover:text-artisan-grey transition-colors tracking-widest">
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </Link>
      </div>
    </div>
  )
}
