import { useState, useCallback, useEffect } from 'react';
import useAuthStore from '../../../store/auth.store';
import { profileService } from '../services/profile.service';

/**
 * usePatientProfile Hook
 * Provides logic for fetching and updating patient profile data.
 */
export const usePatientProfile = () => {
  const { user, patientProfile, setPatientProfile } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Refetch profile from Supabase
   */
  const refetchProfile = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await profileService.getProfile(user.id);
      setPatientProfile(data);
      setError(null);
    } catch (e) {
      // Silencing for cleaner logs
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [user, setPatientProfile]);

  /**
   * Update profile data
   */
  const updateProfile = useCallback(async (profileData) => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await profileService.updateProfile(user.id, profileData);
      setPatientProfile(data);
      setError(null);
      return data;
    } catch (e) {
      // Silencing for cleaner logs
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [user, setPatientProfile]);

  /**
   * Toggle Language
   */
  const toggleLanguage = useCallback(async () => {
    const nextLang = patientProfile?.language === 'hi' ? 'en' : 'hi';
    await updateProfile({ language: nextLang });
  }, [patientProfile, updateProfile]);

  return { loading, error, refetchProfile, updateProfile, toggleLanguage };
};
