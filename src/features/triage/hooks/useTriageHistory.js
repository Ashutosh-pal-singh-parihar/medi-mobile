import { useState, useCallback, useRef } from 'react';
import { triageService } from '../services/triage.service';
import useAuthStore from '../../../store/auth.store';
import { useTriageStore } from '../../../store/triage.store';

/**
 * useTriageHistory Hook
 * Manages fetching and storing past triage sessions for the current user.
 */
export const useTriageHistory = () => {
  const { user } = useAuthStore();
  const { pastSessions, setPastSessions, historyLoading, setHistoryLoading } = useTriageStore();
  const [error, setError] = useState(null);
  const isFetchingRef = useRef(false);

  const loading = historyLoading;
  const setLoading = setHistoryLoading;

  const fetchHistory = useCallback(async (patientId) => {
    if (!patientId || isFetchingRef.current) return;

    try {
      isFetchingRef.current = true;
      setLoading(true);
      setError(null);
      const history = await triageService.getTriageHistory(patientId);
      
      setPastSessions(history || []);
    } catch (e) {
      console.error('Error fetching triage history:', e);
      setError(e.message);
    } finally {
      isFetchingRef.current = false;
      setLoading(false);
    }
  }, [setPastSessions]);

  const refreshHistory = useCallback(async () => {
    if (user?.id) {
      await fetchHistory(user.id);
    }
  }, [user?.id, fetchHistory]);

  const loadInitialHistory = useCallback(() => {
    // If sessions are empty and we haven't successfully fetched yet
    if (user?.id && pastSessions.length === 0) {
      fetchHistory(user.id);
    }
  }, [user?.id, pastSessions.length, fetchHistory]);

  return {
    pastSessions,
    loading,
    error,
    refreshHistory,
    loadInitialHistory
  };
};
