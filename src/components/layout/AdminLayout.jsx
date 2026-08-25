import { Outlet } from 'react-router'
import AdminSidebar from './AdminSidebar'

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 bg-blush-50 p-6">
        <Outlet />
      </main>
    </div>
  )
}
