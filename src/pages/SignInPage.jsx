import { useState } from 'react'
import { useNavigate, Link } from 'react-router'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

export default function SignInPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ identifier: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await signIn(form)
      navigate('/')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="mx-auto max-w-sm px-4 py-16 sm:px-6">
      <h1 className="font-display text-2xl text-plum-900">Welcome back</h1>
      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <input
          type="text"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          aria-label="Username or email"
          placeholder="Username or email"
          required
          value={form.identifier}
          onChange={(e) => setForm({ ...form, identifier: e.target.value })}
          className="rounded-lg border border-plum-100 px-4 py-2.5 focus:border-coral-500 focus:outline-none"
        />
        <input
          type="password"
          autoComplete="current-password"
          aria-label="Password"
          placeholder="Password"
          required
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="rounded-lg border border-plum-100 px-4 py-2.5 focus:border-coral-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-plum-800 py-2.5 font-medium text-white hover:bg-coral-500 transition-colors disabled:opacity-60"
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <p className="mt-4 text-sm text-plum-400">
        No account? <Link to="/signup" className="text-coral-500 hover:underline">Sign up</Link>
      </p>
    </section>
  )
}
