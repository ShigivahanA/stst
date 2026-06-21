import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
   ArrowLeft,
   Package,
   Loader2,
   Calendar,
   ArrowUpRight,
   Inbox,
   Search,
   Truck,
   ChevronDown,
   Check
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useToast } from '../context/ToastContext'
import api from '../services/api'

const ORDER_STATUS_OPTIONS = [
   { value: 'pending', label: 'Pending', color: 'bg-yellow-500', text: 'text-yellow-400', border: 'border-yellow-500/30', bg: 'bg-yellow-500/5' },
   { value: 'processing', label: 'Processing', color: 'bg-blue-500', text: 'text-blue-400', border: 'border-blue-500/30', bg: 'bg-blue-500/5' },
   { value: 'completed', label: 'Completed', color: 'bg-green-500', text: 'text-green-500', border: 'border-green-500/30', bg: 'bg-green-500/5' },
   { value: 'cancelled', label: 'Cancelled', color: 'bg-red-500', text: 'text-red-500', border: 'border-red-500/30', bg: 'bg-red-500/5' },
   { value: 'refunded', label: 'Refunded', color: 'bg-purple-500', text: 'text-purple-400', border: 'border-purple-500/30', bg: 'bg-purple-500/5' }
]

const SHIPPING_STATUS_OPTIONS = [
   { value: 'pending', label: 'Pending', color: 'bg-yellow-500', text: 'text-yellow-400', border: 'border-yellow-500/30', bg: 'bg-yellow-500/5' },
   { value: 'shipped', label: 'Shipped', color: 'bg-indigo-500', text: 'text-indigo-400', border: 'border-indigo-500/30', bg: 'bg-indigo-500/5' },
   { value: 'in_transit', label: 'In Transit', color: 'bg-blue-500', text: 'text-blue-400', border: 'border-blue-500/30', bg: 'bg-blue-500/5' },
   { value: 'out_for_delivery', label: 'Out for Delivery', color: 'bg-teal-500', text: 'text-teal-400', border: 'border-teal-500/30', bg: 'bg-teal-500/5' },
   { value: 'delivered', label: 'Delivered', color: 'bg-green-500', text: 'text-green-500', border: 'border-green-500/30', bg: 'bg-green-500/5' },
   { value: 'failed', label: 'Failed', color: 'bg-red-500', text: 'text-red-500', border: 'border-red-500/30', bg: 'bg-red-500/5' }
]

const FILTER_OPTIONS = [
   { value: 'all', label: 'All' },
   { value: 'pending', label: 'Pending' },
   { value: 'processing', label: 'Processing' },
   { value: 'completed', label: 'Completed' },
   { value: 'cancelled', label: 'Cancelled' },
   { value: 'refunded', label: 'Refunded' }
]

