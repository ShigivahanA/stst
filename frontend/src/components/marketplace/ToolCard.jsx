import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowUpRight, Star, Heart } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'

export default function ToolCard({ tool, idx }) {
  const { user, toggleWishlist } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()

  const displayImage = tool.image || tool.images?.[0] || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800'
  const isWishlisted = user?.wishlist?.includes(tool._id)

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

    try {
      await toggleWishlist(tool._id)
      addToast(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist', 'success')
    } catch (err) {
      addToast('Failed to update collection', 'error')
    }
  }

  return (
    <Link to={`/product/${tool._id}`} className="block h-full outline-none">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.4, delay: idx * 0.05 }}
        className="group flex flex-col bg-artisan-dark/40 backdrop-blur-sm border border-artisan-light/10 hover:border-artisan-light/30 transition-all duration-300 h-full rounded-2xl overflow-hidden hover:shadow-[0_8px_30px_rgba(235,94,40,0.05)]"
      >
        {/* Image Area - Aspect Video for compactness */}
        <div className="relative aspect-video w-full overflow-hidden bg-artisan-dark/60 shrink-0">
          <img
            src={displayImage}
            alt={tool.name || tool.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out opacity-90 group-hover:opacity-100"
          />

          {/* Top Overlays */}
          <div className="absolute top-3 inset-x-3 flex justify-between items-start pointer-events-none">
            {/* Category Tag */}
            <span className="px-2 py-1 bg-artisan-dark/80 backdrop-blur-md text-[9px] font-mono text-artisan-light/80 border border-artisan-light/10 uppercase tracking-widest rounded-md">
              {tool.category}
            </span>

            {/* Actions: Wishlist */}
            <div className="flex flex-col gap-2 pointer-events-auto items-end">
              <button
                onClick={handleWishlist}
                className={`w-7 h-7 flex items-center justify-center backdrop-blur-md border rounded-full transition-all duration-300 ${isWishlisted ? 'bg-red-500/20 border-red-500 text-red-500' : 'bg-artisan-dark/60 border-artisan-light/10 text-artisan-light hover:bg-artisan-light/10 hover:text-white'}`}
                aria-label="Toggle Wishlist"
              >
                <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between bg-gradient-to-b from-transparent to-artisan-dark/40">
          <div className="mb-4">
            <h3 className="text-base sm:text-lg font-display font-bold uppercase tracking-tight text-artisan-light group-hover:text-artisan-grey transition-colors duration-300 line-clamp-2 mb-1.5 leading-snug">
              {tool.name || tool.title}
            </h3>
            
            <p className="text-xs text-artisan-light/50 line-clamp-1 leading-relaxed font-body">
              {tool.desc || tool.description}
            </p>
          </div>

          {/* Pricing & Rating */}
          <div className="pt-3 border-t border-artisan-light/5 flex items-center justify-between mt-auto">
            <div className="flex flex-col">
              <span className="text-[9px] font-mono text-artisan-light/40 uppercase tracking-widest mb-0.5">Price</span>
              <span className="text-lg sm:text-xl font-display font-extrabold text-artisan-light tracking-tighter leading-none">
                ₹{(tool.price !== undefined ? tool.price : tool.pricePerDay)?.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-artisan-grey/90 group-hover:text-artisan-grey transition-colors duration-300">
              <Star className="w-3 h-3 fill-current" />
              <span>{tool.averageRating || '0.0'}</span>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  )
}
