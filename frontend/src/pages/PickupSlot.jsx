import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Calendar as CalendarIcon,
  Clock,
  HelpCircle,
  ArrowRight,
  Loader2,
  CheckCircle2,
  ArrowLeft
} from 'lucide-react'
import api from '../services/api'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'
import SEO from '../components/SEO'

export default function PickupSlot() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const { addToast } = useToast()
  const { user: currentUser } = useAuth()

  const [loading, setLoading] = useState(true)
  const [order, setOrder] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Slot states
  const [dates, setDates] = useState([])
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedSlot, setSelectedSlot] = useState(null)

  const timeSlots = [
    '9:00 AM - 11:00 AM',
    '11:00 AM - 1:00 PM',
    '2:00 PM - 4:00 PM',
    '4:00 PM - 6:00 PM'
  ]

  // Generate available pickup dates (next 6 business days starting tomorrow, skipping Sundays)
  const generateAvailableDates = () => {
    const available = []
    const temp = new Date()
    let daysAdded = 0
    while (daysAdded < 6) {
      temp.setDate(temp.getDate() + 1)
      if (temp.getDay() !== 0) { // 0 is Sunday
        available.push(new Date(temp))
        daysAdded++
      }
    }
    setDates(available)
    if (available.length > 0) {
      setSelectedDate(available[0])
    }
  }

  const fetchOrder = async () => {
    try {
      setLoading(true)
      const res = await api.get(`/orders/${orderId}`)
      const orderData = res.data.data

      const orderUserStr = (orderData && orderData.user && typeof orderData.user === 'object')
        ? orderData.user?._id?.toString()
        : orderData?.user?.toString();
      const currentUserStr = currentUser?._id?.toString();

      if (!orderData || !orderUserStr || orderUserStr !== currentUserStr) {
        addToast('YOU ARE NOT AUTHORIZED TO SET SLOT FOR THIS ORDER', 'error')
        navigate('/')
        return
      }

      if (orderData.deliveryOption !== 'instore_pickup') {
        addToast('This order is not configured for in-store pickup.', 'error')
        navigate('/')
        return
      }
      setOrder(orderData)
      generateAvailableDates()
    } catch (err) {
      console.error(err)
      const isForbidden = err.response?.status === 403
      addToast(
        isForbidden
          ? 'YOU ARE NOT AUTHORIZED TO SET SLOT FOR THIS ORDER'
          : (err.response?.data?.message || 'Failed to retrieve order details.'),
        'error'
      )
      navigate('/history')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrder()
  }, [orderId])

  const handleConfirmSlot = async () => {
    if (!selectedDate || !selectedSlot) {
      addToast('Please select a pickup date and time slot.', 'error')
      return
    }

    try {
      setIsSubmitting(true)
      await api.post(`/orders/${orderId}/pickup-slot`, {
        date: selectedDate.toISOString(),
        time: selectedSlot
      })
      addToast('Pickup slot confirmed successfully!', 'success')
      navigate(`/orders/${orderId}`)
    } catch (err) {
      console.error(err)
      addToast(err.response?.data?.message || 'Failed to confirm pickup slot.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-artisan-dark flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-12 h-12 text-artisan-grey animate-spin" />
        <span className="text-[10px] font-mono text-artisan-light/20 uppercase tracking-widest">Loading slot planner...</span>
      </div>
    )
  }

  if (!order) return null

  return (
    <div className="min-h-screen bg-artisan-dark bg-noise pt-24 md:pt-32 pb-24 text-artisan-light font-body">
      <SEO title="Schedule Pickup Slot" robots="noindex, nofollow" />
      <div className="container-custom max-w-4xl mx-auto space-y-8">

        {/* BACK LINK */}
        <div>
          <Link
            to={`/orders/${orderId}`}
            className="inline-flex items-center gap-3 group"
          >
            <div className="w-8 h-8 border border-artisan-light/10 flex items-center justify-center group-hover:bg-artisan-light group-hover:text-artisan-dark transition-all rounded-full">
              <ArrowLeft className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-mono font-bold text-artisan-light/40 uppercase tracking-[0.4em] group-hover:text-artisan-light transition-colors">
              Back to Order Details
            </span>
          </Link>
        </div>

        {/* ORDER SUMMARY BANNER */}
        <div className="border border-artisan-light/10 bg-artisan-light/[0.01] p-6 sm:p-8 rounded-xl space-y-4">
          <span className="text-[9px] font-mono text-artisan-light/40 uppercase tracking-[0.3em] font-bold block">In-Store Pickup Scheduling</span>
          <h1 className="text-3xl sm:text-4xl font-display font-black uppercase tracking-tight text-artisan-light">
            SELECT <span className="text-outline">PICKUP SLOT.</span>
          </h1>
          <p className="text-xs font-mono text-artisan-grey uppercase tracking-wider">
            Order #{orderId.substring(orderId.length - 8).toUpperCase()} • Total: ₹{order.totalAmount.toLocaleString()}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* DATE & TIME SELECTORS */}
          <div className="lg:col-span-8 space-y-8">

            {/* DATE SELECTOR */}
            <div className="border border-artisan-light/10 bg-artisan-light/[0.01] p-6 rounded-xl space-y-5">
              <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-artisan-grey flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-artisan-grey" />
                Select Pickup Date
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {dates.map((d, idx) => {
                  const isSelected = selectedDate?.toDateString() === d.toDateString()
                  const weekday = d.toLocaleDateString('en-US', { weekday: 'short' })
                  const day = d.getDate()
                  const month = d.toLocaleDateString('en-US', { month: 'short' })

                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedDate(d)}
                      className={`p-4 border cursor-pointer text-center transition-all rounded-xl ${isSelected
                          ? 'bg-artisan-light/[0.02] border-artisan-grey'
                          : 'bg-artisan-light/[0.003] border-artisan-light/5 hover:border-artisan-light/20'
                        }`}
                    >
                      <span className="text-[8px] font-mono font-bold text-artisan-grey uppercase block tracking-widest mb-1">{weekday}</span>
                      <span className="text-2xl font-display font-extrabold text-artisan-light block leading-none mb-1">{day}</span>
                      <span className="text-[9px] font-mono text-artisan-light/50 uppercase block tracking-wider">{month}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* TIME SLOT SELECTOR */}
            <div className="border border-artisan-light/10 bg-artisan-light/[0.01] p-6 rounded-xl space-y-5">
              <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-artisan-grey flex items-center gap-2">
                <Clock className="w-4 h-4 text-artisan-grey" />
                Select Time Slot
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {timeSlots.map((slot, idx) => {
                  const isSelected = selectedSlot === slot

                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedSlot(slot)}
                      className={`p-4 border cursor-pointer transition-all rounded-xl flex items-center justify-between ${isSelected
                          ? 'bg-artisan-light/[0.02] border-artisan-grey'
                          : 'bg-artisan-light/[0.003] border-artisan-light/5 hover:border-artisan-light/20'
                        }`}
                    >
                      <span className="text-xs font-mono font-bold text-artisan-light uppercase tracking-wider">{slot}</span>
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-artisan-light" />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

          </div>

          {/* CONFIRMATION & SUPPORT SIDEBAR */}
          <aside className="lg:col-span-4 space-y-6">

            {/* SELECTED SUMMARY */}
            <div className="border border-artisan-light/10 bg-artisan-light/[0.01] p-6 rounded-xl space-y-6">
              <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-artisan-grey border-b border-artisan-light/5 pb-3">
                Pickup Summary
              </h3>

              <div className="space-y-4 font-mono text-xs">
                <div className="flex justify-between items-baseline">
                  <span className="text-artisan-light/45">DATE:</span>
                  <span className="text-artisan-light font-bold">
                    {selectedDate ? selectedDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }) : 'NOT SELECTED'}
                  </span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-artisan-light/45">TIME:</span>
                  <span className="text-artisan-light font-bold">
                    {selectedSlot || 'NOT SELECTED'}
                  </span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-artisan-light/45">STORE:</span>
                  <span className="text-artisan-light font-bold text-right leading-tight">Pammal, Chennai</span>
                </div>
              </div>

              <div className="pt-2">
                <motion.button
                  onClick={handleConfirmSlot}
                  disabled={!selectedDate || !selectedSlot || isSubmitting}
                  className="w-full py-4 bg-artisan-light text-artisan-dark font-display font-black uppercase tracking-[0.25em] text-xs border border-black flex items-center justify-center gap-3 disabled:opacity-30 disabled:pointer-events-none rounded-full cursor-pointer"
                  initial={{ y: 0, boxShadow: "0 6px 0 0 #000000" }}
                  whileHover={!selectedDate || !selectedSlot || isSubmitting ? {} : {
                    y: -2,
                    boxShadow: "0 8px 0 0 #000000",
                    backgroundColor: "#eb5e28"
                  }}
                  whileTap={!selectedDate || !selectedSlot || isSubmitting ? {} : {
                    y: 6,
                    boxShadow: "0 0px 0 0 #000000"
                  }}
                  transition={{ type: "spring", stiffness: 600, damping: 18 }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Scheduling...
                    </>
                  ) : (
                    <>
                      Confirm Pickup Time
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </motion.button>
              </div>
            </div>

            {/* CONFUSED? CONTACT US */}
            <div className="border border-artisan-light/5 p-6 bg-artisan-light/[0.003] rounded-xl space-y-4 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <HelpCircle className="w-8 h-8 text-artisan-grey shrink-0" />
                <div>
                  <h4 className="text-xs font-mono font-bold text-artisan-light uppercase tracking-wider">Still Confused?</h4>
                  <p className="text-[9px] font-mono text-artisan-light/45 uppercase tracking-wide">Have queries regarding location or timing slots?</p>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href={`https://wa.me/918608678828?text=${encodeURIComponent(`Hi, I'm calling about my order #${orderId.substring(orderId.length - 8).toUpperCase()} pickup slot. I have a few questions.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 border border-artisan-light/10 text-[9px] font-mono font-bold uppercase tracking-widest text-center flex items-center justify-center gap-2 rounded-full cursor-pointer hover:border-artisan-light/30 transition-all text-artisan-light"
                >
                  Contact Pickup Coordinator
                </a>
              </div>
            </div>

          </aside>
        </div>

      </div>
    </div>
  )
}
