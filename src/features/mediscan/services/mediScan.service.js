import { supabase } from '../../../config/supabase'

export const mediScanService = {
  /**
   * Analyzes a medicine image using the Supabase Edge Function
   * @param {string} imageBase64 - Base64 encoded image string (raw base64, no data prefix)
   * @param {string} language - 'en' | 'hi'
   */
  async analyzeMedicine(imageBase64, language = 'en') {
    try {
      const { data, error } = await supabase.functions.invoke('analyze-medicine', {
        body: {
          imageBase64,
          language
        }
      });

      if (error) {
        // Extract real error message from FunctionsHttpError
        let errorMessage = error.message;
        try {
          const errorContext = await error.context?.json();
          if (errorContext?.error) errorMessage = errorContext.error;
          if (errorContext?.message) errorMessage = errorContext.message;
        } catch (_) {}
        console.error('[MediScanService] Real error:', errorMessage);
        throw new Error(errorMessage);
      }

      // Handle Gemini returning an error for unidentifiable images
      if (data?.error) {
        throw new Error(data.error);
      }

      return data;
    } catch (err) {
      console.error('[MediScanService] Catch Error:', err);
      throw err;
    }
  }
}
