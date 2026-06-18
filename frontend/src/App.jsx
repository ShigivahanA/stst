import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import ScrollToTop from './components/ScrollToTop'
import AnalyticsTracker from './components/AnalyticsTracker'

import { useAuth } from './context/AuthContext'
import ConsentModal from './components/auth/ConsentModal'
import { useToast } from './context/ToastContext'
import api from './services/api'

// Lazy loaded page components
const Home = lazy(() => import('./pages/Home'))
const Auth = lazy(() => import('./pages/Auth'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const AllProduct = lazy(() => import('./pages/AllProduct'))
const ListTool = lazy(() => import('./pages/ListTool'))
const ProductDetail = lazy(() => import('./pages/ProductDetail'))
const Wishlist = lazy(() => import('./pages/Wishlist'))
const Cart = lazy(() => import('./pages/Cart'))
const Profile = lazy(() => import('./pages/Profile'))
const OrdersHistory = lazy(() => import('./pages/OrdersHistory'))
const OrderDetail = lazy(() => import('./pages/OrderDetail'))
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))
const AdminUsers = lazy(() => import('./pages/AdminUsers'))
const AdminUserDetail = lazy(() => import('./pages/AdminUserDetail'))
const AdminProduct = lazy(() => import('./pages/AdminProduct'))
const AdminNewProduct = lazy(() => import('./pages/AdminNewProduct'))
const AdminProductDetail = lazy(() => import('./pages/AdminProductDetail'))
const AdminContent = lazy(() => import('./pages/AdminContent'))
const AdminMarketing = lazy(() => import('./pages/AdminMarketing'))
const AdminOrders = lazy(() => import('./pages/AdminOrders'))
const Shipping = lazy(() => import('./pages/Shipping'))
const ReturnsAndRefunds = lazy(() => import('./pages/ReturnsAndRefunds'))
const NotFound = lazy(() => import('./pages/NotFound'))
const Categories = lazy(() => import('./pages/Categories'))
const BulkEnquiry = lazy(() => import('./pages/BulkEnquiry'))
const OurMakers = lazy(() => import('./pages/OurMakers'))
const MakerStories = lazy(() => import('./pages/MakerStories'))
const SafetyTrust = lazy(() => import('./pages/SafetyTrust'))
const About = lazy(() => import('./pages/About'))
const Support = lazy(() => import('./pages/Support'))
const BookDemo = lazy(() => import('./pages/BookDemo'))
const PressRoom = lazy(() => import('./pages/PressRoom'))
const Insurance = lazy(() => import('./pages/Insurance'))
const FAQ = lazy(() => import('./pages/FAQ'))
const ResetPassword = lazy(() => import('./pages/ResetPassword'))
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'))
const Privacy = lazy(() => import('./pages/Privacy'))
const Terms = lazy(() => import('./pages/Terms'))
const Sitemap = lazy(() => import('./pages/Sitemap'))
const Verification = lazy(() => import('./pages/Verification'))

