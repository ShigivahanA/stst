import { useState, useEffect, useRef } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, ChevronRight, ChevronDown, Mail, Phone, MapPin, Loader2, ArrowLeft, ArrowUpRight } from 'lucide-react'
import api from '../services/api'
import { useToast } from '../context/ToastContext'
import SEO from '../components/SEO'
import { useAuth } from '../context/AuthContext'

const WhatsAppIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.717-1.458L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.965C16.528 2.028 14.07 1.001 11.93 1.001c-5.438 0-9.863 4.372-9.867 9.802-.001 1.73.473 3.424 1.378 4.921l-.947 3.46 3.553-.93zm10.224-4.881c-.272-.137-1.61-.795-1.86-.886-.25-.092-.432-.137-.61.137-.182.273-.706.886-.865 1.068-.158.182-.317.205-.59.069-.272-.137-1.15-.424-2.19-1.354-.809-.722-1.354-1.616-1.513-1.889-.159-.273-.018-.42.119-.556.123-.121.272-.318.41-.477.136-.159.182-.272.272-.455.092-.181.046-.341-.023-.478-.069-.136-.61-1.477-.836-2.023-.22-.528-.464-.456-.63-.463-.164-.007-.353-.008-.542-.008-.189 0-.497.07-.757.353-.26.284-.993.971-.993 2.37 0 1.399 1.018 2.748 1.16 2.93.143.183 2.002 3.059 4.85 4.286.677.292 1.206.467 1.618.597.68.217 1.3.187 1.79.114.545-.081 1.61-.659 1.838-1.263.228-.604.228-1.121.16-1.23-.07-.107-.25-.172-.523-.309z" />
  </svg>
)

