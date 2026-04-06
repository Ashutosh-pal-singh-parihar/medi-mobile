import { supabase } from '../../../config/supabase'

export const authService = {

  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    })
    if (error) throw error
    return data
  },

  async signUp(email, password) {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
    })
    if (error) throw error
    return data
  },

  async signOut() {
    try {
      await supabase.auth.signOut()
    } catch (e) {
      console.log('signOut error:', e)
    }
  },

  async getSession() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      return session
    } catch (e) {
      console.log('getSession error:', e)
      return null
    }
  },

  async getPatientProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('patient_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()
      if (error) {
        console.log('getPatientProfile error:', error)
        return null
      }
      return data
    } catch (e) {
      console.log('getPatientProfile catch:', e)
      return null
    }
  },

  async createPatientProfile(profile) {
    const { data, error } = await supabase
      .from('patient_profiles')
      .insert(profile)
      .select()
      .single()
    if (error) throw error
    return data
  },

  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback)
  },
}
