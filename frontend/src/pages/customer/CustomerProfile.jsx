import { useCallback, useEffect, useState } from 'react'
import { getMyProfile, updateMyProfile, updateAccountEmail, updateAccountPassword } from '../../features/profile/profileApi'

function CustomerProfile() {
  const [form, setForm] = useState({ full_name: '', contact_number: '' })
  const [email, setEmail] = useState('')
  const [memberSince, setMemberSince] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [emailPassword, setEmailPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [passwordCurrent, setPasswordCurrent] = useState('')
  const [accountSaving, setAccountSaving] = useState(false)

  const loadProfile = useCallback(async () => {
    try {
      const profile = await getMyProfile()
      setForm({ full_name: profile.full_name || '', contact_number: profile.contact_number || '' })
      let savedUser = null
      try { savedUser = JSON.parse(sessionStorage.getItem('user') || 'null') } catch { /* ignore invalid user cache */ }
      setEmail(profile.email || savedUser?.email || '')
      setMemberSince(profile.created_at || '')
      sessionStorage.setItem('profile', JSON.stringify(profile))
      window.dispatchEvent(new Event('pikachill-profile-updated'))
    } catch (err) {
      setError(err.message || 'Failed to load your profile.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    Promise.resolve().then(loadProfile)
  }, [loadProfile])

  function retryLoad() {
    setLoading(true)
    setError('')
    loadProfile()
  }

  function change(event) { setForm((current) => ({ ...current, [event.target.name]: event.target.value })) }

  async function submit(event) {
    event.preventDefault(); setSaving(true); setError(''); setSuccess('')
    try {
      const profile = await updateMyProfile(form)
      setForm({ full_name: profile.full_name || '', contact_number: profile.contact_number || '' })
      sessionStorage.setItem('profile', JSON.stringify(profile))
      window.dispatchEvent(new Event('pikachill-profile-updated'))
      setSuccess('Your profile has been saved.')
    } catch (err) { setError(err.message) } finally { setSaving(false) }
  }

  async function submitEmail(event) {
    event.preventDefault(); setAccountSaving(true); setError(''); setSuccess('')
    try {
      const user = JSON.parse(sessionStorage.getItem('user') || 'null')
      const updatedUser = await updateAccountEmail({ currentEmail: user?.email || email, currentPassword: emailPassword, email: newEmail.trim() })
      if (updatedUser?.email) {
        setEmail(updatedUser.email)
        sessionStorage.setItem('user', JSON.stringify({ ...user, ...updatedUser }))
      }
      setEmailPassword(''); setNewEmail('')
      setSuccess('Check your new email address for a confirmation link to complete the change.')
    } catch (err) { setError(err.message || 'Failed to update email.') } finally { setAccountSaving(false) }
  }

  async function submitPassword(event) {
    event.preventDefault()
    if (newPassword !== passwordConfirmation) { setError('The new passwords do not match.'); return }
    setAccountSaving(true); setError(''); setSuccess('')
    try {
      const user = JSON.parse(sessionStorage.getItem('user') || 'null')
      await updateAccountPassword({ currentEmail: user?.email || email, currentPassword: passwordCurrent, password: newPassword })
      setPasswordCurrent(''); setNewPassword(''); setPasswordConfirmation('')
      setSuccess('Your password has been changed.')
    } catch (err) { setError(err.message || 'Failed to update password.') } finally { setAccountSaving(false) }
  }

  return (
    <main className="page-wrap min-h-[60vh] py-10 sm:py-14">
      <p className="eyebrow">Account</p>
      <h1 className="display mt-3 text-[2.6rem] text-[#211E1A]">My profile</h1>
      <p className="mt-3 text-sm text-[#776F65]">Keep your contact details up to date.</p>

      {loading ? (
        <p className="py-16 text-sm text-[#776F65]">Loading profile…</p>
      ) : error && !form.full_name ? (
        <section className="card mt-8 max-w-2xl p-6">
          <p role="alert" className="text-sm text-[#9F3A32]">{error}</p>
          <button type="button" onClick={retryLoad} className="btn btn-outline btn-sm mt-4">Try again</button>
        </section>
      ) : (
        <form onSubmit={submit} className="card mt-8 max-w-2xl space-y-5 p-6 sm:p-8">
          <label className="block">
            <span className="field-label">Full name</span>
            <input name="full_name" value={form.full_name} onChange={change} required className="field" />
          </label>

          <label className="block">
            <span className="field-label">Email address</span>
            <input value={email} readOnly className="field bg-[#F1ECE4] text-[#776F65]" />
          </label>

          <label className="block">
            <span className="field-label">Contact number</span>
            <input name="contact_number" type="tel" value={form.contact_number} onChange={change} className="field" />
          </label>

          <label className="block">
            <span className="field-label">Member since</span>
            <input
              value={memberSince ? new Date(memberSince).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
              readOnly
              className="field bg-[#F1ECE4] text-[#776F65]"
            />
          </label>

          {error && <p role="alert" className="rounded-xl bg-[#F8E9E6] p-3 text-sm text-[#9F3A32]">{error}</p>}
          {success && <p className="rounded-xl bg-[#E8EDE7] p-3 text-sm text-[#2F3B33]">{success}</p>}

          <button disabled={saving} className="btn btn-primary">{saving ? 'Saving…' : 'Save changes'}</button>
        </form>
      )}

      {!loading && !(error && !form.full_name) && (
        <div className="mt-6 grid max-w-2xl gap-6">
          <form onSubmit={submitEmail} className="card space-y-5 p-6 sm:p-8">
            <div><h2 className="text-lg font-semibold text-[#211E1A]">Change email</h2><p className="mt-1 text-sm text-[#776F65]">We’ll send a confirmation link to your new address.</p></div>
            <label className="block"><span className="field-label">New email address</span><input type="email" value={newEmail} onChange={(event) => setNewEmail(event.target.value)} required autoComplete="email" className="field" /></label>
            <label className="block"><span className="field-label">Current password</span><input type="password" value={emailPassword} onChange={(event) => setEmailPassword(event.target.value)} required autoComplete="current-password" className="field" /></label>
            <button disabled={accountSaving} className="btn btn-outline">{accountSaving ? 'Saving…' : 'Update email'}</button>
          </form>

          <form onSubmit={submitPassword} className="card space-y-5 p-6 sm:p-8">
            <div><h2 className="text-lg font-semibold text-[#211E1A]">Change password</h2></div>
            <label className="block"><span className="field-label">Current password</span><input type="password" value={passwordCurrent} onChange={(event) => setPasswordCurrent(event.target.value)} required autoComplete="current-password" className="field" /></label>
            <label className="block"><span className="field-label">New password</span><input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} required minLength={6} autoComplete="new-password" className="field" /></label>
            <label className="block"><span className="field-label">Confirm new password</span><input type="password" value={passwordConfirmation} onChange={(event) => setPasswordConfirmation(event.target.value)} required minLength={6} autoComplete="new-password" className="field" /></label>
            <button disabled={accountSaving} className="btn btn-outline">{accountSaving ? 'Saving…' : 'Update password'}</button>
          </form>
          {error && <p role="alert" className="rounded-xl bg-[#F8E9E6] p-3 text-sm text-[#9F3A32]">{error}</p>}
          {success && <p className="rounded-xl bg-[#E8EDE7] p-3 text-sm text-[#2F3B33]">{success}</p>}
        </div>
      )}
    </main>
  )
}

export default CustomerProfile
