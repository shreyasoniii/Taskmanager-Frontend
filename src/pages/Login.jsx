import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { LogIn, Zap } from 'lucide-react'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const validate = () => {
    const e = {}
    if (!form.email) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.password) e.password = 'Password is required'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    try {
      await login(form.email, form.password)
      toast.success('Welcome back!')
      navigate('/dashboard')
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid credentials'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-ink-950 flex items-center justify-center px-4">
      {/* Background grid */}
      <div className="fixed inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(#b8ff57 1px, transparent 1px), linear-gradient(90deg, #b8ff57 1px, transparent 1px)', backgroundSize: '48px 48px' }} />

      <div className="w-full max-w-md animate-fadeUp">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-10 justify-center">
          <div className="w-8 h-8 bg-acid rounded-lg flex items-center justify-center">
            <Zap size={16} className="text-ink-950" strokeWidth={2.5} />
          </div>
          <span className="font-display font-700 text-xl text-ink-100 tracking-tight">TaskFlow</span>
        </div>

        <div className="glass rounded-2xl p-8">
          <h1 className="font-display text-2xl font-600 text-ink-100 mb-1">Sign in</h1>
          <p className="text-ink-300 text-sm mb-8 font-body">Welcome back. Enter your credentials.</p>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label className="block text-xs font-500 text-ink-300 mb-2 font-mono uppercase tracking-widest">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={e => { setForm(p => ({ ...p, email: e.target.value })); setErrors(p => ({ ...p, email: '' })) }}
                placeholder="you@example.com"
                className={`w-full bg-ink-800 border rounded-xl px-4 py-3 text-ink-100 text-sm placeholder-ink-600 outline-none transition-all focus:border-acid focus:ring-2 focus:ring-acid/10 ${errors.email ? 'border-rose' : 'border-ink-700'}`}
              />
              {errors.email && <p className="text-rose text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-xs font-500 text-ink-300 mb-2 font-mono uppercase tracking-widest">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={e => { setForm(p => ({ ...p, password: e.target.value })); setErrors(p => ({ ...p, password: '' })) }}
                placeholder="••••••••"
                className={`w-full bg-ink-800 border rounded-xl px-4 py-3 text-ink-100 text-sm placeholder-ink-600 outline-none transition-all focus:border-acid focus:ring-2 focus:ring-acid/10 ${errors.password ? 'border-rose' : 'border-ink-700'}`}
              />
              {errors.password && <p className="text-rose text-xs mt-1">{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-acid text-ink-950 font-display font-600 text-sm rounded-xl py-3 mt-2 transition-all hover:bg-acid-dim active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-ink-950/30 border-t-ink-950 rounded-full animate-spin" />
              ) : (
                <><LogIn size={15} strokeWidth={2.5} /> Sign in</>
              )}
            </button>
          </form>

          <p className="text-center text-ink-400 text-sm mt-6">
            No account?{' '}
            <Link to="/register" className="text-acid hover:underline font-500">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
