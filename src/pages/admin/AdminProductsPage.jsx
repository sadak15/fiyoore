import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { FiPlus, FiMoreVertical, FiEdit2, FiTrash2, FiX } from 'react-icons/fi'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../context/AuthContext'

const emptyForm = {
  name: '',
  description: '',
  price: '',
  stock: '',
  image_url: '',
}

export default function AdminProductsPage() {
  const { user } = useAuth()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  const [modalOpen, setModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [openMenuId, setOpenMenuId] = useState(null)

  const [draftFilters, setDraftFilters] = useState({
    search: '',
    status: 'all',
    startDate: '',
    endDate: '',
  })
  const [appliedFilters, setAppliedFilters] = useState(draftFilters)

  const loadData = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
    setProducts(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) return toast.error(error.message)
    toast.success('Product deleted')
    setOpenMenuId(null)
    loadData()
  }

  const openAddModal = () => {
    setEditingProduct(null)
    setModalOpen(true)
  }

  const openEditModal = (product) => {
    setEditingProduct(product)
    setModalOpen(true)
    setOpenMenuId(null)
  }

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(appliedFilters.search.toLowerCase())
      const matchesStatus =
        appliedFilters.status === 'all' ||
        (appliedFilters.status === 'active' && p.stock > 0) ||
        (appliedFilters.status === 'inactive' && p.stock === 0)
      const createdAt = new Date(p.created_at)
      const matchesStart = !appliedFilters.startDate || createdAt >= new Date(appliedFilters.startDate)
      const matchesEnd = !appliedFilters.endDate || createdAt <= new Date(appliedFilters.endDate + 'T23:59:59')
      return matchesSearch && matchesStatus && matchesStart && matchesEnd
    })
  }, [products, appliedFilters])

  const stats = useMemo(() => {
    const totalProducts = products.length
    const activeProducts = products.filter((p) => p.stock > 0).length
    const inactiveProducts = totalProducts - activeProducts
    const totalQty = products.reduce((sum, p) => sum + (p.stock ?? 0), 0)
    const available = products.filter((p) => p.stock > 0).length
    return { totalProducts, activeProducts, inactiveProducts, totalQty, available }
  }, [products])

  const applyFilters = (e) => {
    e.preventDefault()
    setAppliedFilters(draftFilters)
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-plum-900">Manage Products</h1>
          <p className="text-sm text-plum-400">Easily manage and organize all your products in one place.</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 rounded-lg bg-coral-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-coral-600 transition-colors"
        >
          <FiPlus /> Add Product
        </button>
      </div>

      {/* Filters — single row: Start, End, Search, Status, Apply */}
      <form
        onSubmit={applyFilters}
        className="mt-6 flex flex-wrap items-end gap-4 rounded-2xl border border-plum-100 bg-white p-4"
      >
        <div className="min-w-[150px] flex-1">
          <label className="mb-1 block text-xs font-medium text-plum-400">Start Date</label>
          <input
            type="date"
            value={draftFilters.startDate}
            onChange={(e) => setDraftFilters({ ...draftFilters, startDate: e.target.value })}
            className="w-full rounded-lg border border-plum-100 px-3 py-2 text-sm"
          />
        </div>
        <div className="min-w-[150px] flex-1">
          <label className="mb-1 block text-xs font-medium text-plum-400">End Date</label>
          <input
            type="date"
            value={draftFilters.endDate}
            onChange={(e) => setDraftFilters({ ...draftFilters, endDate: e.target.value })}
            className="w-full rounded-lg border border-plum-100 px-3 py-2 text-sm"
          />
        </div>
        <div className="min-w-[200px] flex-[2]">
          <label className="mb-1 block text-xs font-medium text-plum-400">Search Product</label>
          <input
            placeholder="Search product name"
            value={draftFilters.search}
            onChange={(e) => setDraftFilters({ ...draftFilters, search: e.target.value })}
            className="w-full rounded-lg border border-plum-100 px-3 py-2 text-sm"
          />
        </div>
        <div className="min-w-[150px] flex-1">
          <label className="mb-1 block text-xs font-medium text-plum-400">Status</label>
          <select
            value={draftFilters.status}
            onChange={(e) => setDraftFilters({ ...draftFilters, status: e.target.value })}
            className="w-full rounded-lg border border-plum-100 px-3 py-2 text-sm"
          >
            <option value="all">All status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <button
          type="submit"
          className="rounded-lg bg-plum-800 px-6 py-2.5 text-sm font-medium text-white hover:bg-plum-600 transition-colors"
        >
          Apply Filter
        </button>
      </form>

      {/* Stat cards — full border, no left-accent bar */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard label="Total Products" value={stats.totalProducts} border="border-plum-400" />
        <StatCard label="Active Products" value={stats.activeProducts} border="border-coral-500" />
        <StatCard label="Inactive Products" value={stats.inactiveProducts} border="border-gold-500" />
        <StatCard label="Total Qty" value={stats.totalQty} border="border-plum-800" />
        <StatCard label="Available" value={stats.available} border="border-coral-400" />
      </div>

      {/* Product list */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-plum-100 bg-white">
        <div className="flex items-center justify-between border-b border-plum-100 p-4">
          <h2 className="font-display text-lg text-plum-900">Product List</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-plum-100 bg-blush-50 text-plum-400">
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Image</th>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Sales Price</th>
                <th className="px-4 py-3">Qty</th>
                <th className="px-4 py-3">Available</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-plum-400">Loading products…</td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-plum-400">No products match your filters.</td>
                </tr>
              ) : (
                filteredProducts.map((p, i) => (
                  <tr key={p.id} className="border-b border-plum-50 last:border-0">
                    <td className="px-4 py-3 text-plum-400">{i + 1}</td>
                    <td className="px-4 py-3">
                      <div className="h-12 w-12 overflow-hidden rounded-lg bg-plum-50">
                        {p.image_url && (
                          <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-plum-900">{p.name}</p>
                    </td>
                    <td className="px-4 py-3 font-medium text-plum-900">${p.price}</td>
                    <td className="px-4 py-3 text-plum-600">{p.stock}</td>
                    <td className="px-4 py-3">
                      <Badge tone={p.stock > 0 ? 'positive' : 'neutral'}>
                        {p.stock > 0 ? 'Yes' : 'No'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={p.stock > 0 ? 'positive' : 'negative'}>
                        {p.stock > 0 ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="relative px-4 py-3 text-right">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === p.id ? null : p.id)}
                        className="rounded-full p-1.5 text-plum-400 hover:bg-plum-50 hover:text-plum-800"
                      >
                        <FiMoreVertical />
                      </button>
                      {openMenuId === p.id && (
                        <div className="absolute right-4 top-10 z-10 w-36 overflow-hidden rounded-lg border border-plum-100 bg-white shadow-lg">
                          <button
                            onClick={() => openEditModal(p)}
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-plum-800 hover:bg-blush-50"
                          >
                            <FiEdit2 size={14} /> Edit
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-coral-600 hover:bg-blush-50"
                          >
                            <FiTrash2 size={14} /> Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <ProductModal
          product={editingProduct}
          ownerId={user.id}
          onClose={() => setModalOpen(false)}
          onSaved={() => {
            setModalOpen(false)
            loadData()
          }}
        />
      )}
    </div>
  )
}

function StatCard({ label, value, border }) {
  return (
    <div className={`rounded-2xl border-2 ${border} bg-white p-4`}>
      <p className="text-xs text-plum-400">{label}</p>
      <p className="mt-1 font-display text-2xl text-plum-900">{value}</p>
    </div>
  )
}

function Badge({ tone, children }) {
  const tones = {
    positive: 'bg-coral-50 text-coral-600',
    negative: 'bg-plum-50 text-plum-400',
    neutral: 'bg-blush-100 text-plum-400',
  }
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${tones[tone]}`}>{children}</span>
  )
}

function ProductModal({ product, ownerId, onClose, onSaved }) {
  const [form, setForm] = useState(
    product
      ? {
          name: product.name,
          description: product.description ?? '',
          price: product.price,
          stock: product.stock,
          image_url: product.image_url ?? '',
        }
      : emptyForm
  )
  const [imageMode, setImageMode] = useState(product?.image_url ? 'url' : 'upload')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const path = `${crypto.randomUUID()}.${ext}`
      const { error } = await supabase.storage.from('product-images').upload(path, file)
      if (error) throw error
      const { data } = supabase.storage.from('product-images').getPublicUrl(path)
      setForm((f) => ({ ...f, image_url: data.publicUrl }))
      toast.success('Image uploaded')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    const payload = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      stock: Number(form.stock),
      image_url: form.image_url || null,
      owner_id: ownerId,
    }
    try {
      const { error } = product
        ? await supabase.from('products').update(payload).eq('id', product.id)
        : await supabase.from('products').insert(payload)
      if (error) throw error
      toast.success(product ? 'Product updated' : 'Product added')
      onSaved()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-plum-900/40 px-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl text-plum-900">
            {product ? 'Edit product' : 'Add product'}
          </h2>
          <button onClick={onClose} className="text-plum-400 hover:text-plum-800">
            <FiX size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-3">
          <input
            placeholder="Name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="rounded-lg border border-plum-100 px-3 py-2 text-sm"
          />
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="rounded-lg border border-plum-100 px-3 py-2 text-sm"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              step="0.01"
              placeholder="Price"
              required
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="rounded-lg border border-plum-100 px-3 py-2 text-sm"
            />
            <input
              type="number"
              placeholder="Stock"
              required
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
              className="rounded-lg border border-plum-100 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <div className="mb-2 flex gap-4 text-sm font-medium">
              <button
                type="button"
                onClick={() => setImageMode('upload')}
                className={imageMode === 'upload' ? 'text-plum-800 underline' : 'text-plum-400'}
              >
                Upload from device
              </button>
              <button
                type="button"
                onClick={() => setImageMode('url')}
                className={imageMode === 'url' ? 'text-plum-800 underline' : 'text-plum-400'}
              >
                Paste image URL
              </button>
            </div>

            {imageMode === 'upload' ? (
              <>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="text-sm text-plum-600"
                />
                {uploading && <p className="mt-1 text-xs text-plum-400">Uploading…</p>}
              </>
            ) : (
              <input
                placeholder="https://example.com/image.jpg"
                value={form.image_url}
                onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                className="w-full rounded-lg border border-plum-100 px-3 py-2 text-sm"
              />
            )}

            {form.image_url && (
              <img src={form.image_url} alt="" className="mt-2 h-16 w-16 rounded-lg object-cover" />
            )}
          </div>

          <div className="mt-2 flex gap-2">
            <button
              type="submit"
              disabled={saving || uploading}
              className="flex-1 rounded-full bg-plum-800 py-2.5 text-sm font-medium text-white hover:bg-coral-500 disabled:opacity-60 transition-colors"
            >
              {saving ? 'Saving…' : product ? 'Save changes' : 'Add product'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-plum-100 px-5 py-2.5 text-sm font-medium text-plum-600"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}