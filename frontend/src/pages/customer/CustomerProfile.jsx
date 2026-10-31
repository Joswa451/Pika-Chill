import { useCallback, useEffect, useState } from 'react'
import { getMyProfile, updateMyProfile } from '../../features/profile/profileApi'

function CustomerProfile() {
  const [form, setForm] = useState({ full_name: '', contact_number: '' })
  const [email, setEmail] = useState('')
  const [memberSince, setMemberSince] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

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
    </main>
  )
}

export default CustomerProfile
