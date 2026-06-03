import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Users, 
  Search, 
  Filter, 
  MoreVertical, 
  ShieldAlert, 
  ShieldCheck, 
  Mail, 
  Calendar,
  X,
  User as UserIcon,
  Hammer,
  Settings,
  Ban,
  Unlock,
  Loader2,
  RefreshCcw,
  ArrowRight
} from 'lucide-react'
import { useToast } from '../context/ToastContext'
import api from '../services/api'

export default function AdminUsers() {
  const { addToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [selectedUser, setSelectedUser] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showBanModal, setShowBanModal] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  
  // Ban form state
  const [banDuration, setBanDuration] = useState('7') // days
  const [banReason, setBanReason] = useState('')

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const res = await api.get('/admin/users')
      // Only show users and owners, filter out admins
      const nonAdminUsers = res.data.data.filter(u => u.role !== 'admin')
      setUsers(nonAdminUsers)
    } catch (err) {
      addToast('Failed to fetch guild members', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(search.toLowerCase()) || 
                         user.email.toLowerCase().includes(search.toLowerCase())
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  const handleUpdateUser = async (e) => {
    e.preventDefault()
    try {
      setActionLoading(true)
      const res = await api.put(`/admin/users/${selectedUser._id}`, {
        role: selectedUser.role,
        name: selectedUser.name,
        email: selectedUser.email
      })
      addToast('Member records updated', 'success')
      setUsers(prev => prev.map(u => u._id === selectedUser._id ? res.data.data : u))
      setShowEditModal(false)
    } catch (err) {
      addToast('Update failed', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const handleBanUser = async () => {
    try {
      setActionLoading(true)
      const isUnbanning = selectedUser.isBanned
      const banUntil = isUnbanning ? null : new Date(Date.now() + parseInt(banDuration) * 24 * 60 * 60 * 1000)
      
      const res = await api.put(`/admin/users/${selectedUser._id}/ban`, {
        isBanned: !isUnbanning,
        banUntil: banUntil,
        banReason: isUnbanning ? '' : banReason
      })

      addToast(isUnbanning ? 'Member access restored' : 'Member access suspended', 'success')
      setUsers(prev => prev.map(u => u._id === selectedUser._id ? res.data.data : u))
      setShowBanModal(false)
      setBanReason('')
    } catch (err) {
      addToast('Disciplinary action failed', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-artisan-dark bg-noise pt-32 pb-24">
      <div className="container-custom">
        
        {/* HEADER SECTION */}
        <div className="mb-16">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-1 bg-artisan-grey" />
                 <span className="text-[10px] font-mono font-bold text-artisan-grey uppercase tracking-[0.5em]">Central Registry</span>
              </div>
              <h1 className="text-6xl md:text-8xl font-display font-black uppercase tracking-tighter leading-[0.8] text-artisan-light">
                 GUILD <br />
                 <span className="text-outline">RESOURCES.</span>
              </h1>
            </div>

            {/* SEARCH & FILTER HUD */}
            <div className="lg:w-1/2 flex flex-col gap-6">
               <div className="relative group">
                  {/* SEARCH TERMINAL DECORATION */}
                  <div className="absolute -top-3 -left-3 w-6 h-6 border-t-2 border-l-2 border-artisan-grey/20 group-focus-within:border-artisan-grey group-focus-within:w-8 group-focus-within:h-8 transition-all duration-500" />
                  <div className="absolute -bottom-3 -right-3 w-6 h-6 border-b-2 border-r-2 border-artisan-grey/20 group-focus-within:border-artisan-grey group-focus-within:w-8 group-focus-within:h-8 transition-all duration-500" />
                  
                  <div className="relative overflow-hidden bg-artisan-light/[0.01] border border-artisan-light/10 group-focus-within:border-artisan-grey/30 group-focus-within:bg-artisan-light/[0.03] transition-all duration-500">
                     {/* KINETIC SCANNING LINE */}
                     <motion.div 
                        animate={{ y: ['0%', '1000%'] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-artisan-grey/20 to-transparent pointer-events-none opacity-0 group-focus-within:opacity-100"
                     />

                     <div className="flex items-center">
                        <div className="w-24 h-20 border-r border-artisan-light/10 flex flex-col items-center justify-center bg-artisan-light/[0.02]">
                           <span className="text-[10px] font-mono text-artisan-grey font-black mb-1">CMD</span>
                           <Search className="w-5 h-5 text-artisan-light/20 group-focus-within:text-artisan-grey transition-colors animate-pulse" />
                        </div>

                        <div className="flex-1 relative">
                           <input 
                              type="text"
                              value={search}
                              onChange={(e) => setSearch(e.target.value)}
                              className="w-full bg-transparent py-8 px-8 text-sm font-mono text-artisan-light uppercase tracking-[0.3em] outline-none placeholder:text-artisan-light/5"
                              placeholder="ENLIST SEARCH QUERY..."
                           />
                           
                           {/* LIVE METADATA */}
                           <div className="absolute top-1/2 -translate-y-1/2 right-8 hidden md:flex items-center gap-6">
                              <div className="flex flex-col items-end">
                                 <span className="text-[7px] font-mono text-artisan-light/20 uppercase tracking-widest">Query Depth</span>
                                 <span className="text-[9px] font-mono text-artisan-grey font-bold">GLOBAL_ROOT</span>
                              </div>
                              <div className="w-px h-6 bg-artisan-light/10" />
                              <div className="flex flex-col items-end">
                                 <span className="text-[7px] font-mono text-artisan-light/20 uppercase tracking-widest">Results</span>
                                 <span className="text-[9px] font-mono text-artisan-light font-bold">
                                    {filteredUsers.length.toString().padStart(3, '0')}
                                 </span>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* SUB-HUD DECORATION */}
                  <div className="mt-2 flex justify-between items-center px-2 opacity-0 group-focus-within:opacity-100 transition-opacity duration-700">
                     <span className="text-[7px] font-mono text-artisan-grey/40 uppercase tracking-[0.4em]">Secure Transmission Port: 8080 // Registry Sync Active</span>
                     <div className="flex gap-1">
                        {[1, 2, 3, 4].map(i => (
                           <div key={i} className="w-3 h-1 bg-artisan-grey/20" />
                        ))}
                     </div>
                  </div>
               </div>

               <div className="flex gap-4">
                  <div className="flex-1 flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                     {['all', 'user', 'owner'].map((role) => (
                        <button
                           key={role}
                           onClick={() => setRoleFilter(role)}
                           className={`px-8 py-3 border-l-4 text-[10px] font-mono font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                              roleFilter === role 
                              ? 'border-artisan-grey bg-artisan-light/5 text-artisan-light' 
                              : 'border-transparent bg-artisan-light/[0.02] text-artisan-light/20 hover:text-artisan-light/40'
                           }`}
                        >
                           {role === 'all' ? 'Universal Registry' : role === 'user' ? 'Renters' : 'Artisans'}
                        </button>
                     ))}
                  </div>
                  <button 
                     onClick={fetchUsers}
                     className="w-14 h-12 bg-artisan-light/5 border border-artisan-light/10 flex items-center justify-center hover:bg-artisan-light/10 transition-all group shrink-0"
                  >
                     <RefreshCcw className={`w-4 h-4 text-artisan-grey group-hover:rotate-180 transition-transform duration-700 ${loading ? 'animate-spin' : ''}`} />
                  </button>
               </div>
            </div>
          </div>
        </div>

        {/* MEMBER DIRECTORY */}
        <div className="border border-artisan-light/10 bg-artisan-dark/50 shadow-2xl overflow-hidden">
           <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                 <thead>
                    <tr className="border-b border-artisan-light/10 bg-artisan-light/[0.03]">
                       <th className="px-8 py-8 text-left text-[10px] font-mono font-bold text-artisan-light/30 uppercase tracking-[0.3em]">ID & Identifier</th>
                       <th className="px-8 py-8 text-left text-[10px] font-mono font-bold text-artisan-light/30 uppercase tracking-[0.3em]">Enlisted Profile</th>
                       <th className="px-8 py-8 text-left text-[10px] font-mono font-bold text-artisan-light/30 uppercase tracking-[0.3em]">Guild Role</th>
                       <th className="px-8 py-8 text-left text-[10px] font-mono font-bold text-artisan-light/30 uppercase tracking-[0.3em]">Account Status</th>
                       <th className="px-8 py-8 text-right text-[10px] font-mono font-bold text-artisan-light/30 uppercase tracking-[0.3em]">Command Actions</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-artisan-light/5">
                    {loading ? (
                       Array(5).fill(0).map((_, i) => (
                          <tr key={i} className="animate-pulse">
                             <td colSpan="5" className="px-8 py-10 bg-artisan-light/[0.01]" />
                          </tr>
                       ))
                    ) : filteredUsers.length === 0 ? (
                       <tr>
                          <td colSpan="5" className="px-8 py-32 text-center">
                             <Users className="w-16 h-16 text-artisan-light/5 mx-auto mb-6" />
                             <p className="text-[11px] font-mono text-artisan-light/20 uppercase tracking-[0.5em]">Guild Registry is Empty or Filtered</p>
                          </td>
                       </tr>
                    ) : (
                       filteredUsers.map((user) => (
                          <tr key={user._id} className={`group hover:bg-artisan-light/[0.03] transition-all duration-300 ${user.isBanned ? 'bg-red-500/[0.02]' : ''}`}>
                             <td className="px-8 py-10 align-top">
                                <div className="space-y-1">
                                   <span className="text-[10px] font-mono text-artisan-grey font-bold tracking-tighter">#{user._id.slice(-8).toUpperCase()}</span>
                                   <p className="text-[8px] font-mono text-artisan-light/20 uppercase tracking-widest">Hash: {user._id.slice(0, 8)}...</p>
                                </div>
                             </td>
                             <td className="px-8 py-10">
                                <div className="flex items-center gap-6">
                                   <div className="w-16 h-16 bg-artisan-light/5 border border-artisan-light/10 overflow-hidden shrink-0 flex items-center justify-center grayscale group-hover:grayscale-0 transition-all duration-700">
                                      {user.avatar && user.avatar !== 'default-avatar.png' ? (
                                         <img src={user.avatar} className="w-full h-full object-cover" />
                                      ) : (
                                         <span className="text-3xl">👤</span>
                                      )}
                                   </div>
                                   <div className="flex flex-col">
                                      <span className="text-lg font-display font-black text-artisan-light uppercase tracking-tight group-hover:text-artisan-grey transition-colors">{user.name}</span>
                                      <div className="flex items-center gap-2 mt-1">
                                         <Mail className="w-3 h-3 text-artisan-light/20" />
                                         <span className="text-[9px] font-mono text-artisan-light/40 uppercase tracking-widest">{user.email}</span>
                                      </div>
                                   </div>
                                </div>
                             </td>
                             <td className="px-8 py-10">
                                <div className="flex flex-wrap gap-2">
                                   {(user.onboardingData?.intent === 'renter' || user.onboardingData?.intent === 'both' || user.role === 'user') && (
                                      <span className="text-[8px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 border border-artisan-light/10 text-artisan-light/40">Renter</span>
                                   )}
                                   {(user.onboardingData?.intent === 'owner' || user.onboardingData?.intent === 'both' || user.role === 'owner') && (
                                      <span className="text-[8px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 border border-artisan-light/30 text-artisan-light">Artisan</span>
                                   )}
                                </div>
                             </td>
                             <td className="px-8 py-10">
                                <div className="space-y-4">
                                   <div className="flex items-center justify-between gap-4">
                                      <div className="flex items-center gap-2">
                                         <div className={`w-1.5 h-1.5 ${user.isBanned ? 'bg-red-500 animate-pulse' : user.isAadharVerified ? 'bg-green-500' : 'bg-artisan-grey/20'}`} />
                                         <span className={`text-[9px] font-mono font-bold uppercase tracking-widest ${user.isBanned ? 'text-red-500' : user.isAadharVerified ? 'text-green-500' : 'text-artisan-light/20'}`}>
                                            {user.isBanned ? 'Suspended' : user.isAadharVerified ? 'Identity Verified' : 'Vetting Required'}
                                         </span>
                                      </div>
                                      {user.isAadharVerified && (
                                         <ShieldCheck className="w-3 h-3 text-green-500/40" />
                                      )}
                                   </div>
                                   
                                   {/* Biometric Status Bar */}
                                   <div className="h-[2px] w-full bg-artisan-light/5 relative overflow-hidden">
                                      <motion.div 
                                         initial={{ x: '-100%' }}
                                         animate={{ x: user.isAadharVerified ? '0%' : '-60%' }}
                                         className={`absolute inset-0 ${user.isBanned ? 'bg-red-500/50' : 'bg-green-500/50'}`}
                                      />
                                   </div>

                                   <div className="flex justify-between items-center">
                                      <span className="text-[7px] font-mono text-artisan-light/20 uppercase tracking-[0.2em]">Biometric Trust Score</span>
                                      <span className="text-[8px] font-mono text-artisan-light/40 uppercase">{user.isAadharVerified ? '100%' : '40%'}</span>
                                   </div>
                                </div>
                             </td>
                             <td className="px-8 py-10 text-right">
                                <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                   <button 
                                      onClick={() => { setSelectedUser(user); setShowEditModal(true); }}
                                      className="p-3 bg-artisan-light/5 border border-artisan-light/10 text-artisan-light hover:bg-artisan-light hover:text-artisan-dark transition-all"
                                      title="Edit Registry"
                                   >
                                      <Settings className="w-4 h-4" />
                                   </button>
                                   <button 
                                      onClick={() => { setSelectedUser(user); setShowBanModal(true); }}
                                      className={`p-3 border border-artisan-light/10 ${user.isBanned ? 'bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-artisan-dark' : 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-artisan-dark'} transition-all`}
                                      title={user.isBanned ? 'Restore Access' : 'Suspend Member'}
                                   >
                                      {user.isBanned ? <Unlock className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                                   </button>
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

      {/* EDIT MODAL */}
      <AnimatePresence>
        {showEditModal && selectedUser && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowEditModal(false)}
              className="absolute inset-0 bg-artisan-dark/95 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-xl bg-artisan-dark border-2 border-artisan-light/10 p-12 shadow-2xl"
            >
              <button onClick={() => setShowEditModal(false)} className="absolute top-8 right-8 text-artisan-light/20 hover:text-artisan-light">
                <X className="w-6 h-6" />
              </button>

              <div className="space-y-12">
                <div className="space-y-4">
                  <span className="text-[10px] font-mono font-bold text-artisan-grey uppercase tracking-[0.4em]">Record Correction</span>
                  <h2 className="text-4xl font-display font-black text-artisan-light uppercase tracking-tight">REGISTRY SETTINGS</h2>
                </div>

                <form onSubmit={handleUpdateUser} className="space-y-8">
                  <div className="grid grid-cols-1 gap-8">
                    <div className="space-y-3">
                      <label className="text-[9px] font-mono text-artisan-light/30 uppercase tracking-widest">Display Name</label>
                      <input 
                        type="text"
                        value={selectedUser.name}
                        onChange={(e) => setSelectedUser({...selectedUser, name: e.target.value})}
                        className="w-full bg-artisan-light/[0.02] border-2 border-artisan-light/10 p-6 text-sm font-mono text-artisan-light uppercase tracking-widest outline-none focus:border-artisan-grey transition-all"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[9px] font-mono text-artisan-light/30 uppercase tracking-widest">Enlistment Role</label>
                      <select 
                        value={selectedUser.role}
                        onChange={(e) => setSelectedUser({...selectedUser, role: e.target.value})}
                        className="w-full bg-artisan-light/[0.02] border-2 border-artisan-light/10 p-6 text-sm font-mono text-artisan-light uppercase tracking-widest outline-none focus:border-artisan-grey transition-all appearance-none"
                      >
                        <option value="user">RENTER</option>
                        <option value="owner">ARTISAN</option>
                      </select>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={actionLoading}
                    className="w-full py-6 bg-artisan-light text-artisan-dark font-display font-black uppercase tracking-widest hover:bg-artisan-grey transition-all flex items-center justify-center gap-4 disabled:opacity-50"
                  >
                    {actionLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'SYNCHRONIZE RECORDS'}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* BAN MODAL */}
      <AnimatePresence>
        {showBanModal && selectedUser && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBanModal(false)}
              className="absolute inset-0 bg-artisan-dark/95 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-xl bg-artisan-dark border-2 border-artisan-light/10 p-12 shadow-2xl"
            >
              <button onClick={() => setShowBanModal(false)} className="absolute top-8 right-8 text-artisan-light/20 hover:text-artisan-light">
                <X className="w-6 h-6" />
              </button>

              <div className="space-y-12">
                <div className="space-y-4">
                  <span className="text-[10px] font-mono font-bold text-red-500 uppercase tracking-[0.4em]">
                    {selectedUser.isBanned ? 'Access Restoration' : 'Disciplinary Action'}
                  </span>
                  <h2 className="text-4xl font-display font-black text-artisan-light uppercase tracking-tight">
                    {selectedUser.isBanned ? 'RESTORE ACCESS' : 'SUSPEND MEMBER'}
                  </h2>
                </div>

                {!selectedUser.isBanned ? (
                  <div className="space-y-8">
                    <div className="space-y-3">
                      <label className="text-[9px] font-mono text-artisan-light/30 uppercase tracking-widest">Suspension Duration (Days)</label>
                      <select 
                        value={banDuration}
                        onChange={(e) => setBanDuration(e.target.value)}
                        className="w-full bg-artisan-light/[0.02] border-2 border-artisan-light/10 p-6 text-sm font-mono text-artisan-light uppercase tracking-widest outline-none focus:border-red-500 transition-all appearance-none"
                      >
                        <option value="1">24 HOURS</option>
                        <option value="7">7 DAYS</option>
                        <option value="30">30 DAYS</option>
                        <option value="365">1 YEAR</option>
                        <option value="99999">PERMANENT</option>
                      </select>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[9px] font-mono text-artisan-light/30 uppercase tracking-widest">Reason for Suspension</label>
                      <textarea 
                        value={banReason}
                        onChange={(e) => setBanReason(e.target.value)}
                        placeholder="VIOLATION OF GUILD TERMS..."
                        className="w-full h-32 bg-artisan-light/[0.02] border-2 border-artisan-light/10 p-6 text-sm font-mono text-artisan-light uppercase tracking-widest outline-none focus:border-red-500 transition-all resize-none"
                      />
                    </div>

                    <button 
                      onClick={handleBanUser}
                      disabled={actionLoading}
                      className="w-full py-6 bg-red-600 text-artisan-light font-display font-black uppercase tracking-widest hover:bg-red-700 transition-all flex items-center justify-center gap-4 disabled:opacity-50"
                    >
                      {actionLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'CONFIRM SUSPENSION'}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-8">
                    <p className="text-[11px] font-mono text-artisan-light/40 uppercase leading-relaxed tracking-wider">
                      Are you sure you want to restore access for this member? All active suspensions will be immediately revoked.
                    </p>
                    <button 
                      onClick={handleBanUser}
                      disabled={actionLoading}
                      className="w-full py-6 bg-green-600 text-artisan-light font-display font-black uppercase tracking-widest hover:bg-green-700 transition-all flex items-center justify-center gap-4 disabled:opacity-50"
                    >
                      {actionLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'RESTORE MEMBER ACCESS'}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}
