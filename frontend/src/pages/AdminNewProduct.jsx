import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
   ArrowLeft,
   Loader2,
   Plus,
   AlertTriangle
} from 'lucide-react'
import { useToast } from '../context/ToastContext'
import api from '../services/api'
import ImageGalleryManager from '../components/admin/ImageGalleryManager'

export default function AdminNewProduct() {
   const navigate = useNavigate()
   const { addToast } = useToast()

   const [actionLoading, setActionLoading] = useState(false)
   const [errorMessage, setErrorMessage] = useState('')

   // Form states
   const [sku, setSku] = useState('')
   const [name, setName] = useState('')
   const [desc, setDesc] = useState('')
   const [price, setPrice] = useState('')
   const [quantity, setQuantity] = useState('0')
   const [category, setCategory] = useState('Instruments')
   const [customCategory, setCustomCategory] = useState('')
   const [lowStockThreshold, setLowStockThreshold] = useState('10')
   const [image, setImage] = useState('')
   const [uploadedImages, setUploadedImages] = useState([])
   const [active, setActive] = useState(true)

   const handleSubmit = async (e) => {
      e.preventDefault()
      setErrorMessage('')

      // Determine final category string
      const finalCategory = category === 'Other' ? customCategory.trim() : category

      if (category === 'Other' && !finalCategory) {
         setErrorMessage('Custom category name is required')
         return
      }

      if (uploadedImages.length === 0) {
         setErrorMessage('At least one product image is required')
         return
      }

      try {
         setActionLoading(true)

         const payload = {
            sku: sku.trim().toUpperCase(),
            name: name.trim(),
            desc: desc.trim(),
            price: parseFloat(price),
            quantity: parseInt(quantity, 10),
            category: finalCategory,
            lowstockthreshold: parseInt(lowStockThreshold, 10),
            active: active,
            image: image, // Primary image url
            images: uploadedImages // Array of { url, publicId }
         }

         await api.post('/products', payload)
         addToast('Product successfully added to registry', 'success')
         navigate('/admin/products')
      } catch (err) {
         const serverError = err.response?.data?.message || 'Failed to register product'
         setErrorMessage(serverError)
         addToast(serverError, 'error')
      } finally {
         setActionLoading(false)
      }
   }

   return (
      <div className="min-h-screen bg-artisan-dark bg-noise pt-32 pb-24 text-artisan-light">
         <div className="container-custom max-w-3xl">

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

            {/* HEADER */}
            <div className="mb-10 space-y-2">
               <h1 className="text-4xl sm:text-5xl font-display font-black uppercase tracking-tighter text-artisan-light leading-none">
                  ADD NEW <span className="text-outline">PRODUCT.</span>
               </h1>
            </div>

            {/* ERROR CARD */}
            <AnimatePresence>
               {errorMessage && (
                  <motion.div
                     initial={{ opacity: 0, y: -10 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, y: -10 }}
                     className="mb-8 p-4 border border-red-500/20 bg-red-500/5 text-red-500 flex items-start gap-3"
                  >
                     <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                     <div className="space-y-1">
                        <span className="font-mono text-[10px] font-black uppercase tracking-widest block">Registry Rejection</span>
                        <p className="text-[11px] font-mono uppercase tracking-wider leading-relaxed text-red-500/80">
                           {errorMessage}
                        </p>
                     </div>
                  </motion.div>
               )}
            </AnimatePresence>

            {/* FORM */}
            <form onSubmit={handleSubmit} className="border border-artisan-light/10 bg-artisan-dark/50 p-6 sm:p-10 space-y-8">

               {/* Basic Details Section */}
               <div className="space-y-6">
                  <span className="text-[9px] font-mono font-bold text-artisan-light/40 uppercase tracking-widest block border-b border-artisan-light/5 pb-2">
                     1. Product Classification & SKU
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                     {/* SKU */}
                     <div className="space-y-2">
                        <label className="text-[8px] font-mono text-artisan-light/40 uppercase tracking-widest block font-bold">
                           Unique SKU Code <span className="text-artisan-grey">*</span>
                        </label>
                        <input
                           type="text"
                           value={sku}
                           onChange={(e) => setSku(e.target.value.toUpperCase())}
                           placeholder="e.g. OR-SCAL-10"
                           className="w-full bg-artisan-light/[0.01] border border-artisan-light/10 p-4 text-xs sm:text-sm font-mono text-artisan-light uppercase tracking-widest outline-none focus:border-artisan-grey transition-all"
                           required
                        />
                     </div>

                     {/* Category Selection */}
                     <div className="space-y-2">
                        <label className="text-[8px] font-mono text-artisan-light/40 uppercase tracking-widest block font-bold">
                           Clinical Category <span className="text-artisan-grey">*</span>
                        </label>
                        <div className="relative">
                           <select
                              value={category}
                              onChange={(e) => setCategory(e.target.value)}
                              className="w-full bg-artisan-light/[0.01] border border-artisan-light/10 p-4 text-xs sm:text-sm font-mono text-artisan-light uppercase tracking-widest outline-none focus:border-artisan-grey transition-all appearance-none"
                           >
                              <option value="Instruments" className="bg-artisan-dark text-artisan-light">Instruments</option>
                              <option value="Orthopedics" className="bg-artisan-dark text-artisan-light">Orthopedics</option>
                              <option value="Respiratory" className="bg-artisan-dark text-artisan-light">Respiratory</option>
                              <option value="Diagnostics" className="bg-artisan-dark text-artisan-light">Diagnostics</option>
                              <option value="Consumables" className="bg-artisan-dark text-artisan-light">Consumables</option>
                              <option value="Other" className="bg-artisan-dark text-artisan-light">Other / Custom</option>
                           </select>
                           <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-artisan-light/30 text-[9px] font-mono">▼</div>
                        </div>
                     </div>
                  </div>

                  {/* Custom Category Input */}
                  {category === 'Other' && (
                     <div className="space-y-2">
                        <label className="text-[8px] font-mono text-artisan-light/40 uppercase tracking-widest block font-bold">
                           Specify Custom Category Name <span className="text-artisan-grey">*</span>
                        </label>
                        <input
                           type="text"
                           value={customCategory}
                           onChange={(e) => setCustomCategory(e.target.value)}
                           placeholder="e.g. Cardiovascular"
                           className="w-full bg-artisan-light/[0.01] border border-artisan-light/10 p-4 text-xs sm:text-sm font-mono text-artisan-light uppercase tracking-widest outline-none focus:border-artisan-grey transition-all"
                           required
                        />
                     </div>
                  )}
               </div>

               {/* Pricing & Stock Section */}
               <div className="space-y-6">
                  <span className="text-[9px] font-mono font-bold text-artisan-light/40 uppercase tracking-widest block border-b border-artisan-light/5 pb-2">
                     2. Name, Pricing & Stock Metrics
                  </span>

                  {/* Name */}
                  <div className="space-y-2">
                     <label className="text-[8px] font-mono text-artisan-light/40 uppercase tracking-widest block font-bold">
                        Product Display Name <span className="text-artisan-grey">*</span>
                     </label>
                     <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Disposable Scalpel Size 10"
                        className="w-full bg-artisan-light/[0.01] border border-artisan-light/10 p-4 text-xs sm:text-sm font-mono text-artisan-light uppercase tracking-widest outline-none focus:border-artisan-grey transition-all"
                        required
                     />
                  </div>

                  {/* Price, Qty, Low Threshold Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                     {/* Price */}
                     <div className="space-y-2">
                        <label className="text-[8px] font-mono text-artisan-light/40 uppercase tracking-widest block font-bold">
                           Unit Price (₹) <span className="text-artisan-grey">*</span>
                        </label>
                        <input
                           type="number"
                           value={price}
                           onChange={(e) => setPrice(e.target.value)}
                           placeholder="Price in INR"
                           min="0"
                           step="0.01"
                           className="w-full bg-artisan-light/[0.01] border border-artisan-light/10 p-4 text-xs sm:text-sm font-mono text-artisan-light tracking-widest outline-none focus:border-artisan-grey transition-all"
                           required
                        />
                     </div>

                     {/* Quantity */}
                     <div className="space-y-2">
                        <label className="text-[8px] font-mono text-artisan-light/40 uppercase tracking-widest block font-bold">
                           Initial Stock Quantity <span className="text-artisan-grey">*</span>
                        </label>
                        <input
                           type="number"
                           value={quantity}
                           onChange={(e) => setQuantity(e.target.value)}
                           placeholder="0"
                           min="0"
                           step="1"
                           className="w-full bg-artisan-light/[0.01] border border-artisan-light/10 p-4 text-xs sm:text-sm font-mono text-artisan-light tracking-widest outline-none focus:border-artisan-grey transition-all"
                           required
                        />
                     </div>

                     {/* Low Stock Threshold */}
                     <div className="space-y-2">
                        <label className="text-[8px] font-mono text-artisan-light/40 uppercase tracking-widest block font-bold">
                           Low Stock Trigger Limit <span className="text-artisan-grey">*</span>
                        </label>
                        <input
                           type="number"
                           value={lowStockThreshold}
                           onChange={(e) => setLowStockThreshold(e.target.value)}
                           placeholder="10"
                           min="0"
                           step="1"
                           className="w-full bg-artisan-light/[0.01] border border-artisan-light/10 p-4 text-xs sm:text-sm font-mono text-artisan-light tracking-widest outline-none focus:border-artisan-grey transition-all"
                           required
                        />
                     </div>
                  </div>
               </div>

               {/* Descriptions & Images Section */}
               <div className="space-y-6">
                  <span className="text-[9px] font-mono font-bold text-artisan-light/40 uppercase tracking-widest block border-b border-artisan-light/5 pb-2">
                     3. Description & Logistics Data
                  </span>

                  {/* Description */}
                  <div className="space-y-2">
                     <label className="text-[8px] font-mono text-artisan-light/40 uppercase tracking-widest block font-bold">
                        Detailed Description
                     </label>
                     <textarea
                        value={desc}
                        onChange={(e) => setDesc(e.target.value)}
                        placeholder="Detailed clinical specifications, dimensions, sterilization protocols, materials..."
                        className="w-full h-32 bg-artisan-light/[0.01] border border-artisan-light/10 p-4 text-xs sm:text-sm font-mono text-artisan-light uppercase tracking-widest outline-none focus:border-artisan-grey transition-all resize-none"
                     />
                  </div>

                  {/* Multiple Images Gallery Manager */}
                  <div className="space-y-2">
                     <ImageGalleryManager
                        images={uploadedImages}
                        onChange={setUploadedImages}
                        primaryImage={image}
                        onPrimaryChange={setImage}
                     />
                  </div>

                  {/* Active Toggle */}
                  <div className="flex items-center gap-3 pt-4">
                     <input
                        type="checkbox"
                        id="active"
                        checked={active}
                        onChange={(e) => setActive(e.target.checked)}
                        className="w-4 h-4 rounded border-artisan-light/10 bg-artisan-light/5 text-artisan-grey focus:ring-0"
                     />
                     <label htmlFor="active" className="text-[9px] font-mono text-artisan-light/60 uppercase tracking-widest block font-bold cursor-pointer select-none">
                        Publish Product Immediately (Active status)
                     </label>
                  </div>
               </div>

               {/* Submit Button */}
               <button
                  type="submit"
                  disabled={actionLoading}
                  className="w-full py-4.5 bg-artisan-light text-artisan-dark font-display font-black uppercase tracking-widest hover:bg-artisan-grey hover:text-artisan-dark transition-all flex items-center justify-center gap-3 disabled:opacity-50 text-xs"
               >
                  {actionLoading ? (
                     <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                     <>
                        <Plus className="w-4 h-4" />
                        <span>Register Product</span>
                     </>
                  )}
               </button>

            </form>
         </div>
      </div>
   )
}
