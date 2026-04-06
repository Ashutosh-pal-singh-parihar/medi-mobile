import { supabase } from '../../../config/supabase'
import { AMBULANCE_TABLES } from '../../../config/constants'

export const ambulanceService = {

  async createProfile(profileData) {
    const { data, error } = await supabase
      .from(AMBULANCE_TABLES.AMBULANCE_PROFILES)
      .upsert(profileData)
      .select()
      .single()
    if (error) throw error
    
    return data
  },

  async getProfile(userId) {
    const { data, error } = await supabase
      .from(AMBULANCE_TABLES.AMBULANCE_PROFILES)
      .select('*, ambulance_stats(*)')
      .eq('user_id', userId)
      .maybeSingle()
    if (error) return null
    return data
  },

  async setOnlineStatus(ambulanceId, isOnline, lat, lng) {
    const { error } = await supabase
      .from(AMBULANCE_TABLES.AMBULANCE_PROFILES)
      .update({
        is_online: isOnline,
        current_lat: lat,
        current_lng: lng,
        last_location_update: new Date().toISOString(),
      })
      .eq('id', ambulanceId)
    if (error) throw error
  },

  async updateLocation(ambulanceId, lat, lng) {
    await supabase
      .from(AMBULANCE_TABLES.AMBULANCE_PROFILES)
      .update({
        current_lat: lat,
        current_lng: lng,
        last_location_update: new Date().toISOString(),
      })
      .eq('id', ambulanceId)
  },

  async getActiveCases(ambulanceId) {
    const { data, error } = await supabase
      .from(AMBULANCE_TABLES.AMBULANCE_CASES)
      .select('*, triage_cases(detected_symptoms, ai_summary, risk_level, patient_profiles(full_name, age, gender))')
      .eq('ambulance_id', ambulanceId)
      .in('status', ['pending', 'accepted', 'en_route', 'arrived', 'transporting'])
      .order('created_at', { ascending: false })
    if (error) return []
    return data
  },

  async getPendingAlerts(ambulanceId) {
    const { data, error } = await supabase
      .from(AMBULANCE_TABLES.AMBULANCE_CASES)
      .select('*, triage_cases(detected_symptoms, ai_summary, risk_level, patient_profiles(age, gender))')
      .eq('ambulance_id', ambulanceId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
    if (error) return []
    return data
  },

  async acceptCase(caseId, ambulanceId) {
    const { error } = await supabase
      .from(AMBULANCE_TABLES.AMBULANCE_CASES)
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString(),
      })
      .eq('id', caseId)
    if (error) throw error

    // Update stats
    await supabase.rpc('increment_ambulance_stat', {
      p_ambulance_id: ambulanceId,
      p_field: 'total_accepted'
    })
  },

  async dismissCase(caseId, ambulanceId, reason) {
    const { error } = await supabase
      .from(AMBULANCE_TABLES.AMBULANCE_CASES)
      .update({
        status: 'dismissed',
        dismissed_at: new Date().toISOString(),
        dismiss_reason: reason,
      })
      .eq('id', caseId)
    if (error) throw error

    await supabase.rpc('increment_ambulance_stat', {
      p_ambulance_id: ambulanceId,
      p_field: 'total_dismissed'
    })
  },

  async updateCaseStatus(caseId, status) {
    const updateData = {
      status,
      updated_at: new Date().toISOString(),
    }
    if (status === 'arrived') updateData.arrived_at = new Date().toISOString()
    if (status === 'completed') updateData.completed_at = new Date().toISOString()

    const { error } = await supabase
      .from(AMBULANCE_TABLES.AMBULANCE_CASES)
      .update(updateData)
      .eq('id', caseId)
    if (error) throw error
  },

  async getHistory(ambulanceId) {
    const { data, error } = await supabase
      .from(AMBULANCE_TABLES.AMBULANCE_CASES)
      .select('*, triage_cases(detected_symptoms, ai_summary, risk_level)')
      .eq('ambulance_id', ambulanceId)
      .order('created_at', { ascending: false })
    if (error) return []
    return data
  },

  async getStats(ambulanceId) {
    const { data, error } = await supabase
      .from(AMBULANCE_TABLES.AMBULANCE_STATS)
      .select('*')
      .eq('ambulance_id', ambulanceId)
      .maybeSingle()
    if (error) return null
    return data
  },
}
