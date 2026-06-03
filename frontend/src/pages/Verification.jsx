import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldCheck, ArrowRight, Loader2, Key, Fingerprint, CheckCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useNavigate } from 'react-router-dom'

export default function Verification() {
  const { verifyAadharOTP, confirmAadharVerification, loading } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()
  const [step, setStep] = useState(1) // 1: Input Aadhar, 2: OTP
  const [aadharNumber, setAadharNumber] = useState('')
  const [otp, setOtp] = useState('')

  const handleSendOTP = async (e) => {
    e.preventDefault()
    if (aadharNumber.length !== 12) {
      addToast('Please enter a valid 12-digit Aadhar number', 'error')
      return
    }
    try {
      await verifyAadharOTP(aadharNumber)
      addToast('OTP sent to linked mobile number', 'success')
      setStep(2)
    } catch (err) {
      addToast('Failed to send OTP. Please try again.', 'error')
    }
  }

  const handleVerify = async (e) => {
    e.preventDefault()
    try {
      await confirmAadharVerification(aadharNumber, otp)
      addToast('Aadhar Verification Successful', 'success')
      setStep(3) // Success state
      setTimeout(() => navigate('/profile'), 3000)
    } catch (err) {
      addToast('Invalid OTP. Please check and try again.', 'error')
    }
  }

  return (
    <div className="min-h-screen bg-artisan-dark bg-noise pt-32 pb-24 flex items-center justify-center">
      <div className="container-custom max-w-xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-artisan-light/[0.02] border border-artisan-light/10 p-8 md:p-12 space-y-12 relative overflow-hidden"
        >
          {/* Brutalist Background Text */}
          <div className="absolute top-0 right-0 p-4 opacity-5 text-[6rem] font-display font-black select-none pointer-events-none leading-none">
            GOVT
          </div>

          <div className="space-y-4 relative z-10">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-artisan-grey" />
              <span className="text-[10px] font-mono font-bold text-artisan-grey uppercase tracking-[0.6em]">Official Identity</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-extrabold uppercase tracking-tighter leading-tight text-artisan-light">
              Trust <br />
              <span className="text-outline">Verification.</span>
            </h1>
            <p className="text-xs font-mono text-artisan-light/40 uppercase tracking-widest leading-relaxed">
              Verify your Aadhar to become a trusted member of the ForgeShare artisan circle. This enables premium features and builds trust within the community.
            </p>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.form
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleSendOTP}
                className="space-y-8"
              >
                <div className="group relative border-b border-artisan-light/10 focus-within:border-artisan-grey transition-all duration-500 pb-2">
                  <label className="block text-[9px] font-mono font-bold text-artisan-light/30 uppercase tracking-[0.3em] mb-1 group-focus-within:text-artisan-grey transition-colors">
                    Aadhar Number
                  </label>
                  <div className="flex items-center gap-4">
                    <Fingerprint className="w-5 h-5 text-artisan-light/20 group-focus-within:text-artisan-grey transition-colors" />
                    <input
                      type="text"
                      maxLength={12}
                      value={aadharNumber}
                      onChange={(e) => setAadharNumber(e.target.value.replace(/\D/g, ''))}
                      placeholder="1234 5678 9012"
                      required
                      className="flex-1 bg-transparent outline-none text-xl md:text-2xl font-display font-bold uppercase text-artisan-light tracking-[0.2em] placeholder:text-artisan-light/5"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-5 bg-artisan-grey text-artisan-dark font-display font-black uppercase tracking-widest text-[10px] hover:bg-artisan-light transition-all flex items-center justify-center gap-4 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Send Verification OTP <ArrowRight className="w-4 h-4" /></>}
                </button>
              </motion.form>
            )}

            {step === 2 && (
              <motion.form
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleVerify}
                className="space-y-8"
              >
                <div className="group relative border-b border-artisan-light/10 focus-within:border-artisan-grey transition-all duration-500 pb-2">
                  <label className="block text-[9px] font-mono font-bold text-artisan-light/30 uppercase tracking-[0.3em] mb-1 group-focus-within:text-artisan-grey transition-colors">
                    Verification Code
                  </label>
                  <div className="flex items-center gap-4">
                    <Key className="w-5 h-5 text-artisan-light/20 group-focus-within:text-artisan-grey transition-colors" />
                    <input
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="000000"
                      required
                      className="flex-1 bg-transparent outline-none text-3xl md:text-4xl font-display font-bold uppercase text-artisan-light tracking-[0.5em] placeholder:text-artisan-light/5"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-5 bg-artisan-grey text-artisan-dark font-display font-black uppercase tracking-widest text-[10px] hover:bg-artisan-light transition-all flex items-center justify-center gap-4 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Confirm Verification <ArrowRight className="w-4 h-4" /></>}
                </button>
                
                <button 
                  type="button" 
                  onClick={() => setStep(1)}
                  className="w-full text-[9px] font-mono text-artisan-light/30 uppercase tracking-widest hover:text-artisan-light transition-colors"
                >
                  Wrong Number? Change Aadhar
                </button>
              </motion.form>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-12 text-center space-y-6"
              >
                <div className="w-20 h-20 bg-green-500/10 border border-green-500 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-10 h-10 text-green-500" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-display font-black text-artisan-light uppercase tracking-tight">Identity Confirmed</h3>
                  <p className="text-[10px] font-mono text-artisan-light/40 uppercase tracking-widest">
                    Welcome to the verified circle. Redirecting to your artisan profile...
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="pt-8 border-t border-artisan-light/5 flex items-center justify-between text-[8px] font-mono text-artisan-light/20 uppercase tracking-widest">
            <span>Security Standard: AES-256</span>
            <span>UIDAI Compliant Pipeline</span>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
