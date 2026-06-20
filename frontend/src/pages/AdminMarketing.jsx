import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Trash2,
  Loader2,
  RefreshCcw,
  Check,
  X,
  Pencil,
  ChevronUp,
  ChevronDown,
  FileText,
  Tag,
  Percent,
  Clock,
  Search,
  Mail,
  Calendar,
  Phone,
  Video,
  ArrowLeft
} from 'lucide-react'
import { useToast } from '../context/ToastContext'
import api from '../services/api'

// ─── Toggle component ──────────────────────────────────────────────────────────
function Toggle({ checked, onChange, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border transition-colors duration-300 focus:outline-none ${checked
          ? 'bg-artisan-grey border-artisan-grey'
          : 'bg-artisan-light/10 border-artisan-light/10'
        } ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 rounded-full bg-artisan-dark transform transition-transform duration-300 ${checked ? 'translate-x-[18px]' : 'translate-x-[2px]'
          }`}
      />
    </button>
  )
}

// ─── Bulk Enquiries Tab ────────────────────────────────────────────────────────
function EnquiriesTab() {
  const { addToast } = useToast()
  const [enquiries, setEnquiries] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)
  const [expandedId, setExpandedId] = useState(null)

  const fetchEnquiries = async () => {
    try {
      setLoading(true)
      const res = await api.get('/bulk-enquiries')
      setEnquiries(res.data.data || [])
    } catch {
      addToast('Failed to load bulk enquiries', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEnquiries()
  }, [])

  const handleStatusChange = async (id, newStatus) => {
    try {
      setActionLoading(id + '_status')
      await api.put(`/bulk-enquiries/${id}/status`, { status: newStatus })
      setEnquiries(prev => prev.map(e => e._id === id ? { ...e, status: newStatus } : e))
      addToast(`Enquiry status updated to ${newStatus}`, 'success')
    } catch (err) {
      addToast('Failed to update status', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this bulk enquiry permanently?')) return
    try {
      setActionLoading(id + '_delete')
      await api.delete(`/bulk-enquiries/${id}`)
      setEnquiries(prev => prev.filter(e => e._id !== id))
      addToast('Enquiry deleted', 'success')
    } catch {
      addToast('Failed to delete enquiry', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  const toggleExpand = (id) => {
    setExpandedId(prev => prev === id ? null : id)
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-lg font-display font-black uppercase text-artisan-light tracking-tight">
            Bulk Procurement Enquiries
          </h2>
          <p className="text-[10px] font-mono text-artisan-light/40 uppercase tracking-widest">
            Logged bulk purchase requests and institutional leads.
          </p>
        </div>
        <button
          onClick={fetchEnquiries}
          className="h-9 px-4 bg-artisan-light/5 border border-artisan-light/10 text-artisan-grey hover:bg-artisan-light/10 flex items-center gap-2 font-mono text-[9px] font-bold uppercase tracking-widest transition-all group rounded-full"
        >
          <RefreshCcw className={`w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-700 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Table / List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-artisan-grey" />
        </div>
      ) : enquiries.length === 0 ? (
        <div className="border border-dashed border-artisan-light/10 p-12 text-center rounded-xl">
          <FileText className="w-10 h-10 text-artisan-light/10 mx-auto mb-3" />
          <p className="text-[10px] font-mono text-artisan-light/20 uppercase tracking-widest">No bulk enquiries logged yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {enquiries.map((enq) => {
            const isExpanded = expandedId === enq._id
            return (
              <div
                key={enq._id}
                className="border border-artisan-light/10 bg-artisan-dark/50 transition-all rounded-xl overflow-hidden"
              >
                {/* Header info row */}
                <div
                  onClick={() => toggleExpand(enq._id)}
                  className="p-5 flex flex-wrap items-center justify-between gap-4 cursor-pointer hover:bg-artisan-light/[0.01]"
                >
                  <div className="space-y-1.5 flex-1 min-w-[200px]">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-display font-black text-artisan-light uppercase tracking-tight">
                        {enq.name}
                      </span>
                      {enq.organization && (
                        <span className="text-[8px] font-mono font-bold text-artisan-grey uppercase tracking-widest border border-artisan-light/15 px-1.5 py-0.5 rounded-full">
                          {enq.organization}
                        </span>
                      )}
                    </div>
                    <div className="text-[9px] font-mono text-artisan-light/40 uppercase tracking-widest space-x-3">
                      <span>{enq.email}</span>
                      <span>•</span>
                      <span>{enq.phone}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {/* Product & Qty info */}
                    <div className="text-right space-y-0.5">
                      <span className="text-[10px] font-mono text-artisan-grey uppercase tracking-wider block max-w-[180px] truncate">
                        {enq.productName || enq.product?.name || 'General Inquiry'}
                      </span>
                      <span className="text-[9px] font-mono text-artisan-light/40 uppercase tracking-widest block">
                        QTY: {enq.quantity}
                      </span>
                    </div>

                    {/* Status Dropdown selector */}
                    <div onClick={e => e.stopPropagation()}>
                      <select
                        value={enq.status}
                        onChange={e => handleStatusChange(enq._id, e.target.value)}
                        disabled={actionLoading === enq._id + '_status'}
                        className={`text-[8px] font-mono font-bold uppercase tracking-widest px-2.5 py-1 bg-artisan-dark border rounded-full outline-none transition-colors cursor-pointer ${
                          enq.status === 'pending' ? 'border-amber-500/30 text-amber-500' :
                          enq.status === 'contacted' ? 'border-cyan-500/30 text-cyan-400' :
                          enq.status === 'resolved' ? 'border-green-500/30 text-green-400' :
                          'border-red-500/30 text-red-500'
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="contacted">Contacted</option>
                        <option value="resolved">Resolved</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>

                    {/* Delete action */}
                    <div onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => handleDelete(enq._id)}
                        disabled={actionLoading === enq._id + '_delete'}
                        className="h-8 w-8 flex items-center justify-center border border-red-900/30 text-red-500/50 hover:bg-red-900 hover:text-artisan-light hover:border-red-900 transition-all disabled:opacity-30 rounded-full"
                      >
                        {actionLoading === enq._id + '_delete'
                          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          : <Trash2 className="w-3.5 h-3.5" />
                        }
                      </button>
                    </div>

                    {/* Chevron toggle indicators */}
                    <div>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-artisan-light/50" /> : <ChevronDown className="w-4 h-4 text-artisan-light/50" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Details Row */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden border-t border-artisan-light/5 bg-artisan-light/[0.01]"
                    >
                      <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-[9px] uppercase tracking-widest text-artisan-light/75 border-b border-artisan-light/5">
                        <div>
                          <span className="text-artisan-light/50 block mb-1">Estimated Budget</span>
                          <span className="text-artisan-light font-bold">{enq.budget || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-artisan-light/50 block mb-1">Required Timeline</span>
                          <span className="text-artisan-light font-bold">{enq.timeline || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-artisan-light/50 block mb-1">Logged Timestamp</span>
                          <span className="text-artisan-light">{new Date(enq.createdAt).toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="p-5 space-y-2 font-mono text-[10px] tracking-wide leading-relaxed">
                        <span className="text-[8px] uppercase tracking-widest text-artisan-light/50 block">Detailed Requirements</span>
                        <p className="text-artisan-light bg-black/30 p-4 border border-artisan-light/5 leading-relaxed whitespace-pre-wrap rounded-xl">
                          {enq.requirements}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Coupons Tab ─────────────────────────────────────────────────────────────
function CouponsTab() {
  const { addToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [coupons, setCoupons] = useState([])
  const [search, setSearch] = useState('')

  // Form state
  const [isAddingCoupon, setIsAddingCoupon] = useState(false)
  const [editingCouponId, setEditingCouponId] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [couponMode, setCouponMode] = useState('promo') // 'promo' or 'manual'
  const [form, setForm] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: '',
    minCartAmount: '',
    maxDiscountAmount: '',
    validUntil: '',
    isActive: true,
    usageLimit: ''
  })
  const [formErrors, setFormErrors] = useState({})

  const fetchCoupons = async () => {
    try {
      setLoading(true)
      const res = await api.get('/admin/coupons')
      setCoupons(res.data.data || [])
    } catch (err) {
      addToast('Failed to load coupons', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCoupons()
  }, [])

  const handleToggleActive = async (coupon) => {
    try {
      const updatedStatus = !coupon.isActive
      const res = await api.put(`/admin/coupons/${coupon._id}`, { isActive: updatedStatus })
      addToast(`Coupon "${coupon.code}" ${updatedStatus ? 'enabled' : 'disabled'}`, 'success')
      setCoupons(prev => prev.map(c => c._id === coupon._id ? res.data.data : c))
    } catch (err) {
      addToast('Failed to update coupon status', 'error')
    }
  }

  const handleDeleteCoupon = async (id, code) => {
    if (!window.confirm(`Are you sure you want to delete coupon "${code}"?`)) return
    try {
      await api.delete(`/admin/coupons/${id}`)
      addToast(`Coupon "${code}" deleted`, 'success')
      setCoupons(prev => prev.filter(c => c._id !== id))
    } catch (err) {
      addToast('Failed to delete coupon', 'error')
    }
  }

  const validateForm = () => {
    const errors = {}
    if (!form.code.trim()) errors.code = 'Code is required'
    if (!form.discountValue || parseFloat(form.discountValue) <= 0) {
      errors.discountValue = 'Value must be greater than 0'
    }

    if (couponMode === 'promo') {
      if (form.discountType === 'percentage' && parseFloat(form.discountValue) > 100) {
        errors.discountValue = 'Percentage cannot exceed 100%'
      }
      if (!form.validUntil) errors.validUntil = 'Expiration date is required'
      else {
        const expiry = new Date(form.validUntil)
        if (expiry <= new Date() && !editingCouponId) {
          errors.validUntil = 'Expiration date must be in the future'
        }
      }
      if (form.usageLimit !== '' && parseInt(form.usageLimit) <= 0) {
        errors.usageLimit = 'Limit must be at least 1'
      }
      if (form.minCartAmount !== '' && parseFloat(form.minCartAmount) < 0) {
        errors.minCartAmount = 'Min cart amount cannot be negative'
      }
      if (form.maxDiscountAmount !== '' && parseFloat(form.maxDiscountAmount) < 0) {
        errors.maxDiscountAmount = 'Max discount amount cannot be negative'
      }
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      setIsProcessing(true)
      const payload = couponMode === 'manual' ? {
        code: form.code.trim().toUpperCase(),
        discountType: 'flat',
        discountValue: parseFloat(form.discountValue),
        minCartAmount: 0,
        maxDiscountAmount: null,
        validUntil: new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000).toISOString(),
        isActive: form.isActive,
        usageLimit: 1
      } : {
        code: form.code.trim().toUpperCase(),
        discountType: form.discountType,
        discountValue: parseFloat(form.discountValue),
        minCartAmount: form.minCartAmount === '' ? 0 : parseFloat(form.minCartAmount),
        maxDiscountAmount: form.maxDiscountAmount === '' ? null : parseFloat(form.maxDiscountAmount),
        validUntil: new Date(form.validUntil).toISOString(),
        isActive: form.isActive,
        usageLimit: form.usageLimit === '' ? null : parseInt(form.usageLimit)
      }

      let res
      if (editingCouponId) {
        res = await api.put(`/admin/coupons/${editingCouponId}`, payload)
        addToast(`Coupon "${payload.code}" updated successfully`, 'success')
        setCoupons(prev => prev.map(c => c._id === editingCouponId ? res.data.data : c))
      } else {
        res = await api.post('/admin/coupons', payload)
        addToast(`Coupon "${payload.code}" created successfully`, 'success')
        setCoupons(prev => [res.data.data, ...prev])
      }

      setIsAddingCoupon(false)
      setEditingCouponId(null)
      resetForm()
    } catch (err) {
      console.error(err)
      addToast(err.response?.data?.message || 'Failed to save coupon', 'error')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleEditStart = (coupon) => {
    setEditingCouponId(coupon._id)
    const isManual = coupon.discountType === 'flat' && coupon.minCartAmount === 0 && coupon.usageLimit === 1;
    setCouponMode(isManual ? 'manual' : 'promo')
    setForm({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue.toString(),
      minCartAmount: coupon.minCartAmount !== undefined ? coupon.minCartAmount.toString() : '',
      maxDiscountAmount: coupon.maxDiscountAmount !== null && coupon.maxDiscountAmount !== undefined ? coupon.maxDiscountAmount.toString() : '',
      validUntil: new Date(coupon.validUntil).toISOString().split('T')[0],
      isActive: coupon.isActive,
      usageLimit: coupon.usageLimit !== null && coupon.usageLimit !== undefined ? coupon.usageLimit.toString() : ''
    })
    setFormErrors({})
    setIsAddingCoupon(true)
  }

  const resetForm = () => {
    setForm({
      code: '',
      discountType: 'percentage',
      discountValue: '',
      minCartAmount: '',
      maxDiscountAmount: '',
      validUntil: '',
      isActive: true,
      usageLimit: ''
    })
    setFormErrors({})
    setCouponMode('promo')
  }

  const filteredCoupons = coupons.filter(coupon => {
    return coupon.code.toLowerCase().includes(search.toLowerCase())
  })

  return (
    <div className="space-y-6">
      {/* HEADER/CONTROLS */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-lg font-display font-black uppercase text-artisan-light tracking-tight">
            PROMO LEDGER
          </h2>
          <p className="text-[10px] font-mono text-artisan-light/40 uppercase tracking-widest">
            Manage promo codes and discount coupons for user checkouts.
          </p>
        </div>

        {/* SEARCH HUD */}
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="relative overflow-hidden bg-artisan-light/[0.01] border border-artisan-light/10 focus-within:border-artisan-grey/30 focus-within:bg-artisan-light/[0.03] transition-all duration-300 w-full sm:w-64 rounded-xl">
            <div className="flex items-center">
              <div className="pl-4 shrink-0 text-artisan-light/50">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent py-2.5 px-3 text-[11px] font-mono text-artisan-light uppercase tracking-wider outline-none placeholder:text-artisan-light/20 w-full animate-none"
                placeholder="Search codes..."
              />
            </div>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={fetchCoupons}
              className="h-9 w-9 bg-artisan-light/5 border border-artisan-light/10 flex items-center justify-center hover:bg-artisan-light/10 transition-all group shrink-0 rounded-full"
              title="Reload list"
            >
              <RefreshCcw className={`w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-700 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => {
                resetForm()
                setEditingCouponId(null)
                setIsAddingCoupon(true)
              }}
              className="h-9 px-4 bg-artisan-light text-artisan-dark flex items-center justify-center gap-2 hover:bg-artisan-grey transition-all shrink-0 font-mono text-[9px] font-bold uppercase tracking-widest flex-1 sm:flex-initial rounded-full"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Coupon</span>
            </button>
          </div>
        </div>
      </div>

      {/* FORM DRAWER/MODAL */}
      <AnimatePresence>
        {isAddingCoupon && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="border border-artisan-light/15 bg-artisan-light/[0.005] p-5 space-y-6 relative overflow-hidden rounded-xl"
          >
            <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-artisan-light/20" />
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-artisan-light/20" />
            
            <div className="flex items-center justify-between border-b border-artisan-light/5 pb-4">
              <h3 className="text-xs font-mono font-bold uppercase tracking-[0.3em] text-artisan-grey">
                {editingCouponId
                  ? `Edit Coupon Code // #${editingCouponId.slice(-6).toUpperCase()}`
                  : couponMode === 'manual'
                  ? 'Create Manual Discount'
                  : 'Create New Promotional Coupon'}
              </h3>
              <button 
                onClick={() => {
                  setIsAddingCoupon(false)
                  setEditingCouponId(null)
                  resetForm()
                }} 
                className="text-artisan-light/50 hover:text-artisan-light transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Sub-tab Mode Selector */}
            <div className="flex border-b border-artisan-light/5 gap-6 pb-2">
              {[
                { id: 'promo', label: 'Promotional Coupon' },
                { id: 'manual', label: 'Manual Discount' }
              ].map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setCouponMode(mode.id)}
                  className={`pb-2 border-b-2 font-mono text-[9px] font-bold uppercase tracking-widest transition-all ${
                    couponMode === mode.id
                      ? 'border-artisan-grey text-artisan-light'
                      : 'border-transparent text-artisan-light/40 hover:text-artisan-light/60'
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {couponMode === 'manual' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Coupon Code */}
                  <div className="space-y-2">
                    <label className="text-[8px] font-mono font-bold text-artisan-light/40 uppercase tracking-widest">Coupon Code *</label>
                    <input
                      type="text"
                      placeholder="OFF500"
                      value={form.code}
                      onChange={(e) => setForm({ ...form, code: e.target.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase() })}
                      className={`w-full bg-transparent border-b-2 outline-none text-xs font-mono pb-2 uppercase transition-colors ${formErrors.code ? 'border-red-500/50 focus:border-red-500' : 'border-artisan-light/10 focus:border-artisan-light'}`}
                      disabled={!!editingCouponId}
                    />
                    {formErrors.code && <p className="text-[10px] font-mono text-red-500">{formErrors.code}</p>}
                  </div>

                  {/* Discount Value */}
                  <div className="space-y-2">
                    <label className="text-[8px] font-mono font-bold text-artisan-light/40 uppercase tracking-widest">Discount Value (₹) *</label>
                    <input
                      type="number"
                      placeholder="500"
                      value={form.discountValue}
                      onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                      className={`w-full bg-transparent border-b-2 outline-none text-xs font-mono pb-2 transition-colors ${formErrors.discountValue ? 'border-red-500/50 focus:border-red-500' : 'border-artisan-light/10 focus:border-artisan-light'}`}
                    />
                    {formErrors.discountValue && <p className="text-[10px] font-mono text-red-500">{formErrors.discountValue}</p>}
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Coupon Code */}
                    <div className="space-y-2">
                      <label className="text-[8px] font-mono font-bold text-artisan-light/40 uppercase tracking-widest">Coupon Code *</label>
                      <input
                        type="text"
                        placeholder="WELCOME10"
                        value={form.code}
                        onChange={(e) => setForm({ ...form, code: e.target.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase() })}
                        className={`w-full bg-transparent border-b-2 outline-none text-xs font-mono pb-2 uppercase transition-colors ${formErrors.code ? 'border-red-500/50 focus:border-red-500' : 'border-artisan-light/10 focus:border-artisan-light'}`}
                        disabled={!!editingCouponId}
                      />
                      {formErrors.code && <p className="text-[10px] font-mono text-red-500">{formErrors.code}</p>}
                    </div>

                    {/* Discount Type */}
                    <div className="space-y-2">
                      <label className="text-[8px] font-mono font-bold text-artisan-light/40 uppercase tracking-widest">Discount Type *</label>
                      <div className="flex gap-2">
                        {['percentage', 'flat'].map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setForm({ ...form, discountType: type })}
                            className={`flex-1 py-1.5 text-[9px] font-mono font-bold uppercase tracking-widest border transition-all rounded-full ${form.discountType === type
                              ? 'bg-artisan-light border-artisan-light text-artisan-dark'
                              : 'border-artisan-light/10 text-artisan-light hover:border-artisan-light/35'
                            }`}
                          >
                            {type === 'percentage' ? 'Percentage (%)' : 'Flat Cash (₹)'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Discount Value */}
                    <div className="space-y-2">
                      <label className="text-[8px] font-mono font-bold text-artisan-light/40 uppercase tracking-widest">
                        {form.discountType === 'percentage' ? 'Discount Percentage (%) *' : 'Discount Value (₹) *'}
                      </label>
                      <input
                        type="number"
                        placeholder={form.discountType === 'percentage' ? '10' : '500'}
                        value={form.discountValue}
                        onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                        className={`w-full bg-transparent border-b-2 outline-none text-xs font-mono pb-2 transition-colors ${formErrors.discountValue ? 'border-red-500/50 focus:border-red-500' : 'border-artisan-light/10 focus:border-artisan-light'}`}
                      />
                      {formErrors.discountValue && <p className="text-[10px] font-mono text-red-500">{formErrors.discountValue}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {/* Minimum Subtotal */}
                    <div className="space-y-2">
                      <label className="text-[8px] font-mono font-bold text-artisan-light/40 uppercase tracking-widest">Min Subtotal (₹)</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={form.minCartAmount}
                        onChange={(e) => setForm({ ...form, minCartAmount: e.target.value })}
                        className={`w-full bg-transparent border-b-2 outline-none text-xs font-mono pb-2 transition-colors ${formErrors.minCartAmount ? 'border-red-500/50 focus:border-red-500' : 'border-artisan-light/10 focus:border-artisan-light'}`}
                      />
                      {formErrors.minCartAmount && <p className="text-[10px] font-mono text-red-500">{formErrors.minCartAmount}</p>}
                    </div>

                    {/* Max Discount Capping */}
                    <div className="space-y-2">
                      <label className="text-[8px] font-mono font-bold text-artisan-light/40 uppercase tracking-widest">Max Discount Cap (₹)</label>
                      <input
                        type="number"
                        placeholder="No Limit"
                        value={form.maxDiscountAmount}
                        onChange={(e) => setForm({ ...form, maxDiscountAmount: e.target.value })}
                        className={`w-full bg-transparent border-b-2 outline-none text-xs font-mono pb-2 transition-colors ${formErrors.maxDiscountAmount ? 'border-red-500/50 focus:border-red-500' : 'border-artisan-light/10 focus:border-artisan-light'}`}
                        disabled={form.discountType === 'flat'}
                      />
                      {formErrors.maxDiscountAmount && <p className="text-[10px] font-mono text-red-500">{formErrors.maxDiscountAmount}</p>}
                    </div>

                    {/* Expiry Date */}
                    <div className="space-y-2">
                      <label className="text-[8px] font-mono font-bold text-artisan-light/40 uppercase tracking-widest">Valid Until *</label>
                      <input
                        type="date"
                        value={form.validUntil}
                        onChange={(e) => setForm({ ...form, validUntil: e.target.value })}
                        className={`w-full bg-transparent border-b-2 outline-none text-xs font-mono pb-2 transition-colors ${formErrors.validUntil ? 'border-red-500/50 focus:border-red-500' : 'border-artisan-light/10 focus:border-artisan-light'}`}
                      />
                      {formErrors.validUntil && <p className="text-[10px] font-mono text-red-500">{formErrors.validUntil}</p>}
                    </div>

                    {/* Usage Limit */}
                    <div className="space-y-2">
                      <label className="text-[8px] font-mono font-bold text-artisan-light/40 uppercase tracking-widest">Usage Limit</label>
                      <input
                        type="number"
                        placeholder="Unlimited"
                        value={form.usageLimit}
                        onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
                        className={`w-full bg-transparent border-b-2 outline-none text-xs font-mono pb-2 transition-colors ${formErrors.usageLimit ? 'border-red-500/50 focus:border-red-500' : 'border-artisan-light/10 focus:border-artisan-light'}`}
                      />
                      {formErrors.usageLimit && <p className="text-[10px] font-mono text-red-500">{formErrors.usageLimit}</p>}
                    </div>
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-4 border-t border-artisan-light/5">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="h-10 px-6 bg-artisan-light text-artisan-dark text-[9px] font-mono font-bold uppercase tracking-widest hover:bg-artisan-grey transition-all flex items-center gap-2 rounded-full"
                >
                  {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  {editingCouponId ? 'Update Coupon' : 'Create Coupon'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingCoupon(false)
                    setEditingCouponId(null)
                    resetForm()
                  }}
                  className="h-10 px-4 border border-artisan-light/10 text-[9px] font-mono uppercase tracking-widest text-artisan-light/50 hover:text-artisan-light transition-all rounded-full"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DIRECTORY TABLE */}
      <div className="hidden lg:block border border-artisan-light/10 bg-artisan-dark/50 shadow-2xl overflow-hidden mb-16 relative rounded-xl">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-artisan-light/10 bg-artisan-light/[0.02] text-left">
                <th className="px-5 py-4 text-[9px] font-mono font-bold text-artisan-light/40 uppercase tracking-widest">Promo Code</th>
                <th className="px-5 py-4 text-[9px] font-mono font-bold text-artisan-light/40 uppercase tracking-widest">Discount</th>
                <th className="px-5 py-4 text-[9px] font-mono font-bold text-artisan-light/40 uppercase tracking-widest">Criteria</th>
                <th className="px-5 py-4 text-[9px] font-mono font-bold text-artisan-light/40 uppercase tracking-widest">Expiry</th>
                <th className="px-5 py-4 text-[9px] font-mono font-bold text-artisan-light/40 uppercase tracking-widest">Usage</th>
                <th className="px-5 py-4 text-[9px] font-mono font-bold text-artisan-light/40 uppercase tracking-widest text-center">Active</th>
                <th className="px-5 py-4 text-right text-[9px] font-mono font-bold text-artisan-light/40 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-artisan-light/5">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="7" className="px-5 py-8 bg-artisan-light/[0.005]" />
                  </tr>
                ))
              ) : filteredCoupons.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-5 py-16 text-center">
                    <Tag className="w-10 h-10 text-artisan-light/5 mx-auto mb-3" />
                    <p className="text-[10px] font-mono text-artisan-light/20 uppercase tracking-widest">No coupons found</p>
                  </td>
                </tr>
              ) : (
                filteredCoupons.map((coupon) => {
                  const isExpired = new Date() > new Date(coupon.validUntil)
                  return (
                    <tr key={coupon._id} className={`group hover:bg-artisan-light/[0.02] transition-all duration-300 ${isExpired ? 'opacity-40' : ''}`}>
                      <td className="px-5 py-4 font-mono font-bold text-xs tracking-widest text-artisan-light uppercase">
                        {coupon.code}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          {coupon.discountType === 'percentage' ? (
                            <>
                              <Percent className="w-3.5 h-3.5 text-artisan-grey" />
                              <span className="font-display font-black text-xs text-artisan-light">{coupon.discountValue}% Off</span>
                            </>
                          ) : (
                            <span className="font-display font-black text-xs text-artisan-light">₹{coupon.discountValue.toLocaleString()} Flat</span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 font-mono text-[9px] space-y-0.5 text-artisan-light/60">
                        <p>Min order: ₹{coupon.minCartAmount.toLocaleString()}</p>
                        {coupon.maxDiscountAmount && <p>Max cap: ₹{coupon.maxDiscountAmount.toLocaleString()}</p>}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-1 text-[9px] font-mono uppercase">
                            <Clock className="w-3 h-3 text-artisan-light/35" />
                            <span className={isExpired ? 'text-red-500 font-bold' : 'text-artisan-light/75'}>
                              {new Date(coupon.validUntil).toLocaleDateString()}
                            </span>
                          </div>
                          {isExpired && <span className="text-[8px] font-mono uppercase text-red-500 font-bold tracking-widest">Expired</span>}
                        </div>
                      </td>
                      <td className="px-5 py-4 font-mono text-[10px] text-artisan-light/70">
                        {coupon.usageCount} / {coupon.usageLimit !== null ? coupon.usageLimit : '∞'}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <Toggle
                          checked={coupon.isActive}
                          onChange={() => handleToggleActive(coupon)}
                        />
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEditStart(coupon)}
                            className="h-8 w-8 flex items-center justify-center border border-artisan-light/10 text-artisan-light/40 hover:text-artisan-light hover:border-artisan-light/30 transition-all rounded-full"
                            title="Edit coupon"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteCoupon(coupon._id, coupon.code)}
                            className="h-8 w-8 flex items-center justify-center border border-red-900/45 text-red-500/60 hover:bg-red-900 hover:text-artisan-light hover:border-red-900 transition-all rounded-full"
                            title="Delete coupon"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MOBILE VIEW (CARDS) */}
      <div className="block lg:hidden space-y-4 mb-16">
        {loading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="p-5 border border-artisan-light/10 bg-artisan-light/[0.01] animate-pulse h-36 w-full rounded-xl" />
          ))
        ) : filteredCoupons.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-artisan-light/10 bg-artisan-light/[0.01] rounded-xl">
            <Tag className="w-10 h-10 text-artisan-light/5 mx-auto mb-3" />
            <p className="text-[10px] font-mono text-artisan-light/20 uppercase tracking-widest">No coupons found</p>
          </div>
        ) : (
          filteredCoupons.map((coupon) => {
            const isExpired = new Date() > new Date(coupon.validUntil)
            return (
              <div
                key={coupon._id}
                className={`p-5 border border-artisan-light/10 bg-artisan-dark/50 flex flex-col gap-4 relative group rounded-xl ${isExpired ? 'opacity-50' : ''}`}
              >
                <div className="flex justify-between items-center border-b border-artisan-light/5 pb-3">
                  <span className="text-xs font-mono font-bold tracking-widest text-artisan-light uppercase">
                    {coupon.code}
                  </span>
                  <div className="flex items-center gap-2">
                    <Toggle
                      checked={coupon.isActive}
                      onChange={() => handleToggleActive(coupon)}
                    />
                    {isExpired && (
                      <span className="text-[8px] font-mono uppercase tracking-widest px-1.5 py-0.5 border border-red-500/20 text-red-500 bg-red-500/5 rounded-full">Expired</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 font-mono text-[9px] text-artisan-light/70">
                  <div>
                    <p className="text-artisan-light/35 uppercase text-[8px] tracking-wider mb-0.5">Value</p>
                    <p className="font-display font-black text-artisan-light text-xs">
                      {coupon.discountType === 'percentage' ? `${coupon.discountValue}% Off` : `₹${coupon.discountValue.toLocaleString()} Flat`}
                    </p>
                  </div>
                  <div>
                    <p className="text-artisan-light/35 uppercase text-[8px] tracking-wider mb-0.5">Usage</p>
                    <p className="text-artisan-light font-bold">
                      {coupon.usageCount} / {coupon.usageLimit !== null ? coupon.usageLimit : '∞'}
                    </p>
                  </div>
                  <div>
                    <p className="text-artisan-light/35 uppercase text-[8px] tracking-wider mb-0.5">Criteria</p>
                    <p className="leading-tight">Min Order: ₹{coupon.minCartAmount.toLocaleString()}</p>
                    {coupon.maxDiscountAmount && <p className="leading-tight">Cap: ₹{coupon.maxDiscountAmount.toLocaleString()}</p>}
                  </div>
                  <div>
                    <p className="text-artisan-light/35 uppercase text-[8px] tracking-wider mb-0.5">Valid Until</p>
                    <p className="font-bold text-artisan-light">{new Date(coupon.validUntil).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="h-px bg-artisan-light/5 w-full" />

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditStart(coupon)}
                    className="flex-1 h-9 bg-artisan-light/5 border border-artisan-light/10 text-artisan-light hover:bg-artisan-light hover:text-artisan-dark transition-all flex items-center justify-center gap-2 font-mono text-[9px] font-bold uppercase tracking-widest rounded-full"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteCoupon(coupon._id, coupon.code)}
                    className="px-4 h-9 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-artisan-dark hover:border-red-500 transition-all flex items-center justify-center gap-2 font-mono text-[9px] font-bold uppercase tracking-widest rounded-full"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

// ─── Trial Demo Bookings Tab ──────────────────────────────────────────────────
function BookingsTab() {
  const { addToast } = useToast()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)
  const [openDropdownId, setOpenDropdownId] = useState(null)

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const res = await api.get('/bookings')
      setBookings(res.data.data || [])
    } catch {
      addToast('Failed to load trial bookings', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [])

  useEffect(() => {
    const handleOutsideClick = () => {
      setOpenDropdownId(null)
    }
    document.addEventListener('click', handleOutsideClick)
    return () => document.removeEventListener('click', handleOutsideClick)
  }, [])

  const handleStatusChange = async (id, newStatus) => {
    try {
      setActionLoading(id + '_status')
      await api.put(`/bookings/${id}/status`, { status: newStatus })
      setBookings(prev => prev.map(b => b._id === id ? { ...b, status: newStatus } : b))
      addToast(`Booking status updated to ${newStatus}`, 'success')
    } catch (err) {
      addToast('Failed to update status', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this trial booking permanently?')) return
    try {
      setActionLoading(id + '_delete')
      await api.delete(`/bookings/${id}`)
      setBookings(prev => prev.filter(b => b._id !== id))
      addToast('Booking deleted', 'success')
    } catch {
      addToast('Failed to delete booking', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-lg font-display font-black uppercase text-artisan-light tracking-tight">
            Trial Demo Appointments
          </h2>
          <p className="text-[10px] font-mono text-artisan-light/55 uppercase tracking-widest">
            Scheduled in-store product trials and client demos.
          </p>
        </div>
        <button
          onClick={fetchBookings}
          className="h-9 px-4 bg-artisan-light/5 border border-artisan-light/10 text-artisan-grey hover:bg-artisan-light/10 flex items-center gap-2 font-mono text-[9px] font-bold uppercase tracking-widest transition-all group rounded-full cursor-pointer"
        >
          <RefreshCcw className={`w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-700 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Table / List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-artisan-grey" />
        </div>
      ) : bookings.length === 0 ? (
        <div className="border border-dashed border-artisan-light/10 p-12 text-center rounded-xl">
          <FileText className="w-10 h-10 text-artisan-light/10 mx-auto mb-3" />
          <p className="text-[10px] font-mono text-artisan-light/50 uppercase tracking-widest">No trial bookings scheduled yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bookings.map((booking) => {
            const bookingDate = new Date(booking.date).toLocaleDateString('en-IN', {
              weekday: 'short',
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })
            // Generate user initials
            const initials = booking.name ? booking.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'C'

            const statusThemes = {
              pending: {
                border: 'border-l-amber-500',
                badge: 'bg-amber-500/10 text-amber-700 border-amber-500/25',
                dot: 'bg-amber-500',
                glow: 'shadow-amber-500/[0.03] hover:shadow-amber-500/[0.08]'
              },
              confirmed: {
                border: 'border-l-cyan-500',
                badge: 'bg-cyan-500/10 text-cyan-700 border-cyan-500/25',
                dot: 'bg-cyan-500',
                glow: 'shadow-cyan-500/[0.03] hover:shadow-cyan-500/[0.08]'
              },
              completed: {
                border: 'border-l-emerald-500',
                badge: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/25',
                dot: 'bg-emerald-500',
                glow: 'shadow-emerald-500/[0.03] hover:shadow-emerald-500/[0.08]'
              },
              cancelled: {
                border: 'border-l-red-500',
                badge: 'bg-red-500/10 text-red-700 border-red-500/25',
                dot: 'bg-red-500',
                glow: 'shadow-red-500/[0.03] hover:shadow-red-500/[0.08]'
              }
            }
            const theme = statusThemes[booking.status] || statusThemes.pending

            return (
              <div
                key={booking._id}
                className={`bg-white border-y border-r border-l-4 border-artisan-light/10 ${theme.border} hover:border-artisan-light/20 transition-all duration-300 rounded-2xl p-6 flex flex-col justify-between gap-5 relative shadow-sm hover:shadow-lg ${theme.glow}`}
              >
                {/* Header: Avatar, Name, Status Badge */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-12 h-12 bg-artisan-light/5 border-2 border-artisan-light/10 text-artisan-light flex items-center justify-center rounded-xl font-display font-black text-sm shrink-0 select-none relative">
                      {initials}
                      <span className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${theme.dot}`} />
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <h3 className="font-display font-black text-sm uppercase text-artisan-light tracking-wide leading-tight truncate">
                        {booking.name}
                      </h3>
                      <span className="text-[8px] font-mono font-bold text-artisan-light/60 uppercase tracking-widest block">
                        Booking Ref: #{booking._id.slice(-6).toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span className={`text-[8px] font-mono font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border ${theme.badge}`}>
                      {booking.status}
                    </span>
                    <span className={`text-[8.5px] font-mono font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                      booking.demoType === 'virtual'
                        ? 'bg-[#eb5e28]/10 text-[#eb5e28] border-[#eb5e28]/25'
                        : 'bg-artisan-light/10 text-artisan-light border-artisan-light/20'
                    }`}>
                      {booking.demoType === 'virtual' ? 'Virtual Call' : 'In-Store'}
                    </span>
                  </div>
                </div>

                {/* Panel 1: Product & Date/Time Scheduling */}
                <div className="bg-artisan-dark/40 border border-artisan-light/10 p-4 rounded-xl space-y-3">
                  <div className="flex items-start gap-2.5">
                    <FileText className="w-4 h-4 text-artisan-grey shrink-0 mt-0.5" />
                    <div className="space-y-0.5 min-w-0">
                      <span className="text-[8px] font-mono text-artisan-light/60 uppercase tracking-widest block">Selected Equipment</span>
                      <span className="text-[11px] font-mono text-artisan-light font-bold uppercase tracking-wide block truncate">
                        {booking.productName || 'GENERAL STORE CONSULTATION'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-artisan-light/10 pt-3 text-[10px] font-mono">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-artisan-grey shrink-0" />
                      <div className="space-y-0.5">
                        <span className="text-[7px] text-artisan-light/50 uppercase block">Date</span>
                        <span className="text-artisan-light font-bold uppercase block">{bookingDate}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-artisan-grey shrink-0" />
                      <div className="space-y-0.5">
                        <span className="text-[7px] text-artisan-light/50 uppercase block">Time Slot</span>
                        <span className="text-artisan-light font-bold uppercase block">{booking.timeSlot}</span>
                      </div>
                    </div>
                  </div>

                  {booking.demoType === 'virtual' && (
                    <div className="border-t border-artisan-light/10 pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="min-w-0">
                        <span className="text-[7px] text-artisan-light/50 uppercase block">Video Consultation Link</span>
                        <span className="text-[10px] font-mono text-[#eb5e28] font-bold truncate block select-all" title={booking.videoLink}>
                          {booking.videoLink || 'No link generated'}
                        </span>
                      </div>
                      {booking.videoLink && (
                        <a
                          href={booking.videoLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#eb5e28] text-white hover:bg-[#eb5e28]/95 text-[9px] font-mono font-bold uppercase tracking-wider rounded-lg shrink-0 justify-center transition-colors cursor-pointer"
                        >
                          <Video className="w-3.5 h-3.5" />
                          Launch Meet
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {/* Panel 2: Contact Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[10px] font-mono text-artisan-light">
                  <div className="flex items-center gap-2.5 bg-artisan-dark/20 border border-artisan-light/5 px-3 py-2.5 rounded-xl min-w-0">
                    <Mail className="w-4 h-4 text-artisan-light/50 shrink-0" />
                    <div className="space-y-0.5 min-w-0">
                      <span className="text-[7px] text-artisan-light/50 uppercase block">Email Address</span>
                      <span className="truncate select-all text-artisan-light font-bold block" title={booking.email}>{booking.email}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 bg-artisan-dark/20 border border-artisan-light/5 px-3 py-2.5 rounded-xl min-w-0">
                    <Phone className="w-4 h-4 text-artisan-light/50 shrink-0" />
                    <div className="space-y-0.5 min-w-0">
                      <span className="text-[7px] text-artisan-light/50 uppercase block">Phone Contact</span>
                      <span className="select-all text-artisan-light font-bold block">{booking.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Panel 3: Client Requirements Notes */}
                <div className="space-y-1">
                  <span className="text-[8px] font-mono uppercase tracking-widest text-artisan-light/60 block">Requirements & Notes</span>
                  <p className="text-[10px] font-mono text-artisan-light/80 bg-artisan-dark/30 p-3.5 border border-artisan-light/10 leading-relaxed rounded-xl max-h-[80px] overflow-y-auto scrollbar-thin italic">
                    {booking.notes || 'NO SPECIFIC NOTES OR CLINICAL REQUIREMENTS REGISTERED.'}
                  </p>
                </div>

                {/* Divider Line */}
                <div className="border-t border-artisan-light/10 pt-1" />

                {/* Action Controls Bar */}
                <div className="flex items-center justify-between gap-4 mt-2">
                  {/* Custom Status Dropdown */}
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setOpenDropdownId(openDropdownId === booking._id ? null : booking._id)
                      }}
                      disabled={actionLoading === booking._id + '_status'}
                      className={`flex items-center gap-2 text-[9px] font-mono font-bold uppercase tracking-widest px-4 py-2 bg-artisan-dark border rounded-full transition-all duration-200 cursor-pointer ${
                        booking.status === 'pending' ? 'border-amber-500/30 text-amber-600 hover:bg-amber-500/5' :
                        booking.status === 'confirmed' ? 'border-cyan-500/30 text-cyan-600 hover:bg-cyan-500/5' :
                        booking.status === 'completed' ? 'border-green-500/30 text-green-600 hover:bg-green-500/5' :
                        'border-red-500/30 text-red-600 hover:bg-red-500/5'
                      }`}
                    >
                      <span>Status: {booking.status}</span>
                      <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${openDropdownId === booking._id ? 'rotate-180' : ''}`} />
                    </button>

                    {openDropdownId === booking._id && (
                      <div className="absolute left-0 bottom-full mb-1.5 w-44 bg-white border border-artisan-light/15 rounded-xl shadow-2xl z-50 overflow-hidden py-1.5 animate-in fade-in slide-in-from-bottom-2 duration-200">
                        {['pending', 'confirmed', 'completed', 'cancelled'].map((statusOption) => {
                          const optTheme = statusThemes[statusOption]
                          return (
                            <button
                              key={statusOption}
                              onClick={(e) => {
                                e.stopPropagation()
                                handleStatusChange(booking._id, statusOption)
                                setOpenDropdownId(null)
                              }}
                              className={`w-full text-left px-4 py-2 text-[9px] font-mono font-bold uppercase tracking-widest transition-all flex items-center justify-between ${
                                booking.status === statusOption
                                  ? 'bg-artisan-light/5 text-artisan-light font-black'
                                  : 'text-artisan-light/60 hover:bg-artisan-light/5 hover:text-artisan-light'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className={`w-1.5 h-1.5 rounded-full ${optTheme.dot}`} />
                                <span>{statusOption}</span>
                              </div>
                              {booking.status === statusOption && <Check className="w-3 h-3 text-artisan-grey shrink-0" />}
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  {/* Actions & Created Timestamp */}
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] font-mono text-artisan-light/50">
                      Created: {new Date(booking.createdAt).toLocaleDateString('en-IN')}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(booking._id)
                      }}
                      disabled={actionLoading === booking._id + '_delete'}
                      className="h-8 w-8 flex items-center justify-center border border-red-900/20 text-red-500/60 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all disabled:opacity-30 rounded-full cursor-pointer"
                      title="Delete trial appointment permanently"
                    >
                      {actionLoading === booking._id + '_delete'
                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        : <Trash2 className="w-3.5 h-3.5" />
                      }
                    </button>
                  </div>
                </div>

              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Main AdminMarketing component ──────────────────────────────────────────
export default function AdminMarketing() {
  const [activeTab, setActiveTab] = useState('coupons')

  const TABS = [
    { id: 'coupons', label: 'Promo Coupons', icon: Tag },
    { id: 'enquiries', label: 'Bulk Enquiries', icon: Mail },
    { id: 'bookings', label: 'Demo Bookings', icon: Calendar },
  ]

  return (
    <div className="min-h-screen bg-artisan-dark bg-noise pt-32 pb-24 text-artisan-light">
      <div className="container-custom max-w-5xl">

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

        {/* Page Header */}
        <div className="mb-10 space-y-2">
          <h1 className="text-5xl sm:text-6xl font-display font-black uppercase tracking-tighter leading-none text-artisan-light">
            PROMOS & <span className="text-outline">ENQUIRIES.</span>
          </h1>
          <p className="text-[11px] font-mono text-artisan-light/55 uppercase tracking-widest max-w-lg">
            Manage discount codes, bulk procurement leads, and trial bookings.
          </p>
        </div>

        {/* Responsive Tabs Selector */}
        <div className="flex border-b border-artisan-light/10 mb-8 gap-1 justify-between md:justify-start">
          {TABS.map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative group pb-4 px-3 sm:px-4 border-b-2 font-mono text-[9px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${activeTab === tab.id
                    ? 'border-artisan-grey text-artisan-light'
                    : 'border-transparent text-artisan-light/50 hover:text-artisan-light/70'
                  }`}
              >
                <Icon className="w-4 h-4 md:w-3.5 md:h-3.5 shrink-0" />
                <span className="hidden lg:inline whitespace-nowrap">{tab.label}</span>

                {/* Custom animated floating tooltip */}
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 bg-artisan-dark border border-artisan-light/15 text-artisan-grey text-[8px] font-mono font-bold uppercase tracking-widest whitespace-nowrap opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 pointer-events-none transition-all duration-200 z-[999] shadow-2xl lg:hidden">
                  {tab.label}
                  {/* Tooltip caret */}
                  <span className="absolute top-full left-1/2 -translate-x-1/2 w-1.5 h-1.5 border-r border-b border-artisan-light/15 bg-artisan-dark rotate-45 -mt-[4px]" />
                </span>
              </button>
            )
          })}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'coupons' && <CouponsTab />}
            {activeTab === 'enquiries' && <EnquiriesTab />}
            {activeTab === 'bookings' && <BookingsTab />}
          </motion.div>
        </AnimatePresence>

      </div>
    </div>
  )
}
