import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import * as LucideIcons from 'lucide-react'
import {
   ArrowLeft,
   Star,
   MessageSquare,
   ArrowUpRight,
   Plus,
   Minus,
   UserCheck,
   ChevronLeft,
   ChevronRight,
   ShieldCheck,
   Award,
   Info,
   MapPin,
   Heart,
   Loader2,
   ShoppingCart,
   Phone,
   Truck,
   Check,
   Share2,
   X
} from 'lucide-react'
import api from '../services/api'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'
import SEO from '../components/SEO'

const getYouTubeEmbedUrl = (url) => {
   if (!url) return '';
   const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
   const match = url.match(regExp);
   return (match && match[2].length === 11)
      ? `https://www.youtube.com/embed/${match[2]}`
      : url;
};

export default function ProductDetail() {
   const { id } = useParams()
   const { addToast } = useToast()
   const { user, setUser, toggleWishlist: contextToggleWishlist } = useAuth()
   const navigate = useNavigate()
   const [tool, setTool] = useState(null)
   const [loading, setLoading] = useState(true)
   const [badgesData, setBadgesData] = useState({ sectionVisible: true, badges: [] })
   const [loadingBadges, setLoadingBadges] = useState(true)

   useEffect(() => {
      const fetchBadges = async () => {
         try {
            const res = await api.get('/content/badges')
            setBadgesData(res.data.data || { sectionVisible: true, badges: [] })
         } catch (err) {
            console.error('Failed to fetch quality badges', err)
         } finally {
            setLoadingBadges(false)
         }
      }
      fetchBadges()
   }, [])
   const [activeImage, setActiveImage] = useState(0)
   const [quantity, setQuantity] = useState(1)
   const [similarGear, setSimilarGear] = useState([])
   const [isWishlisted, setIsWishlisted] = useState(false)
   const [reviews, setReviews] = useState([])
   const [canReview, setCanReview] = useState(false)
   const [submittingReview, setSubmittingReview] = useState(false)
   const [rating, setRating] = useState(5)
   const [reviewText, setReviewText] = useState('')
   const [reviewImages, setReviewImages] = useState([])
   const [improvementReason, setImprovementReason] = useState('')

   // Pincode check states
   const [pincodeInput, setPincodeInput] = useState(() => localStorage.getItem('checked_pincode') || '')
   const [checkingPincode, setCheckingPincode] = useState(false)
   const [pincodeResult, setPincodeResult] = useState(null)
   const [pincodeError, setPincodeError] = useState('')

   const checkPincodeServiceability = async (pinCodeToVerify) => {
      const pin = (pinCodeToVerify || '').trim()
      if (!pin) return

      if (!/^\d{6}$/.test(pin)) {
         setPincodeError('Pincode must be exactly 6 digits')
         setPincodeResult(null)
         return
      }

      setCheckingPincode(true)
      setPincodeError('')

      try {
         const response = await fetch(`https://api.postalpincode.in/pincode/${pin}`)
         if (!response.ok) throw new Error('API request failed')
         const data = await response.json()

         if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice && data[0].PostOffice.length > 0) {
            const postOffice = data[0].PostOffice[0]
            const city = postOffice.District || ''
            const state = postOffice.State || ''

            const isLocal = state.toLowerCase().includes('tamil nadu')
            const isMetropolitan = ['maharashtra', 'karnataka', 'delhi', 'telangana', 'west bengal', 'gujarat'].some(
               s => state.toLowerCase().includes(s)
            )

            const days = isLocal ? 2 : (isMetropolitan ? 3 : 5)
            const deliveryDate = new Date()
            deliveryDate.setDate(deliveryDate.getDate() + days)

            const formattedDate = deliveryDate.toLocaleDateString('en-IN', {
               weekday: 'long',
               month: 'short',
               day: 'numeric'
            })

            const result = {
               city,
               state,
               deliveryDays: days,
               deliveryDate: formattedDate,
               isCodAvailable: true,
               freeShippingEligible: true
            }

            setPincodeResult(result)
            localStorage.setItem('checked_pincode', pin)
         } else {
            setPincodeError('Invalid or unserviceable pincode')
            setPincodeResult(null)
         }
      } catch (err) {
         console.error('Pincode verification error:', err)
         const deliveryDate = new Date()
         deliveryDate.setDate(deliveryDate.getDate() + 4)
         const formattedDate = deliveryDate.toLocaleDateString('en-IN', {
            weekday: 'long',
            month: 'short',
            day: 'numeric'
         })
         setPincodeResult({
            city: 'Your Location',
            state: '',
            deliveryDays: 4,
            deliveryDate: formattedDate,
            isCodAvailable: true,
            freeShippingEligible: true
         })
         localStorage.setItem('checked_pincode', pin)
      } finally {
         setCheckingPincode(false)
      }
   }

   useEffect(() => {
      const savedPin = localStorage.getItem('checked_pincode')
      if (savedPin && /^\d{6}$/.test(savedPin)) {
         setPincodeInput(savedPin)
         checkPincodeServiceability(savedPin)
      } else {
         setPincodeInput('')
         setPincodeResult(null)
         setPincodeError('')
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [id])

   useEffect(() => {
      const fetchToolDetails = async () => {
         try {
            setLoading(true)
            const res = await api.get(`/listings/${id}`)
            const toolData = res.data.data;
            setTool(toolData)

            // Check if tool is in user's wishlist
            if (user && user.wishlist) {
               setIsWishlisted(user.wishlist.includes(id))
            }

            // Fetch product reviews
            try {
               const reviewsRes = await api.get(`/listings/${id}/reviews`)
               setReviews(reviewsRes.data.data || [])
            } catch (err) {
               console.error('Failed to fetch product reviews', err)
            }

            // Check review eligibility
            if (user) {
               try {
                  const eligibilityRes = await api.get(`/listings/${id}/can-review`)
                  setCanReview(eligibilityRes.data.data?.canReview || false)
               } catch (err) {
                  console.error('Failed to check review eligibility', err)
               }
            }

            // Fetch similar products in the same category
            try {
               const similarRes = await api.get('/listings', {
                  params: { category: toolData.category, limit: 3 }
               })
               let fetchedSimilar = similarRes.data.data || []
               fetchedSimilar = fetchedSimilar.filter(t => t._id !== id)
               setSimilarGear(fetchedSimilar.slice(0, 3))
            } catch (err) {
               console.error('Failed to fetch similar products', err)
               setSimilarGear([])
            }

         } catch (err) {
            addToast('Failed to load product details', 'error')
            navigate('/allproduct')
         } finally {
            setLoading(false)
         }
      }

      fetchToolDetails()
      window.scrollTo(0, 0)
   }, [id, addToast, navigate, user])

   // Auto-cycle images every 4 seconds
   useEffect(() => {
      if (!tool) return
      const images = tool.images?.length ? tool.images : (tool.image ? [tool.image] : [])
      if (images.length <= 1) return

      const interval = setInterval(() => {
         setActiveImage(prev => (prev + 1) % images.length)
      }, 4000)

      return () => clearInterval(interval)
   }, [activeImage, tool])

   const handleShare = async () => {
      if (!tool) return
      const shareUrl = window.location.href
      const shareTitle = tool.name || tool.title
      const sharePrice = `₹${(tool.price !== undefined ? tool.price : tool.pricePerDay)?.toLocaleString()}`
      const shareDesc = tool.desc || tool.description || ''
      const shareText = `Check out this product on STAT Surgical Supplies:\n\n*${shareTitle}*\nPrice: ${sharePrice}\nDescription: ${shareDesc.slice(0, 100)}${shareDesc.length > 100 ? '...' : ''}\nLink: ${shareUrl}`

      if (navigator.share) {
         try {
            await navigator.share({
               title: shareTitle,
               text: shareText,
               url: shareUrl,
            })
            addToast('Shared successfully!', 'success')
         } catch (err) {
            if (err.name !== 'AbortError') {
               console.error('Error sharing:', err)
               copyLinkToClipboard(shareUrl)
            }
         }
      } else {
         copyLinkToClipboard(shareUrl)
      }
   }

   const copyLinkToClipboard = (url) => {
      navigator.clipboard.writeText(url)
         .then(() => {
            addToast('Product link copied to clipboard!', 'success')
         })
         .catch((err) => {
            console.error('Failed to copy link: ', err)
            addToast('Failed to copy link to clipboard', 'error')
         })
   }

   const toggleWishlist = async () => {
      if (!user) {
         addToast('Please login to save items', 'info')
         localStorage.setItem('pending_wishlist_action', JSON.stringify({ productId: id }))
         localStorage.setItem('auth_redirect', `/product/${id}`)
         navigate('/login')
         return
      }

      if (user.role === 'admin') {
         addToast('Administrators are not permitted to save items in the wishlist', 'error')
         return
      }

      try {
         await contextToggleWishlist(id)
         addToast(!isWishlisted ? 'Added to wishlist' : 'Removed from wishlist', 'success')
      } catch (err) {
         addToast('Failed to update wishlist', 'error')
      }
   }

   const handleAddToCart = async () => {
      if (!user) {
         addToast('Please login to add items to cart', 'info')
         localStorage.setItem('pending_cart_action', JSON.stringify({ productId: tool._id, quantity }))
         localStorage.setItem('auth_redirect', `/product/${tool._id}`)
         navigate('/login')
         return
      }

      if (user.role === 'admin') {
         addToast('Administrators are not permitted to add items to cart', 'error')
         return
      }

      const sessionId = sessionStorage.getItem('analytics_session_id') || `sess_${Date.now()}`;
      const itemPrice = tool.price !== undefined ? tool.price : tool.pricePerDay;
      try {
         if (user.role !== 'admin') {
            await api.post('/analytics/event', {
               sessionId,
               eventName: 'add_to_cart',
               properties: {
                  productId: tool._id,
                  name: tool.name || tool.title,
                  price: itemPrice,
                  quantity
               }
            });
         }
      } catch (err) {
         console.error('Failed to log add_to_cart event', err);
      }

      try {
         const res = await api.post('/auth/cart', { productId: tool._id, quantity })
         setUser(prev => ({
            ...prev,
            cart: res.data.data
         }))
         addToast(`Added ${quantity} x ${tool.name || tool.title} to cart`, 'success')
      } catch (err) {
         console.error("Failed to sync cart to database", err)
         addToast('Failed to add item to cart', 'error')
      }
   }

   const handleImageChange = (e) => {
      const files = Array.from(e.target.files)
      files.forEach(file => {
         const reader = new FileReader()
         reader.onloadend = () => {
            setReviewImages(prev => [...prev, reader.result])
         }
         reader.readAsDataURL(file)
      })
   }

   const removeReviewImage = (index) => {
      setReviewImages(prev => prev.filter((_, i) => i !== index))
   }

   const handleReviewSubmit = async (e) => {
      e.preventDefault()
      if (reviewText.length > 500) {
         addToast('Review cannot exceed 500 characters', 'error')
         return
      }
      try {
         setSubmittingReview(true)
         await api.post(`/listings/${id}/reviews`, {
            rating,
            text: reviewText,
            images: reviewImages,
            improvementReason: rating < 5 ? improvementReason : undefined
         })
         addToast('Review submitted successfully!', 'success')
         setReviewText('')
         setRating(5)
         setReviewImages([])
         setImprovementReason('')
         setCanReview(false)

         // Refresh lists and details
         const reviewsRes = await api.get(`/listings/${id}/reviews`)
         setReviews(reviewsRes.data.data || [])

         const detailsRes = await api.get(`/listings/${id}`)
         setTool(detailsRes.data.data)
      } catch (err) {
         addToast(err.response?.data?.message || 'Failed to submit review', 'error')
      } finally {
         setSubmittingReview(false)
      }
   }

   if (loading) return (
      <div className="min-h-screen bg-artisan-dark flex flex-col items-center justify-center space-y-4">
         <Loader2 className="w-12 h-12 text-artisan-grey animate-spin" />
         <span className="text-[10px] font-mono text-artisan-light/20 uppercase tracking-widest">Accessing product records...</span>
      </div>
   )

   if (!tool) return null

   const displayTitle = tool.name || tool.title
   const displayDesc = tool.desc || tool.description
   const displayPrice = tool.price !== undefined ? tool.price : tool.pricePerDay
   const displayImages = tool.images?.length ? tool.images : (tool.image ? [tool.image] : [])

   const specs = [
      { label: 'Condition', value: tool.condition || 'Excellent' },
      { label: 'Category', value: tool.category },
   ]

   if (Array.isArray(tool.specifications)) {
      tool.specifications.forEach(spec => {
         if (spec.type === 'key_value' && spec.label && spec.value) {
            specs.push({ label: spec.label, value: spec.value })
         }
      })
   }

   return (
      <div className="min-h-screen bg-artisan-dark text-artisan-light font-body bg-noise selection:bg-artisan-grey selection:text-artisan-dark pt-28 pb-20">
         <SEO
            title={displayTitle}
            description={displayDesc}
            keywords={[tool.category, displayTitle, 'surgical equipment', 'medical instruments', tool.sku]}
            ogType="product"
            ogImage={displayImages[0]}
            canonicalPath={`/product/${tool._id}`}
         />
         <div className="container-custom max-w-5xl mx-auto space-y-10">

            {/* Top Breadcrumb/Back link */}
            <div className="flex justify-between items-center pb-4 border-b border-artisan-light/5">
               <Link to="/allproduct" className="group flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-artisan-light hover:text-artisan-grey transition-colors">
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  Back to Catalog
               </Link>
               <span className="text-[10px] font-mono text-artisan-light/50 uppercase tracking-widest">
                  Product ID: {tool._id ? tool._id.slice(-6).toUpperCase() : 'N/A'}
               </span>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 items-start">

               {/* Column 1: Gallery */}
               <div className={displayImages.length > 1 ? "flex flex-col-reverse md:grid md:grid-cols-[92px_1fr] gap-4" : "space-y-4"}>
                  {/* Thumbnail Selector (on the left for desktop, bottom for mobile) */}
                  {displayImages.length > 1 && (
                     <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto max-h-[350px] md:max-h-[400px] scrollbar-hide justify-start py-1 px-1">
                        {displayImages.map((img, i) => (
                           <button
                              key={i}
                              onClick={() => setActiveImage(i)}
                              className={`relative w-16 h-16 md:w-20 md:h-20 shrink-0 p-1 bg-artisan-dark/40 border transition-all duration-300 group overflow-hidden ${activeImage === i
                                 ? 'border-2 border-[#eb5e28] bg-artisan-dark/60 shadow-[0_0_12px_rgba(235,94,40,0.15)]'
                                 : 'border border-artisan-light/10 hover:border-artisan-light/30 hover:bg-artisan-dark/65'
                                 }`}
                           >
                              {/* Glowing bottom border indicator */}
                              <div className={`absolute bottom-0 left-0 w-full h-[2px] transition-all duration-300 ${activeImage === i ? 'bg-[#eb5e28] scale-x-100' : 'bg-transparent scale-x-0 group-hover:scale-x-50 group-hover:bg-artisan-light/30'
                                 }`} />

                              {/* Inner Container for white-backed images */}
                              <div className="w-full h-full bg-white p-1 flex items-center justify-center relative overflow-hidden transition-all duration-300 group-hover:scale-[0.98]">
                                 <img
                                    src={img}
                                    className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
                                    alt={`Thumbnail ${i + 1}`}
                                 />
                              </div>

                              {/* Corner Badge */}
                              <div className="absolute top-1 right-1 px-[3px] py-[1px] bg-artisan-dark/80 border border-artisan-light/10 text-[8px] font-mono text-artisan-light/60 scale-75 group-hover:text-artisan-light transition-colors pointer-events-none">
                                 0{i + 1}
                              </div>
                           </button>
                        ))}
                     </div>
                  )}

                  {/* Main Image View */}
                  <div className="relative aspect-[4/3] bg-artisan-dark/30 border border-artisan-light/10 p-2 overflow-hidden flex items-center justify-center group/main">
                     {/* High-Tech Technical Grid / Blueprint Background */}
                     <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

                     {/* Blueprint crosshair in the center */}
                     <div className="absolute w-6 h-6 border-t border-b border-artisan-light/5 pointer-events-none" />
                     <div className="absolute w-6 h-6 border-l border-r border-artisan-light/5 pointer-events-none" />

                     {/* High-Tech Corner Crosshairs */}
                     <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-artisan-grey/40 pointer-events-none group-hover/main:border-artisan-grey transition-colors duration-500" />
                     <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-artisan-grey/40 pointer-events-none group-hover/main:border-artisan-grey transition-colors duration-500" />
                     <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-artisan-grey/40 pointer-events-none group-hover/main:border-artisan-grey transition-colors duration-500" />
                     <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-artisan-grey/40 pointer-events-none group-hover/main:border-artisan-grey transition-colors duration-500" />

                     {/* Technical HUD Overlay text */}
                     <div className="absolute top-3 left-1/2 -translate-x-1/2 text-[9px] font-mono text-artisan-light/20 tracking-[0.25em] pointer-events-none uppercase">
                        [ VIEWPORT // 0{activeImage + 1} / 0{displayImages.length} ]
                     </div>
                     <div className="absolute bottom-3 left-6 text-[8px] font-mono text-artisan-light/20 tracking-wider pointer-events-none uppercase hidden sm:block">
                        SYS STATUS: ACTIVE
                     </div>
                     <div className="absolute bottom-3 right-6 text-[8px] font-mono text-artisan-light/20 tracking-wider pointer-events-none uppercase hidden sm:block">
                        ZOOM: 100%
                     </div>

                     {/* Inner Image Frame */}
                     <div className="w-full h-full bg-white border border-artisan-light/5 p-4 flex items-center justify-center relative shadow-2xl shadow-black/50 overflow-hidden">
                        <AnimatePresence mode="wait">
                           <motion.img
                              key={activeImage}
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 1.05 }}
                              transition={{ duration: 0.25, ease: 'easeInOut' }}
                              src={displayImages[activeImage] || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=1200'}
                              className="max-w-full max-h-full object-contain"
                              alt={displayTitle}
                           />
                        </AnimatePresence>
                     </div>

                     {/* Gallery Controls */}
                     {displayImages.length > 1 && (
                        <>
                           <button
                              onClick={() => setActiveImage(prev => (prev - 1 + displayImages.length) % displayImages.length)}
                              className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 bg-artisan-dark/90 hover:bg-artisan-grey border border-artisan-light/10 hover:border-artisan-grey hover:text-artisan-dark flex items-center justify-center text-artisan-light hover:-translate-x-0.5 transition-all duration-300 z-10 shadow-lg"
                           >
                              <ChevronLeft className="w-5 h-5" />
                           </button>
                           <button
                              onClick={() => setActiveImage(prev => (prev + 1) % displayImages.length)}
                              className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 bg-artisan-dark/90 hover:bg-artisan-grey border border-artisan-light/10 hover:border-artisan-grey hover:text-artisan-dark flex items-center justify-center text-artisan-light hover:translate-x-0.5 transition-all duration-300 z-10 shadow-lg"
                           >
                              <ChevronRight className="w-5 h-5" />
                           </button>
                        </>
                     )}
                  </div>
               </div>

               {/* Column 2: Information & Actions */}
               <div className="space-y-6">
                  {/* Category, Location, Availability */}
                  <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono font-bold uppercase tracking-wider">
                     <span className="text-artisan-grey">{tool.category}</span>
                     <span className="w-1 h-1 bg-artisan-light/20 rounded-full" />
                     {/* <span className="text-green-600">
                        {tool.availability || 'In Stock (20)'}
                     </span> */}
                  </div>

                  {/* Title & Price */}
                  <div className="space-y-2">
                     <h1 className="text-3xl lg:text-4xl font-display font-extrabold uppercase tracking-tight leading-tight text-artisan-light">
                        {displayTitle}
                     </h1>
                     <div className="flex flex-col gap-1">
                        <div className="flex items-baseline gap-2">
                           {tool.mrp !== undefined && tool.mrp > displayPrice && (
                              <span className="text-sm font-display font-medium line-through text-artisan-light/40">
                                 ₹{tool.mrp?.toLocaleString()}
                              </span>
                           )}
                           <span className="text-2xl font-display font-black text-artisan-light">
                              ₹{displayPrice?.toLocaleString()}
                           </span>
                        </div>
                        <p className="text-[10px] font-mono text-artisan-grey uppercase tracking-widest mt-1">
                           🤝 Ready to negotiate and get lower prices?
                        </p>
                     </div>
                  </div>


                  {/* Description */}
                  <p className="text-sm text-artisan-light/75 leading-relaxed font-body">
                     {displayDesc}
                  </p>

                  {/* Quantity selector */}
                  <div className="flex items-center justify-between border-y border-artisan-light/10 py-4">
                     <span className="text-xs font-mono font-bold uppercase tracking-wider text-artisan-light/60">Quantity</span>
                     <div className="flex items-center gap-4">
                        <div className="flex border border-artisan-light/10 p-1 bg-artisan-light/5">
                           <button
                              onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                              className="w-8 h-8 flex items-center justify-center hover:bg-artisan-light/10 text-artisan-light transition-colors"
                           >
                              <Minus className="w-3.5 h-3.5" />
                           </button>
                           <div className="w-10 h-8 flex items-center justify-center font-mono font-bold text-sm">
                              {quantity}
                           </div>
                           <button
                              onClick={() => setQuantity(quantity + 1)}
                              className="w-8 h-8 flex items-center justify-center hover:bg-artisan-light/10 text-artisan-light transition-colors"
                           >
                              <Plus className="w-3.5 h-3.5" />
                           </button>
                        </div>
                        <span className="text-xs font-mono text-artisan-light/40 italic">
                           Total: ₹{(displayPrice * quantity).toLocaleString()}
                        </span>
                     </div>
                  </div>

                  {/* Actions Block */}
                  <div className="space-y-3">
                     <div className="flex gap-3">
                        <button
                           onClick={handleAddToCart}
                           className="flex-1 py-4 bg-artisan-grey text-artisan-dark font-display font-extrabold uppercase tracking-widest text-xs hover:bg-artisan-light hover:text-artisan-dark transition-all flex items-center justify-center gap-2"
                        >
                           <ShoppingCart className="w-4 h-4" />
                           Add to Cart
                        </button>
                        <button
                           onClick={toggleWishlist}
                           className={`px-4 py-4 border border-artisan-light/10 hover:border-artisan-grey transition-all flex items-center justify-center ${isWishlisted ? 'bg-red-500/10 border-red-500 text-red-500' : 'text-artisan-light hover:bg-artisan-light/5'}`}
                        >
                           <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
                        </button>
                        <button
                           onClick={handleShare}
                           className="px-4 py-4 border border-artisan-light/10 hover:border-artisan-grey text-artisan-light hover:bg-artisan-light/5 transition-all flex items-center justify-center gap-2"
                           title="Share Product"
                        >
                           <Share2 className="w-4 h-4" />
                           <span className="hidden sm:inline text-[10px] font-mono font-bold uppercase tracking-wider">Share</span>
                        </button>
                     </div>
                  </div>

               </div>
            </div>

            {/* Quality Certifications Badges Row */}
            {!loadingBadges && badgesData.sectionVisible && badgesData.badges && badgesData.badges.length > 0 && (
               <div className="border border-artisan-light/10 bg-artisan-light/[0.01] p-6 rounded-xl">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                     {badgesData.badges.map((badge) => {
                        const IconComponent = LucideIcons[badge.icon] || LucideIcons.ShieldCheck;
                        return (
                           <div key={badge._id} className="flex items-center gap-3 p-3 bg-artisan-light/[0.005] border border-artisan-light/5 rounded-xl">
                              <IconComponent className="w-5 h-5 text-green-500 shrink-0" />
                              <div>
                                 <span className="text-[8px] font-mono text-artisan-light/35 uppercase block tracking-wider">{badge.title}</span>
                                 <span className="text-[9px] font-mono font-bold text-artisan-light uppercase">{badge.description}</span>
                              </div>
                           </div>
                        );
                     })}
                  </div>
               </div>
            )}

            {/* PINCODE SERVICEABILITY CHECKER ROW */}
            <div className="border border-artisan-light/10 bg-artisan-light/[0.01] p-6 rounded-xl space-y-4">
               <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                     <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-artisan-grey flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-artisan-grey" />
                        Delivery Estimation
                     </h3>
                     <p className="text-[10px] font-mono text-artisan-light/50 uppercase tracking-widest">
                        Enter your pincode to check the date of delivery & service availability
                     </p>
                  </div>
                  <div className="flex items-center gap-2 max-w-xs w-full sm:w-auto">
                     <div className="relative flex-1 sm:w-36 flex items-center">
                        <input
                           type="text"
                           maxLength={6}
                           placeholder="ENTER PINCODE"
                           value={pincodeInput}
                           onChange={(e) => {
                              const val = e.target.value.replace(/\D/g, '')
                              setPincodeInput(val)
                              if (val.length === 6) {
                                 checkPincodeServiceability(val)
                              } else {
                                 setPincodeResult(null)
                                 setPincodeError('')
                                 if (val.length === 0) {
                                    localStorage.removeItem('checked_pincode')
                                 }
                              }
                           }}
                           className="w-full bg-artisan-light/5 border border-artisan-light/10 pl-4 pr-8 py-2 text-xs font-mono text-artisan-light uppercase tracking-widest outline-none focus:border-artisan-grey transition-colors placeholder:text-artisan-light/20 rounded-xl"
                        />
                        {pincodeInput && (
                           <button
                              onClick={() => {
                                 setPincodeInput('')
                                 setPincodeResult(null)
                                 setPincodeError('')
                                 localStorage.removeItem('checked_pincode')
                              }}
                              className="absolute right-3 text-artisan-light/40 hover:text-artisan-light transition-colors flex items-center justify-center p-0.5 cursor-pointer"
                              title="Clear Pincode"
                           >
                              <X className="w-3.5 h-3.5" />
                           </button>
                        )}
                     </div>
                     <button
                        onClick={() => checkPincodeServiceability(pincodeInput)}
                        disabled={checkingPincode}
                        className="px-5 py-2 bg-artisan-light text-artisan-dark hover:bg-artisan-grey text-[9px] font-mono font-bold uppercase tracking-widest transition-all rounded-full flex items-center gap-2 shrink-0 disabled:opacity-50"
                     >
                        {checkingPincode ? (
                           <>
                              <Loader2 className="w-3 h-3 animate-spin" />
                              CHECKING
                           </>
                        ) : (
                           'CHECK'
                        )}
                     </button>
                  </div>
               </div>

               {pincodeError && (
                  <p className="text-[10px] font-mono text-red-500 uppercase tracking-wider">
                     {pincodeError}
                  </p>
               )}

               <AnimatePresence mode="wait">
                  {pincodeResult && (
                     <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="pt-4 border-t border-artisan-light/5 grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-[10px]"
                     >
                        <div className="flex items-center gap-3 p-3 bg-artisan-light/[0.005] border border-artisan-light/5 rounded-xl">
                           <div className="w-7 h-7 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center border border-green-500/20 shrink-0">
                              <Truck className="w-3.5 h-3.5 text-green-500" />
                           </div>
                           <div>
                              <span className="text-artisan-light/50 uppercase block text-[8px] tracking-wider">Estimated Delivery</span>
                              <span className="font-bold text-artisan-light uppercase">{pincodeResult.deliveryDate}</span>
                           </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-artisan-light/[0.005] border border-artisan-light/5 rounded-xl">
                           <div className="w-7 h-7 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center border border-green-500/20 shrink-0">
                              <UserCheck className="w-3.5 h-3.5 text-green-500" />
                           </div>
                           <div>
                              <span className="text-artisan-light/50 uppercase block text-[8px] tracking-wider">Payment Method</span>
                              <span className="font-bold text-artisan-light uppercase">Online Payment</span>
                           </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-artisan-light/[0.005] border border-artisan-light/5 rounded-xl">
                           <div className="w-7 h-7 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center border border-green-500/20 shrink-0">
                              <MapPin className="w-3.5 h-3.5 text-green-500" />
                           </div>
                           <div>
                              <span className="text-artisan-light/50 uppercase block text-[8px] tracking-wider">Region Checked</span>
                              <span className="font-bold text-artisan-light uppercase">{pincodeResult.city}{pincodeResult.state ? `, ${pincodeResult.state}` : ''}</span>
                           </div>
                        </div>
                     </motion.div>
                  )}
               </AnimatePresence>
            </div>

            {/* Basic Specifications Row */}
            {specs.length > 0 && (
               <div className="border-t border-artisan-light/10 pt-12 space-y-6">
                  <div className="max-w-xl space-y-2">
                     <h2 className="text-xs font-mono font-bold uppercase tracking-[0.4em] text-artisan-grey">Specifications</h2>
                     <p className="text-[10px] font-mono text-artisan-light/50 uppercase tracking-widest leading-relaxed">
                        Technical measurements, standards, and product data.
                     </p>
                  </div>
                  <div className="border border-artisan-light/10 bg-artisan-light/[0.01] p-6 rounded-xl">
                     <ul className="space-y-3 font-mono text-xs text-artisan-light leading-relaxed">
                        {specs.map((spec, i) => (
                           <li key={i} className="flex items-start gap-2">
                              <span className="text-artisan-grey mt-0.5">•</span>
                              <div className="flex flex-col sm:flex-row sm:gap-2 uppercase tracking-wide">
                                 <strong className="text-artisan-light/50">{spec.label}:</strong>
                                 <span className="text-artisan-light">{spec.value}</span>
                              </div>
                           </li>
                        ))}
                     </ul>
                  </div>
               </div>
            )}

            {/* Clinical Product Dossier (Rich Specifications) */}
            {Array.isArray(tool.specifications) && tool.specifications.some(s => s.type !== 'key_value') && (
               <div className="border-t border-artisan-light/10 pt-12 space-y-8">
                  <div className="max-w-xl space-y-2">
                     <h2 className="text-xs font-mono font-bold uppercase tracking-[0.4em] text-artisan-grey">Clinical Product Dossier</h2>
                     <p className="text-[10px] font-mono text-artisan-light/50 uppercase tracking-widest leading-relaxed">
                        Certified clinical specifications, documentation, and operational resources.
                     </p>
                  </div>

                  <div className="space-y-8 max-w-3xl">
                     {tool.specifications.map((spec, idx) => {
                        if (spec.type === 'title_para' && (spec.label || spec.value)) {
                           return (
                              <div key={idx} className="space-y-2 border-l border-artisan-grey/20 pl-4 py-1">
                                 {spec.label && (
                                    <h4 className="text-sm font-mono font-bold uppercase tracking-wider text-artisan-light">{spec.label}</h4>
                                 )}
                                 {spec.value && (
                                    <p className="text-xs font-mono text-artisan-light/60 uppercase tracking-wide leading-relaxed whitespace-pre-line">{spec.value}</p>
                                 )}
                              </div>
                           )
                        }
                        if (spec.type === 'image' && spec.value) {
                           let specImages = [];
                           if (spec.value.startsWith('[')) {
                              try {
                                 specImages = JSON.parse(spec.value);
                              } catch (e) {
                                 specImages = [spec.value];
                              }
                           } else {
                              specImages = spec.value.split(',').map(s => s.trim()).filter(Boolean);
                           }

                           return (
                              <div key={idx} className="border border-artisan-light/10 bg-artisan-light/[0.01] p-4 space-y-3 max-w-2xl">
                                 <div className={`grid gap-3 ${specImages.length > 1 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
                                    {specImages.map((url, i) => (
                                       <div key={i} className="aspect-[16/9] bg-white overflow-hidden flex items-center justify-center p-2 border border-artisan-light/5">
                                          <img src={url} alt={`${spec.label || "Product spec detail"} ${i + 1}`} className="max-h-full max-w-full object-contain grayscale hover:grayscale-0 transition-all duration-300" />
                                       </div>
                                    ))}
                                 </div>
                                 {spec.label && (
                                    <p className="text-[9px] font-mono text-artisan-light/40 uppercase tracking-widest">{spec.label}</p>
                                 )}
                              </div>
                           )
                        }
                        if (spec.type === 'video' && spec.value) {
                           const embedUrl = getYouTubeEmbedUrl(spec.value);
                           const isYoutube = embedUrl.includes('youtube.com/embed');
                           return (
                              <div key={idx} className="border border-artisan-light/10 bg-artisan-light/[0.01] p-4 space-y-3 max-w-xl">
                                 {isYoutube ? (
                                    <div className="aspect-[16/9] bg-black">
                                       <iframe
                                          src={embedUrl}
                                          title={spec.label || "Operational Video Guide"}
                                          className="w-full h-full border-0 grayscale hover:grayscale-0 transition-all duration-500"
                                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                          allowFullScreen
                                       />
                                    </div>
                                 ) : (
                                    <div className="p-6 bg-artisan-light/5 border border-artisan-light/10 text-center space-y-3">
                                       <span className="text-[9px] font-mono text-artisan-light/40 uppercase tracking-widest block">Operational Video Training</span>
                                       <a href={spec.value} target="_blank" rel="noopener noreferrer" className="inline-block px-4 py-2 border border-artisan-light/10 hover:border-artisan-grey hover:bg-artisan-light/5 text-[10px] font-mono text-artisan-grey hover:text-artisan-light transition-all uppercase tracking-wider">
                                          Launch Training Video Link
                                       </a>
                                    </div>
                                 )}
                                 {spec.label && (
                                    <p className="text-[9px] font-mono text-artisan-light/40 uppercase tracking-widest">{spec.label}</p>
                                 )}
                              </div>
                           )
                        }
                        if (spec.type === 'custom' && (spec.label || spec.value)) {
                           return (
                              <div key={idx} className="border border-dashed border-artisan-light/10 p-4 space-y-2 max-w-xl font-mono text-xs">
                                 <div className="flex justify-between border-b border-artisan-light/5 pb-2 text-[10px] uppercase font-bold text-artisan-grey">
                                    <span>{spec.label || 'Custom Specification'}</span>
                                 </div>
                                 <span className="text-artisan-light/60 uppercase tracking-wide leading-relaxed block">{spec.value}</span>
                              </div>
                           )
                        }
                     })}
                  </div>
               </div>
            )}

            {/* Reviews & Ratings Section */}
            <div className="border-t border-artisan-light/10 pt-12 space-y-8">

               {/* Rating Breakdown / Summary (Row 1) */}
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border border-artisan-light/10 bg-artisan-light/[0.01] p-8">
                  <div className="space-y-2">
                     <h2 className="text-xs font-mono font-bold uppercase tracking-[0.4em] text-artisan-grey">Ratings & Reviews</h2>
                     <p className="text-[10px] font-mono text-artisan-light/50 uppercase tracking-widest leading-relaxed">
                        Feedback from certified medical professionals and facilities.
                     </p>
                  </div>

                  <div className="flex items-center gap-6">
                     <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-display font-black text-artisan-light">
                           {tool.averageRating || '0.0'}
                        </span>
                        <span className="text-xs font-mono text-artisan-light/40 uppercase tracking-widest">/ 5.0</span>
                     </div>

                     <div className="space-y-1">
                        <div className="flex items-center gap-1">
                           {[1, 2, 3, 4, 5].map((star) => {
                              const ratingVal = parseFloat(tool.averageRating || 0)
                              return (
                                 <Star
                                    key={star}
                                    className={`w-5 h-5 ${star <= ratingVal ? 'fill-artisan-grey text-artisan-grey' : 'text-artisan-light/10'}`}
                                 />
                              )
                           })}
                        </div>
                        <span className="text-[10px] font-mono text-artisan-light/50 uppercase tracking-widest block">
                           ({tool.numOfReviews || 0} reviews)
                        </span>
                     </div>
                  </div>
               </div>

               {/* Reviews List (Row 2) */}
               <div className="space-y-6">
                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin">
                     {reviews.length === 0 ? (
                        <div className="border border-dashed border-artisan-light/10 p-8 text-center space-y-2">
                           <MessageSquare className="w-8 h-8 text-artisan-light/10 mx-auto" />
                           <span className="text-[10px] font-mono text-artisan-light/50 uppercase tracking-widest block">No reviews yet for this product</span>
                        </div>
                     ) : (
                        reviews.map((rev) => (
                           <div key={rev._id} className="border border-artisan-light/10 p-5 space-y-4 bg-artisan-light/[0.01]">
                              <div className="flex justify-between items-start">
                                 <div className="space-y-1">
                                    <span className="text-[10px] font-mono font-bold uppercase text-artisan-light">{rev.userName}</span>
                                    <div className="flex items-center gap-0.5">
                                       {[1, 2, 3, 4, 5].map((star) => (
                                          <Star
                                             key={star}
                                             className={`w-3 h-3 ${star <= rev.rating ? 'fill-artisan-grey text-artisan-grey' : 'text-artisan-light/10'}`}
                                          />
                                       ))}
                                    </div>
                                 </div>
                                 <span className="text-[8px] font-mono text-artisan-light/25 uppercase">
                                    {new Date(rev.createdAt).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' })}
                                 </span>
                              </div>

                              <p className="text-xs font-mono text-artisan-light/75 uppercase leading-relaxed">{rev.text}</p>

                              {/* Optional Improvement Suggestions */}
                              {rev.improvementReason && (
                                 <div className="border-l-2 border-red-500/20 pl-3 py-1 space-y-1">
                                    <span className="text-[8px] font-mono text-artisan-grey uppercase tracking-widest block">Suggestions for Improvement</span>
                                    <p className="text-[10px] font-mono text-artisan-light/50 uppercase leading-relaxed">{rev.improvementReason}</p>
                                 </div>
                              )}

                              {/* Review Images */}
                              {rev.images && rev.images.length > 0 && (
                                 <div className="flex flex-wrap gap-2 pt-2">
                                    {rev.images.map((img, i) => (
                                       <a
                                          key={i}
                                          href={img.url}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="w-16 h-16 bg-white border border-artisan-light/10 p-1 overflow-hidden flex items-center justify-center cursor-zoom-in"
                                       >
                                          <img src={img.url} className="max-h-full max-w-full object-contain" alt="Customer uploaded review" />
                                       </a>
                                    ))}
                                 </div>
                              )}
                           </div>
                        ))
                     )}
                  </div>
               </div>

               {/* Dynamic Review Submission Form (Row 3) */}
               {canReview && (
                  <div className="pt-4">
                     <form onSubmit={handleReviewSubmit} className="border border-artisan-light/10 p-6 space-y-6 bg-artisan-light/[0.02] relative">
                        <div className="space-y-2 border-b border-artisan-light/5 pb-4">
                           <h3 className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-artisan-grey">Write a Product Review</h3>
                           <p className="text-[8px] font-mono text-artisan-light/50 uppercase tracking-widest">Share your clinical experience using this product.</p>
                        </div>

                        {/* Star Rating Selector */}
                        <div className="space-y-2">
                           <span className="text-[9px] font-mono font-bold text-artisan-light/40 uppercase tracking-[0.3em] block">Rating</span>
                           <div className="flex items-center gap-1.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                 <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    className="text-artisan-light/20 hover:text-artisan-grey transition-colors p-0.5"
                                 >
                                    <Star className={`w-6 h-6 ${star <= rating ? 'fill-artisan-grey text-artisan-grey' : 'text-artisan-light/10'}`} />
                                 </button>
                              ))}
                           </div>
                        </div>

                        {/* Character limited Comment */}
                        <div className="space-y-2">
                           <div className="flex justify-between items-baseline">
                              <span className="text-[9px] font-mono font-bold text-artisan-light/40 uppercase tracking-[0.3em]">Review comment</span>
                              <span className={`text-[8px] font-mono ${reviewText.length > 450 ? 'text-red-500' : 'text-artisan-light/20'}`}>
                                 {500 - reviewText.length} characters left
                              </span>
                           </div>
                           <textarea
                              value={reviewText}
                              onChange={(e) => setReviewText(e.target.value.slice(0, 500))}
                              placeholder="TYPE YOUR GENERAL CLINICAL EXPERIENCES AND OBSERVATIONS HERE..."
                              required
                              rows={4}
                              className="w-full bg-artisan-light/5 border border-artisan-light/10 p-4 text-xs font-mono text-artisan-light uppercase outline-none focus:border-artisan-grey transition-colors placeholder:text-artisan-light/5 resize-none"
                           />
                        </div>

                        {/* Optional Improvement text box (for < 5 stars) */}
                        {rating < 5 && (
                           <div className="space-y-2 border-l-2 border-red-500/20 pl-4 py-1">
                              <span className="text-[9px] font-mono font-bold text-red-500/60 uppercase tracking-[0.3em] block">Help us improve</span>
                              <textarea
                                 value={improvementReason}
                                 onChange={(e) => setImprovementReason(e.target.value.slice(0, 500))}
                                 placeholder="WHAT COULD WE HAVE DONE BETTER OR IMPROVED WITH THIS PRODUCT? (OPTIONAL)"
                                 rows={2}
                                 className="w-full bg-artisan-light/5 border border-artisan-light/10 p-4 text-xs font-mono text-artisan-light uppercase outline-none focus:border-artisan-grey transition-colors placeholder:text-artisan-light/5 resize-none"
                              />
                           </div>
                        )}

                        {/* Image uploader */}
                        <div className="space-y-3">
                           <span className="text-[9px] font-mono font-bold text-artisan-light/40 uppercase tracking-[0.3em] block">Add Photos</span>
                           <div className="flex flex-wrap items-center gap-4">
                              <label className="px-4 py-3 border border-artisan-light/15 hover:border-artisan-grey text-[9px] font-mono font-bold text-artisan-light uppercase tracking-widest cursor-pointer hover:bg-artisan-light/5 transition-all">
                                 Upload Image
                                 <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                 />
                              </label>
                              <span className="text-[8px] font-mono text-artisan-light/20 uppercase tracking-widest">Attach photos showing your product.</span>
                           </div>

                           {reviewImages.length > 0 && (
                              <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 pt-2">
                                 {reviewImages.map((imgBase64, idx) => (
                                    <div key={idx} className="relative aspect-square border border-artisan-light/10 p-1 bg-white overflow-hidden group">
                                       <img src={imgBase64} className="w-full h-full object-contain" alt="Preview" />
                                       <button
                                          type="button"
                                          onClick={() => removeReviewImage(idx)}
                                          className="absolute inset-0 bg-artisan-dark/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[8px] font-mono font-bold text-red-500 uppercase tracking-widest"
                                       >
                                          Remove
                                       </button>
                                    </div>
                                 ))}
                              </div>
                           )}
                        </div>

                        <button
                           type="submit"
                           disabled={submittingReview}
                           className="w-full py-4 bg-artisan-grey text-artisan-dark font-display font-extrabold uppercase tracking-widest text-[10px] hover:bg-artisan-light transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                           {submittingReview ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Review'}
                        </button>
                     </form>
                  </div>
               )}
            </div>

            {/* Similar Products Section */}
            {similarGear.length > 0 && (
               <div className="border-t border-artisan-light/10 pt-12 space-y-6">
                  <h2 className="text-xs font-mono font-bold uppercase tracking-[0.4em] text-artisan-grey">Similar Products</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                     {similarGear.map(t => (
                        <Link to={`/product/${t._id}`} key={t._id} className="group border border-artisan-light/10 bg-artisan-light/[0.02] p-3 hover:border-artisan-grey transition-all flex flex-col gap-3">
                           <div className="aspect-[4/3] bg-white overflow-hidden border border-artisan-light/5 flex items-center justify-center p-2">
                              <img src={t.image || t.images?.[0]} alt={t.name || t.title} className="max-h-full max-w-full object-contain transition-all duration-500" />
                           </div>
                           <div className="space-y-1">
                              <span className="text-[8px] font-mono font-bold text-artisan-grey uppercase tracking-widest block">{t.category}</span>
                              <h4 className="text-xs font-display font-bold uppercase text-artisan-light tracking-tight line-clamp-1 group-hover:text-artisan-grey transition-colors">{t.name || t.title}</h4>
                              <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold">
                                 {t.mrp !== undefined && t.mrp > (t.price !== undefined ? t.price : t.pricePerDay) && (
                                    <span className="line-through text-artisan-light/30">
                                       ₹{t.mrp?.toLocaleString()}
                                    </span>
                                 )}
                                 <span className="text-artisan-light/60">
                                    ₹{(t.price !== undefined ? t.price : t.pricePerDay)?.toLocaleString()}
                                 </span>
                              </div>
                           </div>
                        </Link>
                     ))}
                  </div>
               </div>
            )}

            {/* Bulk Order Enquiry Banner */}
            <div className="border border-artisan-light/10 bg-artisan-light/[0.01] p-8 sm:p-12 text-center space-y-6 relative overflow-hidden mt-16">
               <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-artisan-grey to-transparent" />

               <div className="max-w-2xl mx-auto space-y-4">
                  <h2 className="text-2xl sm:text-3xl font-display font-black uppercase tracking-tight text-artisan-light">
                     Need a Custom Procurement Solution?
                  </h2>
                  <p className="text-xs font-mono text-artisan-light/50 uppercase tracking-widest leading-relaxed">
                     We offer competitive wholesale pricing, institutional credits, and customized logistics support for hospitals, clinics, and bulk purchase requirements.
                  </p>
               </div>

               <div className="pt-2">
                  <Link
                     to={`/bulk-enquiry?productId=${tool._id}`}
                     className="inline-flex items-center gap-2 px-8 py-4 bg-artisan-grey text-artisan-dark font-mono text-xs font-bold uppercase tracking-widest hover:bg-artisan-light hover:text-artisan-dark transition-all duration-300 border border-artisan-grey hover:border-artisan-light cursor-pointer"
                  >
                     Bulk Order Enquiry
                  </Link>
               </div>
            </div>

         </div>
      </div>
   )
}
