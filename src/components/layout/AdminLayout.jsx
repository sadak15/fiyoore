import { Outlet } from 'react-router'
import AdminSidebar from './AdminSidebar'

export default function AdminLayout() {
  return (
    <div className="admin-shell flex min-h-screen">
      <AdminSidebar />
      <main className="min-w-0 flex-1 bg-blush-50 p-4 sm:p-6">
        <Outlet />
      </main>
    </div>
  )
}
