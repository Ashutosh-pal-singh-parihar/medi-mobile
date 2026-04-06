import { supabase } from '../../../config/supabase';
import { TABLES } from '../../../config/constants';

/**
 * Profile Service
 * Handles fetching and updating patient profile data.
 */
export const profileService = {
  /**
   * Fetch patient profile by ID
   */
  async getProfile(userId) {
    const { data, error } = await supabase
      .from(TABLES.PATIENT_PROFILES)
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  /**
   * Update patient profile
   */
  async updateProfile(userId, profileData) {
    const { data, error } = await supabase
      .from(TABLES.PATIENT_PROFILES)
      .update({
        ...profileData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  /**
   * Update profile avatar
   */
  async updateAvatar(userId, avatarUrl) {
    const { data, error } = await supabase
      .from(TABLES.PATIENT_PROFILES)
      .update({
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .maybeSingle();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  }
};
