import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  MapPin,
  CreditCard,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Edit2,
  PlusCircle,
  ArrowLeft,
  Check,
  Truck,
  FileText,
  Download
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import api from '../services/api'
import { downloadOrderReceipt } from '../utils/orderReceipt'
import SEO from '../components/SEO'

export default function Cart() {
  const { user, setUser } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()

  // CART STATES
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [updatingItemId, setUpdatingItemId] = useState(null)

  // CHECKOUT STEPS
  const [checkoutStep, setCheckoutStep] = useState(0) // 0: Cart, 1: Address, 2: Review, 3: Payment, 4: Success
  const [selectedAddressId, setSelectedAddressId] = useState(null)
  const [isTransitioningStep, setIsTransitioningStep] = useState(false)

  // ADDRESS FORM STATES
  const [isAddingAddress, setIsAddingAddress] = useState(false)
  const [editingAddressId, setEditingAddressId] = useState(null)
  const [addressForm, setAddressForm] = useState({
    tag: 'Home',
    doorNumber: '',
    secondLine: '',
    landmark: '',
    city: '',
    state: '',
    pincode: ''
  })
  const [addressErrors, setAddressErrors] = useState({})
  const [isFetchingPincode, setIsFetchingPincode] = useState(false)
  const lastFetchedPincodeRef = useRef('')

  // Fetch city and state automatically from pincode API
  useEffect(() => {
    const fetchAddressDetails = async () => {
      const pin = addressForm.pincode.trim()
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

            setAddressForm(prev => ({
              ...prev,
              city: fetchedCity,
              state: fetchedState
            }))
            // Clear pincode, city, state errors if any
            setAddressErrors(prev => {
              const next = { ...prev }
              delete next.pincode
              delete next.city
              delete next.state
              return next
            })
            addToast('City and State fetched successfully', 'success')
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
  }, [addressForm.pincode, addToast])

  // ORDER SUCCESS STATES
  const [orderId, setOrderId] = useState('')
  const [razorpayOrderInfo, setRazorpayOrderInfo] = useState(null)
  const [completedOrder, setCompletedOrder] = useState(null)

  useEffect(() => {
    if (completedOrder) {
      sessionStorage.setItem('wa_conversion_happened', 'true')
      localStorage.setItem('wa_conversion_happened', 'true')
    }
  }, [completedOrder])

  // COUPON STATES
  const [couponCodeInput, setCouponCodeInput] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false)

  // Cart pricing calculation
  const itemsSubtotal = cartItems.reduce((acc, curr) => {
    const price = curr.product?.price || 0
    return acc + (price * curr.quantity)
  }, 0)

  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0
  const discountedSubtotal = Math.max(0, itemsSubtotal - discountAmount)

  const serviceFee = Math.round(discountedSubtotal * 0.05) // 5% service/GST fee
  const shippingFee = discountedSubtotal > 5000 || discountedSubtotal === 0 ? 0 : 150 // Free shipping above ₹5,000

  const paymentMethod = 'online'
  const orderTotal = discountedSubtotal + serviceFee + shippingFee

  // Real-time Stock Integrity Check
  const stockErrors = cartItems.filter(item => {
    return !item.product.active || item.product.quantity < item.quantity
  })
  const hasStockErrors = stockErrors.length > 0

  // Fetch cart details
  const fetchCart = async () => {
    try {
      setLoading(true)
      const res = await api.get('/auth/cart')
      const validCart = (res.data.data || []).filter(item => item.product)
      setCartItems(validCart)
    } catch (err) {
      console.error('Failed to fetch cart', err)
      addToast('Failed to load cart items', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchCart()
      if (user.addresses && user.addresses.length > 0) {
        setSelectedAddressId(user.addresses[0]._id)
      }
    } else {
      setLoading(false)
    }
  }, [user])

  // Remove coupon if subtotal falls below threshold
  useEffect(() => {
    if (appliedCoupon && itemsSubtotal < appliedCoupon.minCartAmount) {
      setAppliedCoupon(null)
      setCouponCodeInput('')
      addToast(`Promo code removed: subtotal is below minimum threshold (₹${appliedCoupon.minCartAmount.toLocaleString()})`, 'info')
    }
  }, [itemsSubtotal, appliedCoupon, addToast])

  // Apply Coupon Handler
  const handleApplyCoupon = async (e) => {
    e.preventDefault()
    if (!couponCodeInput.trim()) {
      addToast('Please enter a promocode', 'error')
      return
    }
    try {
      setIsApplyingCoupon(true)
      const res = await api.post('/coupons/validate', {
        code: couponCodeInput.trim().toUpperCase(),
        cartSubtotal: itemsSubtotal
      })
      setAppliedCoupon(res.data.data)
      addToast(`Promo code "${res.data.data.code}" applied!`, 'success')
    } catch (err) {
      console.error(err)
      addToast(err.response?.data?.message || 'Invalid promo code', 'error')
    } finally {
      setIsApplyingCoupon(false)
    }
  }

  // Remove Coupon Handler
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setCouponCodeInput('')
    addToast('Promo code removed', 'info')
  }

  // Custom step transition helper
  const changeStep = (targetStep) => {
    setIsTransitioningStep(true)
    setTimeout(() => {
      setCheckoutStep(targetStep)
      setIsTransitioningStep(false)
      window.scrollTo(0, 0)
    }, 600)
  }

  // Update item quantity
  const updateQuantity = async (productId, currentQty, delta) => {
    const newQty = currentQty + delta
    if (newQty < 1) {
      handleRemoveItem(productId)
      return
    }

    try {
      setUpdatingItemId(productId)
      const res = await api.post('/auth/cart', { productId, quantity: newQty })
      const validCart = (res.data.data || []).filter(item => item.product)
      setCartItems(validCart)

      if (user) {
        setUser(prev => ({
          ...prev,
          cart: validCart
        }))
      }
    } catch (err) {
      console.error('Failed to update quantity', err)
      addToast('Failed to update quantity', 'error')
    } finally {
      setUpdatingItemId(null)
    }
  }

  // Remove item from cart
  const handleRemoveItem = async (productId) => {
    try {
      setUpdatingItemId(productId)
      const res = await api.post('/auth/cart', { productId, quantity: 0 })
      const validCart = (res.data.data || []).filter(item => item.product)
      setCartItems(validCart)

      if (user) {
        setUser(prev => ({
          ...prev,
          cart: validCart
        }))
      }
      addToast('Item removed from cart', 'success')
    } catch (err) {
      console.error('Failed to remove item', err)
      addToast('Failed to remove item', 'error')
    } finally {
      setUpdatingItemId(null)
    }
  }

  // Address validation
  const validateAddress = () => {
    const errors = {}
    if (!addressForm.tag.trim()) errors.tag = 'Address label is required'
    if (!addressForm.doorNumber.trim()) errors.doorNumber = 'Flat / door number is required'
    if (!addressForm.city.trim()) errors.city = 'City is required'
    if (!addressForm.state.trim()) errors.state = 'State is required'

    // Indian pincode check (6 digits)
    const pinRegex = /^\d{6}$/
    if (!addressForm.pincode.trim()) {
      errors.pincode = 'Pincode is required'
    } else if (!pinRegex.test(addressForm.pincode.trim())) {
      errors.pincode = 'Pincode must be exactly 6 digits'
    }

    setAddressErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Address editing and creation handlers
  const handleAddressSubmit = async (e) => {
    e.preventDefault()
    if (!validateAddress()) {
      addToast('Please correct validation errors', 'error')
      return
    }

    try {
      setIsProcessing(true)
      let res
      if (editingAddressId) {
        res = await api.put(`/users/address/${editingAddressId}`, addressForm)
        addToast('Address updated successfully', 'success')
      } else {
        // Enforce address limit (max 4)
        if (user.addresses && user.addresses.length >= 4) {
          addToast('Maximum limit of 4 saved addresses reached. Please edit or delete an existing address.', 'error')
          setIsProcessing(false)
          return
        }
        res = await api.post('/users/address', addressForm)
        addToast('Address added successfully', 'success')
      }

      setUser(res.data.data) // Sync auth user context

      // Auto-select the newly added/modified address
      if (res.data.data.addresses?.length > 0) {
        const matchingAddr = res.data.data.addresses.find(a => a.tag === addressForm.tag)
        setSelectedAddressId(matchingAddr?._id || res.data.data.addresses[0]._id)
      }

      // Reset address form
      setIsAddingAddress(false)
      setEditingAddressId(null)
      setAddressForm({
        tag: 'Home',
        doorNumber: '',
        secondLine: '',
        landmark: '',
        city: '',
        state: '',
        pincode: ''
      })
      lastFetchedPincodeRef.current = ''
      setAddressErrors({})
    } catch (err) {
      console.error('Failed to save address', err)
      addToast(err.response?.data?.message || 'Failed to save address', 'error')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleStartEditAddress = (addr) => {
    setEditingAddressId(addr._id)
    setAddressForm({
      tag: addr.tag,
      doorNumber: addr.doorNumber,
      secondLine: addr.secondLine || '',
      landmark: addr.landmark || '',
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode
    })
    lastFetchedPincodeRef.current = addr.pincode
    setAddressErrors({})
    setIsAddingAddress(true)
  }


  // Initiate checkout
  const handleInitiateCheckout = async () => {
    if (hasStockErrors) {
      addToast('Cannot checkout. Some items in your cart exceed available stock.', 'error')
      return
    }

    if (!selectedAddressId) {
      addToast('Please select a shipping address', 'error')
      changeStep(1)
      return
    }

    try {
      setIsProcessing(true)
      const sessionId = sessionStorage.getItem('analytics_session_id') || `sess_${Date.now()}`

      const items = cartItems.map(item => ({
        productId: item.product?._id,
        quantity: item.quantity
      }))

      const res = await api.post('/orders/checkout', {
        items,
        sessionId,
        conversionSource: 'cart_checkout',
        couponCode: appliedCoupon ? appliedCoupon.code : undefined,
        addressId: selectedAddressId
      })

      setRazorpayOrderInfo(res.data.data)

      // Delay step transition to ensure visual loading feedback
      setTimeout(() => {
        setCheckoutStep(3) // Advance to Payment
        setIsProcessing(false)
      }, 600)
    } catch (err) {
      console.error('Checkout failed', err)
      addToast(err.response?.data?.message || 'Failed to initialize checkout', 'error')
      setIsProcessing(false)
    }
  }

  // Load Razorpay Checkout library
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true)
        return
      }
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  // Razorpay Gateway transaction
  const handleRazorpayPayment = async () => {
    if (!razorpayOrderInfo) return

    setIsProcessing(true)
    const isScriptLoaded = await loadRazorpayScript()
    if (!isScriptLoaded) {
      addToast('Failed to connect to payment gateway. Try simulated checkout or verify connection.', 'error')
      setIsProcessing(false)
      return
    }

    const { razorpayOrder, razorpayKey } = razorpayOrderInfo

    const deliveryAddressObj = user?.addresses?.find(a => a._id === selectedAddressId)
    const addressStr = deliveryAddressObj
      ? `${deliveryAddressObj.doorNumber}, ${deliveryAddressObj.secondLine || ''}, ${deliveryAddressObj.city}, ${deliveryAddressObj.state} - ${deliveryAddressObj.pincode}`
      : 'Default'

    const options = {
      key: razorpayKey,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      name: 'STAT Surgical Supplies',
      description: 'Surgical Supplies Purchase',
      order_id: razorpayOrder.id,
      handler: async function (response) {
        try {
          setIsProcessing(true)
          const verifyRes = await api.post('/orders/verify-payment', {
            razorpayOrderId: razorpayOrder.id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature
          })

          setCompletedOrder(verifyRes.data.data)
          setOrderId(verifyRes.data.data._id.substring(verifyRes.data.data._id.length - 8).toUpperCase())

          setUser(prev => ({
            ...prev,
            cart: []
          }))

          setCheckoutStep(4) // Success Step
          addToast('Payment successful!', 'success')
        } catch (err) {
          console.error('Payment verification failed', err)
          addToast('Payment signature verification failed. Please contact support.', 'error')
        } finally {
          setIsProcessing(false)
        }
      },
      prefill: {
        name: user?.name,
        email: user?.email
      },
      notes: {
        shipping_address: addressStr
      },
      theme: {
        color: '#e63946'
      },
      modal: {
        ondismiss: function () {
          setIsProcessing(false)
        }
      }
    }

    try {
      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (err) {
      console.error('Razorpay initialization failed', err)
      addToast('Failed to open payment gateway window.', 'error')
      setIsProcessing(false)
    }
  }

  // Simulated transaction mode (development mode bypass)
  const handleSimulatePayment = async () => {
    if (!razorpayOrderInfo) return

    try {
      setIsProcessing(true)
      const { razorpayOrder } = razorpayOrderInfo

      const dummyPaymentId = `pay_${Date.now()}`

      const verifyRes = await api.post('/orders/verify-payment', {
        razorpayOrderId: razorpayOrder.id,
        razorpayPaymentId: dummyPaymentId,
        razorpaySignature: 'simulated_signature_bypass_dev',
        isSimulated: true
      })

      setCompletedOrder(verifyRes.data.data)
      setOrderId(verifyRes.data.data._id.substring(verifyRes.data.data._id.length - 8).toUpperCase())

      setUser(prev => ({
        ...prev,
        cart: []
      }))

      setCheckoutStep(4) // Success step
      addToast('Simulated Payment Authorized!', 'success')
    } catch (err) {
      console.error('Simulated verification failed', err)
      addToast('Simulation transaction verification failed.', 'error')
    } finally {
      setIsProcessing(false)
    }
  }



  if (loading) {
    return (
      <div className="min-h-screen bg-artisan-dark bg-noise flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-artisan-grey animate-spin" />
          <span className="text-[10px] font-mono text-artisan-light/20 uppercase tracking-widest">Loading your cart...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-artisan-dark bg-noise pt-24 md:pt-32 pb-24 text-artisan-light font-body">
      <SEO title="Shopping Cart" robots="noindex, nofollow" />
      <div className="container-custom">

        {/* --- STEPPER (1-2-3) CENTERED AT THE TOP --- */}
        {checkoutStep > 0 && checkoutStep < 4 && (
          <div className="flex items-center justify-center gap-3 sm:gap-6 mb-12 pb-6 border-b border-artisan-light/5 overflow-x-auto scrollbar-hide">
            {[
              { step: 1, label: 'Shipping Address', shortLabel: 'Address' },
              { step: 2, label: 'Review Order', shortLabel: 'Review' },
              { step: 3, label: 'Payment', shortLabel: 'Payment' }
            ].map((item, idx) => (
              <div key={item.step} className="flex items-center gap-3 sm:gap-6 shrink-0">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-bold border transition-all duration-500 ${checkoutStep === item.step
                    ? 'bg-artisan-light text-artisan-dark border-artisan-light shadow-lg shadow-artisan-light/10'
                    : checkoutStep > item.step
                      ? 'bg-green-500/10 text-green-500 border-green-500/25'
                      : 'bg-artisan-light/5 text-artisan-light/20 border-artisan-light/10'
                    }`}>
                    {checkoutStep > item.step ? <Check className="w-3.5 h-3.5" /> : item.step}
                  </div>
                  <span className={`text-[10px] font-mono font-bold uppercase tracking-widest ${checkoutStep === item.step ? 'text-artisan-light' : 'text-artisan-light/20'
                    }`}>
                    <span className="hidden sm:inline">{item.label}</span>
                    <span className="inline sm:hidden">{item.shortLabel}</span>
                  </span>
                </div>
                {idx < 2 && (
                  <div className="w-6 sm:w-16 md:w-20 h-[2px] bg-artisan-light/5 relative overflow-hidden">
                    <motion.div
                      className="absolute inset-0 bg-artisan-grey origin-left"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: checkoutStep > item.step ? 1 : 0 }}
                      transition={{ duration: 0.4 }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">

          {/* STEP 4: SUCCESS SUMMARY SCREEN */}
          {checkoutStep === 4 ? (
            <motion.div
              key="checkout-success"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-xl mx-auto flex flex-col items-center justify-center text-center py-16 px-6 border border-artisan-light/5 bg-artisan-light/[0.01]"
            >
              <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mb-8 border border-green-500/25">
                <Check className="w-10 h-10 stroke-[3px]" />
              </div>
              <div className="space-y-4">
                <span className="text-[9px] font-mono font-bold text-green-500 uppercase tracking-[0.5em] block">Payment Successful</span>
                <h1 className="text-4xl md:text-5xl font-display font-extrabold uppercase tracking-tighter leading-none text-artisan-light">
                  ORDER <br />
                  <span className="text-outline">PLACED.</span>
                </h1>
                <p className="text-xs font-mono text-artisan-grey uppercase tracking-widest pt-2">Order ID: #{orderId}</p>
              </div>
              <p className="text-xs text-artisan-light/40 font-mono uppercase tracking-widest max-w-sm pt-6 leading-relaxed">
                Your medical supplies order has been verified. Packets will be prepared and shipped shortly.
              </p>
              <div className="flex flex-col gap-3 w-full pt-8 px-4 max-w-sm">
                {completedOrder && (
                  <button
                    onClick={() => downloadOrderReceipt(completedOrder)}
                    className="w-full py-4 bg-artisan-light text-artisan-dark text-[9px] font-mono font-bold uppercase tracking-widest hover:bg-artisan-grey hover:text-artisan-dark transition-all flex items-center justify-center gap-2 rounded-full cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-artisan-dark" />
                    Download Invoice Receipt
                  </button>
                )}
                
                <div className="grid grid-cols-2 gap-3 w-full">
                  <Link
                    to="/history"
                    className="py-4 border border-artisan-light/20 text-[9px] font-mono font-bold uppercase tracking-widest hover:bg-artisan-light hover:text-artisan-dark hover:border-artisan-light transition-all text-center flex items-center justify-center gap-2 rounded-full"
                  >
                    View Orders
                  </Link>
                  <Link
                    to="/allproduct"
                    className="py-4 bg-artisan-grey text-artisan-dark text-[9px] font-mono font-bold uppercase tracking-widest hover:bg-artisan-light transition-all text-center flex items-center justify-center gap-2 rounded-full"
                  >
                    Back to Shop
                  </Link>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">

              {/* LEFT MAIN WINDOW */}
              <div className="lg:col-span-8 space-y-12">

                {/* BREADCRUMB / GO BACK */}
                <div className="flex items-center justify-between">
                  {checkoutStep > 0 ? (
                    <button
                      onClick={() => changeStep(checkoutStep - 1)}
                      className="inline-flex items-center gap-2 text-[9px] font-mono font-bold uppercase tracking-widest text-artisan-light/40 hover:text-artisan-light transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back
                    </button>
                  ) : (
                    <Link
                      to="/allproduct"
                      className="inline-flex items-center gap-2 text-[9px] font-mono font-bold uppercase tracking-widest text-artisan-light/40 hover:text-artisan-light transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back to Catalog
                    </Link>
                  )}
                  {checkoutStep === 0 && cartItems.length > 0 && (
                    <span className="text-[9px] font-mono text-artisan-light/25 uppercase tracking-widest">
                      Cart ({cartItems.reduce((acc, curr) => acc + curr.quantity, 0)} Items)
                    </span>
                  )}
                </div>

                <AnimatePresence mode="wait">
                  {/* TRANSITION LOADER BETWEEN STEPS */}
                  {isTransitioningStep || isProcessing ? (
                    <motion.div
                      key="step-loader"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="h-[350px] flex flex-col items-center justify-center space-y-4"
                    >
                      <Loader2 className="w-8 h-8 text-artisan-grey animate-spin" />
                      <span className="text-[9px] font-mono text-artisan-light/20 uppercase tracking-[0.3em]">Verifying Next Step...</span>
                    </motion.div>
                  ) : (
                    <motion.div
                      key={`step-content-${checkoutStep}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-8"
                    >
                      {/* --- CART VIEW (STEP 0) --- */}
                      {checkoutStep === 0 && (
                        <div className="space-y-8">
                          <div className="space-y-3">
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-extrabold uppercase tracking-tighter leading-[0.85] text-artisan-light">
                              YOUR <br />
                              <span className="text-outline">CART.</span>
                            </h1>
                          </div>

                          {/* Stock Error Banner */}
                          {hasStockErrors && (
                            <div className="p-5 border border-red-500/20 bg-red-500/[0.02] text-red-400 flex items-start gap-4">
                              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                              <div className="space-y-1 text-xs">
                                <p className="font-mono font-bold uppercase tracking-wider">Stock Limit Exceeded</p>
                                <p className="text-[11px] text-red-400/80 leading-relaxed font-mono">
                                  Some items in your cart are out of stock or exceed available quantity. Please adjust quantities to proceed.
                                </p>
                              </div>
                            </div>
                          )}

                          {cartItems.length === 0 ? (
                            <div className="border border-artisan-light/5 bg-artisan-light/[0.005] p-16 md:p-24 text-center space-y-6">
                              <ShoppingBag className="w-12 h-12 text-artisan-light/10 mx-auto" />
                              <div className="space-y-2">
                                <h3 className="text-sm font-mono uppercase tracking-[0.2em] text-artisan-light/50">Your Cart is Empty</h3>
                                <p className="text-[10px] text-artisan-light/20 font-mono uppercase tracking-widest">No products added for checkout.</p>
                              </div>
                              <Link
                                to="/allproduct"
                                className="inline-flex items-center gap-3 px-8 py-4 bg-artisan-light text-artisan-dark text-[9px] font-mono font-bold uppercase tracking-widest hover:bg-artisan-grey transition-all rounded-xl"
                              >
                                Shop Products
                                <ArrowRight className="w-4 h-4" />
                              </Link>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {cartItems.map((item, idx) => {
                                const isOutOfStock = !item.product.active || item.product.quantity === 0
                                const isQtyExceeded = item.product.quantity < item.quantity
                                const itemError = isOutOfStock || isQtyExceeded

                                return (
                                  <div
                                    key={item.product?._id || idx}
                                    className={`group flex flex-col sm:flex-row sm:items-center justify-between border p-4 sm:p-5 gap-4 sm:gap-6 relative transition-all rounded-xl ${itemError
                                      ? 'bg-red-500/[0.01] border-red-500/20 hover:border-red-500/35'
                                      : 'bg-artisan-light/[0.005] border-artisan-light/5 hover:border-artisan-grey/25'
                                      }`}
                                  >
                                    <div className="flex items-center gap-4 sm:gap-6 flex-1 min-w-0">
                                      {/* Product Image */}
                                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-artisan-dark border border-artisan-light/10 overflow-hidden shrink-0 flex items-center justify-center relative rounded-xl">
                                        {item.product?.image ? (
                                          <img
                                            src={item.product.image}
                                            alt={item.product.name}
                                            className="w-full h-full object-cover transition-all duration-500"
                                          />
                                        ) : (
                                          <ShoppingBag className="w-6 h-6 text-artisan-light/10" />
                                        )}
                                      </div>

                                      {/* Info details */}
                                      <div className="space-y-1.5 flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <span className="px-1.5 py-0.5 bg-artisan-light/5 text-[7px] sm:text-[8px] font-mono text-artisan-grey border border-artisan-light/10 uppercase tracking-widest">
                                            {item.product?.category}
                                          </span>
                                          <span className="text-[7px] sm:text-[8px] font-mono text-artisan-light/20 uppercase tracking-widest">
                                            SKU: {item.product?.sku}
                                          </span>
                                          {isOutOfStock && (
                                            <span className="px-1.5 py-0.5 bg-red-500/10 text-[7px] sm:text-[8px] font-mono font-bold text-red-400 border border-red-500/20 uppercase tracking-widest">
                                              Out of stock
                                            </span>
                                          )}
                                          {!isOutOfStock && isQtyExceeded && (
                                            <span className="px-1.5 py-0.5 bg-red-500/10 text-[7px] sm:text-[8px] font-mono font-bold text-red-400 border border-red-500/20 uppercase tracking-widest">
                                              Only {item.product.quantity} left
                                            </span>
                                          )}
                                        </div>
                                        <h3 className="text-sm sm:text-base font-display font-extrabold uppercase tracking-tight text-artisan-light group-hover:text-artisan-grey transition-colors truncate">
                                          {item.product?.name}
                                        </h3>
                                        <p className="text-[9px] sm:text-[10px] text-artisan-light/40 font-mono">
                                          ₹{item.product?.price?.toLocaleString()} each
                                        </p>
                                      </div>
                                    </div>

                                    {/* Quantity Controls & Price */}
                                    <div className="flex items-center justify-between sm:justify-end gap-6 sm:gap-8 border-t sm:border-t-0 border-artisan-light/5 pt-4 sm:pt-0 shrink-0">

                                      {/* Counter */}
                                      <div className={`flex items-center border bg-artisan-dark ${itemError ? 'border-red-500/20' : 'border-artisan-light/10'
                                        }`}>
                                        <button
                                          onClick={() => updateQuantity(item.product?._id, item.quantity, -1)}
                                          disabled={updatingItemId === item.product?._id}
                                          className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center hover:bg-artisan-light/5 hover:text-artisan-grey disabled:opacity-30 transition-colors"
                                        >
                                          <Minus className="w-3 h-3" />
                                        </button>
                                        <span className="w-8 sm:w-10 text-center text-[10px] sm:text-[11px] font-mono font-bold">
                                          {updatingItemId === item.product?._id ? (
                                            <Loader2 className="w-3 h-3 animate-spin mx-auto text-artisan-grey" />
                                          ) : (
                                            item.quantity
                                          )}
                                        </span>
                                        <button
                                          onClick={() => updateQuantity(item.product?._id, item.quantity, 1)}
                                          disabled={updatingItemId === item.product?._id || item.quantity >= (item.product?.quantity || 99)}
                                          className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center hover:bg-artisan-light/5 hover:text-artisan-grey disabled:opacity-30 transition-colors"
                                        >
                                          <Plus className="w-3 h-3" />
                                        </button>
                                      </div>

                                      {/* Sum price */}
                                      <div className="text-right min-w-[65px] sm:min-w-[70px]">
                                        <span className={`text-[11px] sm:text-xs font-mono font-bold block ${itemError ? 'text-red-400' : 'text-artisan-light'}`}>
                                          ₹{((item.product?.price || 0) * item.quantity).toLocaleString()}
                                        </span>
                                      </div>

                                      {/* Remove item button */}
                                      <button
                                        onClick={() => handleRemoveItem(item.product?._id)}
                                        disabled={updatingItemId === item.product?._id}
                                        className="w-8 h-8 flex items-center justify-center text-artisan-light/20 hover:text-red-500 border border-transparent hover:border-red-500/10 hover:bg-red-500/5 transition-all"
                                        title="Remove item"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      )}

                      {/* --- ADDRESS VIEW (STEP 1) --- */}
                      {checkoutStep === 1 && (
                        <div className="space-y-8">
                          <div className="space-y-3">
                            <span className="text-xs font-mono font-bold text-artisan-grey uppercase tracking-[0.5em] block">Shipping Destination</span>
                            <h1 className="text-4xl md:text-5xl font-display font-extrabold uppercase tracking-tighter leading-none">
                              SHIPPING <br />
                              <span className="text-outline">ADDRESS.</span>
                            </h1>
                          </div>

                          {/* Inline Form Add / Edit */}
                          {isAddingAddress ? (
                            <div className="border border-artisan-light/10 p-5 sm:p-8 bg-artisan-light/[0.005] space-y-6 rounded-xl">
                              <h3 className="text-xs font-mono font-bold uppercase tracking-[0.3em] text-artisan-grey">
                                {editingAddressId ? 'Edit Shipping Address' : 'Add Shipping Address'}
                              </h3>
                              <form onSubmit={handleAddressSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                  {/* Label Selection */}
                                  <div className="space-y-2">
                                    <label className="text-[8px] font-mono font-bold text-artisan-light/40 uppercase tracking-widest">Address Label *</label>
                                    <div className="flex gap-2 flex-wrap">
                                      {['Home', 'Office', 'Clinic'].map((tag) => (
                                        <button
                                          key={tag}
                                          type="button"
                                          onClick={() => setAddressForm({ ...addressForm, tag })}
                                          className={`px-3 py-1.5 text-[9px] font-mono font-bold uppercase tracking-widest border transition-all rounded-full ${addressForm.tag === tag
                                            ? 'bg-artisan-light border-artisan-light text-artisan-dark'
                                            : 'border-artisan-light/10 text-artisan-light hover:border-artisan-light/35'
                                            }`}
                                        >
                                          {tag}
                                        </button>
                                      ))}
                                      <input
                                        type="text"
                                        placeholder="Other"
                                        value={['Home', 'Office', 'Clinic'].includes(addressForm.tag) ? '' : addressForm.tag}
                                        onChange={(e) => setAddressForm({ ...addressForm, tag: e.target.value || 'Home' })}
                                        className="flex-1 min-w-[80px] bg-transparent border-b border-artisan-light/15 focus:border-artisan-light outline-none text-xs font-mono px-2"
                                      />
                                    </div>
                                    {addressErrors.tag && <p className="text-[10px] font-mono text-red-500">{addressErrors.tag}</p>}
                                  </div>

                                  {/* Pincode Input */}
                                  <div className="space-y-2">
                                    <label className="text-[8px] font-mono font-bold text-artisan-light/40 uppercase tracking-widest">Pincode (6 digits) *</label>
                                    <div className="relative">
                                      <input
                                        type="text"
                                        placeholder="600001"
                                        maxLength={6}
                                        value={addressForm.pincode}
                                        onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value.replace(/\D/g, '') })}
                                        className={`w-full bg-transparent border-b-2 outline-none text-sm font-mono pb-2 transition-colors pr-8 ${addressErrors.pincode ? 'border-red-500/50 focus:border-red-500' : 'border-artisan-light/10 focus:border-artisan-light'
                                          }`}
                                      />
                                      {isFetchingPincode && (
                                        <Loader2 className="absolute right-2 bottom-2 w-3.5 h-3.5 animate-spin text-artisan-light/40" />
                                      )}
                                    </div>
                                    {addressErrors.pincode && <p className="text-[10px] font-mono text-red-500">{addressErrors.pincode}</p>}
                                  </div>
                                </div>

                                <div className="space-y-6">
                                  {/* Flat/Door No */}
                                  <div className="space-y-2">
                                    <label className="text-[8px] font-mono font-bold text-artisan-light/40 uppercase tracking-widest">Flat, Door No, Building Name *</label>
                                    <input
                                      type="text"
                                      placeholder="Door no. 12B, Block 3"
                                      value={addressForm.doorNumber}
                                      onChange={(e) => setAddressForm({ ...addressForm, doorNumber: e.target.value })}
                                      className={`w-full bg-transparent border-b-2 outline-none text-sm font-mono pb-2 transition-colors ${addressErrors.doorNumber ? 'border-red-500/50 focus:border-red-500' : 'border-artisan-light/10 focus:border-artisan-light'
                                        }`}
                                    />
                                    {addressErrors.doorNumber && <p className="text-[10px] font-mono text-red-500">{addressErrors.doorNumber}</p>}
                                  </div>

                                  {/* Area Line 2 */}
                                  <div className="space-y-2">
                                    <label className="text-[8px] font-mono font-bold text-artisan-light/40 uppercase tracking-widest">Street Address, Colony</label>
                                    <input
                                      type="text"
                                      placeholder="Netaji Street, Polichalur"
                                      value={addressForm.secondLine}
                                      onChange={(e) => setAddressForm({ ...addressForm, secondLine: e.target.value })}
                                      className="w-full bg-transparent border-b-2 border-artisan-light/10 focus:border-artisan-light outline-none text-sm font-mono pb-2"
                                    />
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                    {/* Landmark */}
                                    <div className="space-y-2">
                                      <label className="text-[8px] font-mono font-bold text-artisan-light/40 uppercase tracking-widest">Landmark</label>
                                      <input
                                        type="text"
                                        placeholder="Opp. Apollo Pharmacy"
                                        value={addressForm.landmark}
                                        onChange={(e) => setAddressForm({ ...addressForm, landmark: e.target.value })}
                                        className="w-full bg-transparent border-b-2 border-artisan-light/10 focus:border-artisan-light outline-none text-xs font-mono pb-2"
                                      />
                                    </div>

                                    {/* City */}
                                    <div className="space-y-2">
                                      <label className="text-[8px] font-mono font-bold text-artisan-light/40 uppercase tracking-widest">City *</label>
                                      <input
                                        type="text"
                                        placeholder="Chennai"
                                        value={addressForm.city}
                                        onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                                        disabled
                                        className={`w-full bg-transparent border-b-2 outline-none text-sm font-mono pb-2 transition-colors opacity-50 cursor-not-allowed ${addressErrors.city ? 'border-red-500/50 focus:border-red-500' : 'border-artisan-light/10 focus:border-artisan-light'
                                          }`}
                                      />
                                      {addressErrors.city && <p className="text-[10px] font-mono text-red-500">{addressErrors.city}</p>}
                                    </div>

                                    {/* State */}
                                    <div className="space-y-2">
                                      <label className="text-[8px] font-mono font-bold text-artisan-light/40 uppercase tracking-widest">State *</label>
                                      <input
                                        type="text"
                                        placeholder="Tamil Nadu"
                                        value={addressForm.state}
                                        onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                                        disabled
                                        className={`w-full bg-transparent border-b-2 outline-none text-sm font-mono pb-2 transition-colors opacity-50 cursor-not-allowed ${addressErrors.state ? 'border-red-500/50 focus:border-red-500' : 'border-artisan-light/10 focus:border-artisan-light'
                                          }`}
                                      />
                                      {addressErrors.state && <p className="text-[10px] font-mono text-red-500">{addressErrors.state}</p>}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex gap-4 pt-4 border-t border-artisan-light/5">
                                  <button
                                    type="submit"
                                    disabled={isProcessing}
                                    className="px-5 py-3 bg-artisan-light text-artisan-dark text-[10px] font-mono font-bold uppercase tracking-widest hover:bg-artisan-grey transition-all flex items-center gap-2 rounded-full"
                                  >
                                    {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Save Address'}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setIsAddingAddress(false)
                                      setEditingAddressId(null)
                                      lastFetchedPincodeRef.current = ''
                                      setAddressErrors({})
                                    }}
                                    className="px-5 py-3 border border-artisan-light/10 text-[10px] font-mono font-bold uppercase tracking-widest text-artisan-light/60 hover:text-artisan-light transition-all rounded-full"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </form>
                            </div>
                          ) : (
                            <div className="space-y-6">
                              {/* Address Cards Grid */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {user?.addresses && user.addresses.length > 0 ? (
                                  user.addresses.map((addr) => (
                                    <div
                                      key={addr._id}
                                      onClick={() => setSelectedAddressId(addr._id)}
                                      className={`group p-5 border cursor-pointer transition-all relative flex flex-col justify-between min-h-[160px] rounded-xl ${selectedAddressId === addr._id
                                        ? 'bg-artisan-light/[0.02] border-artisan-grey'
                                        : 'bg-artisan-light/[0.003] border-artisan-light/5 hover:border-artisan-light/20'
                                        }`}
                                    >
                                      <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                          <span className={`px-2 py-0.5 text-[8px] font-mono font-bold uppercase tracking-widest border rounded-xl ${selectedAddressId === addr._id
                                            ? 'bg-artisan-grey text-artisan-dark border-artisan-grey'
                                            : 'border-artisan-light/15 text-artisan-grey'
                                            }`}>
                                            {addr.tag}
                                          </span>
                                          {selectedAddressId === addr._id && (
                                            <CheckCircle2 className="w-4 h-4 text-artisan-light animate-pulse" />
                                          )}
                                        </div>
                                        <div className="text-xs font-mono space-y-1 text-artisan-light/75 leading-relaxed">
                                          <p className="font-bold text-artisan-light">{addr.doorNumber}</p>
                                          {addr.secondLine && <p>{addr.secondLine}</p>}
                                          {addr.landmark && <p className="text-[10px] text-artisan-light/40">Near: {addr.landmark}</p>}
                                          <p>{addr.city}, {addr.state} - {addr.pincode}</p>
                                        </div>
                                      </div>

                                      {/* Always show Edit on mobile so touch triggers work, hide/fade on desktop */}
                                      <div className="flex items-center gap-4 mt-6 pt-3 border-t border-artisan-light/5">
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            handleStartEditAddress(addr)
                                          }}
                                          className="text-[9px] font-mono font-bold uppercase tracking-widest text-artisan-grey hover:text-artisan-light inline-flex items-center gap-1.5 rounded-full"
                                        >
                                          <Edit2 className="w-3 h-3" />
                                          Edit Address
                                        </button>
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  <div className="col-span-1 sm:col-span-2 border border-artisan-light/5 p-12 text-center space-y-4 rounded-xl">
                                    <MapPin className="w-10 h-10 text-artisan-light/10 mx-auto" />
                                    <p className="text-xs font-mono uppercase tracking-widest text-artisan-light/40">No saved addresses found in profile.</p>
                                  </div>
                                )}
                              </div>

                              {/* Add address trigger */}
                              {(!user?.addresses || user.addresses.length < 4) && (
                                <button
                                  onClick={() => {
                                    setAddressForm({
                                      tag: 'Home',
                                      doorNumber: '',
                                      secondLine: '',
                                      landmark: '',
                                      city: '',
                                      state: '',
                                      pincode: ''
                                    })
                                    lastFetchedPincodeRef.current = ''
                                    setAddressErrors({})
                                    setIsAddingAddress(true)
                                  }}
                                  className="w-full md:w-auto px-6 py-4 border border-dashed border-artisan-light/20 hover:border-artisan-grey hover:bg-artisan-light/[0.01] transition-all flex items-center justify-center gap-3 text-[9px] font-mono font-bold uppercase tracking-widest text-artisan-grey hover:text-artisan-light rounded-full"
                                >
                                  <PlusCircle className="w-4 h-4" />
                                  Add Shipping Address
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* --- REVIEW VIEW (STEP 2) --- */}
                      {checkoutStep === 2 && (
                        <div className="space-y-8">
                          <div className="space-y-3">
                            <span className="text-xs font-mono font-bold text-artisan-grey uppercase tracking-[0.5em] block">Review</span>
                            <h1 className="text-4xl md:text-5xl font-display font-extrabold uppercase tracking-tighter leading-none">
                              REVIEW <br />
                              <span className="text-outline">ORDER.</span>
                            </h1>
                          </div>

                          <div className="space-y-6">

                            {/* Address Summary */}
                            <div className="border border-artisan-light/5 p-6 bg-artisan-light/[0.003] space-y-4 rounded-xl">
                              <div className="flex items-center justify-between border-b border-artisan-light/5 pb-3">
                                <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-artisan-grey">Shipping Address</span>
                                <button
                                  onClick={() => changeStep(1)}
                                  className="text-[9px] font-mono font-bold uppercase tracking-widest text-artisan-light/40 hover:text-artisan-light rounded-full"
                                >
                                  Change Address
                                </button>
                              </div>
                              {(() => {
                                const addr = user?.addresses?.find(a => a._id === selectedAddressId)
                                if (!addr) return <p className="text-xs text-red-400">Please choose an address.</p>
                                return (
                                  <div className="text-xs font-mono text-artisan-light/70 leading-relaxed">
                                    <span className="px-2 py-0.5 bg-artisan-light/5 border border-artisan-light/10 text-[8px] font-bold uppercase tracking-widest text-artisan-grey mr-2 inline-block mb-2 rounded-xl">
                                      {addr.tag}
                                    </span>
                                    <p className="font-bold text-artisan-light">{addr.doorNumber}</p>
                                    {addr.secondLine && <p>{addr.secondLine}</p>}
                                    <p>{addr.city}, {addr.state} - {addr.pincode}</p>
                                  </div>
                                )
                              })()}
                            </div>

                            {/* Items Summary list */}
                            <div className="border border-artisan-light/5 p-6 bg-artisan-light/[0.003] space-y-4 rounded-xl">
                              <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-artisan-grey block border-b border-artisan-light/5 pb-3">
                                Items Summary ({cartItems.reduce((acc, curr) => acc + curr.quantity, 0)} Items)
                              </span>
                              <div className="divide-y divide-artisan-light/5 max-h-[220px] overflow-y-auto pr-2 scrollbar-hide">
                                {cartItems.map((item, idx) => (
                                  <div key={idx} className="flex justify-between items-center py-3.5 first:pt-0 last:pb-0">
                                    <div className="space-y-1 min-w-0 pr-4">
                                      <p className="text-xs font-mono font-bold text-artisan-light uppercase tracking-wide truncate">{item.product?.name}</p>
                                      <p className="text-[8px] font-mono text-artisan-light/35 uppercase">Qty: {item.quantity} x ₹{item.product?.price?.toLocaleString()}</p>
                                    </div>
                                    <span className="text-xs font-mono font-bold text-artisan-light shrink-0">₹{((item.product?.price || 0) * item.quantity).toLocaleString()}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Information notice */}
                            <div className="flex items-center gap-4 p-5 bg-artisan-light/[0.01] border border-artisan-light/5 rounded-xl">
                              <FileText className="w-5 h-5 text-artisan-grey shrink-0" />
                              <p className="text-[8px] font-mono text-artisan-grey uppercase tracking-widest leading-relaxed">
                                "Please verify your shipping details and items before continuing. You cannot change your cart after starting payment."
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* --- PAYMENT VIEW (STEP 3) --- */}
                      {checkoutStep === 3 && (
                        <div className="space-y-8">
                          <div className="space-y-3">
                            <span className="text-xs font-mono font-bold text-artisan-grey uppercase tracking-[0.5em] block">Payment Method</span>
                            <h1 className="text-4xl md:text-5xl font-display font-extrabold uppercase tracking-tighter leading-none">
                              CHOOSE <br />
                              <span className="text-outline">PAYMENT.</span>
                            </h1>
                          </div>

                          <div className="space-y-6 bg-artisan-light/[0.005] border border-artisan-light/10 p-6 md:p-10 rounded-xl">
                            {/* Payment Info / Online Gateway details */}
                            <div className="p-6 border border-artisan-light/10 bg-artisan-light/[0.01] rounded-xl flex items-start gap-4">
                              <div className="p-2 rounded-xl bg-artisan-light text-artisan-dark">
                                <CreditCard className="w-5 h-5" />
                              </div>
                              <div className="space-y-1 text-xs flex-1">
                                <p className="font-mono font-bold uppercase tracking-wider text-artisan-light">Pay Online securely</p>
                                <p className="text-[10px] text-artisan-light/40 uppercase tracking-wider leading-relaxed font-mono">
                                  Pay securely via cards, UPI, or netbanking using Razorpay.
                                </p>
                              </div>
                            </div>

                            {/* Payment Summary & Action Button */}
                            <div className="max-w-md mx-auto pt-6 border-t border-artisan-light/5 text-center space-y-6">
                              <div className="space-y-1">
                                <span className="text-[10px] text-artisan-light/35 font-mono uppercase tracking-widest block">
                                  Online Billing Amount
                                </span>
                                <span className="text-3xl font-display font-extrabold text-artisan-light tracking-tighter">
                                  ₹{orderTotal.toLocaleString()}
                                </span>
                              </div>

                              <div className="flex flex-col gap-4">
                                <button
                                  type="button"
                                  onClick={handleRazorpayPayment}
                                  disabled={isProcessing}
                                  className="w-full py-4.5 bg-artisan-light text-artisan-dark font-display font-black uppercase tracking-[0.3em] text-xs hover:bg-artisan-grey hover:text-artisan-light transition-all flex items-center justify-center gap-3 relative rounded-full"
                                >
                                  Pay with Razorpay
                                  <ArrowRight className="w-4 h-4" />
                                </button>

                                <div className="relative flex py-2 items-center">
                                  <div className="flex-grow border-t border-artisan-light/5"></div>
                                  <span className="flex-shrink mx-4 text-[8px] font-mono text-artisan-light/20 uppercase tracking-[0.4em]">Or</span>
                                  <div className="flex-grow border-t border-artisan-light/5"></div>
                                </div>

                                <button
                                  type="button"
                                  onClick={handleSimulatePayment}
                                  disabled={isProcessing}
                                  className="w-full py-4 border border-dashed border-red-500/35 text-red-500 font-mono font-bold uppercase tracking-[0.2em] text-[9px] hover:bg-red-500/[0.01] hover:border-red-500 transition-all flex items-center justify-center gap-2 rounded-full"
                                >
                                  Simulate Online Payment (Dev Mode)
                                </button>
                              </div>

                              <p className="text-[8px] font-mono text-artisan-light/25 uppercase tracking-widest pt-2">
                                🔒 Safe & Secure Checkout.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* --- MOBILE ACTION BUTTONS (Visible below items list on mobile viewports) --- */}
                {cartItems.length > 0 && !isTransitioningStep && !isProcessing && (
                  <div className="block lg:hidden pt-4 border-t border-artisan-light/5">
                    {checkoutStep === 0 && (
                      <button
                        onClick={() => changeStep(1)}
                        disabled={hasStockErrors}
                        className="w-full py-4 bg-artisan-light text-artisan-dark font-display font-black uppercase tracking-[0.3em] text-xs hover:bg-artisan-grey transition-all flex items-center justify-center gap-3 disabled:opacity-30 disabled:pointer-events-none"
                      >
                        Proceed to Checkout
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}

                    {checkoutStep === 1 && (
                      <button
                        onClick={() => {
                          if (!selectedAddressId) {
                            addToast('Please select shipping address', 'error')
                            return
                          }
                          changeStep(2)
                        }}
                        className="w-full py-4 bg-artisan-light text-artisan-dark font-display font-black uppercase tracking-[0.3em] text-xs hover:bg-artisan-grey transition-all flex items-center justify-center gap-3 rounded-full"
                      >
                        Next Step
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}

                    {checkoutStep === 2 && (
                      <button
                        onClick={handleInitiateCheckout}
                        className="w-full py-4 bg-artisan-light text-artisan-dark font-display font-black uppercase tracking-[0.3em] text-xs hover:bg-artisan-grey transition-all flex items-center justify-center gap-3 rounded-full"
                      >
                        Confirm Details
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}

              </div>

              {/* RIGHT SIDEBAR: PRICE SUMMARY & STEP OPERATIONS (Sticky on Desktop) */}
              <aside className="lg:col-span-4 lg:sticky lg:top-36 space-y-6">
                <div className="border border-artisan-light/10 bg-artisan-light/[0.003] p-6 md:p-8 space-y-6 rounded-xl">

                  <h3 className="text-xs font-mono font-bold text-artisan-light uppercase tracking-[0.4em]">Order Summary</h3>

                  <div className="space-y-4">
                    <div className="flex justify-between text-[9px] font-mono uppercase tracking-widest">
                      <span className="text-artisan-light/45">Subtotal</span>
                      <span className="text-artisan-light font-bold">₹{itemsSubtotal.toLocaleString()}</span>
                    </div>
                    {appliedCoupon && (
                      <div className="flex justify-between text-[9px] font-mono uppercase tracking-widest text-green-500 font-bold">
                        <span>Discount ({appliedCoupon.code})</span>
                        <span>-₹{discountAmount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-[9px] font-mono uppercase tracking-widest">
                      <span className="text-artisan-light/45">Tax & Service Fee (5%)</span>
                      <span className="text-artisan-light font-bold">₹{serviceFee.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-[9px] font-mono uppercase tracking-widest">
                      <span className="text-artisan-light/45">Shipping</span>
                      <span className="text-artisan-light font-bold">
                        {shippingFee === 0 ? (
                          <span className="text-green-500 font-bold font-mono">Free</span>
                        ) : (
                          `₹${shippingFee.toLocaleString()}`
                        )}
                      </span>
                    </div>


                    {shippingFee > 0 && itemsSubtotal > 0 && (
                      <div className="flex rounded-xl items-center gap-2 text-[7px] font-mono text-artisan-light/50 uppercase bg-artisan-light/[0.02] p-2 border border-artisan-light/5">
                        <Truck className="w-3.5 h-3.5 shrink-0" />
                        <span>Add ₹{(5000 - itemsSubtotal).toLocaleString()} more for free shipping</span>
                      </div>
                    )}

                    {/* Promo Code section */}
                    {itemsSubtotal > 0 && checkoutStep < 3 && (
                      <div className="space-y-3 pt-2">
                        <div className="h-px bg-artisan-light/5" />
                        <span className="text-[8px] font-mono font-bold text-artisan-light/40 uppercase tracking-widest block">Promo Code</span>

                        {appliedCoupon ? (
                          <div className="flex items-center justify-between border border-green-500/20 bg-green-500/[0.02] p-2">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono font-bold text-green-500 uppercase tracking-widest">{appliedCoupon.code}</span>
                              <span className="text-[8px] font-mono text-green-500/60 uppercase">Applied</span>
                            </div>
                            <button
                              type="button"
                              onClick={handleRemoveCoupon}
                              className="text-[8px] font-mono font-bold uppercase tracking-widest text-red-500 hover:text-red-400 p-1 rounded-xl"
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <form onSubmit={handleApplyCoupon} className="flex gap-2">
                            <input
                              type="text"
                              placeholder="ENTER CODE"
                              value={couponCodeInput}
                              onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                              className="flex-1 bg-transparent border rounded-xl border-artisan-light/10 focus:border-artisan-grey/50 px-3 py-1.5 outline-none font-mono text-[10px] uppercase tracking-widest text-artisan-light placeholder:text-artisan-light/25 rounded-none"
                              disabled={isApplyingCoupon}
                            />
                            <button
                              type="submit"
                              disabled={isApplyingCoupon || !couponCodeInput.trim()}
                              className="px-4 bg-artisan-light/5 rounded-xl border border-artisan-light/10 text-artisan-light hover:bg-artisan-light hover:text-artisan-dark hover:border-artisan-light disabled:opacity-30 disabled:pointer-events-none transition-all font-mono text-[9px] font-bold uppercase tracking-widest shrink-0"
                            >
                              {isApplyingCoupon ? '...' : 'Apply'}
                            </button>
                          </form>
                        )}
                      </div>
                    )}

                    <div className="h-px bg-artisan-light/10 my-4" />

                    <div className="flex justify-between items-end">
                      <span className="text-xs font-mono font-bold text-artisan-grey uppercase tracking-[0.3em]">Total</span>
                      <span className="text-2xl font-display font-extrabold text-artisan-light tracking-tighter">
                        ₹{orderTotal.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* DESKTOP ACTION BUTTONS (Only visible on lg screens) */}
                  {cartItems.length > 0 && !isTransitioningStep && !isProcessing && (
                    <div className="hidden lg:block pt-2">
                      {checkoutStep === 0 && (
                        <button
                          onClick={() => changeStep(1)}
                          disabled={hasStockErrors}
                          className="w-full py-4.5 bg-artisan-light rounded-full text-artisan-dark font-display font-black uppercase tracking-[0.3em] text-xs hover:bg-artisan-grey transition-all flex items-center justify-center gap-3 disabled:opacity-30 disabled:pointer-events-none"
                        >
                          Proceed to Checkout
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      )}

                      {checkoutStep === 1 && (
                        <button
                          onClick={() => {
                            if (!selectedAddressId) {
                              addToast('Please select shipping address', 'error')
                              return
                            }
                            changeStep(2)
                          }}
                          className="w-full py-4.5 rounded-full bg-artisan-light text-artisan-dark font-display font-black uppercase tracking-[0.3em] text-xs hover:bg-artisan-grey transition-all flex items-center justify-center gap-3"
                        >
                          Next Step
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      )}

                      {checkoutStep === 2 && (
                        <button
                          onClick={handleInitiateCheckout}
                          className="w-full py-4.5 rounded-full bg-artisan-light text-artisan-dark font-display font-black uppercase tracking-[0.3em] text-xs hover:bg-artisan-grey transition-all flex items-center justify-center gap-3"
                        >
                          Confirm Details
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* TRUST / ASSURANCE NOTICE */}
                <div className="border rounded-xl border-artisan-light/5 p-5 space-y-3 bg-artisan-light/[0.003]">
                  <div className="flex items-center gap-3 text-[9px] font-mono text-artisan-grey font-bold uppercase tracking-widest">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>Quality Guaranteed</span>
                  </div>
                  <p className="text-[8px] font-mono text-artisan-light/20 uppercase tracking-wide leading-relaxed">
                    We check all surgical and medical items to guarantee their quality before shipping.
                  </p>
                </div>
              </aside>

            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
