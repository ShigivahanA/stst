import { useState } from 'react'
import {
   Plus,
   Trash2,
   UploadCloud,
   Loader2,
   CheckCircle
} from 'lucide-react'
import { useToast } from '../../context/ToastContext'
import api from '../../services/api'

export default function ImageGalleryManager({
   images = [],
   onChange,
   primaryImage = '',
   onPrimaryChange
}) {
   const { addToast } = useToast()
   const [uploading, setUploading] = useState(false)

   const handleUpload = async (e) => {
      const file = e.target.files[0]
      if (!file) return

      if (images.length >= 6) {
         addToast('Maximum catalog limit of 6 images reached', 'warning')
         return
      }

      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onloadend = async () => {
         try {
            setUploading(true)
            const base64Image = reader.result
            
            // Upload to Cloudinary via backend admin route
            const res = await api.post('/admin/products/upload-image', {
               image: base64Image
            })
            
            const newImage = res.data.data // { url, publicId }
            const updatedImages = [...images, newImage]
            
            onChange(updatedImages)
            
            // If no primary image is set, default to this first upload
            if (!primaryImage || primaryImage === '') {
               onPrimaryChange(newImage.url)
            }
            
            addToast('Image uploaded successfully to Cloudinary', 'success')
         } catch (err) {
            addToast(err.response?.data?.message || 'Failed to upload image', 'error')
         } finally {
            setUploading(false)
         }
      }
   }

   const handleDelete = async (index, publicId) => {
      try {
         setUploading(true)
         
         // Delete from Cloudinary via backend
         await api.post('/admin/products/delete-image', { publicId })
         
         const updatedImages = images.filter((_, i) => i !== index)
         onChange(updatedImages)

         const deletedUrl = images[index]?.url
         // If we deleted the primary image, update the primary to the next available one
         if (primaryImage === deletedUrl) {
            onPrimaryChange(updatedImages[0]?.url || '')
         }
         
         addToast('Image deleted from catalog', 'success')
      } catch (err) {
         addToast('Failed to delete image from host', 'error')
      } finally {
         setUploading(false)
      }
   }

   return (
      <div className="space-y-4">
         <div className="space-y-1">
            <label className="text-[9px] font-mono text-artisan-light/40 uppercase tracking-widest block font-bold">
               Product Gallery Manager ({images.length} / 6 Images)
            </label>
            <span className="text-[9px] font-mono text-artisan-light/20 uppercase tracking-wider block">
               Upload up to 6 surgical supply photos. Select one as primary cover.
            </span>
         </div>

         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            
            {/* Display Uploaded Images */}
            {images.map((img, index) => {
               const isPrimary = primaryImage === img.url
               return (
                  <div 
                     key={img.publicId || index} 
                     className={`relative border group aspect-square flex items-center justify-center bg-artisan-light/[0.01] ${isPrimary ? 'border-artisan-grey' : 'border-artisan-light/10'}`}
                  >
                     <img 
                        src={img.url} 
                        alt={`Product ${index + 1}`} 
                        className="w-full h-full object-cover"
                     />

                     {/* Image actions overlay */}
                     <div className="absolute inset-0 bg-artisan-dark/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                        {/* Delete Button */}
                        <div className="flex justify-end">
                           <button
                              type="button"
                              onClick={() => handleDelete(index, img.publicId)}
                              disabled={uploading}
                              className="p-1 bg-red-950/20 border border-red-900/50 text-red-500 hover:bg-red-600 hover:text-artisan-light hover:border-red-600 transition-all"
                              title="Delete Image"
                           >
                              <Trash2 className="w-3.5 h-3.5" />
                           </button>
                        </div>

                        {/* Set Primary Action */}
                        <button
                           type="button"
                           onClick={() => onPrimaryChange(img.url)}
                           disabled={isPrimary || uploading}
                           className={`w-full py-1 text-[8px] font-mono font-bold uppercase tracking-wider border text-center transition-all ${
                              isPrimary 
                                 ? 'bg-artisan-grey/10 border-artisan-grey text-artisan-grey' 
                                 : 'bg-artisan-light/5 border-artisan-light/10 text-artisan-light hover:bg-artisan-light hover:text-artisan-dark'
                           }`}
                        >
                           {isPrimary ? 'Primary' : 'Set Cover'}
                        </button>
                     </div>

                     {/* Primary Corner Indicator */}
                     {isPrimary && (
                        <div className="absolute -top-1.5 -right-1.5 bg-artisan-grey text-artisan-dark p-0.5 rounded-full border border-artisan-dark">
                           <CheckCircle className="w-3 h-3 text-artisan-dark fill-artisan-light" />
                        </div>
                     )}
                  </div>
               )
            })}

            {/* Upload Button Slot */}
            {images.length < 6 && (
               <label className={`border border-dashed border-artisan-light/20 aspect-square flex flex-col items-center justify-center cursor-pointer hover:border-artisan-grey/50 transition-all ${uploading ? 'pointer-events-none' : ''}`}>
                  <input
                     type="file"
                     accept="image/*"
                     onChange={handleUpload}
                     className="hidden"
                     disabled={uploading}
                  />
                  {uploading ? (
                     <Loader2 className="w-5 h-5 animate-spin text-artisan-grey" />
                  ) : (
                     <>
                        <UploadCloud className="w-5 h-5 text-artisan-light/35 mb-1 group-hover:text-artisan-light transition-colors" />
                        <span className="text-[8px] font-mono text-artisan-light/40 uppercase tracking-widest text-center px-1">
                           Upload
                        </span>
                     </>
                  )}
               </label>
            )}

         </div>
      </div>
   )
}
