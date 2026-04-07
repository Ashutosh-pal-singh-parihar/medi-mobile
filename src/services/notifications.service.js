import { supabase } from '../config/supabase';

/**
 * Notifications Service
 * Handles doctor responses, appointments, and realtime updates.
 */
export const notificationsService = {
  /**
   * Get doctor actions for a specific case
   */
  async getDoctorActionsForCase(caseId) {
    try {
      const { data, error } = await supabase
        .from('doctor_actions')
        .select(`
          *,
          doctor:doctor_id (
            full_name,
            specialization,
            hospital_name
          )
        `)
        .eq('case_id', caseId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) return null;
      return data;
    } catch {
      return null;
    }
  },

  /**
   * Get appointment for a case
   */
  async getAppointmentForCase(caseId) {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('case_id', caseId)
        .eq('status', 'scheduled')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) return null;
      return data;
    } catch {
      return null;
    }
  },

  /**
   * Subscribe to realtime updates for a patient's cases
   * Returns unsubscribe function
   */
  subscribeToPatientCaseUpdates(patientId, onUpdate) {
    const channel = supabase
      .channel(`patient-cases-${patientId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'triage_cases',
          filter: `patient_id=eq.${patientId}`
        },
        (payload) => {
          onUpdate({ type: 'case_update', data: payload.new });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'doctor_actions'
        },
        (payload) => {
          // Filter manually since we can't filter doctor_actions by patient_id directly in PG filter
          onUpdate({ type: 'doctor_action', data: payload.new });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'appointments'
        },
        (payload) => {
          onUpdate({ type: 'appointment', data: payload.new });
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }
};
