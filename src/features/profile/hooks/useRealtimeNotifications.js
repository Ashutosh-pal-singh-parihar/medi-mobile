import { useEffect } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../../../config/supabase';
import useAuthStore from '../../../store/auth.store';
import { useLanguage } from '../../../hooks/useLanguage';

export default function useRealtimeNotifications() {
  const { user } = useAuthStore();
  const { t } = useLanguage();

  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('doctor-reviewed')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'triage_cases',
          filter: `patient_id=eq.${user.id}`,
        },
        (payload) => {
          if (
            payload.new.doctor_reviewed === true &&
            payload.old.doctor_reviewed === false
          ) {
            Alert.alert(
              t('notif_doctor_reviewed_title'),
              t('notif_doctor_reviewed_body'),
              [{ text: 'OK' }]
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  return {};
}
