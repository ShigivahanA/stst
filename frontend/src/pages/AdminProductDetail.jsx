import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
   ArrowLeft,
   Loader2,
   Plus,
   Minus,
   Trash2,
   UploadCloud,
   AlertTriangle,
   Package,
   DollarSign,
   Boxes,
   Calendar,
   Check,
   X
} from 'lucide-react'
import { useToast } from '../context/ToastContext'
import api from '../services/api'
import ImageGalleryManager from '../components/admin/ImageGalleryManager'

// Robust product image component with error fallback
function ProductImage({ src, alt, className = "w-16 h-16" }) {
   const [imgError, setImgError] = useState(false);
   const hasValidImage = src && src !== '' && !imgError;
   
   return (
      <div className={`${className} bg-artisan-light/5 border border-artisan-light/10 overflow-hidden shrink-0 flex items-center justify-center`}>
         {hasValidImage ? (
            <img 
               src={src} 
               alt={alt} 
               className="w-full h-full object-cover" 
               onError={() => setImgError(true)}
            />
         ) : (
            <span className="text-2xl">📦</span>
         )}
      </div>
   );
}

export default function AdminProductDetail() {
   const { id } = useParams()
   const navigate = useNavigate()
   const { addToast } = useToast()

   const [loading, setLoading] = useState(true)
   const [product, setProduct] = useState(null)
   const [activeTab, setActiveTab] = useState('specs')
   const [actionLoading, setActionLoading] = useState(false)
   const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
   const [errorMessage, setErrorMessage] = useState('')

   // Spec form states
   const [editSku, setEditSku] = useState('')
   const [editName, setEditName] = useState('')
   const [editDesc, setEditDesc] = useState('')
   const [editPrice, setEditPrice] = useState('')
   const [editCategory, setEditCategory] = useState('Rehabilitation')
   const [editCustomCategory, setEditCustomCategory] = useState('')
   const [editLowStockThreshold, setEditLowStockThreshold] = useState('10')
   const [editImage, setEditImage] = useState('')
   const [editUploadedImages, setEditUploadedImages] = useState([])
   const [editActive, setEditActive] = useState(true)
   const [editFeatured, setEditFeatured] = useState(false)
   const [editSpecifications, setEditSpecifications] = useState([{ type: 'key_value', label: '', value: '', extra: {} }])

   // Stock editor state
   const [stockCount, setStockCount] = useState('0')
   const [isEditingStockInline, setIsEditingStockInline] = useState(false)
   const [inlineStockValue, setInlineStockValue] = useState('')

   const fetchProductDetail = async () => {
      try {
         setLoading(true)
         const res = await api.get(`/products/${id}`)
         const prodData = res.data.data
         setProduct(prodData)
         setEditSku(prodData.sku)
         setEditName(prodData.name)
         setEditDesc(prodData.desc || '')
         setEditPrice(prodData.price.toString())
         setEditLowStockThreshold(prodData.lowstockthreshold.toString())
         setEditImage(prodData.image || '')
         setEditActive(prodData.active)
         setEditFeatured(prodData.featured || false)
         setStockCount(prodData.quantity.toString())
         setInlineStockValue(prodData.quantity.toString())

         if (Array.isArray(prodData.specifications) && prodData.specifications.length > 0) {
            setEditSpecifications(prodData.specifications.map(s => ({
               type: s.type || 'key_value',
               label: s.label || '',
               value: s.value || '',
               extra: s.extra || {}
            })))
         } else {
            setEditSpecifications([{ type: 'key_value', label: '', value: '', extra: {} }])
         }

         // Fallback legacy images array if empty
         const legacyImages = prodData.images && prodData.images.length > 0
            ? prodData.images
            : prodData.image ? [{ url: prodData.image, publicId: 'legacy' }] : []
         setEditUploadedImages(legacyImages)

         const standardCategories = ['Rehabilitation', 'Respiratory', 'Diagnostic Tools', 'Elder Care', 'Mother & Baby', 'Pain Relief', 'Wound Care']
         if (standardCategories.includes(prodData.category)) {
            setEditCategory(prodData.category)
            setEditCustomCategory('')
         } else {
            setEditCategory('Other')
            setEditCustomCategory(prodData.category)
         }
      } catch (err) {
         addToast('Failed to load product specifications dossier', 'error')
         navigate('/admin/products')
      } finally {
         setLoading(false)
      }
   }

   useEffect(() => {
      fetchProductDetail()
   }, [id])

   const handleUpdateSpecs = async (e) => {
      e.preventDefault()
      setErrorMessage('')

      const finalCategory = editCategory === 'Other' ? editCustomCategory.trim() : editCategory
      if (editCategory === 'Other' && !finalCategory) {
         setErrorMessage('Custom category name is required')
         return
      }

      if (editUploadedImages.length === 0) {
         setErrorMessage('At least one product image is required')
         return
      }

      const specsPayload = editSpecifications
         .map(s => ({
            type: s.type || 'key_value',
            label: s.label?.trim() || '',
            value: s.value?.trim() || '',
            extra: s.extra || {}
         }))
         .filter(s => s.label || s.value)

      try {
         setActionLoading(true)
         const payload = {
            sku: editSku.trim().toUpperCase(),
            name: editName.trim(),
            desc: editDesc.trim(),
            price: parseFloat(editPrice),
            category: finalCategory,
            lowstockthreshold: parseInt(editLowStockThreshold, 10),
            active: editActive,
            featured: editFeatured,
            image: editImage, // Primary cover image
            images: editUploadedImages, // Gallery array of { url, publicId }
            specifications: specsPayload
         }

         const res = await api.put(`/products/${id}`, payload)
         addToast('Product specifications updated successfully', 'success')
         setProduct(res.data.data)
      } catch (err) {
         const serverError = err.response?.data?.message || 'Failed to update product details'
         setErrorMessage(serverError)
         addToast(serverError, 'error')
      } finally {
         setActionLoading(false)
      }
   }

   const handleUpdateStock = async (e) => {
      e.preventDefault()
      try {
         setActionLoading(true)
         const res = await api.put(`/products/${id}`, {
            quantity: parseInt(stockCount, 10)
         })
         addToast('Inventory stock level updated successfully', 'success')
         setProduct(res.data.data)
         setInlineStockValue(stockCount)
      } catch (err) {
         addToast('Failed to save stock levels', 'error')
      } finally {
         setActionLoading(false)
      }
   }

   const handleInlineStockSubmit = async (e) => {
      if (e) e.preventDefault();
      try {
         setActionLoading(true)
         const qty = parseInt(inlineStockValue, 10);
         if (isNaN(qty) || qty < 0) {
            addToast('Please enter a valid stock quantity', 'error');
            return;
         }
         const res = await api.put(`/products/${id}`, {
            quantity: qty
         })
         addToast('Inventory stock updated successfully', 'success')
         setProduct(res.data.data)
         setStockCount(qty.toString())
         setIsEditingStockInline(false)
      } catch (err) {
         addToast('Failed to save stock levels', 'error')
      } finally {
         setActionLoading(false)
      }
   }

   const adjustStock = (amount) => {
      const current = parseInt(stockCount, 10) || 0
      const next = Math.max(0, current + amount)
      setStockCount(next.toString())
   }

   const handleDeleteProduct = async () => {
      try {
         setActionLoading(true)
         await api.delete(`/products/${id}`)
         addToast('Product successfully deleted from registry', 'success')
         navigate('/admin/products')
      } catch (err) {
         addToast('Failed to delete product', 'error')
      } finally {
         setActionLoading(false)
         setShowDeleteConfirm(false)
      }
   }

   if (loading) {
      return (
         <div className="min-h-screen bg-artisan-dark flex items-center justify-center text-artisan-light">
            <div className="flex flex-col items-center gap-4">
               <Loader2 className="w-8 h-8 animate-spin text-artisan-grey" />
               <span className="font-mono text-xs uppercase tracking-widest text-artisan-light/40">Loading Supply Dossier...</span>
            </div>
         </div>
      )
   }

   if (!product) return null

   const isLowStock = product.quantity <= product.lowstockthreshold

   return (
      <div className="min-h-screen bg-artisan-dark bg-noise pt-32 pb-24 text-artisan-light">
         <div className="container-custom max-w-5xl">

            {/* Back Button */}
            <div className="mb-8">
               <Link 
                  to="/admin/products" 
                  className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-artisan-light/40 hover:text-artisan-light transition-colors group"
               >
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  <span>Back to Inventory</span>
               </Link>
            </div>

            {/* PRODUCT TITLE SUMMARY */}
            <div className="mb-10 flex flex-col md:flex-row items-start md:items-center gap-6 border-b border-artisan-light/10 pb-8 shrink-0">
               <ProductImage src={product.image} alt={product.name} className="w-20 h-20 border-2 border-artisan-grey" />
               <div className="space-y-1 flex-1 min-w-0">
                  <span className="text-[9px] font-mono font-bold text-artisan-grey uppercase tracking-[0.3em] block">Surgical Catalog Dossier</span>
                  <h1 className="text-3xl sm:text-4xl font-display font-black uppercase tracking-tight text-artisan-light truncate">
                     {product.name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3">
                     <span className="text-[10px] font-mono text-artisan-light/40 uppercase tracking-widest">
                        SKU: <strong className="text-artisan-light">{product.sku}</strong>
                     </span>
                     <span className="text-[10px] font-mono text-artisan-light/40 uppercase tracking-widest">
                        Category: <strong className="text-artisan-light">{product.category}</strong>
                     </span>
                     <span className={`text-[8px] font-mono font-black uppercase tracking-widest px-2 py-0.5 border ${product.active
                           ? 'border-green-500/20 text-green-500 bg-green-500/5'
                           : 'border-red-500/20 text-red-500 bg-red-500/5'
                        }`}>
                        {product.active ? 'Active' : 'Disabled'}
                     </span>
                     {isLowStock && (
                        <span className="text-[8px] font-mono font-black uppercase tracking-widest px-2 py-0.5 border border-red-500/20 text-red-500 bg-red-500/5 flex items-center gap-1 animate-pulse">
                           <AlertTriangle className="w-3 h-3 shrink-0" />
                           Low Stock alert
                        </span>
                     )}
                  </div>
               </div>
            </div>

            {/* SPLIT LAYOUT */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

               {/* Left Column: Quick Stats Dossier */}
               <div className="space-y-6">
                  <div className="border border-artisan-light/10 bg-artisan-dark/50 p-6 space-y-6">
                     
                     <span className="text-[9px] font-mono font-bold text-artisan-light/40 uppercase tracking-widest block border-b border-artisan-light/5 pb-2">
                        Inventory Dossier
                     </span>

                     <div className="space-y-4 font-mono text-xs">
                        {/* Current Stock */}
                        <div className="flex items-center gap-3">
                           <div className="p-2 bg-artisan-light/5 border border-artisan-light/10 text-artisan-grey">
                              <Boxes className="w-4 h-4" />
                           </div>
                           <div className="flex-1 min-w-0">
                              <span className="text-[8px] text-artisan-light/50 uppercase tracking-widest block font-bold">Physical Stock</span>
                              {isEditingStockInline ? (
                                 <form onSubmit={handleInlineStockSubmit} className="flex items-center gap-2 mt-1">
                                    <input
                                       type="number"
                                       value={inlineStockValue}
                                       onChange={(e) => setInlineStockValue(Math.max(0, parseInt(e.target.value) || 0).toString())}
                                       className="w-20 bg-artisan-light/5 border border-artisan-light/20 text-xs font-mono font-bold text-artisan-light px-2 py-0.5 focus:border-artisan-grey outline-none"
                                       autoFocus
                                       required
                                    />
                                    <button
                                       type="submit"
                                       className="p-1 text-green-500 hover:text-green-400 transition-colors"
                                       title="Save Override"
                                    >
                                       <Check className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                       type="button"
                                       onClick={() => {
                                          setInlineStockValue(product.quantity.toString())
                                          setIsEditingStockInline(false)
                                       }}
                                       className="p-1 text-red-500 hover:text-red-400 transition-colors"
                                       title="Cancel"
                                    >
                                       <X className="w-3.5 h-3.5" />
                                    </button>
                                 </form>
                              ) : (
                                 <div className="flex items-center gap-2">
                                    <span className="font-bold text-artisan-light uppercase text-sm">{product.quantity} Units</span>
                                    <button
                                       type="button"
                                       onClick={() => {
                                          setInlineStockValue(product.quantity.toString())
                                          setIsEditingStockInline(true)
                                       }}
                                       className="text-[9px] font-mono text-artisan-grey hover:text-artisan-light transition-colors underline uppercase tracking-wider pl-1 font-bold"
                                       title="Override Stock"
                                    >
                                       Edit
                                    </button>
                                 </div>
                              )}
                           </div>
                        </div>

                        {/* Price */}
                        <div className="flex items-center gap-3">
                           <div className="p-2 bg-artisan-light/5 border border-artisan-light/10 text-artisan-grey">
                              <DollarSign className="w-4 h-4" />
                           </div>
                           <div>
                              <span className="text-[8px] text-artisan-light/50 uppercase tracking-widest block font-bold">Registry Price</span>
                              <span className="font-bold text-artisan-light uppercase text-sm">₹{product.price?.toLocaleString()}</span>
                           </div>
                        </div>

                        {/* Created Date */}
                        <div className="flex items-center gap-3">
                           <div className="p-2 bg-artisan-light/5 border border-artisan-light/10 text-artisan-grey">
                              <Calendar className="w-4 h-4" />
                           </div>
                           <div>
                              <span className="text-[8px] text-artisan-light/50 uppercase tracking-widest block font-bold">Created On</span>
                              <span className="text-artisan-light/80 text-[10px] block uppercase">
                                 {new Date(product.createdAt).toLocaleDateString()}
                              </span>
                           </div>
                        </div>
                     </div>

                     {/* Danger Zone */}
                     <div className="h-px bg-artisan-light/5 w-full" />
                     <div className="space-y-2">
                        <span className="text-[8px] font-mono text-red-500/50 uppercase tracking-widest block font-bold">Danger Zone</span>
                        <button
                           onClick={() => setShowDeleteConfirm(true)}
                           className="w-full h-10 bg-red-950/20 border border-red-900/50 text-red-500 hover:bg-red-900 hover:text-artisan-light hover:border-red-900 transition-all flex items-center justify-center gap-2 font-mono text-[9px] font-bold uppercase tracking-widest"
                        >
                           <Trash2 className="w-3.5 h-3.5" />
                           <span>Delete Product</span>
                        </button>
                     </div>

                  </div>
               </div>

               {/* Right Column: Spec Forms & Stock Management Tabs */}
               <div className="lg:col-span-2 space-y-6">
                  
                  {/* Tabs bar */}
                  <div className="flex border-b border-artisan-light/10 shrink-0 overflow-x-auto gap-2">
                     {[
                        { id: 'specs', label: 'Specifications' },
                        { id: 'stock', label: 'Stock Manager' }
                     ].map((tab) => (
                        <button
                           key={tab.id}
                           onClick={() => setActiveTab(tab.id)}
                           className={`pb-3 px-2 border-b-2 font-mono text-[9px] font-bold uppercase tracking-widest whitespace-nowrap transition-all ${
                              activeTab === tab.id
                                 ? 'border-artisan-grey text-artisan-light'
                                 : 'border-transparent text-artisan-light/50 hover:text-artisan-light/60'
                           }`}
                        >
                           {tab.label}
                        </button>
                     ))}
                  </div>

                  {/* Tab content */}
                  <div className="min-h-0 text-xs sm:text-sm">
                     
                     {/* SPECIFICATIONS TAB */}
                     {activeTab === 'specs' && (
                        <div className="space-y-6">
                           {/* ERROR PANEL */}
                           <AnimatePresence>
                              {errorMessage && (
                                 <motion.div 
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="p-4 border border-red-500/20 bg-red-500/5 text-red-500 flex items-start gap-3"
                                 >
                                    <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                                    <div className="space-y-1">
                                       <span className="font-mono text-[10px] font-black uppercase tracking-widest block">Update Rejection</span>
                                       <p className="text-[11px] font-mono uppercase tracking-wider leading-relaxed text-red-500/80">
                                          {errorMessage}
                                       </p>
                                    </div>
                                 </motion.div>
                              )}
                           </AnimatePresence>

                           <form onSubmit={handleUpdateSpecs} className="border border-artisan-light/10 bg-artisan-dark/50 p-6 sm:p-8 space-y-6">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                 {/* SKU */}
                                 <div className="space-y-2">
                                    <label className="text-[8px] font-mono text-artisan-light/40 uppercase tracking-widest block font-bold">Unique SKU Code</label>
                                    <input
                                       type="text"
                                       value={editSku}
                                       onChange={(e) => setEditSku(e.target.value.toUpperCase())}
                                       className="w-full bg-artisan-light/[0.01] border border-artisan-light/10 p-4 text-xs sm:text-sm font-mono text-artisan-light uppercase tracking-widest outline-none focus:border-artisan-grey transition-all"
                                       required
                                    />
                                 </div>

                                 {/* Category */}
                                 <div className="space-y-2">
                                    <label className="text-[8px] font-mono text-artisan-light/40 uppercase tracking-widest block font-bold">Clinical Category</label>
                                    <div className="relative">
                                       <select
                                          value={editCategory}
                                          onChange={(e) => setEditCategory(e.target.value)}
                                          className="w-full bg-artisan-light/[0.01] border border-artisan-light/10 p-4 text-xs sm:text-sm font-mono text-artisan-light uppercase tracking-widest outline-none focus:border-artisan-grey transition-all appearance-none"
                                       >
                                          <option value="Rehabilitation" className="bg-artisan-dark text-artisan-light">Rehabilitation</option>
                                          <option value="Respiratory" className="bg-artisan-dark text-artisan-light">Respiratory</option>
                                          <option value="Diagnostic Tools" className="bg-artisan-dark text-artisan-light">Diagnostic Tools</option>
                                          <option value="Elder Care" className="bg-artisan-dark text-artisan-light">Elder Care</option>
                                          <option value="Mother & Baby" className="bg-artisan-dark text-artisan-light">Mother & Baby</option>
                                          <option value="Pain Relief" className="bg-artisan-dark text-artisan-light">Pain Relief</option>
                                          <option value="Wound Care" className="bg-artisan-dark text-artisan-light">Wound Care</option>
                                          <option value="Other" className="bg-artisan-dark text-artisan-light">Other / Custom</option>
                                       </select>
                                       <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-artisan-light/50 text-[9px] font-mono">▼</div>
                                    </div>
                                 </div>
                              </div>

                              {/* Custom Category */}
                              {editCategory === 'Other' && (
                                 <div className="space-y-2">
                                    <label className="text-[8px] font-mono text-artisan-light/40 uppercase tracking-widest block font-bold">Specify Custom Category Name</label>
                                    <input
                                       type="text"
                                       value={editCustomCategory}
                                       onChange={(e) => setEditCustomCategory(e.target.value)}
                                       className="w-full bg-artisan-light/[0.01] border border-artisan-light/10 p-4 text-xs sm:text-sm font-mono text-artisan-light uppercase tracking-widest outline-none focus:border-artisan-grey transition-all"
                                       required
                                    />
                                 </div>
                              )}

                              {/* Name */}
                              <div className="space-y-2">
                                 <label className="text-[8px] font-mono text-artisan-light/40 uppercase tracking-widest block font-bold">Display Name</label>
                                 <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="w-full bg-artisan-light/[0.01] border border-artisan-light/10 p-4 text-xs sm:text-sm font-mono text-artisan-light uppercase tracking-widest outline-none focus:border-artisan-grey transition-all"
                                    required
                                 />
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                 {/* Price */}
                                 <div className="space-y-2">
                                    <label className="text-[8px] font-mono text-artisan-light/40 uppercase tracking-widest block font-bold">Unit Price (₹)</label>
                                    <input
                                       type="number"
                                       value={editPrice}
                                       onChange={(e) => setEditPrice(e.target.value)}
                                       min="0"
                                       step="0.01"
                                       className="w-full bg-artisan-light/[0.01] border border-artisan-light/10 p-4 text-xs sm:text-sm font-mono text-artisan-light tracking-widest outline-none focus:border-artisan-grey transition-all"
                                       required
                                    />
                                 </div>

                                 {/* Low Stock Limit */}
                                 <div className="space-y-2">
                                    <label className="text-[8px] font-mono text-artisan-light/40 uppercase tracking-widest block font-bold">Low Stock Warning Trigger</label>
                                    <input
                                       type="number"
                                       value={editLowStockThreshold}
                                       onChange={(e) => setEditLowStockThreshold(e.target.value)}
                                       min="0"
                                       step="1"
                                       className="w-full bg-artisan-light/[0.01] border border-artisan-light/10 p-4 text-xs sm:text-sm font-mono text-artisan-light tracking-widest outline-none focus:border-artisan-grey transition-all"
                                       required
                                    />
                                 </div>
                              </div>

                              {/* Description */}
                              <div className="space-y-2">
                                 <label className="text-[8px] font-mono text-artisan-light/40 uppercase tracking-widest block font-bold">Product Description</label>
                                 <textarea
                                    value={editDesc}
                                    onChange={(e) => setEditDesc(e.target.value)}
                                    className="w-full h-32 bg-artisan-light/[0.01] border border-artisan-light/10 p-4 text-xs sm:text-sm font-mono text-artisan-light uppercase tracking-widest outline-none focus:border-artisan-grey transition-all resize-none"
                                 />
                              </div>

                              {/* Multiple Images Gallery Manager */}
                              <div className="space-y-2">
                                 <ImageGalleryManager
                                    images={editUploadedImages}
                                    onChange={setEditUploadedImages}
                                    primaryImage={editImage}
                                    onPrimaryChange={setEditImage}
                                 />
                              </div>

                              {/* Dynamic Specifications Editor */}
                              <div className="space-y-4 border-t border-artisan-light/5 pt-6">
                                 <div className="space-y-1">
                                    <label className="text-[9px] font-mono text-artisan-light/40 uppercase tracking-widest block font-bold">
                                       Product Specifications & Dossier (Optional)
                                    </label>
                                    <span className="text-[9px] font-mono text-artisan-light/20 uppercase tracking-wider block">
                                       Choose spec type: Key-Value, Title-Paragraph, Image, or Video training guide.
                                    </span>
                                 </div>
                                 
                                 <div className="space-y-4">
                                    {editSpecifications.map((spec, index) => (
                                       <div key={index} className="border border-artisan-light/10 bg-artisan-light/[0.01] p-4 space-y-3 relative">
                                          {/* Header with Type Selector & Delete */}
                                          <div className="flex justify-between items-center border-b border-artisan-light/5 pb-2">
                                             <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-mono font-bold text-artisan-grey uppercase tracking-wider">Type:</span>
                                                <select
                                                   value={spec.type || 'key_value'}
                                                   onChange={(e) => {
                                                      const newSpecs = [...editSpecifications]
                                                      newSpecs[index].type = e.target.value
                                                      newSpecs[index].label = ''
                                                      newSpecs[index].value = ''
                                                      setEditSpecifications(newSpecs)
                                                   }}
                                                   className="bg-artisan-dark border border-artisan-light/10 text-[10px] font-mono text-artisan-light uppercase px-2 py-0.5 outline-none focus:border-artisan-grey"
                                                >
                                                   <option value="key_value">Key-Value Pair</option>
                                                   <option value="title_para">Title & Paragraph</option>
                                                   <option value="image">Specification Image</option>
                                                   <option value="video">Instructional Video URL</option>
                                                   <option value="custom">Custom Block (Other)</option>
                                                </select>
                                             </div>
                                             
                                             <button
                                                type="button"
                                                onClick={() => {
                                                   setEditSpecifications(editSpecifications.filter((_, i) => i !== index))
                                                }}
                                                className="text-[9px] font-mono text-red-500 hover:text-red-400 uppercase tracking-widest font-bold"
                                             >
                                                Delete Row
                                             </button>
                                          </div>

                                          {/* Render Dynamic Inputs based on Type */}
                                          {spec.type === 'key_value' && (
                                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <input
                                                   type="text"
                                                   placeholder="Specification Key (e.g. Material)"
                                                   value={spec.label}
                                                   onChange={(e) => {
                                                      const newSpecs = [...editSpecifications]
                                                      newSpecs[index].label = e.target.value
                                                      setEditSpecifications(newSpecs)
                                                   }}
                                                   className="bg-artisan-light/[0.01] border border-artisan-light/10 p-2.5 text-xs font-mono text-artisan-light uppercase tracking-widest outline-none focus:border-artisan-grey"
                                                   required
                                                />
                                                <input
                                                   type="text"
                                                   placeholder="Value (e.g. Stainless Steel)"
                                                   value={spec.value}
                                                   onChange={(e) => {
                                                      const newSpecs = [...editSpecifications]
                                                      newSpecs[index].value = e.target.value
                                                      setEditSpecifications(newSpecs)
                                                   }}
                                                   className="bg-artisan-light/[0.01] border border-artisan-light/10 p-2.5 text-xs font-mono text-artisan-light uppercase tracking-widest outline-none focus:border-artisan-grey"
                                                   required
                                                />
                                             </div>
                                          )}

                                          {spec.type === 'title_para' && (
                                             <div className="space-y-3">
                                                <input
                                                   type="text"
                                                   placeholder="Section Title / Heading"
                                                   value={spec.label}
                                                   onChange={(e) => {
                                                      const newSpecs = [...editSpecifications]
                                                      newSpecs[index].label = e.target.value
                                                      setEditSpecifications(newSpecs)
                                                   }}
                                                   className="w-full bg-artisan-light/[0.01] border border-artisan-light/10 p-2.5 text-xs font-mono text-artisan-light uppercase tracking-widest outline-none focus:border-artisan-grey"
                                                   required
                                                />
                                                <textarea
                                                   placeholder="Paragraph details, instructions, safety protocols..."
                                                   value={spec.value}
                                                   onChange={(e) => {
                                                      const newSpecs = [...editSpecifications]
                                                      newSpecs[index].value = e.target.value
                                                      setEditSpecifications(newSpecs)
                                                   }}
                                                   className="w-full h-24 bg-artisan-light/[0.01] border border-artisan-light/10 p-3 text-xs font-mono text-artisan-light uppercase tracking-widest outline-none focus:border-artisan-grey resize-none"
                                                   required
                                                />
                                             </div>
                                          )}

                                          {spec.type === 'image' && (() => {
                                              const specImages = (() => {
                                                 if (!spec.value) return [];
                                                 if (spec.value.startsWith('[')) {
                                                    try {
                                                       return JSON.parse(spec.value);
                                                    } catch (e) {
                                                       return [spec.value];
                                                    }
                                                 }
                                                 return spec.value.split(',').map(s => s.trim()).filter(Boolean);
                                              })();

                                              const handleUploadSpecImage = async (file) => {
                                                 const reader = new FileReader();
                                                 reader.readAsDataURL(file);
                                                 reader.onloadend = async () => {
                                                    try {
                                                       const res = await api.post('/admin/products/upload-image', { image: reader.result });
                                                       const newSpecs = [...editSpecifications];
                                                       const updatedImages = [...specImages, res.data.data.url];
                                                       newSpecs[index].value = JSON.stringify(updatedImages);
                                                       setEditSpecifications(newSpecs);
                                                       addToast('Specification image uploaded', 'success');
                                                    } catch (err) {
                                                       addToast('Failed to upload image', 'error');
                                                    }
                                                 }
                                              };

                                              const handleDeleteSpecImage = (imgIdx) => {
                                                 const newSpecs = [...editSpecifications];
                                                 const updatedImages = specImages.filter((_, i) => i !== imgIdx);
                                                 newSpecs[index].value = updatedImages.length > 0 ? JSON.stringify(updatedImages) : '';
                                                 setEditSpecifications(newSpecs);
                                                 addToast('Specification image removed', 'success');
                                              };

                                              return (
                                                 <div className="space-y-3">
                                                    {/* Caption Input */}
                                                    <input
                                                       type="text"
                                                       placeholder="Image Caption / Description"
                                                       value={spec.label}
                                                       onChange={(e) => {
                                                          const newSpecs = [...editSpecifications];
                                                          newSpecs[index].label = e.target.value;
                                                          setEditSpecifications(newSpecs);
                                                       }}
                                                       className="w-full bg-artisan-light/[0.01] border border-artisan-light/10 p-2.5 text-xs font-mono text-artisan-light uppercase tracking-widest outline-none focus:border-artisan-grey"
                                                    />

                                                    {/* Grid of images + upload slot */}
                                                    <div className="flex flex-wrap gap-3 items-center">
                                                       {specImages.map((imgUrl, imgIdx) => (
                                                          <div
                                                             key={imgIdx}
                                                             className="relative border border-artisan-light/10 w-20 h-20 shrink-0 flex items-center justify-center bg-artisan-light/[0.01] group"
                                                          >
                                                             <img
                                                                src={imgUrl}
                                                                alt={`Spec ${imgIdx + 1}`}
                                                                className="w-full h-full object-cover"
                                                             />
                                                             <div className="absolute inset-0 bg-artisan-dark/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
                                                                <button
                                                                   type="button"
                                                                   onClick={() => handleDeleteSpecImage(imgIdx)}
                                                                   className="p-1 bg-red-950/20 border border-red-900/50 text-red-500 hover:bg-red-600 hover:text-artisan-light hover:border-red-600 transition-all"
                                                                   title="Delete Image"
                                                                >
                                                                   <Trash2 className="w-3.5 h-3.5" />
                                                                </button>
                                                             </div>
                                                          </div>
                                                       ))}

                                                       {/* Dotted Upload Box */}
                                                       <label className="border border-dashed border-artisan-light/20 w-20 h-20 shrink-0 flex flex-col items-center justify-center cursor-pointer hover:border-artisan-grey/50 transition-all">
                                                          <input
                                                             type="file"
                                                             accept="image/*"
                                                             onChange={(e) => {
                                                                const file = e.target.files[0];
                                                                if (file) handleUploadSpecImage(file);
                                                             }}
                                                             className="hidden"
                                                          />
                                                          <UploadCloud className="w-4 h-4 text-artisan-light/35 mb-0.5 hover:text-artisan-light transition-colors" />
                                                          <span className="text-[7px] font-mono text-artisan-light/40 uppercase tracking-widest text-center px-1">
                                                             Upload
                                                          </span>
                                                       </label>
                                                    </div>
                                                 </div>
                                              );
                                           })()}

                                          {spec.type === 'video' && (
                                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <input
                                                   type="text"
                                                   placeholder="Video Title / Description"
                                                   value={spec.label}
                                                   onChange={(e) => {
                                                      const newSpecs = [...editSpecifications]
                                                      newSpecs[index].label = e.target.value
                                                      setEditSpecifications(newSpecs)
                                                   }}
                                                   className="bg-artisan-light/[0.01] border border-artisan-light/10 p-2.5 text-xs font-mono text-artisan-light uppercase tracking-widest outline-none focus:border-artisan-grey"
                                                />
                                                <input
                                                   type="text"
                                                   placeholder="YouTube or Video URL"
                                                   value={spec.value}
                                                   onChange={(e) => {
                                                      const newSpecs = [...editSpecifications]
                                                      newSpecs[index].value = e.target.value
                                                      setEditSpecifications(newSpecs)
                                                   }}
                                                   className="bg-artisan-light/[0.01] border border-artisan-light/10 p-2.5 text-xs font-mono text-artisan-light outline-none focus:border-artisan-grey"
                                                   required
                                                />
                                             </div>
                                          )}

                                          {spec.type === 'custom' && (
                                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <input
                                                   type="text"
                                                   placeholder="Key / Label"
                                                   value={spec.label}
                                                   onChange={(e) => {
                                                      const newSpecs = [...editSpecifications]
                                                      newSpecs[index].label = e.target.value
                                                      setEditSpecifications(newSpecs)
                                                   }}
                                                   className="bg-artisan-light/[0.01] border border-artisan-light/10 p-2.5 text-xs font-mono text-artisan-light uppercase tracking-widest outline-none focus:border-artisan-grey"
                                                />
                                                <input
                                                   type="text"
                                                   placeholder="Value / Meta String"
                                                   value={spec.value}
                                                   onChange={(e) => {
                                                      const newSpecs = [...editSpecifications]
                                                      newSpecs[index].value = e.target.value
                                                      setEditSpecifications(newSpecs)
                                                   }}
                                                   className="bg-artisan-light/[0.01] border border-artisan-light/10 p-2.5 text-xs font-mono text-artisan-light uppercase tracking-widest outline-none focus:border-artisan-grey"
                                                />
                                             </div>
                                          )}

                                       </div>
                                    ))}
                                 </div>

                                 <button
                                    type="button"
                                    onClick={() => setEditSpecifications([...editSpecifications, { type: 'key_value', label: '', value: '', extra: {} }])}
                                    className="px-4 py-2 border border-dashed border-artisan-light/20 text-artisan-grey hover:border-artisan-grey hover:text-artisan-light transition-all font-mono text-[9px] font-bold uppercase tracking-widest w-fit"
                                 >
                                    + Add Specification Row
                                 </button>
                              </div>

                              {/* Active checkbox */}
                              <div className="flex items-center gap-3 pt-2">
                                 <input
                                    type="checkbox"
                                    id="active"
                                    checked={editActive}
                                    onChange={(e) => setEditActive(e.target.checked)}
                                    className="w-4 h-4 rounded border-artisan-light/10 bg-artisan-light/5 text-artisan-grey focus:ring-0"
                                 />
                                 <label htmlFor="active" className="text-[9px] font-mono text-artisan-light/60 uppercase tracking-widest block font-bold cursor-pointer select-none">
                                    Publish product publicly (Active status)
                                 </label>
                              </div>

                              {/* Featured toggle */}
                              <div className="flex items-center gap-3 pt-2">
                                 <input
                                    type="checkbox"
                                    id="featured"
                                    checked={editFeatured}
                                    onChange={(e) => setEditFeatured(e.target.checked)}
                                    className="w-4 h-4 rounded border-artisan-light/10 bg-artisan-light/5 text-artisan-grey focus:ring-0"
                                 />
                                 <label htmlFor="featured" className="text-[9px] font-mono text-artisan-light/60 uppercase tracking-widest block font-bold cursor-pointer select-none">
                                    Mark as Featured Supply (highlight on landing page)
                                 </label>
                              </div>

                              {/* Submit button */}
                              <button
                                 type="submit"
                                 disabled={actionLoading}
                                 className="w-full py-4.5 bg-artisan-light text-artisan-dark font-display font-black uppercase tracking-widest hover:bg-artisan-grey hover:text-artisan-dark transition-all flex items-center justify-center gap-3 disabled:opacity-50 text-xs"
                              >
                                 {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Specification Changes'}
                              </button>

                           </form>
                        </div>
                     )}

                     {/* STOCK MANAGER TAB */}
                     {activeTab === 'stock' && (
                        <div className="space-y-6">
                           <form onSubmit={handleUpdateStock} className="border border-artisan-light/10 bg-artisan-dark/50 p-6 sm:p-8 space-y-8">
                              
                              <div className="space-y-2">
                                 <span className="text-[9px] font-mono font-bold text-artisan-light/40 uppercase tracking-widest block">
                                    Inventory Stock Levels
                                 </span>
                                 <p className="text-[10px] font-mono text-artisan-light/50 uppercase leading-relaxed tracking-wider">
                                    Directly update the available physical quantities of this surgical supply product in our warehouse.
                                 </p>
                              </div>

                              {/* Stock controller display */}
                              <div className="flex flex-col sm:flex-row items-center gap-6 justify-center py-6 border-y border-artisan-light/5">
                                 
                                 {/* Dec buttons */}
                                 <div className="flex gap-2">
                                    <button
                                       type="button"
                                       onClick={() => adjustStock(-10)}
                                       className="h-10 px-3 bg-artisan-light/5 border border-artisan-light/10 hover:bg-artisan-light/10 text-artisan-light font-mono text-[10px] font-bold uppercase transition-all"
                                    >
                                       -10
                                    </button>
                                    <button
                                       type="button"
                                       onClick={() => adjustStock(-1)}
                                       className="h-10 w-10 bg-artisan-light/5 border border-artisan-light/10 hover:bg-artisan-light/10 text-artisan-light flex items-center justify-center transition-all"
                                    >
                                       <Minus className="w-4 h-4" />
                                    </button>
                                 </div>

                                 {/* Number Input */}
                                 <div className="w-36 text-center">
                                    <input
                                       type="number"
                                       value={stockCount}
                                       onChange={(e) => setStockCount(Math.max(0, parseInt(e.target.value) || 0).toString())}
                                       className="w-full text-center bg-transparent border-b-2 border-artisan-light/20 text-3xl font-mono font-black text-artisan-light focus:border-artisan-grey outline-none py-1"
                                       required
                                    />
                                    <span className="text-[8px] font-mono text-artisan-light/50 uppercase tracking-widest block mt-2">Physical Units</span>
                                 </div>

                                 {/* Inc buttons */}
                                 <div className="flex gap-2">
                                    <button
                                       type="button"
                                       onClick={() => adjustStock(1)}
                                       className="h-10 w-10 bg-artisan-light/5 border border-artisan-light/10 hover:bg-artisan-light/10 text-artisan-light flex items-center justify-center transition-all"
                                    >
                                       <Plus className="w-4 h-4" />
                                    </button>
                                    <button
                                       type="button"
                                       onClick={() => adjustStock(10)}
                                       className="h-10 px-3 bg-artisan-light/5 border border-artisan-light/10 hover:bg-artisan-light/10 text-artisan-light font-mono text-[10px] font-bold uppercase transition-all"
                                    >
                                       +10
                                    </button>
                                 </div>

                              </div>

                              {/* Multi-tier stock adjusters */}
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                 {[-100, -50, 50, 100].map((val) => (
                                    <button
                                       key={val}
                                       type="button"
                                       onClick={() => adjustStock(val)}
                                       className="h-10 bg-artisan-light/[0.02] border border-artisan-light/5 hover:bg-artisan-light/5 text-artisan-light font-mono text-[9px] font-bold transition-all uppercase tracking-widest"
                                    >
                                       {val > 0 ? `+${val}` : val} Units
                                    </button>
                                 ))}
                              </div>

                              {/* Save stock */}
                              <button
                                 type="submit"
                                 disabled={actionLoading}
                                 className="w-full py-4.5 bg-artisan-light text-artisan-dark font-display font-black uppercase tracking-widest hover:bg-artisan-grey hover:text-artisan-dark transition-all flex items-center justify-center gap-3 disabled:opacity-50 text-xs"
                              >
                                 {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Stock levels'}
                              </button>

                           </form>
                        </div>
                     )}

                  </div>

               </div>

            </div>

            {/* OVERVIEW TAB / CAROUSEL GRID DISPLAY IN DETAIL */}
            {activeTab === 'specs' && (
               <div className="mt-8 border border-artisan-light/10 bg-artisan-dark/50 p-6 sm:p-8 space-y-4">
                  <span className="text-[9px] font-mono text-artisan-light/40 uppercase tracking-widest flex items-center gap-1.5 font-bold">
                     <Package className="w-3.5 h-3.5 text-artisan-grey" />
                     Surgical Product Image Gallery Dossier
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                     {editUploadedImages.length === 0 ? (
                        <div className="border border-artisan-light/10 p-2 flex flex-col items-center justify-center bg-artisan-light/[0.01] aspect-square relative">
                           <span className="text-3xl">📦</span>
                           <span className="text-[7px] font-mono text-artisan-light/20 uppercase tracking-wider block mt-1">No images</span>
                        </div>
                     ) : (
                        editUploadedImages.map((img, i) => {
                           const isPrimary = editImage === img.url
                           return (
                              <div key={img.publicId || i} className={`border p-1.5 flex flex-col items-center justify-center bg-artisan-light/[0.01] aspect-square relative ${isPrimary ? 'border-artisan-grey' : 'border-artisan-light/10'}`}>
                                 <img src={img.url} alt={`Gallery ${i}`} className="w-full h-full object-cover" />
                                 {isPrimary && (
                                    <span className="absolute bottom-1 right-1 text-[6px] font-mono font-bold uppercase tracking-widest bg-artisan-grey text-artisan-dark px-1.5 py-0.5 border border-artisan-dark">
                                       Cover
                                    </span>
                                 )}
                              </div>
                           )
                        })
                     )}
                  </div>
               </div>
            )}

         </div>

         {/* Delete Confirmation Modal */}
         <AnimatePresence>
            {showDeleteConfirm && (
               <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
                  <motion.div
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     exit={{ opacity: 0 }}
                     onClick={() => setShowDeleteConfirm(false)}
                     className="absolute inset-0 bg-artisan-dark/95 backdrop-blur-md"
                  />
                  <motion.div
                     initial={{ scale: 0.95, opacity: 0 }}
                     animate={{ scale: 1, opacity: 1 }}
                     exit={{ scale: 0.95, opacity: 0 }}
                     className="relative w-full max-w-md bg-artisan-dark border border-red-500/20 p-6 sm:p-8 shadow-2xl space-y-6 z-10"
                  >
                     <div className="flex items-center gap-3 text-red-500">
                        <AlertTriangle className="w-6 h-6 shrink-0" />
                        <h3 className="text-lg font-display font-black uppercase tracking-tight">Confirm Registry Deletion</h3>
                     </div>
                     <p className="text-xs font-mono text-artisan-light/60 uppercase leading-relaxed tracking-wider">
                        Are you sure you want to permanently delete this product from the surgical supplies catalog? This action is irreversible.
                     </p>
                     
                     <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <button
                           onClick={() => setShowDeleteConfirm(false)}
                           className="flex-1 h-12 border border-artisan-light/10 text-artisan-light hover:bg-artisan-light/5 transition-all font-mono text-[9px] font-bold uppercase tracking-widest"
                        >
                           Cancel
                        </button>
                        <button
                           onClick={handleDeleteProduct}
                           disabled={actionLoading}
                           className="flex-1 h-12 bg-red-600 text-artisan-light hover:bg-red-700 transition-all flex items-center justify-center gap-2 font-mono text-[9px] font-bold uppercase tracking-widest disabled:opacity-50"
                        >
                           {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Confirm Delete'}
                        </button>
                     </div>
                  </motion.div>
               </div>
            )}
         </AnimatePresence>

      </div>
   )
}
