import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
   ArrowLeft,
   Loader2,
   Plus,
   Trash2,
   UploadCloud,
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
   const [category, setCategory] = useState('Rehabilitation')
   const [customCategory, setCustomCategory] = useState('')
   const [lowStockThreshold, setLowStockThreshold] = useState('10')
   const [image, setImage] = useState('')
   const [uploadedImages, setUploadedImages] = useState([])
   const [active, setActive] = useState(true)
   const [specifications, setSpecifications] = useState([{ type: 'key_value', label: '', value: '', extra: {} }])

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

      const specsPayload = specifications
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
            sku: sku.trim().toUpperCase(),
            name: name.trim(),
            desc: desc.trim(),
            price: parseFloat(price),
            quantity: parseInt(quantity, 10),
            category: finalCategory,
            lowstockthreshold: parseInt(lowStockThreshold, 10),
            active: active,
            image: image, // Primary image url
            images: uploadedImages, // Array of { url, publicId }
            specifications: specsPayload
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
                          {specifications.map((spec, index) => (
                             <div key={index} className="border border-artisan-light/10 bg-artisan-light/[0.01] p-4 space-y-3 relative">
                                {/* Header with Type Selector & Delete */}
                                <div className="flex justify-between items-center border-b border-artisan-light/5 pb-2">
                                   <div className="flex items-center gap-2">
                                      <span className="text-[10px] font-mono font-bold text-artisan-grey uppercase tracking-wider">Type:</span>
                                      <select
                                         value={spec.type || 'key_value'}
                                         onChange={(e) => {
                                            const newSpecs = [...specifications]
                                            newSpecs[index].type = e.target.value
                                            newSpecs[index].label = ''
                                            newSpecs[index].value = ''
                                            setSpecifications(newSpecs)
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
                                         setSpecifications(specifications.filter((_, i) => i !== index))
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
                                            const newSpecs = [...specifications]
                                            newSpecs[index].label = e.target.value
                                            setSpecifications(newSpecs)
                                         }}
                                         className="bg-artisan-light/[0.01] border border-artisan-light/10 p-2.5 text-xs font-mono text-artisan-light uppercase tracking-widest outline-none focus:border-artisan-grey"
                                         required
                                      />
                                      <input
                                         type="text"
                                         placeholder="Value (e.g. Stainless Steel)"
                                         value={spec.value}
                                         onChange={(e) => {
                                            const newSpecs = [...specifications]
                                            newSpecs[index].value = e.target.value
                                            setSpecifications(newSpecs)
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
                                            const newSpecs = [...specifications]
                                            newSpecs[index].label = e.target.value
                                            setSpecifications(newSpecs)
                                         }}
                                         className="w-full bg-artisan-light/[0.01] border border-artisan-light/10 p-2.5 text-xs font-mono text-artisan-light uppercase tracking-widest outline-none focus:border-artisan-grey"
                                         required
                                      />
                                      <textarea
                                         placeholder="Paragraph details, instructions, safety protocols..."
                                         value={spec.value}
                                         onChange={(e) => {
                                            const newSpecs = [...specifications]
                                            newSpecs[index].value = e.target.value
                                            setSpecifications(newSpecs)
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
                                             const newSpecs = [...specifications];
                                             const updatedImages = [...specImages, res.data.data.url];
                                             newSpecs[index].value = JSON.stringify(updatedImages);
                                             setSpecifications(newSpecs);
                                             addToast('Specification image uploaded', 'success');
                                          } catch (err) {
                                             addToast('Failed to upload image', 'error');
                                          }
                                       }
                                    };

                                    const handleDeleteSpecImage = (imgIdx) => {
                                       const newSpecs = [...specifications];
                                       const updatedImages = specImages.filter((_, i) => i !== imgIdx);
                                       newSpecs[index].value = updatedImages.length > 0 ? JSON.stringify(updatedImages) : '';
                                       setSpecifications(newSpecs);
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
                                                const newSpecs = [...specifications];
                                                newSpecs[index].label = e.target.value;
                                                setSpecifications(newSpecs);
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
                                            const newSpecs = [...specifications]
                                            newSpecs[index].label = e.target.value
                                            setSpecifications(newSpecs)
                                         }}
                                         className="bg-artisan-light/[0.01] border border-artisan-light/10 p-2.5 text-xs font-mono text-artisan-light uppercase tracking-widest outline-none focus:border-artisan-grey"
                                      />
                                      <input
                                         type="text"
                                         placeholder="YouTube or Video URL"
                                         value={spec.value}
                                         onChange={(e) => {
                                            const newSpecs = [...specifications]
                                            newSpecs[index].value = e.target.value
                                            setSpecifications(newSpecs)
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
                                            const newSpecs = [...specifications]
                                            newSpecs[index].label = e.target.value
                                            setSpecifications(newSpecs)
                                         }}
                                         className="bg-artisan-light/[0.01] border border-artisan-light/10 p-2.5 text-xs font-mono text-artisan-light uppercase tracking-widest outline-none focus:border-artisan-grey"
                                      />
                                      <input
                                         type="text"
                                         placeholder="Value / Meta String"
                                         value={spec.value}
                                         onChange={(e) => {
                                            const newSpecs = [...specifications]
                                            newSpecs[index].value = e.target.value
                                            setSpecifications(newSpecs)
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
                          onClick={() => setSpecifications([...specifications, { type: 'key_value', label: '', value: '', extra: {} }])}
                          className="px-4 py-2 border border-dashed border-artisan-light/20 text-artisan-grey hover:border-artisan-grey hover:text-artisan-light transition-all font-mono text-[9px] font-bold uppercase tracking-widest w-fit"
                       >
                          + Add Specification Row
                       </button>
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
