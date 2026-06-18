import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
   ArrowLeft,
   Mail,
   Settings,
   Ban,
   Unlock,
   Loader2,
   Calendar,
   Heart,
   ShoppingCart,
   MapPin,
   Copy,
   Check,
   Trash2,
   AlertTriangle,
   Package,
   Info,
   Activity,
   TrendingUp,
   CheckCircle,
   XCircle, Clock
} from 'lucide-react'
import { useToast } from '../context/ToastContext'
import api from '../services/api'

// Robust avatar component with error fallback
function UserAvatar({ avatar, className = "w-12 h-12" }) {
   const [imgError, setImgError] = useState(false);
   const hasValidAvatar = avatar && avatar !== 'default-avatar.png' && !imgError;

   return (
      <div className={`${className} bg-artisan-light/5 border border-artisan-light/10 overflow-hidden shrink-0 flex items-center justify-center`}>
         {hasValidAvatar ? (
            <img
               src={avatar}
               alt="User Avatar"
               className="w-full h-full object-cover"
               onError={() => setImgError(true)}
            />
         ) : (
            <span className="text-xl">👤</span>
         )}
      </div>
   );
}

export default function AdminUserDetail() {
   const { id } = useParams()
   const navigate = useNavigate()
   const { addToast } = useToast()

   const [loading, setLoading] = useState(true)
   const [user, setUser] = useState(null)
   const [activeTab, setActiveTab] = useState('overview')
   const [actionLoading, setActionLoading] = useState(false)
   const [copied, setCopied] = useState(false)
   const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

   // Edit form state
   const [editName, setEditName] = useState('')
   const [editEmail, setEditEmail] = useState('')

   // Ban form state
   const [banDuration, setBanDuration] = useState('7')
   const [banReason, setBanReason] = useState('')

   const fetchUserDetail = async () => {
      try {
         setLoading(true)
         const res = await api.get(`/admin/users/${id}`)
         const userData = res.data.data
         setUser(userData)
         setEditName(userData.name)
         setEditEmail(userData.email)
      } catch (err) {
         addToast('Failed to fetch user dossier', 'error')
         navigate('/admin/users')
      } finally {
         setLoading(false)
      }
   }

   useEffect(() => {
      fetchUserDetail()
   }, [id])

   const handleCopyId = (idString) => {
      navigator.clipboard.writeText(idString)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
   }

   const handleUpdateUser = async (e) => {
      e.preventDefault()
      try {
         setActionLoading(true)
         const res = await api.put(`/admin/users/${id}`, {
            role: 'customer',
            name: editName,
            email: editEmail
         })
         addToast('User records updated successfully', 'success')
         setUser(res.data.data)
      } catch (err) {
         addToast('Update failed', 'error')
      } finally {
         setActionLoading(false)
      }
   }

   const handleBanUser = async () => {
      try {
         setActionLoading(true)
         const isUnbanning = user.isBanned
         const banUntil = isUnbanning ? null : new Date(Date.now() + parseInt(banDuration) * 24 * 60 * 60 * 1000)

         const res = await api.put(`/admin/users/${id}/ban`, {
            isBanned: !isUnbanning,
            banUntil: banUntil,
            banReason: isUnbanning ? '' : banReason
         })

         addToast(isUnbanning ? 'User access restored' : 'User access suspended', 'success')
         setUser(res.data.data)
         setBanReason('')
      } catch (err) {
         addToast('Action failed', 'error')
      } finally {
         setActionLoading(false)
      }
   }

   const handleDeleteUser = async () => {
      try {
         setActionLoading(true)
         await api.delete(`/admin/users/${id}`)
         addToast('User profile permanently deleted from registry', 'success')
         navigate('/admin/users')
      } catch (err) {
         addToast('Deletion failed', 'error')
      } finally {
         setActionLoading(false)
         setShowDeleteConfirm(false)
      }
   }

   if (loading) {
      return (
         <div className="min-h-screen bg-artisan-dark flex items-center justify-center text-artisan-light">
            <div className="flex flex-col items-center gap-4">
               <Loader2 className="w-8 h-8 animate-spin text-artisan-grey" />
               <span className="font-mono text-xs uppercase tracking-widest text-artisan-light/40">Loading Client Dossier...</span>
            </div>
         </div>
      )
   }

   if (!user) return null

   return (
      <div className="min-h-screen bg-artisan-dark bg-noise pt-32 pb-24 text-artisan-light">
         <div className="container-custom">

            {/* Header & Back Link */}
            <div className="mb-10">
               <Link
                  to="/admin/users"
                  className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-artisan-light/40 hover:text-artisan-light transition-colors mb-6 group"
               >
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  <span>Back to Client Registry</span>
               </Link>

               <div className="space-y-2">
                  <h1 className="text-4xl sm:text-6xl font-display font-black uppercase tracking-tighter text-artisan-light leading-none">
                     CLIENT <span className="text-outline">FILE.</span>
                  </h1>
               </div>
            </div>

            {/* Split layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

               {/* Left Column: Profile Card */}
               <div className="space-y-6">
                  <div className="border border-artisan-light/10 bg-artisan-dark/50 p-6 sm:p-8 space-y-6">

                     {/* Identity */}
                     <div className="flex flex-col items-center text-center space-y-4">
                        <UserAvatar avatar={user.avatar} className="w-24 h-24 border-2 border-artisan-grey" />
                        <div className="space-y-1">
                           <h2 className="text-xl font-display font-black uppercase tracking-tight text-artisan-light">
                              {user.name}
                           </h2>
                           <span className="text-xs font-mono text-artisan-light/40 uppercase tracking-wider block">
                              {user.email}
                           </span>
                        </div>
                        <span className={`text-[8px] font-mono font-black uppercase tracking-widest px-3 py-1 border ${user.isBanned
                           ? 'border-red-500/20 text-red-500 bg-red-500/5'
                           : 'border-green-500/20 text-green-500 bg-green-500/5'
                           }`}>
                           {user.isBanned ? 'Suspended' : 'Active'}
                        </span>
                     </div>

                     {/* Details Meta */}
                     <div className="h-px bg-artisan-light/5 w-full" />
                     <div className="space-y-4 font-mono text-[10px] sm:text-xs">
                        <div className="space-y-1">
                           <span className="text-[8px] text-artisan-light/50 uppercase tracking-widest block font-bold">Client Identification</span>
                           <div className="flex items-center justify-between gap-2 p-2.5 bg-artisan-light/[0.02] border border-artisan-light/5">
                              <span className="font-bold text-artisan-light truncate select-all">{user._id}</span>
                              <button
                                 onClick={() => handleCopyId(user._id)}
                                 className="text-artisan-light/50 hover:text-artisan-light/70 transition-colors shrink-0"
                                 title="Copy ID"
                              >
                                 {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                           </div>
                        </div>
                        <div className="space-y-1">
                           <span className="text-[8px] text-artisan-light/50 uppercase tracking-widest block font-bold">Registry Date</span>
                           <div className="flex items-center gap-2 text-artisan-light/75">
                              <Calendar className="w-4 h-4 text-artisan-grey shrink-0" />
                              <span className="uppercase">
                                 {new Date(user.createdAt).toLocaleDateString()} at {new Date(user.createdAt).toLocaleTimeString()}
                              </span>
                           </div>
                        </div>
                     </div>

                     {/* Danger Zone */}
                     <div className="h-px bg-artisan-light/5 w-full" />
                     <div className="space-y-2">
                        <span className="text-[8px] font-mono text-red-500/50 uppercase tracking-widest block font-bold">Danger Zone</span>
                        <button
                           onClick={() => setShowDeleteConfirm(true)}
                           className="w-full h-10 bg-red-950/20 border border-red-900/50 text-red-500 hover:bg-red-900 hover:text-artisan-light hover:border-red-900 transition-all flex items-center justify-center gap-2 font-mono text-[9px] font-bold uppercase tracking-widest"
                        >
                           <Trash2 className="w-3.5 h-3.5" />
                           <span>Delete Client Profile</span>
                        </button>
                     </div>

                  </div>
               </div>

               {/* Right Column: Details Tabs */}
               <div className="lg:col-span-2 space-y-6">

                  {/* Tabs bar */}
                  <div className="flex border-b border-artisan-light/10 shrink-0 overflow-x-auto gap-2">
                     {[
                        { id: 'overview', label: 'Overview & Supplies' },
                        { id: 'analytics', label: 'Client Analytics' },
                        { id: 'edit', label: 'Edit Profile' },
                        { id: 'suspension', label: 'Suspension Settings' }
                     ].map((tab) => (
                        <button
                           key={tab.id}
                           onClick={() => setActiveTab(tab.id)}
                           className={`pb-3 px-2 border-b-2 font-mono text-[9px] font-bold uppercase tracking-widest whitespace-nowrap transition-all ${activeTab === tab.id
                              ? 'border-artisan-grey text-artisan-light'
                              : 'border-transparent text-artisan-light/50 hover:text-artisan-light/60'
                              }`}
                        >
                           {tab.label}
                        </button>
                     ))}
                  </div>

                  {/* Tab Body */}
                  <div className="min-h-0 text-xs sm:text-sm">
                     {activeTab === 'overview' && (
                        <div className="space-y-8">

                           {/* Quick Stats Grid */}
                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="p-4 border border-artisan-light/5 bg-artisan-light/[0.01] flex items-center gap-3">
                                 <div className="p-2.5 bg-artisan-light/5 border border-artisan-light/10 text-artisan-grey shrink-0">
                                    <Heart className="w-4 h-4" />
                                 </div>
                                 <div>
                                    <span className="text-[8px] font-mono text-artisan-light/40 uppercase tracking-widest block">Saved Supplies</span>
                                    <span className="text-sm font-mono text-artisan-light uppercase">{user.wishlist?.length || 0} Supplies Saved</span>
                                 </div>
                              </div>
                              <div className="p-4 border border-artisan-light/5 bg-artisan-light/[0.01] flex items-center gap-3">
                                 <div className="p-2.5 bg-artisan-light/5 border border-artisan-light/10 text-artisan-grey shrink-0">
                                    <ShoppingCart className="w-4 h-4" />
                                 </div>
                                 <div>
                                    <span className="text-[8px] font-mono text-artisan-light/40 uppercase tracking-widest block">Procurement Cart</span>
                                    <span className="text-sm font-mono text-artisan-light uppercase">
                                       {user.cart?.length || 0} Products (Qty: {user.cart?.reduce((acc, curr) => acc + curr.quantity, 0) || 0})
                                    </span>
                                 </div>
                              </div>
                           </div>

                           {/* Procurement Cart Details Table */}
                           <div className="space-y-3">
                              <span className="text-[9px] font-mono text-artisan-light/40 uppercase tracking-widest flex items-center gap-1.5 font-bold">
                                 <ShoppingCart className="w-3.5 h-3.5 text-artisan-grey" />
                                 Active Procurement Cart Items
                              </span>
                              <div className="border border-artisan-light/10 bg-artisan-dark/50 overflow-hidden">
                                 <table className="w-full border-collapse text-left">
                                    <thead>
                                       <tr className="border-b border-artisan-light/10 bg-artisan-light/[0.02]">
                                          <th className="px-4 py-3 text-[9px] font-mono font-bold text-artisan-light/40 uppercase tracking-wider">Supply Item</th>
                                          <th className="px-4 py-3 text-[9px] font-mono font-bold text-artisan-light/40 uppercase tracking-wider">SKU</th>
                                          <th className="px-4 py-3 text-center text-[9px] font-mono font-bold text-artisan-light/40 uppercase tracking-wider">Qty</th>
                                          <th className="px-4 py-3 text-right text-[9px] font-mono font-bold text-artisan-light/40 uppercase tracking-wider">Unit Price</th>
                                          <th className="px-4 py-3 text-right text-[9px] font-mono font-bold text-artisan-light/40 uppercase tracking-wider">Total</th>
                                       </tr>
                                    </thead>
                                    <tbody className="divide-y divide-artisan-light/5">
                                       {!user.cart || user.cart.length === 0 ? (
                                          <tr>
                                             <td colSpan="5" className="px-4 py-8 text-center text-[10px] font-mono text-artisan-light/20 uppercase tracking-wider">
                                                No items in procurement cart.
                                             </td>
                                          </tr>
                                       ) : (
                                          user.cart.map((item) => {
                                             const prod = item.product;
                                             if (!prod) return null;
                                             return (
                                                <tr key={item._id} className="font-mono text-[10px] hover:bg-artisan-light/[0.01]">
                                                   <td className="px-4 py-4 font-display font-black text-artisan-light uppercase text-xs">
                                                      <Link to={`/product/${prod._id}`} className="hover:text-artisan-grey transition-colors">
                                                         {prod.name}
                                                      </Link>
                                                   </td>
                                                   <td className="px-4 py-4 text-artisan-light/50">{prod.sku}</td>
                                                   <td className="px-4 py-4 text-center text-artisan-light">{item.quantity}</td>
                                                   <td className="px-4 py-4 text-right">₹{prod.price?.toLocaleString()}</td>
                                                   <td className="px-4 py-4 text-right font-bold text-artisan-light">
                                                      ₹{(prod.price * item.quantity)?.toLocaleString()}
                                                   </td>
                                                </tr>
                                             );
                                          })
                                       )}
                                    </tbody>
                                 </table>
                              </div>
                           </div>

                           {/* Saved Surgical Supplies (Wishlist) details */}
                           <div className="space-y-3">
                              <span className="text-[9px] font-mono text-artisan-light/40 uppercase tracking-widest flex items-center gap-1.5 font-bold">
                                 <Heart className="w-3.5 h-3.5 text-artisan-grey" />
                                 Saved Surgical Supplies
                              </span>
                              <div className="border border-artisan-light/10 bg-artisan-dark/50 overflow-hidden">
                                 <table className="w-full border-collapse text-left">
                                    <thead>
                                       <tr className="border-b border-artisan-light/10 bg-artisan-light/[0.02]">
                                          <th className="px-4 py-3 text-[9px] font-mono font-bold text-artisan-light/40 uppercase tracking-wider">Supply Item</th>
                                          <th className="px-4 py-3 text-[9px] font-mono font-bold text-artisan-light/40 uppercase tracking-wider">SKU</th>
                                          <th className="px-4 py-3 text-[9px] font-mono font-bold text-artisan-light/40 uppercase tracking-wider">Category</th>
                                          <th className="px-4 py-3 text-right text-[9px] font-mono font-bold text-artisan-light/40 uppercase tracking-wider">Unit Price</th>
                                       </tr>
                                    </thead>
                                    <tbody className="divide-y divide-artisan-light/5">
                                       {!user.wishlist || user.wishlist.length === 0 ? (
                                          <tr>
                                             <td colSpan="4" className="px-4 py-8 text-center text-[10px] font-mono text-artisan-light/20 uppercase tracking-wider">
                                                No saved surgical supplies.
                                             </td>
                                          </tr>
                                       ) : (
                                          user.wishlist.map((prod) => {
                                             if (!prod) return null;
                                             return (
                                                <tr key={prod._id} className="font-mono text-[10px] hover:bg-artisan-light/[0.01]">
                                                   <td className="px-4 py-4 font-display font-black text-artisan-light uppercase text-xs">
                                                      <Link to={`/product/${prod._id}`} className="hover:text-artisan-grey transition-colors">
                                                         {prod.name}
                                                      </Link>
                                                   </td>
                                                   <td className="px-4 py-4 text-artisan-light/50">{prod.sku}</td>
                                                   <td className="px-4 py-4 text-artisan-light/60 uppercase">{prod.category}</td>
                                                   <td className="px-4 py-4 text-right font-bold text-artisan-light">₹{prod.price?.toLocaleString()}</td>
                                                </tr>
                                             );
                                          })
                                       )}
                                    </tbody>
                                 </table>
                              </div>
                           </div>

                           {/* Registered Shipping Addresses */}
                           <div className="space-y-3">
                              <span className="text-[9px] font-mono text-artisan-light/40 uppercase tracking-widest flex items-center gap-1.5 font-bold">
                                 <MapPin className="w-3.5 h-3.5 text-artisan-grey" />
                                 Registered Shipping Addresses
                              </span>
                              <div className="space-y-3">
                                 {!user.addresses || user.addresses.length === 0 ? (
                                    <p className="text-[10px] font-mono text-artisan-light/20 uppercase tracking-wider py-2">
                                       No delivery addresses registered under this user profile.
                                    </p>
                                 ) : (
                                    user.addresses.map((addr) => (
                                       <div key={addr._id} className="p-4 border border-artisan-light/10 bg-artisan-light/[0.01] space-y-2">
                                          <div className="flex justify-between items-center border-b border-artisan-light/5 pb-2">
                                             <span className="text-[9px] font-mono font-bold text-artisan-light uppercase tracking-wider px-2 py-0.5 bg-artisan-light/5 border border-artisan-light/10">
                                                {addr.tag}
                                             </span>
                                          </div>
                                          <p className="text-xs font-mono text-artisan-light/75 leading-relaxed uppercase">
                                             {addr.doorNumber}, {addr.secondLine && `${addr.secondLine}, `}
                                             {addr.landmark && `Landmark: ${addr.landmark}, `}
                                             {addr.city}, {addr.state} - {addr.pincode}
                                          </p>
                                       </div>
                                    ))
                                 )}
                              </div>
                           </div>

                           {/* Purchase & Order History */}
                           <div className="space-y-3">
                              <span className="text-[9px] font-mono text-artisan-light/40 uppercase tracking-widest flex items-center gap-1.5 font-bold">
                                 <Package className="w-3.5 h-3.5 text-artisan-grey" />
                                 Client Purchase & Order History
                              </span>
                              <div className="border border-artisan-light/10 bg-artisan-dark/50 overflow-hidden">
                                 <table className="w-full border-collapse text-left">
                                    <thead>
                                       <tr className="border-b border-artisan-light/10 bg-artisan-light/[0.02]">
                                          <th className="px-4 py-3 text-[9px] font-mono font-bold text-artisan-light/40 uppercase tracking-wider">Order ID</th>
                                          <th className="px-4 py-3 text-[9px] font-mono font-bold text-artisan-light/40 uppercase tracking-wider">Date</th>
                                          <th className="px-4 py-3 text-[9px] font-mono font-bold text-artisan-light/40 uppercase tracking-wider">Items</th>
                                          <th className="px-4 py-3 text-center text-[9px] font-mono font-bold text-artisan-light/40 uppercase tracking-wider">Status</th>
                                          <th className="px-4 py-3 text-right text-[9px] font-mono font-bold text-artisan-light/40 uppercase tracking-wider">Total</th>
                                       </tr>
                                    </thead>
                                    <tbody className="divide-y divide-artisan-light/5">
                                       {!user.orders || user.orders.length === 0 ? (
                                          <tr>
                                             <td colSpan="5" className="px-4 py-8 text-center text-[10px] font-mono text-artisan-light/20 uppercase tracking-wider">
                                                No purchase records in registry.
                                             </td>
                                          </tr>
                                       ) : (
                                          user.orders.map((ord) => {
                                             const orderIdFormatted = ord._id.substring(ord._id.length - 8).toUpperCase();
                                             
                                             const statusColors = {
                                                completed: 'border-green-500 text-green-500 bg-green-500/5',
                                                processing: 'border-blue-500 text-blue-500 bg-blue-500/5',
                                                pending: 'border-yellow-500/50 text-yellow-400 bg-yellow-500/5',
                                                cancelled: 'border-red-500 text-red-500 bg-red-500/5',
                                                refunded: 'border-purple-500 text-purple-400 bg-purple-500/5'
                                             };

                                             return (
                                                <tr key={ord._id} className="font-mono text-[10px] hover:bg-artisan-light/[0.01]">
                                                   <td className="px-4 py-4 font-bold text-artisan-light">
                                                      <Link to={`/orders/${ord._id}`} className="hover:text-artisan-grey transition-colors flex items-center gap-1">
                                                         #{orderIdFormatted}
                                                         <span className="text-[8px] text-artisan-light/50">↗</span>
                                                      </Link>
                                                   </td>
                                                   <td className="px-4 py-4 text-artisan-light/50">
                                                      {new Date(ord.createdAt).toLocaleDateString()}
                                                   </td>
                                                   <td className="px-4 py-4 text-artisan-light/60">
                                                      {ord.items?.map(i => `${i.product?.name || 'Item'} (×${i.quantity})`).join(', ') || 'No Items'}
                                                   </td>
                                                   <td className="px-4 py-4 text-center">
                                                      <span className={`text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 border ${statusColors[ord.orderStatus] || 'border-artisan-light/10'}`}>
                                                         {ord.orderStatus}
                                                      </span>
                                                   </td>
                                                   <td className="px-4 py-4 text-right font-bold text-artisan-light">
                                                      ₹{ord.totalAmount?.toLocaleString()}
                                                   </td>
                                                </tr>
                                             );
                                          })
                                       )}
                                    </tbody>
                                 </table>
                              </div>
                           </div>

                        </div>
                     )}

                     {activeTab === 'analytics' && (
                        <div className="space-y-8">

                           {/* Quick Stats Grid */}
                           <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              <div className="p-4 border border-artisan-light/5 bg-artisan-light/[0.01] flex items-center gap-3">
                                 <div className="p-2.5 bg-artisan-light/5 border border-artisan-light/10 text-artisan-grey shrink-0">
                                    <Activity className="w-4 h-4" />
                                 </div>
                                 <div>
                                    <span className="text-[8px] font-mono text-artisan-light/40 uppercase tracking-widest block font-bold">Total Sessions</span>
                                    <span className="text-sm font-mono text-artisan-light uppercase">
                                       {user.analytics?.summary?.totalSessions || 0} Sessions
                                    </span>
                                 </div>
                              </div>
                              <div className="p-4 border border-artisan-light/5 bg-artisan-light/[0.01] flex items-center gap-3">
                                 <div className="p-2.5 bg-artisan-light/5 border border-artisan-light/10 text-artisan-grey shrink-0">
                                    <Clock className="w-4 h-4" />
                                 </div>
                                 <div>
                                    <span className="text-[8px] font-mono text-artisan-light/40 uppercase tracking-widest block font-bold">Avg Session Length</span>
                                    <span className="text-sm font-mono text-artisan-light uppercase">
                                       {(() => {
                                          const secs = user.analytics?.summary?.averageDurationSeconds || 0;
                                          const m = Math.floor(secs / 60);
                                          const s = secs % 60;
                                          return m > 0 ? `${m}m ${s}s` : `${s}s`;
                                       })()}
                                    </span>
                                 </div>
                              </div>
                              <div className="p-4 border border-artisan-light/5 bg-artisan-light/[0.01] flex items-center gap-3">
                                 <div className="p-2.5 bg-artisan-light/5 border border-artisan-light/10 text-artisan-grey shrink-0">
                                    <Package className="w-4 h-4" />
                                 </div>
                                 <div>
                                    <span className="text-[8px] font-mono text-artisan-light/40 uppercase tracking-widest block font-bold">Conversions</span>
                                    <span className="text-sm font-mono text-artisan-light uppercase">
                                       {user.analytics?.summary?.conversionsCount || 0} Purchases
                                    </span>
                                 </div>
                              </div>
                           </div>

                           {/* User Funnel checklist */}
                           <div className="space-y-3">
                              <span className="text-[9px] font-mono text-artisan-light/40 uppercase tracking-widest flex items-center gap-1.5 font-bold">
                                 <TrendingUp className="w-3.5 h-3.5 text-artisan-grey" />
                                 Client Funnel Checklist
                              </span>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                 {[
                                    { label: 'Page Views', count: user.analytics?.events?.pageViews || 0 },
                                    { label: 'Cart Additions', count: user.analytics?.events?.addToCarts || 0 },
                                    { label: 'Checkouts Initiated', count: user.analytics?.events?.initiateCheckouts || 0 },
                                    { label: 'Purchases Completed', count: user.analytics?.events?.purchases || 0 }
                                 ].map((stage, idx) => {
                                    const completed = stage.count > 0;
                                    return (
                                       <div
                                          key={idx}
                                          className={`p-4 border ${completed ? 'border-green-500/20 bg-green-500/[0.01]' : 'border-artisan-light/10 bg-artisan-light/[0.01]'} flex flex-col justify-between h-24`}
                                       >
                                          <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-artisan-light/60">
                                             {stage.label}
                                          </span>
                                          <div className="flex justify-between items-end">
                                             <span className={`text-xl font-display font-black ${completed ? 'text-green-500' : 'text-artisan-light/35'}`}>
                                                {stage.count}
                                             </span>
                                             {completed ? (
                                                <CheckCircle className="w-4 h-4 text-green-500" />
                                             ) : (
                                                <XCircle className="w-4 h-4 text-artisan-light/20" />
                                             )}
                                          </div>
                                       </div>
                                    );
                                 })}
                              </div>
                           </div>

                           {/* Popular Directories Visited */}
                           <div className="space-y-3">
                              <span className="text-[9px] font-mono text-artisan-light/40 uppercase tracking-widest flex items-center gap-1.5 font-bold">
                                 <Info className="w-3.5 h-3.5 text-artisan-grey" />
                                 Directory Engagement (Top 5 Paths)
                              </span>
                              <div className="border border-artisan-light/10 bg-artisan-dark/50 overflow-hidden">
                                 <table className="w-full border-collapse text-left">
                                    <thead>
                                       <tr className="border-b border-artisan-light/10 bg-artisan-light/[0.02]">
                                          <th className="px-4 py-3 text-[9px] font-mono font-bold text-artisan-light/40 uppercase tracking-wider">Page Path</th>
                                          <th className="px-4 py-3 text-center text-[9px] font-mono font-bold text-artisan-light/40 uppercase tracking-wider">Visits</th>
                                          <th className="px-4 py-3 text-right text-[9px] font-mono font-bold text-artisan-light/40 uppercase tracking-wider">Total Duration</th>
                                       </tr>
                                    </thead>
                                    <tbody className="divide-y divide-artisan-light/5">
                                       {!user.analytics?.popularPages || user.analytics.popularPages.length === 0 ? (
                                          <tr>
                                             <td colSpan="3" className="px-4 py-8 text-center text-[10px] font-mono text-artisan-light/20 uppercase tracking-wider">
                                                No directory engagement logs.
                                             </td>
                                          </tr>
                                       ) : (
                                          user.analytics.popularPages.map((page, idx) => (
                                             <tr key={idx} className="font-mono text-[10px] hover:bg-artisan-light/[0.01]">
                                                <td className="px-4 py-4 font-bold text-artisan-grey">{page._id}</td>
                                                <td className="px-4 py-4 text-center text-artisan-light">{page.visitsCount}</td>
                                                <td className="px-4 py-4 text-right text-artisan-light">
                                                   {(() => {
                                                      const secs = page.totalDuration || 0;
                                                      const m = Math.floor(secs / 60);
                                                      const s = secs % 60;
                                                      return m > 0 ? `${m}m ${s}s` : `${s}s`;
                                                   })()}
                                                </td>
                                             </tr>
                                          ))
                                       )}
                                    </tbody>
                                 </table>
                              </div>
                           </div>

                           {/* Recent Sessions List */}
                           <div className="space-y-3">
                              <span className="text-[9px] font-mono text-artisan-light/40 uppercase tracking-widest flex items-center gap-1.5 font-bold">
                                 <Calendar className="w-3.5 h-3.5 text-artisan-grey" />
                                 Recent Sessions Log
                              </span>
                              <div className="border border-artisan-light/10 bg-artisan-dark/50 overflow-hidden">
                                 <table className="w-full border-collapse text-left">
                                    <thead>
                                       <tr className="border-b border-artisan-light/10 bg-artisan-light/[0.02]">
                                          <th className="px-4 py-3 text-[9px] font-mono font-bold text-artisan-light/40 uppercase tracking-wider">Started At</th>
                                          <th className="px-4 py-3 text-center text-[9px] font-mono font-bold text-artisan-light/40 uppercase tracking-wider">Duration</th>
                                          <th className="px-4 py-3 text-center text-[9px] font-mono font-bold text-artisan-light/40 uppercase tracking-wider">Device</th>
                                          <th className="px-4 py-3 text-center text-[9px] font-mono font-bold text-artisan-light/40 uppercase tracking-wider">Referrer</th>
                                          <th className="px-4 py-3 text-right text-[9px] font-mono font-bold text-artisan-light/40 uppercase tracking-wider">Conversion</th>
                                       </tr>
                                    </thead>
                                    <tbody className="divide-y divide-artisan-light/5">
                                       {!user.analytics?.recentSessions || user.analytics.recentSessions.length === 0 ? (
                                          <tr>
                                             <td colSpan="5" className="px-4 py-8 text-center text-[10px] font-mono text-artisan-light/20 uppercase tracking-wider">
                                                No session logs recorded.
                                             </td>
                                          </tr>
                                       ) : (
                                          user.analytics.recentSessions.map((sess, idx) => (
                                             <tr key={idx} className="font-mono text-[10px] hover:bg-artisan-light/[0.01]">
                                                <td className="px-4 py-4 text-artisan-light">
                                                   {new Date(sess.createdAt).toLocaleString()}
                                                </td>
                                                <td className="px-4 py-4 text-center text-artisan-light">
                                                   {(() => {
                                                      const secs = sess.durationSeconds || 0;
                                                      const m = Math.floor(secs / 60);
                                                      const s = secs % 60;
                                                      return m > 0 ? `${m}m ${s}s` : `${s}s`;
                                                   })()}
                                                </td>
                                                <td className="px-4 py-4 text-center text-artisan-light/50 uppercase">{sess.deviceType || 'Desktop'}</td>
                                                <td className="px-4 py-4 text-center text-artisan-light/50 uppercase">{sess.referrer || 'direct'}</td>
                                                <td className="px-4 py-4 text-right">
                                                   <span className={`px-2 py-0.5 border text-[8px] font-bold uppercase tracking-wider ${sess.conversionRecorded
                                                         ? 'border-green-500/20 text-green-500 bg-green-500/5'
                                                         : 'border-artisan-light/10 text-artisan-light/35'
                                                      }`}>
                                                      {sess.conversionRecorded ? 'Purchased' : 'Browse Only'}
                                                   </span>
                                                </td>
                                             </tr>
                                          ))
                                       )}
                                    </tbody>
                                 </table>
                              </div>
                           </div>

                        </div>
                     )}

                     {activeTab === 'edit' && (
                        <form onSubmit={handleUpdateUser} className="space-y-6">
                           <div className="space-y-4">
                              <div className="space-y-2">
                                 <label className="text-[8px] font-mono text-artisan-light/40 uppercase tracking-widest block font-bold">Display Name</label>
                                 <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="w-full bg-artisan-light/[0.01] border border-artisan-light/10 p-4 text-xs sm:text-sm font-mono text-artisan-light uppercase tracking-widest outline-none focus:border-artisan-grey transition-all"
                                    required
                                 />
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[8px] font-mono text-artisan-light/40 uppercase tracking-widest block font-bold">Email Address</label>
                                 <input
                                    type="email"
                                    value={editEmail}
                                    onChange={(e) => setEditEmail(e.target.value)}
                                    className="w-full bg-artisan-light/[0.01] border border-artisan-light/10 p-4 text-xs sm:text-sm font-mono text-artisan-light uppercase tracking-widest outline-none focus:border-artisan-grey transition-all"
                                    required
                                 />
                              </div>
                           </div>

                           <button
                              type="submit"
                              disabled={actionLoading}
                              className="w-full py-4 bg-artisan-light text-artisan-dark font-display font-black uppercase tracking-widest hover:bg-artisan-grey hover:text-artisan-dark transition-all flex items-center justify-center gap-3 disabled:opacity-50 text-xs"
                           >
                              {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Profile Changes'}
                           </button>
                        </form>
                     )}

                     {activeTab === 'suspension' && (
                        <div className="space-y-6">

                           {/* Status Alert Banner */}
                           {user.isBanned ? (
                              <div className="p-4 border border-red-500/20 bg-red-500/5 text-red-500 space-y-2">
                                 <div className="flex items-center gap-2">
                                    <Ban className="w-4 h-4" />
                                    <span className="font-mono text-[10px] font-black uppercase tracking-widest">Account Access Suspended</span>
                                 </div>
                                 <p className="text-[10px] font-mono uppercase tracking-wider leading-relaxed text-red-500/80">
                                    This client is currently blocked from establishing sessions or submitting purchase requests.
                                 </p>
                                 {user.banUntil && (
                                    <p className="text-[9px] font-mono uppercase">
                                       Expires: {new Date(user.banUntil).toLocaleString()}
                                    </p>
                                 )}
                                 {user.banReason && (
                                    <p className="text-[9px] font-mono uppercase">
                                       Reason: {user.banReason}
                                    </p>
                                 )}
                              </div>
                           ) : (
                              <div className="p-4 border border-green-500/20 bg-green-500/5 text-green-500 flex items-center gap-2">
                                 <Unlock className="w-4 h-4" />
                                 <span className="font-mono text-[10px] font-black uppercase tracking-widest">Account Access Authorized</span>
                              </div>
                           )}

                           {user.isBanned ? (
                              <div className="space-y-4">
                                 <p className="text-[10px] sm:text-xs font-mono text-artisan-light/45 uppercase leading-relaxed tracking-wider">
                                    Are you sure you want to restore access for this user? All active suspensions will be removed.
                                 </p>
                                 <button
                                    onClick={handleBanUser}
                                    disabled={actionLoading}
                                    className="w-full py-4 bg-green-600 text-artisan-light font-display font-black uppercase tracking-widest hover:bg-green-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50 text-xs"
                                 >
                                    {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Restore Access'}
                                 </button>
                              </div>
                           ) : (
                              <div className="space-y-6">
                                 <div className="space-y-4">
                                    <div className="space-y-2">
                                       <label className="text-[8px] font-mono text-artisan-light/40 uppercase tracking-widest block font-bold">Suspension Duration</label>
                                       <div className="relative">
                                          <select
                                             value={banDuration}
                                             onChange={(e) => setBanDuration(e.target.value)}
                                             className="w-full bg-artisan-light/[0.01] border border-artisan-light/10 p-4 text-xs sm:text-sm font-mono text-artisan-light uppercase tracking-widest outline-none focus:border-red-500 transition-all appearance-none"
                                          >
                                             <option value="1" className="bg-artisan-dark text-artisan-light">24 Hours</option>
                                             <option value="7" className="bg-artisan-dark text-artisan-light">7 Days</option>
                                             <option value="30" className="bg-artisan-dark text-artisan-light">30 Days</option>
                                             <option value="365" className="bg-artisan-dark text-artisan-light">1 Year</option>
                                             <option value="99999" className="bg-artisan-dark text-artisan-light">Permanent</option>
                                          </select>
                                          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-artisan-light/50 text-[9px] font-mono">▼</div>
                                       </div>
                                    </div>

                                    <div className="space-y-2">
                                       <label className="text-[8px] font-mono text-artisan-light/40 uppercase tracking-widest block font-bold">Reason for Suspension</label>
                                       <textarea
                                          value={banReason}
                                          onChange={(e) => setBanReason(e.target.value)}
                                          placeholder="Violation of procurement guidelines..."
                                          className="w-full h-24 bg-artisan-light/[0.01] border border-artisan-light/10 p-4 text-xs sm:text-sm font-mono text-artisan-light uppercase tracking-widest outline-none focus:border-red-500 transition-all resize-none"
                                       />
                                    </div>
                                 </div>

                                 <button
                                    onClick={handleBanUser}
                                    disabled={actionLoading}
                                    className="w-full py-4 bg-red-600 text-artisan-light font-display font-black uppercase tracking-widest hover:bg-red-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50 text-xs"
                                 >
                                    {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Suspend User'}
                                 </button>
                              </div>
                           )}
                        </div>
                     )}
                  </div>

               </div>

            </div>
         </div>

         {/* Delete Confirmation Modal */}
         <AnimatePresence>
            {showDeleteConfirm && (
               <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
                  <motion.div
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     exit={{ opacity: 0 }}
                     onClick={() => setShowDeleteConfirm(false)}
                     className="absolute inset-0 bg-artisan-dark/95 backdrop-blur-md"
                  />
                  <motion.div
                     initial={{ scale: 0.95, opacity: 0 }}
                     animate={{ scale: 1, opacity: 1 }}
                     exit={{ scale: 0.95, opacity: 0 }}
                     className="relative w-full max-w-md bg-artisan-dark border border-red-500/20 p-6 sm:p-8 shadow-2xl space-y-6 z-10"
                  >
                     <div className="flex items-center gap-3 text-red-500">
                        <AlertTriangle className="w-6 h-6 shrink-0" />
                        <h3 className="text-lg font-display font-black uppercase tracking-tight">Confirm Registry Deletion</h3>
                     </div>
                     <p className="text-xs font-mono text-artisan-light/60 uppercase leading-relaxed tracking-wider">
                        Are you sure you want to permanently delete this client profile from the system registry? This action is irreversible and deletes all associated shipping history, wishlists, and carts.
                     </p>

                     <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <button
                           onClick={() => setShowDeleteConfirm(false)}
                           className="flex-1 h-12 border border-artisan-light/10 text-artisan-light hover:bg-artisan-light/5 transition-all font-mono text-[9px] font-bold uppercase tracking-widest"
                        >
                           Cancel
                        </button>
                        <button
                           onClick={handleDeleteUser}
                           disabled={actionLoading}
                           className="flex-1 h-12 bg-red-600 text-artisan-light hover:bg-red-700 transition-all flex items-center justify-center gap-2 font-mono text-[9px] font-bold uppercase tracking-widest disabled:opacity-50"
                        >
                           {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Confirm Delete'}
                        </button>
                     </div>
                  </motion.div>
               </div>
            )}
         </AnimatePresence>

      </div>
   )
}
