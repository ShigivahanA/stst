import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Auth from './pages/Auth'
import ForgotPassword from './pages/ForgotPassword'
import AllProduct from './pages/AllProduct'
import ListTool from './pages/ListTool'
import ProductDetail from './pages/ProductDetail'
import Wishlist from './pages/Wishlist'
import Cart from './pages/Cart'
import Profile from './pages/Profile'
import OrdersHistory from './pages/OrdersHistory'
import AdminDashboard from './pages/AdminDashboard'
import AdminUsers from './pages/AdminUsers'
import AdminContent from './pages/AdminContent'
import Shipping from './pages/Shipping'
import ReturnsAndRefunds from './pages/ReturnsAndRefunds'
import NotFound from './pages/NotFound'
import Categories from './pages/Categories'
import OurMakers from './pages/OurMakers'
import MakerStories from './pages/MakerStories'
import SafetyTrust from './pages/SafetyTrust'
import About from './pages/About'
import Support from './pages/Support'
import PressRoom from './pages/PressRoom'
import Insurance from './pages/Insurance'
import FAQ from './pages/FAQ'
import ResetPassword from './pages/ResetPassword'
import VerifyEmail from './pages/VerifyEmail'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'
import Verification from './pages/Verification'
import ProtectedRoute from './components/ProtectedRoute'
import ScrollToTop from './components/ScrollToTop'

import { useAuth } from './context/AuthContext'
import ConsentModal from './components/auth/ConsentModal'

function App() {
  const { user } = useAuth()
  const location = useLocation()
  const isAuthPage = ['/login', '/signup', '/forgot-password'].includes(location.pathname) ||
    location.pathname.startsWith('/resetpassword/') ||
    location.pathname.startsWith('/verifyemail/')

  // Determine if we should show the global consent modal
  const showGlobalConsent = user &&
    user.onboardingCompleted &&
    !user.termsAccepted &&
    !location.pathname.startsWith('/onboarding')

  return (
    <div className="min-h-screen bg-artisan-dark">
      {showGlobalConsent && <ConsentModal onComplete={() => { }} />}
      <ScrollToTop />
      {!isAuthPage && <Navbar />}
      <main className="relative overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            className="w-full relative"
          >
            {/* Curtain 1: Exit curtain (slides up to fill the screen) */}
            <motion.div
              className="fixed inset-0 bg-artisan-grey z-[9999] pointer-events-auto"
              initial={{ y: '100%' }}
              animate={{ y: '100%' }}
              exit={{ y: 0 }}
              transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
            />
            {/* Curtain 2: Enter curtain (slides up to unfill the screen) */}
            <motion.div
              className="fixed inset-0 bg-artisan-grey z-[9999] pointer-events-auto"
              initial={{ y: 0 }}
              animate={{ y: '-100%' }}
              exit={{ y: '-100%' }}
              transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
            />

            <Routes location={location}>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Auth />} />
              <Route path="/signup" element={<Auth />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/onboarding" element={<Navigate to="/allproduct" replace />} />
              <Route path="/verification" element={
                <ProtectedRoute>
                  <Verification />
                </ProtectedRoute>
              } />
              <Route path="/marketplace" element={<Navigate to="/allproduct" replace />} />
              <Route path="/rent" element={<Navigate to="/allproduct" replace />} />
              <Route path="/allproduct" element={<AllProduct />} />
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
              <Route path="/admin" element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/users" element={
                <ProtectedRoute>
                  <AdminUsers />
                </ProtectedRoute>
              } />
              <Route path="/admin/content" element={
                <ProtectedRoute>
                  <AdminContent />
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
              <Route path="*" element={<NotFound />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>
      {!isAuthPage && <Footer />}
    </div>
  )
}

export default App
