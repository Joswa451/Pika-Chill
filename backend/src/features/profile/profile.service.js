const supabase = require('../../config/supabase')

async function getProfile(id) {
  const { data, error } = await supabase.from('profiles').select('id, full_name, contact_number, role, created_at').eq('id', id).maybeSingle()
  if (error) throw error
  if (!data) throw new Error('Profile not found')
  return data
}

async function getCustomerProfiles() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, contact_number')
    .eq('role', 'customer')
    .order('full_name', { ascending: true })

  if (error) throw error
  return data
}

async function updateProfile(id, updates) {
  const { data, error } = await supabase.from('profiles').update(updates).eq('id', id).select('id, full_name, contact_number, role, created_at').maybeSingle()
  if (error) throw error
  if (!data) throw new Error('Profile not found')
  return data
}

module.exports = { getProfile, getCustomerProfiles, updateProfile }
