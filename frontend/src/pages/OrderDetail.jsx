import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
   ArrowLeft,
   Package,
   MapPin,
   CreditCard,
   CheckCircle,
   Clock,
   Loader2,
   Copy,
   Check,
   Truck,
   AlertTriangle,
   ChevronRight,
   Calendar,
   FileText,
   CheckSquare,
   Star,
   Download
} from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { downloadOrderReceipt } from '../utils/orderReceipt';

export default function OrderDetail() {
   const { id } = useParams();
   const navigate = useNavigate();
   const { addToast } = useToast();
   const { user } = useAuth();

   const [loading, setLoading] = useState(true);
   const [order, setOrder] = useState(null);
   const [copied, setCopied] = useState(false);

   // States for inline reviews
   const [eligibilityChecked, setEligibilityChecked] = useState(false);
   const [reviewEligibility, setReviewEligibility] = useState({});
   const [reviewForms, setReviewForms] = useState({});

   const fetchOrderDetails = async (showLoading = true) => {
      try {
         if (showLoading) setLoading(true);
         const res = await api.get(`/orders/${id}`);
         setOrder(res.data.data);
      } catch (err) {
         console.error('Failed to fetch order details:', err);
         addToast('Failed to retrieve order records', 'error');
         if (user?.role === 'admin') {
            navigate('/admin');
         } else {
            navigate('/history');
         }
      } finally {
         if (showLoading) setLoading(false);
      }
   };

   // Initial fetch and polling interval (poll every 5 seconds to show simulated transit live!)
   useEffect(() => {
      fetchOrderDetails(true);

      const interval = setInterval(() => {
         fetchOrderDetails(false);
      }, 5000);

      return () => clearInterval(interval);
   }, [id]);

   // Check review eligibility for products when order is delivered
   useEffect(() => {
      if (order && order.shippingStatus === 'delivered' && user && !eligibilityChecked) {
         const checkAll = async () => {
            const eligibility = {};
            for (const item of order.items || []) {
               const pId = item.product?._id;
               if (pId) {
                  try {
                     const res = await api.get(`/listings/${pId}/can-review`);
                     eligibility[pId] = res.data.data;
                  } catch (err) {
                     console.error(`Failed to check review eligibility for product ${pId}`, err);
                  }
               }
            }
            setReviewEligibility(eligibility);
            setEligibilityChecked(true);
         };
         checkAll();
      }
   }, [order, user, eligibilityChecked]);

   const handleCopyText = (text) => {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
   };

   const handleImageChange = (productId, e) => {
      const files = Array.from(e.target.files);
      files.forEach(file => {
         const reader = new FileReader();
         reader.onloadend = () => {
            setReviewForms(prev => {
               const current = prev[productId] || { rating: 5, text: '', images: [], improvementReason: '', submitting: false };
               return {
                  ...prev,
                  [productId]: {
                     ...current,
                     images: [...current.images, reader.result]
                  }
               };
            });
         };
         reader.readAsDataURL(file);
      });
   };

   const removeReviewImage = (productId, index) => {
      setReviewForms(prev => {
         const current = prev[productId] || { rating: 5, text: '', images: [], improvementReason: '', submitting: false };
         return {
            ...prev,
            [productId]: {
               ...current,
               images: current.images.filter((_, i) => i !== index)
            }
         };
      });
   };

   const handleReviewSubmit = async (productId, e) => {
      e.preventDefault();
      const form = reviewForms[productId] || { rating: 5, text: '', images: [], improvementReason: '' };
      if (form.text.length > 500) {
         addToast('Review cannot exceed 500 characters', 'error');
         return;
      }
      try {
         setReviewForms(prev => ({
            ...prev,
            [productId]: { ...(prev[productId] || { rating: 5, text: '', images: [], improvementReason: '', submitting: false }), submitting: true }
         }));
         await api.post(`/listings/${productId}/reviews`, {
            rating: form.rating,
            text: form.text,
            images: form.images,
            improvementReason: form.rating < 5 ? form.improvementReason : undefined
         });
         addToast('Review submitted successfully!', 'success');
         setReviewEligibility(prev => ({
            ...prev,
            [productId]: { canReview: false, reason: 'already_reviewed', message: 'You have already submitted a review for this product.' }
         }));
      } catch (err) {
         addToast(err.response?.data?.message || 'Failed to submit review', 'error');
      } finally {
         setReviewForms(prev => ({
            ...prev,
            [productId]: { ...(prev[productId] || { rating: 5, text: '', images: [], improvementReason: '', submitting: false }), submitting: false }
         }));
      }
   };

   if (loading) {
      return (
         <div className="min-h-screen bg-artisan-dark flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-12 h-12 text-artisan-grey animate-spin" />
            <span className="text-[10px] font-mono text-artisan-light/20 uppercase tracking-widest">Loading order details...</span>
         </div>
      );
   }

   if (!order) return null;

   const orderIdFormatted = order._id.toUpperCase();
   const shortOrderId = order._id.substring(order._id.length - 8).toUpperCase();

   // Shipping Status Stepper Map
   const steps = [
      { key: 'pending', label: 'Placed', desc: 'Order Placed' },
      { key: 'shipped', label: 'Shipped', desc: 'Handed to courier' },
      { key: 'in_transit', label: 'In Transit', desc: 'On the way' },
      { key: 'out_for_delivery', label: 'Out for Delivery', desc: 'Out with driver' },
      { key: 'delivered', label: 'Delivered', desc: 'Delivered' }
   ];

   const getStepIndex = (status) => {
      switch (status) {
         case 'pending': return 0;
         case 'shipped': return 1;
         case 'in_transit': return 2;
         case 'out_for_delivery': return 3;
         case 'delivered': return 4;
         default: return 0;
      }
   };

   const activeStepIndex = getStepIndex(order.shippingStatus);
   const isCancelled = order.orderStatus === 'cancelled';

   // Status Badge Styles
   const orderStatusStyles = {
      completed: 'border-green-500 text-green-500 bg-green-500/5',
      processing: 'border-blue-500 text-blue-500 bg-blue-500/5',
      pending: 'border-yellow-500/50 text-yellow-400 bg-yellow-500/5',
      cancelled: 'border-red-500 text-red-500 bg-red-500/5',
      refunded: 'border-purple-500 text-purple-400 bg-purple-500/5'
   };

   const shippingStatusStyles = {
      delivered: 'border-green-500 text-green-500 bg-green-500/5',
      out_for_delivery: 'border-teal-500 text-teal-400 bg-teal-500/5',
      in_transit: 'border-blue-500 text-blue-400 bg-blue-500/5',
      shipped: 'border-indigo-500 text-indigo-400 bg-indigo-500/5',
      pending: 'border-yellow-500/50 text-yellow-400 bg-yellow-500/5',
      failed: 'border-red-500 text-red-500 bg-red-500/5'
   };

   return (
      <div className="min-h-screen bg-artisan-dark bg-noise pt-24 md:pt-32 pb-24 text-artisan-light font-body">
         <div className="container-custom max-w-5xl mx-auto space-y-8">
            
            {/* BACK LINK */}
            <div>
               <Link
                  to={user?.role === 'admin' ? '/admin' : '/history'}
                  className="inline-flex items-center gap-3 group"
               >
                  <div className="w-8 h-8 border border-artisan-light/10 flex items-center justify-center group-hover:bg-artisan-light group-hover:text-artisan-dark transition-all rounded-full">
                     <ArrowLeft className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono font-bold text-artisan-light/40 uppercase tracking-[0.4em] group-hover:text-artisan-light transition-colors">
                     {user?.role === 'admin' ? 'Back to System Admin' : 'Back to My Orders'}
                  </span>
               </Link>
            </div>

            {/* ORDER BRIEF INFO CARD */}
            <div className="border border-artisan-light/10 bg-artisan-light/[0.01] p-6 sm:p-8 space-y-6 rounded-xl">
               <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="space-y-2">
                     <span className="text-[9px] font-mono text-artisan-light/40 uppercase tracking-[0.3em] font-bold block">Order Confirmed</span>
                     <h1 className="text-3xl sm:text-4xl font-display font-black uppercase tracking-tight text-artisan-light">
                        ORDER <span className="text-outline">#{shortOrderId}</span>
                     </h1>
                     <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono text-artisan-light/50">
                        <span className="select-all text-artisan-grey font-bold">{order._id}</span>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                           <Calendar className="w-3.5 h-3.5" />
                           <span>{new Date(order.createdAt).toLocaleString()}</span>
                        </div>
                     </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-6">
                     <div className="flex flex-col items-start md:items-end">
                        <span className="text-[8px] font-mono text-artisan-light/50 uppercase tracking-widest block mb-1">Status</span>
                        <div className="flex gap-2">
                           <span className={`text-[9px] font-mono font-bold uppercase tracking-widest px-3 py-1 border rounded-xl ${orderStatusStyles[order.orderStatus] || 'border-artisan-light/10'}`}>
                              {order.orderStatus}
                           </span>
                           <span className={`text-[9px] font-mono font-bold uppercase tracking-widest px-3 py-1 border rounded-xl ${shippingStatusStyles[order.shippingStatus] || 'border-artisan-light/10'}`}>
                              {order.shippingStatus === 'pending' && order.paymentStatus === 'paid' ? 'processing' : order.shippingStatus}
                           </span>
                        </div>
                     </div>

                     <button
                        onClick={() => downloadOrderReceipt(order)}
                        className="h-10 px-4 bg-artisan-light hover:bg-artisan-grey text-artisan-dark font-mono text-[9px] font-bold uppercase tracking-widest transition-all rounded-full flex items-center justify-center gap-2 cursor-pointer shadow-md select-none"
                     >
                        <Download className="w-3.5 h-3.5 text-artisan-dark" />
                        Download Invoice
                     </button>
                  </div>
               </div>
            </div>

            {/* ROW 1: DELIVERY TIMELINE (FULL-WIDTH) */}
            {order.shippingTrackingNumber && (
               <div className="p-6 border border-artisan-light/10 bg-artisan-light/[0.01] space-y-6 rounded-xl">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-artisan-light/5 pb-3 gap-2">
                     <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-artisan-grey flex items-center gap-2">
                        <Truck className="w-4 h-4 text-artisan-grey" />
                        Delivery Timeline
                     </h3>
                     <div className="flex items-center gap-2 font-mono text-[10px] text-artisan-light/40">
                        <span>COURIER SHIPPING</span>
                        <span>•</span>
                        <span className="text-artisan-light/60 font-bold select-all">{order.shippingTrackingNumber}</span>
                        <button
                           onClick={() => handleCopyText(order.shippingTrackingNumber)}
                           className="text-artisan-light/50 hover:text-artisan-light/70 transition-colors p-0.5 rounded-full"
                           title="Copy Tracking Number"
                        >
                           {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                     </div>
                  </div>

                  {isCancelled ? (
                     <div className="p-4 border border-red-500/20 bg-red-500/5 text-red-500 text-xs font-mono uppercase flex items-center gap-2 rounded-xl">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Order delivery cancelled.</span>
                     </div>
                  ) : (
                     <div className="space-y-8 sm:space-y-0 sm:flex sm:justify-between relative py-2 isolate">
                        {/* Horizontal timeline track background line on larger screens */}
                        <div className="hidden sm:block absolute left-[10%] right-[10%] top-[15px] h-[3px] bg-artisan-light/20 -z-10 rounded-full" />
                        
                        {/* Horizontal flowing progress line on larger screens */}
                        <div 
                           className="hidden sm:block absolute left-[10%] top-[15px] h-[3px] bg-green-600 -z-10 transition-all duration-1000 ease-out rounded-full"
                           style={{ width: `${(activeStepIndex / (steps.length - 1)) * 80}%` }}
                        />

                        {/* Vertical timeline track background line on mobile */}
                        <div className="sm:hidden absolute left-4 top-4 bottom-4 w-[3px] bg-artisan-light/20 -z-10 rounded-full" />
                        
                        {/* Vertical flowing progress line on mobile */}
                        <div 
                           className="sm:hidden absolute left-4 top-4 w-[3px] bg-green-600 -z-10 transition-all duration-1000 ease-out rounded-full"
                           style={{ height: `calc((100% - 32px) * ${activeStepIndex / (steps.length - 1)})` }}
                        />

                        {steps.map((step, idx) => {
                           const completed = idx <= activeStepIndex;
                           const active = idx === activeStepIndex;

                           return (
                              <div key={idx} className="flex sm:flex-col items-center gap-4 sm:gap-2 text-left sm:text-center flex-1 relative">
                                 
                                 {/* Step node indicator dot */}
                                 <div className={`w-8 h-8 rounded-full border transition-all duration-500 flex items-center justify-center shrink-0 relative z-10 ${
                                    completed 
                                       ? active 
                                          ? 'bg-artisan-grey border-artisan-grey scale-110 shadow-lg shadow-artisan-grey/25 text-artisan-dark font-black' 
                                          : 'bg-green-600 border-green-600 text-white'
                                       : 'bg-artisan-dark border-artisan-light/15 text-artisan-light/40'
                                 }`}>
                                    {completed && !active ? (
                                       <Check className="w-4 h-4 text-artisan-dark font-black" />
                                    ) : active ? (
                                       <span className="w-2.5 h-2.5 rounded-full bg-artisan-dark animate-ping" />
                                    ) : (
                                       <span className="text-[10px] font-mono font-bold">{idx + 1}</span>
                                    )}
                                 </div>

                                 <div className={`space-y-0.5 transition-opacity duration-300 ${completed ? 'opacity-100' : 'opacity-35'}`}>
                                    <span className={`text-[10px] font-mono font-bold uppercase tracking-wider block ${active ? 'text-artisan-grey font-black' : 'text-artisan-light'}`}>
                                       {step.label}
                                    </span>
                                    <p className="text-[8px] text-artisan-light/45 uppercase tracking-wide max-w-[120px] mx-auto leading-normal">
                                       {step.desc}
                                    </p>
                                 </div>
                              </div>
                           );
                        })}
                     </div>
                  )}

                  {order.shippingStatus !== 'delivered' && !isCancelled && (
                     <div className="p-3 border border-blue-500/20 bg-blue-500/5 text-blue-400 text-[9px] font-mono uppercase tracking-wider flex items-center gap-3 animate-pulse rounded-xl">
                        <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                        <span>Live updates. Refreshing automatically.</span>
                     </div>
                  )}
               </div>
            )}

            {/* ROW 2: ORDER ITEMS & REVIEWS (FULL-WIDTH) */}
            <div className="p-6 border border-artisan-light/10 bg-artisan-light/[0.01] space-y-6 rounded-xl">
               <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-artisan-grey border-b border-artisan-light/5 pb-3 flex items-center gap-2">
                  <Package className="w-4 h-4 text-artisan-grey" />
                  Order Items
               </h3>
               <div className="divide-y divide-artisan-light/5">
                  {order.items?.map((item) => {
                     const pId = item.product?._id;
                     const eligibility = reviewEligibility[pId];
                     const formState = reviewForms[pId] || { rating: 5, text: '', images: [], improvementReason: '', submitting: false };

                     return (
                        <div key={item._id} className="py-6 space-y-6">
                           <div className="flex items-center justify-between gap-6 group">
                              <div className="flex items-center gap-4 min-w-0">
                                 <div className="w-14 h-14 bg-white border border-artisan-light/10 overflow-hidden shrink-0 flex items-center justify-center p-2 rounded-xl">
                                    <img 
                                       src={item.product?.image || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=200'} 
                                       alt={item.product?.name}
                                       className="max-h-full max-w-full object-contain grayscale"
                                    />
                                 </div>
                                 <div className="min-w-0 space-y-1">
                                    <h4 className="text-xs font-bold text-artisan-light truncate uppercase tracking-wide group-hover:text-artisan-grey transition-colors">
                                       <Link to={`/product/${pId || ''}`}>
                                          {item.product?.name || 'STAT Surgical Tool'}
                                       </Link>
                                    </h4>
                                    <p className="text-[9px] font-mono text-artisan-light/50">SKU: {item.product?.sku || 'N/A'}</p>
                                 </div>
                              </div>
                              <div className="text-right shrink-0">
                                 <span className="text-[10px] font-mono text-artisan-light/40 uppercase tracking-widest">{item.quantity} × </span>
                                 <span className="text-xs font-mono font-bold text-artisan-light">₹{(item.priceAtPurchase || item.product?.price || 0).toLocaleString()}</span>
                                 <p className="text-[9px] font-mono text-artisan-light/35 mt-0.5 font-bold">₹{(item.quantity * (item.priceAtPurchase || item.product?.price || 0)).toLocaleString()}</p>
                              </div>
                           </div>

                           {/* Inline Review Form for this Product */}
                           {order.shippingStatus === 'delivered' && eligibility && (
                              <div className="border border-artisan-light/5 bg-artisan-light/[0.002] p-5 rounded-xl space-y-4">
                                 {eligibility.canReview ? (
                                    <form onSubmit={(e) => handleReviewSubmit(pId, e)} className="space-y-4">
                                       <div className="space-y-1">
                                          <h5 className="text-[10px] font-mono font-bold uppercase tracking-wider text-artisan-grey">Write a Product Review</h5>
                                          <p className="text-[8px] font-mono text-artisan-light/50 uppercase tracking-widest">Share your clinical feedback for this surgical equipment.</p>
                                       </div>

                                       {/* Star Rating Selector */}
                                       <div className="space-y-1.5">
                                          <span className="text-[8px] font-mono font-bold text-artisan-light/40 uppercase tracking-[0.2em] block">Rating</span>
                                          <div className="flex items-center gap-1">
                                             {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                   key={star}
                                                   type="button"
                                                   onClick={() => {
                                                      setReviewForms(prev => ({
                                                         ...prev,
                                                         [pId]: {
                                                            ...(prev[pId] || { rating: 5, text: '', images: [], improvementReason: '', submitting: false }),
                                                            rating: star
                                                         }
                                                      }));
                                                   }}
                                                   className="text-artisan-light/20 hover:text-artisan-grey transition-colors p-0.5"
                                                >
                                                   <Star className={`w-5 h-5 ${star <= formState.rating ? 'fill-artisan-grey text-artisan-grey' : 'text-artisan-light/10'}`} />
                                                </button>
                                             ))}
                                          </div>
                                       </div>

                                       {/* Comment Input */}
                                       <div className="space-y-1.5">
                                          <div className="flex justify-between items-baseline">
                                             <span className="text-[8px] font-mono font-bold text-artisan-light/40 uppercase tracking-[0.2em]">Review Comment</span>
                                             <span className={`text-[8px] font-mono ${formState.text.length > 450 ? 'text-red-500' : 'text-artisan-light/20'}`}>
                                                {500 - formState.text.length} chars left
                                             </span>
                                          </div>
                                          <textarea
                                             value={formState.text}
                                             onChange={(e) => {
                                                setReviewForms(prev => ({
                                                   ...prev,
                                                   [pId]: {
                                                      ...(prev[pId] || { rating: 5, text: '', images: [], improvementReason: '', submitting: false }),
                                                      text: e.target.value.slice(0, 500)
                                                   }
                                                }));
                                             }}
                                             placeholder="Type your general observations or clinical user experience here..."
                                             required
                                             rows={3}
                                             className="w-full bg-artisan-light/5 border border-artisan-light/10 p-3 text-[11px] font-mono text-artisan-light uppercase outline-none focus:border-artisan-grey transition-colors placeholder:text-artisan-light/5 resize-none rounded-xl"
                                          />
                                       </div>

                                       {/* Improvement Reason */}
                                       {formState.rating < 5 && (
                                          <div className="space-y-1.5 border-l-2 border-red-500/20 pl-3 py-0.5">
                                             <span className="text-[8px] font-mono font-bold text-red-500/60 uppercase tracking-[0.2em] block">How can we improve?</span>
                                             <textarea
                                                value={formState.improvementReason || ''}
                                                onChange={(e) => {
                                                   setReviewForms(prev => ({
                                                      ...prev,
                                                      [pId]: {
                                                         ...(prev[pId] || { rating: 5, text: '', images: [], improvementReason: '', submitting: false }),
                                                         improvementReason: e.target.value.slice(0, 500)
                                                      }
                                                   }));
                                                }}
                                                placeholder="What could we have done better or improved with this product? (Optional)"
                                                rows={2}
                                                className="w-full bg-artisan-light/5 border border-artisan-light/10 p-3 text-[11px] font-mono text-artisan-light uppercase outline-none focus:border-artisan-grey transition-colors placeholder:text-artisan-light/5 resize-none rounded-xl"
                                             />
                                          </div>
                                       )}

                                       {/* Image Attachment */}
                                       <div className="space-y-2">
                                          <span className="text-[8px] font-mono font-bold text-artisan-light/40 uppercase tracking-[0.2em] block">Product Images (Optional)</span>
                                          <div className="flex flex-wrap items-center gap-3">
                                             <label className="w-16 h-16 border border-dashed border-artisan-light/15 hover:border-artisan-grey/50 transition-colors flex flex-col items-center justify-center cursor-pointer rounded-xl bg-artisan-light/[0.005]">
                                                <span className="text-[18px] font-bold text-artisan-light/35">+</span>
                                                <span className="text-[7px] font-mono text-artisan-light/50 uppercase tracking-widest mt-0.5">Add</span>
                                                <input 
                                                   type="file" 
                                                   accept="image/*" 
                                                   multiple 
                                                   onChange={(e) => handleImageChange(pId, e)} 
                                                   className="hidden" 
                                                />
                                             </label>

                                             {formState.images && formState.images.map((img, idx) => (
                                                <div key={idx} className="w-16 h-16 border border-artisan-light/10 relative overflow-hidden rounded-xl bg-white p-1">
                                                   <img src={img} alt="review attachment" className="w-full h-full object-contain grayscale" />
                                                   <button
                                                      type="button"
                                                      onClick={() => removeReviewImage(pId, idx)}
                                                      className="absolute top-1 right-1 w-4 h-4 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center text-[8px] font-bold shadow-md transition-colors"
                                                   >
                                                      ×
                                                   </button>
                                                </div>
                                             ))}
                                          </div>
                                       </div>

                                       <button
                                          type="submit"
                                          disabled={formState.submitting}
                                          className="px-6 py-2.5 bg-artisan-light text-artisan-dark font-mono font-bold text-[9px] uppercase tracking-widest hover:bg-artisan-grey disabled:bg-artisan-light/20 disabled:text-artisan-light/40 transition-all rounded-full flex items-center gap-2"
                                       >
                                          {formState.submitting ? (
                                             <>
                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                Submitting...
                                             </>
                                          ) : (
                                             'Submit Review'
                                          )}
                                       </button>
                                    </form>
                                 ) : (
                                    <div className="text-[10px] font-mono text-green-500/70 uppercase tracking-wider flex items-center gap-2">
                                       <CheckSquare className="w-4 h-4 shrink-0" />
                                       <span>You have already submitted a review for this product. Thank you!</span>
                                    </div>
                                 )}
                              </div>
                           )}
                        </div>
                     );
                  })}
               </div>
            </div>

            {/* ROW 3: ORDER SUMMARY & SHIPPING ADDRESS (2-COLUMN GRID) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               
               {/* COLUMN 1: ORDER SUMMARY */}
               <div className="p-6 border border-artisan-light/10 bg-artisan-light/[0.01] space-y-4 rounded-xl">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-artisan-grey border-b border-artisan-light/5 pb-3">
                     Order Summary
                  </h3>
                  <div className="space-y-2.5 font-mono text-[11px] text-artisan-light/75">
                     <div className="flex justify-between">
                        <span>SUBTOTAL</span>
                        <span>₹{order.totalAmount.toLocaleString()}</span>
                     </div>
                     <div className="flex justify-between">
                        <span>PACKAGING</span>
                        <span className="text-green-600 font-bold">FREE</span>
                     </div>
                     <div className="flex justify-between">
                        <span>SHIPPING</span>
                        <span className="text-green-600 font-bold">FREE</span>
                     </div>
                     <div className="border-t border-artisan-light/5 pt-3 mt-2 flex justify-between items-baseline">
                        <span className="text-xs text-artisan-light font-bold">TOTAL</span>
                        <span className="text-2xl font-display font-black text-artisan-light">₹{order.totalAmount.toLocaleString()}</span>
                     </div>
                  </div>
               </div>

               {/* COLUMN 2: SHIPPING ADDRESS */}
               <div className="p-6 border border-artisan-light/10 bg-artisan-light/[0.01] space-y-4 rounded-xl">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-artisan-grey border-b border-artisan-light/5 pb-3 flex items-center gap-2">
                     <MapPin className="w-4 h-4 text-artisan-grey" />
                     Shipping Address
                  </h3>
                  <div className="text-[11px] font-mono text-artisan-light/75 leading-relaxed uppercase bg-artisan-light/[0.005] p-4 border border-artisan-light/5 rounded-xl">
                     <p className="font-bold text-artisan-light mb-1.5">{order.user?.name || 'Client User'}</p>
                     <p className="text-artisan-light/60">
                        {order.shippingAddress && order.shippingAddress.doorNumber ? (
                           <>
                              {order.shippingAddress.doorNumber}, {order.shippingAddress.secondLine && `${order.shippingAddress.secondLine}, `}
                              {order.shippingAddress.landmark && `Landmark: ${order.shippingAddress.landmark}, `}
                              {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                           </>
                        ) : order.user?.addresses?.[0] ? (
                           <>
                              {order.user.addresses[0].doorNumber}, {order.user.addresses[0].secondLine && `${order.user.addresses[0].secondLine}, `}
                              {order.user.addresses[0].landmark && `Landmark: ${order.user.addresses[0].landmark}, `}
                              {order.user.addresses[0].city}, {order.user.addresses[0].state} - {order.user.addresses[0].pincode}
                           </>
                        ) : (
                           'No shipping address recorded.'
                        )}
                     </p>
                  </div>
               </div>
            </div>

            {/* ROW 4: TRACKING HISTORY (FULL-WIDTH) */}
            {order.shippingTrackingNumber && (
               <div className="p-6 border border-artisan-light/10 bg-artisan-light/[0.01] space-y-6 rounded-xl">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-artisan-grey border-b border-artisan-light/5 pb-3 flex items-center gap-2">
                     <Clock className="w-4 h-4 text-artisan-grey" />
                     Tracking History
                  </h3>
                  <div className="space-y-4">
                     {!order.shippingHistory || order.shippingHistory.length === 0 ? (
                        <p className="text-[9px] font-mono text-artisan-light/20 uppercase tracking-widest py-2">
                           No tracking logs yet.
                        </p>
                     ) : (
                        [...order.shippingHistory].reverse().map((log, idx) => (
                           <div key={idx} className="p-3 border border-artisan-light/5 bg-artisan-light/[0.005] space-y-1 rounded-xl">
                              <div className="flex justify-between items-center text-[8px] font-mono">
                                 <span className="font-bold text-artisan-grey uppercase tracking-widest px-2 py-0.5 bg-artisan-light/5 border border-artisan-light/10 rounded-xl">
                                    {log.status}
                                 </span>
                                 <span className="text-artisan-light/35">{new Date(log.timestamp).toLocaleString()}</span>
                              </div>
                              <p className="text-[10px] font-mono text-artisan-light/60 uppercase leading-relaxed pt-1">
                                 {log.description}
                              </p>
                           </div>
                        ))
                     )}
                  </div>
               </div>
            )}

            {/* ROW 5: PAYMENT DETAILS (FULL-WIDTH) */}
            <div className="p-6 border border-artisan-light/10 bg-artisan-light/[0.01] space-y-4 rounded-xl">
               <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-artisan-grey border-b border-artisan-light/5 pb-3 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-artisan-grey" />
                  Payment Details
               </h3>
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 font-mono text-[10px] text-artisan-light/75">
                  <div className="flex justify-between items-center p-3 bg-artisan-light/[0.005] border border-artisan-light/5 rounded-xl">
                     <span className="text-artisan-light/50 uppercase">Gateway</span>
                     <span className="font-bold uppercase">Razorpay</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-artisan-light/[0.005] border border-artisan-light/5 rounded-xl">
                     <span className="text-artisan-light/50 uppercase">Order ID</span>
                     <span className="font-bold select-all text-artisan-grey">{order.razorpayOrderId}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-artisan-light/[0.005] border border-artisan-light/5 rounded-xl">
                     <span className="text-artisan-light/50 uppercase">Payment ID</span>
                     <span className="font-bold select-all text-artisan-grey">{order.razorpayPaymentId || 'Pending'}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-artisan-light/[0.005] border border-artisan-light/5 rounded-xl">
                     <span className="text-artisan-light/50 uppercase">Client Name</span>
                     <span className="font-bold uppercase">{order.user?.name || 'Guest User'}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-artisan-light/[0.005] border border-artisan-light/5 rounded-xl sm:col-span-2 lg:col-span-2">
                     <span className="text-artisan-light/50 uppercase">Client Email</span>
                     <span className="font-bold select-all text-artisan-light/60">{order.user?.email || 'N/A'}</span>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}
