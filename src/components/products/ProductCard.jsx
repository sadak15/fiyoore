import { Link } from 'react-router'
import toast from 'react-hot-toast'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'

export default function ProductCard({ product }) {
  const { addItem } = useCart()
  const { user } = useAuth()

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!user) return toast.error('Sign in to add gifts to your cart')
    try {
      await addItem(product.id, 1)
      toast.success(`${product.name} added to cart`)
    } catch (err) {
      toast.error(err.message)
    }
  }

  return (
    <Link
      to={`/product/${product.id}`}
      className="group overflow-hidden rounded-2xl border border-plum-100 bg-white transition-shadow hover:shadow-lg"
    >
      <div className="aspect-square overflow-hidden bg-plum-50">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-plum-400">No image</div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-display text-lg text-plum-900">{product.name}</h3>
        <div className="mt-2 flex items-center justify-between">
          <span className="font-semibold text-coral-600">${product.price}</span>
          <button
            onClick={handleAdd}
            disabled={product.stock === 0}
            className="rounded-full bg-plum-800 px-3 py-1 text-sm font-medium text-white hover:bg-coral-500 disabled:cursor-not-allowed disabled:bg-plum-100 disabled:text-plum-400 transition-colors"
          >
            {product.stock === 0 ? 'Sold out' : 'Add'}
          </button>
        </div>
      </div>
    </Link>
  )
}
