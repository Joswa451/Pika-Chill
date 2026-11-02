import { useState } from 'react'
import { updateAccountEmail, updateAccountPassword } from '../../features/profile/profileApi'

function AdminAccountSettings() {
  const [newEmail, setNewEmail] = useState('')
  const [emailPassword, setEmailPassword] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function changeEmail(event) {
    event.preventDefault()
    setSaving(true); setError(''); setSuccess('')
    try {
      await updateAccountEmail({ currentPassword: emailPassword, email: newEmail.trim() })
      setEmailPassword(''); setNewEmail('')
      setSuccess('Check your new email address for a confirmation link to complete the change.')
    } catch (err) { setError(err.message || 'Failed to update email.') } finally { setSaving(false) }
  }

  async function changePassword(event) {
    event.preventDefault()
    if (newPassword !== confirmPassword) { setError('The new passwords do not match.'); return }
    setSaving(true); setError(''); setSuccess('')
    try {
      await updateAccountPassword({ currentPassword, password: newPassword })
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('')
      setSuccess('Your password has been changed.')
    } catch (err) { setError(err.message || 'Failed to update password.') } finally { setSaving(false) }
  }

  return (
    <section className="max-w-3xl">
      <p className="eyebrow">Admin</p>
      <h1 className="display mt-2 text-[2.4rem]">Account settings</h1>
      <p className="mt-2 text-sm text-[#776F65]">Change the email address or password used to sign in.</p>

      <div className="mt-7 grid gap-5">
        <form onSubmit={changeEmail} className="card space-y-4 p-6 sm:p-8">
          <div><h2 className="text-lg font-semibold">Change email</h2><p className="mt-1 text-sm text-[#776F65]">We’ll send a confirmation link to your new address.</p></div>
          <label className="block"><span className="field-label">New email address</span><input type="email" value={newEmail} onChange={(event) => setNewEmail(event.target.value)} required autoComplete="email" className="field" /></label>
          <label className="block"><span className="field-label">Current password</span><input type="password" value={emailPassword} onChange={(event) => setEmailPassword(event.target.value)} required autoComplete="current-password" className="field" /></label>
          <button disabled={saving} className="btn btn-primary">{saving ? 'Saving…' : 'Update email'}</button>
        </form>

        <form onSubmit={changePassword} className="card space-y-4 p-6 sm:p-8">
          <h2 className="text-lg font-semibold">Change password</h2>
          <label className="block"><span className="field-label">Current password</span><input type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} required autoComplete="current-password" className="field" /></label>
          <label className="block"><span className="field-label">New password</span><input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} required minLength={6} autoComplete="new-password" className="field" /></label>
          <label className="block"><span className="field-label">Confirm new password</span><input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required minLength={6} autoComplete="new-password" className="field" /></label>
          <button disabled={saving} className="btn btn-primary">{saving ? 'Saving…' : 'Update password'}</button>
        </form>
        {error && <p role="alert" className="rounded-xl bg-[#F8E9E6] p-3 text-sm text-[#9F3A32]">{error}</p>}
        {success && <p role="status" className="rounded-xl bg-[#E8EDE7] p-3 text-sm text-[#2F3B33]">{success}</p>}
      </div>
    </section>
  )
}

export default AdminAccountSettings
