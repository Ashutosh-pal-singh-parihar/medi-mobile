import { supabase } from '../../../config/supabase';
import { TABLES } from '../../../config/constants';

/**
 * Triage Service
 * Handles database operations for triage sessions and history.
 */
export const triageService = {
  /**
   * Fetch all past triage sessions for a patient
   */
  async getTriageHistory(patientId) {
    const { data, error } = await supabase
      .from(TABLES.TRIAGE_CASES)
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Fetch a single triage session by ID
   */
  async getTriageSession(sessionId) {
    const { data, error } = await supabase
      .from(TABLES.TRIAGE_CASES)
      .select('*')
      .eq('id', sessionId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  /**
   * Create a new triage session record
   */
  async createTriageSession(patientId, initialData = {}) {
    console.log('[TriageService] Attempting to create session for patientId:', patientId);
    
    // Safety check: ensure patient_id is present
    if (!patientId) throw new Error('patient_id is required');

    const { data, error } = await supabase
      .from(TABLES.TRIAGE_CASES)
      .insert({
        patient_id: patientId,
        risk_level: 'LOW',
        messages: [],
        ...initialData
      })
      .select()
      .single();

    if (error) {
      console.error('[TriageService] Insert Error:', error);
      if (error.code === '42501') {
        console.warn('RLS Policy Violation detected in TriageService');
      }
      throw error;
    }
    return data;
  },

  /**
   * Update an existing triage session
   */
  async updateTriageSession(sessionId, updateData) {
    const { data, error } = await supabase
      .from(TABLES.TRIAGE_CASES)
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', sessionId)
      .select()
      .maybeSingle();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  },

  /**
   * Delete a triage session record
   */
  async deleteTriageSession(sessionId) {
    const { error } = await supabase
      .from(TABLES.TRIAGE_CASES)
      .delete()
      .eq('id', sessionId);

    if (error) throw error;
    return true;
  },

  /**
   * Get list of available doctors for sharing reports
   */
  async getDoctors() {
    const { data, error } = await supabase
      .from(TABLES.DOCTOR_PROFILES)
      .select('*')
      .order('full_name', { ascending: true });

    if (error) {
      console.warn('[TriageService] Fetching doctors error:', error.message);
      return [];
    }
    
    // Map hospital_name to hospital for UI compatibility
    return (data || []).map(doc => ({
      ...doc,
      hospital: doc.hospital_name || 'Hospital',
      specialty: doc.specialty || 'General Practitioner'
    }));
  }
};
