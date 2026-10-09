import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, ArrowLeft, ShieldCheck, KeyRound, Loader2, CheckCircle2 } from 'lucide-react'
import Input from '@/shared/components/Input'
import Button from '@/shared/components/Button'
import { isValidEmail } from '@/shared/utils/validation'
import {
  requestPasswordOtp,
  verifyPasswordOtp,
  resendPasswordOtp,
  resetPassword,
} from '../services/authApi'

// A company owner is emailed a temporary password when a Super Admin registers
// their company. They replace it in three steps, each one API call:
//   email -> emailed OTP -> new password.
// The server only allows the next step once the previous one succeeded, so the
// wizard never lets the user skip ahead.

const STEP = {
  EMAIL: 'email',
  OTP: 'otp',
  PASSWORD: 'password',
  DONE: 'done',
}

const HEADINGS = {
  [STEP.EMAIL]: {
    title: 'Reset your password',
    subtitle: 'Enter your work email and we will send you a 6-digit code.',
  },
  [STEP.OTP]: {
    title: 'Enter the code',
    subtitle: 'We emailed you a 6-digit code. It expires shortly, so use it soon.',
  },
  [STEP.PASSWORD]: {
    title: 'Choose a new password',
    subtitle: 'Set a new password, then sign in with it.',
  },
  [STEP.DONE]: {
    title: 'Password updated',
    subtitle: 'Your new password is active. Sign in to continue.',
  },
}

const RESEND_COOLDOWN_SECONDS = 30
const MIN_PASSWORD_LENGTH = 8
const OTP_LENGTH = 6

export default function ForgotPassword() {
  const navigate = useNavigate()

  const [step, setStep] = useState(STEP.EMAIL)
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  // Run the "resend code" cooldown down one second at a time.
  useEffect(() => {
    if (cooldown <= 0) return undefined
    const timer = setTimeout(() => setCooldown((seconds) => seconds - 1), 1000)
    return () => clearTimeout(timer)
  }, [cooldown])

  const heading = HEADINGS[step]

  function goBackToEmail() {
    setStep(STEP.EMAIL)
    setOtp('')
    setCooldown(0)
    setError('')
    setNotice('')
  }

  // Step 1: ask the API to email the OTP.
  async function handleRequestOtp(event) {
    event.preventDefault()
    const value = email.trim()
    if (!isValidEmail(value)) {
      setError('Enter a valid email address.')
      return
    }

    setError('')
    setNotice('')
    setLoading(true)
    try {
      await requestPasswordOtp(value)
      setEmail(value)
      setOtp('')
      setStep(STEP.OTP)
      setCooldown(RESEND_COOLDOWN_SECONDS)
    } catch (err) {
      setError(err.message || 'Could not send the code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Step 2: exchange the OTP for permission to set a new password.
  async function handleVerifyOtp(event) {
    event.preventDefault()
    const code = otp.trim()
    if (code.length !== OTP_LENGTH) {
      setError('Enter the ' + OTP_LENGTH + '-digit code from your email.')
      return
    }

    setError('')
    setNotice('')
    setLoading(true)
    try {
      await verifyPasswordOtp({ email, otp: code })
      setPassword('')
      setConfirmPassword('')
      setStep(STEP.PASSWORD)
    } catch (err) {
      setError(err.message || 'That code could not be verified. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Step 3: store the new password, then send the user to sign in with it.
  async function handleResetPassword(event) {
    event.preventDefault()
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError('Use at least ' + MIN_PASSWORD_LENGTH + ' characters for your new password.')
      return
    }
    if (password !== confirmPassword) {
      setError('The two passwords do not match.')
      return
    }

    setError('')
    setNotice('')
    setLoading(true)
    try {
      await resetPassword({ email, password, confirmPassword })
      setStep(STEP.DONE)
    } catch (err) {
      setError(err.message || 'Could not reset your password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    if (cooldown > 0 || resending) return
    setError('')
    setNotice('')
    setResending(true)
    try {
      await resendPasswordOtp(email)
      setNotice('A new code is on its way.')
      setCooldown(RESEND_COOLDOWN_SECONDS)
    } catch (err) {
      setError(err.message || 'Could not resend the code. Please try again.')
    } finally {
      setResending(false)
    }
  }

  const showPasswordToggle = (
    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      className="px-1 py-0.5 text-[11px] font-bold tracking-wider text-taxi-500 uppercase transition-colors select-none hover:text-amber-600"
    >
      {showPassword ? 'HIDE' : 'SHOW'}
    </button>
  )

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {step === STEP.OTP ? (
          <button
            type="button"
            onClick={goBackToEmail}
            className="mb-6 inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary"
          >
            <ArrowLeft size={14} /> Use a different email
          </button>
        ) : (
          <Link
            to="/login"
            className="mb-6 inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary"
          >
            <ArrowLeft size={14} /> Back to sign in
          </Link>
        )}

        <h1 className="font-display text-xl font-semibold text-text-primary">{heading.title}</h1>
        <p className="mb-6 mt-1 text-sm text-text-muted">{heading.subtitle}</p>

        {step === STEP.OTP && (
          <p className="mb-4 text-xs text-text-secondary">
            Code sent to <span className="font-semibold text-text-primary">{email}</span>
          </p>
        )}

        {step === STEP.EMAIL && (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <Input
              label="Work email"
              icon={Mail}
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="username"
            />
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? 'Sending code...' : 'Send code'}
            </Button>
          </form>
        )}

        {step === STEP.OTP && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <Input
              label="Verification code"
              icon={ShieldCheck}
              inputMode="numeric"
              placeholder="000000"
              maxLength={OTP_LENGTH}
              value={otp}
              onChange={(event) => setOtp(event.target.value.replace(/[^0-9]/g, ''))}
              autoComplete="one-time-code"
              className="text-center text-lg font-semibold tracking-[0.4em]"
            />
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? 'Verifying...' : 'Verify code'}
            </Button>
            <button
              type="button"
              onClick={handleResend}
              disabled={cooldown > 0 || resending}
              className="w-full text-center text-xs text-text-muted transition-colors hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-60"
            >
              {cooldown > 0 ? 'Resend code in ' + cooldown + 's' : resending ? 'Resending...' : 'Resend code'}
            </button>
          </form>
        )}

        {step === STEP.PASSWORD && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <Input
              label="New password"
              icon={KeyRound}
              type={showPassword ? 'text' : 'password'}
              placeholder="New password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
              rightElement={showPasswordToggle}
            />
            <Input
              label="Confirm new password"
              icon={KeyRound}
              type={showPassword ? 'text' : 'password'}
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
            />
            <p className="text-xs text-text-muted">
              Use at least {MIN_PASSWORD_LENGTH} characters.
            </p>
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? 'Updating...' : 'Update password'}
            </Button>
          </form>
        )}

        {step === STEP.DONE && (
          <div className="space-y-4">
            <div className="flex items-start gap-2.5 rounded-lg border border-signal-green/25 bg-signal-green/10 px-4 py-3 text-sm text-signal-green">
              <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
              <span>Your password has been changed. You can sign in with it now.</span>
            </div>
            <Button type="button" className="w-full" size="lg" onClick={() => navigate('/login')}>
              Sign in
            </Button>
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-lg border border-signal-red/30 bg-signal-red/10 px-3.5 py-2 text-xs text-signal-red">
            {error}
          </div>
        )}

        {notice && !error && (
          <div className="mt-4 rounded-lg border border-signal-green/25 bg-signal-green/10 px-3.5 py-2 text-xs text-signal-green">
            {notice}
          </div>
        )}
      </div>
    </div>
  )
}