import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../features/auth/useAuth'

function AuthPage() {
  const { login, register, loading, error } = useAuth()
  const navigate = useNavigate()

  const [isLogin, setIsLogin] = useState(true)
  const [form, setForm] = useState({
    email: '',
    password: '',
    fullName: '',
    contactNumber: '',
  })
  const [result, setResult] = useState(null)

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    })
  }

  function switchMode(loginMode) {
    setIsLogin(loginMode)
    setResult(null)
  }

  async function handleSubmit(e) {
    e.preventDefault()

    try {
      if (isLogin) {
        const data = await login(form)
        const role = data?.profile?.role

        if (role === 'customer') {
          navigate('/customer', { replace: true })
          return
        }
        if (role === 'admin') {
          navigate('/admin', { replace: true })
          return
        }

        return
      }

      await register(form)
      setIsLogin(true)
      setForm({
        email: '',
        password: '',
        fullName: '',
        contactNumber: '',
      })
    } catch {
      // Error is handled by useAuth.
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
          <p className="mt-2 text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-[#B25F6C]">Reservations · Delivery · Takeout</p>
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

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="field-label">Full name</label>
                <input
                  name="fullName"
                  value={form.fullName}
                  placeholder="Enter your full name"
                  onChange={handleChange}
                  required
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
                className="field"
              />
            </div>

            {error && (
              <div className="rounded-xl border border-[#E6C3BE] bg-[#F8E9E6] px-4 py-3 text-sm text-[#9F3A32]">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn btn-primary mt-2 w-full py-3.5">
              {loading
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

        <p className="mt-6 text-center text-[0.68rem] text-[#948B7F]">Reservations · In-store pickup · Delivery · Outdoor seating · Takeout</p>
      </main>
    </div>
  )
}

export default AuthPage
