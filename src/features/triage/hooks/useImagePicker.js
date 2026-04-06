import { useState, useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { Alert } from 'react-native';
import { useLanguage } from '../../../hooks/useLanguage';

/**
 * useImagePicker Hook
 * Simplifies photo selection and compression for triage.
 */
export const useImagePicker = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);

  const compressImage = async (uri) => {
    try {
      const manipResult = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 1200 } }], // Resize to standard width
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG, base64: true }
      );
      return {
        uri: manipResult.uri,
        base64: manipResult.base64,
      };
    } catch (e) {
      console.error('Image compression error:', e);
      return null;
    }
  };

  const pickImage = useCallback(async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t('permission_required'), t('photo_permission'));
        return null;
      }

      setLoading(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled) {
        return await compressImage(result.assets[0].uri);
      }
      return null;
    } catch (e) {
      console.error('Pick image error:', e);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const takePhoto = useCallback(async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t('permission_required'), t('camera_permission'));
        return null;
      }

      setLoading(true);
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled) {
        return await compressImage(result.assets[0].uri);
      }
      return null;
    } catch (e) {
      console.error('Take photo error:', e);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, pickImage, takePhoto };
};
