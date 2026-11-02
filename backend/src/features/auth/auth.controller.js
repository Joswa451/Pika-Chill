const { registerUser, loginUser, refreshUserSession, updateAccountCredentials } = require('./auth.service')

async function register(req, res) {

  try {

    const { email, password, fullName, contactNumber } = req.body

    const { user, profile } = await registerUser({
      email,
      password,
      fullName,
      contactNumber
    })

    res.status(201).json({
      message: 'Registered successfully',
      user,
      profile
    })

  } catch (err) {

    res.status(400).json({
      error: err.message
    })

  }

}

async function login(req, res) {

  try {

    const { email, password } = req.body

    const data = await loginUser({
      email,
      password
    })

    res.status(200).json({
      message: 'Logged in',
      session: data.session,
      user: data.user,
      profile: data.profile
    })

  } catch (err) {

    res.status(401).json({
      error: err.message
    })

  }

}

async function refresh(req, res) {

  try {

    const { refreshToken } = req.body

    const data = await refreshUserSession(refreshToken)

    res.status(200).json({
      message: 'Session refreshed',
      session: data.session,
      user: data.user,
      profile: data.profile
    })

  } catch (err) {

    res.status(401).json({
      error: err.message
    })

  }

}

async function updateEmail(req, res) {
  try {
    const { currentPassword, email } = req.body
    if (!email || !String(email).trim()) return res.status(400).json({ error: 'A new email address is required' })
    const user = await updateAccountCredentials(req.user.id, {
      email: req.user.email,
      currentPassword,
      newEmail: email
    })
    res.status(200).json({ user, message: 'Check your new email address for a confirmation link.' })
  } catch (err) {
    res.status(err.message === 'Current password is incorrect' ? 401 : 400).json({ error: err.message })
  }
}

async function updatePassword(req, res) {
  try {
    const { currentPassword, password } = req.body
    if (!password || String(password).length < 6) return res.status(400).json({ error: 'New password must be at least 6 characters' })
    const user = await updateAccountCredentials(req.user.id, {
      email: req.user.email,
      currentPassword,
      newPassword: password
    })
    res.status(200).json({ user, message: 'Password updated successfully' })
  } catch (err) {
    res.status(err.message === 'Current password is incorrect' ? 401 : 400).json({ error: err.message })
  }
}

module.exports = {
  register,
  login,
  refresh,
  updateEmail,
  updatePassword
}
