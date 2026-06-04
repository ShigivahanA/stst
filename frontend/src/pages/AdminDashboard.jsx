import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
   BarChart3,
   Users,
   Package,
   AlertTriangle,
   CheckCircle,
   XCircle,
   ShieldAlert,
   Zap,
   Loader2,
   RefreshCcw,
   Calendar,
   Inbox,
   ArrowUpRight,
   Activity,
   TrendingUp,
   Globe,
   FileText,
   Clock
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useToast } from '../context/ToastContext'
import api from '../services/api'

export default function AdminDashboard() {
   const { addToast } = useToast()
   const [loading, setLoading] = useState(true)
   const [stats, setStats] = useState({
      totalUsers: 0,
      totalProducts: 0,
      lowStockProducts: [],
      revenue: 0,
      profit: 0,
      totalOrders: 0,
      pendingOrdersCount: 0,
      monthlyStats: []
   })
   const [bookings, setBookings] = useState([])
   const [analytics, setAnalytics] = useState(null)
   const [actionLoading, setActionLoading] = useState(null)
   const [orderTab, setOrderTab] = useState('pending')

   const fetchData = async () => {
      try {
         setLoading(true)
         const [statsRes, bookingsRes, analyticsRes] = await Promise.all([
            api.get('/admin/stats'),
            api.get('/admin/bookings'),
            api.get('/analytics/dashboard')
         ])

         setStats(statsRes.data.data || {
            totalUsers: 0,
            totalProducts: 0,
            lowStockProducts: [],
            revenue: 0,
            profit: 0,
            totalOrders: 0,
            pendingOrdersCount: 0,
            monthlyStats: []
         })
         setBookings(bookingsRes.data.data || [])
         setAnalytics(analyticsRes.data.data || null)
      } catch (err) {
         addToast('Failed to load data', 'error')
      } finally {
         setLoading(false)
      }
   }

   useEffect(() => {
      fetchData()
   }, [])

   const handleStatusUpdate = async (id, status) => {
      try {
         setActionLoading(id)
         await api.put(`/admin/listings/${id}/status`, { status })
         addToast(`Order ${status === 'approved' ? 'confirmed' : 'cancelled'}`, 'success')
         fetchData()
      } catch (err) {
         addToast('Update failed', 'error')
      } finally {
         setActionLoading(null)
      }
   }

   const scrollToSection = (id) => {
      const element = document.getElementById(id)
      if (element) {
         element.scrollIntoView({ behavior: 'smooth' })
      }
   }

   const statCards = [
      { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-artisan-light', link: '/admin/users' },
      { label: 'Surgical Products', value: stats.totalProducts, icon: Package, color: 'text-artisan-light', link: '/admin/products' },
      { label: 'Total Orders', value: stats.totalOrders, icon: BarChart3, color: 'text-artisan-light', onClick: () => scrollToSection('pending-orders') },
      { label: 'Pending Orders', value: stats.pendingOrdersCount, icon: ShieldAlert, color: 'text-artisan-grey', onClick: () => scrollToSection('pending-orders') }
   ]

   const pendingBookings = bookings.filter(b => b.status === 'pending')

   return (
      <div className="min-h-screen bg-artisan-dark bg-noise flex flex-col pb-24 text-artisan-light">
         <div className="h-20 shrink-0" />

         <div className="flex-1">
            <div className="container-custom py-8 md:py-12">

               {/* HEADER */}
               <header className="mb-10 shrink-0 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                  <div className="space-y-3">
                     <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[10px] font-mono font-bold text-artisan-grey uppercase tracking-[0.6em]">System Online</span>
                     </div>
                     <h1 className="text-5xl md:text-7xl font-display font-extrabold uppercase tracking-tighter leading-[0.85] text-artisan-light">
                        ADMIN <span className="text-outline">DASHBOARD.</span>
                     </h1>
                  </div>

                  <div className="flex items-center gap-3">
                     <button
                        onClick={fetchData}
                        className="px-6 py-4 bg-artisan-light/[0.02] border border-artisan-light/10 hover:bg-artisan-light/5 hover:border-artisan-light/20 transition-all group flex items-center justify-center"
                     >
                        <RefreshCcw className={`w-4 h-4 text-artisan-grey group-hover:rotate-180 transition-transform duration-700 ${loading ? 'animate-spin' : ''}`} />
                     </button>
                  </div>
               </header>

               {/* STATS CARD GRID */}
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10 shrink-0">
                  {statCards.map((stat, idx) => {
                     const cardClassName = "p-6 border border-artisan-light/10 bg-artisan-light/[0.02] group relative overflow-hidden transition-all duration-300 hover:border-artisan-grey/50 hover:bg-artisan-light/[0.04] text-left cursor-pointer"
                     
                     const renderCardContent = () => (
                        <>
                           {/* Interactive Accent Line */}
                           <div className="absolute left-0 top-0 bottom-0 w-0 bg-artisan-grey transition-all duration-300 group-hover:w-1" />
                           
                           <div className="flex justify-between items-start mb-4">
                              <stat.icon className={`w-5 h-5 ${stat.color} transition-transform duration-300 group-hover:scale-110`} />
                              <ArrowUpRight className="w-4 h-4 text-artisan-light/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                           </div>
                           <span className="text-[9px] font-mono text-artisan-light/40 uppercase tracking-[0.2em] mb-1.5 block">{stat.label}</span>
                           <p className="text-4xl font-display font-black text-artisan-light tracking-tight group-hover:text-artisan-grey transition-colors duration-300">
                              {loading ? '...' : stat.value}
                           </p>
                        </>
                     )

                     if (stat.link) {
                        return (
                           <Link key={idx} to={stat.link} className={cardClassName}>
                              {renderCardContent()}
                           </Link>
                        )
                     }
                     return (
                        <button key={idx} onClick={stat.onClick} className={cardClassName}>
                           {renderCardContent()}
                        </button>
                     )
                  })}
               </div>

               {/* REAL-LIFE OPERATIONAL STATS & GRAPH GRID */}
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch mb-16">
                  
                  {/* PANEL 1: SALES & REVENUE CHART */}
                  <div className="p-6 sm:p-8 bg-artisan-light/[0.02] border border-artisan-light/10 flex flex-col justify-between hover:border-artisan-light/20 transition-colors duration-300 relative group">
                     <div className="space-y-6">
                        <div className="flex items-center justify-between">
                           <div className="space-y-1">
                              <h3 className="text-lg font-display font-extrabold uppercase tracking-widest text-artisan-light">Supply & Sales Trends</h3>
                              <p className="text-[8px] font-mono text-artisan-light/40 uppercase tracking-widest">Monthly Financial Output</p>
                           </div>
                           <div className="flex gap-3 text-[9px] font-mono shrink-0">
                              <div className="flex items-center gap-1.5">
                                 <div className="w-2.5 h-2.5 bg-artisan-grey" /> 
                                 <span className="text-artisan-light/60">Revenue</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                 <div className="w-2.5 h-2.5 bg-artisan-light" /> 
                                 <span className="text-artisan-light/60">Profit</span>
                              </div>
                           </div>
                        </div>

                        {loading ? (
                           <div className="h-52 flex items-center justify-center">
                              <Loader2 className="w-6 h-6 text-artisan-grey animate-spin" />
                           </div>
                        ) : (
                           <div className="h-52 flex items-end gap-2 sm:gap-4 pt-8 border-b border-artisan-light/10 pb-2 relative">
                              {/* Grid reference lines */}
                              <div className="absolute inset-x-0 top-8 border-t border-dashed border-artisan-light/5 pointer-events-none" />
                              <div className="absolute inset-x-0 top-24 border-t border-dashed border-artisan-light/5 pointer-events-none" />
                              <div className="absolute inset-x-0 top-40 border-t border-dashed border-artisan-light/5 pointer-events-none" />

                              {(() => {
                                 const monthlyStatsArray = stats.monthlyStats || [];
                                 const maxVal = monthlyStatsArray.length > 0 ? Math.max(...monthlyStatsArray.map(m => m.revenue), 1000) : 1000;
                                 return monthlyStatsArray.map((item, idx) => {
                                    const revHeight = `${Math.max(6, Math.min(100, (item.revenue / maxVal) * 100))}%`;
                                    const profHeight = `${Math.max(3, Math.min(100, (item.profit / maxVal) * 100))}%`;
                                    
                                    const isFirst = idx === 0;
                                    const isLast = idx === monthlyStatsArray.length - 1;
                                    const tooltipAlignClass = isFirst 
                                       ? "left-0" 
                                       : isLast 
                                          ? "right-0" 
                                          : "left-1/2 -translate-x-1/2";

                                    return (
                                       <div key={idx} className="flex-1 flex flex-col items-center gap-1 group/bar h-full justify-end relative">
                                          {/* Hover tooltip */}
                                          <div className={`absolute bottom-full mb-3 ${tooltipAlignClass} bg-artisan-light border border-artisan-light/10 p-3 opacity-0 pointer-events-none group-hover/bar:opacity-100 transition-opacity duration-200 z-50 space-y-1 shadow-2xl min-w-[130px] rounded-none`}>
                                             <p className="text-[8px] font-mono text-artisan-dark/60 uppercase font-bold tracking-wider">{item.month}</p>
                                             <div className="h-px bg-artisan-dark/10 my-1" />
                                             <p className="text-[10px] font-mono font-bold text-artisan-grey">Rev: ₹{item.revenue.toLocaleString()}</p>
                                             <p className="text-[10px] font-mono font-bold text-artisan-dark">Prof: ₹{item.profit.toLocaleString()}</p>
                                          </div>
                                          
                                          <div className="w-full flex items-end gap-1 h-full">
                                             {/* Animated Revenue Bar */}
                                             <motion.div 
                                                initial={{ scaleY: 0 }}
                                                animate={{ scaleY: 1 }}
                                                transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1], delay: idx * 0.05 }}
                                                style={{ height: revHeight, transformOrigin: 'bottom' }} 
                                                className="flex-1 bg-artisan-grey hover:bg-artisan-grey/90 transition-all duration-300 relative cursor-pointer" 
                                             />
                                             {/* Animated Profit Bar */}
                                             <motion.div 
                                                initial={{ scaleY: 0 }}
                                                animate={{ scaleY: 1 }}
                                                transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1], delay: idx * 0.05 + 0.05 }}
                                                style={{ height: profHeight, transformOrigin: 'bottom' }} 
                                                className="flex-1 bg-artisan-light hover:bg-artisan-light/80 transition-all duration-300 relative cursor-pointer" 
                                             />
                                          </div>
                                          <span className="text-[7px] sm:text-[9px] font-mono text-artisan-light/40 uppercase mt-2 tracking-tighter truncate max-w-full font-bold">{item.month}</span>
                                       </div>
                                    );
                                 });
                              })()}
                           </div>
                        )}
                     </div>
                  </div>

                  {/* PANEL 2: DETAILED FINANCIAL KPIs */}
                  <div className="p-6 sm:p-8 bg-artisan-light/[0.02] border border-artisan-light/10 flex flex-col justify-between hover:border-artisan-light/20 transition-colors duration-300 group">
                     <div className="space-y-6 flex-1 flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                           <div className="space-y-1">
                              <h3 className="text-lg font-display font-extrabold uppercase tracking-widest text-artisan-light">Financial Ledger</h3>
                              <p className="text-[8px] font-mono text-artisan-light/40 uppercase tracking-widest">Calculated performance metrics</p>
                           </div>
                           <Zap className="w-5 h-5 text-artisan-grey group-hover:animate-bounce" />
                        </div>

                        <div className="space-y-4 my-auto">
                           {/* Gross Revenue */}
                           <div className="group/row flex flex-col p-2 border-b border-artisan-light/5 hover:bg-artisan-light/[0.02] transition-colors duration-200">
                              <div className="flex items-baseline justify-between w-full">
                                 <span className="text-[9px] font-mono text-artisan-light/50 uppercase font-bold">Gross Revenue</span>
                                 <div className="flex-1 border-b border-dotted border-artisan-light/10 mx-2 mb-1" />
                                 <span className="text-lg font-display font-black text-artisan-light">
                                    ₹{loading ? '...' : stats.revenue.toLocaleString()}
                                 </span>
                              </div>
                           </div>

                           {/* Net Profit */}
                           <div className="group/row flex flex-col p-2 border-b border-artisan-light/5 hover:bg-artisan-light/[0.02] transition-colors duration-200">
                              <div className="flex items-baseline justify-between w-full">
                                 <span className="text-[9px] font-mono text-artisan-light/50 uppercase font-bold">Net Profit</span>
                                 <div className="flex-1 border-b border-dotted border-artisan-light/10 mx-2 mb-1" />
                                 <span className="text-lg font-display font-black text-artisan-grey">
                                    ₹{loading ? '...' : stats.profit.toLocaleString()}
                                 </span>
                              </div>
                           </div>

                           {/* AOV */}
                           <div className="group/row flex flex-col p-2 border-b border-artisan-light/5 hover:bg-artisan-light/[0.02] transition-colors duration-200">
                              <div className="flex items-baseline justify-between w-full">
                                 <span className="text-[9px] font-mono text-artisan-light/50 uppercase font-bold">Average Order Value</span>
                                 <div className="flex-1 border-b border-dotted border-artisan-light/10 mx-2 mb-1" />
                                 <span className="text-lg font-display font-black text-artisan-light">
                                    ₹{loading ? '...' : (stats.totalOrders > 0 ? Math.round(stats.revenue / stats.totalOrders).toLocaleString() : 0)}
                                 </span>
                              </div>
                           </div>

                           {/* Gross Margin */}
                           <div className="group/row flex flex-col p-2 hover:bg-artisan-light/[0.02] transition-colors duration-200">
                              <div className="flex items-baseline justify-between w-full mb-2">
                                 <span className="text-[9px] font-mono text-artisan-light/50 uppercase font-bold">Estimated Margin</span>
                                 <div className="flex-1 border-b border-dotted border-artisan-light/10 mx-2 mb-1" />
                                 <span className="text-lg font-display font-black text-green-600">
                                    {loading ? '...' : (stats.revenue > 0 ? Math.round((stats.profit / stats.revenue) * 100) : 0)}%
                                 </span>
                              </div>
                              {/* Visual Indicator of profitability */}
                              <div className="h-1.5 w-full bg-artisan-light/5 overflow-hidden">
                                 <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: loading ? 0 : `${stats.revenue > 0 ? Math.round((stats.profit / stats.revenue) * 100) : 0}%` }}
                                    transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                                    className="h-full bg-artisan-grey"
                                 />
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* PANEL 3: TOP 3 LOW STOCK ALERT */}
                  <div className="p-6 sm:p-8 bg-artisan-light/[0.02] border border-artisan-light/10 flex flex-col justify-between hover:border-artisan-light/20 transition-colors duration-300 group">
                     <div className="space-y-6 w-full flex-1 flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                           <div className="space-y-1">
                              <h3 className="text-lg font-display font-extrabold uppercase tracking-widest text-artisan-light">Critical Stock Levels</h3>
                              <p className="text-[8px] font-mono text-artisan-light/40 uppercase tracking-widest">Procurement warning thresholds</p>
                           </div>
                           <AlertTriangle className="w-5 h-5 text-red-500 group-hover:animate-pulse" />
                        </div>

                        <div className="space-y-4 my-auto">
                           {loading ? (
                              <div className="flex justify-center py-10">
                                 <Loader2 className="w-5 h-5 text-artisan-grey animate-spin" />
                              </div>
                           ) : !stats.lowStockProducts || stats.lowStockProducts.length === 0 ? (
                              <div className="py-10 text-center border border-dashed border-artisan-light/10 bg-artisan-light/[0.01]">
                                 <CheckCircle className="w-8 h-8 text-green-600/30 mx-auto mb-2" />
                                 <p className="text-[9px] font-mono text-artisan-light/40 uppercase tracking-widest font-bold">Inventory Fully Stocked</p>
                              </div>
                           ) : (
                              stats.lowStockProducts.slice(0, 3).map((prod, idx) => {
                                 const threshold = prod.lowstockthreshold || 10;
                                 const stockPct = Math.min(100, (prod.quantity / threshold) * 100);
                                 const isZero = prod.quantity === 0;

                                 return (
                                    <div 
                                       key={idx} 
                                       className={`p-3.5 border transition-all duration-200 space-y-3 ${
                                          isZero 
                                             ? 'border-red-500/20 bg-red-500/[0.01] hover:bg-red-500/[0.03]' 
                                             : 'border-artisan-light/5 bg-artisan-light/[0.01] hover:bg-artisan-light/[0.03]'
                                       }`}
                                    >
                                       <div className="flex justify-between items-start gap-4">
                                          <div className="space-y-1 min-w-0 flex-1">
                                             <div className="flex items-center gap-2">
                                                {isZero && (
                                                   <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping shrink-0" />
                                                )}
                                                <span className="text-[8px] font-mono text-artisan-grey uppercase tracking-widest font-bold block truncate">SKU: {prod.sku}</span>
                                             </div>
                                             <h4 className="text-xs font-display font-bold text-artisan-light uppercase truncate block" title={prod.name}>
                                                {prod.name}
                                             </h4>
                                          </div>
                                          <span className={`text-[10px] font-mono font-black shrink-0 px-2 py-0.5 border ${
                                             isZero 
                                                ? 'border-red-500/20 text-red-500 bg-red-500/5' 
                                                : 'border-artisan-light/10 text-artisan-light'
                                          }`}>
                                             {prod.quantity} Left
                                          </span>
                                       </div>
                                       
                                       <div className="space-y-1">
                                          <div className="h-1.5 w-full bg-artisan-light/5 relative overflow-hidden">
                                             <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${stockPct}%` }}
                                                transition={{ duration: 0.8, ease: 'easeOut', delay: idx * 0.1 }}
                                                className={`absolute inset-y-0 left-0 ${
                                                   isZero 
                                                      ? 'bg-red-500' 
                                                      : stockPct < 30 
                                                         ? 'bg-red-500' 
                                                         : 'bg-artisan-grey'
                                                }`} 
                                             />
                                          </div>
                                          <div className="flex justify-between text-[7px] font-mono text-artisan-light/35 uppercase">
                                             <span>Level: {Math.round(stockPct)}%</span>
                                             <span>Threshold: {threshold}</span>
                                          </div>
                                       </div>
                                    </div>
                                 );
                              })
                           )}
                        </div>
                     </div>
                  </div>

               </div>

               {/* SYSTEM ANALYTICS & VISITOR BEHAVIOR */}
               <div className="flex items-center gap-4 mb-8 mt-12">
                  <h2 className="text-xl font-display font-extrabold uppercase tracking-widest text-artisan-light">System Analytics & Traffic</h2>
                  <div className="h-px flex-1 bg-artisan-light/10" />
               </div>

               {loading ? (
                  <div className="flex justify-center py-20">
                     <Loader2 className="w-8 h-8 text-artisan-grey animate-spin" />
                  </div>
               ) : analytics ? (
                  <div className="space-y-8 mb-16">
                     
                     {/* Row 1: Session Overview Cards */}
                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="p-5 border border-artisan-light/10 bg-artisan-light/[0.01] flex items-center gap-4">
                           <div className="p-3 bg-artisan-light/5 border border-artisan-light/10 text-artisan-grey">
                              <Activity className="w-5 h-5" />
                           </div>
                           <div>
                              <span className="text-[8px] font-mono text-artisan-light/40 uppercase tracking-widest block font-bold">Total Visitor Sessions</span>
                              <span className="text-2xl font-display font-black text-artisan-light">{analytics.sessions?.total || 0}</span>
                           </div>
                        </div>
                        <div className="p-5 border border-artisan-light/10 bg-artisan-light/[0.01] flex items-center gap-4">
                           <div className="p-3 bg-artisan-light/5 border border-artisan-light/10 text-artisan-grey">
                              <Clock className="w-5 h-5" />
                           </div>
                           <div>
                              <span className="text-[8px] font-mono text-artisan-light/40 uppercase tracking-widest block font-bold">Avg Session Duration</span>
                              <span className="text-2xl font-display font-black text-artisan-light">
                                 {(() => {
                                    const secs = analytics.sessions?.averageDurationSeconds || 0;
                                    const m = Math.floor(secs / 60);
                                    const s = secs % 60;
                                    return m > 0 ? `${m}m ${s}s` : `${s}s`;
                                 })()}
                              </span>
                           </div>
                        </div>
                        <div className="p-5 border border-artisan-light/10 bg-artisan-light/[0.01] flex items-center gap-4">
                           <div className="p-3 bg-artisan-light/5 border border-artisan-light/10 text-artisan-grey">
                              <TrendingUp className="w-5 h-5" />
                           </div>
                           <div>
                              <span className="text-[8px] font-mono text-artisan-light/40 uppercase tracking-widest block font-bold">Max Session Duration</span>
                              <span className="text-2xl font-display font-black text-artisan-light">
                                 {(() => {
                                    const secs = analytics.sessions?.maxDurationSeconds || 0;
                                    const m = Math.floor(secs / 60);
                                    const s = secs % 60;
                                    return m > 0 ? `${m}m ${s}s` : `${s}s`;
                                 })()}
                              </span>
                           </div>
                        </div>
                     </div>

                     {/* Row 1.5: 2 Graphs (Traffic Trend & Device Breakdown) */}
                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        
                        {/* Graph 1: 7-Day Traffic Trend */}
                        <div className="p-6 sm:p-8 border border-artisan-light/10 bg-artisan-light/[0.02] flex flex-col justify-between hover:border-artisan-light/20 transition-colors duration-300 relative group">
                           <div className="space-y-6">
                              <div className="flex justify-between items-start">
                                 <div className="space-y-1">
                                    <h3 className="text-lg font-display font-extrabold uppercase tracking-widest text-artisan-light">Daily Traffic Trend</h3>
                                    <p className="text-[8px] font-mono text-artisan-light/40 uppercase tracking-widest">Active sessions over the last 7 days</p>
                                 </div>
                                 <div className="text-[10px] font-mono text-artisan-grey font-bold shrink-0">
                                    Last 7 Days
                                 </div>
                              </div>

                              <div className="h-48 flex items-end gap-3 pt-8 border-b border-artisan-light/10 pb-2 relative">
                                 {/* Grid reference lines */}
                                 <div className="absolute inset-x-0 top-8 border-t border-dashed border-artisan-light/5 pointer-events-none" />
                                 <div className="absolute inset-x-0 top-20 border-t border-dashed border-artisan-light/5 pointer-events-none" />
                                 <div className="absolute inset-x-0 top-32 border-t border-dashed border-artisan-light/5 pointer-events-none" />

                                 {(() => {
                                    const trend = analytics.trafficTrend || [];
                                    const maxSessions = trend.length > 0 ? Math.max(...trend.map(t => t.count), 5) : 5;
                                    
                                    return trend.map((item, idx) => {
                                       const barHeight = `${Math.max(5, (item.count / maxSessions) * 100)}%`;
                                       const isFirst = idx === 0;
                                       const isLast = idx === trend.length - 1;
                                       const tooltipAlignClass = isFirst 
                                          ? "left-0" 
                                          : isLast 
                                             ? "right-0" 
                                             : "left-1/2 -translate-x-1/2";
                                       
                                       // Format date string for displaying in x-axis: e.g. "04 Jun"
                                       let displayDate = item.date;
                                       try {
                                          const d = new Date(item.date);
                                          displayDate = d.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
                                       } catch (e) {}

                                       return (
                                          <div key={idx} className="flex-1 flex flex-col items-center gap-1 group/trend-bar h-full justify-end relative">
                                             {/* Hover Tooltip */}
                                             <div className={`absolute bottom-full mb-3 ${tooltipAlignClass} bg-artisan-light border border-artisan-light/10 p-3 opacity-0 pointer-events-none group-hover/trend-bar:opacity-100 transition-opacity duration-200 z-50 shadow-2xl min-w-[120px]`}>
                                                <p className="text-[8px] font-mono text-artisan-dark/60 uppercase font-bold tracking-wider">{item.date}</p>
                                                <div className="h-px bg-artisan-dark/10 my-1" />
                                                <p className="text-[10px] font-mono font-bold text-artisan-dark">{item.count} Sessions</p>
                                             </div>

                                             {/* Animated Traffic Bar */}
                                             <motion.div
                                                initial={{ scaleY: 0 }}
                                                animate={{ scaleY: 1 }}
                                                transition={{ duration: 0.6, ease: 'easeOut', delay: idx * 0.04 }}
                                                style={{ height: barHeight, transformOrigin: 'bottom' }}
                                                className="w-full bg-artisan-grey hover:bg-artisan-light transition-all duration-300 relative cursor-pointer"
                                             />
                                             <span className="text-[7px] md:text-[9px] font-mono text-artisan-light/40 uppercase mt-2 tracking-tighter truncate max-w-full font-bold">
                                                {displayDate}
                                             </span>
                                          </div>
                                       );
                                    });
                                 })()}
                              </div>
                           </div>
                        </div>

                        {/* Graph 2: Device Traffic Distribution */}
                        <div className="p-6 sm:p-8 border border-artisan-light/10 bg-artisan-light/[0.02] flex flex-col justify-between hover:border-artisan-light/20 transition-colors duration-300 relative group">
                           <div className="space-y-6 flex-1 flex flex-col justify-between">
                              <div className="space-y-1">
                                 <h3 className="text-lg font-display font-extrabold uppercase tracking-widest text-artisan-light">Device Breakdown</h3>
                                 <p className="text-[8px] font-mono text-artisan-light/40 uppercase tracking-widest">Aggregate sessions by user agent category</p>
                              </div>

                              <div className="space-y-5 my-auto">
                                 {(() => {
                                    const devices = analytics.deviceBreakdown || [];
                                    const totalCount = devices.reduce((sum, d) => sum + d.count, 0) || 1;

                                    return devices.map((item, idx) => {
                                       const pct = Math.round((item.count / totalCount) * 100);
                                       const colorClass = item.device === 'desktop' 
                                          ? 'bg-artisan-light' 
                                          : item.device === 'mobile' 
                                             ? 'bg-artisan-grey' 
                                             : 'bg-artisan-light/40';

                                       return (
                                          <div key={idx} className="space-y-1">
                                             <div className="flex justify-between text-xs font-mono">
                                                <span className="text-artisan-light font-bold uppercase tracking-wider">{item.device}</span>
                                                <span className="text-artisan-light/50">
                                                   {item.count} Sessions ({pct}%)
                                                </span>
                                             </div>
                                             <div className="h-3 w-full bg-artisan-light/5 relative overflow-hidden">
                                                <motion.div
                                                   initial={{ width: 0 }}
                                                   animate={{ width: `${pct}%` }}
                                                   transition={{ duration: 0.8, ease: 'easeOut', delay: idx * 0.1 }}
                                                   className={`h-full ${colorClass}`}
                                                 />
                                             </div>
                                          </div>
                                       );
                                    });
                                 })()}
                              </div>
                           </div>
                        </div>

                     </div>

                     {/* Row 2: Split Layout (Funnel & UTM) */}
                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        
                        {/* Panel 1: Conversion Funnel */}
                        <div className="p-6 sm:p-8 border border-artisan-light/10 bg-artisan-light/[0.02] flex flex-col justify-between">
                           <div className="space-y-6">
                              <div className="space-y-1">
                                 <h3 className="text-lg font-display font-extrabold uppercase tracking-widest text-artisan-light">Unique Session Funnel</h3>
                                 <p className="text-[8px] font-mono text-artisan-light/40 uppercase tracking-widest">Customer Conversion Journey</p>
                              </div>

                              {(() => {
                                 const f = analytics.funnel?.uniqueSessionFunnel || {
                                    sessions: 0,
                                    pageViewCount: 0,
                                    addToCartCount: 0,
                                    checkoutCount: 0,
                                    purchaseCount: 0
                                 };
                                 
                                 const totalSess = f.sessions || 1;
                                 
                                 const funnelStages = [
                                    { label: 'Sessions', count: f.sessions, pct: 100 },
                                    { label: 'Page Views', count: f.pageViewCount, pct: Math.round((f.pageViewCount / totalSess) * 100) },
                                    { label: 'Add to Cart', count: f.addToCartCount, pct: Math.round((f.addToCartCount / totalSess) * 100) },
                                    { label: 'Initiated Checkout', count: f.checkoutCount, pct: Math.round((f.checkoutCount / totalSess) * 100) },
                                    { label: 'Completed Purchase', count: f.purchaseCount, pct: Math.round((f.purchaseCount / totalSess) * 100) }
                                 ];

                                 return (
                                    <div className="space-y-4">
                                       {funnelStages.map((stage, idx) => (
                                          <div key={idx} className="space-y-1">
                                             <div className="flex justify-between text-xs font-mono">
                                                <span className="text-artisan-light font-bold uppercase">{stage.label}</span>
                                                <span className="text-artisan-light/50">
                                                   {stage.count} ({stage.pct}%)
                                                </span>
                                             </div>
                                             <div className="h-2 w-full bg-artisan-light/5 relative overflow-hidden">
                                                <motion.div
                                                   initial={{ width: 0 }}
                                                   animate={{ width: `${stage.pct}%` }}
                                                   transition={{ duration: 1, ease: 'easeOut', delay: idx * 0.1 }}
                                                   className="h-full bg-artisan-grey"
                                                />
                                             </div>
                                          </div>
                                       ))}
                                    </div>
                                 );
                              })()}
                           </div>
                        </div>

                        {/* Panel 2: UTM Campaign Ledger */}
                        <div className="p-6 sm:p-8 border border-artisan-light/10 bg-artisan-light/[0.02] flex flex-col justify-between overflow-hidden">
                           <div className="space-y-6 w-full h-full flex flex-col">
                              <div className="space-y-1">
                                 <h3 className="text-lg font-display font-extrabold uppercase tracking-widest text-artisan-light">Referral & Campaign Ledger</h3>
                                 <p className="text-[8px] font-mono text-artisan-light/40 uppercase tracking-widest">UTM Source Conversion Performance</p>
                              </div>

                              <div className="flex-1 overflow-x-auto min-w-full">
                                 <table className="w-full text-left border-collapse">
                                    <thead>
                                       <tr className="border-b border-artisan-light/10 text-[8px] font-mono text-artisan-light/40 uppercase tracking-widest">
                                          <th className="pb-3 pr-2">Source</th>
                                          <th className="pb-3 px-2">Referrer</th>
                                          <th className="pb-3 px-2 text-center">Sessions</th>
                                          <th className="pb-3 px-2 text-center">Conversions</th>
                                          <th className="pb-3 pl-2 text-right">Conv. Rate</th>
                                       </tr>
                                    </thead>
                                    <tbody className="divide-y divide-artisan-light/5 font-mono text-[10px]">
                                       {!analytics.conversionBySource || analytics.conversionBySource.length === 0 ? (
                                          <tr>
                                             <td colSpan="5" className="py-8 text-center text-artisan-light/25 uppercase">
                                                No referral sources recorded.
                                             </td>
                                          </tr>
                                       ) : (
                                          analytics.conversionBySource.slice(0, 5).map((item, idx) => (
                                             <tr key={idx} className="hover:bg-artisan-light/[0.01]">
                                                <td className="py-3 pr-2 text-artisan-light font-bold uppercase truncate max-w-[80px]" title={item.source || 'Direct'}>
                                                   {item.source || 'Direct'}
                                                </td>
                                                <td className="py-3 px-2 text-artisan-light/50 truncate max-w-[100px]" title={item.referrer || 'direct'}>
                                                   {item.referrer || 'direct'}
                                                </td>
                                                <td className="py-3 px-2 text-center text-artisan-light/75">{item.sessionsCount}</td>
                                                <td className="py-3 px-2 text-center text-artisan-light/75">{item.conversionsCount}</td>
                                                <td className="py-3 pl-2 text-right text-green-600 font-bold">
                                                   {Math.round(item.conversionRate * 10) / 10}%
                                                </td>
                                             </tr>
                                          ))
                                       )}
                                    </tbody>
                                 </table>
                              </div>
                           </div>
                        </div>

                     </div>

                     {/* Row 3: Popular Pages list */}
                     <div className="p-6 sm:p-8 border border-artisan-light/10 bg-artisan-light/[0.02]">
                        <div className="space-y-6">
                           <div className="space-y-1">
                              <h3 className="text-lg font-display font-extrabold uppercase tracking-widest text-artisan-light">Popular Directories</h3>
                              <p className="text-[8px] font-mono text-artisan-light/40 uppercase tracking-widest">Most visited paths by aggregate engagement</p>
                           </div>

                           <div className="overflow-x-auto">
                              <table className="w-full text-left border-collapse">
                                 <thead>
                                    <tr className="border-b border-artisan-light/10 text-[8px] font-mono text-artisan-light/40 uppercase tracking-widest">
                                       <th className="pb-3 pr-4">Page Path</th>
                                       <th className="pb-3 px-4 text-center">Visits</th>
                                       <th className="pb-3 px-4 text-right">Total Time Spent</th>
                                       <th className="pb-3 pl-4 text-right">Avg Time / Visit</th>
                                    </tr>
                                 </thead>
                                 <tbody className="divide-y divide-artisan-light/5 font-mono text-[10px]">
                                    {!analytics.popularPages || analytics.popularPages.length === 0 ? (
                                       <tr>
                                          <td colSpan="4" className="py-8 text-center text-artisan-light/25 uppercase">
                                             No page view details available.
                                          </td>
                                       </tr>
                                    ) : (
                                       analytics.popularPages.map((page, idx) => (
                                          <tr key={idx} className="hover:bg-artisan-light/[0.01]">
                                             <td className="py-3 pr-4 text-artisan-grey font-bold select-all">{page._id}</td>
                                             <td className="py-3 px-4 text-center text-artisan-light/75">{page.visitsCount}</td>
                                             <td className="py-3 px-4 text-right text-artisan-light/75">
                                                {(() => {
                                                   const secs = page.totalDuration || 0;
                                                   const m = Math.floor(secs / 60);
                                                   const s = secs % 60;
                                                   return m > 0 ? `${m}m ${s}s` : `${s}s`;
                                                })()}
                                             </td>
                                             <td className="py-3 pl-4 text-right text-artisan-light font-semibold">
                                                {Math.round(page.averageDuration || 0)}s
                                             </td>
                                          </tr>
                                       ))
                                    )}
                                 </tbody>
                              </table>
                           </div>
                        </div>
                     </div>

                  </div>
               ) : (
                  <div className="py-12 text-center border border-dashed border-artisan-light/10 bg-artisan-light/[0.01] mb-16">
                     <Inbox className="w-12 h-12 text-artisan-light/10 mx-auto mb-4" />
                     <p className="text-[10px] font-mono text-artisan-light/30 uppercase tracking-[0.2em] font-bold">No analytics data recorded yet</p>
                  </div>
               )}

               {/* ORDERS LEDGER & HISTORY */}
               <div id="pending-orders" className="flex flex-col mb-16 scroll-mt-24">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
                     <div className="flex items-center gap-4 flex-1">
                        <h2 className="text-xl font-display font-extrabold uppercase tracking-widest text-artisan-light">Orders Ledger & History</h2>
                        <div className="h-px flex-1 bg-artisan-light/10 hidden md:block" />
                     </div>
                     <div className="flex border border-artisan-light/10 p-1 bg-artisan-light/[0.01] shrink-0">
                        <button
                           onClick={() => setOrderTab('pending')}
                           className={`px-4 py-2 text-[9px] font-mono font-bold uppercase tracking-widest transition-all ${
                              orderTab === 'pending'
                                 ? 'bg-artisan-light text-artisan-dark'
                                 : 'text-artisan-light/40 hover:text-artisan-light'
                           }`}
                        >
                           Pending ({pendingBookings.length})
                        </button>
                        <button
                           onClick={() => setOrderTab('all')}
                           className={`px-4 py-2 text-[9px] font-mono font-bold uppercase tracking-widest transition-all ${
                              orderTab === 'all'
                                 ? 'bg-artisan-light text-artisan-dark'
                                 : 'text-artisan-light/40 hover:text-artisan-light'
                           }`}
                        >
                           All Orders ({bookings.length})
                        </button>
                     </div>
                  </div>

                  <div className="space-y-4 min-h-[350px]">
                     {loading ? (
                        <div className="flex justify-center py-20">
                           <Loader2 className="w-8 h-8 text-artisan-grey animate-spin" />
                        </div>
                     ) : (
                        <AnimatePresence mode="wait">
                           <motion.div
                              key={orderTab}
                              initial={{ opacity: 0, y: 15 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -15 }}
                              transition={{ duration: 0.25, ease: "easeInOut" }}
                           >
                              {(orderTab === 'pending' ? pendingBookings : bookings).length === 0 ? (
                                 <div className="flex flex-col items-center justify-center py-20 border border-dashed border-artisan-light/10 bg-artisan-light/[0.01]">
                                    <Inbox className="w-12 h-12 text-artisan-light/10 mb-4" />
                                    <p className="text-[10px] font-mono text-artisan-light/30 uppercase tracking-[0.2em] font-bold">
                                       {orderTab === 'pending' ? 'All Orders processed // Queue Clear' : 'No order history records'}
                                    </p>
                                 </div>
                              ) : (
                                 <div className="grid grid-cols-1 gap-3">
                                    <AnimatePresence>
                                       {(orderTab === 'pending' ? pendingBookings : bookings).map((booking) => (
                                          <motion.div 
                                             key={booking._id} 
                                             initial={{ opacity: 0, y: 10 }}
                                             animate={{ opacity: 1, y: 0 }}
                                             exit={{ opacity: 0, x: -10 }}
                                             className="p-5 border border-artisan-light/10 bg-artisan-light/[0.01] hover:bg-artisan-light/[0.03] hover:border-artisan-grey/30 transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-5 group/item min-w-0"
                                          >
                                             {/* Order Content */}
                                             <div className="flex items-start sm:items-center gap-5 min-w-0 flex-1">
                                                <div className="w-14 h-14 bg-artisan-light/5 border border-artisan-light/10 overflow-hidden shrink-0 flex items-center justify-center text-xl text-artisan-grey group-hover/item:bg-artisan-light/10 group-hover/item:border-artisan-grey/20 transition-all">
                                                   📦
                                                </div>
                                                <div className="space-y-1.5 min-w-0 flex-1">
                                                   <div className="flex flex-wrap items-center gap-3">
                                                      <Link
                                                         to={`/orders/${booking._id}`}
                                                         className="text-[9px] font-mono text-artisan-grey uppercase tracking-[0.2em] font-black hover:text-artisan-light transition-colors flex items-center gap-1"
                                                      >
                                                         Order #{booking._id.slice(-8).toUpperCase()}
                                                         <ArrowUpRight className="w-3 h-3 text-artisan-grey/50 group-hover/item:text-artisan-light transition-colors" />
                                                      </Link>
                                                      <div className="flex items-center gap-1 text-[8px] font-mono text-artisan-light/40 uppercase">
                                                         <Calendar className="w-3 h-3" />
                                                         <span>{booking.startDate ? new Date(booking.startDate).toLocaleDateString() : 'N/A'}</span>
                                                      </div>
                                                   </div>
                                                   
                                                   <h3 className="text-lg font-display font-black uppercase text-artisan-light hover:text-artisan-grey transition-colors leading-tight truncate block" title={booking.listing?.title}>
                                                      <Link to={`/orders/${booking._id}`}>
                                                         {booking.listing?.title || 'STAT Surgical Tool'}
                                                      </Link>
                                                   </h3>
                                                   
                                                   <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                                                      <span className="text-[9px] font-mono text-artisan-light/50 uppercase font-semibold">
                                                         Client: <span className="text-artisan-light">{booking.renter?.name || 'Guest User'}</span>
                                                      </span>
                                                      <span className="text-artisan-light/20">•</span>
                                                      <span className="text-[9px] font-mono text-artisan-light/50 uppercase font-semibold">
                                                         Price: <span className="text-artisan-light">₹{(booking.totalPrice || 0).toLocaleString()}</span>
                                                      </span>
                                                   </div>
                                                </div>
                                             </div>
                                             
                                             {/* Actions / Status Badge */}
                                             <div className="flex sm:self-end md:self-auto gap-2.5 shrink-0 justify-end mt-2 md:mt-0">
                                                {booking.status === 'pending' ? (
                                                   <>
                                                      <button
                                                         onClick={() => handleStatusUpdate(booking._id, 'approved')}
                                                         disabled={actionLoading === booking._id}
                                                         className="h-11 px-5 bg-artisan-light/5 border border-green-500/20 text-green-600 hover:bg-green-600 hover:text-artisan-dark hover:border-green-600 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 group/btn font-mono text-[9px] font-bold uppercase tracking-widest"
                                                         title="Confirm and Process Order"
                                                      >
                                                         {actionLoading === booking._id ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                         ) : (
                                                            <>
                                                               <CheckCircle className="w-4 h-4 transition-transform group-hover/btn:scale-110" />
                                                               <span>Approve</span>
                                                            </>
                                                         )}
                                                      </button>
                                                      <button
                                                         onClick={() => handleStatusUpdate(booking._id, 'rejected')}
                                                         disabled={actionLoading === booking._id}
                                                         className="h-11 px-5 bg-artisan-light/5 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-artisan-dark hover:border-red-500 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 group/btn font-mono text-[9px] font-bold uppercase tracking-widest"
                                                         title="Cancel and Void Order"
                                                      >
                                                         {actionLoading === booking._id ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                         ) : (
                                                            <>
                                                               <XCircle className="w-4 h-4 transition-transform group-hover/btn:scale-110" />
                                                               <span>Reject</span>
                                                            </>
                                                         )}
                                                      </button>
                                                   </>
                                                ) : (
                                                   <div className={`px-4 py-3 border font-mono text-[9px] font-bold uppercase tracking-widest flex items-center justify-center ${
                                                      booking.status === 'confirmed'
                                                         ? 'border-green-500/20 text-green-500 bg-green-500/5'
                                                         : 'border-red-500/20 text-red-500 bg-red-500/5'
                                                   }`}>
                                                      {booking.status}
                                                   </div>
                                                )}
                                             </div>
                                          </motion.div>
                                       ))}
                                    </AnimatePresence>
                                 </div>
                              )}
                           </motion.div>
                        </AnimatePresence>
                     )}
                  </div>
               </div>

            </div>
         </div>
      </div>
   )
}
