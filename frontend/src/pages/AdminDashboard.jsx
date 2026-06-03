import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
   BarChart3,
   Users,
   Package,
   AlertTriangle,
   ArrowUpRight,
   CheckCircle,
   XCircle,
   MoreVertical,
   Activity,
   ShieldAlert,
   Zap,
   Hammer,
   Loader2,
   RefreshCcw,
   FileText
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useToast } from '../context/ToastContext'
import api from '../services/api'

export default function AdminDashboard() {
   const { addToast } = useToast()
   const [loading, setLoading] = useState(true)
   const [stats, setStats] = useState({ totalUsers: 0, totalListings: 0, pendingListings: 0 })
   const [pendingTools, setPendingTools] = useState([])
   const [bookings, setBookings] = useState([])
   const [actionLoading, setActionLoading] = useState(null)

   const fetchData = async () => {
      try {
         setLoading(true)
         const [statsRes, pendingRes, bookingsRes] = await Promise.all([
            api.get('/admin/stats'),
            api.get('/admin/listings/pending'),
            api.get('/admin/bookings')
         ])

         setStats(statsRes.data.data)
         setPendingTools(pendingRes.data.data)
         setBookings(bookingsRes.data.data)
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
         addToast(`Tool ${status}`, 'success')
         setPendingTools(prev => prev.filter(t => t._id !== id))
         setStats(prev => ({
            ...prev,
            pendingListings: prev.pendingListings - 1,
            totalListings: status === 'approved' ? prev.totalListings + 1 : prev.totalListings
         }))
      } catch (err) {
         addToast('Update failed', 'error')
      } finally {
         setActionLoading(null)
      }
   }

   const statCards = [
      { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-artisan-light' },
      { label: 'Live Tools', value: stats.totalListings, icon: Hammer, color: 'text-artisan-light' },
      { label: 'Pending Tools', value: stats.pendingListings, icon: ShieldAlert, color: 'text-artisan-grey' },
      { label: 'Server Status', value: 'Online', icon: Activity, color: 'text-green-500' }
   ]

   return (
      <div className="min-h-screen bg-artisan-dark bg-noise flex flex-col pb-24">
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

                  <div className="flex gap-4">
                     <Link
                        to="/admin/content"
                        className="px-6 py-4 bg-artisan-grey text-artisan-dark hover:bg-artisan-light transition-all flex items-center gap-3 group"
                     >
                        <FileText className="w-4 h-4" />
                        <span className="text-[10px] font-mono font-bold uppercase tracking-widest">Publish</span>
                     </Link>
                     <button
                        onClick={fetchData}
                        className="px-6 py-4 bg-artisan-light/[0.02] border border-artisan-light/10 hover:bg-artisan-light/5 transition-all group"
                     >
                        <RefreshCcw className={`w-4 h-4 text-artisan-grey group-hover:rotate-180 transition-transform duration-700 ${loading ? 'animate-spin' : ''}`} />
                     </button>
                     <div className="px-6 py-4 bg-artisan-light/[0.02] border border-artisan-light/10 space-y-1">
                        <span className="text-[8px] font-mono text-artisan-light/30 uppercase tracking-widest">Alerts</span>
                        <p className="text-lg font-display font-black text-artisan-grey uppercase">{stats.pendingListings} Pending</p>
                     </div>
                  </div>
               </header>

               {/* STATS */}
               <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10 shrink-0">
                  {statCards.map((stat, idx) => (
                     <div key={idx} className="p-6 border border-artisan-light/5 bg-artisan-light/[0.02] group relative overflow-hidden">
                        <div className="flex justify-between items-start mb-4">
                           <stat.icon className={`w-4 h-4 ${stat.color}`} />
                        </div>
                        <span className="text-[8px] font-mono text-artisan-light/30 uppercase tracking-[0.2em] mb-1 block">{stat.label}</span>
                        <p className="text-2xl font-display font-black text-artisan-light tracking-tight">
                           {loading ? '...' : stat.value}
                        </p>
                     </div>
                  ))}
               </div>

               {/* MAIN CONTENT GRID */}
               <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

                  {/* PENDING APPROVALS */}
                  <div className="lg:col-span-7 flex flex-col">
                     <div className="flex items-center gap-4 mb-8">
                        <h2 className="text-xl font-display font-extrabold uppercase tracking-widest text-artisan-light">Pending Approval</h2>
                        <div className="h-px flex-1 bg-artisan-light/10" />
                     </div>

                     <div className="space-y-4">
                        {loading ? (
                           <div className="flex justify-center py-20">
                              <Loader2 className="w-8 h-8 text-artisan-grey animate-spin" />
                           </div>
                        ) : pendingTools.length === 0 ? (
                           <div className="flex flex-col items-center justify-center py-20 border border-dashed border-artisan-light/10 bg-artisan-light/[0.01]">
                              <CheckCircle className="w-12 h-12 text-artisan-light/5 mb-4" />
                              <p className="text-[10px] font-mono text-artisan-light/20 uppercase tracking-widest">Guild Assets are all Verified</p>
                           </div>
                        ) : (
                           pendingTools.map((tool) => (
                              <div key={tool._id} className="p-6 border border-artisan-light/5 bg-artisan-light/[0.01] hover:bg-artisan-light/[0.03] transition-all flex items-center justify-between gap-6 group">
                                 <div className="flex items-center gap-6">
                                    <div className="w-20 h-20 bg-artisan-light/5 border border-artisan-light/10 overflow-hidden shrink-0">
                                       <img src={tool.images?.[0]} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt={tool.title} />
                                    </div>
                                    <div className="space-y-1">
                                       <span className="text-[8px] font-mono text-artisan-grey uppercase tracking-[0.2em] font-bold">{tool.category}</span>
                                       <h3 className="text-xl font-display font-extrabold uppercase text-artisan-light group-hover:text-artisan-grey transition-colors leading-tight">{tool.title}</h3>
                                       <div className="flex items-center gap-2 mt-1">
                                          <div className="w-4 h-4 bg-artisan-light/5 border border-artisan-light/10 overflow-hidden shrink-0 grayscale group-hover:grayscale-0 transition-all">
                                             <img src={tool.owner?.avatar || `https://i.pravatar.cc/100?u=${tool.owner?._id}`} className="w-full h-full object-cover" />
                                          </div>
                                          <span className="text-[9px] font-mono text-artisan-light/30 uppercase">User: {tool.owner?.name}</span>
                                       </div>
                                    </div>
                                 </div>
                                 <div className="flex gap-2 shrink-0">
                                    <button
                                       onClick={() => handleStatusUpdate(tool._id, 'approved')}
                                       disabled={actionLoading === tool._id}
                                       className="w-14 h-14 bg-artisan-light/5 border border-artisan-light/10 flex items-center justify-center text-green-500 hover:bg-green-500 hover:text-artisan-dark transition-all disabled:opacity-50"
                                    >
                                       {actionLoading === tool._id ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-6 h-6" />}
                                    </button>
                                    <button
                                       onClick={() => handleStatusUpdate(tool._id, 'rejected')}
                                       disabled={actionLoading === tool._id}
                                       className="w-14 h-14 bg-artisan-light/5 border border-artisan-light/10 flex items-center justify-center text-artisan-grey hover:bg-artisan-grey hover:text-artisan-dark transition-all disabled:opacity-50"
                                    >
                                       {actionLoading === tool._id ? <Loader2 className="w-5 h-5 animate-spin" /> : <XCircle className="w-6 h-6" />}
                                    </button>
                                 </div>
                              </div>
                           ))
                        )}
                     </div>
                  </div>

                  {/* OPERATIONAL METRICS */}
                  <div className="lg:col-span-5 flex flex-col">
                     <div className="flex items-center gap-4 mb-8">
                        <h2 className="text-xl font-display font-extrabold uppercase tracking-widest text-artisan-light">Operational Metrics</h2>
                        <div className="h-px flex-1 bg-artisan-light/10" />
                        <Zap className="w-4 h-4 text-artisan-grey" />
                     </div>

                     <div className="grid grid-cols-1 gap-6">
                        {/* REVENUE FORENSIC */}
                        <div className="p-8 bg-artisan-light/[0.02] border border-artisan-light/10 relative group overflow-hidden">
                           <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-100 transition-opacity">
                              <BarChart3 className="w-12 h-12 text-artisan-grey" />
                           </div>
                           <span className="text-[10px] font-mono text-artisan-light/30 uppercase tracking-[0.4em] block mb-6">Gross Guild Revenue</span>
                           <div className="flex items-end gap-4 relative z-10">
                              <h3 className="text-6xl font-display font-black text-artisan-light leading-none">
                                 ₹{bookings.reduce((acc, curr) => acc + (curr.status === 'confirmed' ? curr.totalPrice : 0), 0)}
                              </h3>
                              <div className="flex flex-col mb-1">
                                 <span className="text-[10px] font-mono text-green-500 font-bold uppercase tracking-widest">+12.4%</span>
                                 <span className="text-[7px] font-mono text-artisan-light/20 uppercase">Growth</span>
                              </div>
                           </div>
                        </div>

                        {/* PERFORMANCE STATS */}
                        <div className="grid grid-cols-2 gap-6">
                           <div className="p-8 bg-artisan-light/[0.01] border border-artisan-light/5 space-y-4">
                              <span className="text-[8px] font-mono text-artisan-light/30 uppercase tracking-widest">Asset Utilization</span>
                              <div className="flex items-center gap-3">
                                 <RefreshCcw className="w-5 h-5 text-artisan-grey" />
                                 <p className="text-3xl font-display font-black text-artisan-light">84%</p>
                              </div>
                           </div>
                           <div className="p-8 bg-artisan-light/[0.01] border border-artisan-light/5 space-y-4">
                              <span className="text-[8px] font-mono text-artisan-light/30 uppercase tracking-widest">Avg Transaction</span>
                              <div className="flex items-center gap-3">
                                 <Zap className="w-5 h-5 text-artisan-grey" />
                                 <p className="text-3xl font-display font-black text-artisan-light truncate">
                                    ₹{bookings.length > 0 ? Math.round(bookings.reduce((acc, curr) => acc + curr.totalPrice, 0) / bookings.length) : 0}
                                 </p>
                              </div>
                           </div>
                        </div>

                        {/* SYSTEM HEALTH */}
                        <div className="p-8 border-l-4 border-artisan-grey bg-artisan-light/[0.02] space-y-6">
                           <div className="flex justify-between items-center">
                              <span className="text-[10px] font-mono font-bold text-artisan-light uppercase tracking-[0.2em] italic">System Diagnostics</span>
                              <div className="flex gap-1.5">
                                 {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <div key={i} className={`w-1.5 h-4 ${i < 8 ? 'bg-green-500' : 'bg-green-500/20'}`} />)}
                              </div>
                           </div>
                           <p className="text-[11px] font-mono text-artisan-light/40 uppercase leading-relaxed tracking-wider">
                              All guild subsystems operational. Latency normalized at 14ms. Platform enlisted traffic peaking in Asia/Kolkata timezone.
                           </p>
                        </div>
                     </div>
                  </div>
               </div>

               {/* GUILD LEDGER - FULL WIDTH COMMAND SECTION */}
               <div className="mt-24 flex flex-col">
                  <div className="flex items-center gap-4 mb-10">
                     <div className="flex items-center gap-4">
                        <div className="w-3 h-10 bg-artisan-grey" />
                        <h2 className="text-3xl font-display font-extrabold uppercase tracking-widest text-artisan-light">Guild Ledger</h2>
                     </div>
                     <div className="h-px flex-1 bg-artisan-light/10" />
                     <Activity className="w-6 h-6 text-artisan-grey animate-pulse" />
                  </div>

                  <div className="overflow-x-auto border border-artisan-light/10 bg-artisan-dark/50 shadow-2xl">
                     <table className="w-full border-collapse">
                        <thead>
                           <tr className="border-b border-artisan-light/10 bg-artisan-light/[0.03]">
                              <th className="px-8 py-6 text-left text-[11px] font-mono font-bold text-artisan-light/40 uppercase tracking-widest">ID</th>
                              <th className="px-8 py-6 text-left text-[11px] font-mono font-bold text-artisan-light/40 uppercase tracking-widest">Asset</th>
                              <th className="px-8 py-6 text-left text-[11px] font-mono font-bold text-artisan-light/40 uppercase tracking-widest">Renter / Artisan</th>
                              <th className="px-8 py-6 text-left text-[11px] font-mono font-bold text-artisan-light/40 uppercase tracking-widest">Deployment Period</th>
                              <th className="px-8 py-6 text-right text-[11px] font-mono font-bold text-artisan-light/40 uppercase tracking-widest">Revenue</th>
                              <th className="px-8 py-6 text-center text-[11px] font-mono font-bold text-artisan-light/40 uppercase tracking-widest">Status</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-artisan-light/5">
                           {bookings.length === 0 ? (
                              <tr>
                                 <td colSpan="6" className="px-8 py-32 text-center">
                                    <Zap className="w-16 h-16 text-artisan-light/5 mx-auto mb-6" />
                                    <p className="text-[11px] font-mono text-artisan-light/20 uppercase tracking-[0.5em]">No Ledger Entries Recorded in the Guild</p>
                                 </td>
                              </tr>
                           ) : (
                              bookings.map((booking) => (
                                 <tr key={booking._id} className="group hover:bg-artisan-light/[0.03] transition-all duration-300">
                                    <td className="px-8 py-8 text-[11px] font-mono text-artisan-grey uppercase font-bold tracking-tighter">{booking._id.slice(-8).toUpperCase()}</td>
                                    <td className="px-8 py-8">
                                       <div className="flex flex-col">
                                          <span className="text-sm font-display font-black text-artisan-light uppercase group-hover:text-artisan-grey transition-colors tracking-tight">{booking.listing.title}</span>
                                          <span className="text-[8px] font-mono text-artisan-light/20 uppercase tracking-widest mt-1">Asset Reference Hash: {booking.listing._id.slice(-6)}</span>
                                       </div>
                                    </td>
                                    <td className="px-8 py-8">
                                       <div className="flex items-center gap-4">
                                          <div className="flex -space-x-3">
                                             <div className="w-8 h-8 border-2 border-artisan-dark overflow-hidden shrink-0 grayscale group-hover:grayscale-0 transition-all z-20">
                                                <img src={booking.renter.avatar || `https://i.pravatar.cc/100?u=${booking.renter._id}`} className="w-full h-full object-cover" />
                                             </div>
                                             <div className="w-8 h-8 border-2 border-artisan-dark overflow-hidden shrink-0 grayscale group-hover:grayscale-0 transition-all z-10">
                                                <img src={booking.owner.avatar || `https://i.pravatar.cc/100?u=${booking.owner._id}`} className="w-full h-full object-cover" />
                                             </div>
                                          </div>
                                          <div className="flex flex-col">
                                             <span className="text-[10px] font-mono font-bold text-artisan-light/60 uppercase tracking-tighter">{booking.renter.name} <span className="text-artisan-light/20 mx-1">→</span> {booking.owner.name}</span>
                                             <span className="text-[7px] font-mono text-artisan-light/20 uppercase tracking-widest">Active Pair Transmission</span>
                                          </div>
                                       </div>
                                    </td>
                                    <td className="px-8 py-8">
                                       <div className="flex flex-col">
                                          <span className="text-[10px] font-mono font-bold text-artisan-light uppercase">{new Date(booking.startDate).toLocaleDateString('en-GB')} — {new Date(booking.endDate).toLocaleDateString('en-GB')}</span>
                                          <span className="text-[8px] font-mono text-artisan-light/20 uppercase tracking-widest mt-1">Confirmed Deployment Window</span>
                                       </div>
                                    </td>
                                    <td className="px-8 py-8 text-right">
                                       <span className="text-lg font-display font-black text-artisan-light tracking-tighter group-hover:text-artisan-grey transition-colors">₹{booking.totalPrice}</span>
                                    </td>
                                    <td className="px-8 py-8">
                                       <div className="flex justify-center">
                                          <span className={`text-[9px] font-mono font-bold uppercase tracking-[0.2em] px-4 py-1.5 border-2 ${booking.status === 'confirmed' ? 'border-green-500 text-green-500 bg-green-500/5' :
                                             booking.status === 'pending' ? 'border-artisan-grey text-artisan-grey' :
                                                'border-red-500 text-red-500 bg-red-500/5'
                                             }`}>
                                             {booking.status}
                                          </span>
                                       </div>
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
      </div>
   )
}
