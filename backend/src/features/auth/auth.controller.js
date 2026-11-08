const { registerUser, loginUser, refreshUserSession, updateAccountCredentials } = require('./auth.service')

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function noStore(res) {
  res.set('Cache-Control', 'no-store')
}

function text(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function validateRegisterBody({ email, password, fullName, contactNumber }) {
  const normalizedEmail = text(email).toLowerCase()

  if (!normalizedEmail) return 'Email address is required'
  if (!EMAIL_PATTERN.test(normalizedEmail)) return 'Enter a valid email address'
  if (typeof password !== 'string' || !password) return 'Password is required'
  if (password.length < 6) return 'Password must be at least 6 characters'
  if (password.length > 128) return 'Password is too long'

  const name = text(fullName)
  if (!name) return 'Full name is required'
  if (name.length > 100) return 'Full name is too long'

  const contact = text(contactNumber)
  if (!contact) return 'Contact number is required'
  if (contact.replace(/\D/g, '').length < 7) return 'Enter a valid contact number'

  return null
}

function validateLoginBody({ email, password }) {
  const normalizedEmail = text(email).toLowerCase()

  if (!normalizedEmail) return 'Email address is required'
  if (!EMAIL_PATTERN.test(normalizedEmail)) return 'Enter a valid email address'
  if (typeof password !== 'string' || !password) return 'Password is required'

  return null
}

async function register(req, res) {
  noStore(res)

  const validationError = validateRegisterBody(req.body || {})
  if (validationError) {
    return res.status(400).json({ error: validationError })
  }

  const { email, password, fullName, contactNumber } = req.body

  try {
    const { user, profile, session } = await registerUser({
      email: text(email),
      password,
      fullName: text(fullName),
      contactNumber: text(contactNumber)
    })

    res.status(201).json({
      message: 'Registered successfully',
      user,
      profile,
      session
    })
  } catch (err) {
    res.status(err.status || 400).json({
      error: err.message
    })
  }
}

async function login(req, res) {
  noStore(res)

  const validationError = validateLoginBody(req.body || {})
  if (validationError) {
    return res.status(400).json({ error: validationError })
  }

  const { email, password } = req.body

  try {
    const data = await loginUser({
      email: text(email),
      password
    })

    res.status(200).json({
      message: 'Logged in',
      session: data.session,
      user: data.user,
      profile: data.profile
    })
  } catch (err) {
    res.status(err.status || 401).json({
      error: err.message
    })
  }
}

async function refresh(req, res) {
  noStore(res)

  try {
    const { refreshToken } = req.body || {}

    const data = await refreshUserSession(refreshToken)

    res.status(200).json({
      message: 'Session refreshed',
      session: data.session,
      user: data.user,
      profile: data.profile
    })
  } catch (err) {
    res.status(err.status || 401).json({
      error: err.message
    })
  }
}

async function updateEmail(req, res) {
  noStore(res)

  try {
    const { currentPassword, email } = req.body || {}
    if (!email || !String(email).trim()) return res.status(400).json({ error: 'A new email address is required' })
    const user = await updateAccountCredentials(req.user.id, {
      email: req.user.email,
      currentPassword,
      newEmail: email
    })
    res.status(200).json({ user, message: 'Check your new email address for a confirmation link.' })
  } catch (err) {
    res.status(err.status || (err.message === 'Current password is incorrect' ? 401 : 400)).json({ error: err.message })
  }
}

async function updatePassword(req, res) {
  noStore(res)

  try {
    const { currentPassword, password } = req.body || {}
    if (!password || String(password).length < 6) return res.status(400).json({ error: 'New password must be at least 6 characters' })
    const user = await updateAccountCredentials(req.user.id, {
      email: req.user.email,
      currentPassword,
      newPassword: password
    })
    res.status(200).json({ user, message: 'Password updated successfully' })
  } catch (err) {
    res.status(err.status || (err.message === 'Current password is incorrect' ? 401 : 400)).json({ error: err.message })
  }
}

module.exports = {
  register,
  login,
  refresh,
  updateEmail,
  updatePassword
}
