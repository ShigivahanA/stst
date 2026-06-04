import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart3,
  MessageSquareQuote,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
  AlertTriangle,
  RefreshCcw,
  Check,
  X,
  Pencil,
  ChevronUp,
  ChevronDown,
  FileText,
  HelpCircle,
  Info,
  Truck,
  RotateCcw,
  Scale
} from 'lucide-react'
import { useToast } from '../context/ToastContext'
import api from '../services/api'

// ─── Inline toggle switch ─────────────────────────────────────────────────────
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

// ─── Hero Stats Tab ───────────────────────────────────────────────────────────
function StatsTab() {
  const { addToast } = useToast()
  const [stats, setStats] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)

  // Form state
  const [fValue, setFValue] = useState('')
  const [fLabel, setFLabel] = useState('')
  const [fDesc, setFDesc] = useState('')
  const [fOrder, setFOrder] = useState('0')

  const fetchStats = async () => {
    try {
      setLoading(true)
      const res = await api.get('/admin/hero-stats')
      setStats(res.data.data || [])
    } catch {
      addToast('Failed to load hero stats', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchStats() }, [])

  const resetForm = () => {
    setFValue(''); setFLabel(''); setFDesc(''); setFOrder('0')
    setEditingId(null); setShowForm(false)
  }

  const openEdit = (stat) => {
    setFValue(stat.value); setFLabel(stat.label)
    setFDesc(stat.description || ''); setFOrder(String(stat.order || 0))
    setEditingId(stat._id); setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!fValue.trim() || !fLabel.trim()) {
      addToast('Value and label are required', 'error'); return
    }
    try {
      setActionLoading('form')
      const payload = { value: fValue.trim(), label: fLabel.trim(), description: fDesc.trim(), order: parseInt(fOrder) || 0 }
      if (editingId) {
        await api.put(`/admin/hero-stats/${editingId}`, payload)
        addToast('Stat updated', 'success')
      } else {
        await api.post('/admin/hero-stats', payload)
        addToast('Stat created', 'success')
      }
      resetForm(); fetchStats()
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to save stat', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  const toggleActive = async (stat) => {
    try {
      setActionLoading(stat._id + '_toggle')
      await api.put(`/admin/hero-stats/${stat._id}`, { isActive: !stat.isActive })
      setStats(prev => prev.map(s => s._id === stat._id ? { ...s, isActive: !s.isActive } : s))
      addToast(stat.isActive ? 'Stat hidden from landing page' : 'Stat visible on landing page', 'success')
    } catch {
      addToast('Failed to update stat visibility', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  const deleteStat = async (id) => {
    if (!window.confirm('Delete this stat permanently?')) return
    try {
      setActionLoading(id + '_delete')
      await api.delete(`/admin/hero-stats/${id}`)
      setStats(prev => prev.filter(s => s._id !== id))
      addToast('Stat deleted', 'success')
    } catch {
      addToast('Failed to delete stat', 'error')
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
            Hero Statistics
          </h2>
          <p className="text-[10px] font-mono text-artisan-light/40 uppercase tracking-widest">
            These rows appear in the "Our Advantage" section on the landing page.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchStats}
            className="h-9 px-4 bg-artisan-light/5 border border-artisan-light/10 text-artisan-grey hover:bg-artisan-light/10 flex items-center gap-2 font-mono text-[9px] font-bold uppercase tracking-widest transition-all group"
          >
            <RefreshCcw className={`w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-700 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => { resetForm(); setShowForm(v => !v) }}
            className="h-9 px-4 bg-artisan-light text-artisan-dark hover:bg-artisan-grey flex items-center gap-2 font-mono text-[9px] font-bold uppercase tracking-widest transition-all"
          >
            {showForm && !editingId ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            {showForm && !editingId ? 'Cancel' : 'Add Stat'}
          </button>
        </div>
      </div>

      {/* Add / Edit Form */}
      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onSubmit={handleSubmit}
            className="border border-artisan-light/10 bg-artisan-dark/50 p-6 space-y-4"
          >
            <span className="text-[9px] font-mono font-bold text-artisan-light/40 uppercase tracking-widest block border-b border-artisan-light/5 pb-2">
              {editingId ? 'Edit Stat Row' : 'New Stat Row'}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[8px] font-mono text-artisan-light/40 uppercase tracking-widest block font-bold">
                  Value <span className="text-artisan-grey">*</span>
                </label>
                <input
                  value={fValue}
                  onChange={e => setFValue(e.target.value)}
                  placeholder="e.g. 500+ or ₹ or 100%"
                  className="w-full bg-artisan-light/[0.01] border border-artisan-light/10 p-3 text-xs font-mono text-artisan-light uppercase tracking-widest outline-none focus:border-artisan-grey transition-all"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-mono text-artisan-light/40 uppercase tracking-widest block font-bold">
                  Label <span className="text-artisan-grey">*</span>
                </label>
                <input
                  value={fLabel}
                  onChange={e => setFLabel(e.target.value)}
                  placeholder="e.g. Trusted by Hospitals"
                  className="w-full bg-artisan-light/[0.01] border border-artisan-light/10 p-3 text-xs font-mono text-artisan-light uppercase tracking-widest outline-none focus:border-artisan-grey transition-all"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-[8px] font-mono text-artisan-light/40 uppercase tracking-widest block font-bold">Description</label>
                <input
                  value={fDesc}
                  onChange={e => setFDesc(e.target.value)}
                  placeholder="e.g. Serving medical institutions"
                  className="w-full bg-artisan-light/[0.01] border border-artisan-light/10 p-3 text-xs font-mono text-artisan-light uppercase tracking-widest outline-none focus:border-artisan-grey transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-mono text-artisan-light/40 uppercase tracking-widest block font-bold">Order (position)</label>
                <input
                  type="number"
                  value={fOrder}
                  onChange={e => setFOrder(e.target.value)}
                  min="0"
                  className="w-full bg-artisan-light/[0.01] border border-artisan-light/10 p-3 text-xs font-mono text-artisan-light tracking-widest outline-none focus:border-artisan-grey transition-all"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={actionLoading === 'form'}
                className="h-10 px-6 bg-artisan-light text-artisan-dark font-mono text-[9px] font-bold uppercase tracking-widest hover:bg-artisan-grey transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {actionLoading === 'form' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                {editingId ? 'Save Changes' : 'Create Stat'}
              </button>
              <button type="button" onClick={resetForm} className="h-10 px-4 border border-artisan-light/10 text-artisan-light/50 hover:text-artisan-light font-mono text-[9px] uppercase tracking-widest transition-all">
                Cancel
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Stats Table */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-artisan-grey" />
        </div>
      ) : stats.length === 0 ? (
        <div className="border border-dashed border-artisan-light/10 p-12 text-center">
          <BarChart3 className="w-10 h-10 text-artisan-light/10 mx-auto mb-3" />
          <p className="text-[10px] font-mono text-artisan-light/20 uppercase tracking-widest">No stats created yet. Add your first one.</p>
        </div>
      ) : (
        <div className="border border-artisan-light/10 bg-artisan-dark/50 overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-artisan-light/10 bg-artisan-light/[0.02] text-left">
                <th className="px-5 py-4 text-[9px] font-mono font-bold text-artisan-light/40 uppercase tracking-widest">#</th>
                <th className="px-5 py-4 text-[9px] font-mono font-bold text-artisan-light/40 uppercase tracking-widest">Value</th>
                <th className="px-5 py-4 text-[9px] font-mono font-bold text-artisan-light/40 uppercase tracking-widest">Label</th>
                <th className="px-5 py-4 text-[9px] font-mono font-bold text-artisan-light/40 uppercase tracking-widest hidden md:table-cell">Description</th>
                <th className="px-5 py-4 text-[9px] font-mono font-bold text-artisan-light/40 uppercase tracking-widest text-center">Visible</th>
                <th className="px-5 py-4 text-[9px] font-mono font-bold text-artisan-light/40 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-artisan-light/5">
              {stats.map((stat, i) => (
                <tr key={stat._id} className={`group transition-all hover:bg-artisan-light/[0.02] ${!stat.isActive ? 'opacity-40' : ''}`}>
                  <td className="px-5 py-5 font-mono text-[10px] text-artisan-light/30">{String(stat.order || i + 1).padStart(2, '0')}</td>
                  <td className="px-5 py-5">
                    <span className="text-xl font-display font-black text-artisan-grey tracking-tighter">{stat.value}</span>
                  </td>
                  <td className="px-5 py-5">
                    <span className="text-xs font-display font-black text-artisan-light uppercase tracking-tight">{stat.label}</span>
                  </td>
                  <td className="px-5 py-5 hidden md:table-cell">
                    <span className="text-[10px] font-mono text-artisan-light/50">{stat.description}</span>
                  </td>
                  <td className="px-5 py-5 text-center">
                    <Toggle
                      checked={stat.isActive}
                      onChange={() => toggleActive(stat)}
                      disabled={actionLoading === stat._id + '_toggle'}
                    />
                  </td>
                  <td className="px-5 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(stat)}
                        className="h-8 w-8 flex items-center justify-center border border-artisan-light/10 text-artisan-light/40 hover:text-artisan-light hover:border-artisan-light/30 transition-all"
                        title="Edit stat"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteStat(stat._id)}
                        disabled={actionLoading === stat._id + '_delete'}
                        className="h-8 w-8 flex items-center justify-center border border-red-900/40 text-red-500/60 hover:bg-red-900 hover:text-artisan-light hover:border-red-900 transition-all disabled:opacity-30"
                        title="Delete stat"
                      >
                        {actionLoading === stat._id + '_delete'
                          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          : <Trash2 className="w-3.5 h-3.5" />
                        }
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ─── Testimonials Tab ─────────────────────────────────────────────────────────
function ReviewsTab() {
  const { addToast } = useToast()
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)
  const [showForm, setShowForm] = useState(false)

  // Form state
  const [fText, setFText] = useState('')
  const [fName, setFName] = useState('')
  const [fRole, setFRole] = useState('')
  const [fLocation, setFLocation] = useState('')

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const res = await api.get('/admin/reviews')
      setReviews(res.data.data || [])
    } catch {
      addToast('Failed to load reviews', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchReviews() }, [])

  const resetForm = () => {
    setFText(''); setFName(''); setFRole(''); setFLocation('')
    setShowForm(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!fText.trim() || !fName.trim()) {
      addToast('Review text and name are required', 'error'); return
    }
    try {
      setActionLoading('form')
      await api.post('/admin/reviews', {
        text: fText.trim(),
        userName: fName.trim(),
        userRole: fRole.trim() || 'Verified Customer',
        userLocation: fLocation.trim() || 'Tamil Nadu',
      })
      addToast('Review added to testimonials', 'success')
      resetForm(); fetchReviews()
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to save review', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  const toggleActive = async (review) => {
    try {
      setActionLoading(review._id + '_toggle')
      await api.put(`/admin/reviews/${review._id}`, { isActive: !review.isActive })
      setReviews(prev => prev.map(r => r._id === review._id ? { ...r, isActive: !r.isActive } : r))
      addToast(review.isActive ? 'Review hidden from landing page' : 'Review visible on landing page', 'success')
    } catch {
      addToast('Failed to update review visibility', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  const deleteReview = async (id) => {
    if (!window.confirm('Delete this review permanently?')) return
    try {
      setActionLoading(id + '_delete')
      await api.delete(`/admin/reviews/${id}`)
      setReviews(prev => prev.filter(r => r._id !== id))
      addToast('Review deleted', 'success')
    } catch {
      addToast('Failed to delete review', 'error')
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
            Customer Testimonials
          </h2>
          <p className="text-[10px] font-mono text-artisan-light/40 uppercase tracking-widest">
            Reviews displayed in the testimonials carousel on the landing page.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchReviews}
            className="h-9 px-4 bg-artisan-light/5 border border-artisan-light/10 text-artisan-grey hover:bg-artisan-light/10 flex items-center gap-2 font-mono text-[9px] font-bold uppercase tracking-widest transition-all group"
          >
            <RefreshCcw className={`w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-700 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => { resetForm(); setShowForm(v => !v) }}
            className="h-9 px-4 bg-artisan-light text-artisan-dark hover:bg-artisan-grey flex items-center gap-2 font-mono text-[9px] font-bold uppercase tracking-widest transition-all"
          >
            {showForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            {showForm ? 'Cancel' : 'Add Review'}
          </button>
        </div>
      </div>

      {/* Add Review Form */}
      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onSubmit={handleSubmit}
            className="border border-artisan-light/10 bg-artisan-dark/50 p-6 space-y-4"
          >
            <span className="text-[9px] font-mono font-bold text-artisan-light/40 uppercase tracking-widest block border-b border-artisan-light/5 pb-2">
              New Testimonial Review
            </span>

            {/* Review Text */}
            <div className="space-y-1">
              <label className="text-[8px] font-mono text-artisan-light/40 uppercase tracking-widest block font-bold">
                Review Text <span className="text-artisan-grey">*</span>
              </label>
              <textarea
                value={fText}
                onChange={e => setFText(e.target.value)}
                placeholder="STAT Surgical Supplies has been our trusted partner for rehabilitation equipment..."
                rows={4}
                className="w-full bg-artisan-light/[0.01] border border-artisan-light/10 p-3 text-xs font-mono text-artisan-light tracking-wide outline-none focus:border-artisan-grey transition-all resize-none leading-relaxed"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[8px] font-mono text-artisan-light/40 uppercase tracking-widest block font-bold">
                  Reviewer Name <span className="text-artisan-grey">*</span>
                </label>
                <input
                  value={fName}
                  onChange={e => setFName(e.target.value)}
                  placeholder="Dr. Priya Sharma"
                  className="w-full bg-artisan-light/[0.01] border border-artisan-light/10 p-3 text-xs font-mono text-artisan-light uppercase tracking-widest outline-none focus:border-artisan-grey transition-all"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-mono text-artisan-light/40 uppercase tracking-widest block font-bold">Role / Title</label>
                <input
                  value={fRole}
                  onChange={e => setFRole(e.target.value)}
                  placeholder="Orthopedic Surgeon"
                  className="w-full bg-artisan-light/[0.01] border border-artisan-light/10 p-3 text-xs font-mono text-artisan-light uppercase tracking-widest outline-none focus:border-artisan-grey transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-mono text-artisan-light/40 uppercase tracking-widest block font-bold">Location</label>
                <input
                  value={fLocation}
                  onChange={e => setFLocation(e.target.value)}
                  placeholder="Chennai"
                  className="w-full bg-artisan-light/[0.01] border border-artisan-light/10 p-3 text-xs font-mono text-artisan-light uppercase tracking-widest outline-none focus:border-artisan-grey transition-all"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={actionLoading === 'form'}
                className="h-10 px-6 bg-artisan-light text-artisan-dark font-mono text-[9px] font-bold uppercase tracking-widest hover:bg-artisan-grey transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {actionLoading === 'form' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                Post Review
              </button>
              <button type="button" onClick={resetForm} className="h-10 px-4 border border-artisan-light/10 text-artisan-light/50 hover:text-artisan-light font-mono text-[9px] uppercase tracking-widest transition-all">
                Cancel
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Reviews List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-artisan-grey" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="border border-dashed border-artisan-light/10 p-12 text-center">
          <MessageSquareQuote className="w-10 h-10 text-artisan-light/10 mx-auto mb-3" />
          <p className="text-[10px] font-mono text-artisan-light/20 uppercase tracking-widest">No reviews yet. Add the first testimonial.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review, i) => (
            <motion.div
              key={review._id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`border border-artisan-light/10 bg-artisan-dark/50 p-5 sm:p-6 space-y-3 transition-all ${!review.isActive ? 'opacity-40 border-artisan-light/5' : ''}`}
            >
              {/* Quote + Toggle/Delete row */}
              <div className="flex items-start justify-between gap-4">
                <p className="text-sm font-mono text-artisan-light/80 leading-relaxed flex-1 italic">
                  "{review.text}"
                </p>
                <div className="flex items-center gap-2 shrink-0 pt-0.5">
                  <div className="flex items-center gap-2">
                    {review.isActive
                      ? <Eye className="w-3.5 h-3.5 text-green-500/60" />
                      : <EyeOff className="w-3.5 h-3.5 text-artisan-light/20" />
                    }
                    <Toggle
                      checked={review.isActive}
                      onChange={() => toggleActive(review)}
                      disabled={actionLoading === review._id + '_toggle'}
                    />
                  </div>
                  <button
                    onClick={() => deleteReview(review._id)}
                    disabled={actionLoading === review._id + '_delete'}
                    className="h-8 w-8 flex items-center justify-center border border-red-900/30 text-red-500/50 hover:bg-red-900 hover:text-artisan-light hover:border-red-900 transition-all disabled:opacity-30"
                    title="Delete review"
                  >
                    {actionLoading === review._id + '_delete'
                      ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      : <Trash2 className="w-3.5 h-3.5" />
                    }
                  </button>
                </div>
              </div>

              {/* Reviewer info */}
              <div className="flex items-center gap-3 border-t border-artisan-light/5 pt-3">
                <div className="w-8 h-8 bg-artisan-grey/10 border border-artisan-light/10 flex items-center justify-center shrink-0">
                  <span className="text-xs font-display font-black text-artisan-grey">
                    {review.userName?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-display font-black text-artisan-grey uppercase tracking-tight block">
                    {review.userName}
                  </span>
                  <span className="text-[9px] font-mono text-artisan-light/30 uppercase tracking-widest">
                    {review.userRole} · {review.userLocation}
                  </span>
                </div>
                <div className="ml-auto text-[8px] font-mono text-artisan-light/20 uppercase tracking-widest">
                  {new Date(review.createdAt).toLocaleDateString()}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Page Sections Tab (Privacy, Shipping, Terms, Returns, FAQ) ───────────────
function PageSectionsTab({ slug, title }) {
  const { addToast } = useToast()
  const [sections, setSections] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)

  // Form state
  const [heading, setHeading] = useState('')
  const [body, setBody] = useState('')

  const fetchPage = async () => {
    try {
      setLoading(true)
      const res = await api.get(`/admin/pages/${slug}`)
      const fetchedSections = res.data.data?.sections || []
      fetchedSections.sort((a, b) => a.order - b.order)
      setSections(fetchedSections)
    } catch {
      addToast(`Failed to load ${title}`, 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPage()
    resetForm()
  }, [slug])

  const resetForm = () => {
    setHeading('')
    setBody('')
    setEditingId(null)
    setShowForm(false)
  }

  const openEdit = (section) => {
    setHeading(section.heading)
    setBody(section.body)
    setEditingId(section._id)
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!heading.trim() || !body.trim()) {
      addToast('Heading and body are required', 'error')
      return
    }

    try {
      setActionLoading('form')
      if (editingId) {
        await api.put(`/admin/pages/${slug}/sections/${editingId}`, {
          heading: heading.trim(),
          body: body.trim()
        })
        addToast('Section updated successfully', 'success')
      } else {
        await api.post(`/admin/pages/${slug}/sections`, {
          heading: heading.trim(),
          body: body.trim()
        })
        addToast('Section added successfully', 'success')
      }
      resetForm()
      fetchPage()
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to save section', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (sectionId) => {
    if (!window.confirm('Are you sure you want to delete this section?')) return
    try {
      setActionLoading(sectionId + '_delete')
      await api.delete(`/admin/pages/${slug}/sections/${sectionId}`)
      addToast('Section deleted successfully', 'success')
      fetchPage()
    } catch {
      addToast('Failed to delete section', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  const handleMove = async (index, direction) => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= sections.length) return

    try {
      setActionLoading('reorder')
      const reordered = [...sections]
      const temp = reordered[index]
      reordered[index] = reordered[targetIndex]
      reordered[targetIndex] = temp

      const payload = reordered.map((sec, idx) => ({
        _id: sec._id,
        order: idx
      }))

      await api.post(`/admin/pages/${slug}/reorder`, { sections: payload })
      setSections(reordered)
      addToast('Section reordered successfully', 'success')
    } catch {
      addToast('Failed to reorder sections', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  const getFormatTips = () => {
    if (slug === 'shipping') {
      return (
        <div className="border border-artisan-grey/25 bg-artisan-grey/5 p-4 text-xs space-y-2 leading-relaxed">
          <p className="font-mono font-bold text-artisan-grey uppercase tracking-wider flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5" /> Shipping Policy Format Guidelines
          </p>
          <ul className="list-disc pl-4 space-y-1 text-artisan-light/60 font-mono text-[10px]">
            <li><strong>Shipping Methods</strong>: Prefix heading with <code className="text-artisan-grey">[Method]</code>. E.g. <code className="text-artisan-light">[Method] Express Shipping</code>. In body, separate time and description with <code className="text-artisan-grey">|</code>. E.g. <code className="text-artisan-light">1-2 business days | Fast-tracked air dispatch...</code></li>
            <li><strong>Info Blocks</strong>: Prefix heading with <code className="text-artisan-grey">[Info]</code>. E.g. <code className="text-artisan-light">[Info] Processing Time</code>. In body, type the details.</li>
            <li><strong>FAQ Accordions</strong>: Prefix heading with <code className="text-artisan-grey">[FAQ]</code>. E.g. <code className="text-artisan-light">[FAQ] How can I track my order?</code>. In body, type the answer.</li>
          </ul>
        </div>
      )
    }
    if (slug === 'returns') {
      return (
        <div className="border border-artisan-grey/25 bg-artisan-grey/5 p-4 text-xs space-y-2 leading-relaxed">
          <p className="font-mono font-bold text-artisan-grey uppercase tracking-wider flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5" /> Returns & Refunds Format Guidelines
          </p>
          <ul className="list-disc pl-4 space-y-1 text-artisan-light/60 font-mono text-[10px]">
            <li><strong>Return Steps</strong>: Prefix heading with <code className="text-artisan-grey">[Step]</code>. E.g. <code className="text-artisan-light">[Step] Step 1: Initiate</code>. In body, separate status and description with <code className="text-artisan-grey">|</code>. E.g. <code className="text-artisan-light">Online Request | Log in and click Return...</code></li>
            <li><strong>Info Blocks</strong>: Prefix heading with <code className="text-artisan-grey">[Info]</code>. E.g. <code className="text-artisan-light">[Info] Return Policy</code>. In body, type description. If you need bullet points at the bottom, separate them by starting a new line with <code className="text-artisan-grey">- </code>.</li>
            <li><strong>FAQ Accordions</strong>: Prefix heading with <code className="text-artisan-grey">[FAQ]</code>. E.g. <code className="text-artisan-light">[FAQ] What if return is outside 30-day window?</code>. In body, type the answer.</li>
          </ul>
        </div>
      )
    }
    if (slug === 'faq') {
      return (
        <div className="border border-artisan-grey/25 bg-artisan-grey/5 p-4 text-xs space-y-2 leading-relaxed">
          <p className="font-mono font-bold text-artisan-grey uppercase tracking-wider flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5" /> FAQ Page Format Guidelines
          </p>
          <ul className="list-disc pl-4 space-y-1 text-artisan-light/60 font-mono text-[10px]">
            <li><strong>Group Q&As by Category</strong>: Prefix heading with the category inside brackets <code className="text-artisan-grey">[Category Name]</code> followed by the question.</li>
            <li>E.g. Heading: <code className="text-artisan-light">[Orders & Shipping] How long does shipping take?</code></li>
            <li>E.g. Heading: <code className="text-artisan-light">[Returns & Refunds] How do I request a refund?</code></li>
            <li>In the body field, enter the answer. Categories will be automatically grouped and tabs will be built on the page dynamically!</li>
          </ul>
        </div>
      )
    }
    return (
      <div className="border border-artisan-light/10 bg-artisan-light/[0.02] p-4 text-xs space-y-2 leading-relaxed">
        <p className="font-mono font-bold text-artisan-light/60 uppercase tracking-wider flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5" /> Document Layout Guidelines
        </p>
        <p className="text-xs text-artisan-light/40">
          For Privacy Policy and Terms & Conditions, each section is displayed as a distinct chapter in the main scrolling text container, and its heading is automatically appended to the sticky left navigation menu for easy navigation.
        </p>
      </div>
    )
  }

  const getHeadingPlaceholder = () => {
    if (slug === 'shipping') return 'e.g., [Method] Express Shipping  or  [Info] Processing Time  or  [FAQ] Tracking Link'
    if (slug === 'returns') return 'e.g., [Step] Step 1: Initiate  or  [Info] Return Policy  or  [FAQ] Damaged Items'
    if (slug === 'faq') return 'e.g., [Orders & Shipping] How do I track my package?'
    return 'e.g., Overview, Interpretation & Definitions'
  }

  const getBodyPlaceholder = () => {
    if (slug === 'shipping') return 'For methods: time | description (e.g. 1-2 business days | Fast air delivery).\nFor others: simple descriptive text.'
    if (slug === 'returns') return 'For steps: action | description (e.g. Online Request | Click return items).\nFor Info blocks: text details.\nFor FAQ: answer text.'
    return 'Enter content details. Supports multiple paragraphs.'
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-lg font-display font-black uppercase text-artisan-light tracking-tight">
            {title} CMS
          </h2>
          <p className="text-[10px] font-mono text-artisan-light/40 uppercase tracking-widest">
            Manage the content sections and headings for the {title} page dynamically.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchPage}
            className="h-9 px-4 bg-artisan-light/5 border border-artisan-light/10 text-artisan-grey hover:bg-artisan-light/10 flex items-center gap-2 font-mono text-[9px] font-bold uppercase tracking-widest transition-all group"
          >
            <RefreshCcw className={`w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-700 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => { resetForm(); setShowForm(v => !v) }}
            className="h-9 px-4 bg-artisan-light text-artisan-dark hover:bg-artisan-grey flex items-center gap-2 font-mono text-[9px] font-bold uppercase tracking-widest transition-all"
          >
            {showForm && !editingId ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            {showForm && !editingId ? 'Cancel' : 'Add Section'}
          </button>
        </div>
      </div>

      {getFormatTips()}

      {/* Add / Edit Form */}
      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onSubmit={handleSubmit}
            className="border border-artisan-light/10 bg-artisan-dark/50 p-6 space-y-4"
          >
            <span className="text-[9px] font-mono font-bold text-artisan-light/40 uppercase tracking-widest block border-b border-artisan-light/5 pb-2">
              {editingId ? 'Edit Section' : 'New Section'}
            </span>
            <div className="space-y-1">
              <label className="text-[8px] font-mono text-artisan-light/40 uppercase tracking-widest block font-bold">
                Section Heading <span className="text-artisan-grey">*</span>
              </label>
              <input
                value={heading}
                onChange={e => setHeading(e.target.value)}
                placeholder={getHeadingPlaceholder()}
                className="w-full bg-artisan-light/[0.01] border border-artisan-light/10 p-3 text-xs font-mono text-artisan-light uppercase tracking-widest outline-none focus:border-artisan-grey transition-all font-bold"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-[8px] font-mono text-artisan-light/40 uppercase tracking-widest block font-bold">
                Section Body <span className="text-artisan-grey">*</span>
              </label>
              <textarea
                value={body}
                onChange={e => setBody(e.target.value)}
                placeholder={getBodyPlaceholder()}
                rows={8}
                className="w-full bg-artisan-light/[0.01] border border-artisan-light/10 p-3 text-xs font-mono text-artisan-light outline-none focus:border-artisan-grey transition-all resize-none leading-relaxed"
                required
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={actionLoading === 'form'}
                className="h-10 px-6 bg-artisan-light text-artisan-dark font-mono text-[9px] font-bold uppercase tracking-widest hover:bg-artisan-grey transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {actionLoading === 'form' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                {editingId ? 'Save Changes' : 'Create Section'}
              </button>
              <button type="button" onClick={resetForm} className="h-10 px-4 border border-artisan-light/10 text-artisan-light/50 hover:text-artisan-light font-mono text-[9px] uppercase tracking-widest transition-all">
                Cancel
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Sections List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-artisan-grey" />
        </div>
      ) : sections.length === 0 ? (
        <div className="border border-dashed border-artisan-light/10 p-12 text-center">
          <FileText className="w-10 h-10 text-artisan-light/10 mx-auto mb-3" />
          <p className="text-[10px] font-mono text-artisan-light/20 uppercase tracking-widest">No sections created yet. Add your first one.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sections.map((section, idx) => (
            <div
              key={section._id}
              className="border border-artisan-light/10 bg-artisan-dark/50 p-5 space-y-3 flex items-start gap-4 justify-between"
            >
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <span className="text-[9px] font-mono font-bold text-artisan-grey tracking-wider uppercase shrink-0">
                    [ SECTION {String(idx + 1).padStart(2, '0')} ]
                  </span>
                  <h4 className="text-sm font-display font-extrabold uppercase text-artisan-light truncate">
                    {section.heading}
                  </h4>
                </div>
                <p className="text-xs font-mono text-artisan-light/50 line-clamp-2 leading-relaxed">
                  {section.body}
                </p>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => handleMove(idx, 'up')}
                  disabled={idx === 0 || actionLoading === 'reorder'}
                  className="h-8 w-8 flex items-center justify-center border border-artisan-light/10 text-artisan-light/40 hover:text-artisan-light hover:border-artisan-light/30 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                  title="Move section up"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleMove(idx, 'down')}
                  disabled={idx === sections.length - 1 || actionLoading === 'reorder'}
                  className="h-8 w-8 flex items-center justify-center border border-artisan-light/10 text-artisan-light/40 hover:text-artisan-light hover:border-artisan-light/30 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                  title="Move section down"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
                <button
                  onClick={() => openEdit(section)}
                  className="h-8 w-8 flex items-center justify-center border border-artisan-light/10 text-artisan-light/40 hover:text-artisan-light hover:border-artisan-light/30 transition-all"
                  title="Edit section"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(section._id)}
                  disabled={actionLoading === section._id + '_delete'}
                  className="h-8 w-8 flex items-center justify-center border border-red-900/40 text-red-500/60 hover:bg-red-900 hover:text-artisan-light hover:border-red-900 transition-all disabled:opacity-30"
                  title="Delete section"
                >
                  {actionLoading === section._id + '_delete'
                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    : <Trash2 className="w-3.5 h-3.5" />
                  }
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminContent() {
  const [activeTab, setActiveTab] = useState('stats')

  const TABS = [
    { id: 'stats', label: 'Hero Stats', icon: BarChart3 },
    { id: 'reviews', label: 'Testimonials', icon: MessageSquareQuote },
    { id: 'privacy', label: 'Privacy Policy', icon: FileText },
    { id: 'shipping', label: 'Shipping Policy', icon: Truck },
    { id: 'terms', label: 'Terms & Conditions', icon: Scale },
    { id: 'returns', label: 'Returns & Refunds', icon: RotateCcw },
    { id: 'faq', label: 'FAQ', icon: HelpCircle },
  ]

  return (
    <div className="min-h-screen bg-artisan-dark bg-noise pt-32 pb-24 text-artisan-light">
      <div className="container-custom max-w-5xl">

        {/* Page Header */}
        <div className="mb-10 space-y-2">
          <h1 className="text-5xl sm:text-6xl font-display font-black uppercase tracking-tighter leading-none text-artisan-light">
            CONTENT <span className="text-outline">MANAGER.</span>
          </h1>
          <p className="text-[11px] font-mono text-artisan-light/30 uppercase tracking-widest max-w-lg">
            Control what appears on the landing page and policy/FAQ pages.
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
                    : 'border-transparent text-artisan-light/30 hover:text-artisan-light/60'
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
            {activeTab === 'stats' && <StatsTab />}
            {activeTab === 'reviews' && <ReviewsTab />}
            {activeTab === 'privacy' && <PageSectionsTab slug="privacy" title="Privacy Policy" />}
            {activeTab === 'shipping' && <PageSectionsTab slug="shipping" title="Shipping Policy" />}
            {activeTab === 'terms' && <PageSectionsTab slug="terms" title="Terms & Conditions" />}
            {activeTab === 'returns' && <PageSectionsTab slug="returns" title="Returns & Refunds" />}
            {activeTab === 'faq' && <PageSectionsTab slug="faq" title="FAQ" />}
          </motion.div>
        </AnimatePresence>

      </div>
    </div>
  )
}
