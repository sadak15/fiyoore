import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

const STATUSES = ['pending', 'paid', 'shipped', 'cancelled']

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([])

  const loadOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select('*, profiles(username)')
      .order('created_at', { ascending: false })
    setOrders(data ?? [])
  }

  useEffect(() => {
    loadOrders()
  }, [])

  const updateStatus = async (id, status) => {
    await supabase.from('orders').update({ status }).eq('id', id)
    loadOrders()
  }

  return (
    <div>
      <h1 className="font-display text-2xl text-plum-900">Orders</h1>
      <table className="mt-6 w-full text-left text-sm">
        <thead>
          <tr className="border-b border-plum-100 text-plum-400">
            <th className="py-2">Customer</th>
            <th className="py-2">Total</th>
            <th className="py-2">Status</th>
            <th className="py-2">Placed</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id} className="border-b border-plum-50">
              <td className="py-2 text-plum-900">{o.profiles?.username ?? '—'}</td>
              <td className="py-2">${o.total}</td>
              <td className="py-2">
                <select
                  value={o.status}
                  onChange={(e) => updateStatus(o.id, e.target.value)}
                  className="rounded-lg border border-plum-100 px-2 py-1"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </td>
              <td className="py-2 text-plum-400">{new Date(o.created_at).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
