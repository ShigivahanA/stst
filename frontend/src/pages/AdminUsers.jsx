import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
   Users,
   Search,
   Mail,
   Settings,
   RefreshCcw
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

export default function AdminUsers() {
   const { addToast } = useToast()
   const [loading, setLoading] = useState(true)
   const [users, setUsers] = useState([])
   const [search, setSearch] = useState('')

   const fetchUsers = async () => {
      try {
         setLoading(true)
         const res = await api.get('/admin/users')
         // Only show users, filter out admins
         const nonAdminUsers = res.data.data.filter(u => u.role !== 'admin')
         setUsers(nonAdminUsers)
      } catch (err) {
         addToast('Failed to fetch user list', 'error')
      } finally {
         setLoading(false)
      }
   }

   useEffect(() => {
      fetchUsers()
   }, [])

   const filteredUsers = users.filter(user => {
      return user.name.toLowerCase().includes(search.toLowerCase()) ||
         user.email.toLowerCase().includes(search.toLowerCase())
   })

   return (
      <div className="min-h-screen bg-artisan-dark bg-noise pt-32 pb-24 text-artisan-light">
         <div className="container-custom">

            {/* HEADER SECTION */}
            <div className="mb-12">
               <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                  <div className="space-y-4">
                     <h1 className="text-6xl md:text-8xl font-display font-black uppercase tracking-tighter leading-[0.8] text-artisan-light">
                        CLIENT <br />
                        <span className="text-outline">REGISTRY.</span>
                     </h1>
                  </div>

                  {/* SEARCH HUD */}
                  <div className="lg:w-1/2 flex flex-col gap-4 w-full">
                     <div className="relative overflow-hidden bg-artisan-light/[0.01] border border-artisan-light/10 focus-within:border-artisan-grey/30 focus-within:bg-artisan-light/[0.03] transition-all duration-300">
                        <div className="flex items-center">
                           <div className="pl-6 shrink-0 text-artisan-light/30">
                              <Search className="w-5 h-5" />
                           </div>
                           <input
                              type="text"
                              value={search}
                              onChange={(e) => setSearch(e.target.value)}
                              className="w-full bg-transparent py-5 px-4 text-xs sm:text-sm font-mono text-artisan-light uppercase tracking-wider outline-none placeholder:text-artisan-light/20"
                              placeholder="Search by name or email..."
                           />
                           <div className="pr-6 shrink-0 hidden sm:block">
                              <span className="text-[9px] font-mono text-artisan-light/40 uppercase">
                                 Found: {filteredUsers.length}
                              </span>
                           </div>
                        </div>
                     </div>

                     <div className="flex justify-end">
                        <button
                           onClick={fetchUsers}
                           className="h-10 px-5 bg-artisan-light/5 border border-artisan-light/10 flex items-center justify-center gap-2 hover:bg-artisan-light/10 hover:border-artisan-light/20 transition-all group shrink-0 font-mono text-[9px] font-bold uppercase tracking-widest text-artisan-grey"
                           title="Reload list"
                        >
                           <RefreshCcw className={`w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-700 ${loading ? 'animate-spin' : ''}`} />
                           <span>Reload Registry</span>
                        </button>
                     </div>
                  </div>
               </div>
            </div>

            {/* MEMBER DIRECTORY - DESKTOP VIEW (TABLE) */}
            <div className="hidden lg:block border border-artisan-light/10 bg-artisan-dark/50 shadow-2xl overflow-hidden mb-16">
               <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                     <thead>
                        <tr className="border-b border-artisan-light/10 bg-artisan-light/[0.02] text-left">
                           <th className="px-6 py-5 text-[9px] font-mono font-bold text-artisan-light/40 uppercase tracking-[0.2em]">ID</th>
                           <th className="px-6 py-5 text-[9px] font-mono font-bold text-artisan-light/40 uppercase tracking-[0.2em]">User Profile</th>
                           <th className="px-6 py-5 text-[9px] font-mono font-bold text-artisan-light/40 uppercase tracking-[0.2em]">Status</th>
                           <th className="px-6 py-5 text-right text-[9px] font-mono font-bold text-artisan-light/40 uppercase tracking-[0.2em]">Actions</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-artisan-light/5">
                        {loading ? (
                           Array(5).fill(0).map((_, i) => (
                              <tr key={i} className="animate-pulse">
                                 <td colSpan="4" className="px-6 py-9 bg-artisan-light/[0.005]" />
                              </tr>
                           ))
                        ) : filteredUsers.length === 0 ? (
                           <tr>
                              <td colSpan="4" className="px-6 py-20 text-center">
                                 <Users className="w-12 h-12 text-artisan-light/5 mx-auto mb-4" />
                                 <p className="text-[10px] font-mono text-artisan-light/20 uppercase tracking-[0.3em]">No users found</p>
                              </td>
                           </tr>
                        ) : (
                           filteredUsers.map((user) => (
                              <tr key={user._id} className={`group hover:bg-artisan-light/[0.02] transition-all duration-300 ${user.isBanned ? 'bg-red-500/[0.01]' : ''}`}>
                                 <td className="px-6 py-8 align-top">
                                    <span className="text-[10px] font-mono text-artisan-grey font-bold tracking-tighter">
                                       #{user._id.slice(-8).toUpperCase()}
                                    </span>
                                 </td>
                                 <td className="px-6 py-8">
                                    <div className="flex items-center gap-4">
                                       <UserAvatar avatar={user.avatar} className="w-12 h-12" />
                                       <div className="flex flex-col min-w-0">
                                          <span className="text-md font-display font-black text-artisan-light uppercase tracking-tight group-hover:text-artisan-grey transition-colors truncate">{user.name}</span>
                                          <div className="flex items-center gap-1.5 mt-0.5 min-w-0">
                                             <Mail className="w-3.5 h-3.5 text-artisan-light/20 shrink-0" />
                                             <span className="text-[9px] font-mono text-artisan-light/40 uppercase tracking-wider truncate">{user.email}</span>
                                          </div>
                                       </div>
                                    </div>
                                 </td>
                                 <td className="px-6 py-8">
                                    <div className="flex items-center gap-2">
                                       <div className={`w-1.5 h-1.5 rounded-full ${user.isBanned ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
                                       <span className={`text-[9px] font-mono font-black uppercase tracking-widest ${user.isBanned ? 'text-red-500' : 'text-green-500'}`}>
                                          {user.isBanned ? 'Suspended' : 'Active'}
                                       </span>
                                    </div>
                                 </td>
                                 <td className="px-6 py-8 text-right">
                                    <div className="flex justify-end">
                                       <Link
                                          to={`/admin/users/${user._id}`}
                                          className="px-4 py-2.5 bg-artisan-light/5 border border-artisan-light/10 text-artisan-light hover:bg-artisan-light hover:text-artisan-dark hover:border-artisan-light transition-all text-[9px] font-mono font-bold uppercase tracking-widest flex items-center gap-2"
                                          title="Manage details"
                                       >
                                          <Settings className="w-3.5 h-3.5" />
                                          <span>Manage</span>
                                       </Link>
                                    </div>
                                 </td>
                              </tr>
                           ))
                        )}
                     </tbody>
                  </table>
               </div>
            </div>

            {/* MEMBER DIRECTORY - MOBILE/TABLET VIEW (CARDS) */}
            <div className="block lg:hidden space-y-4 mb-16">
               {loading ? (
                  Array(3).fill(0).map((_, i) => (
                     <div key={i} className="p-6 border border-artisan-light/10 bg-artisan-light/[0.01] animate-pulse h-40 w-full" />
                  ))
               ) : filteredUsers.length === 0 ? (
                  <div className="p-12 text-center border border-dashed border-artisan-light/10 bg-artisan-light/[0.01]">
                     <Users className="w-12 h-12 text-artisan-light/5 mx-auto mb-4" />
                     <p className="text-[10px] font-mono text-artisan-light/20 uppercase tracking-[0.3em]">No users found</p>
                  </div>
               ) : (
                  filteredUsers.map((user) => (
                     <div
                        key={user._id}
                        className={`p-5 border border-artisan-light/10 bg-artisan-light/[0.01] hover:border-artisan-grey/30 transition-all duration-300 flex flex-col gap-4 relative group ${user.isBanned ? 'border-red-500/20 bg-red-500/[0.005]' : ''
                           }`}
                     >
                        {/* Top Row: ID, status */}
                        <div className="flex justify-between items-center">
                           <span className="text-[9px] font-mono text-artisan-grey font-bold tracking-tighter">
                              #{user._id.slice(-8).toUpperCase()}
                           </span>
                           <div className="flex items-center gap-2">
                              <span className={`text-[8px] font-mono font-black uppercase tracking-widest px-1.5 py-0.5 border ${user.isBanned
                                    ? 'border-red-500/20 text-red-500 bg-red-500/5'
                                    : 'border-green-500/20 text-green-500 bg-green-500/5'
                                 }`}>
                                 {user.isBanned ? 'Suspended' : 'Active'}
                              </span>
                           </div>
                        </div>

                        {/* Middle: User info */}
                        <div className="flex items-center gap-4 min-w-0">
                           <UserAvatar avatar={user.avatar} className="w-12 h-12" />
                           <div className="flex flex-col min-w-0 flex-1">
                              <span className="text-md font-display font-black text-artisan-light uppercase tracking-tight truncate">
                                 {user.name}
                              </span>
                              <div className="flex items-center gap-1.5 mt-0.5 min-w-0">
                                 <Mail className="w-3.5 h-3.5 text-artisan-light/20 shrink-0" />
                                 <span className="text-[9px] font-mono text-artisan-light/40 uppercase tracking-wider truncate">
                                    {user.email}
                                 </span>
                              </div>
                           </div>
                        </div>

                        {/* Divider */}
                        <div className="h-px bg-artisan-light/5 w-full" />

                        {/* Actions */}
                        <div className="flex justify-end gap-2.5">
                           <Link
                              to={`/admin/users/${user._id}`}
                              className="w-full h-10 px-4 bg-artisan-light/5 border border-artisan-light/10 text-artisan-light hover:bg-artisan-light hover:text-artisan-dark hover:border-artisan-light transition-all flex items-center justify-center gap-2 font-mono text-[9px] font-bold uppercase tracking-widest"
                           >
                              <Settings className="w-3.5 h-3.5" />
                              <span>Manage Account</span>
                           </Link>
                        </div>

                     </div>
                  ))
               )}
            </div>

         </div>
      </div>
   )
}