export default function BulkEnquiry() {
  const [searchParams] = useSearchParams()
  const { addToast } = useToast()
  const { user } = useAuth()
  const initialProductId = searchParams.get('productId') || ''

  // Form states
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [organization, setOrganization] = useState('')
  const [productId, setProductId] = useState(initialProductId)
  const [productName, setProductName] = useState('')
  const [quantity, setQuantity] = useState('10')
  const [requirements, setRequirements] = useState('')
  const [budget, setBudget] = useState('₹50,000 - ₹2,0,000') // Fixed typo below or matches standard budget options
  const [timeline, setTimeline] = useState('Within 30 Days')

  // Utility states
  const [productsList, setProductsList] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  // Custom dropdown states and refs
  const [isProductOpen, setIsProductOpen] = useState(false)
  const [isBudgetOpen, setIsBudgetOpen] = useState(false)
  const [isTimelineOpen, setIsTimelineOpen] = useState(false)

  const productRef = useRef(null)
  const budgetRef = useRef(null)
  const timelineRef = useRef(null)

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (productRef.current && !productRef.current.contains(e.target)) {
        setIsProductOpen(false)
      }
      if (budgetRef.current && !budgetRef.current.contains(e.target)) {
        setIsBudgetOpen(false)
      }
      if (timelineRef.current && !timelineRef.current.contains(e.target)) {
        setIsTimelineOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Load active products list for dropdown selection
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoadingProducts(true)
        const res = await api.get('/listings')
        const items = res.data.data || []
        setProductsList(items)

        // If a productId was passed, resolve its name
        if (initialProductId) {
          const match = items.find(p => p._id === initialProductId)
          if (match) {
            setProductName(match.name)
          }
        }
      } catch (err) {
        console.error('Failed to load products list:', err)
      } finally {
        setLoadingProducts(false)
      }
    }
    fetchProducts()
  }, [initialProductId])

  // Autofetch user details if logged in (for regular users/customers only, not admins)
  useEffect(() => {
    if (user && user.role !== 'admin') {
      if (user.name) setName(user.name)
      if (user.email) setEmail(user.email)
      if (user.phone) setPhone(user.phone)
    }
  }, [user])

  // Update product ID when selection changes
  const handleProductChange = (e) => {
    const val = e.target.value
    setProductId(val)
    if (val === '') {
      setProductName('')
    } else {
      const match = productsList.find(p => p._id === val)
      if (match) {
        setProductName(match.name)
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!name.trim() || !email.trim() || !phone.trim() || !requirements.trim() || !quantity) {
      addToast('Please fill all required fields', 'error')
      return
    }

    try {
      setSubmitting(true)
      await api.post('/bulk-enquiries', {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        organization: organization.trim(),
        productId: productId || undefined,
        productName: productName.trim() || undefined,
        quantity: parseInt(quantity) || 1,
        requirements: requirements.trim(),
        budget,
        timeline
      })
      setIsSuccess(true)
      addToast('Bulk enquiry submitted successfully', 'success')
    } catch (err) {
      console.error(err)
      addToast(err.response?.data?.message || 'Failed to submit bulk enquiry', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-artisan-dark bg-noise pt-32 pb-24 text-artisan-light">
      <SEO
        title="Bulk Orders & Institutional Sales"
        description="Get wholesale pricing and custom quotes on volume orders of surgical supplies, respiratory devices, and medical instruments from Stat Surgicals."
        keywords={['bulk medical supplies', 'wholesale hospital supplies', 'medical equipment distributor india', 'bulk surgical tools']}
        canonicalPath="/bulk-enquiry"
      />
      <div className="container-custom max-w-5xl">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            to={productId ? `/product/${productId}` : '/allproduct'}
            className="inline-flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-widest text-artisan-grey hover:text-artisan-light transition-colors group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            Back to Catalog
          </Link>
        </div>

        <AnimatePresence mode="wait">
          {!isSuccess ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-12"
            >
              {/* Left Column: Info & Details */}
              <div className="lg:col-span-5 space-y-8">
                <div className="space-y-4">
                  <h1 className="text-4xl sm:text-5xl font-display font-black uppercase tracking-tighter leading-none text-artisan-light">
                    BULK ORDER <span className="text-outline">ENQUIRY.</span>
                  </h1>
                  <p className="text-xs font-mono text-artisan-light/50 uppercase tracking-widest leading-relaxed">
                    Need to order in large quantities? Fill out the form below to get a custom quote. We support hospitals, clinics, and bulk buyers with special discounts.
                  </p>
                </div>

                {/* Advantage list */}
                <div className="border border-artisan-light/10 bg-artisan-light/[0.01] p-6 space-y-4 font-mono text-[10px] uppercase tracking-widest text-artisan-grey rounded-2xl">
                  <p className="border-b border-artisan-light/5 pb-2 font-bold text-artisan-light">Why Buy in Bulk?</p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-artisan-grey rounded-full" />
                      Higher Discounts for Larger Quantities
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-artisan-grey rounded-full" />
                      Flexible Payment Options
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-artisan-grey rounded-full" />
                      Special Shipping Rates
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-artisan-grey rounded-full" />
                      Fast Delivery & Dedicated Support
                    </li>
                  </ul>
                </div>

                {/* Contact support details */}
                <div className="space-y-6">
                  <div className="pt-2">
                    <motion.a
                      href="mailto:statsurgicalsupplies@gmail.com"
                      className="w-full px-6 py-4 border-2 border-artisan-light text-artisan-light font-display font-extrabold tracking-widest text-[10px] flex items-center justify-center gap-3 cursor-pointer rounded-full"
                      initial={{ y: 0, boxShadow: "0 6px 0 0 #252422" }}
                      whileHover={{
                        y: -2,
                        boxShadow: "0 8px 0 0 #252422",
                        backgroundColor: "rgba(37, 36, 34, 0.04)"
                      }}
                      whileTap={{
                        y: 6,
                        boxShadow: "0 0px 0 0 #252422"
                      }}
                      transition={{ type: "spring", stiffness: 600, damping: 18 }}
                    >
                      <Mail className="w-4 h-4 text-artisan-grey" />
                      statsurgicalsupplies@gmail.com
                    </motion.a>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 pt-2">
                    <motion.a
                      href="tel:+918608678828"
                      className="flex-1 px-6 py-4 bg-artisan-light text-artisan-dark font-display font-extrabold uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 cursor-pointer rounded-full border border-black"
                      initial={{ y: 0, boxShadow: "0 6px 0 0 #000000" }}
                      whileHover={{
                        y: -2,
                        boxShadow: "0 8px 0 0 #000000",
                        backgroundColor: "#eb5e28"
                      }}
                      whileTap={{
                        y: 6,
                        boxShadow: "0 0px 0 0 #000000"
                      }}
                      transition={{ type: "spring", stiffness: 600, damping: 18 }}
                    >
                      <Phone className="w-4 h-4" />
                      Call Support
                    </motion.a>

                    <motion.a
                      href="https://wa.me/918608678828"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 px-6 py-4 bg-[#128c7e] text-white font-display font-extrabold uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 cursor-pointer rounded-full border border-[#0b544c]"
                      initial={{ y: 0, boxShadow: "0 6px 0 0 #075e54" }}
                      whileHover={{
                        y: -2,
                        boxShadow: "0 8px 0 0 #075e54",
                        backgroundColor: "#159c8d"
                      }}
                      whileTap={{
                        y: 6,
                        boxShadow: "0 0px 0 0 #075e54"
                      }}
                      transition={{ type: "spring", stiffness: 600, damping: 18 }}
                    >
                      <WhatsAppIcon className="w-4 h-4" />
                      WhatsApp Us
                    </motion.a>
                  </div>
                </div>
              </div>

              {/* Right Column: Detailed Form */}
              <div className="lg:col-span-7 bg-artisan-light/[0.01] border border-artisan-light/10 p-8 sm:p-10 shadow-2xl relative rounded-2xl">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <h3 className="text-sm font-mono font-bold uppercase tracking-widest text-artisan-light border-b border-artisan-light/5 pb-3">
                    Request a Custom Quote
                  </h3>

                  {/* Two-column contact details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-[8px] font-mono font-bold text-artisan-grey uppercase tracking-widest block">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Charan Vivek"
                        required
                        className="w-full bg-artisan-light/[0.01] border border-artisan-light/15 p-3 text-xs font-mono text-artisan-light uppercase tracking-widest outline-none focus:border-artisan-grey transition-all rounded-2xl"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[8px] font-mono font-bold text-artisan-grey uppercase tracking-widest block">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="statsurgicalsupplies@gmail.com"
                        required
                        className="w-full bg-artisan-light/[0.01] border border-artisan-light/15 p-3 text-xs font-mono text-artisan-light lowercase outline-none focus:border-artisan-grey transition-all rounded-2xl"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-[8px] font-mono font-bold text-artisan-grey uppercase tracking-widest block">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        placeholder="+91 86086 78828"
                        required
                        className="w-full bg-artisan-light/[0.01] border border-artisan-light/15 p-3 text-xs font-mono text-artisan-light uppercase tracking-widest outline-none focus:border-artisan-grey transition-all rounded-2xl"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[8px] font-mono font-bold text-artisan-grey uppercase tracking-widest block">
                        Hospital or Company Name (Optional)
                      </label>
                      <input
                        type="text"
                        value={organization}
                        onChange={e => setOrganization(e.target.value)}
                        placeholder="STAT Specialty Hospitals"
                        className="w-full bg-artisan-light/[0.01] border border-artisan-light/15 p-3 text-xs font-mono text-artisan-light uppercase tracking-widest outline-none focus:border-artisan-grey transition-all rounded-2xl"
                      />
                    </div>
                  </div>

                  {/* Product Selector */}
                  <div className="relative" ref={productRef}>
                    <div className="space-y-1.5">
                      <label className="text-[8px] font-mono font-bold text-artisan-grey uppercase tracking-widest block">
                        Select Product
                      </label>
                      {loadingProducts ? (
                        <div className="flex items-center gap-2 py-3">
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-artisan-grey" />
                          <span className="text-[10px] font-mono text-artisan-light/35 uppercase">Loading catalog...</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setIsProductOpen(!isProductOpen)
                            setIsBudgetOpen(false)
                            setIsTimelineOpen(false)
                          }}
                          className="w-full bg-artisan-light/[0.01] border border-artisan-light/15 p-3 text-xs font-mono text-artisan-light uppercase tracking-widest text-left flex justify-between items-center rounded-2xl focus:border-artisan-grey transition-all"
                        >
                          <span className="truncate pr-4">
                            {productName || '-- Other Product / General Enquiry --'}
                          </span>
                          <ChevronDown className={`w-4 h-4 text-artisan-light/40 shrink-0 transition-transform duration-300 ${isProductOpen ? 'rotate-180' : ''}`} />
                        </button>
                      )}
                    </div>

                    {!loadingProducts && (
                      <AnimatePresence>
                        {isProductOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="absolute top-full left-0 z-50 w-full mt-2 bg-artisan-dark/95 backdrop-blur-md border border-artisan-light/10 shadow-2xl rounded-xl py-2 max-h-60 overflow-y-auto"
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setProductId('')
                                setProductName('')
                                setIsProductOpen(false)
                              }}
                              className="w-full text-left px-4 py-3 hover:bg-artisan-light/[0.05] font-mono text-[10px] uppercase tracking-wider transition-colors border-b border-artisan-light/5 text-artisan-light/70 hover:text-artisan-light"
                            >
                              -- Other Product / General Enquiry --
                            </button>
                            {productsList.map((p) => (
                              <button
                                key={p._id}
                                type="button"
                                onClick={() => {
                                  setProductId(p._id)
                                  setProductName(p.name)
                                  setIsProductOpen(false)
                                }}
                                className="w-full text-left px-4 py-3 hover:bg-artisan-light/[0.05] font-mono text-[10px] uppercase tracking-wider transition-colors border-b border-artisan-light/5 last:border-0 text-artisan-light/70 hover:text-artisan-light"
                              >
                                {p.name}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    )}
                  </div>

                  {/* Quantity and Budget row */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-[8px] font-mono font-bold text-artisan-grey uppercase tracking-widest block">
                        Quantity *
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={e => setQuantity(e.target.value)}
                        required
                        className="w-full bg-artisan-light/[0.01] border border-artisan-light/15 p-3 text-xs font-mono text-artisan-light uppercase tracking-widest outline-none focus:border-artisan-grey transition-all rounded-2xl"
                      />
                    </div>

                    <div className="relative" ref={budgetRef}>
                      <div className="space-y-1.5">
                        <label className="text-[8px] font-mono font-bold text-artisan-grey uppercase tracking-widest block">
                          Estimated Budget
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setIsBudgetOpen(!isBudgetOpen)
                            setIsProductOpen(false)
                            setIsTimelineOpen(false)
                          }}
                          className="w-full bg-artisan-light/[0.01] border border-artisan-light/15 p-3 text-xs font-mono text-artisan-light uppercase tracking-widest text-left flex justify-between items-center rounded-2xl focus:border-artisan-grey transition-all"
                        >
                          <span className="truncate pr-4">
                            {budget}
                          </span>
                          <ChevronDown className={`w-4 h-4 text-artisan-light/40 shrink-0 transition-transform duration-300 ${isBudgetOpen ? 'rotate-180' : ''}`} />
                        </button>
                      </div>

                      <AnimatePresence>
                        {isBudgetOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="absolute top-full left-0 z-50 w-full mt-2 bg-artisan-dark/95 backdrop-blur-md border border-artisan-light/10 shadow-2xl rounded-xl py-2 max-h-60 overflow-y-auto"
                          >
                            {[
                              'Under ₹50,000',
                              '₹50,000 - ₹2,00,000',
                              '₹2,00,000 - ₹5,00,000',
                              'Above ₹5,00,000'
                            ].map((opt) => (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => {
                                  setBudget(opt)
                                  setIsBudgetOpen(false)
                                }}
                                className="w-full text-left px-4 py-3 hover:bg-artisan-light/[0.05] font-mono text-[10px] uppercase tracking-wider transition-colors border-b border-artisan-light/5 last:border-0 text-artisan-light/70 hover:text-artisan-light"
                              >
                                {opt}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="relative" ref={timelineRef}>
                      <div className="space-y-1.5">
                        <label className="text-[8px] font-mono font-bold text-artisan-grey uppercase tracking-widest block">
                          When do you need it?
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setIsTimelineOpen(!isTimelineOpen)
                            setIsProductOpen(false)
                            setIsBudgetOpen(false)
                          }}
                          className="w-full bg-artisan-light/[0.01] border border-artisan-light/15 p-3 text-xs font-mono text-artisan-light uppercase tracking-widest text-left flex justify-between items-center rounded-2xl focus:border-artisan-grey transition-all"
                        >
                          <span className="truncate pr-4">
                            {timeline}
                          </span>
                          <ChevronDown className={`w-4 h-4 text-artisan-light/40 shrink-0 transition-transform duration-300 ${isTimelineOpen ? 'rotate-180' : ''}`} />
                        </button>
                      </div>

                      <AnimatePresence>
                        {isTimelineOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="absolute top-full left-0 z-50 w-full mt-2 bg-artisan-dark/95 backdrop-blur-md border border-artisan-light/10 shadow-2xl rounded-xl py-2 max-h-60 overflow-y-auto"
                          >
                            {[
                              'Immediate',
                              'Within 30 Days',
                              '1 - 3 Months',
                              'Flexible'
                            ].map((opt) => (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => {
                                  setTimeline(opt)
                                  setIsTimelineOpen(false)
                                }}
                                className="w-full text-left px-4 py-3 hover:bg-artisan-light/[0.05] font-mono text-[10px] uppercase tracking-wider transition-colors border-b border-artisan-light/5 last:border-0 text-artisan-light/70 hover:text-artisan-light"
                              >
                                {opt}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Requirements Textarea */}
                  <div className="space-y-1.5">
                    <label className="text-[8px] font-mono font-bold text-artisan-grey uppercase tracking-widest block">
                      What do you need? (Please describe your order) *
                    </label>
                    <textarea
                      value={requirements}
                      onChange={e => setRequirements(e.target.value)}
                      placeholder="Tell us what you need. Mention any specific models, delivery dates, or special instructions..."
                      rows={5}
                      required
                      className="w-full bg-artisan-light/[0.01] border border-artisan-light/15 p-3 text-xs font-mono text-artisan-light uppercase tracking-wide outline-none focus:border-artisan-grey transition-all resize-none leading-relaxed rounded-2xl"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <motion.button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-4 bg-artisan-light text-artisan-dark font-display font-extrabold uppercase tracking-widest text-xs flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer rounded-full border border-black"
                      initial={{ y: 0, boxShadow: submitting ? "0 0px 0 0 #000000" : "0 6px 0 0 #000000" }}
                      whileHover={submitting ? {} : {
                        y: -2,
                        boxShadow: "0 8px 0 0 #000000",
                        backgroundColor: "#eb5e28"
                      }}
                      whileTap={submitting ? {} : {
                        y: 6,
                        boxShadow: "0 0px 0 0 #000000"
                      }}
                      transition={{ type: "spring", stiffness: 600, damping: 18 }}
                    >
                      {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Bulk Enquiry'}
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-xl mx-auto border border-artisan-light/10 bg-artisan-light/[0.01] p-10 text-center space-y-6 shadow-2xl relative rounded-2xl overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-[2px] bg-artisan-grey" />
              <CheckCircle2 className="w-16 h-16 text-artisan-light mx-auto animate-bounce" />

              <div className="space-y-3">
                <h2 className="text-2xl font-display font-black uppercase tracking-tight text-artisan-light">
                  Enquiry Submitted!
                </h2>
                <p className="text-xs font-mono text-artisan-light/40 uppercase tracking-widest leading-relaxed">
                  We have received your request. A copy of your submission has been sent to your email.
                </p>
                <p className="text-[10px] font-mono text-artisan-grey uppercase tracking-widest leading-relaxed">
                  Our sales team will contact you via phone or email within 24 hours.
                </p>
              </div>

              <div className="pt-6 flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/allproduct"
                  className="px-6 py-3.5 border border-artisan-light/10 text-artisan-light/60 hover:text-artisan-light hover:border-artisan-light font-mono text-[10px] font-bold uppercase tracking-widest transition-all rounded-xl"
                >
                  Continue Browsing
                </Link>
                <Link
                  to="/"
                  className="px-6 py-3.5 bg-artisan-grey text-artisan-dark font-mono text-[10px] font-bold uppercase tracking-widest hover:bg-artisan-light hover:text-artisan-dark transition-all duration-300 rounded-xl"
                >
                  Return to Home
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
