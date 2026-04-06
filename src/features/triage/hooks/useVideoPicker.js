import { useState, useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';
import { useLanguage } from '../../../hooks/useLanguage';

/**
 * useVideoPicker Hook
 * Manages video recording and selection for triage.
 */
export default function useVideoPicker() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);

  const pickVideo = useCallback(async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t('permission_required'), t('photo_permission'));
        return null;
      }

      setLoading(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['videos'],
        allowsEditing: true,
        quality: 0.7,
        videoMaxDuration: 60,
      });

      if (!result.canceled) {
        return {
          uri: result.assets[0].uri,
          duration: result.assets[0].duration,
        };
      }
      return null;
    } catch (e) {
      console.error('Video picking error:', e);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const recordVideo = useCallback(async () => {
    try {
      const { status: camStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: micStatus } = await ImagePicker.requestMicrophonePermissionsAsync();
      
      if (camStatus !== 'granted' || micStatus !== 'granted') {
        Alert.alert(t('permission_required'), t('photo_permission'));
        return null;
      }

      setLoading(true);
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['videos'],
        allowsEditing: true,
        quality: 0.7,
        videoMaxDuration: 60,
      });

      if (!result.canceled) {
        return {
          uri: result.assets[0].uri,
          duration: result.assets[0].duration,
        };
      }
      return null;
    } catch (e) {
      console.error('Video recording error:', e);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, pickVideo, recordVideo };
}
