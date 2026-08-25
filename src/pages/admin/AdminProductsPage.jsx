import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../context/AuthContext'

const emptyForm = { name: '', description: '', price: '', stock: '', image_url: '' }

export default function AdminProductsPage() {
  const { user } = useAuth()
  const [products, setProducts] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)

  const loadProducts = async () => {
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false })
    setProducts(data ?? [])
  }

  useEffect(() => {
    loadProducts()
  }, [])

  const resetForm = () => {
    setForm(emptyForm)
    setEditingId(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const payload = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      stock: Number(form.stock),
      image_url: form.image_url || null,
      owner_id: user.id,
    }
    try {
      if (editingId) {
        const { error } = await supabase.from('products').update(payload).eq('id', editingId)
        if (error) throw error
        toast.success('Product updated')
      } else {
        const { error } = await supabase.from('products').insert(payload)
        if (error) throw error
        toast.success('Product added')
      }
      resetForm()
      loadProducts()
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleEdit = (product) => {
    setEditingId(product.id)
    setForm({
      name: product.name,
      description: product.description ?? '',
      price: product.price,
      stock: product.stock,
      image_url: product.image_url ?? '',
    })
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return
    await supabase.from('products').delete().eq('id', id)
    toast.success('Product deleted')
    loadProducts()
  }

  return (
    <div>
      <h1 className="font-display text-2xl text-plum-900">Products</h1>

      <form onSubmit={handleSubmit} className="mt-6 grid gap-3 rounded-2xl border border-plum-100 bg-white p-4 sm:grid-cols-2">
        <input
          placeholder="Name"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="rounded-lg border border-plum-100 px-3 py-2 sm:col-span-2"
        />
        <textarea
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="rounded-lg border border-plum-100 px-3 py-2 sm:col-span-2"
        />
        <input
          type="number"
          step="0.01"
          placeholder="Price"
          required
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          className="rounded-lg border border-plum-100 px-3 py-2"
        />
        <input
          type="number"
          placeholder="Stock"
          required
          value={form.stock}
          onChange={(e) => setForm({ ...form, stock: e.target.value })}
          className="rounded-lg border border-plum-100 px-3 py-2"
        />
        <input
          placeholder="Image URL"
          value={form.image_url}
          onChange={(e) => setForm({ ...form, image_url: e.target.value })}
          className="rounded-lg border border-plum-100 px-3 py-2 sm:col-span-2"
        />
        <div className="flex gap-2 sm:col-span-2">
          <button type="submit" className="rounded-full bg-plum-800 px-5 py-2 text-sm font-medium text-white hover:bg-coral-500 transition-colors">
            {editingId ? 'Save changes' : 'Add product'}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} className="rounded-full border border-plum-100 px-5 py-2 text-sm font-medium text-plum-600">
              Cancel
            </button>
          )}
        </div>
      </form>

      <table className="mt-6 w-full text-left text-sm">
        <thead>
          <tr className="border-b border-plum-100 text-plum-400">
            <th className="py-2">Name</th>
            <th className="py-2">Price</th>
            <th className="py-2">Stock</th>
            <th className="py-2"></th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} className="border-b border-plum-50">
              <td className="py-2 text-plum-900">{p.name}</td>
              <td className="py-2">${p.price}</td>
              <td className="py-2">{p.stock}</td>
              <td className="py-2 text-right">
                <button onClick={() => handleEdit(p)} className="mr-3 text-plum-600 hover:underline">Edit</button>
                <button onClick={() => handleDelete(p.id)} className="text-coral-600 hover:underline">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