function App() {
  const { user, setUser, toggleWishlist } = useAuth()
  const { addToast } = useToast()
  const location = useLocation()

  // Process pending cart/wishlist actions when user logs in
  useEffect(() => {
    if (!user) return

    const syncPendingActions = async () => {
      const pendingCart = localStorage.getItem('pending_cart_action')
      const pendingWishlist = localStorage.getItem('pending_wishlist_action')

      if (pendingCart) {
        try {
          const { productId, quantity } = JSON.parse(pendingCart)
          const res = await api.post('/auth/cart', { productId, quantity })
          setUser(prev => ({
            ...prev,
            cart: res.data.data
          }))
          addToast('Saved item has been added to your cart!', 'success')
        } catch (err) {
          console.error('Failed to sync pending cart action:', err)
        } finally {
          localStorage.removeItem('pending_cart_action')
        }
      }

      if (pendingWishlist) {
        try {
          const { productId } = JSON.parse(pendingWishlist)
          await toggleWishlist(productId)
          addToast('Saved item has been added to your wishlist!', 'success')
        } catch (err) {
          console.error('Failed to sync pending wishlist action:', err)
        } finally {
          localStorage.removeItem('pending_wishlist_action')
        }
      }
    }

    syncPendingActions()
  }, [user, setUser, toggleWishlist, addToast])

  const isAuthPage = ['/login', '/signup', '/forgot-password'].includes(location.pathname) ||
    location.pathname.startsWith('/resetpassword/') ||
    location.pathname.startsWith('/verifyemail/')

  const transitionKey = ['/login', '/signup'].includes(location.pathname)
    ? 'auth'
    : location.pathname

  return (
    <div className="min-h-screen bg-artisan-dark">
      <ScrollToTop />
      <AnalyticsTracker />
      {!isAuthPage && <Navbar />}
      <main className="relative">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={transitionKey}
            className="w-full relative"
          >
            {/* Curtain 1: Exit curtain (slides up to fill the screen) */}
            <motion.div
              className="fixed inset-0 bg-artisan-grey z-[9999] pointer-events-auto"
              initial={{ y: '100%' }}
              animate={{ y: '100%' }}
              exit={{ y: 0 }}
              transition={{ duration: 0.3, ease: [0.76, 0, 0.24, 1] }}
            />
            {/* Curtain 2: Enter curtain (slides up to unfill the screen) */}
            <motion.div
              className="fixed inset-0 bg-artisan-grey z-[9999] pointer-events-auto"
              initial={{ y: 0 }}
              animate={{ y: '-100%' }}
              exit={{ y: '-100%' }}
              transition={{ duration: 0.3, ease: [0.76, 0, 0.24, 1] }}
            />

            <Suspense fallback={
              <div className="min-h-screen bg-artisan-dark flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-[#eb5e28]" />
                  <span className="text-[10px] font-mono text-artisan-light/50 uppercase tracking-widest animate-pulse">Loading environment...</span>
                </div>
              </div>
            }>
              <Routes location={location}>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Auth />} />
                <Route path="/signup" element={<Auth />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/verification" element={
                  <ProtectedRoute>
                    <Verification />
                  </ProtectedRoute>
                } />
                <Route path="/marketplace" element={<Navigate to="/allproduct" replace />} />
                <Route path="/rent" element={<Navigate to="/allproduct" replace />} />
                <Route path="/allproduct" element={<AllProduct />} />
                <Route path="/bulk-enquiry" element={<BulkEnquiry />} />
                <Route path="/book-demo" element={<BookDemo />} />
                <Route path="/list" element={
                  <ProtectedRoute>
                    <ListTool />
                  </ProtectedRoute>
                } />
                <Route path="/tool/:id" element={<ProductDetail />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/wishlist" element={
                  <ProtectedRoute>
                    <Wishlist />
                  </ProtectedRoute>
                } />
                <Route path="/cart" element={
                  <ProtectedRoute>
                    <Cart />
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
                <Route path="/history" element={
                  <ProtectedRoute>
                    <OrdersHistory />
                  </ProtectedRoute>
                } />
                <Route path="/orders/:id" element={
                  <ProtectedRoute>
                    <OrderDetail />
                  </ProtectedRoute>
                } />
                <Route path="/admin" element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/admin/users" element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminUsers />
                  </ProtectedRoute>
                } />
                <Route path="/admin/users/:id" element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminUserDetail />
                  </ProtectedRoute>
                } />
                <Route path="/admin/products" element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminProduct />
                  </ProtectedRoute>
                } />
                <Route path="/admin/products/new" element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminNewProduct />
                  </ProtectedRoute>
                } />
                <Route path="/admin/products/:id" element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminProductDetail />
                  </ProtectedRoute>
                } />
                <Route path="/admin/content" element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminContent />
                  </ProtectedRoute>
                } />
                <Route path="/admin/marketing" element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminMarketing />
                  </ProtectedRoute>
                } />
                <Route path="/admin/orders" element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminOrders />
                  </ProtectedRoute>
                } />

                <Route path="/categories" element={<Categories />} />
                <Route path="/how-it-works" element={<Navigate to="/categories" replace />} />
                <Route path="/our-makers" element={<OurMakers />} />
                <Route path="/maker-stories" element={<MakerStories />} />
                <Route path="/shipping" element={<Shipping />} />
                <Route path="/returns" element={<ReturnsAndRefunds />} />
                <Route path="/safety" element={<SafetyTrust />} />
                <Route path="/about" element={<About />} />
                <Route path="/support" element={<Support />} />
                <Route path="/press" element={<PressRoom />} />
                <Route path="/insurance" element={<Insurance />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/the-craft" element={<Navigate to="/faq" replace />} />
                <Route path="/resetpassword/:token" element={<ResetPassword />} />
                <Route path="/verifyemail/:token" element={<VerifyEmail />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/sitemap" element={<Sitemap />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </main>
      {!isAuthPage && <Footer />}
    </div>
  )
}

export default App
