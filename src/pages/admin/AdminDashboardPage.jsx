import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({ products: 0, orders: 0, users: 0 })

  useEffect(() => {
    Promise.all([
      supabase.from('products').select('*', { count: 'exact', head: true }),
      supabase.from('orders').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
    ]).then(([products, orders, users]) => {
      setStats({
        products: products.count ?? 0,
        orders: orders.count ?? 0,
        users: users.count ?? 0,
      })
    })
  }, [])

  const cards = [
    { label: 'Products', value: stats.products },
    { label: 'Orders', value: stats.orders },
    { label: 'Users', value: stats.users },
  ]

  return (
    <div>
      <h1 className="font-display text-2xl text-plum-900">Overview</h1>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl border border-plum-100 bg-white p-6">
            <p className="text-sm text-plum-400">{c.label}</p>
            <p className="mt-2 font-display text-3xl text-plum-900">{c.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
