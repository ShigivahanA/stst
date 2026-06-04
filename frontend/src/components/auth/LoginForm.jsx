import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Mail, Lock, Activity, Loader2, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { useToast } from '../../context/ToastContext'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [otp, setOtp] = useState('')
  const [twoFactorRequired, setTwoFactorRequired] = useState(false)
  const [tempUserId, setTempUserId] = useState(null)
  const { login, verify2FA, loading, error, clearError } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    if (error) {
      addToast(error, 'error')
      clearError()
    }
  }, [error, addToast, clearError])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const data = await login({ email, password })

      if (data?.twoFactorRequired) {
        setTwoFactorRequired(true)
        setTempUserId(data.userId)
        addToast('Security code sent to your email', 'success')
        return
      }

      if (data?.user?.role === 'admin') {
        navigate('/admin')
      } else {
        navigate('/allproduct')
      }
    } catch (err) {
      // Error handled by useEffect and toast
    }
  }

  const handleVerify2FA = async (e) => {
    e.preventDefault()
    try {
      const data = await verify2FA(tempUserId, otp)
      if (data?.user?.role === 'admin') {
        navigate('/admin')
      } else {
        navigate('/allproduct')
      }
    } catch (err) {
      // Error handled by useEffect and toast
    }
  }

  return (
    <div className="w-full">
      {/* Compact Monumental Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-artisan-grey flex items-center justify-center">
            <Activity className="w-5 h-5 text-artisan-dark" />
          </div>
          <span className="text-[9px] font-mono font-bold text-artisan-grey uppercase tracking-[0.4em]">Account Login</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-display font-extrabold uppercase tracking-tighter leading-tight text-artisan-light">
          Hello <span className="text-outline">Again.</span>

        </h1>
      </motion.div>

      {/* Optimized Form Structure */}
      <AnimatePresence mode="wait">
        {!twoFactorRequired ? (
          <motion.form
            key="login-form"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <div className="group relative border-b border-artisan-light/10 focus-within:border-artisan-grey transition-all duration-500 pb-2">
              <label className="block text-[9px] font-mono font-bold text-artisan-light/30 uppercase tracking-[0.3em] mb-1 group-focus-within:text-artisan-grey transition-colors">
                Email Address
              </label>
              <div className="flex items-center gap-4">
                <Mail className="w-4 h-4 text-artisan-light/20 group-focus-within:text-artisan-grey transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="EMAIL@EXAMPLE.COM"
                  required
                  className="flex-1 bg-transparent outline-none text-base md:text-lg font-display font-bold uppercase text-artisan-light placeholder:text-artisan-light/5"
                />
              </div>
            </div>

            <div className="group relative border-b border-artisan-light/10 focus-within:border-artisan-grey transition-all duration-500 pb-2">
              <div className="flex justify-between items-center mb-1">
                <label className="text-[9px] font-mono font-bold text-artisan-light/30 uppercase tracking-[0.3em] group-focus-within:text-artisan-grey transition-colors">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  onClick={(e) => e.stopPropagation()}
                  title="Recover Password"
                  className="text-[9px] font-mono font-bold text-artisan-grey hover:text-artisan-light transition-colors uppercase tracking-widest p-2 -mr-2"
                >
                  Forgot?
                </Link>
              </div>
              <div className="flex items-center gap-4">
                <Lock className="w-4 h-4 text-artisan-light/20 group-focus-within:text-artisan-grey transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="flex-1 bg-transparent outline-none text-base md:text-lg font-display font-bold uppercase text-artisan-light placeholder:text-artisan-light/5"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-artisan-light/20 hover:text-artisan-grey transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Masterpiece Submit Button */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-5 bg-artisan-grey text-artisan-dark font-display font-extrabold uppercase tracking-[0.6em] text-[10px] hover:bg-artisan-light transition-all duration-500 flex items-center justify-center gap-4 group relative overflow-hidden mt-6 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span className="relative z-10">Sign In</span>
                  <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-2 transition-transform" />
                </>
              )}
              <div className="absolute inset-0 bg-artisan-light -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
            </motion.button>
          </motion.form>
        ) : (
          <motion.form
            key="2fa-form"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onSubmit={handleVerify2FA}
            className="space-y-8"
          >
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-artisan-grey mx-auto flex items-center justify-center">
                <Lock className="w-8 h-8 text-artisan-dark" />
              </div>
              <div>
                <h2 className="text-2xl font-display font-black uppercase text-artisan-light">Security Check</h2>
                <p className="text-[10px] font-mono text-artisan-grey uppercase tracking-widest mt-2">Enter the code sent to your email</p>
              </div>
            </div>

            <div className="group relative border-b border-artisan-light/10 focus-within:border-artisan-grey transition-all duration-500 pb-2">
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="000000"
                maxLength={6}
                required
                className="w-full bg-transparent outline-none text-4xl md:text-5xl font-display font-black uppercase text-artisan-light text-center tracking-[0.5em] placeholder:text-artisan-light/5"
              />
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-5 bg-artisan-grey text-artisan-dark font-display font-extrabold uppercase tracking-[0.6em] text-[10px] hover:bg-artisan-light transition-all duration-500 flex items-center justify-center gap-4 group relative overflow-hidden disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span className="relative z-10">Verify Access</span>
                  <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-2 transition-transform" />
                </>
              )}
            </motion.button>

            <button
              type="button"
              onClick={() => setTwoFactorRequired(false)}
              className="w-full text-[9px] font-mono text-artisan-grey hover:text-artisan-light uppercase tracking-widest transition-colors"
            >
              Back to Login
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  )
}
