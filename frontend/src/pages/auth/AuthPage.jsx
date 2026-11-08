import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../features/auth/useAuth'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function AuthPage() {
  const { login, register, loading, error, clearError } = useAuth()
  const navigate = useNavigate()

  const [isLogin, setIsLogin] = useState(true)
  const [form, setForm] = useState({
    email: '',
    password: '',
    fullName: '',
    contactNumber: '',
  })
  const [result, setResult] = useState(null)
  const [formError, setFormError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const submittingRef = useRef(false)

  const busy = loading || submitting
  const displayError = formError || error

  function handleChange(e) {
    const { name, value } = e.target
    setForm((current) => ({
      ...current,
      [name]: value,
    }))
    if (formError) setFormError('')
    if (error) clearError()
  }

  function switchMode(loginMode) {
    setIsLogin(loginMode)
    setResult(null)
    setFormError('')
    setSuccess('')
    clearError()
  }

  function validateForm() {
    const email = form.email.trim()

    if (!email) return 'Enter your email address.'
    if (!EMAIL_PATTERN.test(email)) return 'Enter a valid email address.'
    if (!form.password) return 'Enter your password.'

    if (!isLogin) {
      if (!form.fullName.trim()) return 'Enter your full name.'
      if (!form.contactNumber.trim()) return 'Enter your contact number.'
      if (form.contactNumber.replace(/\D/g, '').length < 7) return 'Enter a valid contact number.'
      if (form.password.length < 6) return 'Password must be at least 6 characters.'
    }

    return ''
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (submittingRef.current) return

    const validationError = validateForm()
    if (validationError) {
      setFormError(validationError)
      return
    }

    submittingRef.current = true
    setSubmitting(true)
    setFormError('')
    setSuccess('')

    try {
      if (isLogin) {
        const data = await login({
          ...form,
          email: form.email.trim(),
        })
        const role = data?.profile?.role

        if (role === 'customer') {
          navigate('/customer', { replace: true })
          return
        }
        if (role === 'admin') {
          navigate('/admin', { replace: true })
          return
        }

        setSuccess('Logged in successfully.')
        return
      }

      const data = await register({
        ...form,
        email: form.email.trim(),
        fullName: form.fullName.trim(),
        contactNumber: form.contactNumber.trim(),
      })
      const role = data?.profile?.role

      if (data?.session && role) {
        navigate(role === 'admin' ? '/admin' : '/customer', { replace: true })
        return
      }

      setIsLogin(true)
      setForm({
        email: form.email.trim(),
        password: '',
        fullName: '',
        contactNumber: '',
      })
      setSuccess('Account created successfully. Please log in with your new password.')
    } catch {
      // Error is handled by useAuth.
    } finally {
      submittingRef.current = false
      setSubmitting(false)
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#F6F3ED] px-5 py-10">
      <div className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-[#F6E7E9] blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-[#EDE8DF] blur-3xl" />

      <main className="relative z-10 w-full max-w-[420px]">
        <div className="mb-8 flex flex-col items-center text-center">
          <img src="/logo/new-logo.jpg" alt="Pika-Chill" className="h-20 w-20 rounded-full border border-[#E2DBD0] object-cover shadow-sm" />
          <h1 className="display mt-5 text-[2.4rem] leading-none text-[#211E1A]">Pika-Chill</h1>
        </div>

        <div className="rounded-[1.4rem] border border-[#E2DBD0] bg-[#FFFDF9] p-6 shadow-[0_24px_60px_rgba(33,30,26,.08)] sm:p-8">
          <div className="mb-7 flex rounded-full border border-[#E2DBD0] bg-[#F1ECE4] p-1">
            <button
              type="button"
              onClick={() => switchMode(true)}
              className={`flex-1 rounded-full py-2.5 text-[0.78rem] font-semibold transition ${isLogin ? 'bg-[#211E1A] text-[#FFFDF9] shadow-sm' : 'text-[#776F65] hover:text-[#211E1A]'}`}
            >
              Log in
            </button>
            <button
              type="button"
              onClick={() => switchMode(false)}
              className={`flex-1 rounded-full py-2.5 text-[0.78rem] font-semibold transition ${!isLogin ? 'bg-[#211E1A] text-[#FFFDF9] shadow-sm' : 'text-[#776F65] hover:text-[#211E1A]'}`}
            >
              Create account
            </button>
          </div>

          <div className="mb-6">
            <h2 className="display text-[1.7rem] text-[#211E1A]">
              {isLogin ? 'Welcome back.' : 'Join Pika-Chill.'}
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#776F65]">
              {isLogin
                ? 'Log in to continue ordering your favorites.'
                : 'Create an account to order ahead for pickup.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {!isLogin && (
              <div>
                <label className="field-label">Full name</label>
                <input
                  name="fullName"
                  value={form.fullName}
                  placeholder="Enter your full name"
                  onChange={handleChange}
                  required
                  autoComplete="name"
                  className="field"
                />
              </div>
            )}

            <div>
              <label className="field-label">Email address</label>
              <input
                name="email"
                type="email"
                value={form.email}
                placeholder="you@gmail.com"
                onChange={handleChange}
                required
                autoComplete="email"
                autoCapitalize="none"
                spellCheck={false}
                className="field"
              />
            </div>

            {!isLogin && (
              <div>
                <label className="field-label">Contact number</label>
                <input
                  name="contactNumber"
                  type="tel"
                  value={form.contactNumber}
                  placeholder="0917 000 0000"
                  onChange={handleChange}
                  required
                  autoComplete="tel"
                  className="field"
                />
              </div>
            )}

            <div>
              <label className="field-label">Password</label>
              <input
                name="password"
                type="password"
                value={form.password}
                placeholder={isLogin ? 'Enter your password' : 'Create a password'}
                onChange={handleChange}
                required
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                className="field"
              />
            </div>

            {displayError && (
              <div role="alert" className="rounded-xl border border-[#E6C3BE] bg-[#F8E9E6] px-4 py-3 text-sm text-[#9F3A32]">
                {displayError}
              </div>
            )}

            {success && (
              <div role="status" className="rounded-xl border border-[#C9D6C9] bg-[#E8EDE7] px-4 py-3 text-sm text-[#2F3B33]">
                {success}
              </div>
            )}

            <button type="submit" disabled={busy} aria-busy={busy} className="btn btn-primary mt-2 w-full py-3.5">
              {busy
                ? 'Please wait...'
                : isLogin
                  ? 'Log in'
                  : 'Create account'}
            </button>
          </form>

          {result && (
            <pre className="mt-4 max-h-32 overflow-x-auto rounded-xl bg-[#F1ECE4] p-3 text-xs text-[#3D3832]">
              {JSON.stringify(result, null, 2)}
            </pre>
          )}

          <p className="mt-6 text-center text-[0.72rem] leading-5 text-[#948B7F]">
            {isLogin ? (
              <>
                New here?{' '}
                <button type="button" onClick={() => switchMode(false)} className="font-semibold text-[#B25F6C] hover:underline">
                  Create an account
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button type="button" onClick={() => switchMode(true)} className="font-semibold text-[#B25F6C] hover:underline">
                  Log in
                </button>
              </>
            )}
          </p>
        </div>
      </main>
    </div>
  )
}

export default AuthPage
