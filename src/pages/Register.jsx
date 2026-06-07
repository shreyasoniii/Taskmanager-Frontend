import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { UserPlus, Zap } from 'lucide-react'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.email) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.password) e.password = 'Password is required'
    else if (form.password.length < 6) e.password = 'Minimum 6 characters'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    try {
      await register(form.name, form.email, form.password)
      toast.success('Account created!')
      navigate('/dashboard')
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const field = (key, label, type = 'text', placeholder = '') => (
    <div>
      <label className="block text-xs font-500 text-ink-300 mb-2 font-mono uppercase tracking-widest">{label}</label>
      <input
        type={type}
        value={form[key]}
        onChange={e => { setForm(p => ({ ...p, [key]: e.target.value })); setErrors(p => ({ ...p, [key]: '' })) }}
        placeholder={placeholder}
        className={`w-full bg-ink-800 border rounded-xl px-4 py-3 text-ink-100 text-sm placeholder-ink-600 outline-none transition-all focus:border-acid focus:ring-2 focus:ring-acid/10 ${errors[key] ? 'border-rose' : 'border-ink-700'}`}
      />
      {errors[key] && <p className="text-rose text-xs mt-1">{errors[key]}</p>}
    </div>
  )

  return (
    <div className="min-h-screen bg-ink-950 flex items-center justify-center px-4">
      <div className="fixed inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(#b8ff57 1px, transparent 1px), linear-gradient(90deg, #b8ff57 1px, transparent 1px)', backgroundSize: '48px 48px' }} />

      <div className="w-full max-w-md animate-fadeUp">
        <div className="flex items-center gap-2 mb-10 justify-center">
          <div className="w-8 h-8 bg-acid rounded-lg flex items-center justify-center">
            <Zap size={16} className="text-ink-950" strokeWidth={2.5} />
          </div>
          <span className="font-display font-700 text-xl text-ink-100 tracking-tight">TaskFlow</span>
        </div>

        <div className="glass rounded-2xl p-8">
          <h1 className="font-display text-2xl font-600 text-ink-100 mb-1">Create account</h1>
          <p className="text-ink-300 text-sm mb-8">Get started for free.</p>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {field('name', 'Full name', 'text', 'John Doe')}
            {field('email', 'Email', 'email', 'you@example.com')}
            {field('password', 'Password', 'password', '••••••••')}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-acid text-ink-950 font-display font-600 text-sm rounded-xl py-3 mt-2 transition-all hover:bg-acid-dim active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-ink-950/30 border-t-ink-950 rounded-full animate-spin" />
              ) : (
                <><UserPlus size={15} strokeWidth={2.5} /> Create account</>
              )}
            </button>
          </form>

          <p className="text-center text-ink-400 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-acid hover:underline font-500">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
