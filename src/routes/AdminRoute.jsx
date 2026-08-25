import { Navigate, Outlet } from 'react-router'
import { useAuth } from '../context/AuthContext'

export default function AdminRoute() {
  const { user, isAdmin, loading } = useAuth()

  if (loading) return null
  if (!user) return <Navigate to="/signin" replace />
  if (!isAdmin) return <Navigate to="/" replace />
  return <Outlet />
}
