import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Heart,
  Trash2,
  ArrowRight,
  ShoppingBag,
  ExternalLink,
  Loader2
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import api from '../services/api'

export default function Wishlist() {
  const { user, toggleWishlist } = useAuth()
  const { addToast } = useToast()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchWishlist = async () => {
    try {
      setLoading(true)
      const res = await api.get('/users/wishlist')
      setItems(res.data.data || [])
    } catch (err) {
      console.error('Failed to fetch wishlist', err)
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchWishlist()
    } else {
      setLoading(false)
    }
  }, [user])

  const removeItem = async (productId) => {
    try {
      await toggleWishlist(productId)
      setItems(prev => prev.filter(item => item._id !== productId))
      addToast('Removed from wishlist', 'success')
    } catch (err) {
      addToast('Failed to remove item', 'error')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-artisan-dark bg-noise flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-artisan-grey animate-spin" />
          <span className="text-[10px] font-mono text-artisan-light/20 uppercase tracking-widest">Loading your wishlist...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-artisan-dark bg-noise pt-24 md:pt-32 pb-24">
      <div className="container-custom">

        {/* HEADER SECTION */}
        <header className="mb-10 md:mb-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4">
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl md:text-5xl lg:text-6xl font-display font-extrabold uppercase tracking-tighter leading-[0.85] text-artisan-light"
              >
                MY <br />
                <span className="text-outline">WISHLIST.</span>
              </motion.h1>
            </div>

            <div className="flex items-center gap-12 border-t md:border-t-0 border-artisan-light/5 pt-8 md:pt-0">
              <div className="flex flex-col items-start md:items-end gap-1">
                <span className="text-[8px] font-mono text-artisan-light/30 uppercase tracking-widest">Saved Items</span>
                <span className="text-2xl font-display font-black text-artisan-light">{items.length}</span>
              </div>
              <div className="w-px h-12 bg-artisan-light/10" />
              <div className="flex flex-col items-start md:items-end gap-1">
                <span className="text-[8px] font-mono text-artisan-light/30 uppercase tracking-widest">Total Value</span>
                <span className="text-2xl font-display font-black text-artisan-grey">₹{items.reduce((acc, curr) => acc + (curr.price || 0), 0).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </header>

        {/* WISHLIST GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          <main className="lg:col-span-12">
            <AnimatePresence mode="popLayout">
              {items.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {items.map((item, idx) => (
                    <motion.div
                      key={item._id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
                      transition={{ duration: 0.5, delay: idx * 0.1 }}
                      className="group relative bg-artisan-light/[0.02] border border-artisan-light/10 hover:border-artisan-grey transition-all duration-700 overflow-hidden hover:grayscale"
                    >
                      {/* Image Container */}
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <img
                          src={item.image || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800'}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000 "
                        />
                        <div className="absolute inset-0 bg-artisan-dark/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                          <button
                            onClick={() => removeItem(item._id)}
                            className="w-12 h-12 bg-red-500/90 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>

                        {/* Category Badge */}
                        <div className="absolute top-4 left-4">
                          <span className="px-3 py-1 bg-artisan-dark text-[8px] font-mono font-bold text-artisan-light uppercase tracking-widest border border-artisan-light/10">
                            {item.category}
                          </span>
                        </div>
                      </div>

                      {/* Info Container */}
                      <div className="p-6 md:p-8 space-y-6">
                        <div className="flex justify-between items-start gap-4">
                          <h3 className="text-xl md:text-2xl font-display font-extrabold uppercase tracking-tight text-artisan-light group-hover:text-artisan-grey transition-colors leading-tight">
                            {item.name}
                          </h3>
                        </div>

                        {item.desc && (
                          <p className="text-xs text-artisan-light/40 line-clamp-2 leading-relaxed">
                            {item.desc}
                          </p>
                        )}

                        <div className="pt-6 border-t border-artisan-light/5 flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="text-[8px] font-mono text-artisan-light/30 uppercase tracking-widest">Price</span>
                            <span className="text-xl font-display font-black text-artisan-light tracking-tight">₹{item.price?.toLocaleString()}</span>
                          </div>

                          <Link
                            to={`/product/${item._id}`}
                            className="flex items-center gap-3 px-6 py-3 bg-artisan-light text-artisan-dark font-display font-black uppercase tracking-widest text-[10px] hover:bg-artisan-grey transition-all"
                          >
                            View
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center text-center py-40 space-y-8"
                >
                  <div className="w-24 h-24 bg-artisan-light/5 border border-artisan-light/10 flex items-center justify-center text-artisan-light/10">
                    <Heart className="w-12 h-12" />
                  </div>
                  <div className="space-y-4">
                    <h2 className="text-4xl md:text-6xl font-display font-extrabold uppercase tracking-tighter text-artisan-light">
                      No saved <br />
                      <span className="text-outline">Items.</span>
                    </h2>
                    <p className="text-xs font-mono font-bold text-artisan-light/30 uppercase tracking-[0.4em]">
                      {user ? 'Tap the heart icon on any product to save it here' : 'Log in to save your favorite products'}
                    </p>
                  </div>
                  <Link
                    to={user ? '/allproduct' : '/login'}
                    className="px-12 py-6 bg-artisan-grey text-artisan-dark font-display font-black uppercase tracking-widest hover:bg-artisan-light transition-all"
                  >
                    {user ? 'Browse Products' : 'Login'}
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </main>

        </div>
      </div>
    </div>
  )
}