// Custom dropdown component
function CustomDropdown({ value, options, onChange, disabled, icon: Icon, label }) {
   const [open, setOpen] = useState(false)
   const ref = useRef(null)

   useEffect(() => {
      const handleClick = (e) => {
         if (ref.current && !ref.current.contains(e.target)) setOpen(false)
      }
      document.addEventListener('mousedown', handleClick)
      return () => document.removeEventListener('mousedown', handleClick)
   }, [])

   const selected = options.find(o => o.value === value) || options[0]

   return (
      <div className="flex flex-col gap-1.5 relative" ref={ref}>
         <div className="flex items-center gap-1.5">
            {Icon && <Icon className="w-3 h-3 text-artisan-light/50" />}
            <span className="text-[7px] font-mono text-artisan-light/40 uppercase tracking-wider font-bold">{label}</span>
         </div>
         <button
            type="button"
            disabled={disabled}
            onClick={() => setOpen(!open)}
            className="flex items-center justify-between gap-2 bg-artisan-dark border border-artisan-light/10 hover:border-artisan-light/25 text-artisan-light font-mono text-[9px] font-bold uppercase tracking-widest px-4 py-2.5 outline-none transition-all cursor-pointer h-10 w-44 rounded-xl disabled:opacity-50"
         >
            <div className="flex items-center gap-2">
               <div className={`w-2 h-2 rounded-full ${selected.color}`} />
               <span>{selected.label}</span>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-artisan-light/40 transition-transform ${open ? 'rotate-180' : ''}`} />
         </button>

         <AnimatePresence>
            {open && (
               <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-0 mt-1.5 w-48 bg-artisan-dark border border-artisan-light/15 rounded-xl shadow-xl z-50 overflow-hidden py-1"
               >
                  {options.map((opt) => (
                     <button
                        key={opt.value}
                        type="button"
                        onClick={() => { onChange(opt.value); setOpen(false) }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left font-mono text-[9px] font-bold uppercase tracking-widest transition-all hover:bg-artisan-light/5 ${
                           opt.value === value ? 'text-artisan-light bg-artisan-light/[0.03]' : 'text-artisan-light/50'
                        }`}
                     >
                        <div className={`w-2 h-2 rounded-full ${opt.color}`} />
                        <span className="flex-1">{opt.label}</span>
                        {opt.value === value && <Check className="w-3 h-3 text-green-500" />}
                     </button>
                  ))}
               </motion.div>
            )}
         </AnimatePresence>
      </div>
   )
}

