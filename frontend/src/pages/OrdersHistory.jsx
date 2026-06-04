import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { 
  ArrowLeft, 
  Search, 
  Calendar, 
  Wallet, 
  Zap, 
  Loader2, 
  RefreshCcw, 
  Activity, 
  Package, 
  Check, 
  CreditCard, 
  ChevronDown, 
  ChevronUp,
  ShoppingBag,
  Clock,
  ShieldCheck,
  FileText,
  Truck,
  ChevronRight
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import api from '../services/api'

export default function OrdersHistory() {
  const { user } = useAuth()
  const { addToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [expandedOrderId, setExpandedOrderId] = useState(null)

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

  const toggleExpandOrder = (id) => {
    setExpandedOrderId(prev => (prev === id ? null : id))
  }

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
      <div className="container-custom">
        
        {/* HEADER & STATS */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-16">
          <div className="space-y-6">
            <Link to="/profile" className="inline-flex items-center gap-3 group">
              <div className="w-8 h-8 border border-artisan-light/10 flex items-center justify-center group-hover:bg-artisan-light group-hover:text-artisan-dark transition-all">
                <ArrowLeft className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-mono font-bold text-artisan-light/40 uppercase tracking-[0.4em] group-hover:text-artisan-light transition-colors">Back to Profile</span>
            </Link>
            <div className="space-y-2">
              <h1 className="text-6xl md:text-8xl font-display font-black uppercase tracking-tighter leading-[0.8] text-artisan-light">
                MY <span className="text-outline">ORDERS.</span>
              </h1>
              <p className="text-[11px] font-mono text-artisan-light/25 uppercase tracking-[0.5em] pl-2">History of your medical supplies purchases</p>
            </div>
          </div>

          {/* KPI STATS CARDS */}
          <div className="flex flex-wrap gap-6">
            <div className="p-6 md:p-8 bg-artisan-light/[0.01] border border-artisan-light/5 min-w-[220px] relative group overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-30 transition-opacity">
                <Wallet className="w-8 h-8 text-artisan-light" />
              </div>
              <span className="text-[9px] font-mono text-artisan-light/30 uppercase tracking-[0.3em] block mb-2">Total Outflow</span>
              <p className="text-4xl font-display font-black text-artisan-light">₹{totalSpent.toLocaleString()}</p>
            </div>
            <div className="p-6 md:p-8 bg-artisan-light/[0.01] border border-artisan-light/5 min-w-[220px] relative group overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-30 transition-opacity">
                <ShoppingBag className="w-8 h-8 text-artisan-light" />
              </div>
              <span className="text-[9px] font-mono text-artisan-light/30 uppercase tracking-[0.3em] block mb-2">Orders Placed</span>
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
              
              <div className="flex items-center bg-artisan-light/[0.005] border border-artisan-light/10 group-focus-within:border-artisan-light/20 transition-all">
                <div className="w-16 h-16 border-r border-artisan-light/10 flex items-center justify-center bg-artisan-light/[0.01]">
                  <Search className="w-4 h-4 text-artisan-light/20 group-focus-within:text-artisan-light transition-colors" />
                </div>
                <input 
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="SEARCH ORDERS BY ID OR PRODUCT NAME..."
                  className="flex-1 bg-transparent py-5 px-6 text-[10px] font-mono text-artisan-light uppercase tracking-[0.3em] outline-none placeholder:text-artisan-light/10"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 flex items-center gap-3">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-artisan-light/[0.005] border border-artisan-light/10 p-5 text-[9px] font-mono text-artisan-light uppercase tracking-[0.2em] outline-none focus:border-artisan-light/25 appearance-none cursor-pointer text-center"
            >
              <option value="all">ALL STAGES</option>
              <option value="pending">PENDING</option>
              <option value="processing">PROCESSING</option>
              <option value="completed">COMPLETED</option>
              <option value="cancelled">CANCELLED</option>
              <option value="refunded">REFUNDED</option>
            </select>
            <button 
              onClick={fetchOrders}
              className="w-16 h-16 bg-artisan-light/5 border border-artisan-light/10 flex items-center justify-center hover:bg-artisan-light hover:text-artisan-dark transition-all group shrink-0"
              title="Refresh Registry"
            >
              <RefreshCcw className="w-4 h-4 text-artisan-light/40 group-hover:rotate-180 transition-transform duration-700 group-hover:text-current" />
            </button>
          </div>
        </div>

        {/* ORDERS DISPLAY CONTAINER */}
        <div className="space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 border border-artisan-light/5 bg-artisan-light/[0.003]">
              <Loader2 className="w-12 h-12 text-artisan-grey animate-spin mb-4" />
              <span className="text-[10px] font-mono text-artisan-light/20 uppercase tracking-[0.3em]">Loading Order History...</span>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 border border-dashed border-artisan-light/10 bg-artisan-light/[0.003] text-center space-y-6">
              <ShoppingBag className="w-16 h-16 text-artisan-light/5" />
              <div className="space-y-2">
                <p className="text-xs font-mono font-bold text-artisan-grey uppercase tracking-widest">No matching orders found</p>
                <p className="text-[10px] font-body text-artisan-light/35 max-w-xs mx-auto leading-relaxed">
                  {search || statusFilter !== 'all' 
                    ? 'Try clearing filters or checking other query entries.' 
                    : 'Your transaction records will populate here once orders are authorized.'}
                </p>
              </div>
              {!search && statusFilter === 'all' && (
                <Link 
                  to="/allproduct" 
                  className="px-6 py-3 bg-artisan-light text-artisan-dark text-[9px] font-mono font-bold uppercase tracking-widest hover:bg-artisan-grey transition-all"
                >
                  Browse Catalog
                </Link>
              )}
            </div>
          ) : (
            filteredOrders.map((order) => {
              const orderIdFormatted = order._id.substring(order._id.length - 8).toUpperCase()
              const isExpanded = expandedOrderId === order._id

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
                <div 
                  key={order._id} 
                  className="border border-artisan-light/5 bg-artisan-light/[0.003] hover:border-artisan-light/10 transition-colors"
                >
                  {/* CARD HEADER SUMMARY */}
                  <div 
                    onClick={() => toggleExpandOrder(order._id)}
                    className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 cursor-pointer select-none"
                  >
                    <div className="flex items-start gap-4 md:gap-6">
                      <div className="w-12 h-12 bg-artisan-light/5 border border-artisan-light/10 flex items-center justify-center shrink-0">
                        <Package className="w-6 h-6 text-artisan-light/30" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="text-xs font-mono font-bold text-artisan-light">Order ID: #{orderIdFormatted}</span>
                          <span className={`text-[8px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 border ${statusColors[order.orderStatus] || 'border-artisan-light/10'}`}>
                            {order.orderStatus}
                          </span>
                          <span className={`text-[8px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 border rounded-full ${paymentStatusColors[order.paymentStatus] || 'border-artisan-light/10'}`}>
                            {order.paymentStatus === 'paid' ? 'Paid' : order.paymentStatus}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[9px] font-mono text-artisan-light/30 uppercase tracking-widest">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 border-artisan-light/5 pt-4 md:pt-0">
                      <div className="text-left md:text-right">
                        <span className="text-xs font-mono text-artisan-light/30 uppercase tracking-widest block">Total Amount</span>
                        <span className="text-xl font-display font-extrabold text-artisan-light tracking-tighter">₹{order.totalAmount.toLocaleString()}</span>
                      </div>
                      <div className="w-8 h-8 rounded-full border border-artisan-light/10 flex items-center justify-center text-artisan-light/40 hover:text-artisan-light transition-colors shrink-0">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>

                  {/* EXPANDED AREA DETAILS */}
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden border-t border-artisan-light/5 bg-artisan-light/[0.002]"
                      >
                        <div className="p-6 md:p-8 space-y-8">
                          
                          {/* PRODUCT LIST */}
                          <div className="space-y-4">
                            <h3 className="text-[10px] font-mono font-bold uppercase tracking-widest text-artisan-grey border-b border-artisan-light/5 pb-2">Order Items</h3>
                            <div className="divide-y divide-artisan-light/5">
                              {order.items?.map((item) => (
                                <div key={item._id} className="py-4 flex items-center justify-between gap-6">
                                  <div className="flex items-center gap-4 min-w-0">
                                    <div className="w-12 h-12 bg-artisan-light/5 border border-artisan-light/10 overflow-hidden shrink-0 flex items-center justify-center">
                                      <ShoppingBag className="w-5 h-5 text-artisan-light/10" />
                                    </div>
                                    <div className="min-w-0 space-y-0.5">
                                      <h4 className="text-xs font-bold text-artisan-light truncate uppercase tracking-wide">{item.product?.name || 'Surgical Product'}</h4>
                                      <p className="text-[9px] font-mono text-artisan-light/30">SKU: {item.product?.sku || 'N/A'}</p>
                                    </div>
                                  </div>
                                  <div className="text-right shrink-0">
                                    <span className="text-[10px] font-mono text-artisan-light/40 uppercase tracking-widest">{item.quantity} × </span>
                                    <span className="text-xs font-mono font-bold text-artisan-light">₹{(item.priceAtPurchase || item.product?.price || 0).toLocaleString()}</span>
                                    <p className="text-[9px] font-mono text-artisan-light/30 mt-0.5">₹{(item.quantity * (item.priceAtPurchase || item.product?.price || 0)).toLocaleString()}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* DETAILS GRID */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-artisan-light/5">
                            
                            {/* Left details */}
                            <div className="space-y-3">
                              <h4 className="text-[9px] font-mono font-bold uppercase tracking-widest text-artisan-light/30">Payment Info</h4>
                              <div className="space-y-2 text-[10px] font-mono text-artisan-light/75 leading-relaxed bg-artisan-light/[0.01] p-4 border border-artisan-light/5">
                                <div className="flex justify-between">
                                  <span className="text-artisan-light/30 uppercase">Method</span>
                                  <span className="uppercase">Razorpay</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-artisan-light/30 uppercase">Payment ID</span>
                                  <span className="text-[9px] truncate max-w-[160px] md:max-w-none text-artisan-grey font-bold" title={order.razorpayPaymentId}>
                                    {order.razorpayPaymentId || 'pending'}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-artisan-light/30 uppercase">Order ID</span>
                                  <span className="text-[9px] truncate max-w-[160px] md:max-w-none" title={order.razorpayOrderId}>
                                    {order.razorpayOrderId}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Right details */}
                            <div className="space-y-3">
                              <h4 className="text-[9px] font-mono font-bold uppercase tracking-widest text-artisan-light/30">Fulfillment Information</h4>
                              <div className="space-y-3 text-[10px] font-mono text-artisan-light/75 leading-relaxed bg-artisan-light/[0.01] p-4 border border-artisan-light/5">
                                <div className="flex items-center gap-2">
                                  <Clock className="w-3.5 h-3.5 text-artisan-light/35" />
                                  <span>
                                    {order.orderStatus === 'completed' 
                                      ? 'Delivered & Closed' 
                                      : order.orderStatus === 'processing' 
                                        ? 'Undergoing sterilization / packing'
                                        : order.orderStatus === 'pending'
                                          ? 'Awaiting payment authorization'
                                          : order.orderStatus === 'cancelled'
                                            ? 'Order cancelled'
                                            : 'Refund processed'}
                                  </span>
                                </div>
                                {order.shippingStatus && (
                                  <div className="flex items-center gap-2">
                                    <Truck className="w-3.5 h-3.5 text-artisan-light/35" />
                                    <span className="uppercase font-bold text-artisan-grey">
                                      Shipping: {order.shippingStatus === 'pending' && order.paymentStatus === 'paid' ? 'processing' : order.shippingStatus}
                                    </span>
                                  </div>
                                )}
                                {order.shippingTrackingNumber && (
                                  <div className="flex items-center gap-2">
                                    <FileText className="w-3.5 h-3.5 text-artisan-light/35" />
                                    <span>Tracking Code: {order.shippingTrackingNumber}</span>
                                  </div>
                                )}
                                <div className="flex items-center gap-2 border-t border-artisan-light/5 pt-2 mt-1">
                                  <ShieldCheck className="w-3.5 h-3.5 text-artisan-light/35" />
                                  <span>STAT Quality Standards Assured</span>
                                </div>
                              </div>
                              
                              {order.shippingTrackingNumber && (
                                <Link 
                                  to={`/orders/${order._id}`}
                                  className="w-full mt-2 py-3 bg-artisan-light/5 border border-artisan-light/10 text-artisan-light font-mono text-[9px] font-bold uppercase tracking-widest hover:bg-artisan-light hover:text-artisan-dark flex items-center justify-center gap-2 transition-all"
                                >
                                  <span>Track Live Shipment Details</span>
                                  <ChevronRight className="w-3 h-3" />
                                </Link>
                              )}
                            </div>

                          </div>
                          
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })
          )}
        </div>

      </div>
    </div>
  )
}
