import { supabase } from '../../../config/supabase'

export const aiService = {
  async analyzeSymptoms({ messages = [], imageBase64, language = 'en', patientProfile }) {
    try {
      console.log('[AI Service] Calling analyze-symptoms (Attempting v12 Logic)...')
      
      const { data, error } = await supabase.functions.invoke('analyze-symptoms', {
        body: {
          // Send last 10 messages to keep context window manageable
          messages: (messages || []).slice(-10),
          imageBase64: imageBase64 || null,
          language: language || 'en',
          patientContext: {
            age: patientProfile?.age || null,
            gender: patientProfile?.gender || null,
            knownConditions: patientProfile?.known_conditions || [],
            allergies: patientProfile?.allergies || '',
          },
        },
      })

      // If Supabase Gateway fails, handle it gracefully
      if (error) {
        console.error('[AI Service] Gateway Error:', error)
          return {
            type: 'question',
            content: language === 'hi'
              ? 'कनेक्शन में समस्या है। कृपया पुनः प्रयास करें।'
              : 'Our AI engine is currently busy. Please try again in a moment.',
            quickReplies: language === 'hi' ? ['पुनः प्रयास'] : ['Retry'],
            isError: true,
          }
      }

      // LOG THE ACTUAL CONTENT FOR DEBUGGING
      console.log('[AI Service] AI Provided Content:', data?.content?.substring(0, 50) + '...')
      
      return data;

    } catch (e) {
      console.error('[AI Service] Runtime Error:', e)
      return {
        type: 'question',
        content: "I'm having trouble connecting right now. Please try again soon.",
        quickReplies: ['Retry'],
        isError: true,
      }
    }
  },
}
