import { Link } from 'react-router'
import { useCart } from '../context/CartContext'

export default function CartPage() {
  const { items, total, updateQuantity, removeItem } = useCart()

  if (items.length === 0) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
        <p className="text-plum-600">Your cart is empty.</p>
        <Link to="/shop" className="mt-4 inline-block text-coral-500 hover:underline">
          Browse gifts →
        </Link>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl text-plum-900">Your cart</h1>

      <ul className="mt-6 divide-y divide-plum-100">
        {items.map((item) => (
          <li key={item.id} className="flex items-center gap-4 py-4">
            <div className="h-16 w-16 overflow-hidden rounded-lg bg-plum-50">
              {item.products?.image_url && (
                <img src={item.products.image_url} alt="" className="h-full w-full object-cover" />
              )}
            </div>
            <div className="flex-1">
              <p className="font-medium text-plum-900">{item.products?.name}</p>
              <p className="text-sm text-plum-400">${item.products?.price}</p>
            </div>
            <input
              type="number"
              min="1"
              value={item.quantity}
              onChange={(e) => updateQuantity(item.product_id, Number(e.target.value))}
              className="w-16 rounded-lg border border-plum-100 px-2 py-1 text-center"
            />
            <button
              onClick={() => removeItem(item.product_id)}
              className="text-sm text-coral-600 hover:underline"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex items-center justify-between border-t border-plum-100 pt-4">
        <span className="font-display text-lg text-plum-900">Total</span>
        <span className="text-xl font-semibold text-coral-600">${total.toFixed(2)}</span>
      </div>

      <button className="mt-6 w-full rounded-full bg-plum-800 py-3 font-medium text-white hover:bg-coral-500 transition-colors">
        Checkout
      </button>
    </section>
  )
}
