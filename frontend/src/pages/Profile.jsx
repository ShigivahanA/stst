import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import {
   UserCheck,
   Mail,
   Shield,
   Calendar,
   LogOut,
   History,
   ShoppingBag,
   Loader2,
   Trash2,
   MapPin,
   Lock,
   CheckCircle,
   Settings,
   KeyRound,
   Pencil,
   ArrowLeft,
   Phone
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import api from '../services/api'
import SEO from '../components/SEO'

export default function Profile() {
   const { user, setUser, logout, updateProfile, uploadAvatar, deleteAvatar } = useAuth()
   const { addToast } = useToast()
   const navigate = useNavigate()
   const [logoutLoading, setLogoutLoading] = useState(false)

   const MotionLink = motion.create ? motion.create(Link) : motion(Link)

   // Tab state: 'addresses' or 'security' (default depending on role)
   const [activeTab, setActiveTab] = useState(user?.role === 'customer' ? 'addresses' : 'security')

   // Name states
   const [isEditingName, setIsEditingName] = useState(false)
   const [newName, setNewName] = useState(user?.name || '')
   const [nameLoading, setNameLoading] = useState(false)

   // Phone states
   const [isEditingPhone, setIsEditingPhone] = useState(false)
   const [newPhone, setNewPhone] = useState(user?.phone || '')
   const [phoneLoading, setPhoneLoading] = useState(false)

   useEffect(() => {
      if (user) {
         setNewName(user.name || '')
         setNewPhone(user.phone || '')
      }
   }, [user])

   // Profile Picture state
   const [avatarLoading, setAvatarLoading] = useState(false)

   // Address states
   const [editingAddressId, setEditingAddressId] = useState(null)
   const [addressTag, setAddressTag] = useState('Home')
   const [doorNumber, setDoorNumber] = useState('')
   const [secondLine, setSecondLine] = useState('')
   const [landmark, setLandmark] = useState('')
   const [city, setCity] = useState('')
   const [stateName, setStateName] = useState('')
   const [pincode, setPincode] = useState('')
   const [addrLoading, setAddrLoading] = useState(false)
   const [isFetchingPincode, setIsFetchingPincode] = useState(false)
   const lastFetchedPincodeRef = useRef('')

   // Fetch city and state automatically from pincode API
   useEffect(() => {
      const fetchAddressDetails = async () => {
         const pin = pincode.trim()
         if (pin.length === 6 && pin !== lastFetchedPincodeRef.current) {
            try {
               setIsFetchingPincode(true)
               const response = await fetch(`https://api.postalpincode.in/pincode/${pin}`)
               if (!response.ok) throw new Error('API request failed')
               const data = await response.json()

               if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice && data[0].PostOffice.length > 0) {
                  const postOffice = data[0].PostOffice[0]
                  const fetchedCity = postOffice.District || ''
                  const fetchedState = postOffice.State || ''

                  setCity(fetchedCity)
                  setStateName(fetchedState)
                  // addToast('City and State fetched successfully', 'success')
               } else {
                  addToast('Invalid Pincode. Please check and try again.', 'error')
               }
            } catch (err) {
               console.error('Pincode fetch error:', err)
               addToast('Could not fetch address details. Please fill manually.', 'warning')
            } finally {
               setIsFetchingPincode(false)
               lastFetchedPincodeRef.current = pin
            }
         }
      }

      fetchAddressDetails()
   }, [pincode, addToast])

   // Password states
   const [currentPassword, setCurrentPassword] = useState('')
   const [newPassword, setNewPassword] = useState('')
   const [confirmPassword, setConfirmPassword] = useState('')
   const [passLoading, setPassLoading] = useState(false)

   // 2FA states
   const [twoFactorLoading, setTwoFactorLoading] = useState(false)

   const handleLogout = async () => {
      try {
         setLogoutLoading(true)
         await logout()
         addToast('Logged out successfully', 'success')
         navigate('/login')
      } catch (err) {
         addToast('Logout failed', 'error')
      } finally {
         setLogoutLoading(false)
      }
   }

   const handleSaveName = async () => {
      if (!newName.trim()) {
         addToast('Name is required', 'error')
         return
      }
      try {
         setNameLoading(true)
         await updateProfile({ name: newName.trim() })
         addToast('Name updated successfully', 'success')
         setIsEditingName(false)
      } catch (err) {
         addToast(err.response?.data?.message || 'Failed to update name', 'error')
      } finally {
         setNameLoading(false)
      }
   }

   const handleSavePhone = async () => {
      if (!newPhone.trim()) {
         addToast('Phone number is required', 'error')
         return
      }
      try {
         setPhoneLoading(true)
         await updateProfile({ phone: newPhone.trim() })
         addToast('Phone number updated successfully', 'success')
         setIsEditingPhone(false)
      } catch (err) {
         addToast(err.response?.data?.message || 'Failed to update phone number', 'error')
      } finally {
         setPhoneLoading(false)
      }
   }

   const handleAvatarChange = async (e) => {
      const file = e.target.files[0]
      if (!file) return

      if (file.size > 5 * 1024 * 1024) {
         addToast('Image size must be less than 5MB', 'error')
         return
      }

      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onloadend = async () => {
         try {
            setAvatarLoading(true)
            await uploadAvatar(reader.result)
            addToast('Profile picture updated successfully', 'success')
         } catch (err) {
            addToast(err.response?.data?.message || 'Failed to upload profile picture', 'error')
         } finally {
            setAvatarLoading(false)
         }
      }
   }

   const handleDeleteAvatar = async () => {
      try {
         setAvatarLoading(true)
         await deleteAvatar()
         addToast('Profile picture removed successfully', 'success')
      } catch (err) {
         addToast(err.response?.data?.message || 'Failed to remove profile picture', 'error')
      } finally {
         setAvatarLoading(false)
      }
   }

   const handleAddAddress = async (e) => {
      e.preventDefault()
      if (!doorNumber.trim() || !city.trim() || !stateName.trim() || !pincode.trim()) {
         addToast('Required address fields cannot be empty', 'error')
         return
      }
      try {
         setAddrLoading(true)
         let res;
         if (editingAddressId) {
            res = await api.put(`/users/address/${editingAddressId}`, {
               tag: addressTag,
               doorNumber: doorNumber.trim(),
               secondLine: secondLine.trim(),
               landmark: landmark.trim(),
               city: city.trim(),
               state: stateName.trim(),
               pincode: pincode.trim()
            })
            addToast('Address updated successfully', 'success')
            setEditingAddressId(null)
         } else {
            res = await api.post('/users/address', {
               tag: addressTag,
               doorNumber: doorNumber.trim(),
               secondLine: secondLine.trim(),
               landmark: landmark.trim(),
               city: city.trim(),
               state: stateName.trim(),
               pincode: pincode.trim()
            })
            addToast('Address added successfully', 'success')
         }
         setUser(res.data.data)
         setDoorNumber('')
         setSecondLine('')
         setLandmark('')
         setCity('')
         setStateName('')
         setPincode('')
         lastFetchedPincodeRef.current = ''
         setAddressTag('Home')
      } catch (err) {
         addToast(err.response?.data?.message || 'Failed to save address', 'error')
      } finally {
         setAddrLoading(false)
      }
   }

   const handleStartEditAddress = (addr) => {
      setEditingAddressId(addr._id)
      setAddressTag(addr.tag)
      setDoorNumber(addr.doorNumber)
      setSecondLine(addr.secondLine || '')
      setLandmark(addr.landmark || '')
      setCity(addr.city)
      setStateName(addr.state)
      setPincode(addr.pincode)
      lastFetchedPincodeRef.current = addr.pincode
   }

   const handleCancelEditAddress = () => {
      setEditingAddressId(null)
      setAddressTag('Home')
      setDoorNumber('')
      setSecondLine('')
      setLandmark('')
      setCity('')
      setStateName('')
      setPincode('')
      lastFetchedPincodeRef.current = ''
   }

   const handleDeleteAddress = async (addressId) => {
      try {
         const res = await api.delete(`/users/address/${addressId}`)
         setUser(res.data.data)
         addToast('Address deleted successfully', 'success')
         if (editingAddressId === addressId) {
            handleCancelEditAddress()
         }
      } catch (err) {
         addToast(err.response?.data?.message || 'Failed to delete address', 'error')
      }
   }

   const handleChangePassword = async (e) => {
      e.preventDefault()
      if (newPassword !== confirmPassword) {
         addToast('New passwords do not match', 'error')
         return
      }
      if (newPassword.length < 6) {
         addToast('Password must be at least 6 characters', 'error')
         return
      }
      try {
         setPassLoading(true)
         await api.put('/users/change-password', { currentPassword, newPassword })
         addToast('Password changed successfully', 'success')
         setCurrentPassword('')
         setNewPassword('')
         setConfirmPassword('')
      } catch (err) {
         addToast(err.response?.data?.message || 'Failed to update password', 'error')
      } finally {
         setPassLoading(false)
      }
   }

   const handleToggle2FA = async () => {
      try {
         setTwoFactorLoading(true)
         const res = await api.post('/users/toggle-2fa')
         setUser(res.data.data)
         addToast(`Two-factor Authentication ${res.data.data.twoFactorEnabled ? 'enabled' : 'disabled'}`, 'success')
      } catch (err) {
         addToast(err.response?.data?.message || 'Failed to toggle 2FA', 'error')
      } finally {
         setTwoFactorLoading(false)
      }
   }

   if (!user) {
      return (
         <div className="min-h-screen bg-artisan-dark flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-artisan-grey animate-spin" />
         </div>
      )
   }

   // Get user's initials for decorative avatar
   const getInitials = (name) => {
      if (!name) return 'U'
      const parts = name.split(' ')
      if (parts.length > 1) {
         return (parts[0][0] + parts[1][0]).toUpperCase()
      }
      return name[0].toUpperCase()
   }

   return (
      <div className="min-h-screen bg-artisan-dark bg-noise pt-24 md:pt-32 pb-24 text-artisan-light font-body">
         <SEO title="My Account" robots="noindex, nofollow" />
         <div className="container-custom max-w-6xl mx-auto space-y-12 px-4">

            {/* BACK LINK */}
            <div>
               <Link
                  to={user?.role === 'admin' ? '/admin' : '/'}
                  className="inline-flex items-center gap-3 group"
               >
                  <div className="w-8 h-8 border border-artisan-light/10 flex items-center justify-center group-hover:bg-artisan-light group-hover:text-artisan-dark transition-all rounded-full">
                     <ArrowLeft className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono font-bold text-artisan-light/40 uppercase tracking-[0.4em] group-hover:text-artisan-light transition-colors">
                     {user?.role === 'admin' ? 'Back to Dashboard' : 'Back to Home'}
                  </span>
               </Link>
            </div>

            {/* Header / Title block (UNCHANGED) */}
            <header className="space-y-4">
               <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-5xl md:text-7xl font-display font-extrabold uppercase tracking-tighter leading-none text-artisan-light"
               >
                  MY <br />
                  <span className="text-outline">PROFILE.</span>
               </motion.h1>
            </header>

            {/* Split Dashboard Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

               {/* Left Sidebar Column - Primary User Info */}
               <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-artisan-light/[0.02] border border-artisan-light/10 p-8 flex flex-col justify-between relative overflow-hidden h-fit rounded-2xl"
               >
                  <div className="absolute top-0 left-0 w-1 h-full bg-artisan-grey" />

                  <div className="space-y-8">
                     {/* User Avatar with Cloudinary Upload capabilities */}
                     <div className="flex flex-col items-center text-center pb-6 border-b border-artisan-light/5">
                        <div className="w-24 h-24 rounded-full border border-artisan-light/10 bg-artisan-light/[0.03] flex items-center justify-center mb-2 relative group overflow-hidden">
                           {avatarLoading ? (
                              <Loader2 className="w-8 h-8 text-artisan-grey animate-spin" />
                           ) : user.avatar ? (
                              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                           ) : (
                              <span className="text-3xl font-display font-extrabold text-artisan-grey">
                                 {getInitials(user.name)}
                              </span>
                           )}

                           {/* Hover overlay triggers image upload */}
                           <label className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-center p-2 text-artisan-light">
                              <Settings className="w-4 h-4 mb-1 text-artisan-light" />
                              <span className="text-[8px] font-mono font-bold uppercase tracking-widest">Change Photo</span>
                              <input
                                 type="file"
                                 accept="image/*"
                                 onChange={handleAvatarChange}
                                 className="hidden"
                                 disabled={avatarLoading}
                              />
                           </label>
                        </div>

                        {/* Option to delete profile picture if exists */}
                        {user.avatar && !avatarLoading && (
                           <button
                              onClick={handleDeleteAvatar}
                              className="text-[8px] font-mono text-red-500/80 hover:text-red-400 uppercase tracking-widest mt-1 mb-2 hover:underline"
                           >
                              Remove Photo
                           </button>
                        )}

                        {/* Name Field with Inline Editing */}
                        <div className="w-full space-y-2 mt-2">
                           {isEditingName ? (
                              <div className="flex flex-col items-center gap-2">
                                 <input
                                    type="text"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    className="bg-artisan-dark border border-artisan-light/10 px-3 py-1.5 text-center text-sm font-display font-bold uppercase text-artisan-light focus:border-artisan-grey outline-none w-full max-w-xs rounded-xl"
                                    placeholder="Enter name"
                                 />
                                 <div className="flex gap-2">
                                    <button
                                       onClick={handleSaveName}
                                       disabled={nameLoading}
                                       className="text-[8px] font-mono font-bold text-green-400 hover:text-green-300 uppercase tracking-widest py-1 px-2.5 border border-green-500/20 bg-green-500/5 transition-colors rounded-lg"
                                    >
                                       {nameLoading ? 'Saving...' : 'Save'}
                                    </button>
                                    <button
                                       onClick={() => { setIsEditingName(false); setNewName(user.name); }}
                                       className="text-[8px] font-mono font-bold text-artisan-light/40 hover:text-artisan-light/70 uppercase tracking-widest py-1 px-2.5 border border-artisan-light/10 transition-colors rounded-lg"
                                    >
                                       Cancel
                                    </button>
                                 </div>
                              </div>
                           ) : (
                              <div className="flex items-center justify-center gap-2">
                                 <span className="text-xl font-display font-black uppercase tracking-wider text-artisan-light">
                                    {user.name}
                                 </span>
                                 <button
                                    onClick={() => { setIsEditingName(true); setNewName(user.name); }}
                                    className="text-[9px] font-mono text-artisan-grey hover:text-artisan-light uppercase tracking-wider px-2 py-0.5 border border-artisan-light/10 hover:border-artisan-grey transition-colors rounded-lg"
                                 >
                                    Edit
                                 </button>
                              </div>
                           )}
                        </div>
                        <span className="text-[10px] font-mono uppercase tracking-widest text-artisan-grey bg-artisan-light/5 border border-artisan-light/10 px-3 py-1 rounded-full mt-3">
                           {user.role}
                        </span>
                     </div>

                     {/* Profile Info Details List */}
                     <div className="space-y-4">
                        <div className="flex items-center justify-between py-2 border-b border-artisan-light/5">
                           <span className="text-[9px] font-mono text-artisan-light/50 uppercase tracking-[0.2em] flex items-center gap-2">
                              <Mail className="w-3.5 h-3.5 text-artisan-light/20" /> Email
                           </span>
                           <span className="text-xs font-mono text-artisan-light/85 break-all max-w-[180px] text-right">
                              {user.email}
                           </span>
                        </div>

                        {user.role !== 'admin' && (
                           <div className="flex items-center justify-between py-2 border-b border-artisan-light/5">
                              <span className="text-[9px] font-mono text-artisan-light/50 uppercase tracking-[0.2em] flex items-center gap-2">
                                 <Phone className="w-3.5 h-3.5 text-artisan-light/20" /> Phone
                              </span>
                              {isEditingPhone ? (
                                 <div className="flex items-center gap-2">
                                    <input
                                       type="text"
                                       value={newPhone}
                                       onChange={(e) => setNewPhone(e.target.value)}
                                       className="bg-artisan-dark border border-artisan-light/10 px-2 py-0.5 text-right text-xs font-mono text-artisan-light focus:border-artisan-grey outline-none w-32 rounded-lg"
                                       placeholder="Enter phone"
                                    />
                                    <button
                                       onClick={handleSavePhone}
                                       disabled={phoneLoading}
                                       className="text-[8px] font-mono font-bold text-green-400 hover:text-green-300 uppercase tracking-widest cursor-pointer rounded-md border border-green-500/10 px-1.5 py-0.5 bg-green-500/5"
                                    >
                                       {phoneLoading ? '...' : 'Save'}
                                    </button>
                                    <button
                                       onClick={() => { setIsEditingPhone(false); setNewPhone(user.phone || ''); }}
                                       className="text-[8px] font-mono font-bold text-artisan-light/40 hover:text-artisan-light/70 uppercase tracking-widest cursor-pointer rounded-md border border-artisan-light/10 px-1.5 py-0.5"
                                    >
                                       Cancel
                                    </button>
                                 </div>
                              ) : (
                                 <div className="flex items-center gap-2">
                                    <span className="text-xs font-mono text-artisan-light/85">
                                       {user.phone || 'Not provided'}
                                    </span>
                                    <button
                                       onClick={() => { setIsEditingPhone(true); setNewPhone(user.phone || ''); }}
                                       className="text-[8px] font-mono text-artisan-grey hover:text-artisan-light uppercase tracking-wider px-1.5 py-0.5 border border-artisan-light/10 hover:border-artisan-grey transition-colors rounded-lg cursor-pointer"
                                    >
                                       Edit
                                    </button>
                                 </div>
                              )}
                           </div>
                        )}

                        <div className="flex items-center justify-between py-2 border-b border-artisan-light/5">
                           <span className="text-[9px] font-mono text-artisan-light/50 uppercase tracking-[0.2em] flex items-center gap-2">
                              <Shield className="w-3.5 h-3.5 text-artisan-light/20" /> System Level
                           </span>
                           <span className="text-xs font-mono uppercase text-artisan-light/85">
                              {user.role} ID
                           </span>
                        </div>

                        <div className="flex items-center justify-between py-2">
                           <span className="text-[9px] font-mono text-artisan-light/50 uppercase tracking-[0.2em] flex items-center gap-2">
                              <Calendar className="w-3.5 h-3.5 text-artisan-light/20" /> Onboarded
                           </span>
                           <span className="text-xs font-mono text-artisan-light/85">
                              {new Date(user.createdAt).toLocaleDateString(undefined, {
                                 year: 'numeric',
                                 month: 'short',
                                 day: 'numeric'
                              })}
                           </span>
                        </div>
                     </div>
                  </div>

                  {/* Sidebar Footer Logout */}
                  <div className="pt-8 mt-8 border-t border-artisan-light/5">
                     <motion.button
                        onClick={handleLogout}
                        disabled={logoutLoading}
                        className="w-full py-4 border border-red-500 text-[9px] font-mono font-bold uppercase tracking-[0.2em] text-red-500 cursor-pointer rounded-full"
                        initial={{ y: 0, boxShadow: "0 6px 0 0 rgba(239, 68, 68, 0.2)", backgroundColor: "rgba(239, 68, 68, 0.05)" }}
                        whileHover={logoutLoading ? {} : {
                           y: -2,
                           boxShadow: "0 8px 0 0 rgba(239, 68, 68, 0.3)",
                           backgroundColor: "rgba(239, 68, 68, 0.15)"
                        }}
                        whileTap={logoutLoading ? {} : {
                           y: 6,
                           boxShadow: "0 0px 0 0 rgba(239, 68, 68, 0.2)"
                        }}
                        transition={{ type: "spring", stiffness: 600, damping: 18 }}
                     >
                        {logoutLoading ? (
                           <Loader2 className="w-3.5 h-3.5 animate-spin mx-auto" />
                        ) : (
                           <div className="flex items-center justify-center gap-3">
                              <LogOut className="w-3.5 h-3.5" />
                              Log Out
                           </div>
                        )}
                     </motion.button>
                  </div>
               </motion.div>

               {/* Right Side Columns - Tabbed settings pages */}
               <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 }}
                  className="lg:col-span-2 space-y-6"
               >
                  {/* Tab Navigation header */}
                  <div className="flex border-b border-artisan-light/10 gap-8">
                     {user.role === 'customer' && (
                        <button
                           onClick={() => setActiveTab('addresses')}
                           className={`pb-4 text-xs font-mono font-bold uppercase tracking-widest border-b-2 transition-all flex items-center gap-2 ${activeTab === 'addresses'
                              ? 'border-artisan-light text-artisan-light'
                              : 'border-transparent text-artisan-light/35 hover:text-artisan-light/60'
                              }`}
                        >
                           <MapPin className="w-3.5 h-3.5" />
                           [Addresses]
                        </button>
                     )}
                     <button
                        onClick={() => setActiveTab('security')}
                        className={`pb-4 text-xs font-mono font-bold uppercase tracking-widest border-b-2 transition-all flex items-center gap-2 ${activeTab === 'security'
                           ? 'border-artisan-light text-artisan-light'
                           : 'border-transparent text-artisan-light/35 hover:text-artisan-light/60'
                           }`}
                     >
                        <Settings className="w-3.5 h-3.5" />
                        [Security]
                     </button>
                  </div>

                  {/* Tab Content Canvas */}
                  <div className="min-h-[400px]">
                     <AnimatePresence mode="wait">
                        {activeTab === 'addresses' && user.role === 'customer' && (
                           <motion.div
                              key="tab-addresses"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{ duration: 0.2 }}
                              className="space-y-8"
                           >
                              {/* Saved Addresses list */}
                              <div className="space-y-4">
                                 <h3 className="text-base font-display font-bold uppercase tracking-wider text-artisan-light">
                                    Saved Addresses ({user.addresses?.length || 0}/4)
                                 </h3>

                                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {user.addresses && user.addresses.length > 0 ? (
                                       user.addresses.map((addr) => (
                                          <div
                                             key={addr._id}
                                             className={`group p-5 flex flex-col justify-between min-h-[140px] transition-all relative overflow-hidden rounded-xl ${editingAddressId === addr._id
                                                ? 'bg-artisan-light/[0.05] border border-artisan-light/40 shadow-lg'
                                                : 'bg-artisan-light/[0.01] border border-artisan-light/5 hover:border-artisan-light/10'
                                                }`}
                                          >
                                             <div className={`absolute top-0 left-0 w-[2px] h-full transition-colors ${editingAddressId === addr._id ? 'bg-artisan-light' : 'bg-artisan-light/10 group-hover:bg-artisan-grey'
                                                }`} />
                                             <div className="flex items-start justify-between gap-3 mb-4">
                                                <span className="text-[8px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 bg-artisan-light/5 border border-artisan-light/10 text-artisan-grey rounded-full">
                                                   {addr.tag}
                                                </span>
                                                <div className="flex items-center gap-1.5">
                                                   <button
                                                      onClick={() => handleStartEditAddress(addr)}
                                                      className="text-artisan-grey hover:text-artisan-light p-1.5 hover:bg-artisan-light/5 transition-all rounded-lg flex-shrink-0"
                                                      title="Edit Address"
                                                   >
                                                      <Pencil className="w-3.5 h-3.5" />
                                                   </button>
                                                   <button
                                                      onClick={() => handleDeleteAddress(addr._id)}
                                                      className="text-red-500/40 hover:text-red-400 p-1.5 hover:bg-red-500/5 transition-all rounded-lg flex-shrink-0"
                                                      title="Delete Address"
                                                   >
                                                      <Trash2 className="w-3.5 h-3.5" />
                                                   </button>
                                                </div>
                                             </div>
                                             <div className="text-xs text-artisan-light/80 font-mono uppercase tracking-wide leading-relaxed space-y-1">
                                                <div className="font-bold text-artisan-light">Flat/Door: {addr.doorNumber}</div>
                                                {addr.secondLine && <div>Street: {addr.secondLine}</div>}
                                                {addr.landmark && <div className="text-artisan-grey text-[10px]">Landmark: {addr.landmark}</div>}
                                                <div>City: {addr.city}</div>
                                                <div>State: {addr.state} - {addr.pincode}</div>
                                             </div>
                                          </div>
                                       ))
                                    ) : (
                                       <div className="sm:col-span-2 text-center py-12 border border-dashed border-artisan-light/10 bg-artisan-light/[0.01] rounded-xl">
                                          <p className="text-xs font-mono text-artisan-light/50 uppercase tracking-widest">No addresses saved</p>
                                       </div>
                                    )}
                                 </div>
                              </div>

                              {/* Add Address Form Section */}
                              {(!user.addresses || user.addresses.length < 4 || editingAddressId) && (
                                 <div className="bg-artisan-light/[0.01] border border-artisan-light/10 p-6 md:p-8 space-y-6 rounded-2xl">
                                    <h4 className="text-sm font-display font-bold uppercase tracking-widest text-artisan-light">
                                       {editingAddressId ? 'Edit Address' : 'Add Address'}
                                    </h4>

                                    <form onSubmit={handleAddAddress} className="space-y-4">
                                       {/* Custom Tag Selector Chips */}
                                       <div className="space-y-1.5">
                                          <label className="block text-[8px] font-mono text-artisan-light/40 uppercase tracking-widest">
                                             Tag
                                          </label>
                                          <div className="flex flex-wrap gap-2">
                                             {['Home', 'Office', 'Other'].map(tag => (
                                                <button
                                                   key={tag}
                                                   type="button"
                                                   onClick={() => setAddressTag(tag)}
                                                   className={`px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider border transition-all rounded-xl ${addressTag === tag
                                                      ? 'bg-artisan-light text-artisan-dark border-artisan-light'
                                                      : 'bg-transparent border-artisan-light/10 text-artisan-grey hover:border-artisan-grey hover:text-artisan-light'
                                                      }`}
                                                >
                                                   {tag}
                                                </button>
                                             ))}
                                          </div>
                                       </div>

                                       <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                                          <div className="md:col-span-2">
                                             <label className="block text-[8px] font-mono text-artisan-light/40 uppercase tracking-widest mb-1.5">
                                                Flat / Door Number *
                                             </label>
                                             <input
                                                type="text"
                                                value={doorNumber}
                                                onChange={(e) => setDoorNumber(e.target.value)}
                                                placeholder="APT 4B, DOOR 12"
                                                required
                                                className="w-full bg-artisan-dark border border-artisan-light/10 p-2.5 text-xs text-artisan-light font-mono uppercase tracking-wider focus:border-artisan-grey outline-none rounded-xl"
                                             />
                                          </div>

                                          <div className="md:col-span-4">
                                             <label className="block text-[8px] font-mono text-artisan-light/40 uppercase tracking-widest mb-1.5">
                                                Street Address
                                             </label>
                                             <input
                                                type="text"
                                                value={secondLine}
                                                onChange={(e) => setSecondLine(e.target.value)}
                                                placeholder="MAIN ROAD, APARTMENT NAME"
                                                className="w-full bg-artisan-dark border border-artisan-light/10 p-2.5 text-xs text-artisan-light font-mono uppercase tracking-wider focus:border-artisan-grey outline-none rounded-xl"
                                             />
                                          </div>

                                          <div className="md:col-span-3">
                                             <label className="block text-[8px] font-mono text-artisan-light/40 uppercase tracking-widest mb-1.5">
                                                Landmark
                                             </label>
                                             <input
                                                type="text"
                                                value={landmark}
                                                onChange={(e) => setLandmark(e.target.value)}
                                                placeholder="NEAR METRO STATION"
                                                className="w-full bg-artisan-dark border border-artisan-light/10 p-2.5 text-xs text-artisan-light font-mono uppercase tracking-wider focus:border-artisan-grey outline-none rounded-xl"
                                             />
                                          </div>

                                          <div className="md:col-span-3">
                                             <label className="block text-[8px] font-mono text-artisan-light/40 uppercase tracking-widest mb-1.5">
                                                Pincode *
                                             </label>
                                             <div className="relative">
                                                <input
                                                   type="text"
                                                   maxLength={6}
                                                   value={pincode}
                                                   onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                                                   placeholder="600075"
                                                   required
                                                   className="w-full bg-artisan-dark border border-artisan-light/10 p-2.5 pr-8 text-xs text-artisan-light font-mono uppercase tracking-wider focus:border-artisan-grey outline-none rounded-xl"
                                                />
                                                {isFetchingPincode && (
                                                   <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 animate-spin text-artisan-light/40" />
                                                )}
                                             </div>
                                          </div>

                                          <div className="md:col-span-3">
                                             <label className="block text-[8px] font-mono text-artisan-light/40 uppercase tracking-widest mb-1.5">
                                                City *
                                             </label>
                                             <input
                                                type="text"
                                                value={city}
                                                onChange={(e) => setCity(e.target.value)}
                                                placeholder="CHENNAI"
                                                required
                                                disabled
                                                className="w-full bg-artisan-dark border border-artisan-light/10 p-2.5 text-xs text-artisan-light font-mono uppercase tracking-wider focus:border-artisan-grey outline-none opacity-50 cursor-not-allowed rounded-xl"
                                             />
                                          </div>

                                          <div className="md:col-span-3">
                                             <label className="block text-[8px] font-mono text-artisan-light/40 uppercase tracking-widest mb-1.5">
                                                State *
                                             </label>
                                             <input
                                                type="text"
                                                value={stateName}
                                                onChange={(e) => setStateName(e.target.value)}
                                                placeholder="TAMIL NADU"
                                                required
                                                disabled
                                                className="w-full bg-artisan-dark border border-artisan-light/10 p-2.5 text-xs text-artisan-light font-mono uppercase tracking-wider focus:border-artisan-grey outline-none opacity-50 cursor-not-allowed rounded-xl"
                                             />
                                          </div>
                                       </div>

                                       <div className="flex justify-end gap-3 pt-4">
                                          {editingAddressId && (
                                             <button
                                                type="button"
                                                onClick={handleCancelEditAddress}
                                                className="bg-transparent border border-artisan-light/10 text-artisan-light hover:border-artisan-grey font-mono font-bold uppercase text-[9px] tracking-widest px-6 py-3 transition-colors rounded-full"
                                             >
                                                Cancel
                                             </button>
                                          )}
                                          <motion.button
                                             type="submit"
                                             disabled={addrLoading}
                                             className="bg-artisan-light text-artisan-dark font-mono font-bold uppercase text-[9px] tracking-widest px-6 py-3 disabled:opacity-50 flex-shrink-0 rounded-full border border-black cursor-pointer"
                                             initial={{ y: 0, boxShadow: "0 6px 0 0 #000000" }}
                                             whileHover={addrLoading ? {} : {
                                                y: -2,
                                                boxShadow: "0 8px 0 0 #000000",
                                                backgroundColor: "#eb5e28"
                                             }}
                                             whileTap={addrLoading ? {} : {
                                                y: 6,
                                                boxShadow: "0 0px 0 0 #000000"
                                             }}
                                             transition={{ type: "spring", stiffness: 600, damping: 18 }}
                                          >
                                             {addrLoading ? 'Saving...' : editingAddressId ? 'Save Changes' : 'Add Address'}
                                          </motion.button>
                                       </div>
                                    </form>
                                 </div>
                              )}
                           </motion.div>
                        )}

                        {activeTab === 'security' && (
                           <motion.div
                              key="tab-security"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{ duration: 0.2 }}
                              className="space-y-8"
                           >
                              {/* 2FA Settings Container */}
                              <div className="bg-artisan-light/[0.01] border border-artisan-light/5 p-6 md:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 rounded-2xl">
                                 <div className="space-y-1.5 max-w-md">
                                    <span className="text-[9px] font-mono text-artisan-light/40 uppercase tracking-[0.25em] block">
                                       Two-Factor Authentication
                                    </span>
                                    <h4 className="text-base font-display font-bold uppercase tracking-wider text-artisan-light">
                                       Secure Logins
                                    </h4>
                                    <p className="text-xs text-artisan-light/50 font-mono leading-relaxed uppercase tracking-wide">
                                       Require a code sent to your email to log in.
                                    </p>
                                 </div>
                                 <div className="flex flex-col items-start sm:items-end gap-2 flex-shrink-0">
                                    <span className={`inline-flex items-center gap-1.5 text-[8px] font-mono font-bold uppercase px-2 py-0.5 border rounded-full ${user.twoFactorEnabled
                                       ? 'border-green-500/20 bg-green-500/5 text-green-400'
                                       : 'border-artisan-light/10 bg-artisan-light/5 text-artisan-grey'
                                       }`}>
                                       <span className={`w-1.5 h-1.5 rounded-full ${user.twoFactorEnabled ? 'bg-green-500' : 'bg-artisan-grey'}`} />
                                       {user.twoFactorEnabled ? '2FA Active' : '2FA Inactive'}
                                    </span>
                                    <motion.button
                                       onClick={handleToggle2FA}
                                       disabled={twoFactorLoading}
                                       className={`w-full sm:w-auto px-5 py-2.5 text-[9px] font-mono font-bold uppercase tracking-widest border rounded-full cursor-pointer ${user.twoFactorEnabled
                                          ? 'border-red-500/30 bg-red-500/5 text-red-500'
                                          : 'bg-artisan-light text-artisan-dark border-black'
                                          }`}
                                       initial={{ y: 0, boxShadow: user.twoFactorEnabled ? "0 6px 0 0 rgba(239, 68, 68, 0.2)" : "0 6px 0 0 #000000" }}
                                       whileHover={twoFactorLoading ? {} : {
                                          y: -2,
                                          boxShadow: user.twoFactorEnabled ? "0 8px 0 0 rgba(239, 68, 68, 0.3)" : "0 8px 0 0 #000000",
                                          backgroundColor: user.twoFactorEnabled ? "rgba(239, 68, 68, 0.15)" : "#eb5e28"
                                       }}
                                       whileTap={twoFactorLoading ? {} : {
                                          y: 6,
                                          boxShadow: user.twoFactorEnabled ? "0 0px 0 0 rgba(239, 68, 68, 0.2)" : "0 0px 0 0 #000000"
                                       }}
                                       transition={{ type: "spring", stiffness: 600, damping: 18 }}
                                    >
                                       {twoFactorLoading ? 'Syncing...' : user.twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                                    </motion.button>
                                 </div>
                              </div>

                              {/* Password Change Form Container */}
                              {user.hasPassword === false ? (
                                 <div className="bg-artisan-light/[0.01] border border-artisan-light/5 p-6 md:p-8 space-y-4 rounded-2xl">
                                    <h4 className="text-sm font-display font-bold uppercase tracking-widest text-artisan-light flex items-center gap-2.5">
                                       <KeyRound className="w-4 h-4 text-artisan-grey" /> Password Management
                                    </h4>
                                    <div className="p-5 border border-artisan-light/10 bg-artisan-light/[0.02] rounded-xl flex items-start gap-4">
                                       <div className="w-10 h-10 rounded-full bg-artisan-light/5 flex items-center justify-center flex-shrink-0 text-artisan-grey">
                                          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                                             <path d="M12.24 10.285V13.4h6.887c-.648 2.41-2.519 4.13-5.136 4.13A5.76 5.76 0 0 1 8.2 11.77a5.76 5.76 0 0 1 5.79-5.77c1.47 0 2.8.53 3.82 1.5l2.42-2.42A9.13 9.13 0 0 0 13.99 3c-5.078 0-9.2 4.12-9.2 9.2s4.122 9.2 9.2 9.2c5.078 0 8.66-3.57 8.66-8.8 0-.58-.06-1.13-.17-1.63H12.24z" />
                                          </svg>
                                       </div>
                                       <div className="space-y-1">
                                          <p className="text-xs font-mono font-bold uppercase text-artisan-light">Logged in via Google</p>
                                          <p className="text-[10px] font-mono uppercase tracking-wider text-artisan-light/50 leading-relaxed">
                                             You have logged in via Google. Local password configuration is not required or applicable.
                                          </p>
                                       </div>
                                    </div>
                                 </div>
                              ) : (
                                 <div className="bg-artisan-light/[0.01] border border-artisan-light/5 p-6 md:p-8 space-y-6 rounded-2xl">
                                    <h4 className="text-sm font-display font-bold uppercase tracking-widest text-artisan-light flex items-center gap-2.5">
                                       <KeyRound className="w-4 h-4 text-artisan-grey" /> Change Password
                                    </h4>

                                    <form onSubmit={handleChangePassword} className="space-y-6">
                                       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                          <div className="group relative border-b border-artisan-light/10 focus-within:border-artisan-grey transition-all duration-500 pb-2">
                                             <label className="block text-[8px] font-mono text-artisan-light/35 uppercase tracking-[0.2em] mb-1.5 group-focus-within:text-artisan-grey transition-colors">
                                                Current Password
                                             </label>
                                             <div className="flex items-center gap-3">
                                                <Lock className="w-3.5 h-3.5 text-artisan-light/20 group-focus-within:text-artisan-grey" />
                                                <input
                                                   type="password"
                                                   value={currentPassword}
                                                   onChange={(e) => setCurrentPassword(e.target.value)}
                                                   required
                                                   className="w-full bg-transparent outline-none text-xs font-mono text-artisan-light"
                                                   placeholder="••••••••"
                                                />
                                             </div>
                                          </div>

                                          <div className="group relative border-b border-artisan-light/10 focus-within:border-artisan-grey transition-all duration-500 pb-2">
                                             <label className="block text-[8px] font-mono text-artisan-light/35 uppercase tracking-[0.2em] mb-1.5 group-focus-within:text-artisan-grey transition-colors">
                                                New Password
                                             </label>
                                             <div className="flex items-center gap-3">
                                                <Lock className="w-3.5 h-3.5 text-artisan-light/20 group-focus-within:text-artisan-grey" />
                                                <input
                                                   type="password"
                                                   value={newPassword}
                                                   onChange={(e) => setNewPassword(e.target.value)}
                                                   required
                                                   className="w-full bg-transparent outline-none text-xs font-mono text-artisan-light"
                                                   placeholder="••••••••"
                                                />
                                             </div>
                                          </div>

                                          <div className="group relative border-b border-artisan-light/10 focus-within:border-artisan-grey transition-all duration-500 pb-2">
                                             <label className="block text-[8px] font-mono text-artisan-light/35 uppercase tracking-[0.2em] mb-1.5 group-focus-within:text-artisan-grey transition-colors">
                                                Confirm New Password
                                             </label>
                                             <div className="flex items-center gap-3">
                                                <Lock className="w-3.5 h-3.5 text-artisan-light/20 group-focus-within:text-artisan-grey" />
                                                <input
                                                   type="password"
                                                   value={confirmPassword}
                                                   onChange={(e) => setConfirmPassword(e.target.value)}
                                                   required
                                                   className="w-full bg-transparent outline-none text-xs font-mono text-artisan-light"
                                                   placeholder="••••••••"
                                                />
                                             </div>
                                          </div>
                                       </div>

                                       <div className="flex justify-end pt-2">
                                          <motion.button
                                             type="submit"
                                             disabled={passLoading}
                                             className="bg-artisan-light text-artisan-dark font-mono font-bold uppercase text-[9px] tracking-widest px-6 py-3 disabled:opacity-50 rounded-full border border-black cursor-pointer"
                                             initial={{ y: 0, boxShadow: "0 6px 0 0 #000000" }}
                                             whileHover={passLoading ? {} : {
                                                y: -2,
                                                boxShadow: "0 8px 0 0 #000000",
                                                backgroundColor: "#eb5e28"
                                             }}
                                             whileTap={passLoading ? {} : {
                                                y: 6,
                                                boxShadow: "0 0px 0 0 #000000"
                                             }}
                                             transition={{ type: "spring", stiffness: 600, damping: 18 }}
                                          >
                                             {passLoading ? 'Saving...' : 'Change Password'}
                                          </motion.button>
                                       </div>
                                    </form>
                                 </div>
                              )}
                           </motion.div>
                        )}
                     </AnimatePresence>
                  </div>
               </motion.div>

            </div>

            {/* Quick Navigation and Links Footer */}
            {user.role !== 'admin' && (
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-8 border-t border-artisan-light/5">
                  <MotionLink
                     to="/history"
                     className="py-4 border-2 border-artisan-light text-artisan-light font-mono font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 rounded-full cursor-pointer"
                     initial={{ y: 0, boxShadow: "0 6px 0 0 #252422" }}
                     whileHover={{
                        y: -2,
                        boxShadow: "0 8px 0 0 #252422",
                        backgroundColor: "rgba(37, 36, 34, 0.04)"
                     }}
                     whileTap={{
                        y: 6,
                        boxShadow: "0 0px 0 0 #252422"
                     }}
                     transition={{ type: "spring", stiffness: 600, damping: 18 }}
                  >
                     <History className="w-4 h-4" />
                     Order History
                  </MotionLink>
                  <MotionLink
                     to="/allproduct"
                     className="py-4 bg-artisan-light text-artisan-dark font-mono font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 rounded-full border border-black cursor-pointer"
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
                     <ShoppingBag className="w-4 h-4" />
                     Browse Products
                  </MotionLink>
               </div>
            )}

         </div>
      </div>
   )
}
