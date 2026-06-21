import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, 
  Search, 
  Calendar, 
  Wallet, 
  Loader2, 
  RefreshCcw, 
  Package, 
  ChevronRight,
  ShoppingBag,
  ChevronDown
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import api from '../services/api'
import SEO from '../components/SEO'

const MotionLink = motion.create ? motion.create(Link) : motion(Link)

export default function OrdersHistory() {
  const { user } = useAuth()
  const { addToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsStatusDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const res = await api.get('/orders/history')
      setOrders(res.data.data)
    } catch (err) {
      console.error('Failed to fetch orders:', err)
      addToast('Failed to retrieve order history data', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const filteredOrders = orders.filter(order => {
    // Search matches order ID or any product name in items
    const matchesId = order._id.toLowerCase().includes(search.toLowerCase()) ||
                     (order.razorpayOrderId && order.razorpayOrderId.toLowerCase().includes(search.toLowerCase()))
    
    const matchesProducts = order.items?.some(item => 
      item.product?.name?.toLowerCase().includes(search.toLowerCase())
    )
    
    const matchesSearch = matchesId || matchesProducts
    const matchesStatus = statusFilter === 'all' || order.orderStatus === statusFilter
    
    return matchesSearch && matchesStatus
  })

  // Calculations
  const totalSpent = orders
    .filter(o => o.paymentStatus === 'paid' || o.orderStatus === 'completed')
    .reduce((acc, curr) => acc + curr.totalAmount, 0)

  const totalOrdersCount = orders.length

  return (
    <div className="min-h-screen bg-artisan-dark bg-noise pt-24 md:pt-32 pb-24 text-artisan-light font-body">
      <SEO title="Order History" robots="noindex, nofollow" />
      <div className="container-custom">
        
        {/* HEADER & STATS */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-16">
          <div className="space-y-6">
            <Link to="/profile" className="inline-flex items-center gap-3 group">
              <div className="w-8 h-8 border border-artisan-light/10 flex items-center justify-center group-hover:bg-artisan-light group-hover:text-artisan-dark transition-all rounded-full">
                <ArrowLeft className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-mono font-bold text-artisan-light/40 uppercase tracking-[0.4em] group-hover:text-artisan-light transition-colors">Back to Profile</span>
            </Link>
            <div className="space-y-2">
              <h1 className="text-6xl md:text-8xl font-display font-black uppercase tracking-tighter leading-[0.8] text-artisan-light">
                MY <span className="text-outline">ORDERS.</span>
              </h1>
              <p className="text-[11px] font-mono text-artisan-light/25 uppercase tracking-[0.5em] pl-2">History of your orders</p>
            </div>
          </div>

          {/* KPI STATS CARDS */}
          <div className="flex flex-wrap gap-6">
            <div className="p-6 md:p-8 bg-artisan-light/[0.01] border border-artisan-light/5 min-w-[220px] relative group overflow-hidden rounded-xl">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-30 transition-opacity">
                <Wallet className="w-8 h-8 text-artisan-light" />
              </div>
              <span className="text-[9px] font-mono text-artisan-light/50 uppercase tracking-[0.3em] block mb-2">Total Spent</span>
              <p className="text-4xl font-display font-black text-artisan-light">₹{totalSpent.toLocaleString()}</p>
            </div>
            <div className="p-6 md:p-8 bg-artisan-light/[0.01] border border-artisan-light/5 min-w-[220px] relative group overflow-hidden rounded-xl">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-30 transition-opacity">
                <ShoppingBag className="w-8 h-8 text-artisan-light" />
              </div>
              <span className="text-[9px] font-mono text-artisan-light/50 uppercase tracking-[0.3em] block mb-2">Orders Placed</span>
              <p className="text-4xl font-display font-black text-artisan-light">{totalOrdersCount}</p>
            </div>
          </div>
        </div>

        {/* SEARCH & FILTERS BAR */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12">
          <div className="lg:col-span-8">
            <div className="relative group">
              <div className="absolute -top-2 -left-2 w-4 h-4 border-t border-l border-artisan-light/20 group-focus-within:border-artisan-light transition-all" />
              <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b border-r border-artisan-light/20 group-focus-within:border-artisan-light transition-all" />
              
              <div className="flex items-center bg-artisan-light/[0.005] border border-artisan-light/10 group-focus-within:border-artisan-light/20 transition-all rounded-xl overflow-hidden">
                <div className="w-16 h-16 border-r border-artisan-light/10 flex items-center justify-center bg-artisan-light/[0.01]">
                  <Search className="w-4 h-4 text-artisan-light/20 group-focus-within:text-artisan-light transition-colors" />
                </div>
                <input 
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="SEARCH ORDERS..."
                  className="flex-1 bg-transparent py-5 px-6 text-[10px] font-mono text-artisan-light uppercase tracking-[0.3em] outline-none placeholder:text-artisan-light/10"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 flex items-center gap-3">
            <div className="relative flex-1" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                className="w-full bg-artisan-light/[0.005] border border-artisan-light/10 p-5 text-[9px] font-mono text-artisan-light uppercase tracking-[0.2em] outline-none focus:border-artisan-light/25 flex justify-between items-center rounded-xl cursor-pointer"
              >
                <span className="truncate pr-4">
                  {statusFilter === 'all' && 'ALL ORDERS'}
                  {statusFilter === 'pending' && 'PENDING'}
                  {statusFilter === 'processing' && 'PROCESSING'}
                  {statusFilter === 'completed' && 'COMPLETED'}
                  {statusFilter === 'cancelled' && 'CANCELLED'}
                  {statusFilter === 'refunded' && 'REFUNDED'}
                </span>
                <ChevronDown className={`w-4 h-4 text-artisan-light/45 shrink-0 transition-transform duration-300 ${isStatusDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isStatusDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 z-50 w-full mt-2 bg-artisan-dark/95 backdrop-blur-md border border-artisan-light/10 shadow-2xl rounded-xl py-2 max-h-60 overflow-y-auto"
                  >
                    {[
                      { value: 'all', label: 'ALL ORDERS' },
                      { value: 'pending', label: 'PENDING' },
                      { value: 'processing', label: 'PROCESSING' },
                      { value: 'completed', label: 'COMPLETED' },
                      { value: 'cancelled', label: 'CANCELLED' },
                      { value: 'refunded', label: 'REFUNDED' }
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                          setStatusFilter(opt.value)
                          setIsStatusDropdownOpen(false)
                        }}
                        className={`w-full text-left px-5 py-3 hover:bg-artisan-light/[0.05] font-mono text-[9px] uppercase tracking-widest transition-colors border-b border-artisan-light/5 last:border-0 ${statusFilter === opt.value ? 'text-artisan-grey font-bold' : 'text-artisan-light/70 hover:text-artisan-light'}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <motion.button 
              type="button"
              onClick={fetchOrders}
              className="w-16 h-16 bg-artisan-light/5 border border-artisan-light/10 flex items-center justify-center group shrink-0 rounded-full cursor-pointer"
              title="Refresh"
              initial={{ y: 0, boxShadow: "0 4px 0 0 #000000" }}
              whileHover={{ 
                 y: -2,
                 boxShadow: "0 6px 0 0 #000000",
                 backgroundColor: "rgba(255, 252, 242, 0.08)"
              }}
              whileTap={{ 
                 y: 4,
                 boxShadow: "0 0px 0 0 #000000"
              }}
              transition={{ type: "spring", stiffness: 600, damping: 18 }}
            >
              <RefreshCcw className="w-4 h-4 text-artisan-light/40 group-hover:rotate-180 transition-transform duration-700 group-hover:text-artisan-light" />
            </motion.button>
          </div>
        </div>

        {/* ORDERS DISPLAY CONTAINER */}
        <div className="space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 border border-artisan-light/5 bg-artisan-light/[0.003] rounded-xl">
              <Loader2 className="w-12 h-12 text-artisan-grey animate-spin mb-4" />
              <span className="text-[10px] font-mono text-artisan-light/20 uppercase tracking-[0.3em]">Loading orders...</span>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 border border-dashed border-artisan-light/10 bg-artisan-light/[0.003] text-center space-y-6 rounded-xl">
              <ShoppingBag className="w-16 h-16 text-artisan-light/5" />
              <div className="space-y-2">
                <p className="text-xs font-mono font-bold text-artisan-grey uppercase tracking-widest">No orders found</p>
                <p className="text-[10px] font-body text-artisan-light/35 max-w-xs mx-auto leading-relaxed">
                  {search || statusFilter !== 'all' 
                    ? 'Try changing your search or filters.' 
                    : 'Your orders will show here once you make a purchase.'}
                </p>
              </div>
              {!search && statusFilter === 'all' && (
                <MotionLink 
                  to="/allproduct" 
                  className="inline-block px-8 py-3.5 bg-artisan-light text-artisan-dark text-[9px] font-mono font-bold uppercase tracking-widest border border-black rounded-full cursor-pointer"
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
                  Shop Now
                </MotionLink>
              )}
            </div>
          ) : (
            filteredOrders.map((order) => {
              const orderIdFormatted = order._id.substring(order._id.length - 8).toUpperCase()

              // Status styles mapping
              const statusColors = {
                completed: 'border-green-500 text-green-500 bg-green-500/5',
                processing: 'border-blue-500 text-blue-500 bg-blue-500/5',
                pending: 'border-yellow-500/50 text-yellow-400 bg-yellow-500/5',
                cancelled: 'border-red-500 text-red-500 bg-red-500/5',
                refunded: 'border-purple-500 text-purple-400 bg-purple-500/5'
              }

              const paymentStatusColors = {
                paid: 'text-green-500 bg-green-500/10 border-green-500/20',
                pending: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
                failed: 'text-red-500 bg-red-500/10 border-red-500/20',
                refunded: 'text-purple-400 bg-purple-500/10 border-purple-500/20'
              }

              return (
                <Link 
                  key={order._id} 
                  to={`/orders/${order._id}`}
                  className="group block border border-artisan-light/5 bg-artisan-light/[0.003] hover:border-artisan-light/10 transition-colors rounded-xl"
                >
                  {/* CARD HEADER SUMMARY */}
                  <div 
                    className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 cursor-pointer select-none"
                  >
                    <div className="flex items-start gap-4 md:gap-6">
                      <div className="w-12 h-12 bg-artisan-light/5 border border-artisan-light/10 flex items-center justify-center shrink-0 rounded-xl">
                        <Package className="w-6 h-6 text-artisan-light/50" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="text-xs font-mono font-bold text-artisan-light">Order ID: #{orderIdFormatted}</span>
                          <span className={`text-[8px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 border rounded-xl ${statusColors[order.orderStatus] || 'border-artisan-light/10'}`}>
                            {order.orderStatus}
                          </span>
                          <span className={`text-[8px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 border rounded-full ${paymentStatusColors[order.paymentStatus] || 'border-artisan-light/10'}`}>
                            {order.paymentStatus === 'paid' ? 'Paid' : order.paymentStatus}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[9px] font-mono text-artisan-light/50 uppercase tracking-widest">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 border-artisan-light/5 pt-4 md:pt-0">
                      <div className="text-left md:text-right">
                        <span className="text-xs font-mono text-artisan-light/50 uppercase tracking-widest block">Total</span>
                        <span className="text-xl font-display font-extrabold text-artisan-light tracking-tighter">₹{order.totalAmount.toLocaleString()}</span>
                      </div>
                      <motion.div 
                        className="w-8 h-8 rounded-full bg-artisan-light border border-black flex items-center justify-center text-artisan-dark shrink-0 cursor-pointer"
                        initial={{ y: 0, boxShadow: "0 4px 0 0 #000000" }}
                        whileHover={{ 
                           y: -1.5,
                           boxShadow: "0 5.5px 0 0 #000000",
                           backgroundColor: "#eb5e28"
                        }}
                        whileTap={{ 
                           y: 4,
                           boxShadow: "0 0px 0 0 #000000"
                        }}
                        transition={{ type: "spring", stiffness: 600, damping: 18 }}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </motion.div>
                    </div>
                  </div>
                </Link>
              )
            })
          )}
        </div>

      </div>
    </div>
  )
}
