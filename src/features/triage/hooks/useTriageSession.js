import { useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useTriageStore } from '../../../store/triage.store';
import useAuthStore from '../../../store/auth.store';
import { aiService } from '../services/ai.service';
import { triageService } from '../services/triage.service';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import { supabase } from '../../../config/supabase';
import { MIN_QUESTIONS } from '../../../config/constants';

export const useTriageSession = () => {
  const router = useRouter();
  const [questionCount, setQuestionCount] = useState(0);
  const [canFinish, setCanFinish] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const {
    addMessage,
    setAnalyzing,
    setResult,
    setSessionProgress,
    resetSession,
    setSessionId,
  } = useTriageStore();

  const { user, patientProfile } = useAuthStore();

  const generateId = () => Math.random().toString(36).substring(7);

  const triggerRiskHaptic = (risk) => {
    if (risk === 'HIGH') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setTimeout(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error), 400);
      setTimeout(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error), 800);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  /**
   * Finalize the triage session
   */
  const finalizeSession = async (result, allMessages) => {
    try {
      if (!user?.id) throw new Error('User not authenticated');
      if (!result.risk_level) throw new Error('AI failed to determine risk level');

      const savedCase = await triageService.createTriageSession(user.id, {
        messages: allMessages,
        risk_level: result.risk_level || 'LOW',
        ai_summary: result.ai_summary || result.summary || '',
        ai_recommendation: result.ai_recommendation || result.recommendation || '',
        ai_explanation: result.ai_explanation || result.explanation || '',
        ai_confidence: result.ai_confidence || 0.8,
        detected_symptoms: result.detected_symptoms || [],
        status: 'completed',
        sent_to_doctor: false,
      });

      if (!savedCase?.id) throw new Error('Failed to save triage session');

      // AMBULANCE ALERT LOGIC
      if (result.risk_level === 'HIGH') {
        try {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status === 'granted') {
            const location = await Location.getCurrentPositionAsync({});
            const { data: onlineAmbulances } = await supabase
              .from('ambulance_profiles')
              .select('id')
              .eq('is_online', true);
            
            if (onlineAmbulances && onlineAmbulances.length > 0) {
              const alerts = onlineAmbulances.map(amb => ({
                triage_case_id: savedCase.id,
                ambulance_id: amb.id,
                patient_id: patientProfile.id,
                patient_lat: location.coords.latitude,
                patient_lng: location.coords.longitude,
                status: 'pending',
              }));
              await supabase.from('ambulance_cases').insert(alerts);
            }
          }
        } catch (err) {
          console.error('Ambulance alert failed:', err);
        }
      }

      setResult({ ...result, id: savedCase.id });
      setSessionId(savedCase.id);
      setSessionProgress(100);
      setIsComplete(true);
      triggerRiskHaptic(result.risk_level);

      router.replace(`/(patient)/triage/result?id=${savedCase.id}`);
    } catch (e) {
      console.error('[Session] finalizeSession error:', e);
      setAnalyzing(false);
      addMessage({
        id: generateId() + '_err',
        role: 'assistant',
        content: `Something went wrong: ${e.message}. Please try again.`,
        type: 'text',
        timestamp: new Date().toISOString(),
      });
    }
  };

  const startSession = async ({ initialInput, inputType, imageBase64, language: lang = 'en' }) => {
    resetSession();
    setQuestionCount(0);
    setCanFinish(false);
    setIsComplete(false);

    const userMsg = {
      id: generateId(),
      role: 'user',
      content: initialInput || (inputType === 'image' ? 'Analyze this image.' : 'I need help with my symptoms.'),
      type: inputType || 'text',
      timestamp: new Date().toISOString(),
      imageUrl: imageBase64 || null,
    };

    addMessage(userMsg);
    const allMessages = [userMsg];
    setAnalyzing(true);
    setSessionProgress(10);

    try {
      const response = await aiService.analyzeSymptoms({
        messages: allMessages,
        imageBase64: imageBase64 || null,
        language: lang,
        patientProfile,
      });

      setAnalyzing(false);
      if (!response) return;

      handleAIResponse(response, allMessages);
    } catch (e) {
      setAnalyzing(false);
      console.error('[Session] startSession error:', e);
    }
  };

  const handleAIResponse = (response, allMessages) => {
    if (response.type === 'question') {
      const content = response.content || response.text || response.message;
      const newCount = questionCount + 1;
      setQuestionCount(newCount);

      if (newCount >= MIN_QUESTIONS) {
        setCanFinish(true);
      }

      addMessage({
        id: generateId() + '_ai',
        role: 'assistant',
        content: content,
        type: 'text',
        timestamp: new Date().toISOString(),
        quickReplies: response.quickReplies || [],
      });
      setSessionProgress(Math.min(20 + newCount * 10, 95));
    } else if (response.type === 'result') {
      finalizeSession(response, allMessages);
    }
  };

  const sendMessage = async (content, type = 'text', lang = 'en', imageBase64 = null, forceFinal = false) => {
    if (!content && !imageBase64) return;
    if (isComplete) return;

    const userMsg = {
      id: generateId(),
      role: 'user',
      content: content || '',
      type,
      timestamp: new Date().toISOString(),
      imageUrl: imageBase64 || null,
    };

    addMessage(userMsg);
    const allMessages = useTriageStore.getState().messages;

    setAnalyzing(true);
    try {
      const response = await aiService.analyzeSymptoms({
        messages: allMessages,
        imageBase64: imageBase64 || null,
        language: lang,
        patientProfile,
        forceFinal, // Pass forceFinal flag
      });

      setAnalyzing(false);
      if (!response) return;

      handleAIResponse(response, allMessages);
    } catch (e) {
      setAnalyzing(false);
      console.error('[Session] sendMessage error:', e);
    }
  };

  const handleUserFinish = async (lang = 'en') => {
    const msg = lang === 'hi' 
      ? 'कृपया अब अंतिम मूल्यांकन दें।' 
      : 'Please give me the final triage assessment now.';
    await sendMessage(msg, 'text', lang, null, true);
  };

  return { 
    startSession, 
    sendMessage, 
    handleUserFinish, 
    questionCount, 
    canFinish, 
    isComplete 
  };
};
