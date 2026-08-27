import { NavLink } from 'react-router'
import { FiGrid, FiBox, FiPackage, FiUsers } from 'react-icons/fi'

const links = [
  { to: '/admin', label: 'Overview', icon: FiGrid, end: true },
  { to: '/admin/products', label: 'Products', icon: FiBox },
  { to: '/admin/orders', label: 'Orders', icon: FiPackage },
  { to: '/admin/users', label: 'Users', icon: FiUsers },
]

export default function AdminSidebar() {
  return (
    <aside className="w-56 shrink-0 border-r border-plum-100 bg-white p-4">
      <p className="mb-4 px-2 font-display text-lg text-plum-800">Admin</p>
      <nav className="flex flex-col gap-1">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-plum-800 text-white'
                  : 'text-plum-800 hover:bg-plum-50'
              }`
            }
          >
            <Icon size={16} /> {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
