
const supabase = require('../../config/supabase');
const { createClient } = require('@supabase/supabase-js');

const ADMIN_EMAILS = new Set(
  (process.env.ADMIN_EMAILS || 'admin@ernesteats.com,admin@pikachill.com')
    .split(',')
    .map(email => email.trim().toLowerCase())
    .filter(Boolean)
);

function createAuthClient() {
  const url = process.env.SUPABASE_URL?.trim();
  const key = (
    process.env.SUPABASE_ANON_KEY ||
    process.env.SUPABASE_SERVICE_KEY
  )?.trim();

  if (!url || !key) {
    throw new Error('Missing Supabase URL or authentication key');
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    }
  });
}

function roleForEmail(email) {
  return ADMIN_EMAILS.has((email || '').trim().toLowerCase())
    ? 'admin'
    : 'customer';
}

async function getOrCreateProfile(user) {
  const { data: existingProfile, error: selectError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (selectError) throw new Error(selectError.message);
  if (existingProfile) return existingProfile;

  const { data, error } = await supabase
    .from('profiles')
    .insert({
      id: user.id,
      full_name: user.user_metadata?.full_name ||
        user.email?.split('@')[0] || 'User',
      contact_number: user.user_metadata?.contact_number || null,
      role: roleForEmail(user.email)
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

async function registerUser({
  email,
  password,
  fullName,
  contactNumber
}) {
  const authClient = createAuthClient();

  const { data: authData, error: authError } =
    await authClient.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: {
          full_name: fullName,
          contact_number: contactNumber
        }
      }
    });

  if (authError) throw new Error(authError.message);
  if (!authData.user) throw new Error('User registration failed');

  // Supabase may return no session when email confirmation is enabled.
  // The user profile can be created by the database trigger if configured.
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .upsert({
      id: authData.user.id,
      full_name: fullName,
      contact_number: contactNumber,
      role: 'customer'
    }, { onConflict: 'id' })
    .select()
    .single();

  if (profileError) throw new Error(profileError.message);

  return {
    user: authData.user,
    profile: profileData
  };
}

async function loginUser({ email, password }) {
  const authClient = createAuthClient();

  const { data, error } = await authClient.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password
  });

  if (error) throw new Error(error.message);

  const profile = await getOrCreateProfile(data.user);

  return {
    session: data.session,
    user: data.user,
    profile
  };
}

async function refreshUserSession(refreshToken) {
  if (!refreshToken) throw new Error('Refresh token is required');

  const authClient = createAuthClient();

  const { data, error } = await authClient.auth.refreshSession({
    refresh_token: refreshToken
  });

  if (error) throw new Error(error.message);
  if (!data.session || !data.user) throw new Error('Could not refresh session');

  const profile = await getOrCreateProfile(data.user);

  return {
    session: data.session,
    user: data.user,
    profile
  };
}

module.exports = {
  registerUser,
  loginUser,
  refreshUserSession
};
