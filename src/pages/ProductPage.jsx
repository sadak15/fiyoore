import { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabaseClient'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

export default function ProductPage() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const { addItem } = useCart()
  const { user } = useAuth()

  useEffect(() => {
    supabase.from('products').select('*').eq('id', id).single().then(({ data }) => setProduct(data))
  }, [id])

  if (!product) return <p className="mx-auto max-w-6xl px-4 py-10 text-plum-400">Loading…</p>

  const handleAdd = async () => {
    if (!user) return toast.error('Sign in to add gifts to your cart')
    try {
      await addItem(product.id, 1)
      toast.success(`${product.name} added to cart`)
    } catch (err) {
      toast.error(err.message)
    }
  }

  return (
    <section className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-2">
      <div className="aspect-square overflow-hidden rounded-2xl bg-plum-50">
        {product.image_url && (
          <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
        )}
      </div>
      <div>
        <h1 className="font-display text-3xl text-plum-900">{product.name}</h1>
        <p className="mt-2 text-xl font-semibold text-coral-600">${product.price}</p>
        <p className="mt-4 text-plum-600">{product.description}</p>
        <button
          onClick={handleAdd}
          disabled={product.stock === 0}
          className="mt-6 rounded-full bg-plum-800 px-6 py-2.5 font-medium text-white hover:bg-coral-500 disabled:bg-plum-100 disabled:text-plum-400 transition-colors"
        >
          {product.stock === 0 ? 'Sold out' : 'Add to cart'}
        </button>
      </div>
    </section>
  )
}
