const supabase = require('../../config/supabase');
const { createClient } = require('@supabase/supabase-js');
const { getCachedProfile, setCachedProfile } = require('./profileCache');

// Only the profile columns the frontend actually consumes are read or
// returned. This keeps the auth round trip small and avoids exposing any
// extra account columns.
const PROFILE_FIELDS = 'id, full_name, contact_number, role';

const ADMIN_EMAILS = new Set(
  (process.env.ADMIN_EMAILS || 'admin@ernesteats.com,admin@pikachill.com')
    .split(',')
    .map(email => email.trim().toLowerCase())
    .filter(Boolean)
);

function httpError(message, status = 400) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function publicUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    email: user.email ?? null
  };
}

function publicSession(session) {
  if (!session) return null;
  return {
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    expires_in: session.expires_in,
    expires_at: session.expires_at,
    token_type: session.token_type,
    user: publicUser(session.user)
  };
}

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
  const cachedProfile = getCachedProfile(user.id);
  if (cachedProfile) return cachedProfile;

  const { data: existingProfile, error: selectError } = await supabase
    .from('profiles')
    .select(PROFILE_FIELDS)
    .eq('id', user.id)
    .maybeSingle();

  if (selectError) throw httpError(selectError.message, 500);
  if (existingProfile) {
    setCachedProfile(user.id, existingProfile);
    return existingProfile;
  }

  const { data, error } = await supabase
    .from('profiles')
    .insert({
      id: user.id,
      full_name: user.user_metadata?.full_name ||
        user.email?.split('@')[0] || 'User',
      contact_number: user.user_metadata?.contact_number || null,
      role: roleForEmail(user.email)
    })
    .select(PROFILE_FIELDS)
    .single();

  if (error) throw httpError(error.message, 500);
  setCachedProfile(user.id, data);
  return data;
}

async function registerUser({
  email,
  password,
  fullName,
  contactNumber
}) {
  const authClient = createAuthClient();

  const { data: authData, error: signUpError } =
    await authClient.auth.signUp({
      email: normalizeEmail(email),
      password,
      options: {
        data: {
          full_name: fullName,
          contact_number: contactNumber
        }
      }
    });

  if (signUpError) {
    const message = signUpError.message || 'Registration failed';

    if (/already registered|already exists|user already/i.test(message)) {
      throw httpError('An account with this email already exists. Please log in instead.', 409);
    }

    if (signUpError.status === 429) {
      throw httpError('Too many attempts. Please wait a moment and try again.', 429);
    }

    throw httpError(message, 400);
  }

  if (!authData?.user) throw httpError('User registration failed', 500);

  // Supabase hides existing accounts behind an obfuscated user object when
  // email confirmation is enabled. An empty identities array means no new
  // account was created, so never touch the existing profile.
  if (Array.isArray(authData.user.identities) && authData.user.identities.length === 0) {
    throw httpError('An account with this email already exists. Please log in instead.', 409);
  }

  // Supabase may return no session when email confirmation is enabled.
  // The user profile can also be created by the database trigger if configured.
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .upsert({
      id: authData.user.id,
      full_name: fullName,
      contact_number: contactNumber,
      role: 'customer'
    }, { onConflict: 'id' })
    .select(PROFILE_FIELDS)
    .single();

  if (profileError) throw httpError(profileError.message, 500);

  setCachedProfile(authData.user.id, profileData);

  return {
    user: publicUser(authData.user),
    profile: profileData,
    session: publicSession(authData.session)
  };
}

async function loginUser({ email, password }) {
  const authClient = createAuthClient();

  const { data, error } = await authClient.auth.signInWithPassword({
    email: normalizeEmail(email),
    password
  });

  if (error) {
    if (error.status === 429) {
      throw httpError('Too many attempts. Please wait a moment and try again.', 429);
    }

    const message = /invalid login credentials/i.test(error.message || '')
      ? 'Invalid email or password.'
      : error.message || 'Invalid email or password.';

    throw httpError(message, 401);
  }

  if (!data?.user) throw httpError('Invalid email or password.', 401);

  // One indexed lookup by primary key is required so the frontend receives
  // the account role. No additional user/profile queries are made.
  const profile = await getOrCreateProfile(data.user);

  return {
    session: publicSession(data.session),
    user: publicUser(data.user),
    profile
  };
}

async function refreshUserSession(refreshToken) {
  if (!refreshToken) throw httpError('Refresh token is required', 400);

  const authClient = createAuthClient();

  const { data, error } = await authClient.auth.refreshSession({
    refresh_token: refreshToken
  });

  if (error) throw httpError(error.message, 401);
  if (!data.session || !data.user) throw httpError('Could not refresh session', 401);

  const profile = await getOrCreateProfile(data.user);

  return {
    session: publicSession(data.session),
    user: publicUser(data.user),
    profile
  };
}

async function updateAccountCredentials(userId, { email, currentPassword, newEmail, newPassword }) {
  if (!email || !currentPassword) throw httpError('Email and current password are required', 400)
  if (!newEmail && !newPassword) throw httpError('Provide a new email or password', 400)

  const authClient = createAuthClient()
  const { data: signInData, error: signInError } = await authClient.auth.signInWithPassword({
    email: normalizeEmail(email),
    password: currentPassword
  })
  if (signInError) throw httpError('Current password is incorrect', 401)
  if (signInData.user?.id !== userId) throw httpError('Credentials do not match the signed-in account', 401)

  const updates = {}
  if (newEmail) updates.email = normalizeEmail(newEmail)
  if (newPassword) updates.password = newPassword
  const { data, error } = await authClient.auth.updateUser(updates)
  if (error) throw httpError(error.message, 400)
  return publicUser(data.user)
}

module.exports = {
  registerUser,
  loginUser,
  refreshUserSession,
  updateAccountCredentials
};
