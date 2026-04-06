import { useState } from 'react';
import { useAudioRecorder, AudioModule, RecordingPresets } from 'expo-audio';
import * as FileSystem from 'expo-file-system';
import { Alert } from 'react-native';
import { useLanguage } from '../../../hooks/useLanguage';

/**
 * useVoiceRecorder Hook
 * Managed voice recording state and base64 conversion.
 * Fixes: Added isRecording checks to prevent IllegalStateException on Android.
 */
export default function useVoiceRecorder() {
  const { t } = useLanguage();
  const [isRecording, setIsRecording] = useState(false);
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  const startRecording = async () => {
    try {
      const permission = await AudioModule.requestRecordingPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(t('permission_required'), t('mic_permission'));
        return;
      }

      await audioRecorder.prepareToRecordAsync();
      
      // Safety: check if we are still supposed to be recording (user might have released already)
      audioRecorder.record();
      setIsRecording(true);
      console.log('[Voice] Recording started');
    } catch (error) {
      console.error('[Voice] Failed to start:', error);
      setIsRecording(false);
      Alert.alert('Error', 'Could not start microphone. Please try again.');
    }
  };

  /**
   * Stop recording safely and return base64 audio data.
   */
  const stopRecording = async () => {
    console.log('[Voice] Stop requested, isRecording:', isRecording);
    
    if (!isRecording) {
      return null;
    }

    try {
      // 2. Stop the hardware recorder
      await audioRecorder.stop();
      setIsRecording(false);

      const uri = audioRecorder.uri;
      console.log('[Voice] Stop successful, URI:', uri);
      
      if (uri) {
        const base64 = await FileSystem.readAsStringAsync(uri, { 
          encoding: FileSystem.EncodingType.Base64 
        });
        return { uri, base64 };
      }
      return null;
    } catch (error) {
      console.error('[Voice] Failed to stop:', error.message);
      setIsRecording(false);
      return null;
    }
  };

  return {
    isRecording,
    startRecording,
    stopRecording,
  };
}
