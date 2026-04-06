import { supabase } from '../../../config/supabase'

export const mediScanService = {
  /**
   * Analyzes a medicine image using the Supabase Edge Function
   * @param {string} imageBase64 - Base64 encoded image string (including data prefix)
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
        console.error('[MediScanService] Edge Function Error:', error);
        throw new Error(error.message || 'Failed to analyze medicine');
      }

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
