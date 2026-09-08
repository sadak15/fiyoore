import { useRef, useState } from 'react'
import { Link } from 'react-router'
import toast from 'react-hot-toast'
import ProductImage from '../components/products/ProductImage'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'

export default function CartPage() {
  const { items, total, updateQuantity, removeItem, refreshCart } = useCart()
  const { profile } = useAuth()
  const [checkout, setCheckout] = useState(false)
  const [busy, setBusy] = useState(false)
  const [order, setOrder] = useState(null)
  const [form, setForm] = useState({ method: 'delivery', name: profile?.username || '', phone: '', address: '' })
  const key = useRef(null)
  const submitting = useRef(false)

  async function change(action) {
    setBusy(true)
    try { await action() } catch (error) { toast.error(error.message) }
    finally { setBusy(false) }
  }

  async function placeOrder(event) {
    event.preventDefault()
    if (submitting.current || busy) return
    submitting.current = true
    setBusy(true)
    key.current ||= crypto.randomUUID()
    try {
      const { data, error } = await supabase.rpc('checkout_cash', {
        p_fulfillment: form.method, p_name: form.name, p_phone: form.phone,
        p_address: form.address, p_checkout_key: key.current,
        p_expected_total: Number(total.toFixed(2)),
      })
      if (error) throw error
      setOrder(data)
      toast.success('Order placed')
      await refreshCart().catch(() => toast.error('Order placed. Refresh the page to update your cart.'))
    } catch (error) { toast.error(error.message) }
    finally { setBusy(false); submitting.current = false }
  }

  if (order) return (
    <section className="mx-auto max-w-xl px-4 py-16 text-center">
      <h1 className="font-display text-3xl">Thank you! Your order is placed.</h1>
      <p className="mt-4 text-plum-600">Pay ${Number(order.total).toFixed(2)} in cash {order.fulfillment_method === 'delivery' ? 'when your order is delivered' : 'when you collect your order'}.</p>
      <p className="mt-4 break-all text-sm text-plum-400">Order reference: {order.id}</p>
      <Link to="/shop" className="mt-6 inline-block text-coral-600">Continue shopping</Link>
    </section>
  )
  if (!items.length) return <section className="mx-auto max-w-3xl px-4 py-16 text-center"><p>Your cart is empty.</p><Link to="/shop" className="mt-4 inline-block text-coral-600">Browse gifts</Link></section>

  return (
    <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl">Your cart</h1>
      <ul className="mt-6 divide-y divide-plum-100">
        {items.map(item => <li key={item.id} className="flex items-center gap-4 py-4">
          <ProductImage src={item.products?.image_url} alt={item.products?.name || ''} className="h-16 w-16 rounded-lg object-cover" />
          <div className="min-w-0 flex-1"><p className="font-medium">{item.products?.name}</p><p className="text-sm text-plum-400">${item.products?.price}</p></div>
          <input aria-label={'Quantity for ' + item.products?.name} type="number" min="1" step="1" max={item.products?.stock || 1} value={item.quantity} disabled={busy || checkout}
            onChange={e => { const qty = Number(e.target.value); if (Number.isInteger(qty) && qty > 0) change(() => updateQuantity(item.product_id, qty)) }}
            className="w-16 rounded-lg border border-plum-100 px-2 py-1 text-center" />
          <button disabled={busy || checkout} onClick={() => change(() => removeItem(item.product_id))} className="text-sm text-coral-600 disabled:opacity-50">Remove</button>
        </li>)}
      </ul>
      <div className="mt-6 flex justify-between border-t border-plum-100 pt-4"><span>Total</span><strong className="text-xl text-coral-600">${total.toFixed(2)}</strong></div>
      {!checkout ? <button disabled={busy} onClick={() => setCheckout(true)} className="mt-6 w-full rounded-full bg-plum-800 py-3 text-white">Checkout</button> : (
        <form onSubmit={placeOrder} className="admin-editor">
          <h2>Checkout</h2>
          <fieldset disabled={busy} className="grid gap-5">
            <fieldset className="grid gap-3">
              <legend className="mb-3 text-sm font-medium">How would you like to receive your order?</legend>
              <label className="flex items-center gap-3 rounded-lg border border-plum-100 p-3"><input type="radio" name="fulfillment" value="delivery" checked={form.method === 'delivery'} onChange={() => setForm({ ...form, method: 'delivery' })} /> Delivery</label>
              <label className="flex items-center gap-3 rounded-lg border border-plum-100 p-3"><input type="radio" name="fulfillment" value="pickup" checked={form.method === 'pickup'} onChange={() => setForm({ ...form, method: 'pickup' })} /> Pickup</label>
            </fieldset>
            <label className="admin-field">Full name<input required maxLength={100} autoComplete="name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></label>
            <label className="admin-field">Phone number<input required type="tel" minLength={5} maxLength={40} autoComplete="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></label>
            {form.method === 'delivery' && <label className="admin-field">Delivery address<input required minLength={5} maxLength={500} autoComplete="street-address" placeholder="Area, street, building and nearby landmark" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} /></label>}
            <fieldset><legend className="mb-2 text-sm font-medium">Payment method</legend><label className="flex items-center gap-3 rounded-lg border border-plum-100 p-3"><input type="radio" checked readOnly name="payment" /> Cash {form.method === 'delivery' ? 'on delivery' : 'on pickup'}</label></fieldset>
            <div className="admin-editor-actions"><button className="admin-save" type="submit">{busy ? 'Placing order...' : 'Place order'}</button><button type="button" onClick={() => setCheckout(false)}>Back to cart</button></div>
          </fieldset>
        </form>
      )}
    </section>
  )
}
