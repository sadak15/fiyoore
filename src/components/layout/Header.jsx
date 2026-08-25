import { Link } from 'react-router'
import { FiShoppingBag, FiUser } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'

export default function Header() {
  const { user, profile, isAdmin, signOut } = useAuth()
  const { items } = useCart()

  return (
    <header className="sticky top-0 z-20 border-b border-plum-100 bg-blush-50/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/" className="font-display text-xl font-semibold text-plum-800">
          Fiyoore <span className="text-coral-500">Gifts</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-plum-800 sm:flex">
          <Link to="/shop" className="hover:text-coral-500">Shop</Link>
          {isAdmin && (
            <Link to="/admin" className="hover:text-coral-500">Dashboard</Link>
          )}
        </nav>

        <div className="flex items-center gap-4">
          <Link to="/cart" className="relative text-plum-800 hover:text-coral-500">
            <FiShoppingBag size={22} />
            {items.length > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-coral-500 text-xs font-semibold text-white">
                {items.length}
              </span>
            )}
          </Link>

          {user ? (
            <div className="flex items-center gap-3">
              <Link
                to={`/u/${profile?.username ?? ''}`}
                className="flex items-center gap-1 text-sm font-medium text-plum-800 hover:text-coral-500"
              >
                <FiUser /> {profile?.username ?? 'Profile'}
              </Link>
              <button
                onClick={signOut}
                className="rounded-full border border-plum-600 px-3 py-1 text-sm font-medium text-plum-600 hover:bg-plum-600 hover:text-white transition-colors"
              >
                Sign out
              </button>
            </div>
          ) : (
            <Link
              to="/signin"
              className="rounded-full bg-plum-800 px-4 py-1.5 text-sm font-medium text-white hover:bg-plum-600 transition-colors"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
