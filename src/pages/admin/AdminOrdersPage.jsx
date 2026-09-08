import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabaseClient'

const STATUSES = ['pending', 'paid', 'shipped', 'cancelled']

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(null)

  async function loadOrders() {
    const { data, error } = await supabase.from('orders')
      .select('*, profiles(username), order_items(*)').order('created_at', { ascending: false })
    setOrders(data || [])
    setError(error?.message || '')
    setLoading(false)
  }
  useEffect(() => { loadOrders() }, [])

  async function updateStatus(id, status) {
    setBusy(id)
    const { error } = await supabase.from('orders').update({ status }).eq('id', id)
    if (error) toast.error(error.message)
    else { toast.success('Order updated'); await loadOrders() }
    setBusy(null)
  }

  return <div>
    <h1 className="font-display text-2xl">Orders</h1>
    {error && <p role="alert" className="mt-4 text-coral-600">{error}</p>}
    {loading ? <p className="mt-6">Loading orders...</p> : !orders.length ? <p className="empty-state mt-6">No orders yet.</p> : (
      <div className="mt-6 space-y-4">{orders.map(order => (
        <article key={order.id} className="rounded-xl border border-plum-100 bg-white p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-lg">{order.customer_name || order.profiles?.username || 'Customer'}</h2>
              <p className="mt-1 break-all text-xs text-plum-400">Order {order.id}</p>
              <p className="mt-1 text-xs text-plum-400">{new Date(order.created_at).toLocaleString()}</p>
            </div>
            <label className="text-sm">Order status
              <select aria-label={'Status for order ' + order.id} disabled={busy === order.id} value={order.status} onChange={e => updateStatus(order.id, e.target.value)} className="ml-3 rounded-lg border border-plum-100 p-2">
                {STATUSES.map(status => <option key={status} value={status}>{status}</option>)}
              </select>
            </label>
          </div>
          <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
            <p><strong>Receiving: </strong>{order.fulfillment_method || 'Not specified'}</p>
            <p><strong>Payment: </strong>{order.payment_method || 'Not specified'}</p>
            <p><strong>Phone: </strong>{order.phone || 'Not provided'}</p>
            {order.fulfillment_method === 'delivery' && <p><strong>Address: </strong>{order.delivery_address}</p>}
          </div>
          <ul className="mt-4 divide-y divide-plum-50 border-t border-plum-100">
            {order.order_items?.map(item => <li key={item.id} className="flex justify-between gap-3 py-2 text-sm"><span>{item.product_name} × {item.quantity}</span><span>${(item.price * item.quantity).toFixed(2)}</span></li>)}
          </ul>
          <p className="mt-3 text-right font-semibold text-coral-600">Total: ${Number(order.total).toFixed(2)}</p>
        </article>
      ))}</div>
    )}
  </div>
}
