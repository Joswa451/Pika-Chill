const supabase = require('../config/supabase')

async function requireAdmin(req, res, next) {
  if (!req.user?.id) {
    return res.status(401).json({ error: 'Authentication is required' })
  }

  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', req.user.id)
      .maybeSingle()

    if (error || !profile) {
      return res.status(403).json({ error: 'Profile not found' })
    }

    if (profile.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' })
    }

    next()
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}

module.exports = requireAdmin