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
   CheckSquare
} from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

export default function OrderDetail() {
   const { id } = useParams();
   const navigate = useNavigate();
   const { addToast } = useToast();
   const { user } = useAuth();

   const [loading, setLoading] = useState(true);
   const [order, setOrder] = useState(null);
   const [copied, setCopied] = useState(false);

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

   const handleCopyText = (text) => {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
   };

   if (loading) {
      return (
         <div className="min-h-screen bg-artisan-dark flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-12 h-12 text-artisan-grey animate-spin" />
            <span className="text-[10px] font-mono text-artisan-light/20 uppercase tracking-widest">Accessing order registry dossier...</span>
         </div>
      );
   }

   if (!order) return null;

   const orderIdFormatted = order._id.toUpperCase();
   const shortOrderId = order._id.substring(order._id.length - 8).toUpperCase();

   // Shipping Status Stepper Map
   const steps = [
      { key: 'pending', label: 'Ordered', desc: 'Order Placed & Confirmed' },
      { key: 'shipped', label: 'Shipped', desc: 'Sterilized & Handed to Courier' },
      { key: 'in_transit', label: 'In Transit', desc: 'Package In Transit Route' },
      { key: 'out_for_delivery', label: 'Out for Delivery', desc: 'With Surgical Carrier Agent' },
      { key: 'delivered', label: 'Delivered', desc: 'Delivered successfully' }
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
         <div className="container-custom max-w-5xl mx-auto">
            
            {/* BACK LINK */}
            <div className="mb-10">
               <Link
                  to={user?.role === 'admin' ? '/admin' : '/history'}
                  className="inline-flex items-center gap-3 group"
               >
                  <div className="w-8 h-8 border border-artisan-light/10 flex items-center justify-center group-hover:bg-artisan-light group-hover:text-artisan-dark transition-all">
                     <ArrowLeft className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono font-bold text-artisan-light/40 uppercase tracking-[0.4em] group-hover:text-artisan-light transition-colors">
                     {user?.role === 'admin' ? 'Back to System Admin' : 'Back to My Orders'}
                  </span>
               </Link>
            </div>

            {/* ORDER BRIEF INFO CARD */}
            <div className="border border-artisan-light/10 bg-artisan-light/[0.01] p-6 sm:p-8 mb-8 space-y-6">
               <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="space-y-2">
                     <span className="text-[9px] font-mono text-artisan-light/40 uppercase tracking-[0.3em] font-bold block">Transaction Authorized</span>
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

                  <div className="flex items-center gap-3">
                     <div className="flex flex-col items-start md:items-end">
                        <span className="text-[8px] font-mono text-artisan-light/30 uppercase tracking-widest block mb-1">Status Dossier</span>
                        <div className="flex gap-2">
                           <span className={`text-[9px] font-mono font-bold uppercase tracking-widest px-3 py-1 border ${orderStatusStyles[order.orderStatus] || 'border-artisan-light/10'}`}>
                              {order.orderStatus}
                           </span>
                           <span className={`text-[9px] font-mono font-bold uppercase tracking-widest px-3 py-1 border ${shippingStatusStyles[order.shippingStatus] || 'border-artisan-light/10'}`}>
                              {order.shippingStatus === 'pending' && order.paymentStatus === 'paid' ? 'processing' : order.shippingStatus}
                           </span>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            {/* SPLIT LAYOUT */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
               
               {/* LEFT COLUMN: ITEMS & BILLING (7 cols) */}
               <div className="lg:col-span-7 space-y-8">
                  
                  {/* ORDERED ITEMS */}
                  <div className="p-6 border border-artisan-light/10 bg-artisan-light/[0.01] space-y-6">
                     <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-artisan-grey border-b border-artisan-light/5 pb-3 flex items-center gap-2">
                        <Package className="w-4 h-4 text-artisan-grey" />
                        Surgical Supply Items
                     </h3>
                     <div className="divide-y divide-artisan-light/5">
                        {order.items?.map((item) => (
                           <div key={item._id} className="py-4 flex items-center justify-between gap-6 group">
                              <div className="flex items-center gap-4 min-w-0">
                                 <div className="w-14 h-14 bg-white border border-artisan-light/10 overflow-hidden shrink-0 flex items-center justify-center p-2">
                                    <img 
                                       src={item.product?.image || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=200'} 
                                       alt={item.product?.name}
                                       className="max-h-full max-w-full object-contain grayscale"
                                    />
                                 </div>
                                 <div className="min-w-0 space-y-1">
                                    <h4 className="text-xs font-bold text-artisan-light truncate uppercase tracking-wide group-hover:text-artisan-grey transition-colors">
                                       <Link to={`/product/${item.product?._id || ''}`}>
                                          {item.product?.name || 'STAT Surgical Tool'}
                                       </Link>
                                    </h4>
                                    <p className="text-[9px] font-mono text-artisan-light/30">SKU: {item.product?.sku || 'N/A'}</p>
                                 </div>
                              </div>
                               <div className="text-right shrink-0">
                                 <span className="text-[10px] font-mono text-artisan-light/40 uppercase tracking-widest">{item.quantity} × </span>
                                 <span className="text-xs font-mono font-bold text-artisan-light">₹{(item.priceAtPurchase || item.product?.price || 0).toLocaleString()}</span>
                                 <p className="text-[9px] font-mono text-artisan-light/35 mt-0.5 font-bold">₹{(item.quantity * (item.priceAtPurchase || item.product?.price || 0)).toLocaleString()}</p>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>

                  {/* BILLING LEDGER */}
                  <div className="p-6 border border-artisan-light/10 bg-artisan-light/[0.01] space-y-4">
                     <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-artisan-grey border-b border-artisan-light/5 pb-3">
                        Financial Ledger
                     </h3>
                     <div className="space-y-2 font-mono text-[11px] text-artisan-light/75">
                        <div className="flex justify-between">
                           <span>SUPPLIES SUB-TOTAL</span>
                           <span>₹{order.totalAmount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                           <span>PACKAGING & STERILIZATION</span>
                           <span className="text-green-600 font-bold">FREE</span>
                        </div>
                        <div className="flex justify-between">
                           <span>STAT EXPRESS COURIER</span>
                           <span className="text-green-600 font-bold">FREE</span>
                        </div>
                        <div className="border-t border-artisan-light/5 pt-3 mt-2 flex justify-between items-baseline">
                           <span className="text-xs text-artisan-light font-bold">TOTAL OUTFLOW</span>
                           <span className="text-2xl font-display font-black text-artisan-light">₹{order.totalAmount.toLocaleString()}</span>
                        </div>
                     </div>
                  </div>

                  {/* TRANSACTION INFO */}
                  <div className="p-6 border border-artisan-light/10 bg-artisan-light/[0.01] space-y-4">
                     <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-artisan-grey border-b border-artisan-light/5 pb-3">
                        Payment & Gateway Dossier
                     </h3>
                     <div className="space-y-3 font-mono text-[10px] text-artisan-light/75">
                        <div className="flex justify-between p-2.5 bg-artisan-light/[0.005] border border-artisan-light/5">
                           <span className="text-artisan-light/30 uppercase">Gateway Carrier</span>
                           <span className="font-bold uppercase">Razorpay Payment Gateway</span>
                        </div>
                        <div className="flex justify-between p-2.5 bg-artisan-light/[0.005] border border-artisan-light/5">
                           <span className="text-artisan-light/30 uppercase">Razorpay Order ID</span>
                           <span className="font-bold select-all text-artisan-grey">{order.razorpayOrderId}</span>
                        </div>
                        <div className="flex justify-between p-2.5 bg-artisan-light/[0.005] border border-artisan-light/5">
                           <span className="text-artisan-light/30 uppercase">Razorpay Payment ID</span>
                           <span className="font-bold select-all text-artisan-grey">{order.razorpayPaymentId || 'Awaiting Authorization'}</span>
                        </div>
                        <div className="flex justify-between p-2.5 bg-artisan-light/[0.005] border border-artisan-light/5">
                           <span className="text-artisan-light/30 uppercase">Billing Entity Name</span>
                           <span className="font-bold uppercase">{order.user?.name || 'Guest User'}</span>
                        </div>
                        <div className="flex justify-between p-2.5 bg-artisan-light/[0.005] border border-artisan-light/5">
                           <span className="text-artisan-light/30 uppercase">Billing Email</span>
                           <span className="font-bold select-all text-artisan-light/60">{order.user?.email || 'N/A'}</span>
                        </div>
                     </div>
                  </div>

               </div>

               {/* RIGHT COLUMN: FULFILLMENT & SIMULATOR (5 cols) */}
               <div className="lg:col-span-5 space-y-8">
                  
                  {/* COURIER PARTNER HUD */}
                  <div className="p-6 border border-artisan-light/10 bg-artisan-light/[0.01] space-y-6">
                     <div className="space-y-1">
                        <span className="text-[8px] font-mono text-artisan-light/30 uppercase tracking-[0.2em] font-bold block">Simulated Partner Integration</span>
                        <h3 className="text-lg font-display font-extrabold uppercase tracking-wide text-artisan-light flex items-center gap-2">
                           <Truck className="w-5 h-5 text-artisan-grey" />
                           STAT COURIER SERVICE
                        </h3>
                     </div>

                     {order.shippingTrackingNumber ? (
                        <div className="space-y-4">
                           <div className="space-y-1.5 font-mono">
                              <span className="text-[8px] text-artisan-light/30 uppercase tracking-widest block font-bold">Tracking Number</span>
                              <div className="flex items-center justify-between gap-2 p-3 bg-artisan-light/[0.02] border border-artisan-light/10">
                                 <span className="text-xs font-bold text-artisan-light truncate select-all">{order.shippingTrackingNumber}</span>
                                 <button
                                    onClick={() => handleCopyText(order.shippingTrackingNumber)}
                                    className="text-artisan-light/30 hover:text-artisan-light/70 transition-colors shrink-0"
                                    title="Copy Tracking Number"
                                 >
                                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                 </button>
                              </div>
                           </div>

                           {/* LIVE SIMULATOR LOADER ALERTS */}
                           {order.shippingStatus !== 'delivered' && !isCancelled && (
                              <div className="p-3 border border-blue-500/20 bg-blue-500/5 text-blue-400 text-[10px] font-mono uppercase tracking-wider flex items-center gap-3 animate-pulse">
                                 <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                                 <span>Transit simulation running. Updates refresh automatically.</span>
                              </div>
                           )}
                        </div>
                     ) : (
                        <div className="p-4 border border-yellow-500/20 bg-yellow-500/5 text-yellow-400 text-[10px] font-mono uppercase tracking-wider flex items-center gap-2.5">
                           <AlertTriangle className="w-4 h-4 shrink-0" />
                           <span>Awaiting gateway payment confirmation to generate tracking.</span>
                        </div>
                     )}
                  </div>

                  {/* VISUAL STEPPER TRACK LINE */}
                  {order.shippingTrackingNumber && (
                     <div className="p-6 border border-artisan-light/10 bg-artisan-light/[0.01] space-y-6">
                        <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-artisan-grey border-b border-artisan-light/5 pb-3">
                           Delivery Timeline
                        </h3>

                        {isCancelled ? (
                           <div className="p-4 border border-red-500/20 bg-red-500/5 text-red-500 text-xs font-mono uppercase flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4" />
                              <span>Order delivery cancelled.</span>
                           </div>
                        ) : (
                           <div className="space-y-6 relative pl-6 border-l border-artisan-light/10 ml-3 py-1">
                              {steps.map((step, idx) => {
                                 const completed = idx <= activeStepIndex;
                                 const active = idx === activeStepIndex;

                                 return (
                                    <div key={idx} className="relative group">
                                       
                                       {/* Step node indicator dot */}
                                       <div className={`absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 transition-all duration-500 flex items-center justify-center ${
                                          completed 
                                             ? active 
                                                ? 'bg-artisan-grey border-artisan-grey scale-110 shadow-lg shadow-artisan-grey/25' 
                                                : 'bg-green-600 border-green-600'
                                             : 'bg-artisan-dark border-artisan-light/15'
                                       }`}>
                                          {completed && !active && (
                                             <Check className="w-2.5 h-2.5 text-artisan-dark font-black" />
                                          )}
                                          {active && (
                                             <span className="w-1.5 h-1.5 rounded-full bg-artisan-dark animate-ping" />
                                          )}
                                       </div>

                                       <div className={`space-y-0.5 transition-opacity duration-300 ${completed ? 'opacity-100' : 'opacity-35'}`}>
                                          <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${active ? 'text-artisan-grey font-black' : 'text-artisan-light'}`}>
                                             {step.label}
                                          </span>
                                          <p className="text-[9px] text-artisan-light/45 uppercase tracking-wide">
                                             {step.desc}
                                          </p>
                                       </div>
                                    </div>
                                 );
                              })}
                           </div>
                        )}
                     </div>
                  )}

                  {/* SHIPPING ADDRESS CARD */}
                  <div className="p-6 border border-artisan-light/10 bg-artisan-light/[0.01] space-y-4">
                     <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-artisan-grey border-b border-artisan-light/5 pb-3 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-artisan-grey" />
                        Shipping Destination
                     </h3>
                     <div className="text-[11px] font-mono text-artisan-light/75 leading-relaxed uppercase bg-artisan-light/[0.005] p-4 border border-artisan-light/5">
                        <p className="font-bold text-artisan-light mb-1.5">{order.user?.name || 'Client User'}</p>
                        <p className="text-artisan-light/60">
                           {order.user?.addresses?.[0] ? (
                              <>
                                 {order.user.addresses[0].doorNumber}, {order.user.addresses[0].secondLine && `${order.user.addresses[0].secondLine}, `}
                                 {order.user.addresses[0].landmark && `Landmark: ${order.user.addresses[0].landmark}, `}
                                 {order.user.addresses[0].city}, {order.user.addresses[0].state} - {order.user.addresses[0].pincode}
                              </>
                           ) : (
                              'Registered shipping address on registry files.'
                           )}
                        </p>
                     </div>
                  </div>

                  {/* TRANSIT HISTORICAL LOGS TIMELINE */}
                  {order.shippingTrackingNumber && (
                     <div className="p-6 border border-artisan-light/10 bg-artisan-light/[0.01] space-y-6">
                        <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-artisan-grey border-b border-artisan-light/5 pb-3">
                           Courier Tracking Logs
                        </h3>
                        <div className="space-y-4">
                           {!order.shippingHistory || order.shippingHistory.length === 0 ? (
                              <p className="text-[9px] font-mono text-artisan-light/20 uppercase tracking-widest py-2">
                                 No courier updates logged yet.
                              </p>
                           ) : (
                              [...order.shippingHistory].reverse().map((log, idx) => (
                                 <div key={idx} className="p-3 border border-artisan-light/5 bg-artisan-light/[0.005] space-y-1">
                                    <div className="flex justify-between items-center text-[8px] font-mono">
                                       <span className="font-bold text-artisan-grey uppercase tracking-widest px-2 py-0.5 bg-artisan-light/5 border border-artisan-light/10">
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

               </div>

            </div>

         </div>
      </div>
   );
}
