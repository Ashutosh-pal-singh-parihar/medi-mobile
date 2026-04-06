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

  async signUp(email, password, metadata = {}) {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: metadata,
      },
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

  async getDoctorProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('doctor_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()
      if (error) {
        console.log('getDoctorProfile error:', error)
        return null
      }
      return data
    } catch (e) {
      console.log('getDoctorProfile catch:', e)
      return null
    }
  },

  async createPatientProfile(profile) {
    const { data, error } = await supabase
      .from('patient_profiles')
      .upsert(profile)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async createDoctorProfile(profile) {
    const { data, error } = await supabase
      .from('doctor_profiles')
      .upsert(profile)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async getUserRole(userId) {
    try {
      const { data, error } = await supabase
        .from('app_users')
        .select('role')
        .eq('id', userId)
        .maybeSingle()
      if (error) return null
      return data?.role || null
    } catch (e) {
      return null
    }
  },

  async setUserRole(userId, role) {
    const { error } = await supabase
      .from('app_users')
      .upsert({ id: userId, role })
    if (error) throw error
  },

  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback)
  },
}
