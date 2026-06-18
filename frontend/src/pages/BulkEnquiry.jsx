import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, ChevronRight, Mail, Phone, MapPin, Loader2, ArrowLeft, ArrowUpRight } from 'lucide-react'
import api from '../services/api'
import { useToast } from '../context/ToastContext'

export default function BulkEnquiry() {
  const [searchParams] = useSearchParams()
  const { addToast } = useToast()
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
  const [budget, setBudget] = useState('₹50,000 - ₹2,00,000')
  const [timeline, setTimeline] = useState('Within 30 Days')

  // Utility states
  const [productsList, setProductsList] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

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
                <div className="border border-artisan-light/10 bg-artisan-light/[0.01] p-6 space-y-4 font-mono text-[10px] uppercase tracking-widest text-artisan-grey">
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
                <div className="space-y-3 font-mono text-[10px] uppercase tracking-widest">
                  <div className="flex items-center gap-3 text-artisan-light/50">
                    <Phone className="w-4 h-4 text-artisan-grey" />
                    <span>Call or WhatsApp: +91 86086 78828</span>
                  </div>
                  <div className="flex items-center gap-3 text-artisan-light/50">
                    <Mail className="w-4 h-4 text-artisan-grey" />
                    <span>Email: statsurgicalsupplies@gmail.com</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Detailed Form */}
              <div className="lg:col-span-7 bg-artisan-light/[0.01] border border-artisan-light/10 p-8 sm:p-10 shadow-2xl relative">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <h3 className="text-sm font-mono font-bold uppercase tracking-widest text-artisan-light border-b border-artisan-light/5 pb-3">
                    Request a Custom Quote
                  </h3>

                  {/* Two-column contact details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-[8px] font-mono font-bold text-artisan-light/40 uppercase tracking-widest block">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Dr. Shigivahan"
                        required
                        className="w-full bg-artisan-light/[0.01] border border-artisan-light/15 p-3 text-xs font-mono text-artisan-light uppercase tracking-widest outline-none focus:border-artisan-grey transition-all rounded-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[8px] font-mono font-bold text-artisan-light/40 uppercase tracking-widest block">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="shigivahan@gmail.com"
                        required
                        className="w-full bg-artisan-light/[0.01] border border-artisan-light/15 p-3 text-xs font-mono text-artisan-light lowercase outline-none focus:border-artisan-grey transition-all rounded-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-[8px] font-mono font-bold text-artisan-light/40 uppercase tracking-widest block">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        required
                        className="w-full bg-artisan-light/[0.01] border border-artisan-light/15 p-3 text-xs font-mono text-artisan-light uppercase tracking-widest outline-none focus:border-artisan-grey transition-all rounded-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[8px] font-mono font-bold text-artisan-light/40 uppercase tracking-widest block">
                        Hospital or Company Name (Optional)
                      </label>
                      <input
                        type="text"
                        value={organization}
                        onChange={e => setOrganization(e.target.value)}
                        placeholder="Apollo Specialty Hospitals"
                        className="w-full bg-artisan-light/[0.01] border border-artisan-light/15 p-3 text-xs font-mono text-artisan-light uppercase tracking-widest outline-none focus:border-artisan-grey transition-all rounded-none"
                      />
                    </div>
                  </div>

                  {/* Product Selector */}
                  <div className="space-y-1.5">
                    <label className="text-[8px] font-mono font-bold text-artisan-light/40 uppercase tracking-widest block">
                      Select Product
                    </label>
                    {loadingProducts ? (
                      <div className="flex items-center gap-2 py-3">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-artisan-grey" />
                        <span className="text-[10px] font-mono text-artisan-light/35 uppercase">Loading catalog...</span>
                      </div>
                    ) : (
                      <select
                        value={productId}
                        onChange={handleProductChange}
                        className="w-full bg-artisan-dark border border-artisan-light/15 p-3 text-xs font-mono text-artisan-light uppercase tracking-widest outline-none focus:border-artisan-grey transition-all rounded-none"
                      >
                        <option value="">-- Other Product / General Enquiry --</option>
                        {productsList.map(p => (
                          <option key={p._id} value={p._id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Quantity and Budget row */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-[8px] font-mono font-bold text-artisan-light/40 uppercase tracking-widest block">
                        Quantity *
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={e => setQuantity(e.target.value)}
                        required
                        className="w-full bg-artisan-light/[0.01] border border-artisan-light/15 p-3 text-xs font-mono text-artisan-light uppercase tracking-widest outline-none focus:border-artisan-grey transition-all rounded-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[8px] font-mono font-bold text-artisan-light/40 uppercase tracking-widest block">
                        Estimated Budget
                      </label>
                      <select
                        value={budget}
                        onChange={e => setBudget(e.target.value)}
                        className="w-full bg-artisan-dark border border-artisan-light/15 p-3 text-xs font-mono text-artisan-light uppercase tracking-widest outline-none focus:border-artisan-grey transition-all rounded-none"
                      >
                        <option value="Under ₹50,000">Under ₹50,000</option>
                        <option value="₹50,000 - ₹2,00,000">₹50,000 - ₹2,00,000</option>
                        <option value="₹2,00,000 - ₹5,00,000">₹2,00,000 - ₹5,00,000</option>
                        <option value="Above ₹5,0,000">Above ₹5,0,000</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[8px] font-mono font-bold text-artisan-light/40 uppercase tracking-widest block">
                        When do you need it?
                      </label>
                      <select
                        value={timeline}
                        onChange={e => setTimeline(e.target.value)}
                        className="w-full bg-artisan-dark border border-artisan-light/15 p-3 text-xs font-mono text-artisan-light uppercase tracking-widest outline-none focus:border-artisan-grey transition-all rounded-none"
                      >
                        <option value="Immediate">Immediate</option>
                        <option value="Within 30 Days">Within 30 Days</option>
                        <option value="1 - 3 Months">1 - 3 Months</option>
                        <option value="Flexible">Flexible</option>
                      </select>
                    </div>
                  </div>

                  {/* Requirements Textarea */}
                  <div className="space-y-1.5">
                    <label className="text-[8px] font-mono font-bold text-artisan-light/40 uppercase tracking-widest block">
                      What do you need? (Please describe your order) *
                    </label>
                    <textarea
                      value={requirements}
                      onChange={e => setRequirements(e.target.value)}
                      placeholder="Tell us what you need. Mention any specific models, delivery dates, or special instructions..."
                      rows={5}
                      required
                      className="w-full bg-artisan-light/[0.01] border border-artisan-light/15 p-3 text-xs font-mono text-artisan-light uppercase tracking-wide outline-none focus:border-artisan-grey transition-all resize-none leading-relaxed rounded-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-4 bg-artisan-light text-artisan-dark font-display font-extrabold uppercase tracking-widest text-xs hover:bg-artisan-grey transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                    >
                      {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Bulk Enquiry'}
                    </button>
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
              className="max-w-xl mx-auto border border-artisan-light/10 bg-artisan-light/[0.01] p-10 text-center space-y-6 shadow-2xl relative"
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
                  className="px-6 py-3.5 border border-artisan-light/10 text-artisan-light/60 hover:text-artisan-light hover:border-artisan-light font-mono text-[10px] font-bold uppercase tracking-widest transition-all"
                >
                  Continue Browsing
                </Link>
                <Link
                  to="/"
                  className="px-6 py-3.5 bg-artisan-grey text-artisan-dark font-mono text-[10px] font-bold uppercase tracking-widest hover:bg-artisan-light hover:text-artisan-dark transition-all duration-300"
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
