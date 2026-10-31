const supabase = require('../../config/supabase')
const { createClient } = require('@supabase/supabase-js')

const ADMIN_EMAILS = new Set(
  (process.env.ADMIN_EMAILS || 'admin@ernesteats.com,admin@pikachill.com')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
)

function createAuthClient() {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
      }
    }
  )
}

function defaultFullName(user) {
  return user.user_metadata?.full_name || user.email?.split('@')[0] || 'Pika-Chill user'
}

function roleForEmail(email) {
  return ADMIN_EMAILS.has((email || '').toLowerCase()) ? 'admin' : 'customer'
}

async function getOrCreateProfile(user) {
  const { data: existingProfile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  if (profileError) throw new Error(profileError.message)
  if (existingProfile) return existingProfile

  const { data: createdProfile, error: createError } = await supabase
    .from('profiles')
    .insert({
      id: user.id,
      full_name: defaultFullName(user),
      contact_number: user.user_metadata?.contact_number || null,
      role: roleForEmail(user.email)
    })
    .select()
    .single()

  if (!createError) return createdProfile

  const { data: racedProfile, error: racedError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  if (!racedError && racedProfile) return racedProfile
  throw new Error(createError.message)
}

async function registerUser({ email, password, fullName, contactNumber }) {
  const authClient = createAuthClient()

  const { data: authData, error: authError } = await authClient.auth.signUp({
    email,
    password
  })

  if (authError) throw new Error(authError.message)

  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: authData.user.id,
      full_name: fullName,
      contact_number: contactNumber,
      role: 'customer'
    })
    .select()
    .single()

  if (profileError) throw new Error(profileError.message)

  return {
    user: authData.user,
    profile: profileData
  }
}

async function loginUser({ email, password }) {
  const authClient = createAuthClient()

  const { data, error } = await authClient.auth.signInWithPassword({
    email,
    password
  })

  if (error) throw new Error(error.message)

  const profileData = await getOrCreateProfile(data.user)

  return {
    session: data.session,
    user: data.user,
    profile: profileData
  }
}

module.exports = { registerUser, loginUser }