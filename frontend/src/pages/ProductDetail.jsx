import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
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
   Phone
} from 'lucide-react'
import api from '../services/api'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'


export default function ProductDetail() {
   const { id } = useParams()
   const { addToast } = useToast()
   const { user, setUser, toggleWishlist: contextToggleWishlist } = useAuth()
   const navigate = useNavigate()
   const [tool, setTool] = useState(null)
   const [loading, setLoading] = useState(true)
   const [activeImage, setActiveImage] = useState(0)
   const [quantity, setQuantity] = useState(1)
   const [similarGear, setSimilarGear] = useState([])
   const [isWishlisted, setIsWishlisted] = useState(false)

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
            navigate('/rent')
         } finally {
            setLoading(false)
         }
      }

      fetchToolDetails()
      window.scrollTo(0, 0)
   }, [id, addToast, navigate, user])

   const toggleWishlist = async () => {
      if (!user) {
         addToast('Please login to save items', 'info')
         navigate('/login')
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
      if (user) {
         try {
            const res = await api.post('/auth/cart', { productId: tool._id, quantity })
            setUser(prev => ({
               ...prev,
               cart: res.data.data
            }))
         } catch (err) {
            console.error("Failed to sync cart to database", err)
         }
      }
      addToast(`Added ${quantity} x ${tool.name || tool.title} to cart`, 'success')
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

   return (
      <div className="min-h-screen bg-artisan-dark text-artisan-light font-body bg-noise selection:bg-artisan-grey selection:text-artisan-dark pt-28 pb-20">
         <div className="container-custom max-w-5xl mx-auto space-y-10">

            {/* Top Breadcrumb/Back link */}
            <div className="flex justify-between items-center pb-4 border-b border-artisan-light/5">
               <Link to="/allproduct" className="group flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-artisan-light hover:text-artisan-grey transition-colors">
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  Back to Catalog
               </Link>
               <span className="text-[10px] font-mono text-artisan-light/30 uppercase tracking-widest">
                  Product ID: {tool._id ? tool._id.slice(-6).toUpperCase() : 'N/A'}
               </span>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 items-start">

               {/* Column 1: Gallery */}
               <div className="space-y-4">
                  <div className="relative aspect-[4/3] bg-white border border-artisan-light/10 overflow-hidden flex items-center justify-center">
                     <AnimatePresence mode="wait">
                        <motion.img
                           key={activeImage}
                           initial={{ opacity: 0 }}
                           animate={{ opacity: 1 }}
                           exit={{ opacity: 0 }}
                           transition={{ duration: 0.2 }}
                           src={displayImages[activeImage] || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=1200'}
                           className="w-full h-full object-contain p-4"
                        />
                     </AnimatePresence>

                     {/* Gallery Controls */}
                     {displayImages.length > 1 && (
                        <>
                           <button
                              onClick={() => setActiveImage(prev => (prev - 1 + displayImages.length) % displayImages.length)}
                              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-artisan-dark/80 backdrop-blur-md border border-artisan-light/10 flex items-center justify-center text-artisan-light hover:bg-artisan-grey hover:text-artisan-dark transition-all"
                           >
                              <ChevronLeft className="w-4 h-4" />
                           </button>
                           <button
                              onClick={() => setActiveImage(prev => (prev + 1) % displayImages.length)}
                              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-artisan-dark/80 backdrop-blur-md border border-artisan-light/10 flex items-center justify-center text-artisan-light hover:bg-artisan-grey hover:text-artisan-dark transition-all"
                           >
                              <ChevronRight className="w-4 h-4" />
                           </button>
                        </>
                     )}
                  </div>

                  {/* Thumbnail Selector */}
                  {displayImages.length > 1 && (
                     <div className="flex gap-2 justify-center">
                        {displayImages.map((img, i) => (
                           <button
                              key={i}
                              onClick={() => setActiveImage(i)}
                              className={`w-12 h-12 border p-1 bg-white transition-all ${activeImage === i ? 'border-artisan-grey' : 'border-artisan-light/10 opacity-60 hover:opacity-100'}`}
                           >
                              <img src={img} className="w-full h-full object-cover" />
                           </button>
                        ))}
                     </div>
                  )}
               </div>

               {/* Column 2: Information & Actions */}
               <div className="space-y-6">
                  {/* Category, Location, Availability */}
                  <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono font-bold uppercase tracking-wider">
                     <span className="text-artisan-grey">{tool.category}</span>
                     <span className="w-1 h-1 bg-artisan-light/20 rounded-full" />
                     <span className="text-green-600">
                        {tool.availability || 'In Stock (20)'}
                     </span>
                  </div>

                  {/* Title & Price */}
                  <div className="space-y-2">
                     <h1 className="text-3xl lg:text-4xl font-display font-extrabold uppercase tracking-tight leading-tight text-artisan-light">
                        {displayTitle}
                     </h1>
                     <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-display font-black text-artisan-light">
                           ₹{displayPrice?.toLocaleString()}
                        </span>
                        <span className="text-[10px] font-mono text-artisan-light/40 uppercase tracking-widest">
                           Estimated Rate
                        </span>
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
                     </div>
                  </div>

                  {/* Specs Accordion/List */}
                  <div className="border-t border-artisan-light/10 pt-6 space-y-4">
                     <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-artisan-grey">Specifications</h3>
                     <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-[11px]">
                        {specs.map((spec, i) => (
                           <div key={i} className="flex justify-between border-b border-artisan-light/5 pb-2">
                              <span className="text-artisan-light/40 font-mono uppercase tracking-wider">{spec.label}</span>
                              <span className="font-bold uppercase text-artisan-light">{spec.value}</span>
                           </div>
                        ))}
                     </div>
                  </div>

               </div>
            </div>

            {/* Similar Products Section */}
            {similarGear.length > 0 && (
               <div className="border-t border-artisan-light/10 pt-12 space-y-6">
                  <h2 className="text-xs font-mono font-bold uppercase tracking-[0.4em] text-artisan-grey">Similar Products</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                     {similarGear.map(t => (
                        <Link to={`/product/${t._id}`} key={t._id} className="group border border-artisan-light/10 bg-artisan-light/[0.02] p-3 hover:border-artisan-grey transition-all flex flex-col gap-3">
                           <div className="aspect-[4/3] bg-white overflow-hidden border border-artisan-light/5 flex items-center justify-center p-2">
                              <img src={t.image || t.images?.[0]} alt={t.name || t.title} className="max-h-full max-w-full object-contain grayscale group-hover:grayscale-0 transition-all duration-500" />
                           </div>
                           <div className="space-y-1">
                              <span className="text-[8px] font-mono font-bold text-artisan-grey uppercase tracking-widest block">{t.category}</span>
                              <h4 className="text-xs font-display font-bold uppercase text-artisan-light tracking-tight line-clamp-1 group-hover:text-artisan-grey transition-colors">{t.name || t.title}</h4>
                              <span className="text-[10px] font-mono font-bold text-artisan-light/60 uppercase tracking-widest">₹{(t.price !== undefined ? t.price : t.pricePerDay)?.toLocaleString()}</span>
                           </div>
                        </Link>
                     ))}
                  </div>
               </div>
            )}

         </div>
      </div>
   )
}
