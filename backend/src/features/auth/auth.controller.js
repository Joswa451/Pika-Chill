const { registerUser, loginUser, refreshUserSession } = require('./auth.service')

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

module.exports = {
  register,
  login,
  refresh
}