import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowUpRight, Star, Heart, ShoppingBag, Loader2, Trash2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import api from '../../services/api'

export default function ToolCard({ tool, idx, showAddToCart = false }) {
  const { user, setUser, toggleWishlist } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()

  const displayImage = tool.image || tool.images?.[0] || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800'
  const isWishlisted = user?.wishlist?.includes(tool._id)

  const [isAdding, setIsAdding] = useState(false)

  const handleWishlist = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (!user) {
      addToast('Please login to save items', 'info')
      localStorage.setItem('pending_wishlist_action', JSON.stringify({ productId: tool._id }))
      localStorage.setItem('auth_redirect', window.location.pathname)
      navigate('/login')
      return
    }

    if (user.role === 'admin') {
      addToast('Administrators are not permitted to save items in the wishlist', 'error')
      return
    }

    try {
      await toggleWishlist(tool._id)
      addToast(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist', 'success')
    } catch (err) {
      addToast('Failed to update collection', 'error')
    }
  }

  const handleAddToCart = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (!user) {
      addToast('Please login to add items to cart', 'info')
      localStorage.setItem('pending_cart_action', JSON.stringify({ productId: tool._id, quantity: 1 }))
      localStorage.setItem('auth_redirect', window.location.pathname)
      navigate('/login')
      return
    }

    if (user.role === 'admin') {
      addToast('Administrators are not permitted to add items to cart', 'error')
      return
    }

    try {
      setIsAdding(true)
      const existingItem = user?.cart?.find(item => item.product === tool._id || item.product?._id === tool._id)
      const newQty = existingItem ? existingItem.quantity + 1 : 1

      const res = await api.post('/auth/cart', { productId: tool._id, quantity: newQty })
      const validCart = (res.data.data || []).filter(item => item.product)

      setUser(prev => ({
        ...prev,
        cart: validCart
      }))

      addToast('Product added to cart successfully', 'success')
    } catch (err) {
      console.error('Failed to add to cart', err)
      addToast('Failed to add to cart', 'error')
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <Link to={`/product/${tool._id}`} className="block h-full outline-none">
      <div className="group flex flex-col bg-artisan-dark/40 backdrop-blur-sm border border-artisan-light/10 hover:border-artisan-light/30 transition-all duration-300 h-full rounded-2xl overflow-hidden hover:shadow-[0_8px_30px_rgba(235,94,40,0.05)]">
        {/* Image Area - Aspect Video for compactness */}
        <div className="relative aspect-video w-full bg-white overflow-hidden flex items-center justify-center p-2 shrink-0">
          <img
            src={displayImage}
            alt={tool.name || tool.title}
            className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-700 ease-out"
          />

          {/* Top Overlays */}
          <div className="absolute top-3 inset-x-3 flex justify-between items-start pointer-events-none">
            {/* Category Tag */}
            <span className="px-2 py-1 bg-artisan-dark/80 backdrop-blur-md text-[9px] font-mono text-artisan-light/80 border border-artisan-light/10 uppercase tracking-widest rounded-md">
              {tool.category}
            </span>
 
            {/* Actions: Wishlist */}
            {!showAddToCart && (
              <div className="flex flex-col gap-2 pointer-events-auto items-end">
                <button
                  onClick={handleWishlist}
                  className={`w-7 h-7 flex items-center justify-center backdrop-blur-md border rounded-full transition-all duration-300 ${isWishlisted ? 'bg-red-500/20 border-red-500 text-red-500' : 'bg-artisan-dark/60 border-artisan-light/10 text-artisan-light hover:bg-artisan-light/10 hover:text-white'}`}
                  aria-label="Toggle Wishlist"
                >
                  <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-current' : ''}`} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className={`${showAddToCart ? 'p-3.5 sm:p-4' : 'p-4 sm:p-5'} flex-1 flex flex-col justify-between bg-gradient-to-b from-transparent to-artisan-dark/40`}>
          <div className={showAddToCart ? 'mb-2.5' : 'mb-4'}>
            <h3 className={`font-display font-bold uppercase tracking-tight text-artisan-light group-hover:text-artisan-grey transition-colors duration-300 line-clamp-2 leading-snug ${showAddToCart ? 'text-sm sm:text-base mb-1' : 'text-base sm:text-lg mb-1.5'}`}>
              {tool.name || tool.title}
            </h3>
            
            <p className="text-xs text-artisan-light/50 line-clamp-1 leading-relaxed font-body">
              {tool.desc || tool.description}
            </p>
          </div>

          {/* Pricing & Rating */}
          <div className={`${showAddToCart ? 'pt-2.5' : 'pt-3'} border-t border-artisan-light/5 flex items-center justify-between mt-auto`}>
            <div className="flex flex-col">
              <span className="text-[9px] font-mono text-artisan-light/40 uppercase tracking-widest mb-0.5">Price</span>
              {tool.priceDisplayMode === 'contact_us' ? (
                <span className="text-sm sm:text-base font-display font-extrabold text-artisan-grey uppercase tracking-wider">
                  Contact us
                </span>
              ) : (
                <div className="flex items-baseline gap-1.5">
                  {tool.mrp !== undefined && tool.mrp > (tool.price !== undefined ? tool.price : tool.pricePerDay) && (
                    <span className="text-xs font-display font-medium line-through text-artisan-light/30">
                      ₹{tool.mrp?.toLocaleString()}
                    </span>
                  )}
                  <span className="text-lg sm:text-xl font-display font-extrabold text-artisan-light tracking-tighter leading-none">
                    ₹{(tool.price !== undefined ? tool.price : tool.pricePerDay)?.toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-artisan-grey/90 group-hover:text-artisan-grey transition-colors duration-300">
              <Star className="w-3 h-3 fill-current" />
              <span>{tool.averageRating || '0.0'}</span>
            </div>
          </div>

          {showAddToCart && (
            <div className="mt-3.5 pt-2.5 border-t border-artisan-light/5 flex items-center gap-2 pb-1">
              {tool.priceDisplayMode === 'contact_us' ? (
                <motion.button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    navigate(`/bulk-enquiry?productId=${tool._id}`);
                  }}
                  className="flex-1 h-9 bg-artisan-light text-artisan-dark font-display font-black uppercase tracking-widest text-[9px] border border-black flex items-center justify-center gap-2 rounded-full cursor-pointer"
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
                  Enquire Now
                </motion.button>
              ) : (
                <motion.button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={isAdding}
                  className="flex-1 h-9 bg-artisan-light text-artisan-dark font-display font-black uppercase tracking-widest text-[9px] border border-black flex items-center justify-center gap-2 disabled:opacity-50 rounded-full cursor-pointer"
                  initial={{ y: 0, boxShadow: "0 4px 0 0 #000000" }}
                  whileHover={isAdding ? {} : { 
                     y: -1.5,
                     boxShadow: "0 5.5px 0 0 #000000",
                     backgroundColor: "#eb5e28"
                  }}
                  whileTap={isAdding ? {} : { 
                     y: 4,
                     boxShadow: "0 0px 0 0 #000000"
                  }}
                  transition={{ type: "spring", stiffness: 600, damping: 18 }}
                >
                  {isAdding ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <>
                      Add to Cart
                      <ShoppingBag className="w-3.5 h-3.5" />
                    </>
                  )}
                </motion.button>
              )}

              <motion.button
                type="button"
                onClick={handleWishlist}
                className="w-9 h-9 flex items-center justify-center border border-red-500/25 text-red-500 rounded-full cursor-pointer shrink-0"
                title="Remove from Wishlist"
                initial={{ y: 0, boxShadow: "0 4px 0 0 rgba(239, 68, 68, 0.15)", backgroundColor: "rgba(239, 68, 68, 0.02)" }}
                whileHover={{ 
                   y: -1.5,
                   boxShadow: "0 5.5px 0 0 rgba(239, 68, 68, 0.25)",
                   backgroundColor: "rgba(239, 68, 68, 0.08)"
                }}
                whileTap={{ 
                   y: 4,
                   boxShadow: "0 0px 0 0 rgba(239, 68, 68, 0.15)"
                }}
                transition={{ type: "spring", stiffness: 600, damping: 18 }}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </motion.button>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
