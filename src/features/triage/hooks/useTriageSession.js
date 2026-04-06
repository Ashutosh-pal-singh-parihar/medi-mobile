import { useRouter } from 'expo-router';
import { useTriageStore } from '../../../store/triage.store';
import useAuthStore from '../../../store/auth.store';
import { aiService } from '../services/ai.service';
import { triageService } from '../services/triage.service';
import * as Haptics from 'expo-haptics';

export const useTriageSession = () => {
  const router = useRouter();
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
   * Finalize the triage session:
   * 1. Validates the result data
   * 2. Saves to Supabase
   * 3. Navigates to the result page
   */
  const finalizeSession = async (result, allMessages) => {
    try {
      // ✅ Safety Sanitization: Throw if critical data is missing
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
        status: 'pending',
      });

      if (!savedCase?.id) throw new Error('Failed to save triage session');

      setResult({ ...result, id: savedCase.id });
      setSessionId(savedCase.id);
      setSessionProgress(100);
      triggerRiskHaptic(result.risk_level);

      router.replace(`/(patient)/triage/result?id=${savedCase.id}`);
    } catch (e) {
      console.error('[Session] finalizeSession error:', e);
      setAnalyzing(false);
      
      // Notify user of error instead of crashing
      addMessage({
        id: generateId() + '_err',
        role: 'assistant',
        content: `Something went wrong while saving your report: ${e.message}. Please try one more time.`,
        type: 'text',
        timestamp: new Date().toISOString(),
      });
    }
  };

  /**
   * Start Session: Called once on screen mount.
   */
  const startSession = async ({ initialInput, inputType, imageBase64, language: lang = 'en' }) => {
    resetSession();

    const userMsg = {
      id: generateId(),
      role: 'user',
      content: initialInput || (inputType === 'image' ? 'Analyze this image.' : 'I need help with my symptoms.'),
      type: inputType || 'text',
      timestamp: new Date().toISOString(),
      imageUrl: imageBase64 || null,
    };

    addMessage(userMsg);

    const allMessages = useTriageStore.getState().messages;
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

      if (response.type === 'question') {
        const content = response.content || response.text || response.message;
        if (!content) throw new Error('Missing content in AI question');
        
        addMessage({
          id: generateId() + '_ai',
          role: 'assistant',
          content: content,
          type: 'text',
          timestamp: new Date().toISOString(),
          quickReplies: response.quickReplies || [],
        });
        setSessionProgress(20);
      } else if (response.type === 'result') {
        // ✅ Early Exit Protection: Validate result before finalizing
        const hasData = response.risk_level && (response.ai_summary || response.summary);
        if (hasData) {
          await finalizeSession(response, allMessages);
        } else {
          throw new Error('AI returned an incomplete final evaluation');
        }
      }

    } catch (e) {
      setAnalyzing(false);
      console.error('[Session] startSession error:', e);
      addMessage({
        id: generateId() + '_err',
        role: 'assistant',
        content: "I'm having trouble understanding. Could you please describe your symptoms again?",
        type: 'text',
        timestamp: new Date().toISOString(),
      });
    }
  };

  /**
   * Send Message: Handles user text, voice, or image input.
   */
  const sendMessage = async (content, type = 'text', lang = 'en', imageBase64 = null) => {
    if (!content && !imageBase64) return;

    const userMsg = {
      id: generateId(),
      role: 'user',
      content: content || '',
      type,
      timestamp: new Date().toISOString(),
    };

    addMessage(userMsg);

    const allMessages = useTriageStore.getState().messages;
    const userCount = allMessages.filter((m) => m.role === 'user').length;

    setAnalyzing(true);
    setSessionProgress(Math.min((allMessages.length / 8) * 100, 95));

    try {
      const response = await aiService.analyzeSymptoms({
        messages: allMessages,
        imageBase64: imageBase64 || null,
        language: lang,
        patientProfile,
      });

      setAnalyzing(false);
      if (!response) return;

      if (response.type === 'question') {
        const aiContent = response.content || response.text || response.message;
        if (!aiContent) throw new Error('Missing content in AI question');

        addMessage({
          id: generateId() + '_ai',
          role: 'assistant',
          content: aiContent,
          type: 'text',
          timestamp: new Date().toISOString(),
          quickReplies: response.quickReplies || [],
        });
      } else if (response.type === 'result') {
        // ✅ Early Exit Protection: Validate result before finalizing
        const hasData = response.risk_level && (response.ai_summary || response.summary);
        if (hasData) {
          await finalizeSession(response, allMessages);
        } else {
          throw new Error('AI returned an incomplete final evaluation');
        }
      }

    } catch (e) {
      setAnalyzing(false);
      console.error('[Session] sendMessage error:', e);
      addMessage({
        id: generateId() + '_err',
        role: 'assistant',
        content: "I'm sorry, I couldn't process that. Could you try rephrasing your message?",
        type: 'text',
        timestamp: new Date().toISOString(),
        isError: true,
      });
    }
  };

  const forceFinish = (lang = 'en') => {
    const msg =
      lang === 'hi'
        ? 'मैंने अपने सभी लक्षण बता दिए हैं। कृपया अब अंतिम मूल्यांकन दें।'
        : 'I have described all my symptoms. Please give me the final triage assessment now.';
    sendMessage(msg, 'text', lang);
  };

  return { startSession, sendMessage, forceFinish };
};
