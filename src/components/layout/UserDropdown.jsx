import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { FiUser, FiChevronDown, FiShoppingBag, FiGrid, FiEdit2, FiLogOut } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'

export default function UserDropdown() {
  const { user, profile, isAdmin, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const root = useRef(null)
  const trigger = useRef(null)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => { setOpen(false) }, [location])
  useEffect(() => {
    if (!open) return
    function outside(event) { if (!root.current?.contains(event.target)) setOpen(false) }
    function escape(event) {
      if (event.key === 'Escape') { setOpen(false); trigger.current?.focus() }
    }
    document.addEventListener('pointerdown', outside)
    document.addEventListener('keydown', escape)
    return () => {
      document.removeEventListener('pointerdown', outside)
      document.removeEventListener('keydown', escape)
    }
  }, [open])

  async function logout() {
    setBusy(true)
    try { await signOut(); setOpen(false); navigate('/') }
    catch (error) { toast.error(error.message) }
    finally { setBusy(false) }
  }

  return (
    <div className="user-dropdown" ref={root} onBlur={event => {
      if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false)
    }}>
      <button ref={trigger} className="user-dropdown-trigger" aria-label="User options" aria-expanded={open} aria-controls="user-options" onClick={() => setOpen(value => !value)}>
        <FiUser size={21} /><FiChevronDown size={13} />
      </button>
      {open && <div id="user-options" className="user-dropdown-panel">
        {user && <div className="user-dropdown-heading">{profile?.username || 'My account'}</div>}
        <Link to="/shop"><FiShoppingBag /> Shop</Link>
        {user ? <>
          {profile?.username && <Link to={'/u/' + encodeURIComponent(profile.username)}><FiUser /> My profile</Link>}
          <Link to="/account/profile"><FiEdit2 /> Edit profile</Link>
          {isAdmin && <Link to="/admin"><FiGrid /> Dashboard</Link>}
          <button className="user-dropdown-signout" disabled={busy} onClick={logout}><FiLogOut /> {busy ? 'Signing out...' : 'Sign out'}</button>
        </> : <Link to="/signin"><FiUser /> Sign in</Link>}
      </div>}
    </div>
  )
}
