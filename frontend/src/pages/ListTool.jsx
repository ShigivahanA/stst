import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { 
  Plus, 
  Trash2, 
  ChevronRight, 
  ChevronLeft, 
  Hammer, 
  MapPin, 
  Clock, 
  Camera,
  CheckCircle,
  AlertCircle,
  IndianRupee,
  ShieldCheck,
  Package,
  Wrench,
  Loader2,
  Calendar,
  ShieldAlert
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import api from '../services/api'

const CATEGORIES = ['Rehabilitation', 'Respiratory', 'Diagnostic Tools', 'Elder Care', 'Mother & Baby', 'Pain Relief', 'Wound Care']

export default function ListTool() {
  const { user } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()
  
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    desc: '',
    price: '',
    quantity: '5',
    category: 'Rehabilitation',
    lowstockthreshold: '2',
    active: true,
    image: ''
  })

  // Generate SKU on load
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      sku: 'ST-' + Math.random().toString(36).substring(2, 8).toUpperCase()
    }))
  }, [])

  // Redirect if not verified
  useEffect(() => {
    if (user && !user.isAadharVerified) {
      addToast('Please verify your identity to list tools', 'info')
      navigate('/verification')
    }
  }, [user, navigate, addToast])

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      setFormData(prev => ({
        ...prev,
        image: reader.result
      }))
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async () => {
    try {
      setLoading(true)
      const res = await api.post('/listings', formData)
      addToast('Tool submitted for approval', 'success')
      navigate('/rent')
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to list tool', 'error')
    } finally {
      setLoading(false)
    }
  }

  const progress = (step / 3) * 100

  return (
    <div className="min-h-screen bg-artisan-dark text-artisan-light font-display bg-noise selection:bg-artisan-grey selection:text-artisan-dark pt-24 pb-20">
      
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 z-[100] bg-artisan-light/5">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className="h-full bg-artisan-grey shadow-[0_0_15px_rgba(154,154,154,0.5)]"
        />
      </div>

      <div className="container-custom max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="space-y-4">
             <span className="text-[10px] font-mono font-bold text-artisan-grey uppercase tracking-[0.6em]">Create New Listing</span>
             <h1 className="text-5xl md:text-7xl font-display font-extrabold uppercase tracking-tighter leading-[0.85]">
                LIST YOUR <br />
                <span className="text-outline">TOOL.</span>
             </h1>
          </div>
          <div className="flex items-center gap-6 pb-2">
             <div className="text-right">
                <span className="text-[8px] font-mono text-artisan-grey uppercase tracking-widest block">Step</span>
                <span className="text-2xl font-display font-black text-artisan-light">0{step}/03</span>
             </div>
             <div className="w-12 h-12 rounded-full border border-artisan-light/10 flex items-center justify-center">
                {step === 1 ? <Package className="w-5 h-5 text-artisan-grey" /> : step === 2 ? <Clock className="w-5 h-5 text-artisan-grey" /> : <ShieldCheck className="w-5 h-5 text-artisan-grey" />}
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          <div className="lg:col-span-8 space-y-12">
            
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div 
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-10"
                >
                  {/* SKU & Name */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="group relative border-b-2 border-artisan-light/10 focus-within:border-artisan-grey transition-all pb-4">
                      <label className="block text-[10px] font-mono font-bold text-artisan-light/50 uppercase tracking-[0.3em] mb-4 group-focus-within:text-artisan-grey transition-colors">SKU Code</label>
                      <input 
                        type="text" 
                        required
                        value={formData.sku}
                        onChange={(e) => setFormData({...formData, sku: e.target.value.toUpperCase()})}
                        className="w-full bg-transparent outline-none text-xl md:text-2xl font-display font-bold uppercase text-artisan-light placeholder:text-artisan-light/[0.02]" 
                        placeholder="E.G. SKU-WHEEL-134" 
                      />
                    </div>
                    <div className="group relative border-b-2 border-artisan-light/10 focus-within:border-artisan-grey transition-all pb-4">
                      <label className="block text-[10px] font-mono font-bold text-artisan-light/50 uppercase tracking-[0.3em] mb-4 group-focus-within:text-artisan-grey transition-colors">Product Name</label>
                      <input 
                        type="text" 
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full bg-transparent outline-none text-xl md:text-2xl font-display font-bold uppercase text-artisan-light placeholder:text-artisan-light/[0.02]" 
                        placeholder="E.G. WHEEL CHAIR 134 MAG" 
                      />
                    </div>
                  </div>

                  {/* Category & Quantity */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-4">
                        <label className="block text-[10px] font-mono font-bold text-artisan-light/50 uppercase tracking-[0.3em]">Category</label>
                        <select 
                          value={formData.category}
                          onChange={(e) => setFormData({...formData, category: e.target.value})}
                          className="w-full bg-artisan-light/5 border border-artisan-light/10 p-4 text-[10px] font-mono font-bold uppercase tracking-widest text-artisan-light outline-none focus:border-artisan-grey transition-all appearance-none"
                        >
                          {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                     </div>
                     <div className="group relative border-b-2 border-artisan-light/10 focus-within:border-artisan-grey transition-all pb-4">
                       <label className="block text-[10px] font-mono font-bold text-artisan-light/50 uppercase tracking-[0.3em] mb-4 group-focus-within:text-artisan-grey transition-colors">Initial Quantity</label>
                       <input 
                         type="number" 
                         required
                         min="0"
                         value={formData.quantity}
                         onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                         className="w-full bg-transparent outline-none text-xl md:text-2xl font-display font-bold text-artisan-light" 
                         placeholder="5" 
                       />
                     </div>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div 
                  key="step2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-12"
                >
                  {/* Pricing & Threshold */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="group relative border-b-2 border-artisan-light/10 focus-within:border-artisan-grey transition-all pb-4">
                      <label className="block text-[10px] font-mono font-bold text-artisan-light/50 uppercase tracking-[0.3em] mb-4 group-focus-within:text-artisan-grey transition-colors">Daily Rent (₹)</label>
                      <div className="flex items-center gap-3">
                        <IndianRupee className="w-4 h-4 text-artisan-light/20 group-focus-within:text-artisan-grey transition-colors" />
                        <input 
                          type="number" 
                          required
                          value={formData.price}
                          onChange={(e) => setFormData({...formData, price: e.target.value})}
                          className="w-full bg-transparent outline-none text-xl font-display font-black text-artisan-light" 
                          placeholder="00" 
                        />
                      </div>
                    </div>
                    <div className="group relative border-b-2 border-artisan-light/10 focus-within:border-artisan-grey transition-all pb-4">
                      <label className="block text-[10px] font-mono font-bold text-artisan-light/50 uppercase tracking-[0.3em] mb-4 group-focus-within:text-artisan-grey transition-colors">Low Stock Threshold</label>
                      <input 
                        type="number" 
                        required
                        value={formData.lowstockthreshold}
                        onChange={(e) => setFormData({...formData, lowstockthreshold: e.target.value})}
                        className="w-full bg-transparent outline-none text-xl font-display font-bold text-artisan-light" 
                        placeholder="2" 
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="group relative border-b-2 border-artisan-light/10 focus-within:border-artisan-grey transition-all pb-4">
                    <label className="block text-[10px] font-mono font-bold text-artisan-light/50 uppercase tracking-[0.3em] mb-4 group-focus-within:text-artisan-grey transition-colors">Description</label>
                    <textarea 
                      required
                      value={formData.desc}
                      onChange={(e) => setFormData({...formData, desc: e.target.value})}
                      className="w-full bg-transparent outline-none text-base md:text-lg font-display font-medium text-artisan-light placeholder:text-artisan-light/[0.02] min-h-[120px] resize-none" 
                      placeholder="Tell us more about your product..." 
                    />
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div 
                  key="step3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-12"
                >
                   {/* Product Photo */}
                   <div className="space-y-6">
                      <div className="flex items-center justify-between">
                         <label className="block text-[10px] font-mono font-bold text-artisan-light/50 uppercase tracking-[0.3em]">Product Photo</label>
                         <span className="text-[10px] font-mono text-artisan-grey">{formData.image ? '1/1 Image' : '0/1 Image'}</span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                         {formData.image && (
                           <div className="relative aspect-square border border-artisan-light/10 bg-artisan-light/5 group overflow-hidden col-span-2">
                              <img src={formData.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                              <button onClick={() => setFormData({...formData, image: ''})} className="absolute top-2 right-2 p-1.5 bg-artisan-dark/80 text-artisan-light opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500">
                                 <Trash2 className="w-3 h-3" />
                              </button>
                           </div>
                         )}
                         {!formData.image && (
                           <label className="aspect-square border-2 border-dashed border-artisan-light/10 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-artisan-grey hover:bg-artisan-light/[0.02] transition-all group col-span-2">
                              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                              <Camera className="w-6 h-6 text-artisan-light/10 group-hover:text-artisan-grey" />
                              <span className="text-[8px] font-mono text-artisan-light/20 uppercase tracking-widest">Add Photo</span>
                           </label>
                         )}
                      </div>
                   </div>

                   {/* Active Status */}
                   <div className="space-y-4 pt-6 border-t border-artisan-light/5">
                      <label className="block text-[10px] font-mono font-bold text-artisan-light/50 uppercase tracking-[0.3em]">Listing Status</label>
                      <label className="flex items-center gap-3 cursor-pointer group">
                         <input 
                           type="checkbox" 
                           checked={formData.active} 
                           onChange={(e) => setFormData({...formData, active: e.target.checked})}
                           className="w-4 h-4 rounded border-artisan-light/20 bg-transparent text-artisan-grey focus:ring-artisan-grey"
                         />
                         <span className="text-[10px] font-mono font-bold text-artisan-light uppercase tracking-widest group-hover:text-artisan-grey transition-colors">
                            Active (Visible in Catalog)
                         </span>
                      </label>
                   </div>

                   <div className="p-8 bg-artisan-light/[0.02] border border-artisan-light/10 space-y-6">
                      <div className="flex items-start gap-4">
                         <AlertCircle className="w-5 h-5 text-artisan-grey shrink-0 mt-0.5" />
                         <div className="space-y-1">
                            <p className="text-[10px] font-mono font-bold text-artisan-light uppercase tracking-widest">Verification Process</p>
                            <p className="text-[10px] font-mono text-artisan-light/40 uppercase leading-relaxed">Your listing will be reviewed by our team. Once approved, it will be visible in the marketplace.</p>
                         </div>
                      </div>
                   </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center justify-between pt-12 border-t border-artisan-light/5">
              <button 
                onClick={() => setStep(prev => Math.max(1, prev - 1))}
                disabled={step === 1}
                className="flex items-center gap-3 text-[10px] font-mono font-bold text-artisan-light/50 uppercase tracking-widest hover:text-artisan-light disabled:opacity-0 transition-all"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              
              {step < 3 ? (
                <button 
                  onClick={() => setStep(prev => prev + 1)}
                  className="px-10 py-5 bg-artisan-light text-artisan-dark font-display font-black uppercase tracking-[0.3em] text-xs hover:bg-artisan-grey transition-all flex items-center gap-4"
                >
                  Continue <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button 
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-10 py-5 bg-artisan-grey text-artisan-dark font-display font-black uppercase tracking-[0.3em] text-xs hover:bg-artisan-light transition-all flex items-center gap-4 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Finish & List <CheckCircle className="w-4 h-4" /></>}
                </button>
              )}
            </div>
          </div>

          <div className="lg:col-span-4 hidden lg:block">
            <div className="sticky top-32 space-y-8">
               <div className="p-8 border border-artisan-light/5 bg-artisan-light/[0.01] space-y-6">
                  <div className="w-12 h-12 bg-artisan-grey/10 flex items-center justify-center">
                     <ShieldCheck className="w-6 h-6 text-artisan-grey" />
                  </div>
                  <h3 className="text-xl font-display font-black uppercase text-artisan-light">Stock Management</h3>
                  <div className="space-y-4">
                     <div className="space-y-1">
                        <p className="text-[9px] font-mono font-bold text-artisan-grey uppercase tracking-widest">Unique SKU Code</p>
                        <p className="text-[10px] font-mono text-artisan-light/50 uppercase leading-relaxed">Assign a unique stock keeping unit (SKU) to track inventory levels easily.</p>
                     </div>
                     <div className="space-y-1">
                        <p className="text-[9px] font-mono font-bold text-artisan-grey uppercase tracking-widest">Low Stock Alert</p>
                        <p className="text-[10px] font-mono text-artisan-light/50 uppercase leading-relaxed">Set a custom threshold. You will receive notifications when inventory falls below this limit.</p>
                     </div>
                  </div>
               </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
