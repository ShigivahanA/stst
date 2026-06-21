import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Heart,
  Trash2,
  ArrowRight,
  ShoppingBag,
  ExternalLink,
  Loader2,
  AlertCircle,
  ArrowLeft
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import api from '../services/api'
import SEO from '../components/SEO'
import ToolCard from '../components/marketplace/ToolCard'

const MotionLink = motion.create ? motion.create(Link) : motion(Link)

export default function Wishlist() {
  const { user, setUser, toggleWishlist } = useAuth()
  const { addToast } = useToast()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [addingId, setAddingId] = useState(null)

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

  useEffect(() => {
    if (user?.wishlist) {
      setItems(prev => prev.filter(item => user.wishlist.includes(item._id)))
    }
  }, [user?.wishlist])

  const removeItem = async (productId) => {
    try {
      await toggleWishlist(productId)
      setItems(prev => prev.filter(item => item._id !== productId))
      addToast('Removed from wishlist', 'success')
    } catch (err) {
      addToast('Failed to remove item', 'error')
    }
  }

  const handleAddToCart = async (productId) => {
    if (!user) {
      addToast('Please login to add items to cart', 'warning')
      return
    }
    try {
      setAddingId(productId)
      const existingItem = user?.cart?.find(item => item.product === productId || item.product?._id === productId)
      const newQty = existingItem ? existingItem.quantity + 1 : 1

      const res = await api.post('/auth/cart', { productId, quantity: newQty })
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
      setAddingId(null)
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

  if (user && user.role === 'admin') {
    return (
      <div className="min-h-screen bg-artisan-dark bg-noise flex items-center justify-center pt-24 md:pt-32 text-artisan-light">
        <div className="max-w-md mx-auto text-center space-y-6 p-8 border border-artisan-light/15 bg-artisan-light/[0.01] rounded-xl">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="text-2xl font-display font-black uppercase tracking-tight">Access Denied</h2>
          <p className="text-xs font-mono text-artisan-light/40 uppercase tracking-widest leading-relaxed">
            Administrators are not permitted to save items in the wishlist. Please use a customer account.
          </p>
          <MotionLink
            to="/admin"
            className="inline-block px-6 py-3 bg-artisan-light text-artisan-dark text-[9px] font-mono font-bold uppercase tracking-widest border border-black rounded-full cursor-pointer"
            initial={{ y: 0, boxShadow: "0 4px 0 0 #000000" }}
            whileHover={{ 
               y: -2,
               boxShadow: "0 6px 0 0 #000000",
               backgroundColor: "#eb5e28"
            }}
            whileTap={{ 
               y: 4,
               boxShadow: "0 0px 0 0 #000000"
            }}
            transition={{ type: "spring", stiffness: 600, damping: 18 }}
          >
            Go to Admin Dashboard
          </MotionLink>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-artisan-dark bg-noise pt-24 md:pt-32 pb-24">
      <SEO title="My Wishlist" robots="noindex, nofollow" />
      <div className="container-custom">

        {/* BACK LINK */}
        <div className="mb-6">
          <Link
            to="/allproduct"
            className="inline-flex items-center gap-3 group"
          >
            <div className="w-8 h-8 border border-artisan-light/10 flex items-center justify-center group-hover:bg-artisan-light group-hover:text-artisan-dark transition-all rounded-full">
              <ArrowLeft className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-mono font-bold text-artisan-light/40 uppercase tracking-[0.4em] group-hover:text-artisan-light transition-colors">
              Back to Catalog
            </span>
          </Link>
        </div>

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
                <span className="text-[8px] font-mono text-artisan-light/50 uppercase tracking-widest">Saved Items</span>
                <span className="text-2xl font-display font-black text-artisan-light">{items.length}</span>
              </div>
              <div className="w-px h-12 bg-artisan-light/10" />
              <div className="flex flex-col items-start md:items-end gap-1">
                <span className="text-[8px] font-mono text-artisan-light/50 uppercase tracking-widest">Total Value</span>
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
                    >
                      <ToolCard tool={item} idx={idx} showAddToCart={true} />
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
                    <p className="text-xs font-mono font-bold text-artisan-light/50 uppercase tracking-[0.4em]">
                      {user ? 'Tap the heart icon on any product to save it here' : 'Log in to save your favorite products'}
                    </p>
                  </div>
                  <MotionLink
                    to={user ? '/allproduct' : '/login'}
                    className="inline-block px-12 py-4 bg-artisan-grey text-artisan-dark font-display font-black uppercase tracking-widest border border-black rounded-full cursor-pointer"
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
                    {user ? 'Browse Products' : 'Login'}
                  </MotionLink>
                </motion.div>
              )}
            </AnimatePresence>
          </main>

        </div>
      </div>
    </div>
  )
}