export default function AdminOrders() {
   const { addToast } = useToast()
   const [loading, setLoading] = useState(true)
   const [bookings, setBookings] = useState([])
   const [actionLoading, setActionLoading] = useState(null)
   const [searchQuery, setSearchQuery] = useState('')
   const [filterStatus, setFilterStatus] = useState('all')
   const [trackingInputs, setTrackingInputs] = useState({})
   const [editingTrackingId, setEditingTrackingId] = useState(null)

   const fetchBookings = async () => {
      try {
         setLoading(true)
         const res = await api.get('/admin/bookings')
         const data = res.data.data || []
         setBookings(data)
         
         // Pre-populate trackingInputs with existing tracking numbers
         const inputs = {}
         data.forEach(b => {
            inputs[b._id] = b.shippingTrackingNumber || ''
         })
         setTrackingInputs(inputs)
      } catch (err) {
         addToast('Failed to load orders', 'error')
      } finally {
         setLoading(false)
      }
   }

   useEffect(() => {
      fetchBookings()
   }, [])

   const handleUpdateTracking = async (id) => {
      const trackingVal = trackingInputs[id] || ''
      if (!trackingVal.trim()) {
         addToast('Tracking ID cannot be empty', 'error')
         return
      }
      try {
         setActionLoading(id)
         await api.put(`/admin/listings/${id}/status`, {
            shippingTrackingNumber: trackingVal.trim()
         })
         addToast('Tracking ID updated', 'success')
         setEditingTrackingId(null)
         fetchBookings()
      } catch (err) {
         addToast('Update failed', 'error')
      } finally {
         setActionLoading(null)
      }
   }

   const handleStatusUpdate = async (id, status, orderStatus = null, shippingStatus = null) => {
      try {
         setActionLoading(id)
         const payload = {}
         if (status) payload.status = status
         if (orderStatus) payload.orderStatus = orderStatus
         if (shippingStatus) payload.shippingStatus = shippingStatus

         await api.put(`/admin/listings/${id}/status`, payload)
         addToast('Order status updated', 'success')
         fetchBookings()
      } catch (err) {
         addToast('Update failed', 'error')
      } finally {
         setActionLoading(null)
      }
   }

   // Filter & search
   const filteredBookings = bookings.filter(b => {
      const matchesSearch = searchQuery === '' ||
         b._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
         (b.renter?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
         (b.listing?.title || '').toLowerCase().includes(searchQuery.toLowerCase())

      const matchesFilter = filterStatus === 'all' ||
         b.orderStatus === filterStatus ||
         b.status === filterStatus

      return matchesSearch && matchesFilter
   })

   const getOrderStyle = (status) => ORDER_STATUS_OPTIONS.find(o => o.value === status) || ORDER_STATUS_OPTIONS[0]
   const getShippingStyle = (status) => SHIPPING_STATUS_OPTIONS.find(o => o.value === status) || SHIPPING_STATUS_OPTIONS[0]

   return (
      <div className="min-h-screen bg-artisan-dark bg-noise flex flex-col pb-24 text-artisan-light">
         <div className="h-20 shrink-0" />

         <div className="flex-1">
            <div className="container-custom py-8 md:py-12">

               {/* HEADER */}
               <header className="mb-10 shrink-0">
                  <Link
                     to="/admin"
                     className="inline-flex items-center gap-3 group mb-8"
                  >
                     <div className="w-8 h-8 border border-artisan-light/10 flex items-center justify-center group-hover:bg-artisan-light group-hover:text-artisan-dark transition-all rounded-full">
                        <ArrowLeft className="w-4 h-4" />
                     </div>
                     <span className="text-[10px] font-mono font-bold text-artisan-light/40 uppercase tracking-[0.4em] group-hover:text-artisan-light transition-colors">
                        Back to Dashboard
                     </span>
                  </Link>

                  <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                     <div className="space-y-3">
                        <h1 className="text-5xl md:text-7xl font-display font-extrabold uppercase tracking-tighter leading-[0.85] text-artisan-light">
                           ALL <span className="text-outline">ORDERS.</span>
                        </h1>
                     </div>

                     <div className="text-[10px] font-mono text-artisan-light/40 uppercase tracking-widest">
                        {bookings.length} Total Orders
                     </div>
                  </div>
               </header>

               {/* SEARCH & FILTER BAR */}
               <div className="flex flex-col gap-4 mb-8">
                  <div className="relative">
                     <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-artisan-light/50" />
                     <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by order ID, customer, or product..."
                        className="w-full bg-artisan-light/[0.02] border border-artisan-light/10 text-artisan-light font-mono text-[11px] uppercase pl-11 pr-4 py-3.5 outline-none focus:border-artisan-grey/50 transition-colors placeholder:text-artisan-light/15 rounded-xl"
                     />
                  </div>

                  {/* Custom filter pills */}
                  <div className="flex flex-wrap items-center gap-2">
                     {FILTER_OPTIONS.map((opt) => (
                        <button
                           key={opt.value}
                           onClick={() => setFilterStatus(opt.value)}
                           className={`px-4 py-2 rounded-full font-mono text-[9px] font-bold uppercase tracking-widest border transition-all duration-200 ${
                              filterStatus === opt.value
                                 ? 'bg-artisan-light text-artisan-dark border-artisan-light'
                                 : 'bg-transparent text-artisan-light/40 border-artisan-light/10 hover:border-artisan-light/25 hover:text-artisan-light/60'
                           }`}
                        >
                           {opt.label}
                        </button>
                     ))}
                  </div>
               </div>

               {/* ORDERS LIST */}
               <div className="space-y-3">
                  {loading ? (
                     <div className="flex justify-center py-20">
                        <Loader2 className="w-8 h-8 text-artisan-grey animate-spin" />
                     </div>
                  ) : filteredBookings.length === 0 ? (
                     <div className="flex flex-col items-center justify-center py-20 border border-dashed border-artisan-light/10 bg-artisan-light/[0.01] rounded-2xl">
                        <Inbox className="w-12 h-12 text-artisan-light/10 mb-4" />
                        <p className="text-[10px] font-mono text-artisan-light/50 uppercase tracking-[0.2em] font-bold">
                           {searchQuery || filterStatus !== 'all' ? 'No orders match your filters' : 'No orders found'}
                        </p>
                     </div>
                  ) : (
                     <AnimatePresence>
                        {filteredBookings.map((booking) => {
                           const orderStyle = getOrderStyle(booking.orderStatus)
                           const shippingStyle = getShippingStyle(booking.shippingStatus)

                           return (
                              <motion.div
                                 key={booking._id}
                                 initial={{ opacity: 0, y: 10 }}
                                 animate={{ opacity: 1, y: 0 }}
                                 exit={{ opacity: 0, x: -10 }}
                                 className="relative p-5 sm:p-6 border border-artisan-light/10 bg-artisan-light/[0.01] hover:bg-artisan-light/[0.03] hover:border-artisan-grey/30 transition-all duration-300 group/item rounded-2xl"
                              >
                                 {/* Status badges — top right corner */}
                                 <div className="absolute top-4 right-4 sm:top-5 sm:right-5 flex items-center gap-2">
                                    <span className={`text-[8px] font-mono font-bold uppercase tracking-widest px-3 py-1.5 border rounded-full ${orderStyle.border} ${orderStyle.text} ${orderStyle.bg}`}>
                                       {booking.orderStatus || 'pending'}
                                    </span>
                                    <span className={`text-[8px] font-mono font-bold uppercase tracking-widest px-3 py-1.5 border rounded-full ${shippingStyle.border} ${shippingStyle.text} ${shippingStyle.bg}`}>
                                       {(booking.shippingStatus || 'pending').replace(/_/g, ' ')}
                                    </span>
                                 </div>

                                 {/* Top row: Order info */}
                                 <div className="flex items-start sm:items-center gap-4 min-w-0 flex-1 pr-44 sm:pr-56 mb-5">
                                    <div className="w-12 h-12 bg-artisan-light/5 border border-artisan-light/10 overflow-hidden shrink-0 flex items-center justify-center text-lg text-artisan-grey group-hover/item:bg-artisan-light/10 transition-all rounded-xl">
                                       📦
                                    </div>
                                    <div className="space-y-1.5 min-w-0 flex-1">
                                       <div className="flex flex-wrap items-center gap-3">
                                          <Link
                                             to={`/orders/${booking._id}`}
                                             className="text-[9px] font-mono text-artisan-grey uppercase tracking-[0.2em] font-black hover:text-artisan-light transition-colors flex items-center gap-1"
                                          >
                                             Order #{booking._id.slice(-8).toUpperCase()}
                                             <ArrowUpRight className="w-3 h-3 text-artisan-grey/50" />
                                          </Link>
                                          <div className="flex items-center gap-1 text-[8px] font-mono text-artisan-light/40 uppercase">
                                             <Calendar className="w-3 h-3" />
                                             <span>{booking.startDate ? new Date(booking.startDate).toLocaleDateString() : 'N/A'}</span>
                                          </div>
                                       </div>

                                       <h3 className="text-sm font-display font-black uppercase text-artisan-light leading-tight truncate block" title={booking.listing?.title}>
                                          {booking.listing?.title || 'STAT Surgical Tool'}
                                       </h3>

                                       <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                                          <span className="text-[9px] font-mono text-artisan-light/50 uppercase font-semibold">
                                             Client: <span className="text-artisan-light">{booking.renter?.name || 'Guest User'}</span>
                                          </span>
                                          <span className="text-artisan-light/20">•</span>
                                          <span className="text-[9px] font-mono text-artisan-light/50 uppercase font-semibold">
                                             Price: <span className="text-artisan-light">₹{(booking.totalPrice || 0).toLocaleString()}</span>
                                          </span>
                                          <span className="text-artisan-light/20">•</span>
                                          <span className="text-[9px] font-mono text-artisan-light/50 uppercase font-semibold">
                                             Payment: <span className="text-artisan-light">{booking.paymentStatus || 'N/A'}</span>
                                          </span>
                                       </div>
                                    </div>
                                 </div>

                                 {/* Bottom row: Status controls */}
                                 <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 pt-4 border-t border-artisan-light/5">
                                    <div className="flex flex-wrap items-end gap-4">
                                       <CustomDropdown
                                          value={booking.orderStatus || 'pending'}
                                          options={ORDER_STATUS_OPTIONS}
                                          onChange={(val) => handleStatusUpdate(booking._id, null, val, null)}
                                          disabled={actionLoading === booking._id}
                                          icon={Package}
                                          label="Order Status"
                                       />
                                       <CustomDropdown
                                          value={booking.shippingStatus || 'pending'}
                                          options={SHIPPING_STATUS_OPTIONS}
                                          onChange={(val) => handleStatusUpdate(booking._id, null, null, val)}
                                          disabled={actionLoading === booking._id}
                                          icon={Truck}
                                          label="Shipping Status"
                                       />
                                       {/* Tracking ID input/display next to Shipping Status */}
                                       <div className="flex flex-col gap-1.5 relative">
                                          <span className="text-[7px] font-mono text-artisan-light/40 uppercase tracking-wider font-bold">Tracking ID</span>
                                          {!booking.shippingTrackingNumber || editingTrackingId === booking._id ? (
                                             <div className="flex items-center gap-2 h-10">
                                                <input
                                                   type="text"
                                                   value={trackingInputs[booking._id] || ''}
                                                   onChange={(e) => setTrackingInputs(prev => ({ ...prev, [booking._id]: e.target.value }))}
                                                   placeholder="ENTER TRACKING ID"
                                                   className="bg-artisan-dark border border-artisan-light/10 text-artisan-light font-mono text-[9px] uppercase px-3 py-2 outline-none focus:border-artisan-grey/50 transition-colors rounded-xl h-10 w-44"
                                                />
                                                <button
                                                   onClick={() => handleUpdateTracking(booking._id)}
                                                   disabled={actionLoading === booking._id}
                                                   className="h-10 px-4 bg-artisan-light hover:bg-artisan-grey disabled:bg-artisan-light/20 text-artisan-dark font-mono text-[9px] font-bold uppercase tracking-wider transition-all rounded-xl flex items-center justify-center cursor-pointer select-none"
                                                >
                                                   Share
                                                </button>
                                                {booking.shippingTrackingNumber && (
                                                   <button
                                                      onClick={() => setEditingTrackingId(null)}
                                                      disabled={actionLoading === booking._id}
                                                      className="h-10 px-4 border border-artisan-light/10 hover:border-artisan-light/20 text-artisan-light font-mono text-[9px] font-bold uppercase tracking-wider transition-all rounded-xl flex items-center justify-center cursor-pointer select-none"
                                                   >
                                                      Cancel
                                                   </button>
                                                )}
                                             </div>
                                          ) : (
                                             <div className="flex items-center gap-3 h-10 bg-artisan-light/[0.02] border border-artisan-light/10 px-4 rounded-xl w-64 justify-between">
                                                <span className="font-mono text-[9px] text-artisan-light/60 truncate uppercase font-bold">{booking.shippingTrackingNumber}</span>
                                                <button
                                                   onClick={() => {
                                                      setEditingTrackingId(booking._id)
                                                      setTrackingInputs(prev => ({ ...prev, [booking._id]: booking.shippingTrackingNumber }))
                                                   }}
                                                   className="text-artisan-grey hover:text-artisan-light font-mono text-[9px] font-bold uppercase tracking-wider cursor-pointer"
                                                >
                                                   Edit
                                                </button>
                                             </div>
                                          )}
                                       </div>
                                    </div>

                                    {/* Loading spinner */}
                                    {actionLoading === booking._id && (
                                       <Loader2 className="w-4 h-4 text-artisan-grey animate-spin shrink-0 sm:ml-auto" />
                                    )}
                                 </div>
                              </motion.div>
                           )
                        })}
                     </AnimatePresence>
                  )}
               </div>

            </div>
         </div>
      </div>
   )
}
