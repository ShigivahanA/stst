import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Mail, Lock, User, Activity, Loader2, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'

export default function SignupForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const { signup, googleLogin, loading, error, clearError } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    if (error) {
      addToast(error, 'error')
      clearError()
    }
  }, [error, addToast, clearError])

  useEffect(() => {
    const initializeGoogle = () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: handleGoogleCallback,
        });
        const parent = document.getElementById('google-signin-btn-signup');
        if (parent) {
          window.google.accounts.id.renderButton(
            parent,
            {
              theme: 'outline',
              size: 'large',
              width: parent.offsetWidth || 320,
              text: 'signup_with',
            }
          );
        }
      }
    };

    const interval = setInterval(() => {
      if (window.google?.accounts?.id) {
        initializeGoogle();
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const handleGoogleCallback = async (response) => {
    try {
      const data = await googleLogin(response.credential);
      addToast('Google login successful', 'success');
      const redirectPath = localStorage.getItem('auth_redirect');
      if (data?.user?.role === 'admin') {
        navigate('/admin');
      } else if (redirectPath) {
        navigate(redirectPath);
        localStorage.removeItem('auth_redirect');
      } else {
        navigate('/allproduct');
      }
    } catch (err) {
      // Error handled by AuthContext/Toast
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await signup({ name, email, password })
      const redirectPath = localStorage.getItem('auth_redirect');
      if (redirectPath) {
        navigate(redirectPath)
        localStorage.removeItem('auth_redirect')
      } else {
        navigate('/rent')
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
          <span className="text-[9px] font-mono font-bold text-artisan-grey uppercase tracking-[0.4em]">New Account</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-display font-extrabold uppercase tracking-tighter leading-tight text-artisan-light">
          Join <span className="text-outline">Us.</span>

        </h1>
      </motion.div>

      {/* Optimized Form Structure */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="group relative border-b border-artisan-light/10 focus-within:border-artisan-grey transition-all duration-500 pb-2">
          <label className="block text-[9px] font-mono font-bold text-artisan-light/50 uppercase tracking-[0.3em] mb-1 group-focus-within:text-artisan-grey transition-colors">
            Full Name
          </label>
          <div className="flex items-center gap-4">
            <User className="w-4 h-4 text-artisan-light/20 group-focus-within:text-artisan-grey transition-colors" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Your Name"
              className="flex-1 bg-transparent outline-none text-base md:text-lg font-display font-bold text-artisan-light placeholder:text-artisan-light/5"
            />
          </div>
        </div>

        <div className="group relative border-b border-artisan-light/10 focus-within:border-artisan-grey transition-all duration-500 pb-2">
          <label className="block text-[9px] font-mono font-bold text-artisan-light/50 uppercase tracking-[0.3em] mb-1 group-focus-within:text-artisan-grey transition-colors">
            Email Address
          </label>
          <div className="flex items-center gap-4">
            <Mail className="w-4 h-4 text-artisan-light/20 group-focus-within:text-artisan-grey transition-colors" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="email@example.com"
              className="flex-1 bg-transparent outline-none text-base md:text-lg font-display font-bold text-artisan-light placeholder:text-artisan-light/5"
            />
          </div>
        </div>

        <div className="group relative border-b border-artisan-light/10 focus-within:border-artisan-grey transition-all duration-500 pb-2">
          <label className="block text-[9px] font-mono font-bold text-artisan-light/50 uppercase tracking-[0.3em] mb-1 group-focus-within:text-artisan-grey transition-colors">
            Password
          </label>
          <div className="flex items-center gap-4">
            <Lock className="w-4 h-4 text-artisan-light/20 group-focus-within:text-artisan-grey transition-colors" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="flex-1 bg-transparent outline-none text-base md:text-lg font-display font-bold text-artisan-light placeholder:text-artisan-light/5"
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
              <span className="relative z-10">Create Account</span>
              <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-2 transition-transform" />
            </>
          )}
          <div className="absolute inset-0 bg-artisan-light -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
        </motion.button>

        {/* Divider */}
        <div className="relative my-6 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-artisan-light/10"></div>
          </div>
          <span className="relative z-10 bg-artisan-dark px-4 text-[9px] font-mono font-bold text-artisan-light/50 uppercase tracking-[0.3em]">
            or continue with
          </span>
        </div>

        {/* Google Sign-In Button */}
        <div className="flex justify-center w-full">
          <div id="google-signin-btn-signup" className="w-full flex justify-center"></div>
        </div>
      </form>
    </div>
  )
}
