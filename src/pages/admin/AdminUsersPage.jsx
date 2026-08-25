import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function AdminUsersPage() {
  const [users, setUsers] = useState([])

  const loadUsers = async () => {
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
    setUsers(data ?? [])
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const toggleRole = async (user) => {
    const role = user.role === 'admin' ? 'user' : 'admin'
    await supabase.from('profiles').update({ role }).eq('id', user.id)
    loadUsers()
  }

  return (
    <div>
      <h1 className="font-display text-2xl text-plum-900">Users</h1>
      <table className="mt-6 w-full text-left text-sm">
        <thead>
          <tr className="border-b border-plum-100 text-plum-400">
            <th className="py-2">Username</th>
            <th className="py-2">Role</th>
            <th className="py-2"></th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-b border-plum-50">
              <td className="py-2 text-plum-900">@{u.username}</td>
              <td className="py-2 capitalize">{u.role}</td>
              <td className="py-2 text-right">
                <button onClick={() => toggleRole(u)} className="text-plum-600 hover:underline">
                  {u.role === 'admin' ? 'Revoke admin' : 'Make admin'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
