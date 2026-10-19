import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { User, Lock, ArrowRight, Loader2, Sparkles } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { ALL_ROLES, ROLES, ROLE_LABELS, ROLE_DESCRIPTIONS } from '@/access/roles'
import Input from '@/shared/components/Input'
import Button from '@/shared/components/Button'

export default function LoginForm() {
  const navigate = useNavigate()
  const { signIn } = useAuth()
  const [role, setRole] = useState(ROLES.DISPATCHER)
  const [email, setEmail] = useState('test2@yopmail.com')
  const [password, setPassword] = useState('nDNRinSJ@9')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function handleRoleChange(r) {
    setRole(r)
    if (r === ROLES.DISPATCHER && (!email || email === 'admin@carline.com')) {
      setEmail('test2@yopmail.com')
      setPassword('nDNRinSJ@9')
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!email || !password) {
      setError('Enter an email and password to continue.')
      return
    }
    setLoading(true)
    try {
      // The account's real role decides the portal, not the picked pill.
      const session = await signIn({ email, password, role })
      navigate(`/${session.role}/dashboard`)
    } catch (err) {
      setError(err.message || 'Could not sign in.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      {/* Role Selection Pills */}
      <div>
        <div className="flex flex-wrap gap-2">
          {ALL_ROLES.map((r) => (
            <button
              type="button"
              key={r}
              onClick={() => handleRoleChange(r)}
              title={ROLE_DESCRIPTIONS[r]}
              className={
                'rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-150 cursor-pointer active:scale-95 ' +
                (role === r
                  ? 'bg-taxi-500 text-white shadow-xs font-bold'
                  : 'bg-surface text-text-secondary hover:bg-surface-hover hover:text-text-primary border border-border-subtle shadow-xs')
              }
            >
              {ROLE_LABELS[r]}
            </button>
          ))}
        </div>
      </div>

      {/* Username / Work Email */}
      <Input
        label="Email"
        icon={User}
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="username"
      />

      {/* Password with SHOW toggle */}
      <Input
        label="Password"
        icon={Lock}
        type={showPassword ? 'text' : 'password'}
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="current-password"
        rightElement={
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-[11px] font-bold tracking-wider text-taxi-500 hover:text-amber-600 uppercase transition-colors px-1 py-0.5 select-none"
          >
            {showPassword ? 'HIDE' : 'SHOW'}
          </button>
        }
      />

      {/* Remember me & Forgot password */}
      <div className="flex items-center justify-between text-xs pt-0.5">
        <label className="flex items-center gap-2 cursor-pointer text-text-secondary hover:text-text-primary select-none">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-4 w-4 rounded border-border-strong text-taxi-500 focus:ring-taxi-500/30 accent-taxi-500"
          />
          <span className="font-medium text-xs">Remember me</span>
        </label>
        {/* Password reset runs against /user/forgot-password, which only covers
            company-user accounts. A Super Admin signs in through /super-admin/login
            and has no self-service reset, so the link is hidden for that role. */}
        {role !== ROLES.SUPER_ADMIN && (
          <Link
            to="/forgot-password"
            className="font-medium text-taxi-500 transition-colors hover:text-amber-600"
          >
            Forgot password?
          </Link>
        )}
      </div>

      {error && (
        <div className="rounded-xl border border-signal-red/30 bg-signal-red/10 px-3.5 py-2 text-xs text-signal-red">
          {error}
        </div>
      )}

      {/* Main Sign in button */}
      <Button
        type="submit"
        className="w-full py-3 text-sm font-semibold rounded-xl bg-taxi-500 hover:bg-amber-600 text-white shadow-lg shadow-taxi-500/25 transition-all duration-200 active:scale-[0.99] flex items-center justify-center gap-2"
        disabled={loading}
      >
        {loading ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
        {loading ? 'Signing in…' : 'Sign in'}
      </Button>
    </form>
  )
}
