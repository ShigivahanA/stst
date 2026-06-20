import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
   Package,
   Search,
   Plus,
   RefreshCcw,
   Loader2,
   AlertTriangle,
   Settings,
   List,
   LayoutGrid,
   ArrowLeft
} from 'lucide-react'
import { useToast } from '../context/ToastContext'
import api from '../services/api'

// Robust product image component with error fallback
function ProductImage({ src, alt, className = "w-12 h-12" }) {
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
            <span className="text-xl">📦</span>
         )}
      </div>
   );
}

export default function AdminProduct() {
   const { addToast } = useToast()
   const [loading, setLoading] = useState(true)
   const [products, setProducts] = useState([])
   const [search, setSearch] = useState('')
   const [viewMode, setViewMode] = useState('table') // 'table' or 'card'

   const fetchProducts = async () => {
      try {
         setLoading(true)
         const res = await api.get('/products?all=true')
         setProducts(res.data.data.results || [])
      } catch (err) {
         addToast('Failed to load surgical supply inventory', 'error')
      } finally {
         setLoading(false)
      }
   }

   useEffect(() => {
      fetchProducts()
   }, [])

   const filteredProducts = products.filter(p => {
      return p.name.toLowerCase().includes(search.toLowerCase()) ||
         p.sku.toLowerCase().includes(search.toLowerCase()) ||
         p.category.toLowerCase().includes(search.toLowerCase())
   })

   return (
      <div className="min-h-screen bg-artisan-dark bg-noise pt-32 pb-24 text-artisan-light">
         <div className="container-custom">

            {/* BACK LINK */}
            <div className="mb-6">
               <Link
                  to="/admin"
                  className="inline-flex items-center gap-3 group"
               >
                  <div className="w-8 h-8 border border-artisan-light/10 flex items-center justify-center group-hover:bg-artisan-light group-hover:text-artisan-dark transition-all rounded-full">
                     <ArrowLeft className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono font-bold text-artisan-light/40 uppercase tracking-[0.4em] group-hover:text-artisan-light transition-colors">
                     Back to Dashboard
                  </span>
               </Link>
            </div>

            {/* HEADER SECTION */}
            <div className="mb-12">
               <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                  <div className="space-y-4">
                     <h1 className="text-6xl md:text-8xl font-display font-black uppercase tracking-tighter leading-[0.8] text-artisan-light">
                        SURGICAL <br />
                        <span className="text-outline">INVENTORY.</span>
                     </h1>
                  </div>

                  {/* SEARCH & ACTIONS HUD */}
                  <div className="lg:w-1/2 flex flex-col gap-4 w-full">
                     <div className="relative overflow-hidden bg-artisan-light/[0.01] border border-artisan-light/10 focus-within:border-artisan-grey/30 focus-within:bg-artisan-light/[0.03] transition-all duration-300">
                        <div className="flex items-center">
                           <div className="pl-6 shrink-0 text-artisan-light/50">
                              <Search className="w-5 h-5" />
                           </div>
                           <input
                              type="text"
                              value={search}
                              onChange={(e) => setSearch(e.target.value)}
                              className="w-full bg-transparent py-5 px-4 text-xs sm:text-sm font-mono text-artisan-light uppercase tracking-wider outline-none placeholder:text-artisan-light/20"
                              placeholder="Search by name, SKU, or category..."
                           />
                           <div className="pr-6 shrink-0 hidden sm:block">
                              <span className="text-[9px] font-mono text-artisan-light/40 uppercase">
                                 Found: {filteredProducts.length}
                              </span>
                           </div>
                        </div>
                     </div>

                     <div className="flex flex-wrap gap-4 justify-between items-center">
                        <div className="flex items-center gap-3">
                           {/* Reload button */}
                           <button
                              onClick={fetchProducts}
                              className="h-10 px-5 bg-artisan-light/5 border border-artisan-light/10 flex items-center justify-center gap-2 hover:bg-artisan-light/10 hover:border-artisan-light/20 transition-all group shrink-0 font-mono text-[9px] font-bold uppercase tracking-widest text-artisan-grey"
                              title="Reload list"
                           >
                              <RefreshCcw className={`w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-700 ${loading ? 'animate-spin' : ''}`} />
                              <span>Reload list</span>
                           </button>

                           {/* View Mode Toggle */}
                           <div className="hidden lg:flex bg-artisan-light/5 border border-artisan-light/10 p-0.5 shrink-0">
                              <button
                                 onClick={() => setViewMode('table')}
                                 className={`h-9 px-3.5 transition-all flex items-center justify-center gap-1.5 ${viewMode === 'table' ? 'bg-artisan-light text-artisan-dark font-black' : 'text-artisan-light/40 hover:text-artisan-light'}`}
                                 title="Table View"
                              >
                                 <List className="w-3.5 h-3.5" />
                              </button>
                              <button
                                 onClick={() => setViewMode('card')}
                                 className={`h-9 px-3.5 transition-all flex items-center justify-center gap-1.5 ${viewMode === 'card' ? 'bg-artisan-light text-artisan-dark font-black' : 'text-artisan-light/40 hover:text-artisan-light'}`}
                                 title="Card View"
                              >
                                 <LayoutGrid className="w-3.5 h-3.5" />
                              </button>
                           </div>
                        </div>

                        <Link
                           to="/admin/products/new"
                           className="h-10 px-5 bg-artisan-light text-artisan-dark flex items-center justify-center gap-2 hover:bg-artisan-grey transition-all shrink-0 font-mono text-[9px] font-bold uppercase tracking-widest"
                        >
                           <Plus className="w-4 h-4" />
                           <span>+ Add Product</span>
                        </Link>
                     </div>
                  </div>
               </div>
            </div>

            {/* MEMBER DIRECTORY - DESKTOP VIEW (TABLE MODE) */}
            {viewMode === 'table' && (
               <div className="hidden lg:block border border-artisan-light/10 bg-artisan-dark/50 shadow-2xl overflow-hidden mb-16">
                  <div className="overflow-x-auto">
                     <table className="w-full border-collapse">
                        <thead>
                           <tr className="border-b border-artisan-light/10 bg-artisan-light/[0.02] text-left">
                              <th className="px-6 py-5 text-[9px] font-mono font-bold text-artisan-light/40 uppercase tracking-[0.2em]">SKU</th>
                              <th className="px-6 py-5 text-[9px] font-mono font-bold text-artisan-light/40 uppercase tracking-[0.2em]">Product Details</th>
                              <th className="px-6 py-5 text-[9px] font-mono font-bold text-artisan-light/40 uppercase tracking-[0.2em]">Price</th>
                              <th className="px-6 py-5 text-[9px] font-mono font-bold text-artisan-light/40 uppercase tracking-[0.2em]">Stock Level</th>
                              <th className="px-6 py-5 text-[9px] font-mono font-bold text-artisan-light/40 uppercase tracking-[0.2em]">Status</th>
                              <th className="px-6 py-5 text-right text-[9px] font-mono font-bold text-artisan-light/40 uppercase tracking-[0.2em]">Actions</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-artisan-light/5">
                           {loading ? (
                              Array(5).fill(0).map((_, i) => (
                                 <tr key={i} className="animate-pulse">
                                    <td colSpan="6" className="px-6 py-9 bg-artisan-light/[0.005]" />
                                 </tr>
                              ))
                           ) : filteredProducts.length === 0 ? (
                              <tr>
                                 <td colSpan="6" className="px-6 py-20 text-center">
                                    <Package className="w-12 h-12 text-artisan-light/5 mx-auto mb-4" />
                                    <p className="text-[10px] font-mono text-artisan-light/20 uppercase tracking-[0.3em]">No products registered</p>
                                 </td>
                              </tr>
                           ) : (
                              filteredProducts.map((product) => {
                                 const isLowStock = product.quantity <= product.lowstockthreshold;
                                 return (
                                    <tr key={product._id} className={`group hover:bg-artisan-light/[0.02] transition-all duration-300 ${!product.active ? 'bg-artisan-light/[0.002]' : ''}`}>
                                       <td className="px-6 py-8 align-top">
                                          <span className="text-[10px] font-mono text-artisan-grey font-bold tracking-tighter">
                                             {product.sku}
                                          </span>
                                       </td>
                                       <td className="px-6 py-8">
                                          <div className="flex items-center gap-4">
                                             <ProductImage src={product.image} alt={product.name} className="w-12 h-12" />
                                             <div className="flex flex-col min-w-0">
                                                <span className="text-md font-display font-black text-artisan-light uppercase tracking-tight group-hover:text-artisan-grey transition-colors truncate">{product.name}</span>
                                                <span className="text-[8px] font-mono text-artisan-light/35 uppercase tracking-widest mt-0.5">{product.category}</span>
                                             </div>
                                          </div>
                                       </td>
                                       <td className="px-6 py-8 font-mono text-[10px] sm:text-xs">
                                          ₹{product.price?.toLocaleString()}
                                       </td>
                                       <td className="px-6 py-8">
                                          <div className="flex flex-col gap-1">
                                             <span className="font-mono text-xs">{product.quantity} Units</span>
                                             {isLowStock && (
                                                <span className="text-[8px] font-mono font-black uppercase text-red-500 tracking-wider flex items-center gap-1">
                                                   <AlertTriangle className="w-3 h-3 shrink-0" />
                                                   Low Stock Alert
                                                </span>
                                             )}
                                          </div>
                                       </td>
                                       <td className="px-6 py-8">
                                          <div className="flex items-center gap-2">
                                             <div className={`w-1.5 h-1.5 rounded-full ${product.active ? 'bg-green-500' : 'bg-red-500'}`} />
                                             <span className={`text-[9px] font-mono font-black uppercase tracking-widest ${product.active ? 'text-green-500' : 'text-red-500'}`}>
                                                {product.active ? 'Active' : 'Inactive'}
                                             </span>
                                          </div>
                                       </td>
                                       <td className="px-6 py-8 text-right">
                                          <div className="flex justify-end">
                                             <Link
                                                to={`/admin/products/${product._id}`}
                                                className="px-4 py-2.5 bg-artisan-light/5 border border-artisan-light/10 text-artisan-light hover:bg-artisan-light hover:text-artisan-dark hover:border-artisan-light transition-all text-[9px] font-mono font-bold uppercase tracking-widest flex items-center gap-1.5"
                                                title="Manage details & stock"
                                             >
                                                <Settings className="w-3.5 h-3.5" />
                                                <span>Manage</span>
                                             </Link>
                                          </div>
                                       </td>
                                    </tr>
                                 );
                              })
                           )}
                        </tbody>
                     </table>
                  </div>
               </div>
            )}

            {/* MEMBER DIRECTORY - GRID/CARD MODE (RENDERED FOR CARD VIEW OR FOR ALL MOBILE VIEWPORTS) */}
            {(viewMode === 'card' || loading) ? (
               <div className={`${viewMode === 'card' ? 'block' : 'block lg:hidden'} mb-16`}>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     {loading ? (
                        Array(6).fill(0).map((_, i) => (
                           <div key={i} className="p-6 border border-artisan-light/10 bg-artisan-light/[0.01] animate-pulse h-48 w-full" />
                        ))
                     ) : filteredProducts.length === 0 ? (
                        <div className="col-span-full p-12 text-center border border-dashed border-artisan-light/10 bg-artisan-light/[0.01]">
                           <Package className="w-12 h-12 text-artisan-light/5 mx-auto mb-4" />
                           <p className="text-[10px] font-mono text-artisan-light/20 uppercase tracking-[0.3em]">No products registered</p>
                        </div>
                     ) : (
                        filteredProducts.map((product) => {
                           const isLowStock = product.quantity <= product.lowstockthreshold;
                           return (
                              <div
                                 key={product._id}
                                 className={`p-5 border border-artisan-light/10 bg-artisan-light/[0.01] hover:border-artisan-grey/35 hover:-translate-y-1 transition-all duration-300 flex flex-col gap-4 relative group ${!product.active ? 'border-red-500/20 bg-red-500/[0.005]' : ''}`}
                              >
                                 {/* Top Row: SKU, Category */}
                                 <div className="flex justify-between items-center">
                                    <span className="text-[9px] font-mono text-artisan-grey font-bold tracking-tighter">
                                       {product.sku}
                                    </span>
                                    <div className="flex items-center gap-2">
                                       <span className={`text-[8px] font-mono font-black uppercase tracking-widest px-1.5 py-0.5 border ${product.active
                                          ? 'border-green-500/20 text-green-500 bg-green-500/5'
                                          : 'border-red-500/20 text-red-500 bg-red-500/5'
                                          }`}>
                                          {product.active ? 'Active' : 'Inactive'}
                                       </span>
                                       <span className="text-[8px] font-mono font-bold uppercase tracking-widest px-1.5 py-0.5 border border-artisan-light/10 text-artisan-light/45">
                                          {product.category}
                                       </span>
                                    </div>
                                 </div>

                                 {/* Middle: Product info */}
                                 <div className="flex items-center gap-4 min-w-0">
                                    <ProductImage src={product.image} alt={product.name} className="w-14 h-14" />
                                    <div className="flex flex-col min-w-0 flex-1">
                                       <span className="text-md font-display font-black text-artisan-light uppercase tracking-tight group-hover:text-artisan-grey transition-colors truncate">
                                          {product.name}
                                       </span>
                                       <span className="text-[10px] font-mono text-artisan-light/75 mt-0.5">
                                          ₹{product.price?.toLocaleString()} • {product.quantity} Units in Stock
                                       </span>
                                       {isLowStock && (
                                          <span className="text-[8px] font-mono font-black uppercase text-red-500 tracking-wider flex items-center gap-1 mt-1">
                                             <AlertTriangle className="w-3 h-3 shrink-0" />
                                             Low Stock Alert
                                          </span>
                                       )}
                                    </div>
                                 </div>

                                 {/* Divider */}
                                 <div className="h-px bg-artisan-light/5 w-full" />

                                 {/* Actions */}
                                 <div className="flex justify-end mt-auto">
                                    <Link
                                       to={`/admin/products/${product._id}`}
                                       className="w-full h-10 px-4 bg-artisan-light/5 border border-artisan-light/10 text-artisan-light hover:bg-artisan-light hover:text-artisan-dark hover:border-artisan-light transition-all flex items-center justify-center gap-2 font-mono text-[9px] font-bold uppercase tracking-widest"
                                    >
                                       <Settings className="w-3.5 h-3.5" />
                                       <span>Manage Product</span>
                                    </Link>
                                 </div>

                              </div>
                           );
                        })
                     )}
                  </div>
               </div>
            ) : null}

            {/* FALLBACK DIRECTORY - MOBILE VIEW FOR TABLE viewMode (ALWAYS CARDS ON MOBILE) */}
            {viewMode === 'table' && !loading && (
               <div className="block lg:hidden mb-16">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     {filteredProducts.map((product) => {
                        const isLowStock = product.quantity <= product.lowstockthreshold;
                        return (
                           <div
                              key={product._id}
                              className={`p-5 border border-artisan-light/10 bg-artisan-light/[0.01] hover:border-artisan-grey/35 transition-all duration-300 flex flex-col gap-4 relative group ${!product.active ? 'border-red-500/20 bg-red-500/[0.005]' : ''}`}
                           >
                              {/* Top Row: SKU, Category */}
                              <div className="flex justify-between items-center">
                                 <span className="text-[9px] font-mono text-artisan-grey font-bold tracking-tighter">
                                    {product.sku}
                                 </span>
                                 <div className="flex items-center gap-2">
                                    <span className={`text-[8px] font-mono font-black uppercase tracking-widest px-1.5 py-0.5 border ${product.active
                                       ? 'border-green-500/20 text-green-500 bg-green-500/5'
                                       : 'border-red-500/20 text-red-500 bg-red-500/5'
                                       }`}>
                                       {product.active ? 'Active' : 'Inactive'}
                                    </span>
                                 </div>
                              </div>

                              {/* Middle: Product info */}
                              <div className="flex items-center gap-4 min-w-0">
                                 <ProductImage src={product.image} alt={product.name} className="w-12 h-12" />
                                 <div className="flex flex-col min-w-0 flex-1">
                                    <span className="text-md font-display font-black text-artisan-light uppercase tracking-tight truncate">
                                       {product.name}
                                    </span>
                                    <span className="text-[10px] font-mono text-artisan-light/75">
                                       ₹{product.price?.toLocaleString()} • {product.quantity} Units
                                    </span>
                                    {isLowStock && (
                                       <span className="text-[8px] font-mono font-black uppercase text-red-500 tracking-wider flex items-center gap-1 mt-1">
                                          <AlertTriangle className="w-3 h-3 shrink-0" />
                                          Low Stock
                                       </span>
                                    )}
                                 </div>
                              </div>

                              {/* Divider */}
                              <div className="h-px bg-artisan-light/5 w-full" />

                              {/* Actions */}
                              <div className="flex justify-end">
                                 <Link
                                    to={`/admin/products/${product._id}`}
                                    className="w-full h-10 px-4 bg-artisan-light/5 border border-artisan-light/10 text-artisan-light hover:bg-artisan-light hover:text-artisan-dark hover:border-artisan-light transition-all flex items-center justify-center gap-2 font-mono text-[9px] font-bold uppercase tracking-widest"
                                 >
                                    <Settings className="w-3.5 h-3.5" />
                                    <span>Manage Product</span>
                                 </Link>
                              </div>
                           </div>
                        );
                     })}
                  </div>
               </div>
            )}

         </div>
      </div>
   )
}
