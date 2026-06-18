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
        <div className="relative w-full h-11 flex items-center justify-center border border-artisan-light/10 hover:border-artisan-light/35 bg-artisan-light/[0.01] hover:bg-artisan-light/5 text-artisan-light text-[10px] font-mono font-bold uppercase tracking-widest rounded-xl transition-all duration-300 select-none">
          <svg className="w-4 h-4 mr-2 shrink-0" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
          </svg>
          <span>Continue with Google</span>

          <div
            id="google-signin-btn-signup"
            className="absolute inset-0 w-full h-full opacity-0 [&_iframe]:!w-full [&_iframe]:!h-full cursor-pointer z-10"
          ></div>
        </div>
      </form>
    </div>
  )
}
