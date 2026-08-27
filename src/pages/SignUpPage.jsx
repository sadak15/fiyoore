import { useState } from 'react'
import { useNavigate, Link } from 'react-router'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

export default function SignUpPage() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '', username: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await signUp(form)
      toast.success('Account created — check your email to confirm')
      navigate('/signin')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="mx-auto max-w-sm px-4 py-16 sm:px-6">
      <h1 className="font-display text-2xl text-plum-900">Create your account</h1>
      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <input
          type="text"
          placeholder="Username"
          required
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          className="rounded-lg border border-plum-100 px-4 py-2.5 focus:border-coral-500 focus:outline-none"
        />
        <input
          type="email"
          placeholder="Email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="rounded-lg border border-plum-100 px-4 py-2.5 focus:border-coral-500 focus:outline-none"
        />
        <input
          type="password"
          placeholder="Password"
          required
          minLength={6}
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="rounded-lg border border-plum-100 px-4 py-2.5 focus:border-coral-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-plum-800 py-2.5 font-medium text-white hover:bg-coral-500 transition-colors disabled:opacity-60"
        >
          {loading ? 'Creating account…' : 'Sign up'}
        </button>
      </form>
      <p className="mt-4 text-sm text-plum-400">
        Already have an account? <Link to="/signin" className="text-coral-500 hover:underline">Sign in</Link>
      </p>
    </section>
  )
}
