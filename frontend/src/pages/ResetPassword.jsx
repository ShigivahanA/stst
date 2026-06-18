import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lock, ArrowRight, Hammer, Loader2, CheckCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function ResetPassword() {
  const { token } = useParams()
  const navigate = useNavigate()
  const { resetPassword, loading, error } = useAuth()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [success, setSuccess] = useState(false)
  const [localError, setLocalError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLocalError('')

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match')
      return
    }

    try {
      await resetPassword(token, password)
      setSuccess(true)
      setTimeout(() => navigate('/login'), 3000)
    } catch (err) {
      console.error(err)
    }
  }

  if (success) {
    return (
      <div className="h-screen bg-artisan-dark flex items-center justify-center p-6">
        <div className="w-full max-w-md text-center space-y-8">
          <div className="w-20 h-20 bg-artisan-grey flex items-center justify-center mx-auto rounded-full">
            <CheckCircle className="w-10 h-10 text-artisan-dark" />
          </div>
          <div className="space-y-4">
            <h2 className="text-4xl font-display font-extrabold uppercase text-artisan-light tracking-tighter">Key Restored.</h2>
            <p className="text-artisan-light/40 font-mono text-[10px] uppercase tracking-[0.2em] leading-relaxed">
              Your security credentials have been updated. Redirecting to login terminal...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-artisan-dark flex flex-col lg:flex-row fixed inset-0 overflow-hidden">
      <div className="hidden lg:flex lg:w-1/2 bg-artisan-grey p-24 flex-col justify-between">
        <h2 className="text-8xl xl:text-[10rem] font-display font-extrabold text-artisan-dark uppercase tracking-tighter leading-[0.8]">
          Secure <br />
          <span className="opacity-40">Update.</span>
        </h2>
        <div className="space-y-2">
           <p className="text-xl text-artisan-dark font-display font-extrabold uppercase tracking-widest">Seal the Breach.</p>
           <p className="text-[10px] font-mono text-artisan-dark/40 uppercase tracking-widest">Authentication Protocol v1.0</p>
        </div>
      </div>

      <div className="flex-1 p-8 md:p-12 lg:p-24 flex items-center justify-center overflow-y-auto">
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
               New <br />
               <span className="text-artisan-grey">Credentials.</span>
             </h1>
             <p className="text-artisan-light/40 font-mono text-[10px] uppercase tracking-[0.2em]">
               Establish a new security key for your workshop access.
             </p>
           </motion.div>

           <form onSubmit={handleSubmit} className="space-y-6">
             {(error || localError) && (
               <div className="p-4 bg-artisan-grey/10 border-l-2 border-artisan-grey text-[10px] font-mono text-artisan-grey uppercase tracking-widest mb-4">
                 {error || localError}
               </div>
             )}

             <div className="space-y-2 group">
               <label className="text-[10px] font-mono font-bold text-artisan-light/40 uppercase tracking-[0.2em] group-focus-within:text-artisan-grey transition-colors">New Security Key</label>
               <div className="relative">
                 <div className="absolute left-4 top-1/2 -translate-y-1/2 text-artisan-light/20 group-focus-within:text-artisan-grey transition-colors">
                   <Lock className="w-4 h-4" />
                 </div>
                 <input 
                   type="password" 
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   required
                   placeholder="••••••••"
                   className="w-full bg-transparent border-2 border-artisan-light/10 focus:border-artisan-grey p-4 pl-12 outline-none text-artisan-light font-body transition-all placeholder:text-artisan-light/10"
                 />
               </div>
             </div>

             <div className="space-y-2 group">
               <label className="text-[10px] font-mono font-bold text-artisan-light/40 uppercase tracking-[0.2em] group-focus-within:text-artisan-grey transition-colors">Confirm Key</label>
               <div className="relative">
                 <div className="absolute left-4 top-1/2 -translate-y-1/2 text-artisan-light/20 group-focus-within:text-artisan-grey transition-colors">
                   <Lock className="w-4 h-4" />
                 </div>
                 <input 
                   type="password" 
                   value={confirmPassword}
                   onChange={(e) => setConfirmPassword(e.target.value)}
                   required
                   placeholder="••••••••"
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
               {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                 <>
                   Establish Key
                   <ArrowRight className="w-4 h-4" />
                 </>
               )}
             </motion.button>
           </form>
        </div>
      </div>
      
      {/* Home Link */}
      <div className="absolute top-8 left-8 lg:left-auto lg:right-8 z-[100]">
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
